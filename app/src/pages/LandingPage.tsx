// src/pages/LandingPage.tsx
import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

// Layered mountain backdrop SVG
const MountainBackdrop = () => (
  <Box
    sx={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '50%',
      pointerEvents: 'none',
      overflow: 'hidden',
    }}
  >
    {/* Far mountains - lightest */}
    <Box
      component="svg"
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
      sx={{
        position: 'absolute',
        bottom: '20%',
        width: '100%',
        height: '60%',
      }}
    >
      <path
        d="M0 200 L100 80 L200 140 L350 40 L500 100 L650 20 L800 90 L950 50 L1100 120 L1200 60 L1200 200 Z"
        fill="var(--color-forest-pale)"
        fillOpacity="0.4"
      />
    </Box>

    {/* Mid mountains */}
    <Box
      component="svg"
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
      sx={{
        position: 'absolute',
        bottom: '10%',
        width: '100%',
        height: '50%',
      }}
    >
      <path
        d="M0 200 L150 100 L300 150 L450 60 L600 130 L750 40 L900 110 L1050 70 L1200 140 L1200 200 Z"
        fill="var(--color-forest-light)"
        fillOpacity="0.5"
      />
    </Box>

    {/* Near mountains - darkest */}
    <Box
      component="svg"
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
      sx={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '40%',
      }}
    >
      <path
        d="M0 200 L100 140 L250 170 L400 120 L550 160 L700 100 L850 150 L1000 130 L1150 170 L1200 150 L1200 200 Z"
        fill="var(--color-forest-mid)"
        fillOpacity="0.6"
      />
    </Box>
  </Box>
);

// Animated bird silhouettes
const FlyingBirds = () => (
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '40%',
      pointerEvents: 'none',
      overflow: 'hidden',
    }}
  >
    {/* Bird 1 - small, fast */}
    <Box
      component="svg"
      viewBox="0 0 32 16"
      sx={{
        position: 'absolute',
        top: '20%',
        width: 24,
        height: 12,
        animation: 'fly-across 12s linear infinite',
        animationDelay: '0s',
        opacity: 0.5,
      }}
    >
      <path d="M16 8 L0 0 L4 8 L0 16 Z M16 8 L32 0 L28 8 L32 16 Z" fill="var(--color-forest-deep)" />
    </Box>

    {/* Bird 2 - medium */}
    <Box
      component="svg"
      viewBox="0 0 32 16"
      sx={{
        position: 'absolute',
        top: '30%',
        width: 32,
        height: 16,
        animation: 'fly-across 18s linear infinite',
        animationDelay: '-6s',
        opacity: 0.4,
      }}
    >
      <path d="M16 8 L0 0 L4 8 L0 16 Z M16 8 L32 0 L28 8 L32 16 Z" fill="var(--color-forest-mid)" />
    </Box>

    {/* Bird 3 - small */}
    <Box
      component="svg"
      viewBox="0 0 32 16"
      sx={{
        position: 'absolute',
        top: '15%',
        width: 20,
        height: 10,
        animation: 'fly-across 22s linear infinite',
        animationDelay: '-14s',
        opacity: 0.35,
      }}
    >
      <path d="M16 8 L0 0 L4 8 L0 16 Z M16 8 L32 0 L28 8 L32 16 Z" fill="var(--color-forest-light)" />
    </Box>
  </Box>
);

// Decorative triangles
const TriangleDecor = () => (
  <>
    {/* Top left triangle */}
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: { xs: 60, md: 100 },
        height: { xs: 60, md: 100 },
        background: 'var(--color-forest-mid)',
        clipPath: 'polygon(0 0, 100% 0, 0 100%)',
        opacity: 0.15,
      }}
    />
    {/* Bottom right triangle */}
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: { xs: 80, md: 120 },
        height: { xs: 80, md: 120 },
        background: 'var(--color-sky-blue)',
        clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
        opacity: 0.1,
      }}
    />
  </>
);

const LandingPage: React.FC = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: 'linear-gradient(180deg, var(--color-sky-pale) 0%, var(--color-parchment) 60%, var(--color-parchment) 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Decorative elements */}
      <TriangleDecor />
      <FlyingBirds />
      <MountainBackdrop />

      {/* Main content */}
      <Container
        component="main"
        maxWidth="sm"
        sx={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          px: 3,
        }}
      >
        {/* Logo/Icon */}
        <Box
          component="img"
          src="/birdspotting_logo_256.png"
          alt="Birdspotting"
          sx={{
            width: { xs: 80, md: 100 },
            height: { xs: 80, md: 100 },
            mb: 3,
            filter: 'drop-shadow(0 4px 12px rgba(27, 67, 50, 0.2))',
            animation: 'fade-in-up 0.6s ease-out forwards',
          }}
        />

        {/* Title */}
        <Typography
          component="h1"
          variant="h2"
          sx={{
            fontFamily: '"Outfit", sans-serif',
            fontWeight: 700,
            color: 'var(--color-forest-deep)',
            mb: 2,
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            letterSpacing: '-0.02em',
            animation: 'fade-in-up 0.6s ease-out 0.1s forwards',
            opacity: 0,
          }}
        >
          Birdspotting
        </Typography>

        {/* Tagline */}
        <Typography
          variant="h5"
          sx={{
            color: 'var(--color-forest-mid)',
            mb: 4,
            fontWeight: 400,
            fontSize: { xs: '1.1rem', md: '1.35rem' },
            animation: 'fade-in-up 0.6s ease-out 0.2s forwards',
            opacity: 0,
          }}
        >
          Discover the wonders of nature, one bird at a time.
        </Typography>

        {/* Quote */}
        <Typography
          variant="body1"
          sx={{
            fontStyle: 'italic',
            color: 'var(--color-stone)',
            mb: 5,
            px: { xs: 2, md: 4 },
            fontSize: { xs: '0.95rem', md: '1.05rem' },
            lineHeight: 1.8,
            animation: 'fade-in-up 0.6s ease-out 0.3s forwards',
            opacity: 0,
          }}
        >
          "In every walk with nature, one receives far more than he seeks."
        </Typography>

        {/* Login Button */}
        <Box
          sx={{
            animation: 'fade-in-up 0.6s ease-out 0.4s forwards',
            opacity: 0,
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={signInWithGoogle}
            sx={{
              py: 1.5,
              px: 4,
              fontSize: '1rem',
              background: 'linear-gradient(135deg, var(--color-forest-mid) 0%, var(--color-forest-deep) 100%)',
              boxShadow: '0 8px 24px rgba(27, 67, 50, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                boxShadow: '0 12px 32px rgba(27, 67, 50, 0.4)',
                transform: 'translateY(-2px)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: 0,
                height: 0,
                borderStyle: 'solid',
                borderWidth: '0 20px 20px 0',
                borderColor: 'transparent rgba(255,255,255,0.15) transparent transparent',
              },
              transition: 'all 250ms ease',
            }}
          >
            Log In with Google
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
