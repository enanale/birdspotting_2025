import React, { useState } from 'react';
import useGeolocation from '../hooks/useGeolocation';
import { useBirdSightings } from '../hooks/useBirdSightings';
import { useAuth } from '../context/AuthContext';
import { useUserSightings } from '../hooks/useUserSightings';
import { sightingService } from '../services/sightingService';
import { useBirdPhotosContext } from '../context/BirdPhotosContext';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  CircularProgress,
  ListItemAvatar,
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Image as ImageIcon,
  CheckCircle,
  Add as AddIcon,
  LocationOn
} from '@mui/icons-material';

// Triangular corner overlay for images
const TriangleOverlay = () => (
  <Box
    sx={{
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 32,
      height: 32,
      background: 'var(--color-forest-mid)',
      clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
      opacity: 0.85,
    }}
  />
);

const Discovery: React.FC = () => {
  const { data: location, locationName, loading: locationLoading, error: locationError } = useGeolocation();
  const { groupedByBird, loading: loadingSightings, error: sightingsError } = useBirdSightings(location);
  const { photos, loadPhotosForSpecies } = useBirdPhotosContext();
  const { refreshSightings, getLastSighting } = useUserSightings();
  const { user } = useAuth();

  const [openBirds, setOpenBirds] = useState<Record<string, boolean>>({});

  // Confirmation Dialog State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedBird, setSelectedBird] = useState<{ comName: string; speciesCode: string; sciName: string } | null>(null);
  const [addingSighting, setAddingSighting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Trigger photo loading when sightings change
  React.useEffect(() => {
    if (Object.keys(groupedByBird).length > 0) {
      const speciesMap: Record<string, { comName: string, sciName: string }> = {};
      Object.values(groupedByBird).flat().forEach(s => {
        if (!speciesMap[s.speciesCode]) {
          speciesMap[s.speciesCode] = {
            comName: s.comName,
            sciName: s.sciName
          };
        }
      });
      loadPhotosForSpecies(speciesMap);
    }
  }, [groupedByBird, loadPhotosForSpecies]);

  const handleBirdClick = (comName: string) => {
    setOpenBirds((prev) => ({ ...prev, [comName]: !prev[comName] }));
  };

  const handleAddSightingClick = (bird: { comName: string; speciesCode: string; sciName: string }, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent toggling the list item
    setSelectedBird(bird);
    setConfirmOpen(true);
  };

  const handleConfirmSighting = async () => {
    if (!user || !selectedBird || !location) return;

    setAddingSighting(true);
    try {
      await sightingService.addSighting(user.uid, {
        speciesCode: selectedBird.speciesCode,
        comName: selectedBird.comName,
        sciName: selectedBird.sciName,
        location: {
          lat: location.latitude,
          lng: location.longitude,
          name: locationName || 'Current Location',
        },
      });

      // Refresh local sightings to update "Last Sighted" UI
      await refreshSightings();

      setConfirmOpen(false);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Failed to add sighting:', error);
      alert('Failed to save sighting. Please try again.');
    } finally {
      setAddingSighting(false);
    }
  };

  if (locationLoading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress sx={{ color: 'var(--color-forest-mid)' }} />
        <Typography sx={{ mt: 2, color: 'var(--color-forest-deep)' }}>
          Finding your location...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 800, mx: 'auto' }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: '"Outfit", sans-serif',
            fontWeight: 600,
            color: 'var(--color-forest-deep)',
            mb: 1,
          }}
        >
          Nearby Birds
        </Typography>

        {/* Location Chip */}
        {locationName && (
          <Chip
            icon={<LocationOn sx={{ color: 'var(--color-forest-mid) !important' }} />}
            label={locationName}
            sx={{
              backgroundColor: 'var(--color-sky-light)',
              color: 'var(--color-forest-deep)',
              fontWeight: 500,
              borderRadius: 1,
              '& .MuiChip-icon': {
                color: 'var(--color-forest-mid)',
              },
            }}
          />
        )}
      </Box>

      {locationError && (
        <Paper
          sx={{
            p: 2,
            mb: 2,
            backgroundColor: 'rgba(231, 111, 81, 0.1)',
            border: '1px solid var(--color-sunset)',
            borderRadius: 1,
          }}
        >
          <Typography color="error">Error: {locationError.message}</Typography>
        </Paper>
      )}

      {loadingSightings && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress sx={{ color: 'var(--color-forest-mid)' }} />
          <Typography sx={{ mt: 2, color: 'var(--color-stone)' }}>
            Loading nearby bird sightings...
          </Typography>
        </Box>
      )}

      {sightingsError && (
        <Paper
          sx={{
            p: 2,
            mb: 2,
            backgroundColor: 'rgba(231, 111, 81, 0.1)',
            border: '1px solid var(--color-sunset)',
            borderRadius: 1,
          }}
        >
          <Typography color="error">Error: {sightingsError}</Typography>
        </Paper>
      )}

      {/* Bird List */}
      {Object.keys(groupedByBird).length > 0 && (
        <List sx={{ p: 0 }}>
          {Object.entries(groupedByBird).map(([comName, birdSightings], index) => {
            const bird = birdSightings[0];
            const lastSighting = getLastSighting(bird.speciesCode);

            return (
              <Paper
                key={comName}
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
                <ListItemButton
                  onClick={() => handleBirdClick(comName)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(45, 106, 79, 0.04)',
                    },
                  }}
                >
                  {/* Bird Avatar */}
                  <ListItemAvatar>
                    <Avatar
                      src={photos[bird.speciesCode]?.thumbnailUrl || ''}
                      sx={{
                        width: 48,
                        height: 48,
                        border: '2px solid var(--color-sky-light)',
                      }}
                    >
                      {!photos[bird.speciesCode]?.thumbnailUrl && <ImageIcon />}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color: 'var(--color-forest-deep)',
                            fontFamily: '"Outfit", sans-serif',
                          }}
                        >
                          {comName}
                        </Typography>
                        {lastSighting && (
                          <Box
                            className="sighted-badge"
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                              px: 1,
                              py: 0.25,
                              backgroundColor: 'var(--color-forest-pale)',
                              color: 'var(--color-forest-deep)',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              borderRadius: 0.5,
                            }}
                          >
                            <CheckCircle sx={{ fontSize: 12 }} />
                            Sighted
                          </Box>
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ color: 'var(--color-stone)' }}>
                        {birdSightings.length} recent sighting{birdSightings.length !== 1 ? 's' : ''}
                      </Typography>
                    }
                  />
                  {openBirds[comName] ? (
                    <ExpandLess sx={{ color: 'var(--color-forest-mid)' }} />
                  ) : (
                    <ExpandMore sx={{ color: 'var(--color-stone)' }} />
                  )}
                </ListItemButton>

                {/* Expanded Details */}
                <Collapse in={openBirds[comName]} timeout="auto" unmountOnExit>
                  <Box sx={{ px: 2, py: 2, backgroundColor: 'rgba(168, 218, 220, 0.1)' }}>
                    {/* Last Sighted Info Section */}
                    {lastSighting ? (
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          mb: 2,
                          backgroundColor: 'var(--color-forest-pale)',
                          borderColor: 'var(--color-forest-light)',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <CheckCircle sx={{ color: 'var(--color-forest-deep)', mr: 1.5 }} />
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, color: 'var(--color-forest-deep)' }}
                          >
                            You've seen this bird!
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'var(--color-forest-mid)' }}>
                            Last spotted on {lastSighting.obsDt?.toDate().toLocaleDateString()} at {lastSighting.locName}
                          </Typography>
                        </Box>
                      </Paper>
                    ) : (
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        fullWidth
                        sx={{
                          mb: 2,
                          borderRadius: 1,
                          background: 'linear-gradient(135deg, var(--color-forest-mid) 0%, var(--color-forest-deep) 100%)',
                          boxShadow: '0 4px 12px rgba(27, 67, 50, 0.25)',
                          '&:hover': {
                            boxShadow: '0 6px 16px rgba(27, 67, 50, 0.35)',
                          },
                        }}
                        onClick={(e) => handleAddSightingClick({
                          comName,
                          speciesCode: bird.speciesCode,
                          sciName: bird.sciName
                        }, e)}
                      >
                        Log Sighting Here
                      </Button>
                    )}

                    {/* Bird Photo */}
                    {photos[bird.speciesCode]?.originalUrl ? (
                      <Box
                        sx={{
                          position: 'relative',
                          borderRadius: 1,
                          overflow: 'hidden',
                          mb: 2,
                        }}
                      >
                        <Box
                          component="img"
                          src={photos[bird.speciesCode]?.originalUrl || ''}
                          alt={comName}
                          sx={{
                            width: '100%',
                            maxHeight: 280,
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                        <TriangleOverlay />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: 180,
                          bgcolor: 'var(--color-sky-pale)',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          border: '1px dashed var(--color-sky-light)',
                        }}
                      >
                        <ImageIcon sx={{ fontSize: 36, color: 'var(--color-stone)', mr: 1 }} />
                        <Typography color="text.secondary" sx={{ color: 'var(--color-stone)' }}>
                          {photos[bird.speciesCode] === null ? 'Finding photo...' : 'No photo available'}
                        </Typography>
                      </Box>
                    )}

                    {/* Sighting Locations */}
                    <List component="div" disablePadding sx={{ ml: 1 }}>
                      {birdSightings.map((sighting) => (
                        <ListItem
                          key={sighting.subId}
                          disableGutters
                          sx={{
                            py: 0.75,
                            borderLeft: '2px solid var(--color-sky-light)',
                            pl: 2,
                            mb: 0.5,
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ fontWeight: 500, color: 'var(--color-forest-deep)' }}>
                                {sighting.locName}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" sx={{ color: 'var(--color-stone)' }}>
                                {sighting.obsDt} • {sighting.howMany} seen
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Collapse>
              </Paper>
            );
          })}
        </List>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            border: '1px solid var(--color-sky-light)',
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600 }}>
          Log Sighting?
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to log a sighting of <strong>{selectedBird?.comName}</strong>?
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'var(--color-sky-pale)', borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Location:</strong> {locationName || 'Current Location'}
            </Typography>
            <Typography variant="body2">
              <strong>Date:</strong> {new Date().toLocaleDateString()}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            sx={{ color: 'var(--color-stone)' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSighting}
            variant="contained"
            autoFocus
            disabled={addingSighting}
            sx={{
              background: 'linear-gradient(135deg, var(--color-forest-mid) 0%, var(--color-forest-deep) 100%)',
            }}
          >
            {addingSighting ? 'Saving...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{
            width: '100%',
            backgroundColor: 'var(--color-forest-pale)',
            color: 'var(--color-forest-deep)',
            '& .MuiAlert-icon': {
              color: 'var(--color-forest-deep)',
            },
          }}
        >
          Sighting saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Discovery;
