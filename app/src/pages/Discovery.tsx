import React, { useState } from 'react';
import useGeolocation from '../hooks/useGeolocation';
import { useBirdSightings } from '../hooks/useBirdSightings';
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
} from '@mui/material';
import { ExpandLess, ExpandMore, Image as ImageIcon } from '@mui/icons-material';

const Discovery: React.FC = () => {
  const { data: location, locationName, loading: locationLoading, error: locationError } = useGeolocation();
  const { groupedByBird, loading: loadingSightings, error: sightingsError } = useBirdSightings(location);
  const { photos, loadPhotosForSpecies } = useBirdPhotosContext();

  const [openBirds, setOpenBirds] = useState<Record<string, boolean>>({});

  // Trigger photo loading when sightings change
  React.useEffect(() => {
    if (Object.keys(groupedByBird).length > 0) {
      const speciesCodes = Object.values(groupedByBird)
        .flat()
        .map(s => s.speciesCode);
      const uniqueSpecies = [...new Set(speciesCodes)];
      loadPhotosForSpecies(uniqueSpecies);
    }
  }, [groupedByBird, loadPhotosForSpecies]);

  const handleBirdClick = (comName: string) => {
    setOpenBirds((prev) => ({ ...prev, [comName]: !prev[comName] }));
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
          {Object.entries(groupedByBird).map(([comName, birdSightings]) => (
            <React.Fragment key={comName}>
              <ListItemButton onClick={() => handleBirdClick(comName)}>
                <ListItemAvatar>
                  <Avatar src={photos[birdSightings[0].speciesCode]?.imageUrl || ''}>
                    {/* Fallback icon if image is not found or loading */}
                    {!photos[birdSightings[0].speciesCode]?.imageUrl && <ImageIcon />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={comName}
                  secondary={`${birdSightings.length} recent sighting(s)`}
                />
                {openBirds[comName] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={openBirds[comName]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {birdSightings.map((sighting) => (
                    <ListItem key={sighting.subId} sx={{ pl: 4 }}>
                      <ListItemText primary={sighting.locName} secondary={`Date: ${sighting.obsDt} | Count: ${sighting.howMany}`} />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default Discovery;
