// src/components/PrivateRoutes.tsx
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import Layout from './Layout';

// Lazy load the page components
const Discovery = lazy(() => import('../pages/Discovery'));
const MySightings = lazy(() => import('../pages/MySightings'));
const Achievements = lazy(() => import('../pages/Achievements'));
const Profile = lazy(() => import('../pages/Profile'));

const PrivateRoutes: React.FC = () => {
  return (
    <Layout>
      <Suspense
        fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
            <CircularProgress />
          </Box>
        }
      >
        <Routes>
          <Route path="/" element={<Discovery />} />
          <Route path="/sightings" element={<MySightings />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
};

export default PrivateRoutes;
