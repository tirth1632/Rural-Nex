import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  User,
  ShieldCheck,
  Bell,
  Briefcase,
  MapPin,
  TrendingUp,
  Sparkles,
  Database,
  Globe,
  Coins,
  Info,
} from 'lucide-react';

export type SettingsSectionId =
  | 'profile'
  | 'security'
  | 'notifications'
  | 'business-preferences'
  | 'default-location'
  | 'financial-preferences'
  | 'ai-advisor'
  | 'data-privacy'
  | 'language-appearance'
  | 'currency-units'
  | 'about';

interface NavGroup {
  titleKey: string;
  defaultTitle: string;
  items: {
    id: SettingsSectionId;
    labelKey: string;
    defaultLabel: string;
    icon: React.ElementType;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    titleKey: 'settings_group_account',
    defaultTitle: 'ACCOUNT',
    items: [
      { id: 'profile', labelKey: 'settings_nav_profile', defaultLabel: 'Profile', icon: User },
      { id: 'security', labelKey: 'settings_nav_security', defaultLabel: 'Security', icon: ShieldCheck },
      { id: 'notifications', labelKey: 'settings_nav_notifications', defaultLabel: 'Notifications', icon: Bell },
    ],
  },
  {
    titleKey: 'settings_group_business',
    defaultTitle: 'BUSINESS',
    items: [
      { id: 'business-preferences', labelKey: 'settings_nav_business', defaultLabel: 'Business Preferences', icon: Briefcase },
      { id: 'default-location', labelKey: 'settings_nav_location', defaultLabel: 'Default Location', icon: MapPin },
      { id: 'financial-preferences', labelKey: 'settings_nav_financial', defaultLabel: 'Financial Preferences', icon: TrendingUp },
    ],
  },
  {
    titleKey: 'settings_group_ai',
    defaultTitle: 'AI & DATA',
    items: [
      { id: 'ai-advisor', labelKey: 'settings_nav_ai', defaultLabel: 'AI Advisor', icon: Sparkles },
      { id: 'data-privacy', labelKey: 'settings_nav_privacy', defaultLabel: 'Data & Privacy', icon: Database },
    ],
  },
  {
    titleKey: 'settings_group_app',
    defaultTitle: 'APPLICATION',
    items: [
      { id: 'language-appearance', labelKey: 'settings_nav_appearance', defaultLabel: 'Language & Appearance', icon: Globe },
      { id: 'currency-units', labelKey: 'settings_nav_currency', defaultLabel: 'Currency & Units', icon: Coins },
      { id: 'about', labelKey: 'settings_nav_about', defaultLabel: 'About RuralNex', icon: Info },
    ],
  },
];

interface SettingsSidebarProps {
  activeSection: SettingsSectionId;
  onSelectSection: (id: SettingsSectionId) => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ activeSection, onSelectSection }) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Desktop Vertical Sidebar Navigation */}
      <nav className="hidden md:block w-64 lg:w-72 shrink-0 space-y-5">
        {NAV_GROUPS.map((group, groupIdx) => (
          <div key={group.defaultTitle} className={groupIdx > 0 ? 'pt-4 border-t border-gray-200/80 dark:border-zinc-800/80' : ''}>
            <h4 className="px-3.5 text-xs font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
              {t(group.titleKey, group.defaultTitle)}
            </h4>
            <div className="space-y-1">
              {group.items.map(item => {
                const isActive = activeSection === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all text-left cursor-pointer ${
                      isActive
                        ? 'settings-nav-active shadow-sm font-bold scale-[1.01]'
                        : 'settings-nav-inactive font-medium hover:scale-[1.005]'
                    }`}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span>{t(item.labelKey, item.defaultLabel)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Mobile Header Selector */}
      <div className="md:hidden w-full pb-3 border-b border-gray-200 mb-4">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          {t('settings_select_section', 'Select Settings Section')}
        </label>
        <select
          value={activeSection}
          onChange={e => onSelectSection(e.target.value as SettingsSectionId)}
          className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white text-sm font-semibold rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          {NAV_GROUPS.map(group => (
            <optgroup key={group.defaultTitle} label={t(group.titleKey, group.defaultTitle)}>
              {group.items.map(item => (
                <option key={item.id} value={item.id}>
                  {t(item.labelKey, item.defaultLabel)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    </>
  );
};
