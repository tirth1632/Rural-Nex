import React from 'react';
import { LayoutDashboard, Map, Calculator, Bot, FileSpreadsheet } from 'lucide-react';

interface MobileNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onSelectTab }) => {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'business-input', label: 'Evaluate', icon: FileSpreadsheet },
    { id: 'gis-map', label: 'GIS Map', icon: Map },
    { id: 'finance', label: 'EMI Calc', icon: Calculator },
    { id: 'ai-advisor', label: 'AI Advisor', icon: Bot },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-slate-900 border-t border-slate-800 text-slate-300 flex items-center justify-around z-40 px-2">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center w-full h-full py-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4 mb-0.5" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
