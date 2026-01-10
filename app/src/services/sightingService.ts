import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    serverTimestamp,
    orderBy,
    doc,
    deleteDoc,
    GeoPoint
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { Sighting, SightingFormData } from '../types/sighting';

const SIGHTINGS_COLLECTION = 'sightings';

export const sightingService = {
    /**
     * Add a new bird sighting
     */
    addSighting: async (userId: string, data: SightingFormData): Promise<string> => {
        try {
            // Create the sighting document
            const docRef = await addDoc(collection(db, SIGHTINGS_COLLECTION), {
                userId,
                speciesCode: data.speciesCode,
                comName: data.comName,
                sciName: data.sciName,
                obsDt: serverTimestamp(),
                // Convert to Firestore GeoPoint
                location: new GeoPoint(data.location.lat, data.location.lng),
                locName: data.location.name,
                notes: data.notes || '',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            return docRef.id;
        } catch (error) {
            console.error('Error adding sighting:', error);
            throw error;
        }
    },

    /**
     * Get all sightings for a specific user
     */
    getUserSightings: async (userId: string): Promise<Sighting[]> => {
        try {
            const q = query(
                collection(db, SIGHTINGS_COLLECTION),
                where('userId', '==', userId),
                orderBy('obsDt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Sighting));
        } catch (error) {
            console.error('Error fetching sightings:', error);
            throw error;
        }
    },

    /**
     * Initial implementation does not support edit/delete (v2.1)
     */
    deleteSighting: async (sightingId: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, SIGHTINGS_COLLECTION, sightingId));
        } catch (error) {
            console.error('Error deleting sighting:', error);
            throw error;
        }
    }
};
