import React, { useState } from 'react';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  Search,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { mockGovSchemes } from '../mock/schemeMock';
import { mockUser } from '../mock/userMock';
import type { GovScheme } from '../types';
import { formatRupee } from '../utils/formatters';

export const GovSchemes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [selectedScheme, setSelectedScheme] = useState<GovScheme | null>(null);
  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState(false);

  // Eligibility Wizard Calculator State
  const [eligState, setEligState] = useState({
    areaType: 'Rural',
    socialCategory: mockUser.category as 'General' | 'OBC' | 'SC' | 'ST',
    gender: 'Male',
    education: 'Diploma / 10th Pass',
    proposedInvestment: 850000,
  });

  const [eligResult, setEligResult] = useState<{
    eligible: boolean;
    subsidyPercent: number;
    subsidyAmount: number;
    schemeName: string;
  } | null>(null);

  const filteredSchemes = mockGovSchemes.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSector =
      sectorFilter === 'All' || s.eligibleSectors.some((sec) => sec.includes(sectorFilter));
    return matchSearch && matchSector;
  });

  const handleRunEligibility = (e: React.FormEvent) => {
    e.preventDefault();
    let subsidyPct = 25;
    if (eligState.areaType === 'Rural') {
      if (['SC', 'ST', 'OBC'].includes(eligState.socialCategory) || eligState.gender === 'Female') {
        subsidyPct = 35;
      } else {
        subsidyPct = 25;
      }
    } else {
      subsidyPct = 15;
    }

    const calculatedSubsidyAmount = Math.min(
      eligState.proposedInvestment * (subsidyPct / 100),
      1750000
    );

    setEligResult({
      eligible: true,
      subsidyPercent: subsidyPct,
      subsidyAmount: calculatedSubsidyAmount,
      schemeName: selectedScheme ? selectedScheme.name : 'PMEGP Capital Subsidy Scheme',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Government Scheme Discovery Engine</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate official MSME, Agriculture, and MUDRA credit subsidies for rural enterprises.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search PMEGP, PMFME, MUDRA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none"
            />
          </div>

          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded font-medium text-slate-800"
          >
            <option value="All">All Sectors</option>
            <option value="Agro">Agro & Food Processing</option>
            <option value="Dairy">Dairy</option>
            <option value="Services">Services & Machinery</option>
          </select>
        </div>
      </div>

      {/* Scheme Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSchemes.map((scheme) => (
          <div
            key={scheme.id}
            className="bg-white rounded-lg border border-slate-200 p-5 shadow-subtle flex flex-col justify-between space-y-4 hover:border-gov-800 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-extrabold text-gov-800 uppercase tracking-wide">{scheme.code}</span>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight mt-0.5">{scheme.name}</h3>
                  <div className="text-[11px] text-slate-500 mt-0.5">{scheme.department}</div>
                </div>
                <Badge variant={scheme.maxSubsidyPercent > 0 ? 'green' : 'blue'}>
                  {scheme.maxSubsidyPercent > 0 ? `${scheme.maxSubsidyPercent}% Subsidy` : 'Collateral Free'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Max Capital Loan</span>
                  <span className="font-bold text-slate-900">{formatRupee(scheme.maxLoanAmountRupees, true)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Max Subsidy Cap</span>
                  <span className="font-bold text-emerald-800">
                    {scheme.maxSubsidyAmountRupees > 0 ? formatRupee(scheme.maxSubsidyAmountRupees, true) : 'Interest Subvention'}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-800">Key Scheme Benefits:</span>
                <ul className="space-y-1 text-slate-600">
                  {scheme.keyBenefits.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setSelectedScheme(scheme);
                  setIsEligibilityModalOpen(true);
                  setEligResult(null);
                }}
                className="px-3 py-1.5 bg-gov-800 hover:bg-gov-900 text-white rounded text-xs font-semibold shadow-sm transition-colors"
              >
                Check My Eligibility
              </button>

              <a
                href={scheme.portalUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1"
              >
                Official Portal <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Eligibility Calculator Modal */}
      <Modal
        isOpen={isEligibilityModalOpen}
        onClose={() => setIsEligibilityModalOpen(false)}
        title={`Eligibility Calculator: ${selectedScheme?.code || 'Scheme'}`}
        maxWidth="lg"
      >
        {eligResult ? (
          <div className="space-y-4 py-2">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-emerald-950">You Are Eligible for {selectedScheme?.code}!</h4>
              <p className="text-xs text-emerald-800">
                Based on your profile as a <strong>{eligState.areaType} {eligState.socialCategory}</strong> applicant.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span className="text-slate-600">Applicable Subsidy Percentage:</span>
                <span className="font-bold text-slate-900">{eligResult.subsidyPercent}% Margin Money</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span className="text-slate-600">Calculated Subsidy Amount:</span>
                <span className="font-extrabold text-emerald-800 text-sm">{formatRupee(eligResult.subsidyAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Required Bank Credit Portion:</span>
                <span className="font-bold text-slate-900">{formatRupee(eligState.proposedInvestment - eligResult.subsidyAmount)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEligResult(null)}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded text-xs font-semibold"
              >
                Recalculate
              </button>
              <button
                onClick={() => setIsEligibilityModalOpen(false)}
                className="px-4 py-1.5 bg-gov-800 text-white rounded text-xs font-semibold shadow-sm"
              >
                Close & Apply
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRunEligibility} className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Applicant Location</label>
                <select
                  value={eligState.areaType}
                  onChange={(e) => setEligState({ ...eligState, areaType: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                >
                  <option>Rural</option>
                  <option>Urban</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Social Category</label>
                <select
                  value={eligState.socialCategory}
                  onChange={(e) => setEligState({ ...eligState, socialCategory: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                >
                  <option>OBC</option>
                  <option>SC</option>
                  <option>ST</option>
                  <option>General</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={eligState.gender}
                  onChange={(e) => setEligState({ ...eligState, gender: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                >
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Proposed Investment (₹)</label>
                <input
                  type="number"
                  value={eligState.proposedInvestment}
                  onChange={(e) => setEligState({ ...eligState, proposedInvestment: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-gov-800 hover:bg-gov-900 text-white font-semibold rounded text-xs shadow-sm flex items-center justify-center gap-1"
            >
              Calculate Government Subsidy <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};
