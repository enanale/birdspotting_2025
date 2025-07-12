// src/pages/LandingPage.tsx
import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const LandingPage: React.FC = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography component="h1" variant="h2" gutterBottom>
            Birdspotting
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Discover the wonders of nature, one bird at a time.
          </Typography>
          <Typography variant="body1" fontStyle="italic" sx={{ my: 4 }}>
            "In every walk with nature, one receives far more than he seeks."
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={signInWithGoogle}
          >
            Log In with Google
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default LandingPage;
