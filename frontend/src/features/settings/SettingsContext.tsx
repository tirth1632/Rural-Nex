import { apiFetch } from '../../api/apiFetch';
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import i18n from '../../i18n';

export interface UserProfileSettings {
  // Profile
  fullName: string;
  email: string;
  phoneNumber: string;
  phoneVerified: boolean;
  accountType: 'Entrepreneur' | 'Business Owner' | 'Student' | 'Advisor';
  avatarUrl?: string;

  // Security
  twoFactorEnabled: boolean;

  // Notifications
  emailNotifications: boolean;
  inAppNotifications: boolean;
  assessmentCompletedNotif: boolean;
  reportGeneratedNotif: boolean;
  marketDataNotif: boolean;
  competitorUpdatesNotif: boolean;
  financeAlertsNotif: boolean;
  aiRecommendationsNotif: boolean;

  // Business Preferences
  defaultCategory: string;
  defaultBusinessType: string;
  preferredBusinessSize: string;
  riskPreference: 'Low' | 'Medium' | 'High';
  defaultInvestmentRange: string;
  businessExperience: 'Beginner' | 'Some Experience' | 'Experienced';
  preferredRevenueModel: 'Product Sales' | 'Services' | 'Mixed' | 'Not Specified';

  // Default Location
  state: string;
  district: string;
  block: string;
  village: string;
  pinCode: string;

  // Financial Preferences
  currency: string;
  numberFormat: 'Indian' | 'Standard';
  defaultInterestRate: number;
  defaultLoanTenureYears: number;
  defaultInflationRate: number;
  preferredFinancialView: 'Monthly' | 'Yearly';
  includeGst: boolean;
  showConservativeEstimates: boolean;

  // AI Advisor
  aiLanguage: string;
  aiDetailLevel: 'Simple' | 'Balanced' | 'Detailed';
  aiMarketInfo: boolean;
  aiFinancialAnalysis: boolean;
  aiGovtSchemes: boolean;
  aiRiskWarnings: boolean;
  aiCompetitorInfo: boolean;

  // Data & Privacy
  allowAnonymizedUsageData: boolean;

  // Language & Appearance
  interfaceLanguage: string;
  theme: 'Light' | 'Dark';
  sidebarDensity: 'Comfortable' | 'Compact';

  // Currency & Units
  areaUnit: 'Acre' | 'Hectare' | 'Bigha' | 'Sq. Ft.';
  distanceUnit: 'Kilometers (km)' | 'Miles (mi)';
  weightUnit: 'Kilograms (kg)' | 'Tonnes (t)' | 'Quintal (q)';
}

const defaultSettings: UserProfileSettings = {
  fullName: 'Tirth Patel',
  email: 'tirthpatel1632@gmail.com',
  phoneNumber: '',
  phoneVerified: false,
  accountType: 'Entrepreneur',
  avatarUrl: '',

  twoFactorEnabled: false,

  emailNotifications: true,
  inAppNotifications: true,
  assessmentCompletedNotif: true,
  reportGeneratedNotif: true,
  marketDataNotif: true,
  competitorUpdatesNotif: true,
  financeAlertsNotif: true,
  aiRecommendationsNotif: true,

  defaultCategory: 'Agriculture',
  defaultBusinessType: 'Crop Farming',
  preferredBusinessSize: 'Small (Micro Unit / Cottage)',
  riskPreference: 'Medium',
  defaultInvestmentRange: '₹5–10 lakh',
  businessExperience: 'Beginner',
  preferredRevenueModel: 'Not Specified',

  state: 'Gujarat',
  district: 'Anand',
  block: 'Anand Rural',
  village: 'Mogri',
  pinCode: '388345',

  currency: '₹ INR',
  numberFormat: 'Indian',
  defaultInterestRate: 8.5,
  defaultLoanTenureYears: 5,
  defaultInflationRate: 5.0,
  preferredFinancialView: 'Yearly',
  includeGst: true,
  showConservativeEstimates: true,

  aiLanguage: 'English',
  aiDetailLevel: 'Balanced',
  aiMarketInfo: true,
  aiFinancialAnalysis: true,
  aiGovtSchemes: true,
  aiRiskWarnings: true,
  aiCompetitorInfo: true,

  allowAnonymizedUsageData: true,

  interfaceLanguage: 'en',
  theme: 'Light',
  sidebarDensity: 'Comfortable',

  areaUnit: 'Acre',
  distanceUnit: 'Kilometers (km)',
  weightUnit: 'Kilograms (kg)',
};

