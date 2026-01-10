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
  ListSubheader,
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
  CheckCircleOutline,
  Add as AddIcon
} from '@mui/icons-material';

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
    return <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress /> <Typography>Loading location...</Typography></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Nearby Birds</Typography>
      {locationError && <Typography color="error">Error: {locationError.message}</Typography>}

      {loadingSightings && <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress /> <Typography>Loading nearby bird sightings...</Typography></Box>}
      {sightingsError && <Typography color="error">Error: {sightingsError}</Typography>}

      {Object.keys(groupedByBird).length > 0 && (
        <List
          subheader={<ListSubheader>Showing sightings for {locationName || 'your current area'}</ListSubheader>}
        >
          {Object.entries(groupedByBird).map(([comName, birdSightings]) => {
            const bird = birdSightings[0];
            const lastSighting = getLastSighting(bird.speciesCode);

            return (
              <React.Fragment key={comName}>
                <ListItemButton onClick={() => handleBirdClick(comName)}>
                  <ListItemAvatar>
                    <Avatar src={photos[bird.speciesCode]?.thumbnailUrl || ''}>
                      {/* Fallback icon if image is not found or loading */}
                      {!photos[bird.speciesCode]?.thumbnailUrl && <ImageIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
                        <Typography variant="body1">{comName}</Typography>
                        {lastSighting && (
                          <Chip
                            label="Sighted!"
                            color="success"
                            size="small"
                            icon={<CheckCircleOutline fontSize="small" />}
                            sx={{ height: 20 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={`${birdSightings.length} recent sighting(s)`}
                  />
                  {openBirds[comName] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={openBirds[comName]} timeout="auto" unmountOnExit>
                  <Box sx={{ px: 4, py: 2 }}>
                    {/* Last Sighted Info Section */}
                    {lastSighting ? (
                      <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'success.light', borderColor: 'success.main', display: 'flex', alignItems: 'center' }}>
                        <CheckCircleOutline color="success" sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>You've seen this bird!</Typography>
                          <Typography variant="caption" display="block">
                            Last spotted on {lastSighting.obsDt?.toDate().toLocaleDateString()} at {lastSighting.locName}
                          </Typography>
                        </Box>
                      </Paper>
                    ) : (
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        fullWidth
                        sx={{ mb: 2, borderRadius: 2 }}
                        onClick={(e) => handleAddSightingClick({
                          comName,
                          speciesCode: bird.speciesCode,
                          sciName: bird.sciName
                        }, e)}
                      >
                        Log Sighting Here
                      </Button>
                    )}

                    {photos[bird.speciesCode]?.originalUrl ? (
                      <Box
                        component="img"
                        src={photos[bird.speciesCode]?.originalUrl || ''}
                        alt={comName}
                        sx={{
                          width: '100%',
                          maxHeight: 300,
                          objectFit: 'cover',
                          borderRadius: 2,
                          boxShadow: 3,
                          mb: 2,
                          display: 'block'
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: 200,
                          bgcolor: 'grey.100',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          border: '1px dashed',
                          borderColor: 'grey.300'
                        }}
                      >
                        <ImageIcon sx={{ fontSize: 40, color: 'grey.400', mr: 1 }} />
                        <Typography color="text.secondary">
                          {photos[bird.speciesCode] === null ? 'Finding photo...' : 'No photo available'}
                        </Typography>
                      </Box>
                    )}
                    <List component="div" disablePadding>
                      {birdSightings.map((sighting) => (
                        <ListItem key={sighting.subId} disableGutters>
                          <ListItemText
                            primary={sighting.locName}
                            secondary={`Date: ${sighting.obsDt} | Count: ${sighting.howMany}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Collapse>
              </React.Fragment>
            );
          })}
        </List>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Log Sighting?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to log a sighting of <strong>{selectedBird?.comName}</strong>?
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2"><strong>Location:</strong> {locationName || 'Current Location'}</Typography>
            <Typography variant="body2"><strong>Date:</strong> {new Date().toLocaleDateString()}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmSighting}
            variant="contained"
            autoFocus
            disabled={addingSighting}
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
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          Sighting saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Discovery;
