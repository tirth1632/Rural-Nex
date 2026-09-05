import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18n from '../i18n';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  profile?: {
    preferred_language: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, refresh: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Fetch user profile
      fetch('/api/v1/auth/me/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch user');
      })
      .then((userData: User) => {
        setUser(userData);
        if (userData.profile?.preferred_language) {
            i18n.changeLanguage(userData.profile.preferred_language);
        }
      })
      .catch(() => {
        logout();
      })
      .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    setToken(accessToken);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
