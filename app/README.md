# Birdspotting V2

A modern, mobile-friendly web application for discovering nearby birds and logging personal sightings.

## Overview

Birdspotting helps casual nature enthusiasts and budding birdwatchers identify birds they see and keep a personal record of their discoveries. Built with React, Firebase, and integrated with eBird and Wikipedia APIs.

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite 5** - Build tool with HMR
- **Material-UI (MUI) v5** - UI components with custom theme
- **React Router v6** - Client-side routing
- **Firebase SDK** - Authentication, Firestore, Hosting

### Backend
- **Firebase Authentication** - Google Sign-in
- **Cloud Firestore** - NoSQL database
- **Cloud Functions** - Serverless API proxy and background processing
- **Firebase Hosting** - Static asset deployment

### External APIs
- **eBird API** - Recent bird sightings data
- **Wikipedia REST API** - Bird photos via Page Summary endpoint

## Project Structure

```
birdspotting_2025/
├── app/                    # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Route pages
│   │   ├── services/       # API service layers
│   │   └── theme/          # MUI theme configuration
│   └── dist/               # Production build output
├── functions/              # Cloud Functions
│   └── src/
│       ├── functions/      # Function implementations
│       ├── lib/            # Shared utilities
│       └── types/          # TypeScript type definitions
├── docs/                   # Project documentation
│   ├── PRD.md             # Product Requirements Document
│   └── TDD.md             # Technical Design Document
└── firestore.rules        # Firestore security rules
```

## Development Setup

### Prerequisites
- Node.js 20+ (use `.nvmrc` for version management)
- Firebase CLI: `npm install -g firebase-tools`
- Firebase project with enabled services (Auth, Firestore, Functions, Hosting)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd birdspotting_2025
```

2. Install dependencies:
```bash
# Frontend
cd app && npm install

# Cloud Functions
cd ../functions && npm install
```

3. Set up environment variables:
```bash
# In functions directory, create .env file
cd functions
firebase functions:config:get > .env.birdspotting-4e0da
```

4. Start development servers:
```bash
# Frontend (from app directory)
npm run dev

# Firebase emulators (from project root)
firebase emulators:start
```

## Building & Deployment

### Build

```bash
# Build frontend
cd app && npm run build

# Build functions
cd ../functions && npm run build
```

### Deploy

```bash
# Deploy everything
firebase deploy

# Deploy only functions
firebase deploy --only functions

# Deploy only hosting
firebase deploy --only hosting
```

## Features

### ✅ Implemented
- Google Sign-in authentication
- Public landing page
- Nearby bird discovery (list view with photos)
- Bird image caching with Wikipedia integration
- Background queue processing for images

### 🔲 In Progress
- My Sightings (personal log CRUD)
- Profile page with user stats
- Achievements & badges system
- Map view for bird sightings

## Documentation

- [Product Requirements Document](../docs/PRD.md) - Product vision, features, and requirements
- [Technical Design Document](../docs/TDD.md) - Architecture, data models, and implementation details

## License

Private project - All rights reserved
