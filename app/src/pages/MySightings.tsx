import React from 'react';
import { useUserSightings } from '../hooks/useUserSightings';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress,
  Chip
} from '@mui/material';
import { LocationOn, Event } from '@mui/icons-material';

const MySightings: React.FC = () => {
  const { sightings, loading, error } = useUserSightings();

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading your sightings...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (sightings.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>No sightings yet</Typography>
        <Typography color="text.secondary">
          Go to the "Discovery" page to discover and log birds you see!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>My Sightings</Typography>

      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {sightings.map((sighting, index) => (
          <React.Fragment key={sighting.id || index}>
            <Paper elevation={1} sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
              <ListItem alignItems="flex-start" sx={{ px: 3, py: 2 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" component="span">
                        {sighting.comName}
                      </Typography>
                      <Chip
                        label={sighting.sciName}
                        size="small"
                        variant="outlined"
                        sx={{ fontStyle: 'italic' }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, color: 'text.secondary' }}>
                        <Event fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2" component="span">
                          {sighting.obsDt?.toDate().toLocaleDateString()} at {sighting.obsDt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
                        <LocationOn fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2" component="span">
                          {sighting.locName}
                        </Typography>
                      </Box>

                      {sighting.notes && (
                        <Typography variant="body2" sx={{ mt: 1, bgcolor: 'grey.50', p: 1, borderRadius: 1 }}>
                          "{sighting.notes}"
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            </Paper>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default MySightings;
