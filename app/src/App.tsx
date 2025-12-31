

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BirdPhotosProvider } from './context/BirdPhotosContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { CircularProgress, Box } from '@mui/material';
import PrivateRoutes from './components/PrivateRoutes';

import LandingPage from './pages/LandingPage';

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      {user ? (
        <Route path="/*" element={<PrivateRoutes />} />
      ) : (
        <>
          <Route path="/welcome" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </>
      )}
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BirdPhotosProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <AppRoutes />
          </Router>
        </ThemeProvider>
      </BirdPhotosProvider>
    </AuthProvider>
  );
}

export default App;
