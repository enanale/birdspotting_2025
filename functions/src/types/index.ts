export type PhotoStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

// Interface for bird image cache document
export interface BirdImageCacheDoc {
  status: PhotoStatus;
  speciesCode: string; // The eBird species code
  comName?: string; // Common name of the bird if known
  sciName?: string; // Scientific name of the bird if known
  imageUrl: string | null; // Deprecated: use thumbnailUrl
  thumbnailUrl?: string | null; // ~320px thumbnail
  originalUrl?: string | null; // High-resolution original image
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  processAfter?: FirebaseFirestore.Timestamp;
  priority: number;
  errorCount?: number;
  lastError?: string;
}

// Interface for BirdImage response
export interface BirdImage {
  speciesCode: string;
  comName: string;
  imageUrl: string | null; // Deprecated: use thumbnailUrl
  thumbnailUrl: string | null;
  originalUrl: string | null;
}

// Interface for getBirdPhotos callable function data
export interface CallableData {
  // Array of species codes to look up
  speciesCodes: string[];
  // Optional mapping of species code to common name
  // This helps with more accurate image searches
  commonNames?: Record<string, string>;
  // Mapping of species code to scientific name
  // Primary key for Wikipedia API search
  scientificNames?: Record<string, string>;
}
