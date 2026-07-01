import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  getUserByTokenRequest,
  loginRequest,
  registerRequest,
  updateProfileRequest,
} from '../api/auth.js';
import { clearAuth, getStoredUser, getToken, storeAuth } from '../api/authToken.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken());
  const [user, setUser] = useState(() => getStoredUser());

  const login = useCallback(async ({ email, password }) => {
    const data = await loginRequest({ email, password });
    storeAuth(data.token, data.user);
    setToken(data.token);
    setUser(data.user || null);
    return data;
  }, []);

  const register = useCallback(
    async ({ name, email, password }) => {
      const data = await registerRequest({ name, email, password });

      // If register already returns a token, use it; otherwise log in.
      if (data.token) {
        storeAuth(data.token, data.user);
        setToken(data.token);
        setUser(data.user || null);
        return data;
      }

      return login({ email, password });
    },
    [login],
  );

  const logout = useCallback(() => {
    clearAuth();
    setToken(null);
    setUser(null);
  }, []);

  // Update name/email via the API and keep the stored user in sync.
  const updateProfile = useCallback(async ({ name, email }) => {
    const data = await updateProfileRequest({ name, email });
    const nextUser = data.user || data.data || { ...user, name, email };
    storeAuth(undefined, nextUser);
    setUser(nextUser);
    return nextUser;
  }, [user]);

  // On load (and after a refresh), confirm the token is still valid and pull the
  // latest user via get-user-by-token. If the token is dead, log out cleanly.
  useEffect(() => {
    if (!token) return undefined;

    let cancelled = false;
    getUserByTokenRequest()
      .then((data) => {
        if (cancelled) return;
        const freshUser = data.user || data.data;
        if (freshUser) {
          storeAuth(undefined, freshUser);
          setUser(freshUser);
        }
      })
      .catch(() => {
        if (!cancelled) logout();
      });

    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
      updateProfile,
    }),
    [token, user, login, register, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
