import React, { useEffect, useState } from 'react';
import useGeolocation from '../hooks/useGeolocation';
import { getNearbySightings } from '../services/eBirdService';
import { getBirdPhotos, type BirdImage } from '../services/photoService';
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
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import { ExpandLess, ExpandMore, Image as ImageIcon } from '@mui/icons-material';

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
  const [photos, setPhotos] = useState<Record<string, BirdImage | null>>({});

  useEffect(() => {
    if (location) {
      const fetchSightings = async () => {
        setLoadingSightings(true);
        setSightingsError(null);
        try {
          const data = await getNearbySightings(location.latitude, location.longitude);
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

  useEffect(() => {
    const processPhotoQueue = async () => {
      // Create a map of common name to species code
      const speciesCodeMap: Record<string, string> = {};
      
      // Extract unique species codes from grouped sightings
      Object.entries(groupedByBird).forEach(([comName, sightings]) => {
        if (sightings.length > 0) {
          // Use the first sighting's species code
          speciesCodeMap[comName] = sightings[0].speciesCode;
        }
      });
      
      // Get list of species codes that don't have photos yet
      const speciesToFetch = Object.entries(speciesCodeMap)
        .filter(([comName]) => !photos[comName])
        .map(([_, speciesCode]) => speciesCode);

      if (speciesToFetch.length === 0) return;

      // Process in smaller chunks to avoid rate limits
      const CHUNK_SIZE = 5;
      for (let i = 0; i < speciesToFetch.length; i += CHUNK_SIZE) {
        const chunk = speciesToFetch.slice(i, i + CHUNK_SIZE);
        
        // Create a mapping between species code and common name for this chunk
        const reverseLookup: Record<string, string> = {};
        Object.entries(speciesCodeMap).forEach(([comName, speciesCode]) => {
          if (chunk.includes(speciesCode)) {
            reverseLookup[speciesCode] = comName;
          }
        });
        
        // Set placeholders for the current chunk to prevent re-fetching
        const placeholders: Record<string, null> = {};
        Object.values(reverseLookup).forEach((comName) => {
          placeholders[comName] = null;
        });
        setPhotos((prev) => ({ ...prev, ...placeholders }));

        // Fetch photos for the current chunk
        const newPhotos = await getBirdPhotos(chunk);

        // Transform the response to use common names as keys
        const transformedPhotos: Record<string, BirdImage | null> = {};
        Object.entries(newPhotos).forEach(([speciesCode, birdImage]) => {
          const comName = reverseLookup[speciesCode];
          if (comName) {
            transformedPhotos[comName] = birdImage;
          }
        });

        // Update state with the fetched photos
        if (Object.keys(transformedPhotos).length > 0) {
          setPhotos((prev) => ({ ...prev, ...transformedPhotos }));
        }
      }
    };

    if (Object.keys(groupedByBird).length > 0) {
      processPhotoQueue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupedByBird]);

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
                  <Avatar src={photos[comName]?.imageUrl || ''}>
                    {/* Fallback icon if image is not found or loading */}
                    {!photos[comName]?.imageUrl && <ImageIcon />}
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
