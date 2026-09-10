import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Layers, 
  AlertCircle, 
  RefreshCw, 
  Sun, 
  Moon, 
  Navigation, 
  Plus, 
  Minus, 
  Maximize2, 
  Minimize2, 
  Building2, 
  Store,
  Landmark,
  ShoppingCart,
  X,
  ChevronRight,
  Search,
  CheckCircle2
} from 'lucide-react';
import { geoService, type CandidateLocation, type LayerFeature, type MapFeatureCategory } from '../../services/geoService';
import { GOOGLE_MAPS_TILE_URLS, GOOGLE_MAPS_SUBDOMAINS, GOOGLE_MAPS_ATTRIBUTION } from '../../config/maps';
import RuralLogoLoader from '../../components/RuralLogoLoader';

// 1. Center Location Marker Icon (Vibrant Electric Indigo GPS Pin & Badge for maximum contrast against green theme & terrain)
const createYourLocationPinIcon = (label: string = 'Your Location') => {
  const html = `
    <div style="position: relative; width: 106px; height: 68px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; pointer-events: auto;">
      <!-- Floating Pill Badge (Electric Indigo / Royal Violet for high contrast against green theme & terrain) -->
      <div style="
        background: linear-gradient(135deg, #4F46E5 0%, #3730A3 100%);
        color: #FFFFFF;
        padding: 3px 9px;
        border-radius: 9999px;
        font-weight: 800;
        font-size: 11px;
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        border: 2px solid #FFFFFF;
        box-shadow: 0 4px 14px rgba(79, 70, 229, 0.45), 0 2px 4px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        gap: 5px;
        white-space: nowrap;
        margin-bottom: 2px;
      ">
        <span style="width: 7px; height: 7px; border-radius: 50%; background: #A5B4FC; box-shadow: 0 0 6px #C7D2FE; display: inline-block;"></span>
        <span>${label}</span>
      </div>

      <!-- Small downward pointer triangle for the badge -->
      <div style="
        width: 0;
        height: 0;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 5px solid #3730A3;
        margin-top: -3px;
        margin-bottom: 1px;
      "></div>

      <!-- Subtle ground shadow -->
      <div style="position: absolute; bottom: 0px; left: 50%; transform: translateX(-50%); width: 24px; height: 7px; background: rgba(79, 70, 229, 0.45); border-radius: 50%; filter: blur(2px);"></div>

      <!-- Teardrop GPS Pin: Electric Indigo -->
      <svg viewBox="0 0 24 24" width="34" height="42" style="filter: drop-shadow(0 4px 10px rgba(0,0,0,0.45));">
        <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8z" fill="#4F46E5" stroke="#FFFFFF" stroke-width="2"/>
        <circle cx="12" cy="10" r="4" fill="#FFFFFF"/>
        <circle cx="12" cy="10" r="2.2" fill="#4F46E5"/>
      </svg>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'your-location-pin',
    iconSize: [106, 68],
    iconAnchor: [53, 68],
    popupAnchor: [0, -68],
  });
};

// Helper function to return color-wise identical SVG symbols matching the map legend
const getCategoryIconSvg = (category: MapFeatureCategory | 'location', size: number = 14): string => {
  switch (category) {
    case 'competitor':
      // Building2 / Enterprise SVG
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
          <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
          <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
          <path d="M10 6h4"/>
          <path d="M10 10h4"/>
          <path d="M10 14h4"/>
          <path d="M10 18h4"/>
        </svg>
      `;
    case 'similar':
      // Store / Retail Shop SVG
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
          <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
          <path d="M2 7h20"/>
          <circle cx="12" cy="13" r="1.5" fill="#FFFFFF"/>
        </svg>
      `;
    case 'poi':
      // Landmark / Public POI SVG
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
          <line x1="2" x2="22" y1="22" y2="22"/>
          <line x1="6" x2="6" y1="18" y2="11"/>
          <line x1="10" x2="10" y1="18" y2="11"/>
          <line x1="14" x2="14" y1="18" y2="11"/>
          <line x1="18" x2="18" y1="18" y2="11"/>
          <polygon points="12 2 20 7 4 7"/>
        </svg>
      `;
    case 'market':
      // ShoppingCart / Consumer Target Market SVG
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="8" cy="21" r="1.5" fill="#FFFFFF"/>
          <circle cx="19" cy="21" r="1.5" fill="#FFFFFF"/>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
        </svg>
      `;
    default:
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="3 11 22 2 13 21 11 13 3 11"/>
        </svg>
      `;
  }
};

