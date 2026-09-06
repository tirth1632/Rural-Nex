import React from 'react';
import { useSettings } from '../SettingsContext';
import { Toggle } from '../components/Toggle';
import { SegmentedControl } from '../components/SegmentedControl';
import { AlertCircle, Sparkles } from 'lucide-react';

const LANGUAGES = ['English', 'Hindi', 'Gujarati', 'Marathi', 'Tamil', 'Telugu', 'Bengali'];

export const SectionAiAdvisor: React.FC = () => {
  const { draftSettings, updateDraft } = useSettings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-900">AI Advisor</h2>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded-full flex items-center gap-1">
            <Sparkles size={10} /> Smart Assistant
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Customize how RuralNex AI provides business advice.</p>
      </div>

      {/* Language & Detail Level */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl space-y-6 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Response Language</label>
            <select
              value={draftSettings.aiLanguage}
              onChange={e => updateDraft('aiLanguage', e.target.value)}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-white"
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2">
          <SegmentedControl
            label="Response Detail"
            description="Controls the length and complexity of AI explanations and strategic reports."
            options={['Simple', 'Balanced', 'Detailed']}
            value={draftSettings.aiDetailLevel}
            onChange={val => updateDraft('aiDetailLevel', val as any)}
          />
        </div>
      </div>

      {/* Recommendation Focus Areas */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl space-y-4 shadow-2xs">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-3">
          AI Recommendation Focus Areas
        </h3>

        <div className="space-y-4 pt-1">
          <Toggle
            label="Market Information"
            description="Include local demand trends, buyer demographics, and supply chain insights."
            checked={draftSettings.aiMarketInfo}
            onChange={checked => updateDraft('aiMarketInfo', checked)}
          />

          <Toggle
            label="Financial Analysis"
            description="Include breakeven analysis, cash flow projections, and profit margin breakdowns."
            checked={draftSettings.aiFinancialAnalysis}
            onChange={checked => updateDraft('aiFinancialAnalysis', checked)}
          />

          <Toggle
            label="Government Schemes"
            description="Match business ideas with active NABARD, PMEGP, Mudra, and state subsidies."
            checked={draftSettings.aiGovtSchemes}
            onChange={checked => updateDraft('aiGovtSchemes', checked)}
          />

          <Toggle
            label="Risk Warnings"
            description="Highlight potential seasonal, competitive, and financial operational risks."
            checked={draftSettings.aiRiskWarnings}
            onChange={checked => updateDraft('aiRiskWarnings', checked)}
          />

          <Toggle
            label="Competitor Information"
            description="Analyze nearby competitor density, pricing strategy, and service gaps."
            checked={draftSettings.aiCompetitorInfo}
            onChange={checked => updateDraft('aiCompetitorInfo', checked)}
          />
        </div>
      </div>

      {/* Important Disclaimer */}
      <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-3 text-amber-900 text-xs leading-relaxed">
        <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="font-medium">
          AI-generated recommendations are advisory and should be verified before making financial or business decisions.
        </p>
      </div>
    </div>
  );
};
