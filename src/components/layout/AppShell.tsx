import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { AuthModal } from '../auth/AuthModal';
import type { UserRole } from '../../types';

interface AppShellProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  onChangeRole,
  children,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('EN');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans text-slate-800 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        userRole={userRole}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Top Header */}
        <Header
          onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
          currentTab={currentTab}
          userRole={userRole}
          onChangeRole={onChangeRole}
          selectedLang={selectedLang}
          onChangeLang={setSelectedLang}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        {/* View Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Bar */}
      <MobileNav currentTab={currentTab} onSelectTab={onSelectTab} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(role) => onChangeRole(role)}
      />
    </div>
  );
};