// 2. Map Feature Circular Marker Icon (Clean Circular Pin with color-wise synchronized symbols)
const createFeatureMarkerIcon = (
  category: MapFeatureCategory, 
  _type: string, 
  _subTypeIcon?: string, 
  _featureName: string = '',
  isExisting: boolean = false
) => {
  let bgColor = '#E11D48'; // Red for competitor
  let shadowColor = 'rgba(225, 29, 72, 0.55)';
  const pinSize = isExisting ? 32 : 26;
  const iconSize = isExisting ? 16 : 14;

  if (category === 'competitor') {
    bgColor = '#E11D48'; // Crimson Red
    shadowColor = 'rgba(225, 29, 72, 0.55)';
  } else if (category === 'similar') {
    bgColor = '#2563EB'; // Royal Blue
    shadowColor = 'rgba(37, 99, 235, 0.55)';
  } else if (category === 'poi') {
    bgColor = '#F59E0B'; // Amber Orange
    shadowColor = 'rgba(245, 158, 11, 0.45)';
  } else if (category === 'market') {
    bgColor = '#0D9488'; // Teal Green
    shadowColor = 'rgba(13, 148, 136, 0.45)';
  }

  // Exact color-wise symbol synchronized with legend
  const svgContent = getCategoryIconSvg(category, iconSize);

  const html = `
    <div style="
      width: ${pinSize}px;
      height: ${pinSize}px;
      border-radius: 50%;
      background: ${bgColor};
      border: ${isExisting ? '2.5px' : '2px'} solid #FFFFFF;
      box-shadow: 0 4px 12px ${shadowColor}, 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
    ">
      ${svgContent}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'category-marker-icon',
    iconSize: [pinSize, pinSize],
    iconAnchor: [pinSize / 2, pinSize / 2],
    popupAnchor: [0, -(pinSize / 2 + 2)],
  });
};

// 3. Custom SVG HTML Markers for Candidate Evaluated Locations (Clean Pin without Rating text, Rating shows on Hover)
const createCustomScoreIcon = (score: number, isSelected: boolean = false, rank: number = 1) => {
  let bgColor = '#059669'; // Emerald
  let borderColor = '#047857';

  if (rank === 1) {
    bgColor = '#047857';
    borderColor = '#022c22';
  } else if (score >= 80) {
    bgColor = '#059669';
    borderColor = '#065f46';
  } else if (score >= 65) {
    bgColor = '#0D9488';
    borderColor = '#0F766E';
  } else {
    bgColor = '#E11D48';
    borderColor = '#BE123C';
  }

  const selectedGlow = isSelected
    ? 'filter: drop-shadow(0 0 8px #34D399) drop-shadow(0 4px 10px rgba(0,0,0,0.5)); transform: scale(1.18);'
    : 'filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));';

  const html = `
    <div style="
      position: relative;
      width: 32px;
      height: 42px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      cursor: pointer;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    ">
      <!-- Ground shadow -->
      <div style="
        position: absolute;
        bottom: 0px;
        left: 50%;
        transform: translateX(-50%);
        width: 18px;
        height: 6px;
        background: rgba(0, 0, 0, 0.35);
        border-radius: 50%;
        filter: blur(1.5px);
      "></div>

      <!-- Opportunity Teardrop Pin (Rating number removed, shows on hover tooltip) -->
      <svg viewBox="0 0 24 28" width="30" height="38" style="
        ${selectedGlow}
        transition: transform 0.2s;
      ">
        <path 
          d="M12 2C7.03 2 3 6.03 3 11c0 6.5 9 15 9 15s9-8.5 9-15c0-4.97-4.03-9-9-9z" 
          fill="${bgColor}" 
          stroke="${rank === 1 ? '#F59E0B' : '#FFFFFF'}" 
          stroke-width="${rank === 1 ? '2.4' : '2'}"
        />
        <circle cx="12" cy="11" r="5.2" fill="${borderColor}" />
        <path 
          d="M12 7.2l1.25 2.53 2.79.41-2.02 1.97.48 2.78L12 13.58l-2.5 1.31.48-2.78-2.02-1.97 2.79-.41L12 7.2z" 
          fill="#FDE047" 
        />
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-score-marker',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
};

// Map Controller for Smooth flyTo Navigation and InvalidateSize handling
const MapController: React.FC<{
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  recenterTrigger: number;
  isFullscreen: boolean;
  targetFlyTo: { lat: number; lng: number; zoom?: number } | null;
}> = ({ centerLat, centerLng, radiusKm, recenterTrigger, isFullscreen, targetFlyTo }) => {
  const map = useMap();

  // Silky-smooth cinematic flyTo navigation
  useEffect(() => {
    if (targetFlyTo) {
      map.flyTo([targetFlyTo.lat, targetFlyTo.lng], targetFlyTo.zoom || 14, {
        duration: 1.1,
        easeLinearity: 0.25,
      });
      return;
    }
    const targetZoom = radiusKm > 80 ? 9 : radiusKm > 40 ? 10 : radiusKm > 15 ? 11 : 12;
    map.flyTo([centerLat, centerLng], targetZoom, {
      duration: 1.25,
      easeLinearity: 0.25,
    });
  }, [centerLat, centerLng, radiusKm, recenterTrigger, targetFlyTo, map]);

  // Handle map canvas redraw on container resize & fullscreen toggles
  useEffect(() => {
    const invalidate = () => {
      map.invalidateSize({ animate: false });
    };

    invalidate();
    const timer1 = setTimeout(invalidate, 100);
    const timer2 = setTimeout(invalidate, 300);

    let observer: ResizeObserver | null = null;
    const container = map.getContainer();
    if (container) {
      observer = new ResizeObserver(() => {
        map.invalidateSize({ animate: false });
      });
      observer.observe(container);
    }

    window.addEventListener('resize', invalidate);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (observer) observer.disconnect();
      window.removeEventListener('resize', invalidate);
    };
  }, [isFullscreen, map]);

  return null;
};

// Modern Floating Glassmorphic Zoom Controls
const CustomZoomControls: React.FC = () => {
  const map = useMap();
  return (
    <div className="absolute right-4 bottom-6 z-[1000] flex flex-col bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-md border border-gray-200/90 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden pointer-events-auto transition-all">
      <button
        type="button"
        onClick={() => map.zoomIn(1, { animate: true })}
        title="Zoom In"
        aria-label="Zoom in"
        className="p-2 text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-primary transition-all active:scale-90 cursor-pointer border-b border-gray-100 dark:border-zinc-800 flex items-center justify-center"
      >
        <Plus size={16} strokeWidth={2.5} />
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut(1, { animate: true })}
        title="Zoom Out"
        aria-label="Zoom out"
        className="p-2 text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-primary transition-all active:scale-90 cursor-pointer flex items-center justify-center"
      >
        <Minus size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
};


interface GeoMapContainerProps {
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  candidates: CandidateLocation[];
  selectedLocation: CandidateLocation | null;
  onSelectLocation: (location: CandidateLocation) => void;
  onOpen3DView?: () => void;
  onViewInsights?: (location: CandidateLocation) => void;
  isSearching: boolean;
  analysisProgress?: number;
  analysisStage?: string;
  onResetFilters: () => void;
  districtName?: string;
  areaName?: string;
  businessCategory?: string;
  subType?: string;
  hasUnsearchedChanges?: boolean;
  onSearch?: () => void;
}

