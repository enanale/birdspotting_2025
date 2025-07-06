import { useState, useEffect } from 'react';

interface GeolocationState {
  loading: boolean;
  error: GeolocationPositionError | Error | null;
  data: {
    latitude: number;
    longitude: number;
  } | null;
}

const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    const setDefaultLocation = () => {
      setState({
        loading: false,
        error: new Error('Using default location. Geolocation failed or was denied.'),
        data: {
          latitude: 37.7749, // San Francisco
          longitude: -122.4194, // San Francisco
        },
      });
    };

    if (!navigator.geolocation) {
      setDefaultLocation();
      return;
    }

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        loading: false,
        error: null,
        data: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      });
    };

    const onError = (error: GeolocationPositionError) => {
      console.error(`Geolocation error: ${error.message}`);
      setDefaultLocation();
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  }, []); // Empty dependency array means this runs once on mount

  return state;
};

export default useGeolocation;
