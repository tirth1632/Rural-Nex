import React from 'react';
import { useSettings } from '../SettingsContext';
import { SegmentedControl } from '../components/SegmentedControl';
import { Info } from 'lucide-react';

const BUSINESS_TYPES_MAP: Record<string, string[]> = {
  'Agriculture': [
    'Crop Farming',
    'Dairy Farming',
    'Poultry Farming',
    'Fisheries',
    'Goat Farming',
    'Organic Farming',
    'Horticulture',
    'Other',
  ],
  'Dairy & Livestock': [
    'Milk Production',
    'Cattle Breeding',
    'Goat & Sheep Farming',
    'Animal Feed Manufacturing',
    'Dairy Products',
    'Other',
  ],
  'Poultry': [
    'Broiler Farming',
    'Layer (Egg) Farming',
    'Hatchery',
    'Poultry Feed Processing',
    'Other',
  ],
  'Fisheries': [
    'Inland Fish Farming',
    'Prawn/Shrimp Farming',
    'Fish Hatchery',
    'Fish Processing',
    'Other',
  ],
  'Food Processing': [
    'Dairy Processing',
    'Grain Processing',
    'Spice Processing',
    'Pickle & Food Products',
    'Bakery',
    'Other',
  ],
  'Manufacturing': [
    'Agro-equipment Manufacturing',
    'Packaging Materials',
    'Bricks & Tiles',
    'Textile & Garments',
    'Small Scale Workshop',
    'Other',
  ],
  'Retail': [
    'Grocery Store',
    'Clothing Store',
    'Hardware Store',
    'Electronics Store',
    'Agri-input Shop (Fertilizer/Seeds)',
    'Other',
  ],
  'Services': [
    'Repair Services',
    'Transportation',
    'Education',
    'Healthcare',
    'Consulting',
    'Custom Hiring Center (Tractors/Machinery)',
    'Other',
  ],
  'Handicrafts': [
    'Pottery & Ceramics',
    'Handloom Weaving',
    'Bamboo & Cane Craft',
    'Embroidery & Tailoring',
    'Woodwork',
    'Other',
  ],
  'Other': [
    'General Small Business',
    'Cooperative Enterprise',
    'Other',
  ],
};

export const SectionBusinessPreferences: React.FC = () => {
  const { draftSettings, updateDraft } = useSettings();

  const currentCategory = draftSettings.defaultCategory || 'Agriculture';
  const availableTypes = BUSINESS_TYPES_MAP[currentCategory] || BUSINESS_TYPES_MAP['Other'];

  const handleCategoryChange = (newCategory: string) => {
    updateDraft('defaultCategory', newCategory);
    const validTypes = BUSINESS_TYPES_MAP[newCategory] || BUSINESS_TYPES_MAP['Other'];
    if (!validTypes.includes(draftSettings.defaultBusinessType)) {
      updateDraft('defaultBusinessType', validTypes[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Business Preferences</h2>
        <p className="text-xs text-gray-500 mt-1">Set defaults used when creating new business assessments.</p>
      </div>

      {/* Explanatory Banner */}
      <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-3 text-blue-900 text-xs leading-relaxed">
        <Info size={18} className="text-primary shrink-0 mt-0.5" />
        <p>
          These preferences are used as defaults when starting a new assessment. You can change them for each individual business.
        </p>
      </div>

      {/* Preference Form Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Row 1: Category & Size */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Default Business Category</label>
              <select
                value={currentCategory}
                onChange={e => handleCategoryChange(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-white"
              >
                <option value="Agriculture">Agriculture</option>
                <option value="Dairy & Livestock">Dairy & Livestock</option>
                <option value="Poultry">Poultry</option>
                <option value="Fisheries">Fisheries</option>
                <option value="Food Processing">Food Processing</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Services">Services</option>
                <option value="Handicrafts">Handicrafts</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Preferred Business Size</label>
              <select
                value={draftSettings.preferredBusinessSize}
                onChange={e => updateDraft('preferredBusinessSize', e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-white"
              >
                <option value="Small (Micro Unit / Cottage)">Small (Micro Unit / Cottage)</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
              </select>
            </div>

            {/* Row 2: Dynamic Type & Investment */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Default Business Type</label>
              <select
                value={draftSettings.defaultBusinessType}
                onChange={e => updateDraft('defaultBusinessType', e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-white"
              >
                {availableTypes.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Default Investment Range</label>
              <select
                value={draftSettings.defaultInvestmentRange}
                onChange={e => updateDraft('defaultInvestmentRange', e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-white"
              >
                <option value="Under ₹1 lakh">Under ₹1 lakh</option>
                <option value="₹1–5 lakh">₹1–5 lakh</option>
                <option value="₹5–10 lakh">₹5–10 lakh</option>
                <option value="₹10–25 lakh">₹10–25 lakh</option>
                <option value="₹25–50 lakh">₹25–50 lakh</option>
                <option value="₹50 lakh–₹1 crore">₹50 lakh–₹1 crore</option>
                <option value="Above ₹1 crore">Above ₹1 crore</option>
              </select>
              <span className="text-[11px] text-gray-400 mt-1 block">
                Used as the starting investment range when creating a new assessment.
              </span>
            </div>

            {/* Row 3: Experience & Revenue Model */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Business Experience</label>
              <select
                value={draftSettings.businessExperience}
                onChange={e => updateDraft('businessExperience', e.target.value as any)}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Some Experience">Some Experience</option>
                <option value="Experienced">Experienced</option>
              </select>
              <span className="text-[11px] text-gray-400 mt-1 block">
                Used to tailor AI recommendations and explanations.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Preferred Revenue Model</label>
              <select
                value={draftSettings.preferredRevenueModel}
                onChange={e => updateDraft('preferredRevenueModel', e.target.value as any)}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-white"
              >
                <option value="Product Sales">Product Sales</option>
                <option value="Services">Services</option>
                <option value="Mixed">Mixed</option>
                <option value="Not Specified">Not Specified</option>
              </select>
              <span className="text-[11px] text-gray-400 mt-1 block">
                Used as a preference when suggesting business models.
              </span>
            </div>
          </div>

          {/* Divider & Risk Preference */}
          <div className="pt-4 border-t border-gray-100">
            <SegmentedControl
              label="Risk Preference"
              description="Used to tailor recommendations and highlight risks according to your preferred level of caution."
              options={['Low', 'Medium', 'High']}
              value={draftSettings.riskPreference}
              onChange={val => updateDraft('riskPreference', val as any)}
            />
          </div>
        </div>


      </div>
    </div>
  );
};
