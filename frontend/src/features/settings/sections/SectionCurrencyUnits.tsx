import React from 'react';
import { useSettings } from '../SettingsContext';
import { Ruler, Coins } from 'lucide-react';

export const SectionCurrencyUnits: React.FC = () => {
  const { draftSettings, updateDraft } = useSettings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">Currency & Units</h2>
        <p className="text-xs text-gray-500 mt-1">Configure measurement and monetary formats for rural business analysis.</p>
      </div>

      <div className="p-6 bg-white border border-gray-200 rounded-xl space-y-6 shadow-2xs">
        {/* Currency Format */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Coins size={14} className="text-primary" /> Monetary Format
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Primary Currency</label>
              <input
                type="text"
                value="₹ INR (Indian Rupee)"
                readOnly
                className="w-full px-3.5 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm font-medium text-gray-600 outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Number Notation</label>
              <input
                type="text"
                value="Indian Notation (₹1,00,000 / Lakhs & Crores)"
                readOnly
                className="w-full px-3.5 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm font-medium text-gray-600 outline-none cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Agricultural & Physical Units */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Ruler size={14} className="text-primary" /> Measurement Units
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Land & Area Unit</label>
              <select
                value={draftSettings.areaUnit}
                onChange={e => updateDraft('areaUnit', e.target.value as any)}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-white"
              >
                <option value="Acre">Acre</option>
                <option value="Hectare">Hectare</option>
                <option value="Bigha">Bigha</option>
                <option value="Sq. Ft.">Sq. Ft.</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Distance Unit</label>
              <select
                value={draftSettings.distanceUnit}
                onChange={e => updateDraft('distanceUnit', e.target.value as any)}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-white"
              >
                <option value="Kilometers (km)">Kilometers (km)</option>
                <option value="Miles (mi)">Miles (mi)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Commodity Weight Unit</label>
              <select
                value={draftSettings.weightUnit}
                onChange={e => updateDraft('weightUnit', e.target.value as any)}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-white"
              >
                <option value="Kilograms (kg)">Kilograms (kg)</option>
                <option value="Tonnes (t)">Tonnes (t)</option>
                <option value="Quintal (q)">Quintal (q)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
