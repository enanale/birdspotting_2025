
import { useState, useEffect } from 'react';
import { getCityFromCoords } from '../services/locationService';

export interface Location {
  latitude: number;
  longitude: number;
}

interface GeolocationState {
  loading: boolean;
  error: GeolocationPositionError | Error | null;
  data: Location | null;
  locationName: string | null;
}

const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    loading: true,
    error: null,
    data: null,
    locationName: null,
  });

  useEffect(() => {
    const setLocationData = async (latitude: number, longitude: number, error?: GeolocationPositionError | Error) => {
      const locationName = await getCityFromCoords(latitude, longitude);
      setState({
        loading: false,
        error: error || null,
        data: { latitude, longitude },
        locationName,
      });
    };

    const setDefaultLocation = () => {
      const lat = 37.804363; // Oakland
      const lon = -122.271113; // Oakland
      const err = new Error('Using default location. Geolocation failed or was denied.');
      setLocationData(lat, lon, err);
    };

    if (!navigator.geolocation) {
      setDefaultLocation();
      return;
    }

    const onSuccess = (position: GeolocationPosition) => {
      setLocationData(position.coords.latitude, position.coords.longitude);
    };

    const onError = (error: GeolocationPositionError) => {
      console.error(`Geolocation error: ${error.message} `);
      setDefaultLocation();
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  }, []); // Empty dependency array means this runs once on mount

  return state;
};

export default useGeolocation;
