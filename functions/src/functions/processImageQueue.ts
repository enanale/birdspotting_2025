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
    imageUrl: docData.imageUrl || null,
    createdAt: docData.createdAt || admin.firestore.Timestamp.now(),
    updatedAt: docData.updatedAt || admin.firestore.Timestamp.now(),
    priority: docData.priority || 1,
    errorCount: docData.errorCount || 0,
    lastError: docData.lastError || "",
  };

  return normalized;
}

// Configuration options
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || "YOUR_UNSPLASH_ACCESS_KEY";

// Rate limiting configuration
const UNSPLASH_RATE_LIMIT = 50; // 50 requests per hour (Unsplash demo API limit)
const RATE_LIMIT_PERIOD_HOURS = 1;
const RATE_LIMIT_COLLECTION = "api_rate_limits";
const UNSPLASH_RATE_LIMIT_DOC = "unsplash_api";

// Set to false to use the real Unsplash API in production
const DEVELOPMENT_MODE = false;

// App logo URL to use in development mode or when rate limit is exceeded
const APP_LOGO_URL = "https://birdspotting.app/birdspotting_logo_256.png";

/**
 * Check if we've hit the Unsplash API rate limit
 * @return {Promise<boolean>} True if rate limit has been hit, false otherwise
 */
async function isRateLimitExceeded(): Promise<boolean> {
  // Skip check in development mode
  if (DEVELOPMENT_MODE) {
    return false;
  }

  try {
    const rateLimitRef = db.collection(RATE_LIMIT_COLLECTION).doc(UNSPLASH_RATE_LIMIT_DOC);
    const rateLimitDoc = await rateLimitRef.get();

    if (!rateLimitDoc.exists) {
      // Initialize rate limit tracking if it doesn't exist
      await rateLimitRef.set({
        requestCount: 0,
        periodStart: admin.firestore.Timestamp.now(),
        lastRequest: admin.firestore.Timestamp.now(),
      });
      return false;
    }

    const data = rateLimitDoc.data();
    const now = admin.firestore.Timestamp.now();
    const periodStart = data?.periodStart?.toDate() || new Date(0);
    const hoursSincePeriodStart = (now.toDate().getTime() - periodStart.getTime()) / (1000 * 60 * 60);

    // Reset counter if period has elapsed
    if (hoursSincePeriodStart >= RATE_LIMIT_PERIOD_HOURS) {
      await rateLimitRef.set({
        requestCount: 0,
        periodStart: now,
        lastRequest: now,
      });
      return false;
    }

    // Check if we've hit the limit
    const requestCount = data?.requestCount || 0;
    return requestCount >= UNSPLASH_RATE_LIMIT;
  } catch (error) {
    console.error("Error checking rate limit:", error);
    // Fail safe: if we can't check, assume we're at the limit
    return true;
  }
}

/**
 * Increment the API request counter
 */
async function incrementRequestCount(): Promise<void> {
  if (DEVELOPMENT_MODE) {
    return;
  }

  try {
    const rateLimitRef = db.collection(RATE_LIMIT_COLLECTION).doc(UNSPLASH_RATE_LIMIT_DOC);
    await rateLimitRef.update({
      requestCount: admin.firestore.FieldValue.increment(1),
      lastRequest: admin.firestore.Timestamp.now(),
    });
  } catch (error) {
    console.error("Error incrementing request count:", error);
  }
}

/**
 * Fetches a bird image based on species code or common name
 * Using the Unsplash API for high-quality, legally usable images
 * @param {string} speciesCode - The eBird species code to search for
 * @param {string} comName - Common name of the bird species
 * @return {Promise<string|null>} URL to the image or null if none found
 */
