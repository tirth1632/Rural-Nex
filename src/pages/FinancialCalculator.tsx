import React, { useState } from 'react';
import { Badge } from '../components/common/Badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Calculator, PieChart } from 'lucide-react';
import { FinanceService } from '../services/financeService';
import { formatRupee } from '../utils/formatters';

export const FinancialCalculator: React.FC = () => {
  // Inputs
  const [projectCost, setProjectCost] = useState(1000000); // 10 Lakh
  const [ownContribution, setOwnContribution] = useState(150000); // 15%
  const [subsidyPercent, setSubsidyPercent] = useState(35); // PMEGP 35%
  const [interestRate, setInterestRate] = useState(9.5); // 9.5% p.a.
  const [tenureYears, setTenureYears] = useState(5); // 5 Years
  const [annualRevenue, setAnnualRevenue] = useState(1440000); // 14.4 Lakh
  const [annualOpEx] = useState(960000); // 9.6 Lakh

  const fin = FinanceService.computeModel(
    projectCost,
    ownContribution,
    subsidyPercent,
    interestRate,
    tenureYears,
    annualRevenue,
    annualOpEx
  );

  const amortizationData = FinanceService.getAmortization(fin.loanAmount, interestRate, tenureYears);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Financial Loan & Project Feasibility Calculator</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Compute EMI repayment schedules, Debt Service Coverage Ratio (DSCR), break-even timelines, and bank LTV ratios.
          </p>
        </div>
        <Badge variant="navy">NABARD & SIDBI Standard</Badge>
      </div>

      {/* Two Column Layout: Calculator Inputs & Summary Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Input Form Controls */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 p-5 shadow-subtle space-y-4">
          <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-gov-800" /> Capital & Loan Parameters
            </span>
            <button
              onClick={() => {
                setProjectCost(1000000);
                setOwnContribution(150000);
                setSubsidyPercent(35);
                setInterestRate(9.5);
                setTenureYears(5);
              }}
              className="text-[10px] text-gov-800 font-semibold hover:underline"
            >
              Reset Default
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Total Project Cost (₹):</span>
                <span className="font-extrabold text-slate-900">{formatRupee(projectCost)}</span>
              </div>
              <input
                type="range"
                min={200000}
                max={5000000}
                step={50000}
                value={projectCost}
                onChange={(e) => setProjectCost(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded accent-gov-800 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Own Contribution / Equity (₹):</span>
                <span className="font-bold text-slate-900">{formatRupee(ownContribution)}</span>
              </div>
              <input
                type="range"
                min={50000}
                max={projectCost * 0.5}
                step={25000}
                value={ownContribution}
                onChange={(e) => setOwnContribution(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded accent-gov-800 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subsidy Scheme (%)</label>
                <select
                  value={subsidyPercent}
                  onChange={(e) => setSubsidyPercent(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 font-bold"
                >
                  <option value={35}>35% (PMEGP Special Rural)</option>
                  <option value={25}>25% (PMEGP General Rural)</option>
                  <option value={15}>15% (Urban General)</option>
                  <option value={0}>0% (No Subsidy)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Interest Rate (% p.a.)</label>
                <input
                  type="number"
                  step="0.25"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tenure (Years)</label>
                <select
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 font-bold"
                >
                  <option value={3}>3 Years (36 Mo)</option>
                  <option value={5}>5 Years (60 Mo)</option>
                  <option value={7}>7 Years (84 Mo)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Projected Annual Revenue (₹)</label>
                <input
                  type="number"
                  step="50000"
                  value={annualRevenue}
                  onChange={(e) => setAnnualRevenue(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold text-emerald-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Financial Outputs & Viability Cards */}
        <div className="lg:col-span-7 space-y-4">
          {/* Top Key Outputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-subtle">
              <span className="text-[10px] uppercase font-bold text-slate-500">Monthly Loan EMI</span>
              <div className="text-xl font-extrabold text-slate-900 mt-1">{formatRupee(fin.monthlyEMI)}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{tenureYears * 12} Installments</div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-subtle">
              <span className="text-[10px] uppercase font-bold text-slate-500">Net Principal Loan</span>
              <div className="text-xl font-extrabold text-gov-800 mt-1">{formatRupee(fin.loanAmount)}</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">LTV: {fin.ltvRatio}%</div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-subtle">
              <span className="text-[10px] uppercase font-bold text-slate-500">Debt Service Coverage (DSCR)</span>
              <div className="text-xl font-extrabold text-emerald-700 mt-1">{fin.dscr}x</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Min 1.5x Required</div>
            </div>
          </div>

          {/* Project Viability Summary Panel */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-subtle space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-gov-800" /> Project Viability & Return Summary
              </h3>
              <Badge variant={fin.dscr >= 2.0 ? 'green' : 'amber'}>
                {fin.dscr >= 2.0 ? 'Bankable / High Viability' : 'Moderate Risk'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Annual Net Profit</span>
                <span className="font-extrabold text-emerald-800">{formatRupee(fin.netOperatingProfit)}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Interest Cost</span>
                <span className="font-bold text-slate-900">{formatRupee(fin.totalInterest)}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Break-even Period</span>
                <span className="font-bold text-slate-900">{fin.breakEvenMonths} Months</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Annual Equity ROI</span>
                <span className="font-bold text-emerald-700">{fin.roiPercent}% p.a.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amortization Schedule Chart */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-subtle space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Loan Amortization Breakdown (Principal vs. Interest)</h2>
            <p className="text-[11px] text-slate-500">Yearly breakdown over {tenureYears} years loan duration</p>
          </div>
          <Badge variant="navy">Annual Amortization</Badge>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={amortizationData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '12px', borderRadius: '4px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="principal" name="Principal Repaid (₹)" fill="#115E59" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="interest" name="Interest Cost (₹)" fill="#D97706" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
