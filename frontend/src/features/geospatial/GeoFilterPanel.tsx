import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MapPin, 
  Sliders, 
  Briefcase, 
  IndianRupee, 
  Search, 
  RotateCcw, 
  AlertTriangle, 
  BookmarkCheck,
  Navigation,
  CheckCircle2,
  X,
  Sparkles
} from 'lucide-react';
import { 
  geoService, 
  type GeoSearchParams 
} from '../../services/geoService';
import { detectUserLocation } from '../../services/geolocationService';

interface GeoFilterPanelProps {
  searchParams: GeoSearchParams;
  onParamsChange: (newParams: Partial<GeoSearchParams>) => void;
  onSearch: () => void;
  onReset: () => void;
  isSearching: boolean;
  analysisProgress?: number;
  analysisStage?: string;
  hasUnsearchedChanges?: boolean;
  savedCount: number;
  onOpenSavedModal: () => void;
}

export const GeoFilterPanel: React.FC<GeoFilterPanelProps> = ({
  searchParams,
  onParamsChange,
  onSearch,
  onReset,
  isSearching,
  analysisProgress = 0,
  analysisStage = '',
  hasUnsearchedChanges = false,
  savedCount,
  onOpenSavedModal,
}) => {
  const { t } = useTranslation();
  const [isLocating, setIsLocating] = useState(false);
  const [detectStatus, setDetectStatus] = useState<{
    type: 'prompt' | 'success' | 'denied' | 'error';
    message: string;
    details?: string;
    coords?: { lat: number; lng: number; accuracy: number };
  } | null>(null);

  const states = geoService.getStates();
  const selectedStateObj = states.find((s) => s.id === searchParams.stateId) || states[0];
  const maxRadius = selectedStateObj ? selectedStateObj.maxRadiusKm : 150;
  const isNearBorder = searchParams.radiusKm >= (selectedStateObj?.borderWarningThresholdKm || 100);

  const districts = geoService.getDistricts(searchParams.stateId);
  const areas = searchParams.districtId ? geoService.getAreas(searchParams.districtId) : [];

  const categories = geoService.getBusinessCategories();
  const selectedCategoryObj = categories.find((c) => c.name === searchParams.businessCategory) || categories[0];

  const handleDetectLocation = async () => {
    setIsLocating(true);
    setDetectStatus({
      type: 'prompt',
      message: 'Requesting Device Location Permission',
      details: 'Please click "Allow" on your browser location prompt above to pinpoint your exact live location.',
    });

    try {
      const loc = await detectUserLocation();

      onParamsChange({
        stateId: loc.matchedStateId,
        districtId: loc.matchedDistrictId,
        areaId: loc.matchedAreaId,
        customLat: loc.lat,
        customLng: loc.lng,
        customLocationName: loc.village,
        customAccuracy: loc.accuracy,
      });

      setDetectStatus({
        type: 'success',
        message: `Live Location: ${loc.village}`,
        details: `${loc.district}, ${loc.state} • Accurate to ±${loc.accuracy}m`,
        coords: { lat: loc.lat, lng: loc.lng, accuracy: loc.accuracy },
      });
    } catch (err: any) {
      if (err.message === 'PERMISSION_DENIED' || err.code === 1) {
        setDetectStatus({
          type: 'denied',
          message: 'Browser Location Permission Blocked',
          details: 'Your browser is currently blocking location access. Please click the lock 🔒 or site settings icon in your browser address bar (top-left), change "Location" to "Allow", and click Retry.',
        });
      } else if (err.message === 'TIMEOUT' || err.code === 3) {
        setDetectStatus({
          type: 'error',
          message: 'Location Request Timed Out',
          details: 'Unable to acquire satellite fix within 15 seconds. Ensure GPS/location is switched on in Windows/device settings.',
        });
      } else {
        setDetectStatus({
          type: 'error',
          message: 'Could not auto-detect location',
          details: err.message || 'Please select your target state, district, and taluka manually below.',
        });
      }
    } finally {
      setIsLocating(false);
    }
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStateId = e.target.value;
    const newStateObj = states.find((s) => s.id === newStateId) || states[0];
    const newDistricts = geoService.getDistricts(newStateId);
    const newDistrictId = newDistricts.length > 0 ? newDistricts[0].id : '';
    const newAreas = newDistrictId ? geoService.getAreas(newDistrictId) : [];

    setDetectStatus(null);
    onParamsChange({
      stateId: newStateId,
      districtId: newDistrictId,
      areaId: newAreas.length > 0 ? newAreas[0].id : '',
      radiusKm: Math.min(searchParams.radiusKm, newStateObj.maxRadiusKm),
      customLat: undefined,
      customLng: undefined,
      customLocationName: undefined,
      customAccuracy: undefined,
    });
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistrictId = e.target.value;
    const newAreas = geoService.getAreas(newDistrictId);
    setDetectStatus(null);
    onParamsChange({
      districtId: newDistrictId,
      areaId: newAreas.length > 0 ? newAreas[0].id : '',
      customLat: undefined,
      customLng: undefined,
      customLocationName: undefined,
      customAccuracy: undefined,
    });
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDetectStatus(null);
    onParamsChange({ 
      areaId: e.target.value,
      customLat: undefined,
      customLng: undefined,
      customLocationName: undefined,
      customAccuracy: undefined,
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const catName = e.target.value;
    const catObj = categories.find((c) => c.name === catName);
    onParamsChange({
      businessCategory: catName,
      subType: catObj && catObj.subTypes.length > 0 ? catObj.subTypes[0] : '',
    });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 overflow-y-auto text-gray-900 dark:text-white shadow-2xs">
      {/* Header */}
      <div className="p-3 sm:p-3.5 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin size={18} className="text-primary shrink-0" />
            <span>{t('geo_filter_title', 'Find Business Locations')}</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Filter rural intelligence metrics</p>
        </div>
        <button
          onClick={onOpenSavedModal}
          title={t('geo_saved_locations', 'Saved Locations')}
          className="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors shrink-0 cursor-pointer"
        >
          <BookmarkCheck size={15} />
          <span className="hidden sm:inline">{t('geo_saved_locations', 'Saved')}</span>
          {savedCount > 0 && (
            <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold bg-primary text-white rounded-full">
              {savedCount}
            </span>
          )}
        </button>
      </div>

      {/* Main Filter Form */}
      <div className="p-3 sm:p-3.5 space-y-4 flex-1">
        {/* SECTION 1 — LOCATION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              {t('geo_target_territory', '1. Target Location')}
            </label>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              title={isLocating ? t('geo_detecting', 'Locating...') : t('geo_auto_detect', 'Auto-Detect Live Location')}
              aria-label="Detect live GPS location"
              className={`p-1.5 rounded-lg text-primary bg-primary/10 hover:bg-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center ${
                isLocating ? 'ring-2 ring-primary/40 animate-pulse' : ''
              }`}
            >
              <Navigation size={14} className={isLocating ? 'animate-spin text-primary' : ''} />
            </button>
          </div>
          {detectStatus && (
            <div
              className={`p-3 rounded-xl border text-xs relative animate-in fade-in slide-in-from-top-2 duration-200 ${
                detectStatus.type === 'prompt'
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100'
                  : detectStatus.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                  : detectStatus.type === 'denied'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-100'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 font-bold">
                  {detectStatus.type === 'prompt' && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                  )}
                  {detectStatus.type === 'success' && (
                    <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                  {detectStatus.type === 'denied' && (
                    <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  )}
                  {detectStatus.type === 'error' && (
                    <AlertTriangle size={15} className="text-rose-600 dark:text-rose-400 shrink-0" />
                  )}
                  <span>{detectStatus.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDetectStatus(null)}
                  className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer p-0.5"
                >
                  <X size={13} />
                </button>
              </div>

              {detectStatus.details && (
                <p className="mt-1 text-[11px] leading-relaxed opacity-90">
                  {detectStatus.details}
                </p>
              )}

              {detectStatus.coords && (
                <div className="mt-2 pt-1.5 border-t border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between text-[10px] font-mono text-emerald-700 dark:text-emerald-300">
                  <span>GPS: {detectStatus.coords.lat.toFixed(5)}, {detectStatus.coords.lng.toFixed(5)}</span>
                  <span>Accuracy: ±{Math.round(detectStatus.coords.accuracy)}m</span>
                </div>
              )}

              {detectStatus.type === 'denied' && (
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  className="mt-2.5 w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs text-center"
                >
                  Retry Location Detection
                </button>
              )}
            </div>
          )}

          {/* State Select */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('geo_state', 'State')}</label>
            <select
              value={searchParams.stateId}
              onChange={handleStateChange}
              className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* City / District Select */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('geo_district', 'City / District')}</label>
            <select
              value={searchParams.districtId}
              onChange={handleDistrictChange}
              disabled={!searchParams.stateId}
              className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-slate-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-slate-900 disabled:text-gray-400 dark:disabled:text-gray-500"
            >
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Area / Taluka / Cluster Select */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('geo_area', 'Area / Taluka / Cluster')}</label>
            <select
              value={searchParams.areaId}
              onChange={handleAreaChange}
              disabled={!searchParams.districtId}
              className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-slate-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-slate-900 disabled:text-gray-400 dark:disabled:text-gray-500"
            >
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <hr className="border-gray-100 dark:border-slate-800" />

        {/* SECTION 2 — SEARCH RADIUS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders size={14} className="text-primary" />
              <span>{t('geo_radius', 'Search Radius')}</span>
            </label>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
              {searchParams.radiusKm} km radius
            </span>
          </div>

          <div className="space-y-1 pt-1">
            <input
              type="range"
              min={10}
              max={maxRadius}
              step={5}
              value={searchParams.radiusKm}
              onChange={(e) => onParamsChange({ radiusKm: Number(e.target.value) })}
              className="w-full accent-primary cursor-pointer h-2 bg-gray-200 dark:bg-slate-700 rounded-lg"
            />
            <div className="flex justify-between text-[11px] font-medium text-gray-400 dark:text-gray-500">
              <span>10 km</span>
              <span>{selectedStateObj?.name} Max ({maxRadius} km)</span>
            </div>
          </div>

          {/* State Boundary Constrained Warning */}
          {isNearBorder && (
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-700/50 rounded-lg flex items-start gap-2 text-amber-900 dark:text-amber-200 text-xs leading-tight">
              <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>Search area approaches state boundary.</span>
            </div>
          )}


        </div>

        <hr className="border-gray-100 dark:border-slate-800" />

        {/* SECTION 3 — BUSINESS FILTER */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase size={14} className="text-primary" />
            <span>{t('geo_biz_type', 'Business Category')}</span>
          </label>

          {/* Business Category */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('geo_category', 'Category')}</label>
            <select
              value={searchParams.businessCategory}
              onChange={handleCategoryChange}
              className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-type Select */}
          {selectedCategoryObj && selectedCategoryObj.subTypes.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('geo_sub_type', 'Sub-type / Activity')}</label>
              <select
                value={searchParams.subType || selectedCategoryObj.subTypes[0]}
                onChange={(e) => onParamsChange({ subType: e.target.value })}
                className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                {selectedCategoryObj.subTypes.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <hr className="border-gray-100 dark:border-slate-800" />

        {/* SECTION 4 — INVESTMENT FILTER */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <IndianRupee size={14} className="text-primary" />
            <span>{t('geo_capital_band', 'Investment Range')}</span>
          </label>

          <select
            value={searchParams.investmentRange}
            onChange={(e) => onParamsChange({ investmentRange: e.target.value })}
            className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          >
            <option value="Under ₹1 lakh">Under ₹1 lakh</option>
            <option value="₹1–5 lakh">₹1–5 lakh</option>
            <option value="₹5–10 lakh">₹5–10 lakh</option>
            <option value="₹10–25 lakh">₹10–25 lakh</option>
            <option value="₹25–50 lakh">₹25–50 lakh</option>
            <option value="₹50 lakh–₹1 crore">₹50 lakh–₹1 crore</option>
            <option value="Above ₹1 crore">Above ₹1 crore</option>
          </select>

          {/* Investment Constrain Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="constrainInvestment"
              checked={searchParams.constrainToInvestment}
              onChange={(e) => onParamsChange({ constrainToInvestment: e.target.checked })}
              className="w-4 h-4 text-primary accent-primary rounded cursor-pointer"
            />
            <label htmlFor="constrainInvestment" className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              {t('geo_constrain_inv', 'Show locations suitable for this investment level')}
            </label>
          </div>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="p-3 sm:p-3.5 border-t border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 space-y-2">
        <button
          onClick={onSearch}
          disabled={isSearching}
          className={`w-full relative overflow-hidden flex flex-col items-center justify-center gap-1 px-3.5 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs transition-all cursor-pointer ${
            isSearching
              ? 'bg-emerald-700 dark:bg-emerald-800 cursor-wait'
              : hasUnsearchedChanges
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 ring-2 ring-emerald-400/60 shadow-md shadow-emerald-500/20'
              : 'bg-primary hover:bg-emerald-600'
          }`}
        >
          {/* Live Progress Bar Fill when searching */}
          {isSearching && (
            <div 
              className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, analysisProgress))}%` }}
            />
          )}

          <div className="relative z-10 flex items-center justify-center gap-2 w-full">
            {isSearching ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0"></div>
                <span className="truncate font-bold text-[11px]">
                  {analysisStage || 'Analyzing...'}
                </span>
                <span className="ml-auto font-mono text-[10px] bg-black/30 px-1.5 py-0.5 rounded text-white shrink-0">
                  {analysisProgress}%
                </span>
              </>
            ) : hasUnsearchedChanges ? (
              <>
                <Sparkles size={15} className="text-amber-300 shrink-0" />
                <span>{t('geo_search_btn_ready', 'Run Feasibility Analysis')}</span>
                <span className="ml-auto text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-amber-400/30 text-amber-200 border border-amber-300/40 font-black">
                  Ready
                </span>
              </>
            ) : (
              <>
                <Search size={15} />
                <span>{t('geo_search_btn', 'Search Candidate Locations')}</span>
              </>
            )}
          </div>
        </button>

        {hasUnsearchedChanges && !isSearching && (
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium text-center flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Filters updated. Click button to begin precision analysis.
          </p>
        )}

        <button
          onClick={onReset}
          disabled={isSearching}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <RotateCcw size={13} />
          <span>{t('geo_reset', 'Reset Filters')}</span>
        </button>
      </div>
    </div>
  );
};
