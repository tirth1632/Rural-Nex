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
  CheckCircle2,
  TrendingUp,
  Building2,
  Users,
  Compass,
  Zap,
  Droplet,
  Wifi,
  Building
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
      <div className="w-full p-8 sm:p-12 rounded-2xl bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-zinc-800 text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-1">
          <MapPin size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Select a location on the map</h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 max-w-md leading-relaxed">
          Click on any candidate village or corridor marker above to inspect its opportunity score, business fit, financial estimates, market demand, and competitor cluster.
        </p>
      </div>
    );
  }

  const { scoreResult } = location;

  return (
    <div className="w-full bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden text-gray-900 dark:text-white transition-colors">
      {/* Top Header Bar with Location details and Quick Actions */}
      <div className="p-5 sm:p-6 border-b border-gray-200 dark:border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gray-50/60 dark:bg-zinc-950/60">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              LOCATION INSIGHTS
            </span>
            {location.establishedYear && (
              <span className="text-[11px] font-medium text-gray-600 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-900 px-2.5 py-0.5 rounded-md border border-gray-200 dark:border-zinc-800">
                Est. {location.establishedYear} ({location.yearsOperating} yrs)
              </span>
            )}
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
              Match Score: {location.overallFitScore}/100
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            {location.name}
          </h2>

          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
            <MapPin size={14} className="text-primary shrink-0" />
            <span>{location.areaName}, {location.districtName}, {location.stateName}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
          <button
            onClick={onToggleSave}
            title={isSaved ? 'Remove from Saved' : 'Save Location'}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              isSaved 
                ? 'bg-primary text-white border-primary shadow-xs' 
                : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-200 border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800'
            }`}
          >
            {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            <span>{isSaved ? 'Saved' : 'Save Location'}</span>
          </button>

          <button
            onClick={onCompare}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              isComparing
                ? 'bg-primary/15 text-primary border-primary font-bold shadow-xs'
                : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-200 border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Scale size={16} />
            <span>{isComparing ? 'In Compare Matrix' : 'Compare Location'}</span>
          </button>

          <button
            onClick={onRunAssessment}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-emerald-600 rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
          >
            <FileText size={16} />
            <span>Run Full Assessment</span>
          </button>
        </div>
      </div>

      {/* Main Content Area - Clean Spacious Grid */}
      <div className="p-5 sm:p-6 lg:p-8 space-y-6">
        
        {/* ROW 1: Opportunity Score, Business Fit, and Financials */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* 1. OVERALL OPPORTUNITY SCORE */}
          <div className="p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/70 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp size={15} className="text-primary" /> Opportunity Score
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${scoreResult.tier.badgeColor}`}>
                  {scoreResult.tier.label}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-black text-gray-900 dark:text-white">{scoreResult.overallScore}</span>
                <span className="text-sm font-semibold text-gray-400 dark:text-zinc-500">/ 100</span>
              </div>
            </div>

            {/* Score Breakdown Progress Bars */}
            <div className="space-y-2.5 pt-3 border-t border-gray-200/80 dark:border-zinc-800">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-600 dark:text-zinc-400">Market Demand</span>
                  <span className="font-bold text-gray-900 dark:text-white">{scoreResult.breakdown.marketDemand} / 100</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${scoreResult.breakdown.marketDemand}%` }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-600 dark:text-zinc-400">Competition Gap</span>
                  <span className="font-bold text-gray-900 dark:text-white">{scoreResult.breakdown.competition} / 100</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${scoreResult.breakdown.competition}%` }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-600 dark:text-zinc-400">Accessibility</span>
                  <span className="font-bold text-gray-900 dark:text-white">{scoreResult.breakdown.accessibility} / 100</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${scoreResult.breakdown.accessibility}%` }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-600 dark:text-zinc-400">Infrastructure</span>
                  <span className="font-bold text-gray-900 dark:text-white">{scoreResult.breakdown.infrastructure} / 100</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${scoreResult.breakdown.infrastructure}%` }}></div>
                </div>
              </div>
            </div>

            {/* Expandable Why This Score */}
            <div className="pt-2">
              <button
                onClick={() => setShowWhyScore(!showWhyScore)}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                <span>Why this score?</span>
                {showWhyScore ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showWhyScore && (
                <div className="mt-2.5 p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs space-y-2 animate-in fade-in duration-150">
                  <span className="font-bold text-gray-900 dark:text-white block">Key Telemetry Drivers:</span>
                  {scoreResult.keyDrivers.map((driver, idx) => (
                    <p key={idx} className="flex items-start gap-2 text-gray-600 dark:text-zinc-300">
                      <CheckCircle2 size={14} className="text-primary shrink-0 mt-0.5" />
                      <span>{driver}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2. BUSINESS-SPECIFIC FIT */}
          <div className="p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/70 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 size={15} className="text-primary" /> Business-Specific Fit
                </span>
                <span className="font-bold text-primary text-sm">{location.overallFitScore} / 100</span>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800">
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase font-semibold block">Target Sector</span>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{location.businessCategory}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">{location.subType}</p>
                </div>

                <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800">
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase font-semibold block">Investment Budget</span>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{location.investmentRange}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800 text-center">
                <span className="text-[11px] text-gray-500 dark:text-zinc-400 block font-medium">Investment Fit</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{location.investmentFitScore}/100</span>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800 text-center">
                <span className="text-[11px] text-gray-500 dark:text-zinc-400 block font-medium">Demand Fit</span>
                <span className="text-lg font-bold text-primary mt-0.5 block">{location.demandFitScore}/100</span>
              </div>
            </div>
          </div>

          {/* 3. FINANCIAL ESTIMATES */}
          <div className="p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/70 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <IndianRupee size={15} className="text-primary" /> Financial Estimates
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800">
                  {location.financialDataQuality} Estimate
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800">
                  <span className="text-[10px] font-medium text-gray-400 dark:text-zinc-500 block uppercase">Est. Annual Revenue</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{location.estimatedAnnualRevenue}</span>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800">
                  <span className="text-[10px] font-medium text-gray-400 dark:text-zinc-500 block uppercase">Est. Annual Profit</span>
                  <span className="text-base font-black text-gray-900 dark:text-white mt-0.5 block">{location.estimatedAnnualProfit}</span>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800">
                  <span className="text-[10px] font-medium text-gray-400 dark:text-zinc-500 block uppercase">Operating Cost</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-zinc-200 mt-0.5 block">{location.estimatedAnnualCost}</span>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800">
                  <span className="text-[10px] font-medium text-gray-400 dark:text-zinc-500 block uppercase">Est. Break-even</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-zinc-200 mt-0.5 block">{location.estimatedBreakevenMonths}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-zinc-400 pt-2 border-t border-gray-200/80 dark:border-zinc-800">
              <span>Confidence: <strong className="text-gray-800 dark:text-zinc-200">{location.financialConfidence}</strong></span>
              <span className="italic text-[10px]">Modelled via Finance Engine</span>
            </div>
          </div>

        </div>

        {/* ROW 2: Demographics, Competition, and Infrastructure */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* 4. MARKET INFORMATION */}
          <div className="p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 space-y-3">
            <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={15} className="text-primary" /> Market Information
            </span>
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-zinc-800/80">
                <span className="text-gray-600 dark:text-zinc-400">Population</span>
                <span className="font-bold text-gray-900 dark:text-white">{location.population}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-zinc-800/80">
                <span className="text-gray-600 dark:text-zinc-400">Customer Base Est.</span>
                <span className="font-bold text-gray-900 dark:text-white">{location.customerBaseEst}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-zinc-800/80">
                <span className="text-gray-600 dark:text-zinc-400">Demand Indicator</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{location.demandIndicator}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600 dark:text-zinc-400">Market Size</span>
                <span className="font-bold text-gray-900 dark:text-white">{location.marketSize}</span>
              </div>
            </div>
          </div>

          {/* 5. COMPETITION INTELLIGENCE */}
          <div className="p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Building size={15} className="text-primary" /> Competition Intelligence
              </span>
              <button
                onClick={onViewCompetitors}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                <span>Competitors</span>
                <ExternalLink size={12} />
              </button>
            </div>
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-zinc-800/80">
                <span className="text-gray-600 dark:text-zinc-400">Nearby Competitors</span>
                <span className="font-bold text-gray-900 dark:text-white">{location.competitorCount} within {location.distanceKm} km</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-zinc-800/80">
                <span className="text-gray-600 dark:text-zinc-400">Competition Density</span>
                <span className="font-bold text-gray-900 dark:text-white">{location.competitionDensity}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600 dark:text-zinc-400">Nearest Competitor</span>
                <span className="font-bold text-gray-900 dark:text-white">{location.nearestCompetitorDistance}</span>
              </div>
            </div>
          </div>

          {/* 6. ACCESSIBILITY & INFRASTRUCTURE */}
          <div className="p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 space-y-3">
            <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Compass size={15} className="text-primary" /> Accessibility & Utilities
            </span>
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="p-2.5 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800">
                <span className="text-[10px] text-gray-400 dark:text-zinc-500 block">Major Road</span>
                <span className="font-bold text-gray-900 dark:text-white truncate block">{location.nearestMajorRoad}</span>
              </div>
              <div className="p-2.5 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800">
                <span className="text-[10px] text-gray-400 dark:text-zinc-500 block">Distance to Highway</span>
                <span className="font-bold text-gray-900 dark:text-white truncate block">{location.distanceToHighway}</span>
              </div>
              <div className="p-2.5 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800 flex items-center gap-2">
                <Zap size={14} className="text-amber-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 block">Power</span>
                  <span className="font-bold text-gray-900 dark:text-white truncate block">{location.electricityAvailability}</span>
                </div>
              </div>
              <div className="p-2.5 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800 flex items-center gap-2">
                <Droplet size={14} className="text-cyan-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 block">Water</span>
                  <span className="font-bold text-gray-900 dark:text-white truncate block">{location.waterAvailability}</span>
                </div>
              </div>
              <div className="p-2.5 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800 flex items-center gap-2">
                <Wifi size={14} className="text-blue-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 block">Telecom</span>
                  <span className="font-bold text-gray-900 dark:text-white truncate block">{location.internetConnectivity}</span>
                </div>
              </div>
              <div className="p-2.5 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800 flex items-center gap-2">
                <Building size={14} className="text-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 block">Banking</span>
                  <span className="font-bold text-gray-900 dark:text-white truncate block">{location.bankingAccess}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
