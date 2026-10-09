import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // checking session on mount

  // Attempt to restore session from httpOnly cookie / token
  useEffect(() => {
    authApi.getMe()
      .then((res) => setUser(res.data.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Listen for silent-refresh failures (logged out by interceptor)
  useEffect(() => {
    const handle = () => {
      localStorage.removeItem('token');
      setUser(null);
    };
    window.addEventListener('auth:logout', handle);
    return () => window.removeEventListener('auth:logout', handle);
  }, []);

  const loginWithOtp = useCallback(async ({ email, otp }) => {
    const res = await authApi.loginOtp({ email, otp });
    if (res.data.data?.accessToken) {
      localStorage.setItem('token', res.data.data.accessToken);
    }
    setUser(res.data.data.user);
    return res.data.data.user;
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials);
    if (res.data.data?.accessToken) {
      localStorage.setItem('token', res.data.data.accessToken);
    }
    setUser(res.data.data.user);
    return res.data.data.user;
  }, []);

  // Registration ONLY registers without direct login
  const register = useCallback(async (data) => {
    const res = await authApi.register(data);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {});
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithOtp,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
