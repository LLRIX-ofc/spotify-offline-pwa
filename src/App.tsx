import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import { RootState } from './store/store';
import TabBar from './components/ui/TabBar';
import MiniPlayer from './components/ui/MiniPlayer';
import LoginPage from './pages/LoginPage';
import CallbackPage from './pages/CallbackPage';
import ExplorePage from './pages/ExplorePage';
import LibraryPage from './pages/LibraryPage';
import SettingsPage from './pages/SettingsPage';
import PlayerPage from './pages/PlayerPage';

// Auth guard for routes
const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isLoggedIn);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return element;
};

const AppContent: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isLoggedIn);
  const currentTrack = useSelector((state: RootState) => state.library.currentlyPlaying);
  
  // Apply theme on first load
  useEffect(() => {
    const theme = store.getState().settings.theme;
    const documentEl = document.documentElement;
    
    if (theme === 'system') {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      documentEl.classList.toggle('dark', isSystemDark);
    } else {
      documentEl.classList.toggle('dark', theme === 'dark');
    }
  }, []);
  
  // Watch for system theme changes
  useEffect(() => {
    const theme = store.getState().settings.theme;
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  return (
    <Router>
      <div className="min-h-screen bg-dark-500 text-white">
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/callback" element={<CallbackPage />} />
          <Route path="/" element={<PrivateRoute element={<ExplorePage />} />} />
          <Route path="/library" element={<PrivateRoute element={<LibraryPage />} />} />
          <Route path="/settings" element={<PrivateRoute element={<SettingsPage />} />} />
          <Route path="/player" element={<PrivateRoute element={<PlayerPage />} />} />
        </Routes>
        
        {isAuthenticated && (
          <>
            {currentTrack && <MiniPlayer />}
            <TabBar />
          </>
        )}
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
};

export default App;