interface SettingsContextType {
  settings: UserProfileSettings;
  draftSettings: UserProfileSettings;
  updateDraft: <K extends keyof UserProfileSettings>(key: K, value: UserProfileSettings[K]) => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
  saveChanges: () => void;
  cancelChanges: () => void;
  hasUnsavedChanges: boolean;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
  assessmentCount: number;
  savedBusinessCount: number;
  clearAssessmentHistory: () => void;
  deleteAllSavedData: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const [settings, setSettings] = useState<UserProfileSettings>(() => {
    const saved = localStorage.getItem('ruralnex_user_settings');
    const savedTheme = localStorage.getItem('ruralnex_theme');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.phoneNumber === '+91 XXXXX XXXXX' || parsed.phoneNumber === '+91 98765 43210') {
          parsed.phoneNumber = '';
        }
        // Normalize any old OLED theme to Dark
        if (parsed.theme === 'OLED') parsed.theme = 'Dark';
        if (savedTheme === 'OLED') localStorage.setItem('ruralnex_theme', 'Dark');
        return { ...defaultSettings, ...parsed, ...(savedTheme ? { theme: savedTheme === 'Dark' ? 'Dark' : 'Light' } : {}) };
      } catch (e) {
        // fallback
      }
    }
    return defaultSettings;
  });

  const [draftSettings, setDraftSettings] = useState<UserProfileSettings>(settings);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [assessmentCount, setAssessmentCount] = useState<number>(12);
  const [savedBusinessCount, setSavedBusinessCount] = useState<number>(4);

  useEffect(() => {
    if (user) {
      const name = user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username;
      const initialSettings: Partial<UserProfileSettings> = {
        fullName: name || settings.fullName,
        email: user.email || settings.email,
        phoneNumber: user.phone_number || (settings.phoneNumber === '+91 XXXXX XXXXX' ? '' : settings.phoneNumber),
        avatarUrl: user.profile?.avatar_url || '',
        interfaceLanguage: user.profile?.preferred_language || settings.interfaceLanguage,
      };

      setSettings(prev => {
        const updated = { ...prev, ...initialSettings };
        localStorage.setItem('ruralnex_user_settings', JSON.stringify(updated));
        return updated;
      });

      setDraftSettings(prev => ({ ...prev, ...initialSettings }));
    }
  }, [user]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark', 'theme-oled', 'dark');
    if (draftSettings.theme === 'Dark') {
      root.classList.add('theme-dark', 'dark');
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('ruralnex_theme', 'Dark');
    } else {
      root.classList.add('theme-light');
      root.setAttribute('data-theme', 'light');
      localStorage.setItem('ruralnex_theme', 'Light');
    }
  }, [draftSettings.theme]);

  const toggleTheme = () => {
    const nextTheme: 'Light' | 'Dark' = draftSettings.theme === 'Dark' ? 'Light' : 'Dark';
    updateDraft('theme', nextTheme);
  };

  const isDarkMode = draftSettings.theme === 'Dark';

  const updateDraft = <K extends keyof UserProfileSettings>(key: K, value: UserProfileSettings[K]) => {
    setDraftSettings(prev => {
      const updated = { ...prev, [key]: value };
      setSettings(updated);
      localStorage.setItem('ruralnex_user_settings', JSON.stringify(updated));
      return updated;
    });

    if (key === 'interfaceLanguage' && typeof value === 'string' && value !== i18n.language) {
      i18n.changeLanguage(value);
    }

    setToastMessage('Changes saved');
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  const hasUnsavedChanges = JSON.stringify(settings) !== JSON.stringify(draftSettings);

  const saveChanges = async () => {
    setSettings(draftSettings);
    localStorage.setItem('ruralnex_user_settings', JSON.stringify(draftSettings));

    // Save to backend database
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await apiFetch('/api/v1/auth/profile/', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          avatar_url: draftSettings.avatarUrl || '',
          phone_verified: draftSettings.phoneVerified,
          preferred_language: draftSettings.interfaceLanguage || 'en',
        }),
      });
    } catch (e) {
      // fallback
    }

    if (draftSettings.interfaceLanguage && draftSettings.interfaceLanguage !== i18n.language) {
      i18n.changeLanguage(draftSettings.interfaceLanguage);
    }

    setToastMessage('Changes saved successfully.');
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const cancelChanges = () => {
    setDraftSettings(settings);
  };

  const clearAssessmentHistory = () => {
    setAssessmentCount(0);
    setToastMessage('Assessment history cleared successfully.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const deleteAllSavedData = () => {
    setAssessmentCount(0);
    setSavedBusinessCount(0);
    setToastMessage('All saved data deleted successfully.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        draftSettings,
        updateDraft,
        toggleTheme,
        isDarkMode,
        saveChanges,
        cancelChanges,
        hasUnsavedChanges,
        toastMessage,
        setToastMessage,
        assessmentCount,
        savedBusinessCount,
        clearAssessmentHistory,
        deleteAllSavedData,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
