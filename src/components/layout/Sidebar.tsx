import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  BarChart3,
  Map,
  Users2,
  Landmark,
  Calculator,
  Bot,
  FileText,
  ShieldCheck,
  Bell,
  HelpCircle,
  Settings,
  UserCheck,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  userRole: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'business-input', label: 'Business Analysis', icon: FileSpreadsheet },
    { id: 'market-analysis', label: 'Market Analysis', icon: BarChart3 },
    { id: 'gis-map', label: 'Map / GIS', icon: Map },
    { id: 'competitors', label: 'Competitors', icon: Users2 },
    { id: 'schemes', label: 'Government Schemes', icon: Landmark },
    { id: 'finance', label: 'Financial Calculator', icon: Calculator },
    { id: 'ai-advisor', label: 'AI Advisor', icon: Bot },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  if (userRole === 'admin' || userRole === 'analyst') {
    navItems.push({ id: 'admin', label: 'Admin Panel', icon: ShieldCheck });
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:static top-0 left-0 z-40 h-full w-60 bg-slate-900 text-slate-200 flex flex-col justify-between transition-transform duration-200 border-r border-slate-800 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 px-4 flex items-center border-b border-slate-800 bg-slate-950">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-gov-800 flex items-center justify-center text-white font-bold text-base shadow-sm border border-gov-700">
                GU
              </div>
              <div>
                <div className="font-bold text-sm text-white tracking-tight leading-none">
                  GramUdyog
                </div>
                <div className="text-[10px] text-emerald-400 font-medium tracking-wide uppercase mt-0.5">
                  Decision Support System
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-14rem)]">
            <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Core Applications
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded transition-colors ${
                    isActive
                      ? 'bg-gov-800 text-white font-semibold shadow-subtle border border-gov-700'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Nav */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 space-y-1">
          <button
            onClick={() => onSelectTab('notifications')}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded"
          >
            <span className="flex items-center gap-2">
              <Bell className="w-3.5 h-3.5" /> Notifications
            </span>
            <span className="bg-emerald-800 text-emerald-200 text-[10px] px-1.5 py-0.2 rounded font-bold">2</span>
          </button>
          <button
            onClick={() => onSelectTab('help')}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Help & Support
          </button>
          <button
            onClick={() => onSelectTab('settings')}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded"
          >
            <Settings className="w-3.5 h-3.5" /> Platform Settings
          </button>
          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2.5 px-2">
            <div className="w-7 h-7 rounded bg-slate-700 text-slate-200 font-semibold flex items-center justify-center text-xs">
              RK
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-semibold text-white truncate">Ramesh Kumar</div>
              <div className="text-[10px] text-slate-400 truncate capitalize">{userRole} • Karnal</div>
            </div>
            <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
};
