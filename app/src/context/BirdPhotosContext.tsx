import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { getBirdPhotos, type BirdImage } from '../services/photoService';

interface BirdMetadata {
    comName: string;
    sciName: string;
}

interface BirdPhotosContextType {
    photos: Record<string, BirdImage | null>;
    loadPhotosForSpecies: (speciesData: Record<string, BirdMetadata>) => void;
}

const BirdPhotosContext = createContext<BirdPhotosContextType | undefined>(undefined);

export const BirdPhotosProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [photos, setPhotos] = useState<Record<string, BirdImage | null>>({});
    const requestedBirds = useRef(new Set<string>());
    const queueTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pendingQueueRef = useRef<Set<string>>(new Set());
    const metadataRef = useRef<Record<string, BirdMetadata>>({});

    // Function to process the accumulated queue
    const processQueue = async () => {
        const speciesToFetch = Array.from(pendingQueueRef.current);
        pendingQueueRef.current.clear();
        queueTimeoutRef.current = null;

        if (speciesToFetch.length === 0) return;

        // Filter out any that might have been loaded in the meantime (double check)
        const uniqueToFetch = speciesToFetch.filter(code => photos[code] === undefined && !requestedBirds.current.has(code));

        // Mark as requested immediately
        uniqueToFetch.forEach(code => requestedBirds.current.add(code));

        if (uniqueToFetch.length === 0) return;

        // Process in chunks
        const CHUNK_SIZE = 5;
        for (let i = 0; i < uniqueToFetch.length; i += CHUNK_SIZE) {
            const chunk = uniqueToFetch.slice(i, i + CHUNK_SIZE);

            try {
                // Prepare metadata for this chunk
                const chunkCommonNames: Record<string, string> = {};
                const chunkScientificNames: Record<string, string> = {};

                chunk.forEach(code => {
                    if (metadataRef.current[code]) {
                        chunkCommonNames[code] = metadataRef.current[code].comName;
                        chunkScientificNames[code] = metadataRef.current[code].sciName;
                    }
                });

                const newPhotos = await getBirdPhotos(chunk, chunkCommonNames, chunkScientificNames);

                setPhotos(prev => ({
                    ...prev,
                    ...newPhotos
                }));

            } catch (error) {
                console.error("Error fetching photos for chunk", chunk, error);
                // On error, remove from requested so we can try again later
                chunk.forEach(code => requestedBirds.current.delete(code));
            }
        }
    };

    const loadPhotosForSpecies = (speciesData: Record<string, BirdMetadata>) => {
        let hasNewRequest = false;

        Object.entries(speciesData).forEach(([code, metadata]) => {
            // Update metadata ref even if already requested
            metadataRef.current[code] = metadata;

            // If not in photos and not already requested/pending
            if (photos[code] === undefined && !requestedBirds.current.has(code)) {
                pendingQueueRef.current.add(code);
                hasNewRequest = true;
            }
        });

        if (hasNewRequest && !queueTimeoutRef.current) {
            // Debounce requests to batch them together
            queueTimeoutRef.current = setTimeout(processQueue, 100);
        }
    };

    useEffect(() => {
        return () => {
            if (queueTimeoutRef.current) {
                clearTimeout(queueTimeoutRef.current);
            }
        };
    }, []);

    const value = {
        photos,
        loadPhotosForSpecies
    };

    return <BirdPhotosContext.Provider value={value}>{children}</BirdPhotosContext.Provider>;
};

export const useBirdPhotosContext = () => {
    const context = useContext(BirdPhotosContext);
    if (context === undefined) {
        throw new Error('useBirdPhotosContext must be used within a BirdPhotosProvider');
    }
    return context;
};
