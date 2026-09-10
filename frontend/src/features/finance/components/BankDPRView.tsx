import React, { useState } from 'react';
import { Printer, Download, ArrowLeft, Building, User, MapPin, Calculator, Landmark, ShieldCheck, FileText, CheckCircle2, Save, Sparkles, TrendingUp, BarChart2, FolderCheck, Calendar, Eye, Trash2, PlusCircle } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import type { PromoterData } from './Step1Promoter';
import type { DatasetBusiness } from '../../../services/businessDataService';
import type { CapExItem, AmortizationSummary, YearForecast, FinancialRatios, SensitivityScenario } from '../services/financialEngine';

export interface SavedAssessmentRecord {
  id: string;
  title: string;
  businessName: string;
  location: string;
  dateSaved: string;
  totalProjectCost: number;
  debtAmount: number;
  promoterEquity: number;
  verdict: string;
  score: number;
  minDSCR: number;
  breakEvenMonths: number;
  roiPct: number;
  paybackPeriodYears: number;
  snapshot: {
    promoter: PromoterData;
    selectedBusiness: DatasetBusiness | null;
    capexItems: CapExItem[];
    funding: any;
    loanInputs: any;
    forecastInputs: any;
    selectedScheme: any;
    completedSteps: number[];
  };
}

interface BankDPRProps {
  promoter: PromoterData;
  business: DatasetBusiness | null;
  items: CapExItem[];
  funding: any;
  amortization: AmortizationSummary;
  forecast: YearForecast[];
  ratios: FinancialRatios;
  sensitivity: SensitivityScenario[];
  selectedScheme: any;
  onBack: () => void;
  onFinishAndSave?: () => void;
  lastSavedTime?: string;
  savedAssessments?: SavedAssessmentRecord[];
  onLoadAssessment?: (record: SavedAssessmentRecord) => void;
  onDeleteAssessment?: (id: string) => void;
  onStartNewAssessment?: () => void;
  onViewModeChange?: (mode: 'report' | 'portfolio') => void;
  initialTab?: 'report' | 'portfolio';
}

