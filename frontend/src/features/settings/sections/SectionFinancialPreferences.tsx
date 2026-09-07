import React, { useState } from 'react';
import { useSettings } from '../SettingsContext';
import { Toggle } from '../components/Toggle';
import { SegmentedControl } from '../components/SegmentedControl';
import { Info, HelpCircle } from 'lucide-react';

export const SectionFinancialPreferences: React.FC = () => {
  const { draftSettings, updateDraft } = useSettings();
  const [showTooltip, setShowTooltip] = useState(false);

  const handleInterestRateChange = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) {
      updateDraft('defaultInterestRate', 0);
    } else {
      updateDraft('defaultInterestRate', Math.max(0, Math.min(50, num)));
    }
  };

  const handleLoanTenureChange = (val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) {
      updateDraft('defaultLoanTenureYears', 1);
    } else {
      updateDraft('defaultLoanTenureYears', Math.max(1, Math.min(30, num)));
    }
  };

  const handleInflationRateChange = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) {
      updateDraft('defaultInflationRate', 0);
    } else {
      updateDraft('defaultInflationRate', Math.max(0, Math.min(30, num)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Financial Preferences</h2>
        <p className="text-xs text-gray-500 mt-1">Configure default financial assumptions.</p>
      </div>

      {/* Explanatory Banner */}
      <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-3 text-blue-900 text-xs leading-relaxed">
        <Info size={18} className="text-primary shrink-0 mt-0.5" />
        <p>
          These settings provide default assumptions for new financial assessments. Actual business inputs can be changed for each assessment.
        </p>
      </div>

      {/* Preference Form Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Two-Column Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Row 1: Interest Rate & Loan Tenure */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Default Loan Interest Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={draftSettings.defaultInterestRate}
                  onChange={e => handleInterestRateChange(e.target.value)}
                  className="w-full px-3.5 py-2 pr-8 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-white"
                />
                <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-semibold">%</span>
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block leading-normal">
                Starting assumption for loan-based financial projections. Actual rates vary by lender, scheme, borrower profile, and loan type.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Default Loan Tenure (years)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="30"
                  value={draftSettings.defaultLoanTenureYears}
                  onChange={e => handleLoanTenureChange(e.target.value)}
                  className="w-full px-3.5 py-2 pr-14 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-white"
                />
                <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-semibold">years</span>
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block leading-normal">
                Default repayment period used when a loan is included in an assessment.
              </span>
            </div>

            {/* Row 2: Annual Cost Inflation & Financial View */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Default Annual Cost Inflation (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="30"
                  value={draftSettings.defaultInflationRate}
                  onChange={e => handleInflationRateChange(e.target.value)}
                  className="w-full px-3.5 py-2 pr-8 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-white"
                />
                <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-semibold">%</span>
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block leading-normal">
                Default annual increase applied to operating costs in long-term projections.
              </span>
            </div>

            <div>
              <SegmentedControl
                label="Preferred Financial View"
                description="Controls display presentation only. Does not alter underlying financial engine calculations."
                options={['Monthly', 'Yearly']}
                value={draftSettings.preferredFinancialView}
                onChange={val => updateDraft('preferredFinancialView', val as any)}
              />
            </div>
          </div>

          {/* Divider & Calculation Toggles */}
          <div className="pt-5 border-t border-gray-100 space-y-4">
            <Toggle
              label="Use GST-aware calculations"
              description="Apply GST assumptions where applicable. Actual GST treatment depends on business type, tax status, pricing, and input-tax credit eligibility."
              checked={draftSettings.includeGst}
              onChange={checked => updateDraft('includeGst', checked)}
            />

            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-900">Use Conservative Projection Mode</span>
                  <div className="relative inline-block">
                    <button
                      type="button"
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                      onClick={() => setShowTooltip(!showTooltip)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded focus:outline-none"
                      aria-label="Conservative mode info"
                    >
                      <HelpCircle size={14} />
                    </button>
                    {showTooltip && (
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-2.5 bg-gray-900 text-white text-[11px] leading-relaxed rounded-lg shadow-lg z-20 pointer-events-none">
                        Affects projected revenue growth, demand expectations, and cost buffers. Does not alter historical market data, user-entered inputs, or core financial formulas (ROI, NPV, IRR).
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900" />
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use more cautious assumptions when presenting projected business outcomes.
                </p>
              </div>
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => updateDraft('showConservativeEstimates', !draftSettings.showConservativeEstimates)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    draftSettings.showConservativeEstimates ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      draftSettings.showConservativeEstimates ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Financial Assumption Transparency Section */}
          <div className="pt-4 border-t border-gray-100 bg-gray-50/50 p-3.5 rounded-lg border border-gray-100">
            <h4 className="text-xs font-semibold text-gray-800 mb-1">How these settings are used</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              These values are default assumptions used when creating new financial projections. They do not replace business-specific data. You can change the assumptions for an individual assessment.
            </p>
          </div>
        </div>


      </div>
    </div>
  );
};

