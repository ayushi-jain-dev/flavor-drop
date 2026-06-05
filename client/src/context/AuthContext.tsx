import axios from 'axios';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import api, { setAuthToken } from '../api/client';
import type { AuthResponse, AuthUser } from '../types/auth';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
};

const authTokenKey = 'food-delivery-token';
const authUserKey = 'food-delivery-user';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readStoredUser = () => {
  const raw = window.localStorage.getItem(authUserKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => window.localStorage.getItem(authTokenKey));
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      if (!token) {
        setAuthToken(null);
        if (active) {
          setLoading(false);
        }
        return;
      }

      setAuthToken(token);

      try {
        const { data } = await api.get<{ user: AuthUser }>('/auth/me');
        if (!active) {
          return;
        }

        setUser(data.user);
        window.localStorage.setItem(authUserKey, JSON.stringify(data.user));
      } catch {
        if (!active) {
          return;
        }

        window.localStorage.removeItem(authTokenKey);
        window.localStorage.removeItem(authUserKey);
        setAuthToken(null);
        setToken(null);
        setUser(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, [token]);

  const storeSession = (data: AuthResponse) => {
    window.localStorage.setItem(authTokenKey, data.token);
    window.localStorage.setItem(authUserKey, JSON.stringify(data.user));
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
      storeSession(data);
      return data.user;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message ?? 'Unable to log in');
      }

      throw new Error('Unable to log in');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password });
      storeSession(data);
      return data.user;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message ?? 'Unable to create account');
      }

      throw new Error('Unable to create account');
    }
  };

  const logout = () => {
    window.localStorage.removeItem(authTokenKey);
    window.localStorage.removeItem(authUserKey);
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return value;
}
