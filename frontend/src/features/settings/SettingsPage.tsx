import React, { useState } from 'react';
import { useSettings } from './SettingsContext';
import { SettingsSidebar } from './SettingsSidebar';
import type { SettingsSectionId } from './SettingsSidebar';

import { SectionProfile } from './sections/SectionProfile';
import { SectionSecurity } from './sections/SectionSecurity';
import { SectionNotifications } from './sections/SectionNotifications';
import { SectionBusinessPreferences } from './sections/SectionBusinessPreferences';
import { SectionDefaultLocation } from './sections/SectionDefaultLocation';
import { SectionFinancialPreferences } from './sections/SectionFinancialPreferences';
import { SectionAiAdvisor } from './sections/SectionAiAdvisor';
import { SectionDataPrivacy } from './sections/SectionDataPrivacy';
import { SectionLanguageAppearance } from './sections/SectionLanguageAppearance';
import { SectionCurrencyUnits } from './sections/SectionCurrencyUnits';
import { SectionAbout } from './sections/SectionAbout';
import { ToastNotification } from './components/ToastNotification';

const SettingsContent: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SettingsSectionId>('profile');
  const { toastMessage, setToastMessage } = useSettings();

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return <SectionProfile />;
      case 'security':
        return <SectionSecurity />;
      case 'notifications':
        return <SectionNotifications />;
      case 'business-preferences':
        return <SectionBusinessPreferences />;
      case 'default-location':
        return <SectionDefaultLocation />;
      case 'financial-preferences':
        return <SectionFinancialPreferences />;
      case 'ai-advisor':
        return <SectionAiAdvisor />;
      case 'data-privacy':
        return <SectionDataPrivacy />;
      case 'language-appearance':
        return <SectionLanguageAppearance />;
      case 'currency-units':
        return <SectionCurrencyUnits />;
      case 'about':
        return <SectionAbout />;
      default:
        return <SectionProfile />;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1020px] mx-auto space-y-6 pb-24">
      {/* Page Header */}
      <div className="border-b border-gray-200/80 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-xs text-gray-500 mt-1">
          Manage your RuralNex account, business preferences, AI preferences, and application settings.
        </p>
      </div>

      {/* Main Layout Grid */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <SettingsSidebar activeSection={activeSection} onSelectSection={setActiveSection} />
        
        <main className="flex-1 w-full min-w-0">
          {renderSection()}
        </main>
      </div>

      {/* Toast Notification */}
      <ToastNotification message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
};

export default function SettingsPage() {
  return <SettingsContent />;
}
