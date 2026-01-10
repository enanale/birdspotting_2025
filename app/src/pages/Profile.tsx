import React from 'react';
import { Box, Typography, Paper, Avatar } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useUserSightings } from '../hooks/useUserSightings';
import { Visibility, Place, CalendarMonth } from '@mui/icons-material';

// Stat card component
const StatCard = ({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      textAlign: 'center',
      backgroundColor: 'var(--color-snow)',
      border: '1px solid rgba(45, 106, 79, 0.1)',
      borderRadius: 1,
      flex: 1,
      minWidth: 100,
    }}
  >
    <Box sx={{ color: 'var(--color-forest-mid)', mb: 1 }}>
      {icon}
    </Box>
    <Typography
      variant="h4"
      sx={{
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 700,
        color: 'var(--color-forest-deep)',
        mb: 0.5,
      }}
    >
      {value}
    </Typography>
    <Typography variant="body2" sx={{ color: 'var(--color-stone)' }}>
      {label}
    </Typography>
  </Paper>
);

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { sightings } = useUserSightings();

  // Calculate stats
  const totalSightings = sightings.length;
  const uniqueSpecies = new Set(sightings.map(s => s.speciesCode)).size;
  const uniqueLocations = new Set(sightings.map(s => s.locName)).size;

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
        Profile
      </Typography>

      {/* Profile Card */}
      <Paper
        elevation={0}
        className="bird-card"
        sx={{
          p: 4,
          mb: 3,
          animation: 'fade-in-up 0.5s ease-out forwards',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative triangle */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 60,
            height: 60,
            background: 'var(--color-forest-mid)',
            clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
            opacity: 0.1,
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Avatar
            src={user?.photoURL || ''}
            alt={user?.displayName || 'User'}
            sx={{
              width: 80,
              height: 80,
              border: '3px solid var(--color-forest-mid)',
            }}
          />
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontFamily: '"Outfit", sans-serif',
                fontWeight: 600,
                color: 'var(--color-forest-deep)',
                mb: 0.5,
              }}
            >
              {user?.displayName || 'Birdwatcher'}
            </Typography>
            <Typography sx={{ color: 'var(--color-stone)' }}>
              {user?.email}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Stats Grid */}
      <Typography
        variant="h6"
        sx={{
          fontFamily: '"Outfit", sans-serif',
          fontWeight: 600,
          color: 'var(--color-forest-deep)',
          mb: 2,
        }}
      >
        Your Stats
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          animation: 'fade-in-up 0.5s ease-out 0.1s forwards',
          opacity: 0,
        }}
      >
        <StatCard
          icon={<Visibility sx={{ fontSize: 28 }} />}
          value={totalSightings}
          label="Sightings"
        />
        <StatCard
          icon={<CalendarMonth sx={{ fontSize: 28 }} />}
          value={uniqueSpecies}
          label="Species"
        />
        <StatCard
          icon={<Place sx={{ fontSize: 28 }} />}
          value={uniqueLocations}
          label="Locations"
        />
      </Box>

      {/* Coming Soon Features */}
      <Paper
        elevation={0}
        sx={{
          mt: 3,
          p: 3,
          backgroundColor: 'var(--color-sky-pale)',
          borderRadius: 1,
          textAlign: 'center',
          animation: 'fade-in-up 0.5s ease-out 0.2s forwards',
          opacity: 0,
        }}
      >
        <Typography sx={{ color: 'var(--color-forest-mid)', fontWeight: 500 }}>
          More profile features coming soon!
        </Typography>
      </Paper>
    </Box>
  );
};

export default Profile;
