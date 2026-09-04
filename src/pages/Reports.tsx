import React, { useState } from 'react';
import {
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import { mockUser } from '../mock/userMock';
import { mockBusinessOpportunities } from '../mock/businessMock';
import { formatRupee } from '../utils/formatters';

export const Reports: React.FC = () => {
  const [selectedReportType, setSelectedReportType] = useState('dpr');

  const reportTypes = [
    { id: 'dpr', name: 'Detailed Project Report (DPR for Bank Loan)', desc: 'Complete appraisal dossier for SBI / Canara Bank loan sanction' },
    { id: 'market', name: 'Market Intelligence & Demand Survey', desc: 'Demand/supply projections and block pricing benchmarks' },
    { id: 'competitors', name: 'Competitor Spatial Analysis Dossier', desc: 'Density index and distance distribution table' },
    { id: 'financial', name: 'Financial Amortization & Cash Flow Model', desc: '5-year EMI amortization, DSCR, and ROI forecast' },
    { id: 'scheme', name: 'PMEGP / PMFME Scheme Eligibility Brief', desc: 'Capital margin money subsidy calculation certificate' },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Official Report Generation & Document Dossier</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate printable Detailed Project Reports (DPR) and bank-ready feasibility certificates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-gov-800 hover:bg-gov-900 text-white rounded text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print / Save as PDF
          </button>
          <button
            onClick={() => alert('Excel dataset exported to Downloads folder.')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel (.XLSX)
          </button>
        </div>
      </div>

      {/* Main Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Select Report Type */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200 p-5 shadow-subtle space-y-3 no-print">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            Select Document Template
          </h2>

          <div className="space-y-2">
            {reportTypes.map((rt) => (
              <button
                key={rt.id}
                onClick={() => setSelectedReportType(rt.id)}
                className={`w-full text-left p-3 rounded border text-xs transition-colors ${
                  selectedReportType === rt.id
                    ? 'border-gov-800 bg-gov-50 text-gov-900 font-semibold shadow-subtle'
                    : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-slate-900">{rt.name}</div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5">{rt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Document Preview (Printable Area) */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-slate-300 p-8 shadow-subtle space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Document Header Seal */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-gov-800 uppercase tracking-widest">Govt of Haryana • District Industries Center (DIC)</div>
              <h2 className="text-base font-extrabold text-slate-900 mt-0.5">DETAILED PROJECT APPRAISAL REPORT (DPR)</h2>
              <div className="text-xs text-slate-500 mt-0.5">Document Ref: DIC/KNL/2026/89214 • Date: September 4, 2026</div>
            </div>
            <div className="w-12 h-12 rounded border-2 border-gov-800 text-gov-800 flex items-center justify-center font-bold text-xs uppercase text-center p-1 leading-none">
              OFFICIAL SEAL
            </div>
          </div>

          {/* Applicant & Site Metadata Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-slate-100 p-1.5 rounded">
              1. APPLICANT & ENTERPRISE METADATA
            </h3>
            <table className="w-full text-xs text-left border border-slate-200 divide-y divide-slate-200">
              <tbody>
                <tr>
                  <td className="px-3 py-1.5 bg-slate-50 font-semibold w-1/3 text-slate-700">Entrepreneur Name:</td>
                  <td className="px-3 py-1.5 text-slate-900 font-bold">{mockUser.name}</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 bg-slate-50 font-semibold text-slate-700">Social Category & Status:</td>
                  <td className="px-3 py-1.5 text-slate-900">{mockUser.category} Category • Rural Resident</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 bg-slate-50 font-semibold text-slate-700">Proposed SME Activity:</td>
                  <td className="px-3 py-1.5 text-slate-900 font-bold">{mockBusinessOpportunities[0].name}</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 bg-slate-50 font-semibold text-slate-700">Site Location Address:</td>
                  <td className="px-3 py-1.5 text-slate-900">Village Stundi, Gharaunda Block, Karnal, Haryana (PIN 132114)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Capital Outlay & Financing Breakdown */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-slate-100 p-1.5 rounded">
              2. FINANCIAL OUTLAY & SCHEME FINANCING
            </h3>
            <table className="w-full text-xs text-left border border-slate-200 divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 font-bold">
                <tr>
                  <th className="px-3 py-1.5">Capital Head</th>
                  <th className="px-3 py-1.5">Amount (₹)</th>
                  <th className="px-3 py-1.5">% Share</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-1.5 text-slate-800">Total Project Cost:</td>
                  <td className="px-3 py-1.5 font-bold text-slate-900">{formatRupee(1000000)}</td>
                  <td className="px-3 py-1.5 text-slate-700">100%</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 text-slate-800">Promoter Own Contribution (Equity):</td>
                  <td className="px-3 py-1.5 font-bold text-slate-900">{formatRupee(150000)}</td>
                  <td className="px-3 py-1.5 text-slate-700">15%</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 text-slate-800">PMEGP Government Subsidy (35% Margin):</td>
                  <td className="px-3 py-1.5 font-bold text-emerald-800">{formatRupee(350000)}</td>
                  <td className="px-3 py-1.5 text-emerald-800 font-bold">35%</td>
                </tr>
                <tr className="bg-slate-50 font-bold">
                  <td className="px-3 py-1.5 text-slate-900">Term Loan Sanction Required:</td>
                  <td className="px-3 py-1.5 text-gov-800">{formatRupee(500000)}</td>
                  <td className="px-3 py-1.5 text-gov-800">50%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Key Bankability Ratios */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-slate-100 p-1.5 rounded">
              3. BANKABILITY & REPAYMENT CAPACITY
            </h3>
            <div className="grid grid-cols-3 gap-3 text-xs text-center">
              <div className="p-2 border border-slate-200 rounded bg-slate-50">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Monthly EMI</span>
                <span className="font-extrabold text-slate-900">₹10,499 / mo</span>
              </div>
              <div className="p-2 border border-slate-200 rounded bg-slate-50">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">DSCR Ratio</span>
                <span className="font-extrabold text-emerald-800">3.8x (Healthy)</span>
              </div>
              <div className="p-2 border border-slate-200 rounded bg-slate-50">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Payback Period</span>
                <span className="font-extrabold text-slate-900">18 Months</span>
              </div>
            </div>
          </div>

          {/* Official Sign Off Footer */}
          <div className="pt-8 border-t border-slate-300 flex items-end justify-between text-xs">
            <div className="space-y-1">
              <div className="font-bold text-slate-900">Evaluated by GramUdyog Decision Engine</div>
              <div className="text-[11px] text-slate-500">System Verified • DIC Karnal Nodal Office</div>
            </div>
            <div className="text-right space-y-1">
              <div className="w-32 border-b border-slate-400 mb-1" />
              <div className="font-bold text-slate-900">District Nodal Officer</div>
              <div className="text-[11px] text-slate-500">Sign & Seal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
