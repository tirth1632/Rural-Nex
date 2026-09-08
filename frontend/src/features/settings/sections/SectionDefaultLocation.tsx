import React, { useState, useMemo } from 'react';
import { useSettings } from '../SettingsContext';
import { MapPin, Navigation } from 'lucide-react';
import { detectUserLocation } from '../../../services/geolocationService';
import { geoService } from '../../../services/geoService';

// Map state names to geoService state IDs
const STATE_NAME_TO_ID: Record<string, string> = {
  'Andhra Pradesh': 'AP',
  'Arunachal Pradesh': 'AR',
  'Assam': 'AS',
  'Bihar': 'BR',
  'Chhattisgarh': 'CG',
  'Goa': 'GA',
  'Gujarat': 'GJ',
  'Haryana': 'HR',
  'Himachal Pradesh': 'HP',
  'Jharkhand': 'JH',
  'Karnataka': 'KA',
  'Kerala': 'KL',
  'Madhya Pradesh': 'MP',
  'Maharashtra': 'MH',
  'Manipur': 'MN',
  'Meghalaya': 'ML',
  'Mizoram': 'MZ',
  'Nagaland': 'NL',
  'Odisha': 'OD',
  'Punjab': 'PB',
  'Rajasthan': 'RJ',
  'Sikkim': 'SK',
  'Tamil Nadu': 'TN',
  'Telangana': 'TG',
  'Tripura': 'TR',
  'Uttar Pradesh': 'UP',
  'Uttarakhand': 'UK',
  'West Bengal': 'WB',
  'Andaman and Nicobar Islands': 'AN',
  'Chandigarh': 'CH',
  'Dadra and Nagar Haveli and Daman and Diu': 'DN',
  'Delhi (NCT)': 'DL',
  'Jammu and Kashmir': 'JK',
  'Ladakh': 'LA',
  'Lakshadweep': 'LD',
  'Puducherry': 'PY',
};

// All states and UTs from geoService, sorted alphabetically by name
const ALL_STATES = geoService.getStates().slice().sort((a, b) => a.name.localeCompare(b.name));

export const SectionDefaultLocation: React.FC = () => {
  const { draftSettings, updateDraft, setToastMessage } = useSettings();
  const [isLocating, setIsLocating] = useState(false);

  // Get the state ID for the currently selected state name
  const selectedStateId = STATE_NAME_TO_ID[draftSettings.state] || '';

  // Districts for the selected state
  const districts = useMemo(() => {
    if (!selectedStateId) return [];
    return geoService.getDistricts(selectedStateId);
  }, [selectedStateId]);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStateName = e.target.value;
    updateDraft('state', newStateName);
    // Reset district to first available district for the new state
    const newStateId = STATE_NAME_TO_ID[newStateName] || '';
    if (newStateId) {
      const newDistricts = geoService.getDistricts(newStateId);
      updateDraft('district', newDistricts.length > 0 ? newDistricts[0].name : '');
    } else {
      updateDraft('district', '');
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const loc = await detectUserLocation();
      if (loc.state) updateDraft('state', loc.state);
      if (loc.district) updateDraft('district', loc.district);
      if (loc.block) updateDraft('block', loc.block);
      if (loc.village) updateDraft('village', loc.village);
      if (loc.pinCode) updateDraft('pinCode', loc.pinCode);

      setToastMessage(`Detected: ${loc.village}, ${loc.district}, ${loc.state}`);
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to detect location');
    } finally {
      setIsLocating(false);
      setTimeout(() => setToastMessage(null), 5000);
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
              onChange={handleStateChange}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-white"
            >
              {ALL_STATES.map(st => (
                <option key={st.id} value={st.name}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">District</label>
            <select
              value={draftSettings.district}
              onChange={e => updateDraft('district', e.target.value)}
              disabled={districts.length === 0}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {districts.length === 0 && (
                <option value="">— Select a state first —</option>
              )}
              {districts.map(dst => (
                <option key={dst.id} value={dst.name}>
                  {dst.name}
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
