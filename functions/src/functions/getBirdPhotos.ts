import {onCall, HttpsError} from "firebase-functions/v2/https";
import admin, {db} from "../lib/admin";
import {CallableData, PhotoStatus, BirdImage, BirdImageCacheDoc} from "../types";

/**
 * Ensures compatibility with old cache entries that might not have all fields
 * @param {FirebaseFirestore.DocumentData} docData - Raw document data from Firestore
 * @param {string} speciesCode - The species code for this entry
 * @return {BirdImageCacheDoc} Normalized BirdImageCacheDoc with defaults for missing fields
 */
function normalizeOldCacheEntry(
  docData: FirebaseFirestore.DocumentData,
  speciesCode: string
): BirdImageCacheDoc {
  // Apply default values for any missing fields
  const normalized: BirdImageCacheDoc = {
    status: docData.status || "PENDING",
    speciesCode: docData.speciesCode || speciesCode,
    comName: docData.comName || "",
    imageUrl: docData.imageUrl || null,
    createdAt: docData.createdAt || admin.firestore.Timestamp.now(),
    updatedAt: docData.updatedAt || admin.firestore.Timestamp.now(),
    priority: docData.priority || 1,
    errorCount: docData.errorCount || 0,
    lastError: docData.lastError || "",
  };

  return normalized;
}

/**
 * Cloud function that gets bird photos from the cache or creates a pending request
 * @param request The callable request containing species codes
 * @returns Object with photo info for each requested species code
 */
export const getBirdPhotos = onCall(async (request) => {
  const {speciesCodes, commonNames = {}} = request.data as CallableData;
  if (!speciesCodes || !Array.isArray(speciesCodes) ||
      speciesCodes.length === 0) {
    throw new HttpsError(
      "invalid-argument",
      "The function must be called with a 'speciesCodes' array."
    );
  }

  const results: Record<string, BirdImage | null> = {};

  for (const speciesCode of speciesCodes) {
    // Get common name if provided, otherwise use the species code as a fallback
    const commonName = commonNames[speciesCode] || "";
    const cacheRef = db.collection("ebird_image_cache").doc(speciesCode);
    try {
      const doc = await cacheRef.get();
      if (doc.exists) {
        // Normalize data to ensure all fields exist (handles old entries)
        const data = normalizeOldCacheEntry(doc.data() as FirebaseFirestore.DocumentData, speciesCode);

        // If we have a common name from the client and the database doesn't have one yet, update it
        if (commonName && (!data.comName || data.comName === "")) {
          await cacheRef.update({
            comName: commonName,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          // Update our local copy of the data
          data.comName = commonName;
        }

        if (data.status === "COMPLETED" && data.imageUrl) {
          // Return cached image if it exists and is complete
          results[speciesCode] = {
            imageUrl: data.imageUrl,
            speciesCode: data.speciesCode,
            comName: data.comName || commonName || "",
          };
        } else if (data.status === "PENDING" || data.status === "PROCESSING") {
          // Handle already pending/processing items
          const createdAt = data.createdAt.toDate();
          const now = new Date();
          const minutesInQueue =
            (now.getTime() - createdAt.getTime()) / (1000 * 60);

          // Only reset if it's been pending too long (5+ minutes)
          if (minutesInQueue > 5) {
            await cacheRef.update({
              status: "PENDING" as PhotoStatus,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              priority: admin.firestore.FieldValue.increment(1),
              // Update common name if available
              ...(commonName ? {comName: commonName} : {}),
            });
          } else {
            // Just bump the priority for frequently requested items
            await cacheRef.update({
              priority: admin.firestore.FieldValue.increment(1),
              // Update common name if available
              ...(commonName ? {comName: commonName} : {}),
            });
          }

          // Either way, return null for client to show placeholder
          results[speciesCode] = null;
        } else {
          // Failed status or other - reset to pending
          await cacheRef.set({
            status: "PENDING" as PhotoStatus,
            speciesCode,
            comName: commonName || data.comName || "", // Use provided common name or existing one
            imageUrl: null,
            createdAt: data.createdAt ||
                       admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            priority: 1,
            errorCount: 0,
          });
          results[speciesCode] = null;
        }
      } else {
        // Create a new PENDING entry
        await cacheRef.set({
          status: "PENDING" as PhotoStatus,
          speciesCode,
          comName: "", // Will be populated during processing
          imageUrl: null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          priority: 1,
          errorCount: 0,
        });

        results[speciesCode] = null;
      }
    } catch (error) {
      console.error(`Failed to process ${speciesCode}:`, error);
      results[speciesCode] = null; // Indicate failure for this species
    }
  }

  return {photosByBird: results};
});
