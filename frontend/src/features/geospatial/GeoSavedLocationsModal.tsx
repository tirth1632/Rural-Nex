import { X, BookmarkCheck, Trash2, FileText, ArrowRight } from 'lucide-react';
import type { SavedLocationItem } from '../../services/locationService';
import type { CandidateLocation } from '../../services/geoService';

interface GeoSavedLocationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedLocations: SavedLocationItem[];
  onRemove: (savedId: string) => void;
  onSelectCandidate: (candidate: CandidateLocation) => void;
  onRunAssessment: (candidate: CandidateLocation) => void;
}

export const GeoSavedLocationsModal: React.FC<GeoSavedLocationsModalProps> = ({
  isOpen,
  onClose,
  savedLocations,
  onRemove,
  onSelectCandidate,
  onRunAssessment,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <BookmarkCheck size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Saved Business Locations</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Your bookmarked rural enterprise site candidates ({savedLocations.length})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {savedLocations.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400 space-y-2">
              <BookmarkCheck size={36} className="mx-auto text-gray-300 dark:text-gray-600" />
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">No saved locations yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs mx-auto">
                Bookmark promising candidate locations from the map right panel to review them anytime.
              </p>
            </div>
          ) : (
            savedLocations.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-primary/50 rounded-xl shadow-2xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{item.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500 text-white">
                      ★ {item.overallScore}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{item.areaName}, {item.districtName}, {item.stateName}</p>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-600 pt-0.5">
                    <span className="font-semibold text-primary">{item.businessCategory} ({item.subType})</span>
                    <span>•</span>
                    <span>{item.investmentRange}</span>
                    <span>•</span>
                    <span className="text-gray-400">Saved: {item.savedAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                  <button
                    onClick={() => {
                      onClose();
                      onSelectCandidate(item.rawCandidate);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>View Map</span>
                    <ArrowRight size={13} />
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onRunAssessment(item.rawCandidate);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-emerald-600 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <FileText size={13} />
                    <span>Assess</span>
                  </button>

                  <button
                    onClick={() => onRemove(item.id)}
                    title="Remove Location"
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-gray-800 bg-white border border-gray-300 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
