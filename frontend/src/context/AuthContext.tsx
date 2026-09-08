import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import i18n from '../i18n';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  role: string;
  profile?: {
    avatar_url?: string;
    face_verified?: boolean;
    face_data?: string;
    preferred_language?: string;
    entrepreneur_type?: string;
    experience?: string;
    own_capital?: number | string;
    business_interest?: string;
    default_state?: string | number;
    default_district?: string | number;
    default_block?: string;
    default_village?: string;
  };
}


interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, refresh: string) => Promise<User | null>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState(true);

  const DEMO_USER: User = {
    id: 1,
    username: 'demouser',
    email: 'demo@ruralnex.org',
    first_name: 'Demo',
    last_name: 'User',
    role: 'BENEFICIARY',
    profile: {
      preferred_language: 'en',
      face_verified: true,
      avatar_url: '',
    }
  };

  useEffect(() => {
    if (token) {
      if (token.startsWith('demo_')) {
        setUser(DEMO_USER);
        setIsLoading(false);
        return;
      }
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

  const login = async (accessToken: string, refreshToken: string): Promise<User | null> => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    setToken(accessToken);

    if (accessToken.startsWith('demo_')) {
      setUser(DEMO_USER);
      setIsLoading(false);
      return DEMO_USER;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/auth/me/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (res.ok) {
        const userData: User = await res.json();
        setUser(userData);
        if (userData.profile?.preferred_language) {
          i18n.changeLanguage(userData.profile.preferred_language);
        }
        return userData;
      }
    } catch (err) {
      console.error('Failed to fetch user on login:', err);
    } finally {
      setIsLoading(false);
    }
    return null;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        ...updatedUser,
        profile: {
          ...prev.profile,
          ...updatedUser.profile,
        },
      };
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isLoading }}>
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
