import { useState, useEffect } from 'react';
import { getNearbySightings } from '../services/eBirdService';
import type { BirdSighting } from '../services/eBirdService';
import type { Location } from '../hooks/useGeolocation';

interface GroupedByBird {
    [comName: string]: BirdSighting[];
}

export const useBirdSightings = (location: Location | null) => {
    const [sightings, setSightings] = useState<BirdSighting[]>([]);
    const [groupedByBird, setGroupedByBird] = useState<GroupedByBird>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (location) {
            const fetchSightings = async () => {
                setLoading(true);
                setError(null);
                try {
                    const data = await getNearbySightings(location.latitude, location.longitude);
                    setSightings(data);
                } catch (err) {
                    setError('Failed to fetch bird sightings.');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchSightings();
        }
    }, [location]);

    useEffect(() => {
        const newGroupedByBird = sightings.reduce<GroupedByBird>((acc, sighting) => {
            const key = sighting.comName;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(sighting);
            return acc;
        }, {});
        setGroupedByBird(newGroupedByBird);
    }, [sightings]);

    return { sightings, groupedByBird, loading, error };
};
