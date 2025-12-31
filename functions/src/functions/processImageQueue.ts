import {onSchedule} from "firebase-functions/v2/scheduler";

import admin, {db} from "../lib/admin";
import {PhotoStatus, BirdImageCacheDoc} from "../types";

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
    sciName: docData.sciName || "",
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
 * Detects if a bird species is a hybrid based on its name
 * @param {string} comName - Common name
 * @param {string} sciName - Scientific name
 * @return {boolean} True if it's a hybrid
 */
function isHybridSpecies(comName: string, sciName: string): boolean {
  const hybridPatterns = [
    /\s+x\s+/i, // "Blue-winged x Cinnamon Teal"
    /\(hybrid\)/i, // "(hybrid)" suffix
    /hybrid\s+/i, // "hybrid " prefix
  ];

  return hybridPatterns.some((pattern) =>
    pattern.test(comName) || pattern.test(sciName)
  );
}

// User-Agent for Wikipedia API following their policy:
// https://meta.wikimedia.org/wiki/User-Agent_policy
const WIKIPEDIA_USER_AGENT = "Birdspotting/1.0 (https://birdspotting-4e0da.web.app; contact@birdspotting.app)";

/**
 * Fetches bird images from Wikipedia using the scientific name or common name fallback
 * @param {string} sciName - Scientific name of the bird
 * @param {string} comName - Common name of the bird
 * @return {Promise} URLs to the images
 */
async function getBirdImageFromWikipedia(sciName: string, comName?: string): Promise<{ thumbnail: string | null, original: string | null }> {
  const tryLookup = async (name: string): Promise<{ thumbnail: string | null, original: string | null } | null> => {
    if (!name) return null;
    try {
      console.log(`Searching Wikipedia for: ${name}`);
      const title = encodeURIComponent(name.trim().replace(/ /g, "_"));
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": WIKIPEDIA_USER_AGENT,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return {
        thumbnail: data.thumbnail ? data.thumbnail.source : null,
        original: data.originalimage ? data.originalimage.source : (data.thumbnail ? data.thumbnail.source : null),
      };
    } catch (error) {
      console.error(`Error fetching from Wikipedia for ${name}:`, error);
      return null;
    }
  };

  // 1. Try Scientific Name
  let result = await tryLookup(sciName);

  // 2. Fallback to Common Name
  if ((!result || !result.thumbnail) && comName) {
    console.log(`Scientific name failed for ${sciName}, trying common name: ${comName}`);
    result = await tryLookup(comName);
  }

  return result || {thumbnail: null, original: null};
}

/**
 * Scheduled function that processes the bird image queue
 * Runs every 5 minutes and processes PENDING requests
 */
export const processImageQueue = onSchedule({
  schedule: "every 5 minutes",
  timeoutSeconds: 120,
  memory: "256MiB",
}, async () => {
  const BATCH_SIZE = 100; // Process up to 100 items per run
  const WIKIPEDIA_RATE_LIMIT_MS = 100; // 100ms between requests to be polite
  const MAX_RETRIES = 3; // Max retries for failed requests

  console.log("Starting image queue processing run");

  try {
    // Query for PENDING items, ordered by priority (desc) and updatedAt (asc)
    const pendingQuery = db
      .collection("ebird_image_cache")
      .where("status", "==", "PENDING")
      .orderBy("priority", "desc")
      .orderBy("updatedAt", "asc")
      .limit(BATCH_SIZE);

    const pendingDocs = await pendingQuery.get();

    if (pendingDocs.empty) {
      console.log("No pending image requests to process");
      return;
    }

    console.log(`Found ${pendingDocs.size} pending requests to process`);

    // Process each document sequentially with rate limiting
    for (const doc of pendingDocs.docs) {
      const speciesCode = doc.id;
      // Normalize data to ensure all fields exist (handles old entries)
      const data = normalizeOldCacheEntry(doc.data() as FirebaseFirestore.DocumentData, speciesCode);

      try {
        // Mark as processing
        await doc.ref.update({
          status: "PROCESSING" as PhotoStatus,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`Processing species: ${speciesCode}`);

        // Get metadata
        let comName = data.comName || "";
        const sciName = data.sciName || "";

        // If we don't have a common name already in database, try to extract from species code
        if (!comName || comName === "") {
          if (speciesCode.length > 3) {
            const namePart = speciesCode.replace(/[0-9]+$/, "");
            if (namePart.length >= 3) {
              comName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
            }
          }
        }

        console.log(`Processing ${speciesCode} | Name: ${comName || "???"} | Sci: ${sciName || "???"}`);

        // Check for hybrid species before calling Wikipedia
        if (isHybridSpecies(comName, sciName)) {
          console.log(`Skipping hybrid species: ${comName} (${sciName})`);
          await doc.ref.update({
            status: "FAILED" as PhotoStatus,
            comName,
            lastError: "Skipped: Hybrid species",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          continue; // Skip to next item in queue
        }

        // Try Wikipedia using scientific name with common name fallback
        const {thumbnail, original} = await getBirdImageFromWikipedia(sciName, comName);

        if (thumbnail) {
          // Update with completed status and image URLs
          await doc.ref.update({
            status: "COMPLETED" as PhotoStatus,
            comName: comName || speciesCode,
            imageUrl: thumbnail, // Backward compatibility
            thumbnailUrl: thumbnail,
            originalUrl: original,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`Successfully indexed images for ${speciesCode}: Thumb=${thumbnail}, Orig=${original}`);
        } else {
          // Mark as failed
          await doc.ref.update({
            status: "FAILED" as PhotoStatus,
            comName,
            errorCount: data.errorCount ? data.errorCount + 1 : 1,
            lastError: "No image found via Wikipedia",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`No image found for ${speciesCode}`);
        }
      } catch (error: unknown) {
        console.error(`Error processing ${speciesCode}:`, error);

        // Increment error count and determine next status
        const errorCount = (data.errorCount || 0) + 1;
        const nextStatus: PhotoStatus =
          errorCount >= MAX_RETRIES ? "FAILED" : "PENDING";

        // Calculate exponential backoff if we're going to retry
        let processAfter = null;
        if (nextStatus === "PENDING") {
          // 5, 10, 20... minutes
          const backoffMinutes = Math.pow(2, errorCount - 1) * 5;
          const backoffDate = new Date();
          backoffDate.setMinutes(backoffDate.getMinutes() + backoffMinutes);
          processAfter = admin.firestore.Timestamp.fromDate(backoffDate);
        }

        // Update with error information
        await doc.ref.update({
          status: nextStatus,
          errorCount,
          lastError:
            error instanceof Error ? error.message : String(error),
          processAfter,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // Rate limiting - wait before processing next item
      await new Promise((resolve) => setTimeout(resolve, WIKIPEDIA_RATE_LIMIT_MS));
    }

    console.log("Completed processing batch");
  } catch (error: unknown) {
    console.error(
      "Error in processImageQueue:",
      error instanceof Error ? error.message : String(error)
    );
  }
});
