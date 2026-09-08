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
  Navigation
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
  savedCount: number;
  onOpenSavedModal: () => void;
}

export const GeoFilterPanel: React.FC<GeoFilterPanelProps> = ({
  searchParams,
  onParamsChange,
  onSearch,
  onReset,
  isSearching,
  savedCount,
  onOpenSavedModal,
}) => {
  const { t } = useTranslation();
  const [isLocating, setIsLocating] = useState(false);
  const [detectStatus, setDetectStatus] = useState<string | null>(null);

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
    setDetectStatus(null);
    try {
      const loc = await detectUserLocation();
      const matchedState = states.find(
        (s) => s.name.toLowerCase() === loc.state.toLowerCase() || loc.state.toLowerCase().includes(s.name.toLowerCase())
      ) || states[0];

      const matchedDistricts = geoService.getDistricts(matchedState.id);
      const matchedDistrict = matchedDistricts.find(
        (d) => d.name.toLowerCase() === loc.district.toLowerCase() || loc.district.toLowerCase().includes(d.name.toLowerCase())
      ) || matchedDistricts[0];

      const matchedAreas = matchedDistrict ? geoService.getAreas(matchedDistrict.id) : [];
      const matchedArea = matchedAreas.length > 0 ? matchedAreas[0] : null;

      onParamsChange({
        stateId: matchedState.id,
        districtId: matchedDistrict ? matchedDistrict.id : '',
        areaId: matchedArea ? matchedArea.id : '',
      });

      setDetectStatus(`Detected: ${loc.village ? `${loc.village}, ` : ''}${loc.district}, ${loc.state}`);
    } catch (err: any) {
      setDetectStatus(err.message || 'Could not auto-detect location');
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

    onParamsChange({
      stateId: newStateId,
      districtId: newDistrictId,
      areaId: newAreas.length > 0 ? newAreas[0].id : '',
      radiusKm: Math.min(searchParams.radiusKm, newStateObj.maxRadiusKm),
    });
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistrictId = e.target.value;
    const newAreas = geoService.getAreas(newDistrictId);
    onParamsChange({
      districtId: newDistrictId,
      areaId: newAreas.length > 0 ? newAreas[0].id : '',
    });
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onParamsChange({ areaId: e.target.value });
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
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
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
      <div className="p-4 space-y-5 flex-1">
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
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors cursor-pointer"
            >
              <Navigation size={12} className={isLocating ? 'animate-spin' : ''} />
              <span>{isLocating ? t('geo_detecting', 'Locating...') : t('geo_auto_detect', 'Detect My Location')}</span>
            </button>
          </div>
          {detectStatus && (
            <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded border border-emerald-200 dark:border-emerald-800">
              {detectStatus}
            </p>
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
      <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 space-y-2">
        <button
          onClick={onSearch}
          disabled={isSearching}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-primary hover:bg-emerald-600 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-70"
        >
          {isSearching ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Analyzing locations...</span>
            </>
          ) : (
            <>
              <Search size={16} />
              <span>{t('geo_search_btn', 'Search Candidate Locations')}</span>
            </>
          )}
        </button>

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
