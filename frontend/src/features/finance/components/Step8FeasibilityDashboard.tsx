import React, { useState } from 'react';
import {
  PieChart,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  HelpCircle,
  Activity,
  Table,
  Info,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Sliders,
  Sparkles
} from 'lucide-react';
import type { FinancialRatios, SensitivityScenario, DataConfidenceItem } from '../services/financialEngine';

interface Step8Props {
  ratios: FinancialRatios;
  sensitivity: SensitivityScenario[];
  onGenerateDPR: () => void;
  onFinishAndSave: () => void;
  onBack: () => void;
}

export const Step8FeasibilityDashboard: React.FC<Step8Props> = ({
  ratios,
  sensitivity,
  onGenerateDPR,
  onFinishAndSave,
  onBack
}) => {
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(true);

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'VERY STRONG':
        return <span className="px-3 py-1 rounded-xl bg-emerald-500 text-white font-black text-xs shadow-xs">VERY STRONG FEASIBILITY</span>;
      case 'STRONG':
        return <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-xs">STRONG FEASIBILITY</span>;
      case 'MODERATELY STRONG':
        return <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-black text-xs shadow-xs">MODERATELY STRONG FEASIBILITY</span>;
      case 'MODERATE':
        return <span className="px-3 py-1 rounded-xl bg-blue-500 text-white font-black text-xs shadow-xs">MODERATE FEASIBILITY</span>;
      case 'WEAK':
        return <span className="px-3 py-1 rounded-xl bg-amber-500 text-white font-black text-xs shadow-xs">WEAK FEASIBILITY</span>;
      case 'HIGH RISK':
      case 'RISK':
        return <span className="px-3 py-1 rounded-xl bg-rose-500 text-white font-black text-xs shadow-xs">HIGH RISK / INSUFFICIENT MARGIN</span>;
      default:
        return <span className="px-3 py-1 rounded-xl bg-zinc-500 text-white font-black text-xs shadow-xs">INSUFFICIENT DATA</span>;
    }
  };

  const confidenceItems: DataConfidenceItem[] = [
    { field: 'Project Location', sourceType: 'DATASET FACT', confidenceScore: 'HIGH', sourceName: 'Location & Village Datasets' },
    { field: 'Proposed Business', sourceType: 'DATASET FACT', confidenceScore: 'HIGH', sourceName: '6. BUSINESSES & ASUSE Datasets' },
    { field: 'Location Demographics', sourceType: 'DATASET FACT', confidenceScore: 'HIGH', sourceName: 'Population & Infrastructure Datasets' },
    { field: 'Daily Wage Rates', sourceType: 'DATASET FACT', confidenceScore: 'HIGH', sourceName: 'Rural Wages Dataset' },
    { field: 'CapEx Items & Cost', sourceType: 'USER INPUT', confidenceScore: 'HIGH', sourceName: 'User Input' },
    { field: 'Promoter Equity', sourceType: 'USER INPUT', confidenceScore: 'HIGH', sourceName: 'User Input' },
    { field: 'Base Revenue & OpEx', sourceType: 'USER INPUT', confidenceScore: 'HIGH', sourceName: 'User Input' },
    { field: 'Loan EMI & Amortization', sourceType: 'CALCULATED', confidenceScore: 'HIGH', sourceName: 'Financial Engine Math' },
    { field: 'DSCR & Ratios', sourceType: 'CALCULATED', confidenceScore: 'HIGH', sourceName: 'Financial Engine Math' },
    { field: 'Government Subsidy Rules', sourceType: 'VERIFICATION REQUIRED', confidenceScore: 'MEDIUM', sourceName: 'Central/State Scheme Guidelines' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <PieChart className="text-emerald-500" size={22} />
          Step 8: Financial Feasibility Summary, Risk & Sensitivity Engine
        </h2>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
          Auditable project feasibility scoring, DSCR debt service analysis, reverse stress limits, dynamic risk register, and data confidence audit.
        </p>
      </div>

      {/* Required Disclaimer Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
        <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          <strong>RuralNex Planning Feasibility Assessment Disclaimer:</strong>
          <span className="ml-1">
            This score is a model-based planning assessment derived from entered operational assumptions and data. It does not guarantee project success, statutory subsidy eligibility, or institutional bank loan approval.
          </span>
        </div>
      </div>

      {/* Main Feasibility Assessment Card with Weighted Score */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0c0d10] border border-gray-200 dark:border-zinc-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-zinc-800 pb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              {getVerdictBadge(ratios.feasibilityVerdict)}
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                Planning Score: {ratios.verdictScore}/100
              </span>
              <span className="text-xs font-mono text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded-xl">
                Data Confidence: {ratios.dataConfidenceScore}/100
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
              Project Financial Feasibility & Risk Assessment
            </h3>
            <p className="text-xs text-gray-600 dark:text-zinc-400">
              Under modeled operational assumptions: Min DSCR is <strong className="text-gray-900 dark:text-white font-mono">{ratios.minDSCR.toFixed(2)}x</strong>, Year 1 Net Profit is <strong className="text-emerald-600 dark:text-emerald-400 font-mono">₹{ratios.annualNetProfitYr1.toLocaleString('en-IN')}</strong>, and Break-Even is reached at <strong className="text-gray-900 dark:text-white font-mono">{ratios.breakEvenMonths} Months</strong>.
            </p>
          </div>

        </div>

        {/* Toggle Score Component Breakdown */}
        <div>
          <button
            type="button"
            onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 hover:underline cursor-pointer"
          >
            <Sparkles size={14} />
            {showScoreBreakdown ? 'Hide Weighted Score Component Breakdown' : 'View Weighted Score Component Breakdown'}
            {showScoreBreakdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showScoreBreakdown && ratios.scoreBreakdown && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-100 dark:border-zinc-800 text-xs">
              <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800">
                <span className="text-[9px] font-bold text-gray-400 block uppercase">Profitability</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                  {ratios.scoreBreakdown.profitabilityScore} <span className="text-[10px] text-gray-400">/ 20</span>
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800">
                <span className="text-[9px] font-bold text-gray-400 block uppercase">Debt Service</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                  {ratios.scoreBreakdown.debtServiceScore} <span className="text-[10px] text-gray-400">/ 20</span>
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800">
                <span className="text-[9px] font-bold text-gray-400 block uppercase">Cash Flow</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                  {ratios.scoreBreakdown.cashFlowScore} <span className="text-[10px] text-gray-400">/ 15</span>
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800">
                <span className="text-[9px] font-bold text-gray-400 block uppercase">Break-Even</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                  {ratios.scoreBreakdown.breakEvenScore} <span className="text-[10px] text-gray-400">/ 10</span>
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800">
                <span className="text-[9px] font-bold text-gray-400 block uppercase">Downside Test</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                  {ratios.scoreBreakdown.downsideResilienceScore} <span className="text-[10px] text-gray-400">/ 15</span>
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800">
                <span className="text-[9px] font-bold text-gray-400 block uppercase">Promoter Equity</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                  {ratios.scoreBreakdown.promoterEquityScore} <span className="text-[10px] text-gray-400">/ 10</span>
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800 col-span-2 sm:col-span-1">
                <span className="text-[9px] font-bold text-gray-400 block uppercase">Data Confidence</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                  {ratios.scoreBreakdown.dataConfidenceScore} <span className="text-[10px] text-gray-400">/ 10</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DSCR Sanity Warning if Unusually High */}
      {ratios.isDSCRUnusuallyHigh && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-500 shrink-0" />
          <span>
            <strong>DSCR Sanity Warning:</strong> {ratios.dscrWarning}
          </span>
        </div>
      )}

      {/* Key Financial Indicators Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c0d10] border border-gray-200 dark:border-zinc-800 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">TOTAL COST</span>
          <div className="text-lg font-black text-gray-900 dark:text-white font-mono mt-1">
            ₹{ratios.totalProjectCost.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c0d10] border border-gray-200 dark:border-zinc-800 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">YR 1 NET PROFIT</span>
          <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            ₹{ratios.annualNetProfitYr1.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c0d10] border border-gray-200 dark:border-zinc-800 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">MIN / AVG DSCR</span>
          <div className={`text-lg font-black font-mono mt-1 ${ratios.minDSCR >= 1.5 ? 'text-emerald-600 dark:text-emerald-400' : ratios.minDSCR >= 1.25 ? 'text-amber-500' : 'text-rose-500'}`}>
            {ratios.minDSCR.toFixed(2)}x <span className="text-xs text-gray-400 font-normal">({ratios.avgDSCR.toFixed(2)}x avg)</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c0d10] border border-gray-200 dark:border-zinc-800 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">BREAK-EVEN</span>
          <div className="text-lg font-black text-gray-900 dark:text-white font-mono mt-1">
            {ratios.breakEvenMonths} Months
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c0d10] border border-gray-200 dark:border-zinc-800 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">PLANNING ROI</span>
          <div className="text-lg font-black text-gray-900 dark:text-white font-mono mt-1">
            {ratios.roiPct}% P.A.
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c0d10] border border-gray-200 dark:border-zinc-800 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">PAYBACK PERIOD</span>
          <div className="text-lg font-black text-gray-900 dark:text-white font-mono mt-1">
            {ratios.paybackPeriodYears} Years
          </div>
        </div>
      </div>

      {/* What is Driving Feasibility? Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 shadow-xs space-y-2">
          <h4 className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Positive Feasibility Drivers
          </h4>
          <ul className="text-xs text-gray-700 dark:text-zinc-300 space-y-1">
            {ratios.positiveDrivers && ratios.positiveDrivers.length > 0 ? (
              ratios.positiveDrivers.map((d, i) => <li key={i}>✓ {d}</li>)
            ) : (
              <li>✓ Positive operating cash flow generated under base assumptions.</li>
            )}
          </ul>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 shadow-xs space-y-2">
          <h4 className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle size={14} /> Risk & Key Sensitivity Drivers
          </h4>
          <ul className="text-xs text-gray-700 dark:text-zinc-300 space-y-1">
            {ratios.riskDrivers && ratios.riskDrivers.length > 0 ? (
              ratios.riskDrivers.map((rd, i) => <li key={i}>⚠ {rd}</li>)
            ) : (
              <li>⚠ Assumptions require market price and volume validation.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Break-Even & Reverse Stress Testing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Break-Even & Margin of Safety */}
        <div className="bg-white dark:bg-[#0c0d10] p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-2">
            <Activity size={16} className="text-emerald-500" />
            Break-Even & Margin of Safety
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
              <span className="text-gray-600 dark:text-zinc-400 font-medium">Break-Even Annual Revenue</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">
                ₹{ratios.breakEvenRevenue.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
              <span className="text-gray-600 dark:text-zinc-400 font-medium">Margin of Safety</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {ratios.breakEvenMarginOfSafetyPct}%
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
              <span className="text-gray-600 dark:text-zinc-400 font-medium">Return on Investment (Planning ROI)</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">
                {ratios.roiPct}% P.A.
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
              <span className="text-gray-600 dark:text-zinc-400 font-medium">Cumulative Cash Payback Period</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">
                {ratios.paybackPeriodYears} Years
              </span>
            </div>
          </div>
        </div>

        {/* Reverse Stress Testing / Breakpoints */}
        <div className="bg-white dark:bg-[#0c0d10] p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-2">
            <Sliders size={16} className="text-blue-500" />
            Reverse Stress Test (Model Breakpoints)
          </h3>

          {ratios.reverseStressTest && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-300 font-medium">
                {ratios.reverseStressTest.message}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block">REVENUE STRESS LIMIT</span>
                  <div className="text-base font-black text-rose-500 font-mono mt-0.5">
                    -{ratios.reverseStressTest.maxRevenueDeclinePct}%
                  </div>
                  <span className="text-[9px] text-gray-400 block">Max drop before zero EBITDA</span>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block">OPEX STRESS LIMIT</span>
                  <div className="text-base font-black text-rose-500 font-mono mt-0.5">
                    +{ratios.reverseStressTest.maxOpExEscalationPct}%
                  </div>
                  <span className="text-[9px] text-gray-400 block">Max rise before zero EBITDA</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Downside Sensitivity Matrix (9 Scenarios) */}
      <div className="bg-white dark:bg-[#0c0d10] p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-2">
          <TrendingUp size={16} className="text-emerald-500" />
          Downside Sensitivity & Stress Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-800 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-2 px-3">Scenario</th>
                <th className="py-2 px-3 text-right">Net Profit (₹)</th>
                <th className="py-2 px-3 text-right">Cash Flow (₹)</th>
                <th className="py-2 px-3 text-right">DSCR</th>
                <th className="py-2 px-3 text-center">Risk Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60 text-xs">
              {sensitivity.map((sc, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50">
                  <td className="py-2 px-3 font-medium text-gray-800 dark:text-zinc-200">{sc.scenarioName}</td>
                  <td className={`py-2 px-3 text-right font-mono font-bold ${sc.projectedProfit >= 0 ? 'text-gray-900 dark:text-white' : 'text-rose-500'}`}>
                    ₹{sc.projectedProfit.toLocaleString('en-IN')}
                  </td>
                  <td className={`py-2 px-3 text-right font-mono font-bold ${sc.projectedCashFlow >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500'}`}>
                    ₹{sc.projectedCashFlow.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                    {sc.projectedDSCR.toFixed(2)}x
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      sc.riskLevel === 'LOW' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                      sc.riskLevel === 'MEDIUM' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' :
                      sc.riskLevel === 'HIGH' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                    }`}>
                      {sc.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Key Project Risk Register */}
      <div className="bg-white dark:bg-[#0c0d10] p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-2">
          <AlertTriangle size={16} className="text-amber-500" />
          Key Project Risks & Mitigation Register
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ratios.risks && ratios.risks.length > 0 ? (
            ratios.risks.map(r => (
              <div key={r.id} className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{r.category}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                    r.severity === 'HIGH' ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600'
                  }`}>
                    {r.severity} SEVERITY
                  </span>
                </div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">{r.riskName}</h4>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400">{r.reason}</p>
                <div className="pt-1.5 border-t border-gray-200/50 dark:border-zinc-800 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Mitigation: {r.mitigation}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-xs text-gray-400 text-center py-2">
              No critical risk indicators flagged under base assumptions.
            </div>
          )}
        </div>
      </div>

      {/* Data Confidence Audit Matrix */}
      <div className="bg-white dark:bg-[#0c0d10] p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-2">
          <ShieldCheck size={16} className="text-emerald-500" />
          Data Confidence & Source Audit
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {confidenceItems.map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">{item.field}</span>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md inline-block ${
                item.sourceType === 'DATASET FACT' ? 'bg-emerald-500/10 text-emerald-600' :
                item.sourceType === 'USER INPUT' ? 'bg-blue-500/10 text-blue-600' :
                item.sourceType === 'CALCULATED' ? 'bg-purple-500/10 text-purple-600' : 'bg-amber-500/10 text-amber-600'
              }`}>
                {item.sourceType}
              </span>
              <p className="text-[10px] text-gray-500 dark:text-zinc-400 truncate mt-1">
                {item.sourceName}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <ArrowLeft size={14} /> Back to Forecast
        </button>

        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={onFinishAndSave}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 size={15} /> Finish & Save Assessment
          </button>

          <button
            type="button"
            onClick={onGenerateDPR}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <FileText size={14} /> View & Export Detailed Bank DPR <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

