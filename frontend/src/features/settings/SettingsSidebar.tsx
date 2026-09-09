import React from 'react';
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
  title: string;
  items: {
    id: SettingsSectionId;
    label: string;
    icon: React.ElementType;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'ACCOUNT',
    items: [
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'security', label: 'Security', icon: ShieldCheck },
      { id: 'notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    title: 'BUSINESS',
    items: [
      { id: 'business-preferences', label: 'Business Preferences', icon: Briefcase },
      { id: 'default-location', label: 'Default Location', icon: MapPin },
      { id: 'financial-preferences', label: 'Financial Preferences', icon: TrendingUp },
    ],
  },
  {
    title: 'AI & DATA',
    items: [
      { id: 'ai-advisor', label: 'AI Advisor', icon: Sparkles },
      { id: 'data-privacy', label: 'Data & Privacy', icon: Database },
    ],
  },
  {
    title: 'APPLICATION',
    items: [
      { id: 'language-appearance', label: 'Language & Appearance', icon: Globe },
      { id: 'currency-units', label: 'Currency & Units', icon: Coins },
      { id: 'about', label: 'About RuralNex', icon: Info },
    ],
  },
];

interface SettingsSidebarProps {
  activeSection: SettingsSectionId;
  onSelectSection: (id: SettingsSectionId) => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ activeSection, onSelectSection }) => {
  return (
    <>
      {/* Desktop Vertical Sidebar Navigation */}
      <nav className="hidden md:block w-64 lg:w-72 shrink-0 space-y-5">
        {NAV_GROUPS.map((group, groupIdx) => (
          <div key={group.title} className={groupIdx > 0 ? 'pt-4 border-t border-gray-200/80 dark:border-zinc-800/80' : ''}>
            <h4 className="px-3.5 text-xs font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
              {group.title}
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
                    <span>{item.label}</span>
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
          Select Settings Section
        </label>
        <select
          value={activeSection}
          onChange={e => onSelectSection(e.target.value as SettingsSectionId)}
          className="w-full bg-white border border-gray-300 text-gray-900 text-sm font-semibold rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          {NAV_GROUPS.map(group => (
            <optgroup key={group.title} label={group.title}>
              {group.items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    </>
  );
};