export const BankDPRView: React.FC<BankDPRProps> = ({
  promoter,
  business,
  items,
  funding,
  amortization,
  forecast,
  ratios,
  sensitivity,
  selectedScheme,
  onBack,
  onFinishAndSave,
  lastSavedTime,
  savedAssessments = [],
  onLoadAssessment,
  onDeleteAssessment,
  onStartNewAssessment,
  onViewModeChange,
  initialTab = 'report'
}) => {
  const [viewTab, setViewTab] = useState<'report' | 'portfolio'>(initialTab);
  const [showSaveToast, setShowSaveToast] = useState(false);

  const switchViewTab = (tab: 'report' | 'portfolio') => {
    setViewTab(tab);
    if (onViewModeChange) {
      onViewModeChange(tab);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveAssessment = () => {
    if (onFinishAndSave) {
      onFinishAndSave();
    }
    switchViewTab('portfolio');
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 5000);
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const chartData = forecast.map(f => ({
    name: `Yr ${f.year}`,
    Revenue: f.revenue,
    OpEx: f.operatingCosts,
    NetProfit: f.netProfit
  }));

  const sensitivityChartData = sensitivity.slice(0, 6).map(sc => ({
    name: sc.scenarioName.length > 14 ? sc.scenarioName.slice(0, 14) + '...' : sc.scenarioName,
    DSCR: parseFloat(sc.projectedDSCR.toFixed(2))
  }));

  return (
    <div className="space-y-6">
      {/* Save Success Toast Banner */}
      {showSaveToast && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white shadow-xl flex items-center justify-between gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-300 print:hidden">
          <div className="flex items-center gap-2">
            <Sparkles size={18} />
            <span>Feasibility Assessment & Bank DPR saved to your portfolio! Viewing all saved assessments below.</span>
          </div>
          <span className="text-[10px] bg-white/20 px-2 py-1 rounded-lg uppercase">PORTFOLIO UPDATED</span>
        </div>
      )}

      {/* Active Report Mode Header Controls */}
      {viewTab === 'report' && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0c0d10] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs print:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <ArrowLeft size={14} /> Back to Feasibility Dashboard
            </button>

            <button
              type="button"
              onClick={() => switchViewTab('portfolio')}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FolderCheck size={14} /> Saved Portfolio ({savedAssessments.length})
            </button>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={handleSaveAssessment}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={14} /> Finish & Save Assessment
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={14} /> Print / Save as PDF DPR
            </button>
          </div>
        </div>
      )}

      {/* View Tab 1: All Saved Feasibility Assessments Directory */}
      {viewTab === 'portfolio' && (
        <div className="bg-white dark:bg-[#0c0d10] p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <FolderCheck className="text-emerald-500" size={20} />
                All Saved Feasibility Assessments Directory
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Saved business models & Bank DPR reports stored in your session. Click any card to review or load its full financial model.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => switchViewTab('report')}
                className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileText size={14} /> Active Report
              </button>

              <button
                type="button"
                onClick={onStartNewAssessment}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5 w-fit"
              >
                <PlusCircle size={15} /> Start New Assessment
              </button>
            </div>
          </div>

          {savedAssessments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedAssessments.map(record => (
                <div
                  key={record.id}
                  className="p-4.5 rounded-2xl bg-gray-50 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 hover:border-emerald-500/50 transition-all space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                        <Calendar size={12} /> {record.dateSaved}
                      </div>
                      <h4 className="text-sm font-extrabold text-gray-900 dark:text-white mt-0.5">
                        {record.businessName}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">
                        📍 {record.location}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-black text-[10px] shadow-xs">
                        SCORE {record.score}/100
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {record.verdict}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800 text-[11px] font-mono">
                    <div>
                      <span className="text-[9px] text-gray-400 font-sans block uppercase">Project Cost</span>
                      <strong className="text-gray-900 dark:text-white">₹{(record.totalProjectCost / 100000).toFixed(1)}L</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 font-sans block uppercase">Bank Debt</span>
                      <strong className="text-blue-600 dark:text-blue-400">₹{(record.debtAmount / 100000).toFixed(1)}L</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 font-sans block uppercase">Min DSCR</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">{record.minDSCR.toFixed(2)}x</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 font-sans block uppercase">Payback</span>
                      <strong className="text-gray-900 dark:text-white">{record.paybackPeriodYears} Yrs</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (onLoadAssessment) onLoadAssessment(record);
                        switchViewTab('report');
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Eye size={14} /> Load & View DPR Report
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteAssessment && onDeleteAssessment(record.id)}
                      className="p-2 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-400 hover:text-rose-500 hover:border-rose-500/40 text-xs transition-all cursor-pointer"
                      title="Delete Saved Assessment"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center space-y-2">
              <FolderCheck size={32} className="mx-auto text-gray-400" />
              <div className="text-sm font-bold text-gray-700 dark:text-zinc-300">No Saved Assessments Yet</div>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Click <strong>Finish & Save Assessment</strong> at the top to save your current project feasibility model into this portfolio directory.
              </p>
            </div>
          )}
        </div>
      )}

      {/* View Tab 2: Printable Bank DPR Document */}
      {(viewTab === 'report' || typeof window !== 'undefined') && (
        <div className={viewTab === 'report' ? 'block' : 'hidden print:block'}>

      {/* Printable Bank DPR Document */}
      <div className="bg-white text-gray-900 p-8 sm:p-12 rounded-2xl border border-gray-200 shadow-lg space-y-8 font-sans print:shadow-none print:border-none print:p-0 print:m-0">
        {/* Report Header */}
        <div className="border-b-2 border-emerald-600 pb-6 flex justify-between items-start">
          <div>
            <div className="text-xs font-black tracking-widest text-emerald-600 uppercase">RURALNEX FINANCIAL FEASIBILITY ENGINE</div>
            <h1 className="text-2xl font-black text-gray-900 mt-1">DETAILED PROJECT REPORT (DPR)</h1>
            <p className="text-xs text-gray-500 mt-0.5">Prepared for Institutional Bank Credit Appraisal & Priority Sector Financing</p>
          </div>

          <div className="text-right text-xs font-mono text-gray-500">
            <div><strong>Date:</strong> {currentDate}</div>
            <div><strong>Report ID:</strong> DPR-{Date.now().toString().slice(-6)}</div>
            <div><strong>Status:</strong> {ratios.feasibilityVerdict}</div>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-gray-900 border-b border-gray-200 pb-1 uppercase tracking-wider">
            1. Executive Summary
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div>
              <span className="text-gray-500 text-[10px] uppercase font-bold">Proposed Business</span>
              <div className="font-bold text-gray-900">{business?.name || 'Rural Enterprise'}</div>
            </div>
            <div>
              <span className="text-gray-500 text-[10px] uppercase font-bold">Total Project Cost</span>
              <div className="font-bold text-gray-900 font-mono">₹{ratios.totalProjectCost.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <span className="text-gray-500 text-[10px] uppercase font-bold">Promoter Equity</span>
              <div className="font-bold text-emerald-600 font-mono">₹{ratios.promoterEquity.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <span className="text-gray-500 text-[10px] uppercase font-bold">Bank Debt Required</span>
              <div className="font-bold text-blue-600 font-mono">₹{ratios.debtAmount.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </section>

        {/* 2. Promoter Profile */}
        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-gray-900 border-b border-gray-200 pb-1 uppercase tracking-wider">
            2. Promoter Profile & Background
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div><strong>Promoter Name:</strong> {promoter.name || 'N/A'}</div>
            <div><strong>Age / Gender:</strong> {promoter.age} yrs / {promoter.gender}</div>
            <div><strong>Social Category:</strong> {promoter.socialCategory.toUpperCase()}</div>
            <div><strong>Education:</strong> {promoter.education}</div>
            <div><strong>Project Stage:</strong> {promoter.projectStage.toUpperCase()}</div>
          </div>
        </section>

        {/* 3. Project Location */}
        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-gray-900 border-b border-gray-200 pb-1 uppercase tracking-wider">
            3. Project Location & Geographic Context
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div><strong>State:</strong> {promoter.state}</div>
            <div><strong>District:</strong> {promoter.district}</div>
            <div><strong>Village/Settlement:</strong> {promoter.village || 'N/A'}</div>
            <div><strong>Classification:</strong> {promoter.areaType.toUpperCase()} AREA</div>
          </div>
        </section>

        {/* 4. Project Cost (CapEx Breakdown) */}
        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-gray-900 border-b border-gray-200 pb-1 uppercase tracking-wider">
            4. Itemized Project Cost (CapEx)
          </h2>
          <table className="w-full text-left text-xs border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100 font-bold border-b border-gray-200">
                <th className="p-2">Item Description</th>
                <th className="p-2 text-center">Category</th>
                <th className="p-2 text-center">Qty</th>
                <th className="p-2 text-right">Unit Cost (₹)</th>
                <th className="p-2 text-right">Total Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-mono">
              {items.map(item => (
                <tr key={item.id}>
                  <td className="p-2 font-sans font-medium">{item.name}</td>
                  <td className="p-2 text-center font-sans text-gray-500">{item.category}</td>
                  <td className="p-2 text-center">{item.quantity}</td>
                  <td className="p-2 text-right">₹{item.unit_cost.toLocaleString('en-IN')}</td>
                  <td className="p-2 text-right font-bold">₹{(item.quantity * item.unit_cost).toLocaleString('en-IN')}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold text-sm font-sans">
                <td colSpan={4} className="p-2 text-right">TOTAL PROJECT COST</td>
                <td className="p-2 text-right font-mono text-emerald-600">₹{ratios.totalProjectCost.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 5. Means of Finance */}
        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-gray-900 border-b border-gray-200 pb-1 uppercase tracking-wider">
            5. Means of Finance & Capital Structure
          </h2>
          <div className="grid grid-cols-3 gap-3 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200 font-mono">
            <div>
              <span className="font-sans font-bold text-gray-700">Promoter Equity</span>
              <div className="text-sm font-bold text-emerald-600">₹{ratios.promoterEquity.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <span className="font-sans font-bold text-gray-700">Govt. Subsidy (Est.)</span>
              <div className="text-sm font-bold text-purple-600">₹{funding.estimatedSubsidy?.toLocaleString('en-IN') || 0}</div>
            </div>
            <div>
              <span className="font-sans font-bold text-gray-700">Bank Debt Required</span>
              <div className="text-sm font-bold text-blue-600">₹{ratios.debtAmount.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </section>

        {/* 6. Bank Loan & Amortization */}
        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-gray-900 border-b border-gray-200 pb-1 uppercase tracking-wider">
            6. Bank Loan Repayment & Amortization Schedule
          </h2>
          <table className="w-full text-left text-xs border-collapse border border-gray-200 font-mono">
            <thead>
              <tr className="bg-gray-100 font-bold border-b border-gray-200 font-sans">
                <th className="p-2">Year</th>
                <th className="p-2 text-right">Opening Principal</th>
                <th className="p-2 text-right">Principal Payment</th>
                <th className="p-2 text-right">Interest Payment</th>
                <th className="p-2 text-right">Total Payment</th>
                <th className="p-2 text-right">Closing Principal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {amortization.annualSchedule.map(row => (
                <tr key={row.year}>
                  <td className="p-2 font-sans font-bold">Year {row.year}</td>
                  <td className="p-2 text-right">₹{row.openingPrincipal.toLocaleString('en-IN')}</td>
                  <td className="p-2 text-right font-bold text-emerald-600">₹{row.principalPayment.toLocaleString('en-IN')}</td>
                  <td className="p-2 text-right text-amber-600">₹{row.interestPayment.toLocaleString('en-IN')}</td>
                  <td className="p-2 text-right font-bold">₹{row.totalPayment.toLocaleString('en-IN')}</td>
                  <td className="p-2 text-right">₹{row.closingPrincipal.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 7. Projected Income Statement & Visual Trajectory Graph */}
        <section className="space-y-4">
          <h2 className="text-base font-extrabold text-gray-900 border-b border-gray-200 pb-1 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-600" />
            7. Financial Forecast & Cash Flow Trajectory Graph
          </h2>

          {/* Visual Financial Performance Graph */}
          <div className="p-4.5 rounded-2xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 print:bg-white print:border-gray-300 space-y-2.5">
            <div className="text-xs font-bold text-gray-800 dark:text-zinc-200 flex justify-between items-center">
              <span>Financial Projection Trajectory (Revenue vs OpEx vs Net Profit)</span>
              <span className="text-[10px] text-gray-500 dark:text-zinc-400 font-mono">Project Duration: {forecast.length} Years</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 15, left: 15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevDPR" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOpexDPR" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfitDPR" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} stroke="#6B7280" />
                  <XAxis dataKey="name" stroke="#6B7280" tick={{ fontSize: 11, fill: '#888888' }} />
                  <YAxis stroke="#6B7280" tickFormatter={v => `₹${(v/100000).toFixed(1)}L`} tick={{ fontSize: 11, fill: '#888888' }} />
                  <Tooltip 
                    formatter={(val: any, name: any) => [
                      `₹${Number(val).toLocaleString('en-IN')}`,
                      name === 'Revenue' ? 'Gross Revenue' : name === 'OpEx' ? 'Operating Expenses' : name === 'NetProfit' ? 'Net Profit (PAT)' : name
                    ]}
                    contentStyle={{ backgroundColor: '#090a0f', borderColor: '#27272a', borderRadius: '12px', padding: '10px 14px', color: '#ffffff', fontSize: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Area type="monotone" dataKey="Revenue" name="Gross Revenue" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevDPR)" />
                  <Area type="monotone" dataKey="OpEx" name="Operating Expenses" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorOpexDPR)" />
                  <Area type="monotone" dataKey="NetProfit" name="Net Profit (PAT)" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProfitDPR)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <table className="w-full text-left text-xs border-collapse border border-gray-200 font-mono">
            <thead>
              <tr className="bg-gray-100 font-bold border-b border-gray-200 font-sans">
                <th className="p-2">Line Item (₹)</th>
                {forecast.map(f => <th key={f.year} className="p-2 text-right">Year {f.year}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="p-2 font-sans font-bold">Gross Revenue</td>
                {forecast.map(f => <td key={f.year} className="p-2 text-right font-bold text-emerald-600">₹{f.revenue.toLocaleString('en-IN')}</td>)}
              </tr>
              <tr>
                <td className="p-2 font-sans">Operating Expenses</td>
                {forecast.map(f => <td key={f.year} className="p-2 text-right">₹{f.operatingCosts.toLocaleString('en-IN')}</td>)}
              </tr>
              <tr className="bg-gray-50 font-bold font-sans">
                <td className="p-2">EBITDA</td>
                {forecast.map(f => <td key={f.year} className="p-2 text-right font-mono">₹{f.ebitda.toLocaleString('en-IN')}</td>)}
              </tr>
              <tr>
                <td className="p-2 font-sans">Interest Expense</td>
                {forecast.map(f => <td key={f.year} className="p-2 text-right text-amber-600">₹{f.interestExpense.toLocaleString('en-IN')}</td>)}
              </tr>
              <tr>
                <td className="p-2 font-sans">Depreciation (10%)</td>
                {forecast.map(f => <td key={f.year} className="p-2 text-right">₹{f.depreciation.toLocaleString('en-IN')}</td>)}
              </tr>
              <tr className="font-bold font-sans">
                <td className="p-2 text-emerald-600">Net Profit (PAT)</td>
                {forecast.map(f => <td key={f.year} className="p-2 text-right font-mono font-bold">₹{f.netProfit.toLocaleString('en-IN')}</td>)}
              </tr>
              <tr className="bg-gray-100 font-extrabold font-sans">
                <td className="p-2">Net Cash Flow</td>
                {forecast.map(f => <td key={f.year} className="p-2 text-right font-mono">₹{f.cashFlow.toLocaleString('en-IN')}</td>)}
              </tr>
            </tbody>
          </table>
        </section>

        {/* 8. Ratios & Downside Sensitivity Graph */}
        <section className="space-y-4">
          <h2 className="text-base font-extrabold text-gray-900 border-b border-gray-200 pb-1 uppercase tracking-wider flex items-center gap-2">
            <BarChart2 size={18} className="text-blue-600" />
            8. Key Financial Ratios & Stress Test Graph
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200 font-mono">
            <div>
              <span className="font-sans font-bold text-gray-700">DSCR</span>
              <div className="text-sm font-bold text-emerald-600">{ratios.dscr.toFixed(2)}x</div>
            </div>
            <div>
              <span className="font-sans font-bold text-gray-700">Break-Even</span>
              <div className="text-sm font-bold">{ratios.breakEvenMonths} Months</div>
            </div>
            <div>
              <span className="font-sans font-bold text-gray-700">ROI</span>
              <div className="text-sm font-bold">{ratios.roiPct}% P.A.</div>
            </div>
            <div>
              <span className="font-sans font-bold text-gray-700">Payback Period</span>
              <div className="text-sm font-bold">{ratios.paybackPeriodYears} Years</div>
            </div>
          </div>

          {/* Visual DSCR Stress Graph */}
          {sensitivityChartData.length > 0 && (
            <div className="p-4.5 rounded-2xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 print:bg-white print:border-gray-300 space-y-2.5">
              <div className="text-xs font-bold text-gray-800 dark:text-zinc-200 flex justify-between items-center">
                <span>DSCR Debt Service Resilience Across Downside Scenarios</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">Benchmark: 1.25x Min</span>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sensitivityChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} stroke="#6B7280" />
                    <XAxis dataKey="name" stroke="#6B7280" tick={{ fontSize: 10, fill: '#888888' }} />
                    <YAxis stroke="#6B7280" tickFormatter={v => `${v}x`} tick={{ fontSize: 11, fill: '#888888' }} />
                    <Tooltip 
                      formatter={(val: any) => [`${val}x`, 'DSCR Coverage Ratio']}
                      contentStyle={{ backgroundColor: '#090a0f', borderColor: '#27272a', borderRadius: '12px', padding: '10px 14px', color: '#ffffff', fontSize: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                    />
                    <Bar dataKey="DSCR" radius={[6, 6, 0, 0]}>
                      {sensitivityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.DSCR >= 1.5 ? '#10B981' : entry.DSCR >= 1.25 ? '#F59E0B' : '#EF4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </section>

        {/* Disclaimer Footer */}
        <div className="border-t border-gray-200 pt-4 text-[10px] text-gray-500 space-y-1">
          <p><strong>Disclaimer:</strong> This Detailed Project Report (DPR) is generated deterministically by the RuralNex GIS Telemetry & Financial Planning System. Financial projections are planning estimates subject to institutional appraisal norms of participating banks and official scheme guidelines.</p>
        </div>
      </div>
    </div>
  )}
</div>
  );
};
