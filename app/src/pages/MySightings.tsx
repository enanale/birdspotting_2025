import React from 'react';
import { useUserSightings } from '../hooks/useUserSightings';
import { useBirdPhotosContext } from '../context/BirdPhotosContext';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress,
  Chip,
  Avatar
} from '@mui/material';
import { LocationOn, Event, Explore } from '@mui/icons-material';

// Empty state component
const EmptyState = () => (
  <Box
    sx={{
      p: 6,
      textAlign: 'center',
      animation: 'fade-in-up 0.5s ease-out forwards',
    }}
  >
    {/* Decorative bird icon */}
    <Box
      sx={{
        width: 80,
        height: 80,
        mx: 'auto',
        mb: 3,
        borderRadius: '50%',
        backgroundColor: 'var(--color-sky-pale)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Explore sx={{ fontSize: 40, color: 'var(--color-forest-mid)' }} />
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
      No sightings yet
    </Typography>
    <Typography sx={{ color: 'var(--color-stone)', maxWidth: 300, mx: 'auto' }}>
      Explore the Discovery page to find birds near you and start logging your sightings!
    </Typography>
  </Box>
);

const MySightings: React.FC = () => {
  const { sightings, loading, error } = useUserSightings();
  const { photos } = useBirdPhotosContext();

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress sx={{ color: 'var(--color-forest-mid)' }} />
        <Typography sx={{ mt: 2, color: 'var(--color-stone)' }}>
          Loading your sightings...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Paper
          sx={{
            p: 2,
            backgroundColor: 'rgba(231, 111, 81, 0.1)',
            border: '1px solid var(--color-sunset)',
            borderRadius: 1,
          }}
        >
          <Typography color="error">{error}</Typography>
        </Paper>
      </Box>
    );
  }

  if (sightings.length === 0) {
    return <EmptyState />;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 800, mx: 'auto' }}>
      {/* Page Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: '"Outfit", sans-serif',
            fontWeight: 600,
            color: 'var(--color-forest-deep)',
          }}
        >
          My Sightings
        </Typography>
        <Chip
          label={`${sightings.length} total`}
          size="small"
          sx={{
            backgroundColor: 'var(--color-forest-pale)',
            color: 'var(--color-forest-deep)',
            fontWeight: 600,
          }}
        />
      </Box>

      {/* Sightings List */}
      <List sx={{ p: 0 }}>
        {sightings.map((sighting, index) => (
          <Paper
            key={sighting.id || index}
            elevation={0}
            className="bird-card"
            sx={{
              mb: 2,
              overflow: 'hidden',
              animation: 'fade-in-up 0.4s ease-out forwards',
              animationDelay: `${index * 0.05}s`,
              opacity: 0,
            }}
          >
            <ListItem
              alignItems="flex-start"
              sx={{
                px: 2.5,
                py: 2,
                gap: 2,
              }}
            >
              {/* Bird Photo Avatar */}
              <Avatar
                src={photos[sighting.speciesCode]?.thumbnailUrl || ''}
                sx={{
                  width: 56,
                  height: 56,
                  border: '2px solid var(--color-sky-light)',
                  flexShrink: 0,
                }}
              >
                {sighting.comName.charAt(0)}
              </Avatar>

              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                    <Typography
                      variant="h6"
                      component="span"
                      sx={{
                        fontFamily: '"Outfit", sans-serif',
                        fontWeight: 600,
                        color: 'var(--color-forest-deep)',
                        fontSize: '1.1rem',
                      }}
                    >
                      {sighting.comName}
                    </Typography>
                    <Chip
                      label={sighting.sciName}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontStyle: 'italic',
                        fontSize: '0.7rem',
                        height: 24,
                        borderColor: 'var(--color-sky-light)',
                        color: 'var(--color-stone)',
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    {/* Date */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.75, color: 'var(--color-stone)' }}>
                      <Event fontSize="small" sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="body2" component="span">
                        {sighting.obsDt?.toDate().toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })} at {sighting.obsDt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>

                    {/* Location */}
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'var(--color-stone)' }}>
                      <LocationOn fontSize="small" sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="body2" component="span">
                        {sighting.locName}
                      </Typography>
                    </Box>

                    {/* Notes */}
                    {sighting.notes && (
                      <Box
                        sx={{
                          mt: 1.5,
                          p: 1.5,
                          backgroundColor: 'var(--color-sky-pale)',
                          borderRadius: 1,
                          borderLeft: '3px solid var(--color-forest-mid)',
                        }}
                      >
                        <Typography variant="body2" sx={{ color: 'var(--color-forest-deep)', fontStyle: 'italic' }}>
                          "{sighting.notes}"
                        </Typography>
                      </Box>
                    )}
                  </Box>
                }
              />
            </ListItem>

            {/* Timeline connector line on left */}
            <Box
              sx={{
                position: 'absolute',
                left: 36,
                top: 70,
                bottom: -16,
                width: 2,
                backgroundColor: 'var(--color-sky-light)',
                display: index < sightings.length - 1 ? 'block' : 'none',
              }}
            />
          </Paper>
        ))}
      </List>
    </Box>
  );
};

export default MySightings;
