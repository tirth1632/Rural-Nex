import React, { useState } from 'react';
import { 
  MapPin, 
  IndianRupee, 
  ChevronDown, 
  ChevronUp, 
  Bookmark, 
  BookmarkCheck, 
  FileText, 
  Scale, 
  ExternalLink, 
  CheckCircle2 
} from 'lucide-react';
import type { CandidateLocation } from '../../services/geoService';

interface GeoLocationInsightsProps {
  location: CandidateLocation | null;
  isSaved: boolean;
  onToggleSave: () => void;
  onRunAssessment: () => void;
  onCompare: () => void;
  isComparing: boolean;
  onOpen3DView?: () => void;
  onViewCompetitors: () => void;
}

export const GeoLocationInsights: React.FC<GeoLocationInsightsProps> = ({
  location,
  isSaved,
  onToggleSave,
  onRunAssessment,
  onCompare,
  isComparing,
  onViewCompetitors,
}) => {
  const [showWhyScore, setShowWhyScore] = useState(false);

  // Empty State
  if (!location) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 text-center text-gray-500 dark:text-gray-400 shadow-2xs">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
          <MapPin size={32} />
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Select a location</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
          Click a highlighted location on the map to view its business potential, market conditions, competition, accessibility, and estimated financial indicators.
        </p>
      </div>
    );
  }

  const { scoreResult } = location;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white overflow-y-auto shadow-2xs">
      {/* Panel Top Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">LOCATION INSIGHTS</span>
          <h3 className="text-base font-bold text-gray-900 dark:text-white truncate max-w-[220px]">{location.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{location.areaName}, {location.districtName}, {location.stateName}</p>
        </div>
        <button
          onClick={onToggleSave}
          title={isSaved ? 'Remove from Saved' : 'Save Location'}
          className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
            isSaved 
              ? 'bg-primary text-white border-primary' 
              : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
      </div>

      <div className="p-4 space-y-5 flex-1">
        {/* OVERALL OPPORTUNITY SCORE CARD */}
        <div className={`p-4 rounded-xl border ${scoreResult.tier.borderColor} ${scoreResult.tier.bgLight} space-y-3`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Opportunity Score</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${scoreResult.tier.badgeColor}`}>
              {scoreResult.tier.label}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{scoreResult.overallScore}</span>
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">/ 100</span>
          </div>

          {/* Transparent Score Factor Bars */}
          <div className="space-y-2 pt-2 border-t border-gray-200/60 dark:border-slate-700/60">
            <div className="flex justify-between text-xs font-medium">
              <span>Market Demand</span>
              <span className="font-bold text-gray-900 dark:text-white">{scoreResult.breakdown.marketDemand} / 100</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: `${scoreResult.breakdown.marketDemand}%` }}></div>
            </div>

            <div className="flex justify-between text-xs font-medium">
              <span>Competition Gap</span>
              <span className="font-bold text-gray-900 dark:text-white">{scoreResult.breakdown.competition} / 100</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: `${scoreResult.breakdown.competition}%` }}></div>
            </div>

            <div className="flex justify-between text-xs font-medium">
              <span>Accessibility</span>
              <span className="font-bold text-gray-900 dark:text-white">{scoreResult.breakdown.accessibility} / 100</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: `${scoreResult.breakdown.accessibility}%` }}></div>
            </div>

            <div className="flex justify-between text-xs font-medium">
              <span>Infrastructure</span>
              <span className="font-bold text-gray-900 dark:text-white">{scoreResult.breakdown.infrastructure} / 100</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: `${scoreResult.breakdown.infrastructure}%` }}></div>
            </div>
          </div>

          {/* Expandable "Why this score?" */}
          <div className="pt-1">
            <button
              onClick={() => setShowWhyScore(!showWhyScore)}
              className="flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              <span>Why this score?</span>
              {showWhyScore ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showWhyScore && (
              <div className="mt-2 p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 text-xs text-gray-700 dark:text-gray-300 space-y-1.5 animate-in fade-in duration-150">
                <span className="font-bold text-gray-900 dark:text-white block">Score Factor Breakdown:</span>
                {scoreResult.keyDrivers.map((driver, idx) => (
                  <p key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 size={13} className="text-primary shrink-0 mt-0.5" />
                    <span>{driver}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BUSINESS-SPECIFIC FIT */}
        <div className="p-3.5 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Business-Specific Fit</span>
            <span className="font-bold text-primary">{location.overallFitScore} / 100</span>
          </div>
          <div className="text-gray-600 dark:text-gray-400 space-y-1">
            <p><span className="font-semibold text-gray-900 dark:text-white">Sector:</span> {location.businessCategory} ({location.subType})</p>
            <p><span className="font-semibold text-gray-900 dark:text-white">Investment Budget:</span> {location.investmentRange}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 text-center">
              <span className="text-[10px] text-gray-500 dark:text-gray-400 block">Investment Fit</span>
              <span className="font-bold text-gray-900 dark:text-white">{location.investmentFitScore}/100</span>
            </div>
            <div className="p-2 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 text-center">
              <span className="text-[10px] text-gray-500 dark:text-gray-400 block">Demand Fit</span>
              <span className="font-bold text-gray-900 dark:text-white">{location.demandFitScore}/100</span>
            </div>
          </div>
        </div>

        {/* FINANCIAL ESTIMATES */}
        <div className="p-4 bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <IndianRupee size={15} className="text-primary" /> Financial Estimates
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800">
              {location.financialDataQuality} Estimate
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700">
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 block">Est. Annual Revenue</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{location.estimatedAnnualRevenue}</span>
            </div>
            <div className="p-2.5 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700">
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 block">Est. Annual Profit</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{location.estimatedAnnualProfit}</span>
            </div>
            <div className="p-2.5 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700">
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 block">Operating Cost</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">{location.estimatedAnnualCost}</span>
            </div>
            <div className="p-2.5 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700">
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 block">Est. Break-even</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">{location.estimatedBreakevenMonths}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-1">
            <span>Confidence: <strong className="text-gray-800 dark:text-gray-200">{location.financialConfidence}</strong></span>
            <span className="italic text-[10px]">Modelled data from Finance Engine</span>
          </div>
        </div>

        {/* MARKET INFORMATION */}
        <div className="p-4 bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl space-y-2.5 text-xs">
          <span className="font-bold text-gray-900 dark:text-white uppercase tracking-wider block">Market Information</span>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Population</span>
              <span className="font-semibold text-gray-900 dark:text-white">{location.population}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Customer Base Est.</span>
              <span className="font-semibold text-gray-900 dark:text-white">{location.customerBaseEst}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Demand Indicator</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{location.demandIndicator}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Market Size</span>
              <span className="font-semibold text-gray-900 dark:text-white">{location.marketSize}</span>
            </div>
          </div>
        </div>

        {/* COMPETITION */}
        <div className="p-4 bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900 dark:text-white uppercase tracking-wider">Competition</span>
            <button
              onClick={onViewCompetitors}
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              <span>View Competitors</span>
              <ExternalLink size={12} />
            </button>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Nearby Competitors</span>
              <span className="font-semibold text-gray-900 dark:text-white">{location.competitorCount} competitors within {location.distanceKm} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Competition Density</span>
              <span className="font-bold text-gray-900 dark:text-white">{location.competitionDensity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Nearest Competitor</span>
              <span className="font-semibold text-gray-900 dark:text-white">{location.nearestCompetitorDistance}</span>
            </div>
          </div>
        </div>

        {/* ACCESSIBILITY */}
        <div className="p-4 bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl space-y-2 text-xs">
          <span className="font-bold text-gray-900 dark:text-white uppercase tracking-wider block">Accessibility</span>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Major Road</span>
              <span className="font-semibold text-gray-900 dark:text-white">{location.nearestMajorRoad}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Distance to Highway</span>
              <span className="font-semibold text-gray-900 dark:text-white">{location.distanceToHighway}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Transport Hub</span>
              <span className="font-semibold text-gray-900 dark:text-white">{location.nearestTransportHub}</span>
            </div>
          </div>
        </div>

        {/* INFRASTRUCTURE */}
        <div className="p-4 bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900 dark:text-white uppercase tracking-wider">Infrastructure</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">{location.infrastructureDataStatus}</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Electricity Grid</span>
              <span className="font-semibold text-gray-900 dark:text-white">{location.electricityAvailability}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Water Supply</span>
              <span className="font-semibold text-gray-900 dark:text-white">{location.waterAvailability}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Internet / Telecom</span>
              <span className="font-semibold text-gray-900 dark:text-white">{location.internetConnectivity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Banking Access</span>
              <span className="font-semibold text-gray-900 dark:text-white">{location.bankingAccess}</span>
            </div>
          </div>
        </div>

        {/* LOCATION / BUSINESS AGE */}
        <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg border border-gray-200 dark:border-slate-700 text-xs text-gray-600 dark:text-gray-300 flex items-center justify-between">
          <span className="font-semibold">Business Age / Establishment:</span>
          <span>
            {location.establishedYear && location.yearsOperating
              ? `Est. ${location.establishedYear} (${location.yearsOperating} yrs)`
              : 'Business age unavailable'}
          </span>
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 space-y-2 sticky bottom-0 bg-white dark:bg-slate-900 z-10">
        <button
          onClick={onRunAssessment}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-primary hover:bg-emerald-600 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <FileText size={16} />
          <span>Run Full Assessment</span>
        </button>

        <button
          onClick={onCompare}
          className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
            isComparing
              ? 'bg-primary/10 text-primary border-primary font-bold'
              : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
        >
          <Scale size={14} />
          <span>{isComparing ? 'Comparing Location' : 'Compare Location'}</span>
        </button>
      </div>
    </div>
  );
};
