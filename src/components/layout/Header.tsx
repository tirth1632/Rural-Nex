import React from 'react';
import { Menu, Search, Globe, Shield, Bell, ChevronRight } from 'lucide-react';
import type { UserRole } from '../../types';

interface HeaderProps {
  onToggleMobile: () => void;
  currentTab: string;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  selectedLang: string;
  onChangeLang: (lang: string) => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobile,
  currentTab,
  userRole,
  onChangeRole,
  selectedLang,
  onChangeLang,
  onOpenAuth,
}) => {
  const formatTabTitle = (tab: string) => {
    return tab
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'HI', name: 'हिंदी' },
    { code: 'PB', name: 'ਪੰਜਾਬੀ' },
    { code: 'MR', name: 'मराठी' },
    { code: 'GU', name: 'ગુજરાતી' },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shadow-subtle z-30 sticky top-0">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="hidden sm:inline">GramUdyog</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
          <span className="font-semibold text-slate-800">{formatTabTitle(currentTab)}</span>
        </div>
      </div>

      {/* Center: Search input */}
      <div className="hidden lg:flex items-center max-w-md w-full mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search schemes, business types, districts (e.g. Dairy, PMEGP, Karnal)..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-gov-800 text-slate-800"
          />
        </div>
      </div>

      {/* Right: Controls (Role, Language, Auth) */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Language selector */}
        <div className="relative flex items-center">
          <Globe className="w-3.5 h-3.5 text-slate-500 absolute left-2 pointer-events-none" />
          <select
            value={selectedLang}
            onChange={(e) => onChangeLang(e.target.value)}
            className="pl-7 pr-3 py-1 text-xs bg-slate-50 border border-slate-300 rounded text-slate-700 font-medium focus:outline-none focus:border-gov-800"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Role Switcher Badge */}
        <div className="hidden sm:flex items-center bg-slate-100 border border-slate-200 rounded p-0.5">
          <Shield className="w-3.5 h-3.5 text-gov-800 ml-1.5" />
          <select
            value={userRole}
            onChange={(e) => onChangeRole(e.target.value as UserRole)}
            className="bg-transparent text-xs font-semibold text-slate-800 px-2 py-0.5 focus:outline-none cursor-pointer capitalize"
          >
            <option value="entrepreneur">Entrepreneur</option>
            <option value="analyst">Analyst</option>
            <option value="admin">Nodal Officer (Admin)</option>
          </select>
        </div>

        {/* Notification Icon */}
        <button className="p-1.5 rounded hover:bg-slate-100 text-slate-600 relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 bg-emerald-600 rounded-full absolute top-1 right-1" />
        </button>

        {/* Auth Button */}
        <button
          onClick={onOpenAuth}
          className="px-3 py-1.5 bg-gov-800 hover:bg-gov-900 text-white rounded text-xs font-semibold shadow-sm transition-colors"
        >
          Sign In / Register
        </button>
      </div>
    </header>
  );
};
