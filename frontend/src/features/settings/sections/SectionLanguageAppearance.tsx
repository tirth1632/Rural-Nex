import React from 'react';
import { useSettings } from '../SettingsContext';
import { SegmentedControl } from '../components/SegmentedControl';
import { Globe, Sun, Moon, Monitor } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
];

export const SectionLanguageAppearance: React.FC = () => {
  const { draftSettings, updateDraft } = useSettings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Language & Appearance</h2>
        <p className="text-xs text-gray-500 mt-1">Manage interface language and theme.</p>
      </div>

      <div className="p-6 bg-white border border-gray-200 rounded-xl space-y-6 shadow-2xs">
        {/* Language Selection */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
            <Globe size={14} className="text-primary" />
            Interface Language
          </label>
          <select
            value={draftSettings.interfaceLanguage}
            onChange={e => updateDraft('interfaceLanguage', e.target.value)}
            className="w-full sm:w-80 px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-white"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
          <span className="text-[11px] text-gray-400 mt-1 block">
            Translates core navigation and UI components across RuralNex.
          </span>
        </div>

        {/* Theme Selector */}
        <div className="pt-4 border-t border-gray-100">
          <SegmentedControl
            label="Theme"
            description="Choose your preferred color theme for the RuralNex dashboard."
            options={['Light', 'Dark', 'OLED']}
            value={draftSettings.theme}
            onChange={val => updateDraft('theme', val as any)}
          />
        </div>
      </div>

    </div>
  );
};
