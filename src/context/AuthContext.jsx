import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { loginRequest, registerRequest } from '../api/auth.js';
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

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [token, user, login, register, logout],
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
