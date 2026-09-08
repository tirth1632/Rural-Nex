import React from 'react';
import { useSettings } from '../SettingsContext';
import { Globe, Sun, Moon, Check } from 'lucide-react';

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
        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Language & Appearance</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage interface language and color theme (Light or Dark).</p>
      </div>

      <div className="p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl space-y-8 shadow-2xs">
        {/* Language Selection */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
            <Globe size={14} className="text-primary" />
            Interface Language
          </label>
          <select
            value={draftSettings.interfaceLanguage}
            onChange={e => updateDraft('interfaceLanguage', e.target.value)}
            className="w-full sm:w-80 px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-white dark:bg-slate-800"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
          <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 block">
            Translates core navigation and UI components across RuralNex.
          </span>
        </div>

        {/* Theme Selector (Strictly 2 themes: Light & Dark) */}
        <div className="pt-6 border-t border-gray-100 dark:border-slate-800 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white">Theme Selection</label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Choose between pure White background or deep Black background.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
            {/* Light Mode Card */}
            <button
              type="button"
              onClick={() => updateDraft('theme', 'Light')}
              className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                draftSettings.theme === 'Light'
                  ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                    <Sun size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Light Mode</h4>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">Pure White Background</span>
                  </div>
                </div>
                {draftSettings.theme === 'Light' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
              </div>
              
              {/* Preview swatch */}
              <div className="w-full h-12 bg-white border border-gray-200 rounded-lg p-2 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-emerald-600"></div>
                  <div className="w-16 h-2 rounded bg-gray-200"></div>
                </div>
                <div className="w-6 h-2 rounded bg-gray-300"></div>
              </div>
            </button>

            {/* Dark Mode Card */}
            <button
              type="button"
              onClick={() => updateDraft('theme', 'Dark')}
              className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                draftSettings.theme === 'Dark'
                  ? 'border-emerald-600 bg-emerald-950/20 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400">
                    <Moon size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Dark Mode</h4>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">Deep Black Background</span>
                  </div>
                </div>
                {draftSettings.theme === 'Dark' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
              </div>

              {/* Preview swatch */}
              <div className="w-full h-12 bg-black border border-zinc-800 rounded-lg p-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-emerald-500"></div>
                  <div className="w-16 h-2 rounded bg-zinc-800"></div>
                </div>
                <div className="w-6 h-2 rounded bg-zinc-700"></div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
