// src/services/photoService.ts
import { getFunctions, httpsCallable } from 'firebase/functions';

export interface BirdImage {
  imageUrl: string;     // URL to the 160w image from eBird
  speciesCode: string;  // eBird species code
  comName: string;      // Common name of the bird
}

export interface PhotosByBird {
  [key: string]: BirdImage | null;
}

/**
 * Fetches bird photos for a list of bird species by calling the 'getBirdPhotos' Cloud Function.
 * This function leverages server-side caching, scraping of eBird.org, and a queue-based 
 * architecture to handle rate limits.
 * @param speciesCodes An array of eBird species codes.
 * @returns A promise that resolves to an object mapping each species code to its image data.
 */
export const getBirdPhotos = async (speciesCodes: string[]): Promise<PhotosByBird> => {
  if (speciesCodes.length === 0) {
    return {};
  }

  const functions = getFunctions();
  const getBirdPhotosFunction = httpsCallable(functions, 'getBirdPhotos');

  try {
    const result = await getBirdPhotosFunction({ speciesCodes });
    const data = result.data as { photosByBird: PhotosByBird };
    return data.photosByBird || {};
  } catch (error) {
    console.error('Error calling getBirdPhotos function:', error);
    return {}; // Return an empty object on error to prevent UI breakage
  }
};

/**
 * Generates a URL to the eBird species page for a given species code.
 * @param speciesCode The eBird species code.
 * @returns The URL to the eBird species page.
 */
export const getEBirdSpeciesPageUrl = (speciesCode: string): string => {
  return `https://ebird.org/species/${speciesCode}`;
};
