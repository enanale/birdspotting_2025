import { createTheme, alpha } from '@mui/material/styles';

// Raetikon-inspired color palette
const colors = {
  // Forest & Nature Greens
  forestDeep: '#1B4332',
  forestMid: '#2D6A4F',
  forestLight: '#40916C',
  forestPale: '#74C69D',

  // Sky Blues
  skyBlue: '#457B9D',
  skyLight: '#A8DADC',
  skyPale: '#E3F2FD',

  // Earth & Warm Tones
  earthWarm: '#8B5A2B',
  earthLight: '#D4A574',

  // Neutrals
  stone: '#6C757D',
  stoneLight: '#ADB5BD',
  parchment: '#F4F1DE',
  snow: '#FAFAFA',

  // Accents
  sunset: '#E76F51',
  golden: '#F4A261',
  berry: '#9D4EDD',
};

// Raetikon-inspired theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.forestMid,
      light: colors.forestLight,
      dark: colors.forestDeep,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: colors.skyBlue,
      light: colors.skyLight,
      dark: '#1D3557',
      contrastText: '#FFFFFF',
    },
    success: {
      main: colors.forestLight,
      light: colors.forestPale,
      dark: colors.forestDeep,
    },
    warning: {
      main: colors.golden,
      light: colors.earthLight,
      dark: colors.earthWarm,
    },
    error: {
      main: colors.sunset,
    },
    background: {
      default: colors.parchment,
      paper: colors.snow,
    },
    text: {
      primary: colors.forestDeep,
      secondary: colors.stone,
    },
    divider: alpha(colors.forestMid, 0.12),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 500,
    },
    h6: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 500,
    },
    button: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 4, // Sharper corners for geometric look
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          padding: '10px 24px',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderWidth: '0 12px 12px 0',
            borderColor: `transparent ${alpha('#FFFFFF', 0.2)} transparent transparent`,
          },
        },
        contained: {
          boxShadow: `0 4px 14px ${alpha(colors.forestDeep, 0.25)}`,
          '&:hover': {
            boxShadow: `0 6px 20px ${alpha(colors.forestDeep, 0.35)}`,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: `0 2px 8px ${alpha(colors.forestDeep, 0.08)}`,
        },
        elevation3: {
          boxShadow: `0 4px 16px ${alpha(colors.forestDeep, 0.12)}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: `linear-gradient(135deg, ${colors.forestDeep} 0%, ${colors.forestMid} 100%)`,
          boxShadow: `0 4px 20px ${alpha(colors.forestDeep, 0.3)}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontWeight: 500,
        },
        colorSuccess: {
          backgroundColor: colors.forestPale,
          color: colors.forestDeep,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.skyLight,
          color: colors.forestDeep,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          margin: '4px 0',
          '&:hover': {
            backgroundColor: alpha(colors.forestMid, 0.08),
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          border: `1px solid ${alpha(colors.forestMid, 0.1)}`,
        },
      },
    },
  },
});

export default theme;
export { colors };
