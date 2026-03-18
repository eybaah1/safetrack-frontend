import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Trips from './pages/Trips';
import Profile from './pages/Profile';
import Alerts from './pages/Alerts';
import Chat from './pages/Chat';
import './index.css';

const ROUTES = new Set([
  'map', 'trips', 'alerts', 'profile', 'dashboard',
  'signin', 'signup', 'forgotpassword', 'chat',
]);

function normalizeView(raw, isAuthenticated, userType) {
  const view = raw || 'map';
  if (!ROUTES.has(view)) {
    return isAuthenticated ? (userType === 'security' ? 'dashboard' : 'map') : 'signin';
  }
  if (!isAuthenticated && !['signin', 'signup', 'forgotpassword'].includes(view)) return 'signin';
  if (isAuthenticated && ['signin', 'signup', 'forgotpassword'].includes(view)) {
    return userType === 'security' ? 'dashboard' : 'map';
  }
  return view;
}

function App() {
  const { isAuthenticated, userType, loading, signOut } = useAuth();

  const [view, setView] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return normalizeView(hash, isAuthenticated, userType);
  });

  // Re-normalize when auth state changes
  useEffect(() => {
    if (loading) return;
    const hash = window.location.hash.replace('#', '');
    const next = normalizeView(hash, isAuthenticated, userType);
    setView(next);
    if (next !== hash) window.location.hash = next;
  }, [isAuthenticated, userType, loading]);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const next = normalizeView(hash, isAuthenticated, userType);
      setView(next);
      if (next !== hash) window.location.hash = next;
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated, userType]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary text-sm">Loading SafeTrack...</p>
        </div>
      </div>
    );
  }

  if (view === 'forgotpassword') {
    return <ForgotPassword onBackToSignIn={() => (window.location.hash = 'signin')} />;
  }

  if (view === 'signup') {
    return (
      <SignUp
        onSwitchToSignIn={() => (window.location.hash = 'signin')}
      />
    );
  }

  if (!isAuthenticated || view === 'signin') {
    return (
      <SignIn
        onSwitchToSignUp={() => (window.location.hash = 'signup')}
        onSwitchToForgotPassword={() => (window.location.hash = 'forgotpassword')}
      />
    );
  }

  if (view === 'dashboard' || userType === 'security') {
    return <Dashboard onSignOut={signOut} />;
  }

  switch (view) {
    case 'alerts':   return <Alerts onSignOut={signOut} />;
    case 'trips':    return <Trips onSignOut={signOut} />;
    case 'profile':  return <Profile onSignOut={signOut} />;
    case 'chat':     return <Chat onSignOut={signOut} />;
    case 'map':
    default:         return <Home onSignOut={signOut} />;
  }
}

export default App;