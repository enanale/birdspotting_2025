import { Timestamp, GeoPoint } from 'firebase/firestore';

export interface Sighting {
    id?: string;                    // Document ID (optional as it's added after fetch)
    userId: string;                 // Reference to owning user
    speciesCode: string;            // eBird species code
    comName: string;                // Bird common name
    sciName: string;                // Bird scientific name
    obsDt: Timestamp;               // Observation time
    location: GeoPoint;             // GPS coordinates
    locName: string;                // Human-readable location name
    notes?: string;                 // Optional user notes
    photoUrl?: string;              // Optional user-uploaded photo URL
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface SightingFormData {
    speciesCode: string;
    comName: string;
    sciName: string;
    location: {
        lat: number;
        lng: number;
        name: string;
    };
    notes?: string;
    photoFile?: File;
}
