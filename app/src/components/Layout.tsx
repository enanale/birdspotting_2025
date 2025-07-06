import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';

import LogoutIcon from '@mui/icons-material/Logout';
import Avatar from '@mui/material/Avatar';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signInWithGoogle, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenu}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose} component={Link} to="/">Discovery</MenuItem>
            <MenuItem onClick={handleClose} component={Link} to="/sightings">My Sightings</MenuItem>
            <MenuItem onClick={handleClose} component={Link} to="/achievements">Achievements</MenuItem>
            <MenuItem onClick={handleClose} component={Link} to="/profile">Profile</MenuItem>
          </Menu>
          <Box
            component="img"
            sx={{
              height: 32,
              mr: 1,
            }}
            alt="Birdspotting logo"
            src="/birdspotting_logo_256.png"
          />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Birdspotting
          </Typography>
          {user ? (
            <>
              <Avatar alt={user.displayName || ''} src={user.photoURL || ''} sx={{ width: 32, height: 32, mr: 2 }} />
              <IconButton color="inherit" onClick={logout}>
                <LogoutIcon />
              </IconButton>
            </>
          ) : (
            <Button color="inherit" onClick={signInWithGoogle}>
              Login with Google
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
