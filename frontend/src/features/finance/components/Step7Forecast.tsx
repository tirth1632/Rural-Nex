import React, { useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Sliders,
  Table,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Info,
  ArrowLeft,
  ArrowRight,
  PieChart
} from 'lucide-react';
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
  Legend
} from 'recharts';
import type { YearForecast } from '../services/financialEngine';

export interface ForecastInputs {
  baseMonthlyRevenue: number;
  baseMonthlyOpEx: number;
  revenueGrowthPct: number;
  expenseGrowthPct: number;
  taxRatePct: number;
}

interface Step7Props {
  inputs: ForecastInputs;
  onChange: (updated: Partial<ForecastInputs>) => void;
  onNext: () => void;
  onBack: () => void;
  forecast: YearForecast[];
}

export const Step7Forecast: React.FC<Step7Props> = ({
  inputs,
  onChange,
  onNext,
  onBack,
  forecast
}) => {
  const yr1 = forecast[0] || {
    revenue: 0,
    operatingCosts: 0,
    ebitda: 0,
    ebitdaMarginPct: 0,
    interestExpense: 0,
    depreciation: 0,
    profitBeforeTax: 0,
    tax: 0,
    netProfit: 0,
    principalRepayment: 0,
    cashFlow: 0,
    closingDebtBalance: 0,
    isInterestReconciled: true
  };

  const forecastYearsCount = forecast.length || 5;

  const cumulativeCashFlow = useMemo(
    () => forecast.reduce((sum, f) => sum + f.cashFlow, 0),
    [forecast]
  );

  const chartData = useMemo(() => {
    return forecast.map(f => ({
      name: `Year ${f.year}`,
      Revenue: f.revenue,
      OpEx: f.operatingCosts,
      EBITDA: f.ebitda,
      NetProfit: f.netProfit,
      CashFlow: f.cashFlow,
      DebtBalance: f.closingDebtBalance
    }));
  }, [forecast]);

  const isReconciled = forecast.length === 0 || forecast.every(f => f.isInterestReconciled);

  // Sanity Check Diagnostics
  const isOpExHigherThanRev = inputs.baseMonthlyOpEx >= inputs.baseMonthlyRevenue && inputs.baseMonthlyRevenue > 0;
  const isNegativeEBITDA = yr1.ebitda < 0;
  const isCashFlowDeficit = yr1.cashFlow < 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="text-emerald-500" size={22} />
          Step 7: Revenue, Expense & {forecastYearsCount}-Year Financial Forecast
        </h2>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
          Model monthly operating revenue, fixed and variable OpEx drivers, interest expense reconciliation, and multi-year cash flow projections for the selected {forecastYearsCount}-year tenure.
        </p>
      </div>

      {/* Top Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c0d10] border border-gray-200 dark:border-zinc-800 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">YEAR 1 REVENUE</span>
          <div className="text-xl font-black text-gray-900 dark:text-white font-mono mt-1">
            ₹{yr1.revenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[9px] text-gray-500 dark:text-zinc-400 mt-0.5 block">Base Annualized</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
            YEAR 1 EBITDA ({yr1.ebitdaMarginPct}%)
          </span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            ₹{yr1.ebitda.toLocaleString('en-IN')}
          </div>
          <span className="text-[9px] text-emerald-700/80 dark:text-emerald-300/80 mt-0.5 block">Operating Surplus</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c0d10] border border-gray-200 dark:border-zinc-800 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">YEAR 1 NET PROFIT</span>
          <div className={`text-xl font-black font-mono mt-1 ${yr1.netProfit >= 0 ? 'text-gray-900 dark:text-white' : 'text-rose-500'}`}>
            ₹{yr1.netProfit.toLocaleString('en-IN')}
          </div>
          <span className="text-[9px] text-gray-500 dark:text-zinc-400 mt-0.5 block">After Tax & Interest</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">YEAR 1 NET CASH FLOW</span>
          <div className={`text-xl font-black font-mono mt-1 ${yr1.cashFlow >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500'}`}>
            ₹{yr1.cashFlow.toLocaleString('en-IN')}
          </div>
          <span className="text-[9px] text-blue-700/80 dark:text-blue-300/80 mt-0.5 block">After Debt Principal</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">{forecastYearsCount}-YR CUMULATIVE CASH</span>
          <div className={`text-xl font-black font-mono mt-1 ${cumulativeCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
            ₹{cumulativeCashFlow.toLocaleString('en-IN')}
          </div>
          <span className="text-[9px] text-emerald-700/80 dark:text-emerald-300/80 mt-0.5 block">Total Retained Cash</span>
        </div>
      </div>

      {/* Single Source of Truth Loan Reconciliation Banner */}
      {isReconciled ? (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            <span>
              <strong>Step 6 Loan Schedule Reconciled:</strong> Interest expense & debt repayments in this forecast are derived strictly from the Step 6 loan amortization schedule.
            </span>
          </div>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
            ✓ RECONCILED
          </span>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-500 shrink-0" />
            <span>
              <strong>Loan interest reconciliation error:</strong> Interest in forecast statement does not match Step 6 loan schedule. Please review Step 6 loan parameters.
            </span>
          </div>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 shrink-0">
            MISMATCH DETECTED
          </span>
        </div>
      )}

      {/* Sanity Check Diagnostic Warnings */}
      {isOpExHigherThanRev && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-500 shrink-0" />
          <span>
            <strong>Operating Cost Warning:</strong> Monthly OpEx (₹{inputs.baseMonthlyOpEx.toLocaleString('en-IN')}) is equal to or exceeds Monthly Revenue (₹{inputs.baseMonthlyRevenue.toLocaleString('en-IN')}). Consider reviewing selling prices or cost drivers.
          </span>
        </div>
      )}

      {isCashFlowDeficit && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-500 shrink-0" />
          <span>
            <strong>Cash Flow Deficit Warning:</strong> Year 1 cash flow is negative due to debt service obligations. Consider extending loan tenure or increasing promoter contribution.
          </span>
        </div>
      )}

      {/* Main Content Grid: Inputs vs Forecast Statement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operational Driver Inputs Card */}
        <div className="bg-white dark:bg-[#0c0d10] p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-2">
            <DollarSign size={16} className="text-emerald-500" />
            Base Operational Drivers (Monthly)
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                BASE MONTHLY REVENUE (₹)
              </label>
              <input
                type="number"
                min="0"
                value={inputs.baseMonthlyRevenue || ''}
                onChange={e => onChange({ baseMonthlyRevenue: Math.max(0, Number(e.target.value) || 0) })}
                placeholder="e.g. 120000"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-900 dark:text-white font-mono focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                BASE MONTHLY OPEX (₹)
              </label>
              <input
                type="number"
                min="0"
                value={inputs.baseMonthlyOpEx || ''}
                onChange={e => onChange({ baseMonthlyOpEx: Math.max(0, Number(e.target.value) || 0) })}
                placeholder="e.g. 70000"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-900 dark:text-white font-mono focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <h4 className="text-xs font-bold text-gray-700 dark:text-zinc-300 pt-2 border-t border-gray-100 dark:border-zinc-800 flex items-center gap-1">
              <Sliders size={13} className="text-emerald-500" /> Growth & Tax Assumptions
            </h4>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                ANNUAL REVENUE GROWTH RATE (% P.A.)
              </label>
              <input
                type="number"
                step="0.5"
                value={inputs.revenueGrowthPct}
                onChange={e => onChange({ revenueGrowthPct: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-900 dark:text-white font-mono focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                ANNUAL OPEX ESCALATION RATE (% P.A.)
              </label>
              <input
                type="number"
                step="0.5"
                value={inputs.expenseGrowthPct}
                onChange={e => onChange({ expenseGrowthPct: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-900 dark:text-white font-mono focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                INCOME TAX RATE (% P.A.)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="40"
                value={inputs.taxRatePct}
                onChange={e => onChange({ taxRatePct: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-900 dark:text-white font-mono focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1 block">
                Planning tax assumption applied on positive PBT.
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Multi-Year Forecast Statement Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-[#0c0d10] p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-2">
              <h3 className="text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Table size={14} className="text-emerald-500" />
                {forecastYearsCount}-Year Projected Income & Cash Flow Statement
              </h3>
            </div>

            {forecast.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-zinc-800 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Metric (₹)</th>
                      {forecast.map(f => (
                        <th key={f.year} className="py-2.5 px-3 text-right whitespace-nowrap">
                          Year {f.year}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60 text-xs font-mono">
                    <tr className="hover:bg-gray-50 dark:hover:bg-zinc-900/50">
                      <td className="py-2 px-3 font-bold text-gray-900 dark:text-white">Gross Revenue</td>
                      {forecast.map(f => (
                        <td key={f.year} className="py-2 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{f.revenue.toLocaleString('en-IN')}
                        </td>
                      ))}
                    </tr>

                    <tr className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 text-gray-600 dark:text-zinc-400">
                      <td className="py-2 px-3 font-medium">Operating Expenses (OpEx)</td>
                      {forecast.map(f => (
                        <td key={f.year} className="py-2 px-3 text-right">
                          ₹{f.operatingCosts.toLocaleString('en-IN')}
                        </td>
                      ))}
                    </tr>

                    <tr className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 bg-gray-50/50 dark:bg-zinc-900/30 font-bold">
                      <td className="py-2 px-3 text-gray-800 dark:text-zinc-200">EBITDA</td>
                      {forecast.map(f => (
                        <td key={f.year} className="py-2 px-3 text-right text-gray-900 dark:text-white">
                          ₹{f.ebitda.toLocaleString('en-IN')}
                        </td>
                      ))}
                    </tr>

                    <tr className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 text-amber-600 dark:text-amber-400">
                      <td className="py-2 px-3 font-medium">Interest Expense (Step 6 Schedule)</td>
                      {forecast.map(f => (
                        <td key={f.year} className="py-2 px-3 text-right font-bold">
                          ₹{f.interestExpense.toLocaleString('en-IN')}
                        </td>
                      ))}
                    </tr>

                    <tr className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 text-gray-500">
                      <td className="py-2 px-3 font-medium">Depreciation (Planning Basis)</td>
                      {forecast.map(f => (
                        <td key={f.year} className="py-2 px-3 text-right">
                          ₹{f.depreciation.toLocaleString('en-IN')}
                        </td>
                      ))}
                    </tr>

                    <tr className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 text-gray-600 dark:text-zinc-400">
                      <td className="py-2 px-3 font-medium">Profit Before Tax (PBT)</td>
                      {forecast.map(f => (
                        <td key={f.year} className={`py-2 px-3 text-right font-bold ${f.profitBeforeTax >= 0 ? 'text-gray-800 dark:text-zinc-200' : 'text-rose-500'}`}>
                          ₹{f.profitBeforeTax.toLocaleString('en-IN')}
                        </td>
                      ))}
                    </tr>

                    <tr className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 text-gray-500">
                      <td className="py-2 px-3 font-medium">Tax Expense ({inputs.taxRatePct}%)</td>
                      {forecast.map(f => (
                        <td key={f.year} className="py-2 px-3 text-right">
                          ₹{f.tax.toLocaleString('en-IN')}
                        </td>
                      ))}
                    </tr>

                    <tr className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 font-bold">
                      <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400">Net Profit (PAT)</td>
                      {forecast.map(f => (
                        <td key={f.year} className={`py-2 px-3 text-right font-bold ${f.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                          ₹{f.netProfit.toLocaleString('en-IN')}
                        </td>
                      ))}
                    </tr>

                    <tr className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 text-gray-600 dark:text-zinc-400">
                      <td className="py-2 px-3 font-medium">Principal Repayment (Step 6)</td>
                      {forecast.map(f => (
                        <td key={f.year} className="py-2 px-3 text-right">
                          ₹{f.principalRepayment.toLocaleString('en-IN')}
                        </td>
                      ))}
                    </tr>

                    <tr className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 border-t border-gray-200 dark:border-zinc-800 bg-blue-500/5 font-extrabold">
                      <td className="py-2 px-3 text-blue-600 dark:text-blue-400">Net Cash Flow</td>
                      {forecast.map(f => (
                        <td key={f.year} className={`py-2 px-3 text-right ${f.cashFlow >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500'}`}>
                          ₹{f.cashFlow.toLocaleString('en-IN')}
                        </td>
                      ))}
                    </tr>

                    <tr className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 text-gray-500 text-[11px]">
                      <td className="py-2 px-3 font-medium">Closing Debt Balance</td>
                      {forecast.map(f => (
                        <td key={f.year} className="py-2 px-3 text-right">
                          ₹{f.closingDebtBalance.toLocaleString('en-IN')}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-gray-400">
                Enter monthly revenue & OpEx drivers to view projections.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Prediction Charts for Inputted Tenure Years */}
      {forecast.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Revenue vs OpEx & EBITDA Prediction Chart */}
          <div className="bg-white dark:bg-[#0c0d10] p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <BarChart2 size={14} className="text-emerald-500" />
              {forecastYearsCount}-Year Revenue, OpEx & EBITDA Prediction Chart
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={10} tickFormatter={v => `₹${(v/100000).toFixed(1)}L`} />
                  <Tooltip
                    formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`}
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Gross Revenue" />
                  <Bar dataKey="OpEx" fill="#f59e0b" radius={[4, 4, 0, 0]} name="OpEx" />
                  <Bar dataKey="EBITDA" fill="#3b82f6" radius={[4, 4, 0, 0]} name="EBITDA" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Net Cash Flow & Debt Balance Payoff Trajectory Chart */}
          <div className="bg-white dark:bg-[#0c0d10] p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={14} className="text-blue-500" />
              {forecastYearsCount}-Year Cash Flow & Loan Payoff Trajectory Chart
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={10} tickFormatter={v => `₹${(v/100000).toFixed(1)}L`} />
                  <Tooltip
                    formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`}
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="CashFlow" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="Net Cash Flow" />
                  <Area type="monotone" dataKey="DebtBalance" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} name="Closing Debt Balance" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft size={14} /> Back to Loan Calculator
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all cursor-pointer flex items-center gap-1.5"
        >
          Proceed to Financial Feasibility & Risks <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

