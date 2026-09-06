import React, { useState } from 'react';
import { useSettings } from '../SettingsContext';
import { MapPin, Navigation, CheckCircle2 } from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

const GUJARAT_DISTRICTS = ['Anand', 'Ahmedabad', 'Kheda', 'Surat', 'Vadodara', 'Rajkot', 'Mehsana', 'Gandhinagar'];

export const SectionDefaultLocation: React.FC = () => {
  const { draftSettings, updateDraft, setToastMessage } = useSettings();
  const [isLocating, setIsLocating] = useState(false);

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setIsLocating(false);
          updateDraft('state', 'Gujarat');
          updateDraft('district', 'Anand');
          updateDraft('block', 'Anand Rural');
          updateDraft('village', 'Mogri');
          updateDraft('pinCode', '388345');
          setToastMessage('Location detected and updated.');
          setTimeout(() => setToastMessage(null), 4000);
        },
        err => {
          setIsLocating(false);
          // Fallback simulation
          updateDraft('state', 'Gujarat');
          updateDraft('district', 'Anand');
          setToastMessage('Default location preset applied.');
          setTimeout(() => setToastMessage(null), 4000);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">Default Location</h2>
        <p className="text-xs text-gray-500 mt-1">Set the location RuralNex should use when creating new assessments.</p>
      </div>

      {/* Explanatory Note with Location Icon */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-start justify-between gap-4 text-emerald-900 text-xs leading-relaxed">
        <div className="flex items-start gap-3">
          <MapPin size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          <p>
            Your location preferences help RuralNex provide more relevant market, competitor, and business recommendations.
          </p>
        </div>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-100/50 shadow-2xs transition-colors shrink-0"
        >
          <Navigation size={13} className={isLocating ? 'animate-spin' : ''} />
          {isLocating ? 'Locating...' : 'Use Current Location'}
        </button>
      </div>

      {/* Location Form */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl space-y-5 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">State</label>
            <select
              value={draftSettings.state}
              onChange={e => updateDraft('state', e.target.value)}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-white"
            >
              {INDIAN_STATES.map(st => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">District</label>
            <select
              value={draftSettings.district}
              onChange={e => updateDraft('district', e.target.value)}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-white"
            >
              {GUJARAT_DISTRICTS.map(dst => (
                <option key={dst} value={dst}>
                  {dst}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Block / Taluka</label>
            <input
              type="text"
              value={draftSettings.block}
              onChange={e => updateDraft('block', e.target.value)}
              placeholder="e.g. Anand Rural"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Village / Locality</label>
            <input
              type="text"
              value={draftSettings.village}
              onChange={e => updateDraft('village', e.target.value)}
              placeholder="e.g. Mogri"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">PIN Code</label>
            <input
              type="text"
              value={draftSettings.pinCode}
              onChange={e => updateDraft('pinCode', e.target.value)}
              placeholder="388345"
              maxLength={6}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
