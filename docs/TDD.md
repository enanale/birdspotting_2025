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
  - **Custom Hooks**:
    - `useBirdSightings`: Encapsulates logic for fetching and grouping sightings from the eBird API.
    - `useBirdPhotos`: Manages the image queueing and fetching process, abstracting standard React state management.
    - `useGeolocation`: Manages user location state and permissions.

### **2.2. Backend (Firebase)**

- **Authentication**: Firebase Authentication will be used, starting with Google Sign-in to provide a low-friction onboarding experience.
- **Database**: Cloud Firestore will serve as the primary NoSQL database for storing user data, sightings, and application state.
- **Hosting**: Firebase Hosting will be used to deploy and serve the static assets of the web application.
- **Analytics**: Google Analytics for Firebase will be integrated to track user engagement and application performance against the KPIs defined in the PRD.
- **Serverless Logic**: Cloud Functions for Firebase will be used for backend logic that should not run on the client, such as interacting with external APIs or performing intensive computations.
- **Machine Learning**: Google's Vertex AI will be leveraged for potential future machine learning features, such as bird identification from user-uploaded photos.

### **2.3. Development & Tooling**

- **Language**: TypeScript will be used across the entire frontend codebase for type safety and improved developer experience.
- **Node.js Version Management**: NVM (Node Version Manager) is recommended to ensure a consistent Node.js environment across the team.
- **Configuration**: Environment variables (`.env` files) will be used to manage configuration details like API keys and Firebase settings, separating them for different environments (development, production).
- **Development Server**: Vite's built-in development server with Hot Module Replacement (HMR) will be used for a fast and efficient development feedback loop.

## **3. External API Integrations**

### **3.1. eBird API Integration**

- **Purpose**: Fetch recent bird sightings data for the Discovery page.
- **Implementation**: Cloud Functions provide a secure proxy to the eBird API, keeping the API key secure.
- **Caching Strategy**: Sightings data is cached in Firestore for 30 minutes to reduce API calls.

### **3.2. Security Architecture**

- **Database Rules (`firestore.rules`)**:
  - **Authentication**: All read/write operations require a valid Firebase Auth token.
  - **Data Ownership**: Users can only write to their own data paths (e.g., `/users/{userId}`).
  - **Shared Data**: Read-only access is granted for shared resources like species lists.


### **3.2. eBird.org Image Scraping & Background Processing**

#### **3.2.1. Architecture Overview**

To maintain responsive user experience while respecting eBird.org's website usage guidelines, we implement a background processing queue architecture that scrapes bird images from eBird species pages at a controlled rate.

#### **3.2.2. Data Model**

The `ebird_image_cache` Firestore collection stores both cached images and manages the processing queue:

```typescript
interface BirdImageCacheDoc {
  speciesCode: string;      // The eBird species code (e.g., "bcnher")
  comName?: string;         // Common name of the bird (e.g., "Black-crowned Night-Heron")
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: Timestamp;     // When this entry was first created
  updatedAt: Timestamp;     // Last time this entry was modified
  priority: number;         // Higher values processed first
  imageUrl: string | null;  // URL to the 160px bird image when status=COMPLETED
  lastError?: string;       // Store error message if any
}
```

#### **3.2.3. Components**

**1. `getBirdPhotos` Cloud Function**

- Serves immediate client requests for bird images by species code
- Checks cache for existing images
- Returns cached data if available
- Creates PENDING entries for cache misses
- Implements intelligent handling for already-PENDING items:
  - Returns null (client shows placeholder)
  - Updates priority for frequently requested birds
  - Resets stale PENDING items (>5 minutes old)

**2. `processImageQueue` Scheduled Function**

- Runs every 1-2 minutes
- Processes PENDING items by priority and timestamp
- Makes rate-limited HTTP requests to eBird.org species pages (1 per second)
- Scrapes image URLs from the species pages in the format:
  `https://cdn.download.ams.birds.cornell.edu/api/v1/asset/{assetId}/160`
- Updates cache entries with image URLs or error information
- Implements exponential backoff for failed requests

**3. Client-Side Components**
- Shows loading UI for PENDING items
- Implements real-time listeners for cache updates
- Gracefully handles and displays image data as it becomes available

#### **3.2.4. Request Flow**

1. User views Discovery page with multiple bird species
2. App calls `getBirdPhotos` function for each species
3. For cached species, photos display immediately
4. For uncached species:
   - Function creates PENDING entries
   - Client shows loading placeholder
   - Background processor fetches photos at controlled rate
   - Real-time updates display photos when available

#### **3.2.5. Benefits**

- **Decoupled Architecture**: User experience is separated from API rate limits
- **Responsive UI**: Users see immediate feedback and progressive loading
- **Rate Limit Compliance**: Controlled processing prevents 429 errors
- **Self-Healing**: Stale requests are automatically reset
- **Prioritization**: Frequently requested birds are processed first
