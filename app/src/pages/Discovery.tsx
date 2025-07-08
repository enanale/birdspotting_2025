import React, { useEffect, useState } from 'react';
import useGeolocation from '../hooks/useGeolocation';
import { getNearbyNotableSightings } from '../services/eBirdService';
import type { BirdSighting } from '../services/eBirdService';
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
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

interface GroupedByBird {
  [comName: string]: BirdSighting[];
}

const Discovery: React.FC = () => {
  const { data: location, locationName, loading: locationLoading, error: locationError } = useGeolocation();
  const [sightings, setSightings] = useState<BirdSighting[]>([]);
  const [groupedByBird, setGroupedByBird] = useState<GroupedByBird>({});
  const [openBirds, setOpenBirds] = useState<Record<string, boolean>>({});
  const [loadingSightings, setLoadingSightings] = useState(false);
  const [sightingsError, setSightingsError] = useState<string | null>(null);

  useEffect(() => {
    if (location) {
      const fetchSightings = async () => {
        setLoadingSightings(true);
        setSightingsError(null);
        try {
          const data = await getNearbyNotableSightings(location.latitude, location.longitude);
          setSightings(data);
        } catch (err) {
          setSightingsError('Failed to fetch bird sightings.');
          console.error(err);
        } finally {
          setLoadingSightings(false);
        }
      };
      fetchSightings();
    }
  }, [location]);

  useEffect(() => {
    const newGroupedByBird = sightings.reduce<GroupedByBird>((acc, sighting) => {
      const key = sighting.comName;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(sighting);
      return acc;
    }, {});
    setGroupedByBird(newGroupedByBird);
  }, [sightings]);

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
