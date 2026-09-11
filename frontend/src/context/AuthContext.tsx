import { apiFetch } from '../api/apiFetch';
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
  login: (token: string, refresh: string, customUser?: Partial<User>) => Promise<User | null>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_PROFILE_STORAGE_KEY = 'ruralnex_google_user';

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

  const getSavedProfile = (): User | null => {
    try {
      const raw = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (token) {
      const savedUser = getSavedProfile();

      if (token.startsWith('demo_')) {
        if (savedUser) {
          setUser(savedUser);
          if (savedUser.profile?.preferred_language) {
            i18n.changeLanguage(savedUser.profile.preferred_language);
          }
        } else {
          setUser(DEMO_USER);
        }
        setIsLoading(false);
        return;
      }

      // Fetch user profile from backend
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
        const merged = savedUser 
          ? { ...savedUser, ...userData, profile: { ...savedUser.profile, ...userData.profile } } 
          : userData;
        setUser(merged);
        localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(merged));
        if (merged.profile?.preferred_language) {
            i18n.changeLanguage(merged.profile.preferred_language);
        }
      })
      .catch(() => {
        if (savedUser) {
          setUser(savedUser);
        } else {
          logout();
        }
      })
      .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (accessToken: string, refreshToken: string, customUser?: Partial<User>): Promise<User | null> => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    setToken(accessToken);

    if (customUser) {
      const mergedUser: User = {
        id: customUser.id || 1,
        username: customUser.username || 'user',
        email: customUser.email || '',
        first_name: customUser.first_name || '',
        last_name: customUser.last_name || '',
        role: customUser.role || 'BENEFICIARY',
        profile: {
          avatar_url: customUser.profile?.avatar_url || '',
          preferred_language: customUser.profile?.preferred_language || 'en',
          face_verified: true,
          ...customUser.profile,
        }
      };
      setUser(mergedUser);
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(mergedUser));
      setIsLoading(false);
      return mergedUser;
    }

    if (accessToken.startsWith('demo_')) {
      const savedUser = getSavedProfile();
      const activeUser = savedUser || DEMO_USER;
      setUser(activeUser);
      setIsLoading(false);
      return activeUser;
    }

    setIsLoading(true);

    try {
      const res = await apiFetch('/api/v1/auth/me/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (res.ok) {
        const userData: User = await res.json();
        setUser(userData);
        localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(userData));
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
    localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated: User = {
        ...prev,
        ...updatedUser,
        profile: {
          ...prev.profile,
          ...updatedUser.profile,
        },
      };
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(updated));
      return updated;
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
