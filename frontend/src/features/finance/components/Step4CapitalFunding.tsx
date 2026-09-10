import React, { useMemo } from 'react';
import {
  Wallet,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  ShieldCheck,
  TrendingUp,
  Info,
  ArrowLeft,
  ArrowRight,
  Layers,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import {
  calculateCapitalStructure,
  type CapitalStructureResult
} from '../services/financialEngine';

export interface FundingData {
  ownContribution: number;
  partnerEquity: number;
  workingCapitalReserve: number;
  otherSupport: number;
  estimatedSubsidy: number;
}

interface Step4Props {
  totalProjectCost: number;
  totalCapEx?: number;
  totalWorkingCapital?: number;
  funding: FundingData;
  onChange: (updated: Partial<FundingData>) => void;
  onNext: () => void;
  onBack: () => void;
  onGoToStep3?: () => void;
  selectedLocationText?: string;
  businessCategoryOrName?: string;
}

export const Step4CapitalFunding: React.FC<Step4Props> = ({
  totalProjectCost,
  totalCapEx = 0,
  totalWorkingCapital = 0,
  funding,
  onChange,
  onNext,
  onBack,
  onGoToStep3,
  selectedLocationText = '',
  businessCategoryOrName = ''
}) => {
  // Authoritative Single Source of Truth Capital Structure Calculation
  const capStruct: CapitalStructureResult = useMemo(() => {
    return calculateCapitalStructure(
      totalProjectCost,
      totalCapEx,
      totalWorkingCapital,
      funding.ownContribution,
      funding.partnerEquity,
      funding.otherSupport
    );
  }, [totalProjectCost, totalCapEx, totalWorkingCapital, funding.ownContribution, funding.partnerEquity, funding.otherSupport]);

  // Planning Assumption Benchmark (15% recommended margin)
  const planningBenchmarkPct = 15;
  const benchmarkRequiredEquity = (totalProjectCost * planningBenchmarkPct) / 100;
  const isBelowBenchmark = capStruct.totalNonDebtFunding < benchmarkRequiredEquity && totalProjectCost > 0;

  return (
    <div className="space-y-6">
      {/* Header & Location Connection */}
      <div className="bg-white dark:bg-[#0c0d10] p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Wallet className="text-emerald-500" size={22} />
              Step 4: Capital Structure & Financing Requirement
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              Configure non-debt capital contributions (Promoter, Partner, Other Confirmed) to derive the net project financing requirement.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-900 font-bold text-gray-800 dark:text-zinc-200 border border-gray-200 dark:border-zinc-800">
              {selectedLocationText || 'Selected Location'}
            </span>
            <span className="text-gray-400">•</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
              {businessCategoryOrName || 'Selected Business'}
            </span>
          </div>
        </div>

        {/* Top Summary Cards (Sources vs Uses) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* TOTAL PROJECT COST */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c0d10] border border-gray-200 dark:border-zinc-800 shadow-xs relative">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">TOTAL PROJECT COST</span>
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white font-mono mt-1">
              ₹{totalProjectCost.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-zinc-400 mt-1">
              CapEx: ₹{totalCapEx.toLocaleString('en-IN')} • Working Cap: ₹{totalWorkingCapital.toLocaleString('en-IN')}
            </div>
          </div>

          {/* TOTAL EQUITY / NON-DEBT */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-xs relative">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                TOTAL OWN FUNDS ({capStruct.equityPct}%)
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
              ₹{capStruct.totalNonDebtFunding.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80 mt-1">
              Own Cash + Partner Equity + Other Grants
            </div>
          </div>

          {/* FINANCING REQUIREMENT */}
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-xs relative">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                FINANCING NEEDED ({capStruct.financingRequirementPct}%)
              </span>
            </div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono mt-1">
              ₹{capStruct.financingRequirement.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-blue-700/80 dark:text-blue-300/80 mt-1">
              {capStruct.excessFunding > 0
                ? `Excess Funding: ₹${capStruct.excessFunding.toLocaleString('en-IN')}`
                : 'Net Funding / Loan Gap Required'}
            </div>
          </div>
        </div>
      </div>

      {/* ZERO COST WARNING */}
      {capStruct.isZeroCost && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <AlertTriangle size={18} className="shrink-0 text-amber-500" />
          <span>
            <strong>Zero Project Cost Detected:</strong> Please add project cost items in Step 3 before calculating capital structure and financing requirement.
          </span>
        </div>
      )}

      {/* Main Grid: Sources of Funds vs. Dynamic Capital Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Sources of Funds Inputs & Uses Breakdown */}
        <div className="space-y-6">
          {/* Sources of Non-debt Funds Input Card */}
          <div className="bg-white dark:bg-[#0c0d10] p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-2">
              <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-500" />
                Promoter & Partner Funds (Non-Loan)
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 mb-1">
                  PROMOTER OWN CASH CONTRIBUTION (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={funding.ownContribution || ''}
                  onChange={e => onChange({ ownContribution: Math.max(0, Number(e.target.value) || 0) })}
                  placeholder="e.g. 100000"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-900 dark:text-white font-mono focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 mb-1">
                  PARTNER / CO-OWNER EQUITY (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={funding.partnerEquity || ''}
                  onChange={e => onChange({ partnerEquity: Math.max(0, Number(e.target.value) || 0) })}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-900 dark:text-white font-mono focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 mb-1">
                  OTHER CONFIRMED FUNDS / GRANTS (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={funding.otherSupport || ''}
                  onChange={e => onChange({ otherSupport: Math.max(0, Number(e.target.value) || 0) })}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-900 dark:text-white font-mono focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-zinc-900 flex justify-between items-center text-xs font-bold">
                <span className="text-gray-600 dark:text-zinc-400">Total Own Funds (Non-Loan)</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  ₹{capStruct.totalNonDebtFunding.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Uses of Funds Summary Card (Link to Step 3) */}
          <div className="bg-white dark:bg-[#0c0d10] p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-2">
              <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                <Layers size={16} className="text-emerald-500" />
                Uses of Funds Breakdown (Step 3 Summary)
              </h3>
              {onGoToStep3 && (
                <button
                  type="button"
                  onClick={onGoToStep3}
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  View/Edit Step 3 →
                </button>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                <span className="text-gray-600 dark:text-zinc-400 font-medium">1. Capital Expenditure (CapEx)</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  ₹{totalCapEx.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                <span className="text-gray-600 dark:text-zinc-400 font-medium">2. Initial Working Capital Reserve</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  ₹{totalWorkingCapital.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 font-bold">
                <span className="text-emerald-800 dark:text-emerald-300">Total Project Uses</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  ₹{totalProjectCost.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Capital Structure Visualization, Reconciliation, & Insights */}
        <div className="space-y-6">
          {/* Dynamic Capital Structure Visualization & Sources vs Uses Reconciliation */}
          <div className="bg-white dark:bg-[#0c0d10] p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-2">
              <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                <PieChart size={16} className="text-emerald-500" />
                Capital Structure & Sources vs Uses
              </h3>

              {capStruct.isBalanced ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck size={12} /> Sources & Uses Balanced
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-500 flex items-center gap-1">
                  <AlertTriangle size={12} /> Delta: ₹{capStruct.sourcesUsesDelta}
                </span>
              )}
            </div>

            {!capStruct.isZeroCost ? (
              <div className="space-y-4">
                {/* Stacked Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 dark:text-zinc-400">
                    <span>Funding Structure Allocation</span>
                    <span>100% Total Project Cost</span>
                  </div>
                  <div className="w-full h-4 rounded-full overflow-hidden bg-gray-200 dark:bg-zinc-800 flex">
                    <div
                      style={{ width: `${Math.min(100, capStruct.equityPct)}%` }}
                      className="bg-emerald-500 transition-all duration-300"
                      title={`Equity / Non-debt: ${capStruct.equityPct}%`}
                    />
                    <div
                      style={{ width: `${Math.min(100, capStruct.financingRequirementPct)}%` }}
                      className="bg-blue-500 transition-all duration-300"
                      title={`Financing Requirement: ${capStruct.financingRequirementPct}%`}
                    />
                  </div>
                </div>

                {/* Legend & Breakdown Table */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="font-medium text-gray-700 dark:text-zinc-300">Promoter / Non-Debt Equity</span>
                    </div>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      ₹{capStruct.totalNonDebtFunding.toLocaleString('en-IN')} ({capStruct.equityPct}%)
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="font-medium text-gray-700 dark:text-zinc-300">Financing Requirement (Gap)</span>
                    </div>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      ₹{capStruct.financingRequirement.toLocaleString('en-IN')} ({capStruct.financingRequirementPct}%)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-gray-400 dark:text-zinc-500">
                Add project cost items in Step 3 to visualize capital structure.
              </div>
            )}
          </div>

          {/* Funding Structure Insight & Planning Benchmarks */}
          <div className="bg-white dark:bg-[#0c0d10] p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-2">
              <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                Funding Structure Insight & Planning Benchmarks
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              {/* Analytical Insight */}
              <div className="p-3 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Info size={14} className="text-blue-500 shrink-0" />
                  Analytical Funding Insight
                </div>
                <p className="text-[11px] leading-relaxed text-blue-800/90 dark:text-blue-300/90">
                  {capStruct.equityPct < 15
                    ? `Your current structure relies heavily on external financing (${capStruct.financingRequirementPct}%). Increasing promoter/partner contribution reduces debt service obligations in downstream financial forecasts.`
                    : `Your capital structure has a solid non-debt equity foundation (${capStruct.equityPct}%). This lowers debt burden and improves debt service coverage ratios (DSCR) in Step 6.`}
                </p>
              </div>

              {/* Planning Benchmark Status */}
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 space-y-1.5">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-gray-700 dark:text-zinc-300">Equity Margin Benchmark ({planningBenchmarkPct}%)</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    ₹{benchmarkRequiredEquity.toLocaleString('en-IN')}
                  </span>
                </div>

                {isBelowBenchmark ? (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-start gap-1.5">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span>Current contribution (₹{capStruct.totalNonDebtFunding.toLocaleString('en-IN')}) is below the configured planning benchmark of {planningBenchmarkPct}% (₹{benchmarkRequiredEquity.toLocaleString('en-IN')}). Consider reviewing equity allocation or project scale.</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>Promoter contribution meets or exceeds the {planningBenchmarkPct}% planning benchmark.</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft size={14} /> Back to Project Cost
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={capStruct.isZeroCost}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
        >
          Proceed to Scheme Matching <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
