// src/services/locationService.ts

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
  country?: string;
}

interface NominatimResponse {
  address: NominatimAddress;
  display_name: string;
}

export const getCityFromCoords = async (lat: number, lon: number): Promise<string | null> => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API request failed with status ${response.status}`);
    }

    const data: NominatimResponse = await response.json();
    
    const address = data.address;
    // Prioritize city, but fall back to town or village if city is not available
    const city = address.city || address.town || address.village;
    
    if (city && address.state) {
      return `${city}, ${address.state}`;
    }
    
    // As a final fallback, use the full display name from the API
    return city || data.display_name || null;

  } catch (error) {
    console.error('Error fetching from Nominatim API:', error);
    return null; // Return null if reverse geocoding fails
  }
};
