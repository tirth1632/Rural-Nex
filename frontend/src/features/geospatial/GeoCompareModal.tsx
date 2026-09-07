import { X, Scale, Trash2 } from 'lucide-react';
import type { CandidateLocation } from '../../services/geoService';

interface GeoCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  compareList: CandidateLocation[];
  onRemoveFromCompare: (id: string) => void;
  onRunAssessment: (location: CandidateLocation) => void;
}

export const GeoCompareModal: React.FC<GeoCompareModalProps> = ({
  isOpen,
  onClose,
  compareList,
  onRemoveFromCompare,
  onRunAssessment,
}) => {
  if (!isOpen) return null;

  // Helper to find max numeric value in list for highlighting
  const getBestIndex = (getValue: (loc: CandidateLocation) => number) => {
    if (compareList.length === 0) return -1;
    let maxVal = -Infinity;
    let bestIdx = -1;
    compareList.forEach((loc, idx) => {
      const val = getValue(loc);
      if (val > maxVal) {
        maxVal = val;
        bestIdx = idx;
      }
    });
    return bestIdx;
  };

  const bestOverallIdx = getBestIndex((l) => l.scoreResult.overallScore);
  const bestDemandIdx = getBestIndex((l) => l.scoreResult.breakdown.marketDemand);
  const bestCompIdx = getBestIndex((l) => l.scoreResult.breakdown.competition);
  const bestAccessIdx = getBestIndex((l) => l.scoreResult.breakdown.accessibility);
  const bestInfraIdx = getBestIndex((l) => l.scoreResult.breakdown.infrastructure);
  const bestInvestIdx = getBestIndex((l) => l.scoreResult.breakdown.investmentFit);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Scale size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Compare Candidate Locations</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Side-by-side location intelligence factor comparison ({compareList.length}/3)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        {compareList.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <Scale size={40} className="mx-auto text-gray-300" />
            <p className="text-sm font-bold text-gray-800">No locations selected for comparison</p>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Click the "Compare" button on up to 4 location insights panels to compare them side-by-side.
            </p>
          </div>
        ) : (
          <div className="p-6 overflow-x-auto overflow-y-auto flex-1">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-3 bg-gray-50 font-bold text-gray-700 w-1/4">Comparison Factor</th>
                  {compareList.map((loc, _idx) => (
                    <th key={loc.id} className="p-3 font-bold text-gray-900 bg-gray-50/50 text-center relative min-w-[180px]">
                      <button
                        onClick={() => onRemoveFromCompare(loc.id)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 rounded"
                        title="Remove"
                      >
                        <Trash2 size={13} />
                      </button>
                      <div className="text-sm font-bold text-gray-900 truncate">{loc.name}</div>
                      <div className="text-[11px] font-normal text-gray-500 truncate">{loc.areaName}, {loc.districtName}</div>
                      <button
                        onClick={() => {
                          onClose();
                          onRunAssessment(loc);
                        }}
                        className="mt-2 px-2.5 py-1 text-[11px] font-bold text-white bg-primary hover:bg-emerald-600 rounded-lg shadow-2xs transition-colors cursor-pointer"
                      >
                        Run Assessment
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {/* Opportunity Score Row */}
                <tr className="hover:bg-gray-50/50">
                  <td className="p-3 font-bold text-gray-900 bg-gray-50">Opportunity Score</td>
                  {compareList.map((loc, idx) => (
                    <td
                      key={loc.id}
                      className={`p-3 text-center font-extrabold ${
                        idx === bestOverallIdx ? 'bg-emerald-50 text-emerald-800' : 'text-gray-900'
                      }`}
                    >
                      <span className="text-base">{loc.scoreResult.overallScore}</span> / 100
                      {idx === bestOverallIdx && (
                        <span className="block text-[10px] text-emerald-700 font-bold">★ Strongest</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Score Tier */}
                <tr>
                  <td className="p-3 font-semibold text-gray-700 bg-gray-50">Overall Potential Tier</td>
                  {compareList.map((loc) => (
                    <td key={loc.id} className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${loc.scoreResult.tier.badgeColor}`}>
                        {loc.scoreResult.tier.label}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Market Demand */}
                <tr>
                  <td className="p-3 font-semibold text-gray-700 bg-gray-50">Market Demand</td>
                  {compareList.map((loc, idx) => (
                    <td
                      key={loc.id}
                      className={`p-3 text-center ${idx === bestDemandIdx ? 'bg-emerald-50/80 font-bold text-emerald-800' : 'text-gray-800'}`}
                    >
                      {loc.scoreResult.breakdown.marketDemand} / 100
                    </td>
                  ))}
                </tr>

                {/* Competition Gap */}
                <tr>
                  <td className="p-3 font-semibold text-gray-700 bg-gray-50">Competition Gap (Low Density)</td>
                  {compareList.map((loc, idx) => (
                    <td
                      key={loc.id}
                      className={`p-3 text-center ${idx === bestCompIdx ? 'bg-emerald-50/80 font-bold text-emerald-800' : 'text-gray-800'}`}
                    >
                      {loc.scoreResult.breakdown.competition} / 100
                    </td>
                  ))}
                </tr>

                {/* Accessibility */}
                <tr>
                  <td className="p-3 font-semibold text-gray-700 bg-gray-50">Accessibility & Roads</td>
                  {compareList.map((loc, idx) => (
                    <td
                      key={loc.id}
                      className={`p-3 text-center ${idx === bestAccessIdx ? 'bg-emerald-50/80 font-bold text-emerald-800' : 'text-gray-800'}`}
                    >
                      {loc.scoreResult.breakdown.accessibility} / 100
                    </td>
                  ))}
                </tr>

                {/* Infrastructure */}
                <tr>
                  <td className="p-3 font-semibold text-gray-700 bg-gray-50">Infrastructure & Power</td>
                  {compareList.map((loc, idx) => (
                    <td
                      key={loc.id}
                      className={`p-3 text-center ${idx === bestInfraIdx ? 'bg-emerald-50/80 font-bold text-emerald-800' : 'text-gray-800'}`}
                    >
                      {loc.scoreResult.breakdown.infrastructure} / 100
                    </td>
                  ))}
                </tr>

                {/* Investment Fit */}
                <tr>
                  <td className="p-3 font-semibold text-gray-700 bg-gray-50">Investment Fit ({compareList[0]?.investmentRange})</td>
                  {compareList.map((loc, idx) => (
                    <td
                      key={loc.id}
                      className={`p-3 text-center ${idx === bestInvestIdx ? 'bg-emerald-50/80 font-bold text-emerald-800' : 'text-gray-800'}`}
                    >
                      {loc.scoreResult.breakdown.investmentFit} / 100
                    </td>
                  ))}
                </tr>

                {/* Est Revenue */}
                <tr>
                  <td className="p-3 font-semibold text-gray-700 bg-gray-50">Est. Annual Revenue</td>
                  {compareList.map((loc) => (
                    <td key={loc.id} className="p-3 text-center font-semibold text-gray-900">
                      {loc.estimatedAnnualRevenue}
                    </td>
                  ))}
                </tr>

                {/* Est Profit */}
                <tr>
                  <td className="p-3 font-semibold text-gray-700 bg-gray-50">Est. Annual Profit</td>
                  {compareList.map((loc) => (
                    <td key={loc.id} className="p-3 text-center font-bold text-emerald-600">
                      {loc.estimatedAnnualProfit}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-gray-800 bg-white border border-gray-300 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
