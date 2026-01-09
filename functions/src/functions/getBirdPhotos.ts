import {onCall, HttpsError} from "firebase-functions/v2/https";
import admin, {db} from "../lib/admin";
import {normalizeOldCacheEntry} from "../lib/cacheUtils";
import {CallableData, PhotoStatus, BirdImage, BirdImageCacheDoc} from "../types";

/**
 * Cloud function that gets bird photos from the cache or creates a pending request
 * @param request The callable request containing species codes
 * @returns Object with photo info for each requested species code
 */
export const getBirdPhotos = onCall(async (request) => {
  const {speciesCodes, commonNames = {}, scientificNames = {}} = request.data as CallableData;
  if (!speciesCodes || !Array.isArray(speciesCodes) ||
    speciesCodes.length === 0) {
    throw new HttpsError(
      "invalid-argument",
      "The function must be called with a 'speciesCodes' array."
    );
  }

  const results: Record<string, BirdImage | null> = {};

  for (const speciesCode of speciesCodes) {
    // Get common name and scientific name if provided
    const commonName = commonNames[speciesCode] || "";
    const scientificName = scientificNames[speciesCode] || "";
    const cacheRef = db.collection("ebird_image_cache").doc(speciesCode);
    try {
      const doc = await cacheRef.get();
      if (doc.exists) {
        // Normalize data to ensure all fields exist (handles old entries)
        const data = normalizeOldCacheEntry(doc.data() as FirebaseFirestore.DocumentData, speciesCode);

        // Update metadata if provided and missing
        const updateData: Record<string, string | admin.firestore.FieldValue> = {};
        let needsUpdate = false;

        if (commonName && (!data.comName || data.comName === "")) {
          updateData.comName = commonName;
          data.comName = commonName;
          needsUpdate = true;
        }

        if (scientificName && (!data.sciName || data.sciName === "")) {
          updateData.sciName = scientificName;
          needsUpdate = true;
        }

        if (needsUpdate) {
          updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
          await cacheRef.update(updateData);
        }

        if (data.status === "COMPLETED" && (data.thumbnailUrl || data.imageUrl)) {
          // Return cached image if it exists and is complete
          results[speciesCode] = {
            imageUrl: data.imageUrl,
            thumbnailUrl: data.thumbnailUrl || data.imageUrl,
            originalUrl: data.originalUrl || data.imageUrl,
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
              ...(commonName ? {comName: commonName} : {}),
              ...(scientificName ? {sciName: scientificName} : {}),
            });
          } else {
            // Just bump the priority for frequently requested items
            await cacheRef.update({
              priority: admin.firestore.FieldValue.increment(1),
              ...(commonName ? {comName: commonName} : {}),
              ...(scientificName ? {sciName: scientificName} : {}),
            });
          }

          // Either way, return null for client to show placeholder
          results[speciesCode] = null;
        } else {
          // Failed status or other - reset to pending
          await cacheRef.set({
            status: "PENDING" as PhotoStatus,
            speciesCode,
            comName: commonName || data.comName || "",
            sciName: scientificName || data.sciName || "",
            imageUrl: null,
            createdAt: data.createdAt || admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            priority: 1,
            errorCount: 0,
          } as BirdImageCacheDoc);
          results[speciesCode] = null;
        }
      } else {
        // Create a new PENDING entry
        await cacheRef.set({
          status: "PENDING" as PhotoStatus,
          speciesCode,
          comName: commonName,
          sciName: scientificName,
          imageUrl: null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          priority: 1,
          errorCount: 0,
        } as BirdImageCacheDoc);

        results[speciesCode] = null;
      }
    } catch (error) {
      console.error(`Failed to process ${speciesCode}:`, error);
      results[speciesCode] = null;
    }
  }

  return {photosByBird: results};
});
