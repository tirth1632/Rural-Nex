import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents, Popup } from 'react-leaflet';
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
  Minimize2
} from 'lucide-react';
import { geoService, type CandidateLocation, type LayerFeature, type MapFeatureCategory } from '../../services/geoService';
import { GOOGLE_MAPS_TILE_URLS, GOOGLE_MAPS_SUBDOMAINS, GOOGLE_MAPS_ATTRIBUTION } from '../../config/maps';

// 1. Center Location Marker Icon (Green gradient teardrop pin with sleek badge and pointer)
// 1. Center Location Marker Icon (Green gradient teardrop pin with sleek badge and pointer)
const createYourLocationPinIcon = (label: string = 'Your Location') => {
  const html = `
    <div style="position: relative; width: 44px; height: 50px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; pointer-events: auto;">
      <!-- Subtle ground shadow -->
      <div style="position: absolute; bottom: 1px; left: 50%; transform: translateX(-50%); width: 22px; height: 8px; background: rgba(5, 150, 105, 0.35); border-radius: 50%; filter: blur(2px);"></div>
      
      <!-- Sleek Location Label Badge with Pointer Caret -->
      <div style="
        position: absolute;
        bottom: 46px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #047857 0%, #065f46 100%);
        color: #ffffff;
        font-size: 11px;
        font-weight: 700;
        padding: 3px 9px;
        border-radius: 9999px;
        white-space: nowrap;
        box-shadow: 0 4px 14px rgba(4, 120, 87, 0.45), 0 2px 4px rgba(0,0,0,0.25);
        border: 2px solid #ffffff;
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        pointer-events: none;
        letter-spacing: 0.25px;
        display: flex;
        align-items: center;
        gap: 5px;
      ">
        <span style="width: 6px; height: 6px; border-radius: 50%; background: #34d399; box-shadow: 0 0 6px #34d399;"></span>
        ${label}
        <div style="position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid #065f46;"></div>
      </div>

      <!-- Teardrop GPS Pin -->
      <svg viewBox="0 0 24 24" width="36" height="44" style="filter: drop-shadow(0 4px 10px rgba(0,0,0,0.4));">
        <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8z" fill="#047857" stroke="#ffffff" stroke-width="2"/>
        <circle cx="12" cy="10" r="3.8" fill="#ffffff"/>
        <circle cx="12" cy="10" r="2" fill="#047857"/>
      </svg>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'your-location-pin',
    iconSize: [44, 50],
    iconAnchor: [22, 46],
    popupAnchor: [0, -46],
  });
};

// Helper function to return unique SVG icons for each business, shop, factory, and POI sub-type
const getIconSvg = (iconKey: string): string => {
  switch (iconKey) {
    case 'dairy':
      // Milk Bottle & Droplet
      return `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 2h8v3H8zM7 5h10l1 4v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9z"/>
          <path d="M12 11c-1.5 2-2 3-2 4a2 2 0 0 0 4 0c0-1-.5-2-2-4z" fill="#FFFFFF"/>
        </svg>
      `;
    case 'crop':
      // Sprout / Leaf
      return `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22V10"/>
          <path d="M12 10C12 5.5 16 3 20 3c0 4.5-2.5 8.5-8 8.5"/>
          <path d="M12 14C12 10.5 8 8 4 8c0 3.5 2.5 6.5 8 6.5"/>
        </svg>
      `;
    case 'poultry':
      // Egg / Chick
      return `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22a8 8 0 0 0 8-8c0-5-3.5-12-8-12S4 9 4 14a8 8 0 0 0 8 8z"/>
          <circle cx="12" cy="13" r="2.5" fill="#FFFFFF"/>
        </svg>
      `;
    case 'fish':
      // Fish
      return `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6.5 12c.5-2.5 3-5.5 8-5.5 3 0 5 1.5 6.5 3.5-1.5 2-3.5 3.5-6.5 3.5-5 0-7.5-3-8-1.5z"/>
          <path d="M2 9.5L6.5 12 2 14.5v-5z"/>
          <circle cx="15.5" cy="10.5" r="1" fill="#FFFFFF"/>
        </svg>
      `;
    case 'livestock':
      // Livestock / Animal
      return `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 3l2 4M8 3L6 7M4 11h16v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-5z"/>
          <circle cx="9" cy="14" r="1" fill="#FFFFFF"/>
          <circle cx="15" cy="14" r="1" fill="#FFFFFF"/>
        </svg>
      `;
    case 'mill':
      // Flour Sack / Milling
      return `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 3h12l1 5-2 2v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V10L5 8z"/>
          <path d="M9 14h6M12 11v6"/>
        </svg>
      `;
    case 'factory':
      // Factory Building & Chimneys
      return `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 20h20"/>
          <path d="M2 20V10l5 3V10l5 3V4h8v16"/>
          <path d="M16 8h2M16 12h2M16 16h2"/>
        </svg>
      `;
    case 'shop':
      // Shopping Bag / Retail Store
      return `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      `;
    case 'truck':
      // Cargo Truck
      return `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="1" y="3" width="14" height="13" rx="1"/>
          <polygon points="15 8 20 8 23 12 23 16 15 16 15 8"/>
          <circle cx="5.5" cy="18.5" r="2" fill="#FFFFFF"/>
          <circle cx="18.5" cy="18.5" r="2" fill="#FFFFFF"/>
        </svg>
      `;
    case 'hotel':
      // Utensils & Plate / Dining
      return `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 2v20M18 8h4M2 2v20M2 12h8V2"/>
          <path d="M6 12v10"/>
        </svg>
      `;
    case 'solar':
      // Solar Panel / Wrench Tool
      return `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      `;
    case 'craft':
      // Scissors & Handloom
      return `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="6" cy="6" r="3"/>
          <circle cx="6" cy="18" r="3"/>
          <line x1="20" y1="4" x2="8.12" y2="15.88"/>
          <line x1="14.47" y1="14.47" x2="20" y2="20"/>
          <line x1="8.12" y1="8.12" x2="12" y2="12"/>
        </svg>
      `;
    case 'vet':
      // Medical Cross / Clinic
      return `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v20M2 12h20"/>
          <circle cx="12" cy="12" r="9" stroke-width="2"/>
        </svg>
      `;
    case 'school':
      // Graduation Cap
      return `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      `;
    case 'hospital':
      // Heartpulse
      return `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      `;
    case 'transport':
      // Bus
      return `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="16" height="16" x="4" y="3" rx="2"/>
          <path d="M4 11h16"/>
          <circle cx="8" cy="15" r="1" fill="#FFFFFF"/>
          <circle cx="16" cy="15" r="1" fill="#FFFFFF"/>
          <path d="M6 19v2"/>
          <path d="M18 19v2"/>
        </svg>
      `;
    case 'bank':
      // Bank Pillars
      return `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="21" x2="21" y2="21"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
          <polyline points="5 6 12 3 19 6"/>
          <line x1="6" y1="10" x2="6" y2="21"/>
          <line x1="10" y1="10" x2="10" y2="21"/>
          <line x1="14" y1="10" x2="14" y2="21"/>
          <line x1="18" y1="10" x2="18" y2="21"/>
        </svg>
      `;
    default:
      // Shopping Cart (Default Market / General Store)
      return `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="8" cy="21" r="1" fill="#FFFFFF"/>
          <circle cx="19" cy="21" r="1" fill="#FFFFFF"/>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
        </svg>
      `;
  }
};

const determineIconKey = (type: string, subTypeIcon?: string, featureName: string = ''): string => {
  if (subTypeIcon) return subTypeIcon;
  if (type === 'school') return 'school';
  if (type === 'hospital') return 'hospital';
  if (type === 'transport') return 'transport';
  if (type === 'bank') return 'bank';
  if (type === 'market') return 'market';

  const nameLower = (featureName || '').toLowerCase();
  if (nameLower.includes('milk') || nameLower.includes('dairy') || nameLower.includes('ghee') || nameLower.includes('chilling')) return 'dairy';
  if (nameLower.includes('poultry') || nameLower.includes('egg') || nameLower.includes('hatchery') || nameLower.includes('broiler')) return 'poultry';
  if (nameLower.includes('fish') || nameLower.includes('aqua') || nameLower.includes('prawn')) return 'fish';
  if (nameLower.includes('mill') || nameLower.includes('flour') || nameLower.includes('chakki') || nameLower.includes('spice')) return 'mill';
  if (nameLower.includes('factory') || nameLower.includes('plant') || nameLower.includes('packaging') || nameLower.includes('tile')) return 'factory';
  if (nameLower.includes('truck') || nameLower.includes('freight') || nameLower.includes('logistics') || nameLower.includes('van')) return 'truck';
  if (nameLower.includes('restaurant') || nameLower.includes('dhaba') || nameLower.includes('hotel') || nameLower.includes('resort') || nameLower.includes('homestay')) return 'hotel';
  if (nameLower.includes('solar') || nameLower.includes('repair') || nameLower.includes('workshop') || nameLower.includes('tractor')) return 'solar';
  if (nameLower.includes('craft') || nameLower.includes('loom') || nameLower.includes('pottery') || nameLower.includes('textile') || nameLower.includes('weaving')) return 'craft';
  if (nameLower.includes('crop') || nameLower.includes('seed') || nameLower.includes('fertilizer') || nameLower.includes('farm')) return 'crop';
  if (nameLower.includes('vet') || nameLower.includes('cattle')) return 'vet';

  return 'shop';
};

// 2. Map Feature Circular Marker Icon (Competitors, Similar Businesses, Key POIs, Target Market)
const createFeatureMarkerIcon = (category: MapFeatureCategory, type: string, subTypeIcon?: string, featureName: string = '') => {
  let bgColor = '#E11D48'; // Red for competitor
  let shadowColor = 'rgba(225, 29, 72, 0.45)';

  if (category === 'competitor') {
    bgColor = '#E11D48'; // Crimson Red
    shadowColor = 'rgba(225, 29, 72, 0.45)';
  } else if (category === 'similar') {
    bgColor = '#2563EB'; // Royal Blue
    shadowColor = 'rgba(37, 99, 235, 0.45)';
  } else if (category === 'poi') {
    bgColor = '#F59E0B'; // Amber Orange
    shadowColor = 'rgba(245, 158, 11, 0.45)';
  } else if (category === 'market') {
    bgColor = '#0D9488'; // Teal Green
    shadowColor = 'rgba(13, 148, 136, 0.45)';
  }

  const iconKey = determineIconKey(type, subTypeIcon, featureName);
  const svgContent = getIconSvg(iconKey);

  const html = `
    <div style="
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: ${bgColor};
      border: 2px solid #FFFFFF;
      box-shadow: 0 3px 8px ${shadowColor}, 0 2px 4px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    ">
      ${svgContent}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'category-marker-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

// 3. Custom SVG HTML Markers for Candidate Evaluated Locations
const createCustomScoreIcon = (score: number, isSelected: boolean) => {
  let bgColor = '#10B981'; // Emerald
  let borderColor = '#047857';

  if (score >= 90) {
    bgColor = '#059669';
    borderColor = '#022c22';
  } else if (score >= 75) {
    bgColor = '#10B981';
    borderColor = '#047857';
  } else if (score >= 60) {
    bgColor = '#F59E0B';
    borderColor = '#B45309';
  } else {
    bgColor = '#EF4444';
    borderColor = '#991B1B';
  }

  const selectedRing = isSelected ? 'box-shadow: 0 0 0 4px #10B981, 0 8px 16px rgba(0,0,0,0.35); z-index: 999;' : 'box-shadow: 0 3px 8px rgba(0,0,0,0.25);';

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
      <div style="background-color: ${bgColor}; color: white; padding: 3px 7px; border-radius: 12px; font-weight: 800; font-size: 11px; font-family: 'Plus Jakarta Sans', sans-serif; border: 2px solid ${borderColor}; ${selectedRing} display: flex; align-items: center; gap: 3px; white-space: nowrap;">
        <span>★</span>
        <span>${score}</span>
      </div>
      <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${bgColor}; margin-top: -1px;"></div>
    </div>
  `;

  return L.divIcon({ html, className: 'custom-score-marker', iconSize: [46, 32], iconAnchor: [23, 32], popupAnchor: [0, -32] });
};

// Map Controller for Smooth flyTo Navigation and InvalidateSize handling
const MapController: React.FC<{
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  recenterTrigger: number;
  isFullscreen: boolean;
}> = ({ centerLat, centerLng, radiusKm, recenterTrigger, isFullscreen }) => {
  const map = useMap();

  // Silky-smooth cinematic flyTo navigation
  useEffect(() => {
    const targetZoom = radiusKm > 80 ? 9 : radiusKm > 40 ? 10 : radiusKm > 15 ? 11 : 12;
    map.flyTo([centerLat, centerLng], targetZoom, {
      duration: 1.25,
      easeLinearity: 0.25,
    });
  }, [centerLat, centerLng, radiusKm, recenterTrigger, map]);

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
    <div className="absolute right-4 bottom-16 sm:bottom-18 z-[1000] flex flex-col bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-md border border-gray-200/90 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden pointer-events-auto transition-all">
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

// Map click listener for fine-tuning center coordinates
const MapClickListener: React.FC<{ onMapClick: (lat: number, lng: number) => void }> = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

interface GeoMapContainerProps {
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  candidates: CandidateLocation[];
  selectedLocation: CandidateLocation | null;
  onSelectLocation: (location: CandidateLocation) => void;
  onOpen3DView?: () => void;
  isSearching: boolean;
  onResetFilters: () => void;
  districtName?: string;
  businessCategory?: string;
  subType?: string;
}

export const GeoMapContainer: React.FC<GeoMapContainerProps> = ({
  centerLat,
  centerLng,
  radiusKm,
  candidates,
  selectedLocation,
  onSelectLocation,
  isSearching,
  onResetFilters,
  districtName = 'Anand',
  businessCategory = 'Dairy Farming',
  subType,
}) => {
  const [mapTileMode, setMapTileMode] = useState<'standard' | 'satellite' | 'terrain'>('standard');
  const [isNightMode, setIsNightMode] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark') || document.documentElement.getAttribute('data-theme') === 'dark';
  });
  const [isLocationOn, setIsLocationOn] = useState<boolean>(true);
  const [userPinPos, setUserPinPos] = useState<[number, number]>([centerLat, centerLng]);
  const [isLayersOpen, setIsLayersOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [recenterTrigger, setRecenterTrigger] = useState<number>(0);

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

  // Sync userPinPos with props
  useEffect(() => {
    setUserPinPos([centerLat, centerLng]);
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
      .getLayersData(centerLat, centerLng, radiusKm, districtName, businessCategory, subType)
      .then(setLayerFeatures);
  }, [centerLat, centerLng, radiusKm, districtName, businessCategory, subType]);

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
  };

  return (
    <div className={`relative w-full h-full flex flex-col overflow-hidden transition-all duration-300 ${
      isFullscreen ? 'fixed inset-0 z-[9999] w-screen h-screen bg-black' : 'min-h-[500px] bg-white dark:bg-black z-0 isolate'
    } ${isNightMode && mapTileMode !== 'satellite' ? 'leaflet-night-mode' : ''}`}>
      {/* Top Left: Map Style Selector Pills (Positioned cleanly with no overlapping zoom box) */}
      <div className="absolute top-4 left-4 z-[1000] flex items-center gap-1 bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-md border border-gray-200/90 dark:border-zinc-800 rounded-xl p-1 shadow-md pointer-events-auto">
        <button
          onClick={() => { setMapTileMode('standard'); setIsNightMode(false); }}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            mapTileMode === 'standard' && !isNightMode ? 'bg-primary text-white shadow-xs' : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          Map
        </button>
        <button
          onClick={() => setMapTileMode('satellite')}
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

      {/* Top Right: Actions & Tools (Recenter, Layers Popover, Day/Night, Fullscreen) */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2 pointer-events-auto">
        {/* Recenter / GPS Target Button (Triggers Silky flyTo to Center Location) */}
        <button
          onClick={() => {
            setUserPinPos([centerLat, centerLng]);
            setRecenterTrigger((prev) => prev + 1);
          }}
          title="Recenter Map to Search Location"
          aria-label="Recenter map"
          className="p-2 rounded-xl bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-md border border-gray-200/90 dark:border-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center group"
        >
          <Navigation size={16} className="text-primary group-hover:rotate-45 transition-transform duration-300" />
        </button>

        {/* Map Layers Dropdown Button */}
        <div 
          className="relative"
          onMouseEnter={() => setIsLayersOpen(true)}
          onMouseLeave={() => setIsLayersOpen(false)}
        >
          <button
            onClick={() => setIsLayersOpen(!isLayersOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl backdrop-blur-md border transition-all cursor-pointer shadow-md active:scale-95 ${
              isLayersOpen 
                ? 'bg-primary text-white border-primary' 
                : 'bg-white/95 dark:bg-[#0a0a0c]/95 text-gray-700 dark:text-zinc-200 border-gray-200/90 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Layers size={14} className={isLayersOpen ? 'text-white' : 'text-primary'} />
            <span>Layers</span>
          </button>

          {/* Dropdown Menu Popover */}
          {isLayersOpen && (
            <div className="absolute right-0 top-full pt-1.5 z-[1001]">
              <div className="bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-zinc-800 p-3 rounded-2xl shadow-2xl w-56 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-2 mb-2">
                  <span className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={14} className="text-primary" /> Map Overlays
                  </span>
                </div>
                <div className="space-y-2 text-xs font-medium text-gray-700 dark:text-zinc-200">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={visibleCategories.competitor}
                      onChange={() => toggleCategory('competitor')}
                      className="w-4 h-4 accent-[#E11D48] rounded cursor-pointer"
                    />
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48]"></span>
                      <span>Competitors ({counts.competitors})</span>
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={visibleCategories.similar}
                      onChange={() => toggleCategory('similar')}
                      className="w-4 h-4 accent-[#2563EB] rounded cursor-pointer"
                    />
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></span>
                      <span>Similar Businesses ({counts.similar})</span>
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={visibleCategories.poi}
                      onChange={() => toggleCategory('poi')}
                      className="w-4 h-4 accent-[#F59E0B] rounded cursor-pointer"
                    />
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
                      <span>Key POIs ({counts.pois})</span>
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={visibleCategories.market}
                      onChange={() => toggleCategory('market')}
                      className="w-4 h-4 accent-[#0D9488] rounded cursor-pointer"
                    />
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488]"></span>
                      <span>Target Market ({counts.markets})</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Day / Night Mode Toggle Icon */}
        <button
          onClick={() => setIsNightMode(!isNightMode)}
          title={isNightMode ? 'Night Mode Active (Click for Day Mode)' : 'Day Mode Active (Click for Night Mode)'}
          aria-label="Toggle Night/Day Mode"
          className={`p-2 rounded-xl backdrop-blur-md transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-md border ${
            isNightMode 
              ? 'bg-zinc-900 text-indigo-300 border-zinc-700' 
              : 'bg-white/95 text-amber-600 border-gray-200/90'
          }`}
        >
          {isNightMode ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Fullscreen / Maximize Map Toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Expand Map Fullscreen'}
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          className={`p-2 rounded-xl backdrop-blur-md transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-md border ${
            isFullscreen
              ? 'bg-primary text-white border-primary shadow-emerald-500/30'
              : 'bg-white/95 dark:bg-[#0a0a0c]/95 text-gray-700 dark:text-zinc-200 border-gray-200/90 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* Loading Overlay */}
      {isSearching && (
        <div className="absolute inset-0 z-[1001] bg-white/70 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-white dark:bg-[#0a0a0c] p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Locating verified markers & telemetry...</p>
            <p className="text-xs text-gray-500 dark:text-zinc-400">Positioning competitors, similar businesses & POIs</p>
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
        className="w-full h-full min-h-full"
        style={{ width: '100%', height: '100%', minHeight: '100%', zIndex: 1, backgroundColor: isNightMode ? '#0a0a0c' : '#f3f4f6' }}
      >
        <TileLayer url={activeTileUrl} attribution={activeAttribution} subdomains={GOOGLE_MAPS_SUBDOMAINS} />

        {/* Cinematic Map Smooth Controller */}
        <MapController
          centerLat={centerLat}
          centerLng={centerLng}
          radiusKm={radiusKm}
          recenterTrigger={recenterTrigger}
          isFullscreen={isFullscreen}
        />
        <MapClickListener onMapClick={(lat, lng) => setUserPinPos([lat, lng])} />

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

        {/* User Current / Search Center Pin Marker */}
        {isLocationOn && (
          <>
            {/* Center Pulsing Aura Ring */}
            <Circle
              center={userPinPos}
              radius={80}
              pathOptions={{
                color: '#059669',
                fillColor: '#10B981',
                fillOpacity: 0.25,
                weight: 1.5,
              }}
            />
            <Marker
              position={userPinPos}
              icon={createYourLocationPinIcon('Your Location')}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const latLng = e.target.getLatLng();
                  setUserPinPos([latLng.lat, latLng.lng]);
                },
              }}
            >
              <Popup>
                <div className="p-1 text-xs font-sans">
                  <strong className="text-gray-900 font-bold block">Your Location (Center)</strong>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">GPS Search Center Active</p>
                  <span className="text-gray-500 font-mono text-[10px] block mt-1">
                    {userPinPos[0].toFixed(5)}, {userPinPos[1].toFixed(5)}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1 italic">Tip: Drag pin anytime to adjust search center</p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Map Categorized Feature Markers (Competitors, Similar Businesses, Key POIs, Target Market) */}
        {layerFeatures.map((feat) => {
          if (!visibleCategories[feat.category]) return null;
          return (
            <Marker
              key={feat.id}
              position={[feat.lat, feat.lng]}
              icon={createFeatureMarkerIcon(feat.category, feat.type, feat.subTypeIcon, feat.name)}
            >
              <Popup className="custom-popup">
                <div className="p-1.5 text-xs space-y-1.5 font-sans min-w-[210px]">
                  <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-zinc-800 pb-1.5">
                    <span className="font-bold text-gray-900 leading-tight">{feat.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                      feat.category === 'competitor' ? 'bg-red-100 text-red-700' :
                      feat.category === 'similar' ? 'bg-blue-100 text-blue-700' :
                      feat.category === 'poi' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {feat.category === 'competitor' ? 'Competitor' :
                       feat.category === 'similar' ? 'Similar Biz' :
                       feat.category === 'poi' ? 'Key POI' : 'Target Market'}
                    </span>
                  </div>
                  {feat.details && (
                    <p className="text-[11px] text-gray-600 leading-snug">{feat.details}</p>
                  )}
                  <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-50">
                    <span>Distance: <strong className="text-gray-800 font-semibold">{feat.distanceKm || '1.2'} km</strong></span>
                    <span className="font-mono text-[9px] text-gray-400">{feat.lat.toFixed(4)}, {feat.lng.toFixed(4)}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Evaluated Opportunity Candidate Location Nodes */}
        {candidates.map((cand) => {
          const isSelected = selectedLocation?.id === cand.id;
          return (
            <Marker
              key={cand.id}
              position={[cand.lat, cand.lng]}
              icon={createCustomScoreIcon(cand.scoreResult.overallScore, isSelected)}
              eventHandlers={{
                click: () => onSelectLocation(cand),
              }}
            >
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
                    onClick={() => onSelectLocation(cand)}
                    className="w-full mt-1.5 px-2.5 py-1 text-[11px] font-bold text-white bg-primary rounded-lg hover:bg-emerald-600 cursor-pointer transition-colors"
                  >
                    View Location Insights Below ↓
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Footer Legend (Crisp Single-Line Pill Bar - Fits Perfectly Without Awkward Wrapping) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] max-w-[calc(100%-2rem)] bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-gray-200/90 dark:border-zinc-800 shadow-xl flex items-center justify-center gap-2.5 sm:gap-4 whitespace-nowrap overflow-x-auto no-scrollbar pointer-events-auto text-[11.5px] font-bold text-gray-700 dark:text-zinc-200">
        {/* Your Location */}
        <button
          type="button"
          onClick={() => setIsLocationOn(!isLocationOn)}
          className={`flex items-center gap-1.5 cursor-pointer transition-all px-2 py-1 rounded-lg hover:bg-gray-100/80 dark:hover:bg-zinc-800/80 ${!isLocationOn ? 'opacity-40 line-through' : ''}`}
          title="Click to toggle Your Location pin"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-2 ring-emerald-300 dark:ring-emerald-900 shrink-0"></span>
          <span>Your Location</span>
        </button>

        {/* Competitors (Red) */}
        <button
          type="button"
          onClick={() => toggleCategory('competitor')}
          className={`flex items-center gap-1.5 cursor-pointer transition-all px-2 py-1 rounded-lg hover:bg-gray-100/80 dark:hover:bg-zinc-800/80 ${!visibleCategories.competitor ? 'opacity-40 line-through' : ''}`}
          title="Click to toggle Competitor markers"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] ring-2 ring-rose-300 dark:ring-rose-900 shrink-0"></span>
          <span>Competitors</span>
        </button>

        {/* Similar Businesses (Blue) */}
        <button
          type="button"
          onClick={() => toggleCategory('similar')}
          className={`flex items-center gap-1.5 cursor-pointer transition-all px-2 py-1 rounded-lg hover:bg-gray-100/80 dark:hover:bg-zinc-800/80 ${!visibleCategories.similar ? 'opacity-40 line-through' : ''}`}
          title="Click to toggle Similar Business markers"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] ring-2 ring-blue-300 dark:ring-blue-900 shrink-0"></span>
          <span>Similar Businesses</span>
        </button>

        {/* Key POIs (Orange) */}
        <button
          type="button"
          onClick={() => toggleCategory('poi')}
          className={`flex items-center gap-1.5 cursor-pointer transition-all px-2 py-1 rounded-lg hover:bg-gray-100/80 dark:hover:bg-zinc-800/80 ${!visibleCategories.poi ? 'opacity-40 line-through' : ''}`}
          title="Click to toggle Key POI markers"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] ring-2 ring-amber-300 dark:ring-amber-900 shrink-0"></span>
          <span>Key POIs</span>
        </button>

        {/* Target Market (Green/Teal) */}
        <button
          type="button"
          onClick={() => toggleCategory('market')}
          className={`flex items-center gap-1.5 cursor-pointer transition-all px-2 py-1 rounded-lg hover:bg-gray-100/80 dark:hover:bg-zinc-800/80 ${!visibleCategories.market ? 'opacity-40 line-through' : ''}`}
          title="Click to toggle Target Market markers"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488] ring-2 ring-teal-300 dark:ring-teal-900 shrink-0"></span>
          <span>Target Market</span>
        </button>
      </div>
    </div>
  );
};

export default GeoMapContainer;

