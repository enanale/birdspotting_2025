import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { sightingService } from '../services/sightingService';
import type { Sighting } from '../types/sighting';

export const useUserSightings = () => {
    const { user } = useAuth();
    const [sightings, setSightings] = useState<Sighting[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSightings = useCallback(async () => {
        if (!user) {
            setSightings([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await sightingService.getUserSightings(user.uid);
            setSightings(data);
        } catch (err) {
            console.error('Error fetching user sightings:', err);
            setError('Failed to load your sightings');
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Initial fetch
    useEffect(() => {
        fetchSightings();
    }, [fetchSightings]);

    /**
     * Helper to find the most recent sighting for a specific species
     */
    const getLastSighting = useCallback((speciesCode: string): Sighting | undefined => {
        // Sightings are already sorted by date desc in the service
        return sightings.find(s => s.speciesCode === speciesCode);
    }, [sightings]);

    return {
        sightings,
        loading,
        error,
        refreshSightings: fetchSightings,
        getLastSighting
    };
};
