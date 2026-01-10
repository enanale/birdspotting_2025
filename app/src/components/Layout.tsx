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

// Mountain silhouette SVG for footer decoration
const MountainSilhouette = () => (
  <Box
    component="svg"
    viewBox="0 0 1200 80"
    preserveAspectRatio="none"
    sx={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: { xs: 60, md: 80 },
      pointerEvents: 'none',
      zIndex: 0,
    }}
  >
    {/* Back layer - lighter */}
    <path
      d="M0 80 L100 45 L200 65 L350 25 L500 55 L650 15 L800 50 L950 30 L1100 55 L1200 40 L1200 80 Z"
      fill="var(--color-forest-mid)"
      fillOpacity="0.08"
    />
    {/* Front layer - darker */}
    <path
      d="M0 80 L150 55 L300 70 L450 45 L600 65 L750 35 L900 60 L1050 50 L1200 65 L1200 80 Z"
      fill="var(--color-forest-deep)"
      fillOpacity="0.12"
    />
  </Box>
);

// Triangular header edge decoration
const HeaderEdge = () => (
  <Box
    component="svg"
    viewBox="0 0 1200 16"
    preserveAspectRatio="none"
    sx={{
      position: 'absolute',
      bottom: -15,
      left: 0,
      right: 0,
      height: 16,
      pointerEvents: 'none',
    }}
  >
    <path
      d="M0 0 L1200 0 L1200 4 L1150 16 L1050 6 L950 14 L850 4 L750 12 L650 2 L550 10 L450 4 L350 14 L250 6 L150 12 L50 4 L0 10 Z"
      fill="var(--color-forest-deep)"
    />
  </Box>
);

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
    <Box sx={{ flexGrow: 1, minHeight: '100vh', pb: 10, position: 'relative' }}>
      <AppBar
        position="sticky"
        sx={{
          position: 'relative',
          zIndex: 1100,
        }}
      >
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenu}
            sx={{
              mr: 2,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 180,
                borderRadius: 2,
                boxShadow: '0 8px 24px rgba(27, 67, 50, 0.15)',
              },
            }}
          >
            <MenuItem onClick={handleClose} component={Link} to="/">
              <Typography sx={{ fontWeight: 500 }}>Discovery</Typography>
            </MenuItem>
            <MenuItem onClick={handleClose} component={Link} to="/sightings">
              <Typography sx={{ fontWeight: 500 }}>My Sightings</Typography>
            </MenuItem>
            <MenuItem onClick={handleClose} component={Link} to="/achievements">
              <Typography sx={{ fontWeight: 500 }}>Achievements</Typography>
            </MenuItem>
            <MenuItem onClick={handleClose} component={Link} to="/profile">
              <Typography sx={{ fontWeight: 500 }}>Profile</Typography>
            </MenuItem>
          </Menu>

          {/* Logo */}
          <Box
            component="img"
            sx={{
              height: 36,
              mr: 1.5,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
            }}
            alt="Birdspotting logo"
            src="/birdspotting_logo_256.png"
          />

          {/* App Title */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontFamily: '"Outfit", sans-serif',
              fontWeight: 600,
              letterSpacing: '0.02em',
              textShadow: '0 1px 2px rgba(0,0,0,0.15)',
            }}
          >
            Birdspotting
          </Typography>

          {user ? (
            <>
              <Avatar
                alt={user.displayName || ''}
                src={user.photoURL || ''}
                sx={{
                  width: 36,
                  height: 36,
                  mr: 1.5,
                  border: '2px solid rgba(255,255,255,0.3)',
                }}
              />
              <IconButton
                color="inherit"
                onClick={logout}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <LogoutIcon />
              </IconButton>
            </>
          ) : (
            <Button
              color="inherit"
              onClick={signInWithGoogle}
              sx={{
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Login with Google
            </Button>
          )}
        </Toolbar>
        <HeaderEdge />
      </AppBar>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          position: 'relative',
          zIndex: 1,
          pt: 2,
        }}
      >
        {children}
      </Box>

      {/* Decorative Mountain Footer */}
      <MountainSilhouette />
    </Box>
  );
};

export default Layout;