async function getBirdImageFromUnsplash(speciesCode: string, comName: string): Promise<string | null> {
  // In development mode, always return the app logo instead of hitting the API
  if (DEVELOPMENT_MODE) {
    console.log(`[DEV MODE] Using app logo instead of Unsplash API for ${speciesCode}`);
    return APP_LOGO_URL;
  }

  // Check if we've hit the API rate limit
  const rateLimitExceeded = await isRateLimitExceeded();
  if (rateLimitExceeded) {
    console.log(`[RATE LIMIT] Unsplash API rate limit exceeded, using app logo for ${speciesCode}`);
    return APP_LOGO_URL;
  }

  // Production mode: Actually hit the Unsplash API
  try {
    console.log(`Searching Unsplash API for bird: ${comName || speciesCode}`);

    // Use common name for better search results, but fall back to species code if needed
    const searchTerm = comName ?
      `${comName} bird` : // Add "bird" to improve relevance
      `bird ${speciesCode}`;

    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=1`;

    const response = await fetch(url, {
      headers: {
        "Authorization": `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        "Accept-Version": "v1",
      },
    });

    // Increment the API request counter
    await incrementRequestCount();

    if (!response.ok) {
      console.error(`Unsplash API error: ${response.status} ${response.statusText}`);

      // Check for rate limit response (429 Too Many Requests)
      if (response.status === 429) {
        console.warn("Unsplash rate limit hit during API call");
        return APP_LOGO_URL;
      }
      return null;
    }

    const data = await response.json();

    // Check if we got any results
    if (data.results && data.results.length > 0) {
      // Return the regular sized image URL (typically around 1080px)
      return data.results[0].urls.regular;
    } else {
      console.log(`No images found on Unsplash for: ${searchTerm}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching image from Unsplash for ${speciesCode}:`, error);
    return null;
  }
}

/**
 * Scheduled function that processes the bird image queue
 * Runs every 2 minutes and processes PENDING requests at a controlled rate
 */
export const processImageQueue = onSchedule({
  schedule: "every 5 minutes",
  timeoutSeconds: 120,
  memory: "256MiB",
}, async () => {
  const BATCH_SIZE = 10; // Process up to 10 items per run
  const RATE_LIMIT_MS = 1000; // 1 second between requests
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

        // Get species info and try to find an image using Unsplash
        // First get or extract common name
        let comName = data.comName || "";

        // If we don't have a common name already in database, try to extract from species code
        if (!comName || comName === "") {
          // Extract from species code if possible (e.g., "mallar3" -> "mallard")
          if (speciesCode.length > 3) {
            const namePart = speciesCode.replace(/[0-9]+$/, "");
            if (namePart.length >= 3) {
              // Convert to title case for readability
              comName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
              console.log(`Extracted common name '${comName}' from code ${speciesCode}`);
            }
          }
        }

        console.log(`Processing species: ${speciesCode} with name: ${comName || "(unknown)"}`);

        // Try to get an image from Unsplash
        try {
          // Use the helper function to fetch from Unsplash
          const imageUrl = await getBirdImageFromUnsplash(speciesCode, comName);

          if (imageUrl) {
            console.log(`Successfully found Unsplash image for ${speciesCode}`);

            // Update with completed status and image URL
            await doc.ref.update({
              status: "COMPLETED" as PhotoStatus,
              comName: comName || speciesCode, // Use extracted or provided name
              imageUrl,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log(`Stored image for ${speciesCode}: ${imageUrl}`);
            continue; // Move to next item in the queue
          } else {
            console.log(`No Unsplash image found for ${speciesCode}`);
          }
        } catch (error) {
          console.error(`Error fetching image for ${speciesCode}:`, error);
          // We'll continue and mark as failed below
        }
        // We get here if we failed to get an image from Unsplash
        // Mark as failed
        await doc.ref.update({
          status: "FAILED" as PhotoStatus,
          comName,
          errorCount: data.errorCount ? data.errorCount + 1 : 1,
          lastError: "No image found via Unsplash",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(
          `Successfully processed ${speciesCode}`
        );
      } catch (error: unknown) {
        console.error(
          `Error processing ${speciesCode}:`,
          error
        );

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
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS));
    }

    console.log("Completed processing batch");
  } catch (error: unknown) {
    console.error(
      "Error in processImageQueue:",
      error instanceof Error ? error.message : String(error)
    );
  }
});
