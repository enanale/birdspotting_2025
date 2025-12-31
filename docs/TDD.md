# **Technical Design Document: Birdspotting V2**

Version: 1.0  
Date: July 5, 2025  
Status: Initial Draft

## **1. Introduction**

This document outlines the technical architecture, tools, and standards for the Birdspotting V2 web application. It serves as a guide for the development team to ensure consistency, scalability, and maintainability.

## **2. Technology Stack**

The following technologies will be used to build the application:

### **2.1. Frontend**

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Framework**: Material-UI (MUI)
  - A custom theme will be developed, featuring gradient styles to create a modern look and feel.
  - A responsive `AppBar` will be a core navigation component.
  - We will use icons from the Material Icons library.
- **State Management**: Primarily React Hooks (`useState`, `useEffect`, `useContext`).
    - `BirdPhotosContext`: Global context provider that manages debounced, deduplicated requests for bird photos using a queue-based system.
    - `useBirdPhotosContext`: Hook to access the bird photo state and request new photos.
    - `useGeolocation`: Manages user location state and permissions.

### **2.2. Backend (Firebase)**

- **Authentication**: Firebase Authentication will be used, starting with Google Sign-in to provide a low-friction onboarding experience.
- **Database**: Cloud Firestore will serve as the primary NoSQL database for storing user data, sightings, and application state.
- **Hosting**: Firebase Hosting will be used to deploy and serve the static assets of the web application.
- **Analytics**: Google Analytics for Firebase will be integrated to track user engagement and application performance against the KPIs defined in the PRD.
- **Serverless Logic**: Cloud Functions for Firebase will be used for backend logic that should not run on the client, such as interacting with external APIs or performing intensive computations.
- **Machine Learning**: Google's Vertex AI will be leveraged for potential future machine learning features, such as bird identification from user-uploaded photos.

- **Language**: TypeScript will be used across the entire codebase for type safety and improved developer experience.
- **Node.js Version Management**: NVM (Node Version Manager) is recommended to ensure a consistent Node.js environment across the team.
- **Configuration**: Environment variables (`.env` files) will be used to manage configuration details like API keys and Firebase settings.
- **Development Server**: Vite's built-in development server with Hot Module Replacement (HMR) will be used for a fast feedback loop.

## **3. External API Integrations**

### **3.1. eBird API Integration**

- **Purpose**: Fetch recent bird sightings data for the Discovery page.
- **Implementation**: Cloud Functions provide a secure proxy to the eBird API, keeping the API key secure.
- **Caching Strategy**: Sightings data is cached in Firestore for 30 minutes to reduce API calls.

### **3.2. Security Architecture**

- **Database Rules (`firestore.rules`)**:
  - **Authentication**: All read/write operations require a valid Firebase Auth token.
  - **Data Ownership**: Users can only write to their own data paths (e.g., `/users/{userId}`).
  - **Shared Data**: Read access is granted for the bird image cache so clients can display photos.

### **3.3. Wikipedia Image Integration & Background Processing**

#### **3.3.1. Architecture Overview**

To provide accurate and free bird thumbnails, we use the Wikipedia REST API Page Summary endpoint. Lookups are performed primarily using Scientific Names to ensure high precision, with a fallback to Common Names if the scientific name lookup fails. A background queue system handles cases where images are not yet cached.

#### **3.3.2. Data Model**

The `ebird_image_cache` Firestore collection stores cached images and manages the processing queue:

```typescript
interface BirdImageCacheDoc {
  speciesCode: string;      // The eBird species code (e.g., "bcnher")
  comName: string;         // Common name of the bird
  sciName: string;         // Scientific name of the bird (e.g., "Nycticorax nycticorax")
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: Timestamp;     // When this entry was first created
  updatedAt: Timestamp;     // Last time this entry was modified
  priority: number;         // Higher values processed first
  imageUrl: string | null;  // URL to the Wikipedia original/thumbnail image
  lastError?: string;       // Store error message if any
  errorCount: number;       // Number of failed attempts
}
```

#### **3.3.3. Components**

**1. `BirdPhotosContext` (Frontend)**

- Centralizes photo state and request logic.
- Implements a global request cache to prevent redundant calls across sessions.
- Debounces multiple species requests into single batched API calls.
- Provides scientific and common names metadata to the backend.

**2. `getBirdPhotos` Cloud Function**

- Serves client requests for bird images by species code.
- Checks Firestore cache for existing images.
- Updates missing metadata (scientific/common names) in existing cache entries.
- Creates PENDING entries for cache misses.
- Returns cached data immediately for completed entries.

**3. `processImageQueue` Scheduled Function**

- Runs every 5 minutes.
- Processes PENDING items by priority and timestamp.
- Calls the Wikipedia Page Summary API using scientific names, falling back to common names if necessary.
- Implements a polite 100ms delay between API requests.
- Updates cache entries with high-resolution image URLs or thumbnails.

#### **3.3.4. Request Flow**

1. User views Discovery page; `groupedByBird` data is available.
2. `Discovery.tsx` triggers `loadPhotosForSpecies` in the context with metadata.
3. Context batches requests and calls `getBirdPhotos` Cloud Function.
4. For cached species, photos display immediately.
5. For uncached species:
   - Function creates PENDING entries.
   - Background processor (`processImageQueue`) fetches photo from Wikipedia.
   - Client's re-renders display photos when available.
