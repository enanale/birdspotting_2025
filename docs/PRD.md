# **Product Requirements Document: Birdspotting V2**

Version: 1.2  
Date: July 5, 2025  
Status: In Review

## **1\. Introduction & Vision**

### **1.1. The Problem**

Casual nature enthusiasts and budding birdwatchers often lack a simple, engaging tool to identify birds they see and keep a personal record of their discoveries. Existing tools can be overly scientific, complex, or lack a modern, mobile-first user experience.

### **1.2. The Vision**

Birdspotting V2 will be a modern, **mobile-friendly web application** that provides a fun, simple, and engaging way for casual users to discover birds nearby, log their sightings, and feel a sense of accomplishment. We aim to rebuild the application from the ground up to be stable, scalable, and the go-to starting point for anyone curious about the birds in their neighborhood.

### **1.3. Target Audience**

Our primary users are "curious explorers." These are individuals who enjoy being outdoors (hiking, walking in the park, gardening) and have a budding interest in the wildlife around them. They are not expert ornithologists but are eager to learn and want a low-friction way to engage with their hobby.

## **2\. Goals & Success Metrics**

| Goal Type | Goal Statement | Key Performance Indicators (KPIs) |
| :---- | :---- | :---- |
| **Product** | Create a stable, modern, and engaging web app for birdwatching. | \- App uptime of \>99.9%\<br\>- Average API response time \<500ms\<br\>- Achieve a Lighthouse performance score of \>90 |
| **User** | Provide a fun and simple way to learn about local birds and track sightings. | \- \>75% of new users log their first sighting within 3 days\<br\>- \>40% of Monthly Active Users (MAU) are also Weekly Active Users (WAU)\<br\>- User satisfaction survey score of \>4.0/5.0 |
| **Business** | Re-launch the app to build an active user community. | \- Achieve 1,000 MAU within 6 months of launch\<br\>- Organic user growth of 10% month-over-month\<br\>- \>50% of users earn at least one achievement badge |

## **3\. User Personas**

### **3.1. Casual Carla (The Weekend Hiker)**

* **Age:** 34  
* **Occupation:** Graphic Designer  
* **Bio:** Carla loves hiking on local trails on the weekends. She often sees interesting birds and wishes she had an easy way to identify them and remember what she saw and where. She's tech-savvy but wants an app that is beautiful, simple, and "just works" on her phone.  
* **Needs:** Geolocation-based discovery, photo identification aids, a simple logbook.

### **3.2. Curious Chris (The Student)**

* **Age:** 21  
* **Occupation:** College Student  
* **Bio:** Chris is studying environmental science and is fascinated by local urban wildlife. He wants to keep a more structured log of his findings than just a notebook. The gamification aspect of earning badges for different species appeals to his competitive nature.  
* **Needs:** A structured way to log data, achievement/gamification elements, ability to add detailed notes.

## **4\. Detailed Feature Requirements**

### **Epic 1: User Onboarding & Account Management**

* **Description:** The complete user lifecycle from registration to profile management.  
* **Goal:** Allow users to create and manage a personal account to save their sightings and track progress.  
* **Priority:** P0 (Critical for MVP)

| User Story | Acceptance Criteria |
| :---- | :---- |
| **As a new user, I want to create an account with my email and a password so that I can save my sightings.** | \- Registration form requires a valid email and a password.\<br\>- Password must be at least 8 characters long.\<br\>- The system validates that the email is not already in use.\<br\>- Upon successful registration, the user is automatically logged in and redirected to the main discovery page. |
| **As a returning user, I want to log in with my email and password to access my account.** | \- Login form accepts email and password.\<br\>- Displays a clear error message for incorrect credentials.\<br\>- Provides a "Forgot Password" link (V2.1 feature). |
| **As a logged-in user, I want the app to remember me across sessions so I don't have to log in every time.** | \- A persistent session is created upon login.\<br\>- The user remains logged in when closing and reopening the browser tab. |
| **As a user, I want to view a simple profile page to see my basic stats.** | \- Profile page displays the user's username/email.\<br\>- Shows a count of total sightings logged.\<br\>- Shows a count of unique species identified.\<br\>- Includes a "Log Out" button. |

### **Epic 2: Nearby Bird Discovery**

* **Description:** The core discovery feature, allowing users to see what birds have been sighted around them.  
* **Goal:** Leverage geolocation and the eBird API to provide users with relevant, real-time bird sighting information.  
* **Priority:** P0 (Critical for MVP)

| User Story | Acceptance Criteria |
| :---- | :---- |
| **As a user, I want the app to use my current location to show me recent bird sightings nearby.** | \- On first use, the browser prompts for location permission.\<br\>- If permission is granted, the app fetches the user's coordinates.\<br\>- If denied, the app defaults to a major city (e.g., San Francisco) and allows the user to search for a location manually. |
| **As a user, I want to see nearby sightings on an interactive map.** | \- Fetched sightings from the eBird API are displayed as pins on a map (e.g., Leaflet, Mapbox).\<br\>- The map can be panned and zoomed.\<br\>- At high zoom levels, pins can be clustered to avoid clutter.\<br\>- Tapping a pin opens a small pop-up with the bird's common name and date sighted. |
| **As a user, I want to see the same nearby sightings in a list view.** | \- A toggle exists to switch between Map View and List View.\<br\>- The list view shows bird name, location/distance, and date for each sighting.\<br\>- The list is sorted chronologically by default (newest first). |
| **As a user, I want to tap a sighting to see more details about the bird.** | \- A dedicated Sighting Detail page shows:\<br\> \- Bird's common and scientific name.\<br\> \- A high-quality representative photo (from Macaulay Library API or similar).\<br\> \- The date and time of the original eBird sighting.\<br\> \- A map showing the precise location of the sighting. |

