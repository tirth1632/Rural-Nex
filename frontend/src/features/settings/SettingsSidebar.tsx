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
      {/* Desktop Compact Vertical Sidebar Navigation */}
      <nav className="hidden md:block w-56 shrink-0 space-y-4">
        {NAV_GROUPS.map((group, groupIdx) => (
          <div key={group.title} className={groupIdx > 0 ? 'pt-3 border-t border-gray-200/70' : ''}>
            <h4 className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              {group.title}
            </h4>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const isActive = activeSection === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectSection(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors text-left ${
                      isActive
                        ? 'settings-nav-active shadow-2xs font-bold'
                        : 'settings-nav-inactive font-medium'
                    }`}
                  >
                    <Icon size={15} className="shrink-0" />
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
