import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Public & Auth Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// App / Authenticated Pages
import Home from './pages/Home';
import Explore from './pages/Explore';
import Trending from './pages/Trending';
import Communities from './pages/Communities';
import EasterEggs from './pages/EasterEggs';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AccountSettings from './pages/AccountSettings';
import NotFound from './pages/NotFound';

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
    style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}
  >
    {children}
  </motion.div>
);

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public & Auth Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
          <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
          <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
          <Route path="/reset-password" element={<PageWrapper><ResetPassword /></PageWrapper>} />
        </Route>

        {/* Authenticated / App Routes */}
        <Route element={<AppLayout />}>
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/explore" element={<PageWrapper><Explore /></PageWrapper>} />
            <Route path="/trending" element={<PageWrapper><Trending /></PageWrapper>} />
            <Route path="/communities" element={<PageWrapper><Communities /></PageWrapper>} />
            <Route path="/easter-eggs" element={<PageWrapper><EasterEggs /></PageWrapper>} />
            <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
            <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
            <Route path="/settings" element={<PageWrapper><AccountSettings /></PageWrapper>} />
          </Route>
        </Route>

        {/* Fallback 404 Route */}
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <AnimatedRoutes />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;