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
import { Sliders, Map as MapIcon, Scale } from 'lucide-react';

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

  // Modal States
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);

  // Compare & Saved Lists
  const [compareList, setCompareList] = useState<CandidateLocation[]>([]);
  const [savedLocations, setSavedLocations] = useState<SavedLocationItem[]>([]);

  // Mobile View Tab state ('map' | 'filters')
  const [mobileTab, setMobileTab] = useState<'map' | 'filters'>('map');

  // Initial Data Load & Search
  useEffect(() => {
    setSavedLocations(locationService.getSavedLocations());
    executeSearch(searchParams);
  }, []);

  const executeSearch = async (params: GeoSearchParams) => {
    setIsSearching(true);
    try {
      const results = await geoService.searchLocations(params);
      setCandidates(results);
      if (results.length > 0) {
        setSelectedLocation(results[0]);
      } else {
        setSelectedLocation(null);
      }
    } catch (err) {
      console.error('GeoSpatial search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleParamsChange = (newParams: Partial<GeoSearchParams>) => {
    setSearchParams((prev) => ({ ...prev, ...newParams }));
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
    };
    setSearchParams(defaultParams);
    executeSearch(defaultParams);
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

  const mapCenterLat = selectedAreaObj ? selectedAreaObj.lat : selectedDistrictObj ? selectedDistrictObj.lat : selectedStateObj.lat;
  const mapCenterLng = selectedAreaObj ? selectedAreaObj.lng : selectedDistrictObj ? selectedDistrictObj.lng : selectedStateObj.lng;

  return (
    <div className="w-full min-h-full flex flex-col bg-white dark:bg-black font-sans transition-colors">
      {/* Mobile Top View Switcher Navigation Bar (Visible on small screens) */}
      <div className="md:hidden flex items-center justify-around bg-white dark:bg-black border-b border-gray-200 dark:border-zinc-800 p-2 shrink-0 z-20">
        <button
          onClick={() => setMobileTab('filters')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            mobileTab === 'filters' 
              ? 'bg-primary text-white shadow-xs' 
              : 'text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-900'
          }`}
        >
          <Sliders size={14} /> Filter
        </button>
        <button
          onClick={() => setMobileTab('map')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            mobileTab === 'map' 
              ? 'bg-primary text-white shadow-xs' 
              : 'text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-900'
          }`}
        >
          <MapIcon size={14} /> Map ({candidates.length}) & Insights
        </button>
      </div>

      {/* TOP SECTION: Filters on Left, Map on Right (Expansive Full Viewport Canvas) */}
      <div className="w-full flex flex-col md:flex-row h-auto md:h-[calc(100vh-80px)] min-h-[680px] border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-black shrink-0">
        {/* LEFT PANEL: Filters Sidebar (~380px width on desktop) */}
        <div
          className={`w-full md:w-96 lg:w-[380px] xl:w-[400px] h-[520px] md:h-full shrink-0 border-b md:border-b-0 md:border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-black z-10 overflow-y-auto ${
            mobileTab === 'filters' ? 'block' : 'hidden md:block'
          }`}
        >
          <GeoFilterPanel
            searchParams={searchParams}
            onParamsChange={handleParamsChange}
            onSearch={() => executeSearch(searchParams)}
            onReset={handleResetFilters}
            isSearching={isSearching}
            savedCount={savedLocations.length}
            onOpenSavedModal={() => setIsSavedModalOpen(true)}
          />
        </div>

        {/* RIGHT PANEL: Map Container (Expansive canvas, smooth responsiveness) */}
        <div
          className={`flex-1 h-[520px] md:h-full relative overflow-hidden bg-white dark:bg-[#0a0a0c] ${
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
            onOpen3DView={() => setIs3DModalOpen(true)}
            isSearching={isSearching}
            onResetFilters={handleResetFilters}
            districtName={selectedDistrictObj?.name || 'Anand'}
            businessCategory={searchParams.businessCategory}
            subType={searchParams.subType}
          />
        </div>
      </div>

      {/* BOTTOM SECTION: WHOLE FULL-WIDTH LOCATION INSIGHTS (Below top row, 100% width) */}
      <div
        ref={insightsRef}
        className="w-full bg-gray-50/50 dark:bg-black py-8 px-4 sm:px-6 lg:px-8 space-y-6"
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