### **Epic 3: Personal Sighting Log**

* **Description:** Allows users to record their own birdwatching discoveries.  
* **Goal:** Provide a simple and intuitive way for users to create and manage their personal bird log.  
* **Priority:** P0 (Critical for MVP)

| User Story | Acceptance Criteria |
| :---- | :---- |
| **As a user, I want to log a new bird sighting.** | \- A prominent "Log Sighting" or "+" button is always accessible.\<br\>- The sighting form includes fields for Species, Date/Time, Location, Notes, and Photo.\<br\>- Date/Time defaults to the current time.\<br\>- Location defaults to the user's current GPS location. |
| **As a user, I want the app to help me find the correct bird species when logging.** | \- The "Bird Species" field is an autocomplete text input.\<br\>- As the user types, it suggests species from the eBird Taxonomy API.\<br\>- Selecting a species populates the common and scientific names. |
| **As a user, I want to optionally add a photo to my sighting.** | \- The form includes a file upload input for a photo.\<br\>- It accepts common image formats (.jpg, .png, .heic).\<br\>- Maximum file size is 10MB. |
| **As a user, I want to see a list of all my past sightings.** | \- A "My Sightings" page lists all personal logs chronologically.\<br\>- Each entry shows the bird name, date, and a thumbnail of the user's photo if provided. |
| **As a user, I want to be able to edit or delete one of my sightings.** | \- From the "My Sightings" list, each entry has options to Edit or Delete.\<br\>- Edit opens the sighting form pre-filled with the existing data.\<br\>- Delete prompts the user with a confirmation modal before permanently removing the log. |

### **Epic 4: Gamification & Achievements**

* **Description:** A system to reward users for their activity and encourage continued engagement.  
* **Goal:** Increase user retention and provide a fun progression system.  
* **Priority:** P1 (High Priority)

| User Story | Acceptance Criteria |
| :---- | :---- |
| **As a user, I want to earn badges for reaching milestones.** | \- The system checks for achievement triggers after a user logs a new sighting.\<br\>- When a badge is earned, a non-intrusive toast notification appears (e.g., "Achievement Unlocked: First Sighting\!"). |
| **As a user, I want to see all the badges I can earn and the ones I have.** | \- An "Achievements" page displays all possible badges in a grid.\<br\>- Earned badges are shown in full color with the date they were awarded.\<br\>- Unearned badges are shown greyed out with their requirements listed below. |

#### **Initial Badge Logic:**

* **First Sighting:** Log 1 bird.  
* **Novice Birder:** Log 10 different species.  
* **Dedicated Observer:** Log a bird on 7 consecutive days.  
* **Early Bird:** Log a sighting before 6:00 AM local time.  
* **Night Owl:** Log a sighting after 9:00 PM local time.  
* **Photographer:** Log your first sighting with a user-uploaded photo.  
* **Collector:** Log 5 different species from the same family (e.g., 5 types of sparrows).

## **5\. Data Models**

TBD

## **6\. Technical Stack & Architecture**

* **Frontend Framework**: React with TypeScript  
* **Build Tool**: Vite  
* **UI Framework**: Material-UI (MUI)  
  * Custom theme with gradient styles  
  * Responsive AppBar  
  * Material Icons  
* **State Management**: React Hooks (useState, useEffect, useContext) and custom hooks for modular logic.  
* **Backend Services**: Firebase  
  * Authentication (Google Sign-in)  
  * Firestore Database  
  * Hosting  
  * Analytics  
  * Cloud Functions for serverless logic  
* **External APIs:**  
  * **eBird API:** For nearby sightings data and species taxonomy. Requires an API key.  
  * **Macaulay Library API (Cornell Lab):** For high-quality bird photos.  
* **Mapping:** Leaflet.js or Mapbox GL JS

## **7\. Non-Functional Requirements**

| Category | Requirement |
| :---- | :---- |
| **Performance** | \- App initial load time must be \< 3 seconds on a standard 4G connection.\<br\>- Map panning and zooming must be smooth, with no noticeable lag.\<br\>- API calls for nearby sightings should return in \< 1 second. |
| **Accessibility** | \- The app must meet WCAG 2.1 Level AA standards.\<br\>- All interactive elements must be keyboard-navigable.\<br\>- Sufficient color contrast must be used for all text and UI elements.\<br\>- Images should have appropriate alt text. |
| **Security** | \- User passwords must be securely hashed and salted (handled by BaaS).\<br\>- All data transmission between client and server must use HTTPS.\<br\>- Database security rules must prevent users from accessing or modifying other users' data. |
| **Usability** | \- The application must be fully responsive and optimized for mobile, tablet, and desktop views.\<br\>- The user flow for logging a sighting should take no more than 30 seconds for an experienced user.\<br\>- Error messages must be clear, user-friendly, and suggest a solution. |

## **8\. Release Plan & Phasing**

* **Version 2.0 (MVP):**  
  * Epic 1: User Onboarding & Account Management (P0)  
  * Epic 2: Nearby Bird Discovery (P0)  
  * Epic 3: Personal Sighting Log (P0, without Edit/Delete)  
* **Version 2.1:**  
  * Epic 4: Gamification & Achievements (P1)  
  * Add Edit/Delete functionality to Personal Sighting Log.  
  * Add "Forgot Password" functionality.  
* **Version 2.2:**  
  * Epic 5: Settings & Information (Contact, About)  
  * Advanced search/filter options for discovery.

## **9\. Out of Scope for V2**

* Social features (following users, commenting, sharing).  
* Offline mode.  
* Push notifications.  
* Team or group-based logging.  
* Advanced data import/export.