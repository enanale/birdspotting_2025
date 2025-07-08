// src/services/eBirdService.ts

const API_KEY = import.meta.env.VITE_EBIRD_API_KEY;
const BASE_URL = 'https://api.ebird.org/v2';

export interface BirdSighting {
  speciesCode: string;
  comName: string;
  sciName: string;
  locId: string;
  locName: string;
  obsDt: string;
  howMany: number;
  lat: number;
  lng: number;
  obsValid: boolean;
  obsReviewed: boolean;
  locationPrivate: boolean;
  subId: string;
  checklistId: string;
}

export const getNearbyNotableSightings = async (lat: number, lng: number): Promise<BirdSighting[]> => {
  if (!API_KEY) {
    throw new Error('eBird API key not found. Please add VITE_EBIRD_API_KEY to your .env file.');
  }

  const headers = {
    'X-eBirdApiToken': API_KEY,
  };

  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    dist: '10', // Search radius in kilometers (max 50)
    back: '7', // Search within the last 7 days
    detail: 'full',
  });

  const url = `${BASE_URL}/data/obs/geo/recent/notable?${params.toString()}`;

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`eBird API request failed with status ${response.status}: ${errorText}`);
    }

    const data: BirdSighting[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching from eBird API:', error);
    throw error;
  }
};
