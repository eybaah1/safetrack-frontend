import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authAPI from '../api/auth';
import { setTokens, clearTokens, getTokens } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ── Load user on mount ───────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { access } = getTokens();
      if (!access) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await authAPI.getMe();
        setUser(data);
        setIsAuthenticated(true);

        // Sync localStorage flags
        localStorage.setItem('safetrack_auth', 'true');
        localStorage.setItem('safetrack_userType', data.user_role);
      } catch {
        clearTokens();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // ── Sign In ──────────────────────────────────────────
  const signIn = useCallback(async ({ userType, identifier, password }) => {
    const { data } = await authAPI.login({
      user_type: userType,
      identifier,
      password,
    });

    setTokens(data.tokens.access, data.tokens.refresh);
    setUser(data.user);
    setIsAuthenticated(true);

    localStorage.setItem('safetrack_auth', 'true');
    localStorage.setItem('safetrack_userType', data.user.user_role);
    localStorage.setItem('safetrack_user', JSON.stringify(data.user));

    return data;
  }, []);

  // ── Sign Up ──────────────────────────────────────────
  const signUp = useCallback(async (formData) => {
    const { data } = await authAPI.signup(formData);

    // If student (auto-approved), save tokens
    if (data.tokens) {
      setTokens(data.tokens.access, data.tokens.refresh);
      setUser(data.user);
      setIsAuthenticated(true);

      localStorage.setItem('safetrack_auth', 'true');
      localStorage.setItem('safetrack_userType', data.user.user_role);
    }

    return data;
  }, []);

  // ── Sign Out ─────────────────────────────────────────
  const signOut = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore
    }
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
    window.location.hash = 'signin';
  }, []);

  // ── Refresh user data ────────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authAPI.getMe();
      setUser(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    userType: user?.user_role || localStorage.getItem('safetrack_userType') || 'student',
    signIn,
    signUp,
    signOut,
    refreshUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;