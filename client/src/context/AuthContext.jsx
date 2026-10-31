import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Access token lives in memory only — never localStorage
  const [token, setToken]     = useState(null);
  const [user, setUser]       = useState(null);
  // true while the initial /auth/refresh is in flight
  const [loading, setLoading] = useState(true);

  // Expose a stable ref so the axios interceptor can read the latest token
  // without re-subscribing to state changes
  const tokenRef = useRef(null);
  tokenRef.current = token;

  /** Store a new session */
  const setSession = useCallback((accessToken, userData) => {
    setToken(accessToken);
    setUser(userData);
    tokenRef.current = accessToken;
  }, []);

  /** Clear session (logout) */
  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    tokenRef.current = null;
  }, []);

  /** POST /auth/login → store session */
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setSession(data.data.accessToken, data.data.user);
    return data.data.user;
  }, [setSession]);

  /** POST /auth/register → store session */
  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    setSession(data.data.accessToken, data.data.user);
    return data.data.user;
  }, [setSession]);

  /** POST /auth/logout → clear session + cookie */
  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch (_) { /* ignore */ }
    clearSession();
  }, [clearSession]);

  /**
   * POST /auth/refresh — call once on app load to restore session from
   * the httpOnly refresh-token cookie.
   */
  const refresh = useCallback(async () => {
    try {
      const { data } = await api.post('/auth/refresh');
      setSession(data.data.accessToken, data.data.user || user);
      return data.data.accessToken;
    } catch (_) {
      clearSession();
      return null;
    }
  }, [setSession, clearSession]);

  /* Restore session on mount */
  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    user,
    token,
    tokenRef,     // for the axios interceptor
    loading,
    login,
    register,
    logout,
    refresh,
    setSession,
    clearSession,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;
