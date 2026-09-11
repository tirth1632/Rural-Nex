import React from 'react';
import { Landmark, Calendar, Percent, Clock, Table, Calculator } from 'lucide-react';
import { calculateAmortization, type LoanParams, type AmortizationSummary } from '../services/financialEngine';

export interface LoanInputs {
  loanAmount: number;
  interestRatePct: number;
  tenureYears: number;
  moratoriumMonths: number;
  facilityType?: string;
}

interface Step6Props {
  loanInputs: LoanInputs;
  onChange: (updated: Partial<LoanInputs>) => void;
  onNext: () => void;
  onBack: () => void;
  amortizationSummary: AmortizationSummary;
}

export const Step6LoanCalculator: React.FC<Step6Props> = ({
  loanInputs,
  onChange,
  onNext,
  onBack,
  amortizationSummary
}) => {
  const [scheduleView, setScheduleView] = React.useState<'annual' | 'monthly'>('annual');
  const [tenureUnit, setTenureUnit] = React.useState<'years' | 'months'>('years');
  const { monthlyEMI, totalInterest, totalRepayment, annualSchedule, schedule } = amortizationSummary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Landmark className="text-emerald-500" size={22} />
          Step 6: Bank Loan Calculator & Repayment Schedule
        </h2>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
          Simulate institutional debt amortization, interest rate subvention, and moratorium policy for Priority Sector Lending.
        </p>
      </div>

      {/* Loan Parameters & Summary Metrics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loan Inputs Form */}
        <div className="bg-white dark:bg-[#0c0d10] p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-2">
            <Calculator size={16} className="text-emerald-500" />
            Loan Parameters
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                DEBT FACILITY TYPE
              </label>
              <select
                value={loanInputs.facilityType || 'Bank Term Loan'}
                onChange={e => onChange({ facilityType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-900 dark:text-white"
              >
                <option value="Bank Term Loan">Bank Term Loan (Priority Sector)</option>
                <option value="Working Capital Loan">Working Capital / Cash Credit Facility</option>
                <option value="Mixed Term & Working Capital">Mixed Term & Working Capital Debt</option>
                <option value="MUDRA / Subsidized Loan">MUDRA / Subsidized Scheme Loan</option>
                <option value="Other Debt Facility">Other Commercial Debt Facility</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                LOAN AMOUNT REQUIRED (₹)
              </label>
              <input
                type="number"
                min="0"
                value={loanInputs.loanAmount || ''}
                onChange={e => onChange({ loanAmount: Number(e.target.value) })}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-900 dark:text-white font-mono"
              />
              <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1 block">
                Default suggested from Step 4 Financing Gap & Step 5 Subsidy.
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                ANNUAL INTEREST RATE (% P.A.)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="30"
                value={loanInputs.interestRatePct || ''}
                onChange={e => onChange({ interestRatePct: Number(e.target.value) })}
                placeholder="9.5"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-900 dark:text-white font-mono"
              />
            </div>

            {/* Custom Tenure Input with Interactive Touch Unit Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400">
                  LOAN TENURE (DURATION)
                </label>
              </div>

              {/* Preset Chips */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  { label: '3 Yrs', years: 3 },
                  { label: '5 Yrs', years: 5 },
                  { label: '7 Yrs', years: 7 },
                  { label: '10 Yrs', years: 10 }
                ].map(preset => {
                  const isActive = loanInputs.tenureYears === preset.years;
                  return (
                    <button
                      key={preset.years}
                      type="button"
                      onClick={() => {
                        onChange({ tenureYears: preset.years });
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                        isActive
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                          : 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Number Input + Clickable Unit Badge */}
              <div className="relative flex items-center">
                <input
                  type="number"
                  step={tenureUnit === 'years' ? '0.5' : '1'}
                  min="1"
                  max={tenureUnit === 'years' ? 30 : 360}
                  value={
                    tenureUnit === 'years'
                      ? loanInputs.tenureYears || ''
                      : Math.round((loanInputs.tenureYears || 0) * 12) || ''
                  }
                  onChange={e => {
                    const raw = Number(e.target.value);
                    if (tenureUnit === 'years') {
                      onChange({ tenureYears: Math.max(0.1, raw) });
                    } else {
                      onChange({ tenureYears: Math.max(0.1, raw / 12) });
                    }
                  }}
                  placeholder={tenureUnit === 'years' ? 'e.g. 7' : 'e.g. 84'}
                  className="w-full px-3 py-2 pr-28 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                
                {/* Touch/Click to toggle unit between Months and Years */}
                <button
                  type="button"
                  title="Click/Touch to switch unit between Years & Months"
                  onClick={() => setTenureUnit(prev => (prev === 'years' ? 'months' : 'years'))}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs select-none"
                >
                  <span>{tenureUnit === 'years' ? 'Years' : 'Months'}</span>
                  <span className="text-[10px] opacity-70">⇄</span>
                </button>
              </div>

              <span className="text-[10px] text-gray-500 dark:text-zinc-400 mt-1 block">
                {tenureUnit === 'years'
                  ? `Equivalent to ${Math.round((loanInputs.tenureYears || 0) * 12)} Months total repayment tenure. (Touch 'Years' button above to switch)`
                  : `Equivalent to ${((loanInputs.tenureYears || 0)).toFixed(1)} Years total repayment tenure. (Touch 'Months' button above to switch)`}
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                MORATORIUM PERIOD (MONTHS)
              </label>
              <select
                value={loanInputs.moratoriumMonths}
                onChange={e => onChange({ moratoriumMonths: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-900 dark:text-white font-mono"
              >
                <option value={0}>No Moratorium (Immediate EMI)</option>
                <option value={3}>3 Months Moratorium</option>
                <option value={6}>6 Months Moratorium</option>
                <option value={12}>12 Months Moratorium</option>
              </select>
            </div>
          </div>
        </div>

        {/* Amortization Summary Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">ESTIMATED MONTHLY EMI</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                ₹{monthlyEMI.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-gray-500 dark:text-zinc-400 mt-1 block">Active repayment period</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">TOTAL INTEREST PAYABLE</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
                ₹{totalInterest.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-gray-500 dark:text-zinc-400 mt-1 block">Over tenure</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0c0d10] border border-gray-200 dark:border-zinc-800 shadow-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">TOTAL OUTFLOW (P + I)</span>
              <div className="text-2xl font-black text-gray-900 dark:text-white font-mono mt-1">
                ₹{totalRepayment.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-gray-500 dark:text-zinc-400 mt-1 block">Principal + Interest</span>
            </div>
          </div>

          {/* Repayment Schedule Table & View Toggle */}
          <div className="bg-white dark:bg-[#0c0d10] p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-2">
              <h3 className="text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Table size={14} className="text-emerald-500" />
                Repayment Schedule Breakdown
              </h3>

              <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-gray-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setScheduleView('annual')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    scheduleView === 'annual'
                      ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Annual View
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleView('monthly')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    scheduleView === 'monthly'
                      ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Monthly View (First 24M)
                </button>
              </div>
            </div>

            {scheduleView === 'annual' ? (
              annualSchedule.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-zinc-800 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <th className="py-2 px-3">Year</th>
                        <th className="py-2 px-3 text-right">Opening Principal</th>
                        <th className="py-2 px-3 text-right">Principal Paid</th>
                        <th className="py-2 px-3 text-right">Interest Paid</th>
                        <th className="py-2 px-3 text-right">Total Repayment</th>
                        <th className="py-2 px-3 text-right">Closing Principal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60 text-xs font-mono">
                      {annualSchedule.map(row => (
                        <tr key={row.year} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50">
                          <td className="py-2 px-3 font-bold text-gray-800 dark:text-zinc-200">Year {row.year}</td>
                          <td className="py-2 px-3 text-right text-gray-600 dark:text-zinc-400">₹{row.openingPrincipal.toLocaleString('en-IN')}</td>
                          <td className="py-2 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">₹{row.principalPayment.toLocaleString('en-IN')}</td>
                          <td className="py-2 px-3 text-right text-amber-600 dark:text-amber-400">₹{row.interestPayment.toLocaleString('en-IN')}</td>
                          <td className="py-2 px-3 text-right font-bold text-gray-900 dark:text-white">₹{row.totalPayment.toLocaleString('en-IN')}</td>
                          <td className="py-2 px-3 text-right text-gray-600 dark:text-zinc-400">₹{row.closingPrincipal.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-gray-400">
                  Enter loan parameters to view repayment schedule.
                </div>
              )
            ) : (
              schedule.length > 0 ? (
                <div className="overflow-x-auto max-h-[320px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-white dark:bg-[#0c0d10] border-b border-gray-200 dark:border-zinc-800 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <tr>
                        <th className="py-2 px-3">Month</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Opening</th>
                        <th className="py-2 px-3 text-right">Principal</th>
                        <th className="py-2 px-3 text-right">Interest</th>
                        <th className="py-2 px-3 text-right">Payment</th>
                        <th className="py-2 px-3 text-right">Closing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60 text-xs font-mono">
                      {schedule.slice(0, 24).map(row => (
                        <tr key={row.month} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50">
                          <td className="py-1.5 px-3 font-bold text-gray-800 dark:text-zinc-200">Month {row.month}</td>
                          <td className="py-1.5 px-3">
                            {row.isMoratorium ? (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-sans text-[9px] font-bold">MORATORIUM</span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-sans text-[9px] font-bold">REPAYMENT</span>
                            )}
                          </td>
                          <td className="py-1.5 px-3 text-right text-gray-600 dark:text-zinc-400">₹{row.openingPrincipal.toLocaleString('en-IN')}</td>
                          <td className="py-1.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">₹{row.principalPayment.toLocaleString('en-IN')}</td>
                          <td className="py-1.5 px-3 text-right text-amber-600 dark:text-amber-400">₹{row.interestPayment.toLocaleString('en-IN')}</td>
                          <td className="py-1.5 px-3 text-right font-bold text-gray-900 dark:text-white">₹{row.payment.toLocaleString('en-IN')}</td>
                          <td className="py-1.5 px-3 text-right text-gray-600 dark:text-zinc-400">₹{row.closingPrincipal.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-gray-400">
                  Enter loan parameters to view monthly schedule.
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
        >
          ← Back to Scheme Matching
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all cursor-pointer"
        >
          Proceed to Revenue & Expense Forecast ➔
        </button>
      </div>
    </div>
  );
};
