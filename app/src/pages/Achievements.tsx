import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';

// Hexagonal badge placeholder
const HexBadge = ({ filled = false }: { filled?: boolean }) => (
  <Box
    sx={{
      width: 56,
      height: 64,
      backgroundColor: filled ? 'var(--color-golden)' : 'var(--color-sky-pale)',
      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'scale(1.05)',
      },
    }}
  >
    <EmojiEvents
      sx={{
        color: filled ? 'var(--color-forest-deep)' : 'var(--color-stone)',
        fontSize: 24,
        opacity: filled ? 1 : 0.4,
      }}
    />
  </Box>
);

const Achievements: React.FC = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 800, mx: 'auto' }}>
      {/* Page Header */}
      <Typography
        variant="h4"
        sx={{
          fontFamily: '"Outfit", sans-serif',
          fontWeight: 600,
          color: 'var(--color-forest-deep)',
          mb: 3,
        }}
      >
        Achievements
      </Typography>

      {/* Coming Soon Card */}
      <Paper
        elevation={0}
        className="bird-card"
        sx={{
          p: 4,
          textAlign: 'center',
          animation: 'fade-in-up 0.5s ease-out forwards',
        }}
      >
        {/* Badge Preview Row */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            mb: 4,
            flexWrap: 'wrap',
          }}
        >
          <HexBadge filled />
          <HexBadge />
          <HexBadge />
          <HexBadge />
          <HexBadge />
        </Box>

        <Typography
          variant="h5"
          sx={{
            fontFamily: '"Outfit", sans-serif',
            fontWeight: 600,
            color: 'var(--color-forest-deep)',
            mb: 1,
          }}
        >
          Coming Soon
        </Typography>
        <Typography sx={{ color: 'var(--color-stone)', maxWidth: 400, mx: 'auto' }}>
          Earn badges for your birdwatching accomplishments.
          Track your first sightings, rare finds, and birding streaks!
        </Typography>

        {/* Decorative triangles */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 40,
            height: 40,
            background: 'var(--color-forest-mid)',
            clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
            opacity: 0.1,
          }}
        />
      </Paper>
    </Box>
  );
};

export default Achievements;
