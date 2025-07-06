import React, { useEffect, useState } from 'react';
import useGeolocation from '../hooks/useGeolocation';
import { getNearbyNotableSightings } from '../services/eBirdService';
import type { BirdSighting } from '../services/eBirdService';

const Discovery: React.FC = () => {
  const { data: location, loading: locationLoading, error: locationError } = useGeolocation();
  const [sightings, setSightings] = useState<BirdSighting[]>([]);
  const [loadingSightings, setLoadingSightings] = useState(false);
  const [sightingsError, setSightingsError] = useState<string | null>(null);

  useEffect(() => {
    if (location) {
      const fetchSightings = async () => {
        setLoadingSightings(true);
        setSightingsError(null);
        try {
          const data = await getNearbyNotableSightings(location.latitude, location.longitude);
          setSightings(data);
          console.log('Bird sightings:', data);
        } catch (err) {
          setSightingsError('Failed to fetch bird sightings.');
          console.error(err);
        } finally {
          setLoadingSightings(false);
        }
      };

      fetchSightings();
    }
  }, [location]);

  if (locationLoading) {
    return <div>Loading location...</div>;
  }

  if (locationError) {
    return <div>Error: {locationError.message}</div>;
  }

  return (
    <div>
      <h1>Discovery Page</h1>
      {location ? (
        <p>
          Your location: Latitude: {location.latitude}, Longitude: {location.longitude}
        </p>
      ) : (
        <p>Could not retrieve location.</p>
      )}

      {loadingSightings && <p>Loading nearby bird sightings...</p>}
      {sightingsError && <p>Error: {sightingsError}</p>}

      {sightings.length > 0 && (
        <div>
          <h2>Nearby Notable Bird Sightings</h2>
          <p>Found {sightings.length} sightings.</p>
          <ul>
            {sightings.map((sighting) => (
              <li key={sighting.subId}>{sighting.comName}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Discovery;
