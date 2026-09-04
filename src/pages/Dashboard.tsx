import React from 'react';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import {
  FileCheck2,
  TrendingUp,
  Landmark,
  CalendarCheck,
  Building2,
  ChevronRight,
  ArrowUpRight,
  MapPin,
  Users,
} from 'lucide-react';
import { mockUser } from '../mock/userMock';
import { mockBusinessOpportunities } from '../mock/businessMock';
import { mockGovSchemes } from '../mock/schemeMock';
import { formatRupee } from '../utils/formatters';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const opportunityScore = 78;

  const scoreFactors = [
    { label: 'Market Demand', score: 82, status: 'High' },
    { label: 'Competition Index', score: 64, status: 'Moderate' },
    { label: 'Investment Fit', score: 71, status: 'Healthy' },
    { label: 'Government Support', score: 88, status: 'Optimal' },
  ];

  const repayments = [
    { id: 'PAY-1092', bank: 'State Bank of India (Karnal Main)', project: 'Dairy BMC Unit', emi: 14250, dueDate: '2026-09-15', status: 'Due Soon' },
    { id: 'PAY-1088', bank: 'Canara Bank (Gharaunda Branch)', project: 'Custom Hiring Center', emi: 9800, dueDate: '2026-09-28', status: 'Upcoming' },
    { id: 'PAY-1076', bank: 'HDFC Micro SME', project: 'Spice Grinding Unit', emi: 11400, dueDate: '2026-08-15', status: 'Paid' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Good morning, {mockUser.name}
            </h1>
            <Badge variant="navy">{mockUser.district}, {mockUser.state}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Let's evaluate your next business opportunity and local market feasibility in Gharaunda Block.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('business-input')}
            className="px-3.5 py-2 bg-gov-800 hover:bg-gov-900 text-white rounded text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Building2 className="w-4 h-4" /> Start New Business Analysis
          </button>
          <button
            onClick={() => onNavigate('ai-advisor')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
          >
            Open AI Advisor
          </button>
        </div>
      </div>

      {/* Top Level Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Active Projects"
          value="3"
          subtitle="Registered SME Units"
          icon={<Building2 className="w-5 h-5" />}
        />
        <StatCard
          title="Applications"
          value="2"
          subtitle="PMEGP & PMFME Status"
          change="Under Review"
          changeType="neutral"
          icon={<FileCheck2 className="w-5 h-5" />}
        />
        <StatCard
          title="Loan Amount"
          value={formatRupee(850000, true)}
          subtitle="Sanctioned Credit"
          icon={<Landmark className="w-5 h-5" />}
        />
        <StatCard
          title="Upcoming EMI"
          value={formatRupee(14250)}
          subtitle="Due Sep 15, 2026"
          change="SBI Karnal"
          changeType="neutral"
          icon={<CalendarCheck className="w-5 h-5" />}
        />
        <StatCard
          title="Market Opportunities"
          value="5"
          subtitle="In 10km Radius"
          change="+14% YoY Demand"
          changeType="positive"
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Two Column Layout: Opportunity Score & Recommended Businesses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Opportunity Score Panel */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Business Opportunity Score</h2>
              <p className="text-[11px] text-slate-500">Evaluated against Karnal rural dataset</p>
            </div>
            <Badge variant="green">Verified Model</Badge>
          </div>

          <div className="flex items-center gap-6 py-2">
            <div className="w-24 h-24 rounded-full border-8 border-gov-800 bg-gov-50 flex flex-col items-center justify-center shrink-0">
              <span className="text-2xl font-extrabold text-gov-900">{opportunityScore}</span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase">/ 100</span>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-900">Overall Feasibility: High</div>
              <p className="text-xs text-slate-600 leading-normal">
                Your capital capacity of ₹8.5L and available land align strongly with government subsidized agro-processing sectors.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            {scoreFactors.map((factor, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">{factor.label}</span>
                  <span className="font-bold text-slate-900">{factor.score} / 100</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gov-800 rounded-full"
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('market-analysis')}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded text-xs border border-slate-200 flex items-center justify-center gap-1 transition-colors"
          >
            View Detailed Market Breakdown <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recommended Businesses */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recommended Business Opportunities</h2>
              <p className="text-[11px] text-slate-500">Top ranked options based on local demand & capital</p>
            </div>
            <button
              onClick={() => onNavigate('business-input')}
              className="text-xs font-semibold text-gov-800 hover:underline flex items-center gap-1"
            >
              Recalculate <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {mockBusinessOpportunities.slice(0, 3).map((biz) => (
              <div
                key={biz.id}
                className="p-3.5 rounded-md border border-slate-200 hover:border-gov-800 bg-slate-50/50 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{biz.name}</span>
                    <Badge variant="green">{biz.feasibilityScore} Score</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span>Est. Capital: <strong>{formatRupee(biz.minInvestment, true)}</strong></span>
                    <span>Demand: <strong className="text-emerald-700">{biz.marketDemand}</strong></span>
                    <span>Competition: <strong className="text-slate-700">{biz.competitionLevel}</strong></span>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('finance')}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:border-gov-800 text-slate-800 rounded text-xs font-semibold shrink-0 shadow-subtle"
                >
                  Estimate EMI & Loan
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Local Market Snapshot & Government Schemes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Local Market Snapshot */}
        <div className="lg:col-span-6 bg-white rounded-lg border border-slate-200 p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gov-800" /> Local Market Snapshot (Karnal Block)
            </h2>
            <button
              onClick={() => onNavigate('gis-map')}
              className="text-xs font-semibold text-gov-800 hover:underline"
            >
              Open Interactive GIS Map →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded bg-slate-50 border border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-500">Nearby Competitors</div>
              <div className="text-lg font-extrabold text-slate-900 mt-0.5">18 Active</div>
              <div className="text-[10px] text-slate-500 mt-0.5">In 10km radius</div>
            </div>
            <div className="p-3 rounded bg-slate-50 border border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-500">Block Population</div>
              <div className="flex items-center gap-1 text-lg font-extrabold text-slate-900 mt-0.5">
                <Users className="w-4 h-4 text-slate-400" /> 42,500
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Stundi & Gharaunda</div>
            </div>
            <div className="p-3 rounded bg-slate-50 border border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-500">Avg Market Price</div>
              <div className="text-lg font-extrabold text-slate-900 mt-0.5">₹48 / Litre</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">+4% Price Growth</div>
            </div>
          </div>
        </div>

        {/* Relevant Government Schemes */}
        <div className="lg:col-span-6 bg-white rounded-lg border border-slate-200 p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-gov-800" /> Applicable Government Schemes
            </h2>
            <button
              onClick={() => onNavigate('schemes')}
              className="text-xs font-semibold text-gov-800 hover:underline"
            >
              Browse All Schemes →
            </button>
          </div>

          <div className="space-y-2">
            {mockGovSchemes.slice(0, 2).map((scheme) => (
              <div
                key={scheme.id}
                className="p-3 rounded border border-slate-200 bg-slate-50 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{scheme.code}</span>
                    <Badge variant="green">{scheme.maxSubsidyPercent}% Max Subsidy</Badge>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5 line-clamp-1">{scheme.name}</div>
                </div>
                <button
                  onClick={() => onNavigate('schemes')}
                  className="px-2.5 py-1 bg-gov-800 hover:bg-gov-900 text-white rounded text-xs font-semibold shrink-0"
                >
                  Check Eligibility
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Repayment Schedule Table */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-subtle space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Upcoming EMI & Bank Repayment Schedule</h2>
            <p className="text-[11px] text-slate-500">Track current loan obligations and repayment timelines</p>
          </div>
          <button
            onClick={() => onNavigate('finance')}
            className="text-xs font-semibold text-gov-800 hover:underline"
          >
            Loan Amortization Calculator →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2">Payment ID</th>
                <th className="px-3 py-2">Financing Institution</th>
                <th className="px-3 py-2">Associated SME Unit</th>
                <th className="px-3 py-2">Monthly EMI</th>
                <th className="px-3 py-2">Due Date</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {repayments.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80">
                  <td className="px-3 py-2 font-semibold text-slate-900">{row.id}</td>
                  <td className="px-3 py-2 text-slate-700">{row.bank}</td>
                  <td className="px-3 py-2 text-slate-800">{row.project}</td>
                  <td className="px-3 py-2 font-bold text-slate-900">{formatRupee(row.emi)}</td>
                  <td className="px-3 py-2 text-slate-600">{row.dueDate}</td>
                  <td className="px-3 py-2">
                    <Badge
                      variant={
                        row.status === 'Due Soon' ? 'amber' : row.status === 'Paid' ? 'green' : 'gray'
                      }
                    >
                      {row.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