export const GeoMapContainer: React.FC<GeoMapContainerProps> = ({
  centerLat,
  centerLng,
  radiusKm,
  candidates,
  selectedLocation,
  onSelectLocation,
  onViewInsights,
  isSearching,
  analysisProgress = 0,
  analysisStage = '',
  onResetFilters,
  districtName = 'Ahmedabad',
  areaName = 'Daskroi Taluka',
  businessCategory = 'Dairy Farming',
  subType,
  hasUnsearchedChanges = false,
  onSearch,
}) => {
  const [mapTileMode, setMapTileMode] = useState<'standard' | 'satellite' | 'terrain'>('standard');
  const [isNightMode, setIsNightMode] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark') || document.documentElement.getAttribute('data-theme') === 'dark';
  });
  const [isLocationOn, setIsLocationOn] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [recenterTrigger, setRecenterTrigger] = useState<number>(0);
  const [showExistingList, setShowExistingList] = useState<boolean>(false);
  const [existingSearchQuery, setExistingSearchQuery] = useState<string>('');
  const [existingTabFilter, setExistingTabFilter] = useState<'all' | 'competitor' | 'similar'>('all');
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [targetFlyTo, setTargetFlyTo] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);

  // Layer category filters matching the screenshot
  const [visibleCategories, setVisibleCategories] = useState<Record<string, boolean>>({
    competitor: true,
    similar: true,
    poi: true,
    market: true,
  });

  const [layerFeatures, setLayerFeatures] = useState<LayerFeature[]>([]);

  // Sync isNightMode with document dark mode state
  useEffect(() => {
    const checkDark = () => {
      const darkNow = document.documentElement.classList.contains('dark') || document.documentElement.getAttribute('data-theme') === 'dark';
      setIsNightMode(darkNow);
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    return () => observer.disconnect();
  }, []);

  // Reset targetFlyTo when search center location changes
  useEffect(() => {
    setTargetFlyTo(null);
  }, [centerLat, centerLng]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Load accurately located map layer features based on chosen location & parameters
  useEffect(() => {
    geoService
      .getLayersData(centerLat, centerLng, radiusKm, districtName, businessCategory, subType, areaName)
      .then(setLayerFeatures);
  }, [centerLat, centerLng, radiusKm, districtName, businessCategory, subType, areaName]);

  // Tile Layer URLs (Google Maps API)
  const tileUrls = {
    standard: GOOGLE_MAPS_TILE_URLS.roadmap,
    satellite: GOOGLE_MAPS_TILE_URLS.satellite,
    terrain: GOOGLE_MAPS_TILE_URLS.terrain,
  };

  const activeTileUrl = tileUrls[mapTileMode];
  const activeAttribution = GOOGLE_MAPS_ATTRIBUTION;

  const toggleCategory = (cat: string) => {
    setVisibleCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Counts for legend
  const counts = {
    competitors: layerFeatures.filter((f) => f.category === 'competitor').length,
    similar: layerFeatures.filter((f) => f.category === 'similar').length,
    pois: layerFeatures.filter((f) => f.category === 'poi').length,
    markets: layerFeatures.filter((f) => f.category === 'market').length,
  };  // Filtered actual existing businesses for the drawer
  const filteredExistingFeatures = layerFeatures
    .filter((f) => f.category === 'competitor' || f.category === 'similar')
    .filter((f) => {
      if (existingTabFilter !== 'all' && f.category !== existingTabFilter) return false;
      if (!existingSearchQuery.trim()) return true;
      const q = existingSearchQuery.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        (f.details && f.details.toLowerCase().includes(q)) ||
        (f.capacity && f.capacity.toLowerCase().includes(q))
      );
    });

  // Filter candidates to strictly inside active radius zone so candidate pins from a previous search area are never rendered stranded outside the search circle
  const visibleCandidates = candidates.filter((cand) => {
    const dLat = (cand.lat - centerLat) * 111;
    const dLng = (cand.lng - centerLng) * 111 * Math.cos((centerLat * Math.PI) / 180);
    return Math.hypot(dLat, dLng) <= radiusKm * 1.25;
  });

  return (
    <div className={`relative w-full h-full flex flex-col overflow-hidden transition-all duration-300 ${
      isFullscreen ? 'fixed inset-0 z-[9999] w-screen h-screen bg-black' : 'h-full w-full bg-white dark:bg-black z-0 isolate'
    } ${isNightMode && mapTileMode !== 'satellite' ? 'leaflet-night-mode' : ''}`}>
      {/* Floating Notification Pill when location has changed but feasibility search hasn't run yet */}
      {hasUnsearchedChanges && visibleCandidates.length === 0 && !isSearching && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-auto max-w-md w-[92%] sm:w-auto animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5 bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-emerald-500/40 shadow-xl text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
            <span className="text-gray-700 dark:text-zinc-200 font-semibold truncate">
              Target area set to <strong className="text-gray-900 dark:text-white font-extrabold">{areaName || districtName}</strong>
            </span>
            {onSearch && (
              <button
                type="button"
                onClick={onSearch}
                className="px-3 py-1 bg-primary hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-colors shrink-0 shadow-xs cursor-pointer flex items-center gap-1"
              >
                <Search size={12} />
                <span>Run Analysis</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top Left: Map Style Selector Pills */}
      <div className="absolute top-4 left-4 z-[1000] flex items-center gap-1 bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-md border border-gray-200/90 dark:border-zinc-800 rounded-xl p-1 shadow-md pointer-events-auto">
        <button
          onClick={() => { setMapTileMode('standard'); setIsNightMode(false); }}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            mapTileMode === 'standard' && !isNightMode ? 'bg-primary text-white shadow-xs' : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          Roadmap
        </button>
        <button
          onClick={() => { setMapTileMode('satellite'); setIsNightMode(false); }}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            mapTileMode === 'satellite' ? 'bg-primary text-white shadow-xs' : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => { setMapTileMode('terrain'); setIsNightMode(false); }}
          className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer hidden sm:block ${
            mapTileMode === 'terrain' && !isNightMode ? 'bg-primary text-white shadow-xs' : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          Terrain
        </button>
      </div>

      {/* Top Right: Actions & Vertical Map Legend (Existing Businesses First) */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-row items-start gap-2.5 pointer-events-auto">
        {/* Floating Existing Businesses Drawer / List Panel (Positioned side-by-side with Legend) */}
        {showExistingList && (
          <div className="w-80 sm:w-92 max-h-[calc(100vh-140px)] bg-white/98 dark:bg-[#0a0a0c]/98 backdrop-blur-xl rounded-2xl border border-gray-200/90 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="p-3 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50/70 dark:bg-zinc-900/70">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <Building2 size={15} />
                </div>
                <div className="truncate">
                  <h4 className="text-xs font-black text-gray-900 dark:text-white leading-tight truncate">
                    Actual Existing Businesses
                  </h4>
                  <p className="text-[10px] text-gray-500 dark:text-zinc-400 truncate">
                    {businessCategory}{subType ? ` • ${subType}` : ''} in {districtName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExistingList(false)}
                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Close list"
              >
                <X size={15} />
              </button>
            </div>

            {/* Quick Search & Filter Tabs */}
            <div className="p-2 border-b border-gray-100 dark:border-zinc-800/80 space-y-1.5 bg-white dark:bg-[#0a0a0c]">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search existing enterprise..."
                  value={existingSearchQuery}
                  onChange={(e) => setExistingSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 text-xs bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 text-gray-900 dark:text-white placeholder:text-gray-400"
                />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setExistingTabFilter('all')}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    existingTabFilter === 'all'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  All ({counts.competitors + counts.similar})
                </button>
                <button
                  type="button"
                  onClick={() => setExistingTabFilter('competitor')}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    existingTabFilter === 'competitor'
                      ? 'bg-[#E11D48] text-white shadow-2xs'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60'
                  }`}
                >
                  Competitors ({counts.competitors})
                </button>
                <button
                  type="button"
                  onClick={() => setExistingTabFilter('similar')}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    existingTabFilter === 'similar'
                      ? 'bg-[#2563EB] text-white shadow-2xs'
                      : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60'
                  }`}
                >
                  Similar ({counts.similar})
                </button>
              </div>
            </div>

            {/* Scrollable list */}
            <div className="p-2 space-y-1.5 overflow-y-auto max-h-[360px]">
              {filteredExistingFeatures.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400">
                  No matching businesses found
                </div>
              ) : (
                filteredExistingFeatures.map((feat) => {
                  const isComp = feat.category === 'competitor';
                  return (
                    <div
                      key={feat.id}
                      onClick={() => {
                        setTargetFlyTo({ lat: feat.lat, lng: feat.lng, zoom: 14 });
                        setSelectedFeatureId(feat.id);
                      }}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer text-left group ${
                        selectedFeatureId === feat.id 
                          ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 ring-2 ring-rose-500/20'
                          : 'bg-white dark:bg-zinc-900/70 border-gray-100 dark:border-zinc-800/80 hover:bg-gray-50 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-[9.5px] font-extrabold uppercase px-1.5 py-0.5 rounded flex items-center gap-1 ${
                          isComp ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {isComp ? <Building2 size={10} strokeWidth={2.4} /> : <Store size={10} strokeWidth={2.4} />}
                          {isComp ? 'Competitor' : 'Similar Business'}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-400">
                          {feat.distanceKm} km away
                        </span>
                      </div>
                      <h5 className="text-[11.5px] font-bold text-gray-900 dark:text-white leading-snug group-hover:text-primary transition-colors">
                        {feat.name}
                      </h5>
                      {feat.details && (
                        <p className="text-[10px] text-gray-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                          {feat.details}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-[9.5px] text-gray-400 dark:text-zinc-500 pt-1.5 mt-1 border-t border-gray-50 dark:border-zinc-800/50">
                        <span>{feat.establishedYear ? `Est. ${feat.establishedYear} (${feat.yearsOperating} yrs)` : 'Operating'}</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{feat.capacity || 'Verified Active'}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Vertical Toolbar + Perfected Legend Card Container */}
        <div className="flex flex-col items-end gap-2">
          {/* Compact Utility Actions Toolbar */}
          <div className="flex items-center gap-1.5 bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-md p-1 rounded-xl border border-gray-200/90 dark:border-zinc-800 shadow-md">
            {/* Recenter Button */}
            <button
              type="button"
              onClick={() => {
                setTargetFlyTo(null);
                setRecenterTrigger((prev) => prev + 1);
              }}
              title="Recenter Map to Search Location"
              aria-label="Recenter map"
              className="p-1.5 rounded-lg text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-primary transition-all active:scale-95 cursor-pointer flex items-center justify-center group"
            >
              <Navigation size={15} className="text-primary group-hover:rotate-45 transition-transform duration-300" />
            </button>

            {/* Day / Night Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsNightMode(!isNightMode)}
              title={isNightMode ? 'Night Mode Active (Click for Day Mode)' : 'Day Mode Active (Click for Night Mode)'}
              aria-label="Toggle Night/Day Mode"
              className="p-1.5 rounded-lg text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            >
              {isNightMode ? <Moon size={15} className="text-indigo-400" /> : <Sun size={15} className="text-amber-500" />}
            </button>

            {/* Fullscreen Map Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Expand Map Fullscreen'}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
              className="p-1.5 rounded-lg text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            >
              {isFullscreen ? <Minimize2 size={15} className="text-primary" /> : <Maximize2 size={15} />}
            </button>
          </div>

          {/* Vertical Map Legend Card (Showing Actual Existing Businesses FIRST) */}
          <div className="w-56 sm:w-60 max-h-[calc(100vh-140px)] overflow-y-auto bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-xl p-2.5 sm:p-3 rounded-2xl border border-gray-200/90 dark:border-zinc-800 shadow-xl flex flex-col gap-1 text-[11.5px] font-bold text-gray-700 dark:text-zinc-200 transition-all select-none">
            {/* Section 1: ACTUAL EXISTING BUSINESSES FIRST */}
            <div className="flex items-center justify-between px-1 pb-2 border-b border-gray-100 dark:border-zinc-800/80 mb-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-md bg-rose-50 dark:bg-rose-950/80 border border-rose-200/70 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-2xs">
                  <Building2 size={10.5} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Existing Businesses
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowExistingList((prev) => !prev)}
                className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                  showExistingList
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 hover:scale-105 active:scale-95'
                }`}
                title="Click to explore full verified list of existing businesses"
              >
                <span>{counts.competitors + counts.similar} Listed</span>
                <ChevronRight size={11} className={`transition-transform duration-200 ${showExistingList ? 'rotate-90' : ''}`} />
              </button>
            </div>

            {/* 1. Competitors (Red) */}
            <button
              type="button"
              onClick={() => toggleCategory('competitor')}
              className={`group flex items-center justify-between gap-2.5 px-2 py-1.5 rounded-xl cursor-pointer transition-all text-left active:scale-[0.98] ${
                visibleCategories.competitor
                  ? 'hover:bg-gray-100/80 dark:hover:bg-zinc-800/80'
                  : 'opacity-40 hover:opacity-75'
              }`}
              title="Click to toggle Competitor markers on map"
            >
              <div className="flex items-center gap-2 truncate">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    visibleCategories.competitor
                      ? 'bg-[#E11D48] text-white shadow-xs shadow-rose-500/40 ring-1.5 ring-white dark:ring-zinc-800 group-hover:scale-110'
                      : 'border border-gray-400 dark:border-zinc-600 text-gray-400 dark:text-zinc-500 bg-transparent'
                  }`}
                >
                  <Building2 size={11} strokeWidth={2.4} />
                </div>
                <span
                  className={`truncate transition-colors text-xs font-semibold ${
                    visibleCategories.competitor ? 'text-gray-800 dark:text-zinc-200' : 'text-gray-400 dark:text-zinc-500'
                  }`}
                >
                  Competitors
                </span>
              </div>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-md min-w-[22px] text-center border transition-all shadow-2xs ${
                  visibleCategories.competitor
                    ? 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 border-rose-200/80 dark:border-rose-800/60'
                    : 'text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800/80 border-transparent'
                }`}
              >
                {counts.competitors}
              </span>
            </button>

            {/* 2. Similar Businesses (Blue) */}
            <button
              type="button"
              onClick={() => toggleCategory('similar')}
              className={`group flex items-center justify-between gap-2.5 px-2 py-1.5 rounded-xl cursor-pointer transition-all text-left active:scale-[0.98] ${
                visibleCategories.similar
                  ? 'hover:bg-gray-100/80 dark:hover:bg-zinc-800/80'
                  : 'opacity-40 hover:opacity-75'
              }`}
              title="Click to toggle Similar Business markers on map"
            >
              <div className="flex items-center gap-2 truncate">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    visibleCategories.similar
                      ? 'bg-[#2563EB] text-white shadow-xs shadow-blue-500/40 ring-1.5 ring-white dark:ring-zinc-800 group-hover:scale-110'
                      : 'border border-gray-400 dark:border-zinc-600 text-gray-400 dark:text-zinc-500 bg-transparent'
                  }`}
                >
                  <Store size={11} strokeWidth={2.4} />
                </div>
                <span
                  className={`truncate transition-colors text-xs font-semibold ${
                    visibleCategories.similar ? 'text-gray-800 dark:text-zinc-200' : 'text-gray-400 dark:text-zinc-500'
                  }`}
                >
                  Similar Businesses
                </span>
              </div>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-md min-w-[22px] text-center border transition-all shadow-2xs ${
                  visibleCategories.similar
                    ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 border-blue-200/80 dark:border-blue-800/60'
                    : 'text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800/80 border-transparent'
                }`}
              >
                {counts.similar}
              </span>
            </button>

            {/* Section 2: Surrounding Ecosystem & POIs */}
            <div className="flex items-center justify-between px-1 pt-2 pb-1 border-t border-gray-100 dark:border-zinc-800/80 mt-0.5 mb-0.5">
              <div className="flex items-center gap-1.5">
                <Layers size={11} className="text-gray-400 dark:text-zinc-500" />
                <span className="text-[9.5px] font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                  Ecosystem & POIs
                </span>
              </div>
            </div>

            {/* 3. Key POIs (Orange/Amber) */}
            <button
              type="button"
              onClick={() => toggleCategory('poi')}
              className={`group flex items-center justify-between gap-2.5 px-2 py-1.5 rounded-xl cursor-pointer transition-all text-left active:scale-[0.98] ${
                visibleCategories.poi
                  ? 'hover:bg-gray-100/80 dark:hover:bg-zinc-800/80'
                  : 'opacity-40 hover:opacity-75'
              }`}
              title="Click to toggle Key POI markers on map"
            >
              <div className="flex items-center gap-2 truncate">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    visibleCategories.poi
                      ? 'bg-[#F59E0B] text-white shadow-xs shadow-amber-500/40 ring-1.5 ring-white dark:ring-zinc-800 group-hover:scale-110'
                      : 'border border-gray-400 dark:border-zinc-600 text-gray-400 dark:text-zinc-500 bg-transparent'
                  }`}
                >
                  <Landmark size={11} strokeWidth={2.4} />
                </div>
                <span
                  className={`truncate transition-colors text-xs font-semibold ${
                    visibleCategories.poi ? 'text-gray-800 dark:text-zinc-200' : 'text-gray-400 dark:text-zinc-500'
                  }`}
                >
                  Key POIs
                </span>
              </div>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-md min-w-[22px] text-center border transition-all shadow-2xs ${
                  visibleCategories.poi
                    ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 border-amber-200/80 dark:border-amber-800/60'
                    : 'text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800/80 border-transparent'
                }`}
              >
                {counts.pois}
              </span>
            </button>

            {/* 4. Target Market (Teal) */}
            <button
              type="button"
              onClick={() => toggleCategory('market')}
              className={`group flex items-center justify-between gap-2.5 px-2 py-1.5 rounded-xl cursor-pointer transition-all text-left active:scale-[0.98] ${
                visibleCategories.market
                  ? 'hover:bg-gray-100/80 dark:hover:bg-zinc-800/80'
                  : 'opacity-40 hover:opacity-75'
              }`}
              title="Click to toggle Target Market markers on map"
            >
              <div className="flex items-center gap-2 truncate">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    visibleCategories.market
                      ? 'bg-[#0D9488] text-white shadow-xs shadow-teal-500/40 ring-1.5 ring-white dark:ring-zinc-800 group-hover:scale-110'
                      : 'border border-gray-400 dark:border-zinc-600 text-gray-400 dark:text-zinc-500 bg-transparent'
                  }`}
                >
                  <ShoppingCart size={11} strokeWidth={2.4} />
                </div>
                <span
                  className={`truncate transition-colors text-xs font-semibold ${
                    visibleCategories.market ? 'text-gray-800 dark:text-zinc-200' : 'text-gray-400 dark:text-zinc-500'
                  }`}
                >
                  Target Market
                </span>
              </div>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-md min-w-[22px] text-center border transition-all shadow-2xs ${
                  visibleCategories.market
                    ? 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/70 border-teal-200/80 dark:border-teal-800/60'
                    : 'text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800/80 border-transparent'
                }`}
              >
                {counts.markets}
              </span>
            </button>

            {/* 5. Your Location (Electric Indigo) */}
            <button
              type="button"
              onClick={() => setIsLocationOn(!isLocationOn)}
              className={`group flex items-center justify-between gap-2.5 px-2 py-1.5 rounded-xl cursor-pointer transition-all text-left active:scale-[0.98] ${
                isLocationOn
                  ? 'hover:bg-gray-100/80 dark:hover:bg-zinc-800/80'
                  : 'opacity-40 hover:opacity-75'
              }`}
              title="Click to toggle Your Location pin on map"
            >
              <div className="flex items-center gap-2 truncate">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isLocationOn
                      ? 'bg-[#4F46E5] text-white shadow-xs shadow-indigo-500/40 ring-1.5 ring-white dark:ring-zinc-800 group-hover:scale-110'
                      : 'border border-gray-400 dark:border-zinc-600 text-gray-400 dark:text-zinc-500 bg-transparent'
                  }`}
                >
                  <Navigation size={11} strokeWidth={2.4} />
                </div>
                <span
                  className={`truncate transition-colors text-xs font-semibold ${
                    isLocationOn ? 'text-gray-800 dark:text-zinc-200' : 'text-gray-400 dark:text-zinc-500'
                  }`}
                >
                  Your Location
                </span>
              </div>
              <span
                className={`text-[9.5px] font-black px-2 py-0.5 rounded-md min-w-[24px] text-center border transition-all shadow-2xs ${
                  isLocationOn
                    ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border-indigo-200/80 dark:border-indigo-800/60'
                    : 'text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800/80 border-transparent'
                }`}
              >
                {isLocationOn ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Precision GIS Telemetry Radar Scanner HUD Overlay */}
      {isSearching && (
        <div className="absolute inset-0 z-[1001] bg-black/65 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white/95 dark:bg-[#0d0e12]/95 border border-emerald-500/30 dark:border-emerald-500/25 shadow-2xl rounded-3xl p-6 sm:p-7 max-w-md w-full flex flex-col items-center relative overflow-hidden text-left">
            {/* Ambient emerald backlight */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-24 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none" />

            {/* RuralNex GIS Telemetry Logo Loader with Radar Pulse Rings */}
            <div className="mb-2">
              <RuralLogoLoader size="radar" />
            </div>

            {/* Title & Parameter Badges */}
            <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white tracking-tight text-center">
              GIS Precision Telemetry & Feasibility Engine
            </h3>
            
            <div className="flex flex-wrap items-center justify-center gap-1.5 my-2.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700">
                📍 {districtName}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                🏢 {businessCategory}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                🧭 {radiusKm} km radius
              </span>
            </div>

            {/* Dynamic Stage Message & Percentage */}
            <div className="w-full mt-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-700 dark:text-zinc-200 truncate pr-2">
                  {analysisStage || 'Calibrating multi-dimensional telemetry...'}
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 shrink-0 font-extrabold text-sm">
                  {analysisProgress}%
                </span>
              </div>

              {/* High-tech Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-zinc-800/90 h-2 rounded-full overflow-hidden relative shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-300 ease-out shadow-xs"
                  style={{ width: `${Math.min(100, Math.max(0, analysisProgress))}%` }}
                />
              </div>
            </div>

            {/* 5-Step Telemetry Phase Checklist */}
            <div className="w-full mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800/80 space-y-2">
              {[
                { label: 'Satellite & GIS Boundary Telemetry Calibration', thresh: 18 },
                { label: 'Demographics & Consumer Market Modeling', thresh: 42 },
                { label: 'Competitor Density & Road Connectivity Scan', thresh: 68 },
                { label: 'Multi-Factor Financial Feasibility & ROI Matrix', thresh: 88 },
                { label: 'Precision Opportunity Scoring & Node Finalization', thresh: 98 },
              ].map((phase, idx, arr) => {
                const isPassed = analysisProgress >= phase.thresh;
                const prevPassed = idx === 0 || analysisProgress >= arr[idx - 1].thresh;
                const isCurrent = !isPassed && prevPassed;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 text-[11px] transition-colors ${
                      isPassed
                        ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                        : isCurrent
                        ? 'text-gray-900 dark:text-white font-bold'
                        : 'text-gray-400 dark:text-zinc-600'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-zinc-700 shrink-0 ml-1 mr-0.5" />
                    )}
                    <span className="truncate">{phase.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Empty State Overlay */}
      {!isSearching && candidates.length === 0 && (
        <div className="absolute inset-0 z-[999] bg-white/90 dark:bg-black/90 backdrop-blur-xs flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-zinc-800 p-8 rounded-2xl shadow-xl space-y-4">
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No suitable locations found</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">
                No location nodes matched your strict criteria. Try expanding radius or toggling neighboring zones.
              </p>
            </div>
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-emerald-600 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw size={14} /> Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Leaflet React Map Container (Custom Zoom, High Smoothness) */}
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={radiusKm > 80 ? 9 : radiusKm > 40 ? 10 : radiusKm > 15 ? 11 : 12}
        scrollWheelZoom={true}
        zoomControl={false}
        zoomAnimation={true}
        fadeAnimation={true}
        markerZoomAnimation={true}
        wheelPxPerZoomLevel={120}
        wheelDebounceTime={40}
        className="w-full h-full"
        style={{ width: '100%', height: '100%', zIndex: 1, backgroundColor: isNightMode ? '#0a0a0c' : '#f3f4f6' }}
      >
        <TileLayer url={activeTileUrl} attribution={activeAttribution} subdomains={GOOGLE_MAPS_SUBDOMAINS} />

        {/* Cinematic Map Smooth Controller */}
        <MapController
          centerLat={centerLat}
          centerLng={centerLng}
          radiusKm={radiusKm}
          recenterTrigger={recenterTrigger}
          isFullscreen={isFullscreen}
          targetFlyTo={targetFlyTo}
        />
        {/* Custom Modern Floating Zoom In / Zoom Out Controls */}
        <CustomZoomControls />

        {/* Concentric Circle 1: Inner Core Zone Circle */}
        <Circle
          center={[centerLat, centerLng]}
          radius={radiusKm * 400}
          pathOptions={{
            color: '#10B981',
            fillColor: '#10B981',
            fillOpacity: 0.05,
            weight: 1,
          }}
        />

        {/* Concentric Circle 2: Outer Search Radius Circle */}
        <Circle
          center={[centerLat, centerLng]}
          radius={radiusKm * 1000}
          pathOptions={{
            color: '#10B981',
            fillColor: '#10B981',
            fillOpacity: 0.09,
            weight: 2,
            dashArray: '6, 6',
          }}
        />

        {/* User Current / Search Center Pin Marker (Fixed to selected location, only moves when location changes) */}
        {isLocationOn && (
          <>
            {/* Center Pulsing Aura Ring: Electric Indigo */}
            <Circle
              center={[centerLat, centerLng]}
              radius={80}
              pathOptions={{
                color: '#4F46E5',
                fillColor: '#6366F1',
                fillOpacity: 0.28,
                weight: 2,
              }}
            />
            <Marker
              position={[centerLat, centerLng]}
              icon={createYourLocationPinIcon()}
              draggable={false}
              zIndexOffset={600}
            >
              <Tooltip direction="top" offset={[0, -68]} opacity={1}>
                <div className="px-2 py-1 text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5 font-sans whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  Search Center ({areaName || districtName})
                </div>
              </Tooltip>
              <Popup>
                <div className="p-1 text-xs font-sans">
                  <strong className="text-gray-900 font-bold block">{areaName || 'Your Location'}</strong>
                  <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">Target Location ({districtName})</p>
                  <span className="text-gray-500 font-mono text-[10px] block mt-1">
                    {centerLat.toFixed(5)}, {centerLng.toFixed(5)}
                  </span>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Map Categorized Feature Markers (Actual Existing Businesses, Key POIs, Target Market) */}
        {layerFeatures.map((feat) => {
          if (!visibleCategories[feat.category]) return null;
          const isExisting = feat.category === 'competitor' || feat.category === 'similar' || !!feat.isExisting;
          return (
            <Marker
              key={feat.id}
              position={[feat.lat, feat.lng]}
              icon={createFeatureMarkerIcon(feat.category, feat.type, feat.subTypeIcon, feat.name, isExisting)}
              zIndexOffset={feat.category === 'competitor' ? 350 : feat.category === 'similar' ? 300 : 250}
            >
              {/* Detailed Hover Tooltip - Appears on hover */}
              <Tooltip
                direction="top"
                offset={[0, isExisting ? -18 : -15]}
                opacity={1}
                className="custom-feature-tooltip"
              >
                <div className="p-2 text-xs font-sans min-w-[210px] max-w-[280px] space-y-1.5 pointer-events-none">
                  {/* Category Pill & Distance */}
                  <div className="flex items-center justify-between gap-2 pb-1 border-b border-gray-100 dark:border-zinc-800">
                    <span className="flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-wide">
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-white shadow-2xs"
                        style={{
                          backgroundColor:
                            feat.category === 'competitor' ? '#E11D48' :
                            feat.category === 'similar' ? '#2563EB' :
                            feat.category === 'poi' ? '#F59E0B' : '#0D9488'
                        }}
                      >
                        {feat.category === 'competitor' && <Building2 size={9} strokeWidth={2.5} />}
                        {feat.category === 'similar' && <Store size={9} strokeWidth={2.5} />}
                        {feat.category === 'poi' && <Landmark size={9} strokeWidth={2.5} />}
                        {feat.category === 'market' && <ShoppingCart size={9} strokeWidth={2.5} />}
                      </span>
                      <span className={
                        feat.category === 'competitor' ? 'text-rose-600 dark:text-rose-400' :
                        feat.category === 'similar' ? 'text-blue-600 dark:text-blue-400' :
                        feat.category === 'poi' ? 'text-amber-600 dark:text-amber-400' :
                        'text-teal-600 dark:text-teal-400'
                      }>
                        {feat.category === 'competitor' ? 'Competitor' :
                         feat.category === 'similar' ? 'Similar Business' :
                         feat.category === 'poi' ? 'Key POI' : 'Target Market'}
                      </span>
                    </span>
                    <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-400">
                      {feat.distanceKm} km away
                    </span>
                  </div>

                  {/* Full Enterprise Name */}
                  <h5 className="font-extrabold text-[12px] text-gray-900 dark:text-white leading-snug">
                    {feat.name}
                  </h5>

                  {/* Operational Details */}
                  {feat.details && (
                    <p className="text-[10px] text-gray-600 dark:text-zinc-300 leading-snug line-clamp-2">
                      {feat.details}
                    </p>
                  )}

                  {/* Established Year & Capacity Metadata */}
                  {isExisting && (
                    <div className="flex items-center justify-between text-[10px] pt-1 mt-0.5 border-t border-gray-100 dark:border-zinc-800/80 bg-gray-50/80 dark:bg-zinc-900/60 px-2 py-1 rounded-lg">
                      <span className="text-gray-500 dark:text-zinc-400 font-medium">
                        {feat.establishedYear ? `Est. ${feat.establishedYear} (${feat.yearsOperating || (new Date().getFullYear() - feat.establishedYear)} yrs)` : 'Operating'}
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {feat.capacity || 'Verified Active'}
                      </span>
                    </div>
                  )}

                  <div className="text-[9px] text-gray-400 dark:text-zinc-500 pt-0.5 text-right font-medium">
                    Click marker to lock profile ›
                  </div>
                </div>
              </Tooltip>

              <Popup className="custom-popup">
                <div className="p-2 text-xs space-y-2 font-sans min-w-[240px] max-w-[280px]">
                  {/* Top verified badge if existing */}
                  {isExisting && (
                    <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-zinc-800 text-[10px]">
                      <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Actual Existing Business
                      </span>
                      <span className="text-gray-500 dark:text-zinc-400 font-medium">
                        {feat.status || 'Active & Operating'}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-gray-900 dark:text-white leading-tight text-xs">{feat.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase shrink-0 flex items-center gap-1 ${
                      feat.category === 'competitor' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                      feat.category === 'similar' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                      feat.category === 'poi' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                    }`}>
                      {feat.category === 'competitor' && <Building2 size={10} strokeWidth={2.4} />}
                      {feat.category === 'similar' && <Store size={10} strokeWidth={2.4} />}
                      {feat.category === 'poi' && <Landmark size={10} strokeWidth={2.4} />}
                      {feat.category === 'market' && <ShoppingCart size={10} strokeWidth={2.4} />}
                      {feat.category === 'competitor' ? 'Competitor' :
                       feat.category === 'similar' ? 'Similar Biz' :
                       feat.category === 'poi' ? 'Key POI' : 'Target Market'}
                    </span>
                  </div>

                  {feat.details && (
                    <p className="text-[11px] text-gray-600 dark:text-zinc-300 leading-snug">{feat.details}</p>
                  )}

                  {/* Existing Business Metadata */}
                  {isExisting && (
                    <div className="grid grid-cols-2 gap-1.5 p-2 bg-gray-50 dark:bg-zinc-900/80 rounded-lg text-[10.5px]">
                      {feat.establishedYear && (
                        <div>
                          <span className="text-gray-400 text-[9.5px] block uppercase font-medium">Established</span>
                          <strong className="text-gray-800 dark:text-zinc-200">
                            {feat.establishedYear} ({feat.yearsOperating || (new Date().getFullYear() - feat.establishedYear)} yrs)
                          </strong>
                        </div>
                      )}
                      {feat.capacity && (
                        <div>
                          <span className="text-gray-400 text-[9.5px] block uppercase font-medium">Capacity</span>
                          <strong className="text-gray-800 dark:text-zinc-200">{feat.capacity}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-zinc-400 pt-1 border-t border-gray-100 dark:border-zinc-800">
                    <span>Distance: <strong className="text-gray-800 dark:text-zinc-200 font-semibold">{feat.distanceKm || '1.2'} km</strong></span>
                    <span className="font-mono text-[9px] text-gray-400">{feat.lat.toFixed(4)}, {feat.lng.toFixed(4)}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Evaluated Opportunity Candidate Location Nodes (Ordered Rank & Score) */}
        {visibleCandidates.map((cand, candIndex) => {
          const isSelected = selectedLocation?.id === cand.id;
          const rank = candIndex + 1;
          return (
            <Marker
              key={cand.id}
              position={[cand.lat, cand.lng]}
              icon={createCustomScoreIcon(cand.scoreResult.overallScore, isSelected, rank)}
              zIndexOffset={isSelected ? 1500 : 700 + (100 - rank * 10)}
              eventHandlers={{
                click: () => onSelectLocation(cand),
              }}
            >
              {/* Detailed Hover Tooltip (Reveals Rating & Opportunity Insights on Hover) */}
              <Tooltip
                direction="top"
                offset={[0, -42]}
                opacity={1}
                className="custom-candidate-tooltip"
              >
                <div className="p-2 text-xs font-sans min-w-[210px] space-y-1.5 pointer-events-none">
                  <div className="flex items-center justify-between gap-2 pb-1 border-b border-gray-100 dark:border-zinc-800">
                    <span className="text-[10px] font-black uppercase tracking-wide text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-300/40">
                      Rank #{rank} Opportunity
                    </span>
                    <span className="font-extrabold text-xs text-white bg-emerald-600 dark:bg-emerald-500 px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                      <span className="text-amber-300 text-[10px]">★</span>
                      <span>{cand.scoreResult.overallScore}</span>
                      <span className="text-[9px] opacity-80">/100</span>
                    </span>
                  </div>
                  <strong className="text-gray-900 dark:text-white font-bold block text-[11.5px] leading-tight">
                    {cand.name}
                  </strong>
                  <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-zinc-400 pt-0.5">
                    <span>{cand.areaName}</span>
                    <span className="font-semibold text-gray-700 dark:text-zinc-300">{cand.distanceKm} km away</span>
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 pt-1 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between">
                    <span>Est. Annual Profit:</span>
                    <span>{cand.estimatedAnnualProfit}</span>
                  </div>
                </div>
              </Tooltip>

              <Popup className="custom-popup">
                <div className="p-1.5 text-xs space-y-1 font-sans min-w-[220px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-gray-900">{cand.name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${cand.scoreResult.tier.badgeColor}`}>
                      ★ {cand.scoreResult.overallScore}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">{cand.areaName}, {cand.districtName}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold">Est. Profit: {cand.estimatedAnnualProfit}</p>
                  <button
                    onClick={() => {
                      onSelectLocation(cand);
                      if (onViewInsights) onViewInsights(cand);
                    }}
                    className="w-full mt-1.5 px-2.5 py-1.5 text-[11px] font-bold text-white bg-primary rounded-lg hover:bg-emerald-600 cursor-pointer transition-colors flex items-center justify-center gap-1 shadow-xs"
                  >
                    <span>View Feasibility & Insights</span>
                    <span>›</span>
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Bottom Quick-Action Pill for Selected Location */}
      {selectedLocation && visibleCandidates.some(c => c.id === selectedLocation.id) && onViewInsights && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] pointer-events-auto hidden sm:block animate-in fade-in slide-in-from-bottom-3 duration-200">
          <button
            type="button"
            onClick={() => onViewInsights(selectedLocation)}
            className="flex items-center gap-2.5 bg-gray-900/95 dark:bg-zinc-900/95 text-white backdrop-blur-md px-4 py-2 rounded-full border border-gray-700/80 dark:border-zinc-700 shadow-xl hover:bg-black transition-all hover:scale-105 active:scale-95 cursor-pointer text-xs font-bold group"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Feasibility Report for <strong className="text-emerald-400 font-extrabold">{selectedLocation.name}</strong></span>
            <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded text-[10.5px] font-bold border border-emerald-500/30">★ {selectedLocation.scoreResult.overallScore}</span>
            <span className="text-gray-400 group-hover:text-white transition-colors">›</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default GeoMapContainer;

