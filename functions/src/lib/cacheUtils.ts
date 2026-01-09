/**
 * Shared utilities for bird image cache operations.
 * Extracted to DRY up code between getBirdPhotos and processImageQueue.
 */
import admin from "./admin";
import {BirdImageCacheDoc} from "../types";

/**
 * Ensures compatibility with old cache entries that might not have all fields.
 * Normalizes Firestore document data to a complete BirdImageCacheDoc.
 *
 * @param {FirebaseFirestore.DocumentData} docData - Raw document data from Firestore
 * @param {string} speciesCode - The species code for this entry
 * @return {BirdImageCacheDoc} Normalized BirdImageCacheDoc with defaults for missing fields
 */
export function normalizeOldCacheEntry(
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
    thumbnailUrl: docData.thumbnailUrl || docData.imageUrl || null, // Fallback for legacy
    originalUrl: docData.originalUrl || docData.imageUrl || null, // Fallback for legacy
    createdAt: docData.createdAt || admin.firestore.Timestamp.now(),
    updatedAt: docData.updatedAt || admin.firestore.Timestamp.now(),
    priority: docData.priority || 1,
    errorCount: docData.errorCount || 0,
    lastError: docData.lastError || "",
  };

  return normalized;
}

/**
 * Detects if a bird species is a hybrid based on its name.
 * Hybrids are skipped for Wikipedia lookup as they rarely have dedicated pages.
 *
 * @param {string} comName - Common name of the bird
 * @param {string} sciName - Scientific name of the bird
 * @return {boolean} True if the species appears to be a hybrid
 */
export function isHybridSpecies(comName: string, sciName: string): boolean {
  const hybridPatterns = [
    /\s+x\s+/i, // "Blue-winged x Cinnamon Teal"
    /\(hybrid\)/i, // "(hybrid)" suffix
    /hybrid\s+/i, // "hybrid " prefix
  ];

  return hybridPatterns.some((pattern) =>
    pattern.test(comName) || pattern.test(sciName)
  );
}
