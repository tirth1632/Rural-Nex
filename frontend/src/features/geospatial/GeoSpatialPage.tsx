import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GeoFilterPanel 
} from './GeoFilterPanel';
import { 
  GeoMapContainer 
} from './GeoMapContainer';
import { 
  GeoLocationInsights 
} from './GeoLocationInsights';
import { 
  Geo3DViewModal 
} from './Geo3DViewModal';
import { 
  GeoCompareModal 
} from './GeoCompareModal';
import { 
  GeoSavedLocationsModal 
} from './GeoSavedLocationsModal';
import { 
  geoService, 
  type GeoSearchParams, 
  type CandidateLocation 
} from '../../services/geoService';
import { 
  locationService, 
  type SavedLocationItem 
} from '../../services/locationService';
import { Sliders, Map as MapIcon, Scale, BarChart3, ArrowLeft } from 'lucide-react';

export const GeoSpatialPage: React.FC = () => {
  const navigate = useNavigate();
  const insightsRef = useRef<HTMLDivElement>(null);

  // Default Search Parameters
  const [searchParams, setSearchParams] = useState<GeoSearchParams>({
    stateId: 'GJ',
    districtId: 'GJ_AMD',
    areaId: 'GJ_AMD_SANAND',
    radiusKm: 25,
    businessCategory: 'Dairy Farming',
    subType: 'Dairy Processing',
    investmentRange: '₹5–10 lakh',
    constrainToInvestment: true,
    includeNeighboringStates: false,
  });

  const [candidates, setCandidates] = useState<CandidateLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<CandidateLocation | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasUnsearchedChanges, setHasUnsearchedChanges] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [analysisStage, setAnalysisStage] = useState<string>('');

  // Modal States
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);

  // Compare & Saved Lists
  const [compareList, setCompareList] = useState<CandidateLocation[]>([]);
  const [savedLocations, setSavedLocations] = useState<SavedLocationItem[]>([]);

  // View Mode: 'map' = Full Height GIS Map, 'insights' = Detailed Feasibility Report
  const [viewMode, setViewMode] = useState<'map' | 'insights'>('map');
  // Mobile View Tab state ('map' | 'filters' | 'insights')
  const [mobileTab, setMobileTab] = useState<'map' | 'filters' | 'insights'>('map');

  // Initial load of saved locations
  useEffect(() => {
    setSavedLocations(locationService.getSavedLocations());
  }, []);

  // Initial candidate search on page mount only (no automatic re-searching on filter changes)
  useEffect(() => {
    executeSearch(searchParams, false);
  }, []);

  const executeSearch = async (params: GeoSearchParams, isFullAnalysis: boolean = true) => {
    setIsSearching(true);

    if (isFullAnalysis) {
      const activeAreas = params.districtId ? geoService.getAreas(params.districtId) : [];
      const activeArea = activeAreas.find((a) => a.id === params.areaId);
      const activeDistricts = geoService.getDistricts(params.stateId);
      const activeDistrict = activeDistricts.find((d) => d.id === params.districtId);
      const areaLabel = params.customLocationName || activeArea?.name || selectedAreaObj?.name || activeDistrict?.name || selectedDistrictObj?.name || 'Target Area';
      
      // Step 1: GIS Coordinates & Telemetry Calibration (18%)
      setAnalysisProgress(18);
      setAnalysisStage(`Calibrating satellite telemetry & boundary for ${areaLabel}...`);
      await new Promise((r) => setTimeout(r, 400));

      // Step 2: Demographics & Consumer Demand Modeling (42%)
      setAnalysisProgress(42);
      setAnalysisStage(`Modeling consumer base & localized demand for ${params.businessCategory}...`);
      await new Promise((r) => setTimeout(r, 420));

      // Step 3: Competitor Density & Supply Chain Scan (68%)
      setAnalysisProgress(68);
      setAnalysisStage(`Scanning verified competitors & transport corridors within ${params.radiusKm} km...`);
      await new Promise((r) => setTimeout(r, 420));

      // Step 4: Financial Feasibility & Viability Matrix (88%)
      setAnalysisProgress(88);
      setAnalysisStage(`Evaluating multi-factor feasibility, ROI & investment band fit...`);
      await new Promise((r) => setTimeout(r, 380));

      // Step 5: Finalizing Opportunity Rankings (98%)
      setAnalysisProgress(98);
      setAnalysisStage(`Finalizing precision opportunity rankings & opportunity nodes...`);
      await new Promise((r) => setTimeout(r, 280));
    }

    try {
      const results = await geoService.searchLocations(params);
      setCandidates(results);
      if (results.length > 0) {
        setSelectedLocation(results[0]);
      } else {
        setSelectedLocation(null);
      }
      setHasUnsearchedChanges(false);
      setAnalysisProgress(100);
    } catch (err) {
      console.error('GeoSpatial search error:', err);
    } finally {
      setIsSearching(false);
      setAnalysisProgress(0);
      setAnalysisStage('');
    }
  };

  const handleParamsChange = (newParams: Partial<GeoSearchParams>) => {
    setSearchParams((prev) => ({ ...prev, ...newParams }));
    setHasUnsearchedChanges(true);
  };

  const handleResetFilters = () => {
    const defaultParams: GeoSearchParams = {
      stateId: 'GJ',
      districtId: 'GJ_AMD',
      areaId: 'GJ_AMD_SANAND',
      radiusKm: 25,
      businessCategory: 'Dairy Farming',
      subType: 'Dairy Processing',
      investmentRange: '₹5–10 lakh',
      constrainToInvestment: true,
      includeNeighboringStates: false,
      customLat: undefined,
      customLng: undefined,
      customLocationName: undefined,
      customAccuracy: undefined,
    };
    setSearchParams(defaultParams);
    setHasUnsearchedChanges(false);
    executeSearch(defaultParams, true);
  };

  // Toggle Save Location
  const handleToggleSave = (candidate: CandidateLocation) => {
    if (locationService.isLocationSaved(candidate.id)) {
      const updated = locationService.removeSavedLocation(candidate.id);
      setSavedLocations(updated);
    } else {
      const updated = locationService.saveLocation(candidate);
      setSavedLocations(updated);
    }
  };

  // Toggle Compare Location
  const handleToggleCompare = (candidate: CandidateLocation) => {
    if (compareList.some((c) => c.id === candidate.id)) {
      setCompareList(compareList.filter((c) => c.id === candidate.id));
    } else {
      if (compareList.length >= 4) {
        alert('You can compare up to 4 locations side-by-side.');
        return;
      }
      setCompareList([...compareList, candidate]);
    }
  };

  // Run Full Assessment Handler (Pre-fills Wizard & Navigates)
  const handleRunAssessment = (candidate: CandidateLocation) => {
    try {
      sessionStorage.setItem(
        'ruralnex_assessment_prefill',
        JSON.stringify({
          state: candidate.stateName,
          district: candidate.districtName,
          area: candidate.areaName,
          businessCategory: candidate.businessCategory,
          investmentRange: candidate.investmentRange,
        })
      );
    } catch (e) {
      console.warn('SessionStorage write error', e);
    }
    navigate('/wizard');
  };

  // Center Coordinates for Map
  const states = geoService.getStates();
  const selectedStateObj = states.find((s) => s.id === searchParams.stateId) || states[0];
  const districts = geoService.getDistricts(searchParams.stateId);
  const selectedDistrictObj = districts.find((d) => d.id === searchParams.districtId) || districts[0];
  const areas = searchParams.districtId ? geoService.getAreas(searchParams.districtId) : [];
  const selectedAreaObj = areas.find((a) => a.id === searchParams.areaId) || areas[0];

  const mapCenterLat = searchParams.customLat !== undefined 
    ? searchParams.customLat 
    : (selectedAreaObj ? selectedAreaObj.lat : selectedDistrictObj ? selectedDistrictObj.lat : selectedStateObj.lat);
  const mapCenterLng = searchParams.customLng !== undefined 
    ? searchParams.customLng 
    : (selectedAreaObj ? selectedAreaObj.lng : selectedDistrictObj ? selectedDistrictObj.lng : selectedStateObj.lng);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-white dark:bg-black font-sans transition-colors">
      {/* Mobile Top View Switcher Navigation Bar (Visible on small screens) */}
      <div className="md:hidden flex items-center justify-around bg-white dark:bg-black border-b border-gray-200 dark:border-zinc-800 p-2 shrink-0 z-20">
        <button
          onClick={() => { setMobileTab('filters'); setViewMode('map'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            mobileTab === 'filters' && viewMode === 'map'
              ? 'bg-primary text-white shadow-xs' 
              : 'text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-900'
          }`}
        >
          <Sliders size={14} /> Filter
        </button>
        <button
          onClick={() => { setMobileTab('map'); setViewMode('map'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            mobileTab === 'map' && viewMode === 'map'
              ? 'bg-primary text-white shadow-xs' 
              : 'text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-900'
          }`}
        >
          <MapIcon size={14} /> Map ({candidates.length})
        </button>
        <button
          onClick={() => { setMobileTab('insights'); setViewMode('insights'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            viewMode === 'insights' || mobileTab === 'insights'
              ? 'bg-primary text-white shadow-xs' 
              : 'text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-900'
          }`}
        >
          <BarChart3 size={14} /> Insights
        </button>
      </div>

      {/* Desktop Top Sub-Bar: Target Summary & Mode Switcher */}
      <div className="hidden md:flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0c] shrink-0">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-gray-500 dark:text-zinc-400">Target Territory:</span>
          <span className="font-extrabold text-gray-900 dark:text-white bg-gray-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-gray-200/60 dark:border-zinc-700/60">
            {searchParams.customLocationName 
              ? `📍 ${searchParams.customLocationName} (${selectedStateObj?.name})` 
              : `${selectedAreaObj?.name || 'Area'}, ${selectedDistrictObj?.name || 'District'} (${selectedStateObj?.name})`}
          </span>
          {selectedLocation && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 ml-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Active Candidate: <strong className="font-black">{selectedLocation.name}</strong> (★ {selectedLocation.scoreResult.overallScore})
            </span>
          )}
        </div>

        {/* View Mode Toggle Switcher */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-900 p-1 rounded-xl border border-gray-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'map'
                ? 'bg-primary text-white shadow-xs'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <MapIcon size={14} /> Map View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('insights')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'insights'
                ? 'bg-primary text-white shadow-xs'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 size={14} /> Feasibility Insights
            {selectedLocation && (
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold border border-emerald-300/40">
                ★ {selectedLocation.scoreResult.overallScore}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* VIEW 1: Full-Height Map & Filters (100% of available height, never below screen) */}
      {viewMode === 'map' && (
        <div className="w-full flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden bg-white dark:bg-black">
          {/* LEFT PANEL: Filters Sidebar (Normal small compact width: 288px–320px) */}
          <div
            className={`w-full md:w-72 lg:w-[310px] xl:w-[320px] h-full shrink-0 border-b md:border-b-0 md:border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-black z-10 overflow-y-auto ${
              mobileTab === 'filters' ? 'block' : 'hidden md:block'
            }`}
          >
            <GeoFilterPanel
              searchParams={searchParams}
              onParamsChange={handleParamsChange}
              onSearch={() => executeSearch(searchParams, true)}
              onReset={handleResetFilters}
              isSearching={isSearching}
              analysisProgress={analysisProgress}
              analysisStage={analysisStage}
              hasUnsearchedChanges={hasUnsearchedChanges}
              savedCount={savedLocations.length}
              onOpenSavedModal={() => setIsSavedModalOpen(true)}
            />
          </div>

          {/* RIGHT PANEL: Map Container (Expansive canvas, 100% height, smooth responsiveness) */}
          <div
            className={`flex-1 h-full w-full relative overflow-hidden bg-white dark:bg-[#0a0a0c] ${
              mobileTab === 'map' ? 'block' : 'hidden md:block'
            }`}
          >
            <GeoMapContainer
              centerLat={mapCenterLat}
              centerLng={mapCenterLng}
              radiusKm={searchParams.radiusKm}
              candidates={candidates}
              selectedLocation={selectedLocation}
              onSelectLocation={(loc) => {
                setSelectedLocation(loc);
              }}
              onViewInsights={(cand) => {
                if (cand) setSelectedLocation(cand);
                setViewMode('insights');
                setMobileTab('insights');
              }}
              onOpen3DView={() => setIs3DModalOpen(true)}
              isSearching={isSearching}
              analysisProgress={analysisProgress}
              analysisStage={analysisStage}
              onResetFilters={handleResetFilters}
              districtName={selectedDistrictObj?.name || 'Ahmedabad'}
              areaName={searchParams.customLocationName || selectedAreaObj?.name || 'Daskroi Taluka'}
              businessCategory={searchParams.businessCategory}
              subType={searchParams.subType}
              hasUnsearchedChanges={hasUnsearchedChanges}
              onSearch={() => executeSearch(searchParams, true)}
            />
          </div>
        </div>
      )}

      {/* VIEW 2: Detailed Location Insights Full Dashboard */}
      {viewMode === 'insights' && (
        <div className="w-full flex-1 min-h-0 flex flex-col overflow-hidden bg-gray-50/50 dark:bg-black">
          {/* Top Return Navigation Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0c] shrink-0">
            <button
              type="button"
              onClick={() => {
                setViewMode('map');
                setMobileTab('map');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Back to Map View</span>
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-gray-500 dark:text-zinc-400 hidden sm:inline">Analyzed Location:</span>
              <span className="font-black text-gray-900 dark:text-white bg-gray-100 dark:bg-zinc-800 px-3 py-1 rounded-lg border border-gray-200/80 dark:border-zinc-700">
                {selectedLocation ? selectedLocation.name : `${selectedAreaObj?.name || 'Area'}, ${selectedDistrictObj?.name}`}
              </span>
              {selectedLocation && (
                <span className="font-extrabold px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40">
                  ★ {selectedLocation.scoreResult.overallScore} Feasibility Score
                </span>
              )}
            </div>
          </div>

          {/* Full-width scrollable insights report */}
          <div
            ref={insightsRef}
            className="flex-1 min-h-0 overflow-y-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6"
          >
            <div className="w-full max-w-[1600px] mx-auto pb-12">
              <GeoLocationInsights
                location={selectedLocation}
                isSaved={selectedLocation ? locationService.isLocationSaved(selectedLocation.id) : false}
                onToggleSave={() => selectedLocation && handleToggleSave(selectedLocation)}
                onRunAssessment={() => selectedLocation && handleRunAssessment(selectedLocation)}
                onCompare={() => selectedLocation && handleToggleCompare(selectedLocation)}
                isComparing={selectedLocation ? compareList.some((c) => c.id === selectedLocation.id) : false}
                onOpen3DView={() => setIs3DModalOpen(true)}
                onViewCompetitors={() => navigate('/competitors')}
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Compare Action Bar (when locations are added to compare) */}
      {compareList.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-gray-900 dark:bg-zinc-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-gray-700 dark:border-zinc-700 flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Scale size={18} className="text-primary" />
            <span>Comparing {compareList.length} locations</span>
          </div>
          <button
            onClick={() => setIsCompareModalOpen(true)}
            className="px-4 py-1.5 text-xs font-bold text-white bg-primary hover:bg-emerald-600 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Open Matrix
          </button>
          <button
            onClick={() => setCompareList([])}
            className="text-xs text-gray-400 hover:text-white underline cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* Modals */}
      <Geo3DViewModal
        isOpen={is3DModalOpen}
        onClose={() => setIs3DModalOpen(false)}
        location={selectedLocation}
      />

      <GeoCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        compareList={compareList}
        onRemoveFromCompare={(id) => setCompareList(compareList.filter((c) => c.id !== id))}
        onRunAssessment={handleRunAssessment}
      />

      <GeoSavedLocationsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedLocations={savedLocations}
        onRemove={(id) => setSavedLocations(locationService.removeSavedLocation(id))}
        onSelectCandidate={(cand) => setSelectedLocation(cand)}
        onRunAssessment={handleRunAssessment}
      />
    </div>
  );
};

export default GeoSpatialPage;
