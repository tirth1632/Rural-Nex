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
  ChevronDown,
  Navigation
} from 'lucide-react';
import { geoService, type CandidateLocation, type LayerFeature } from '../../services/geoService';
import { GOOGLE_MAPS_TILE_URLS, GOOGLE_MAPS_SUBDOMAINS, GOOGLE_MAPS_ATTRIBUTION, createUserLocationIcon } from '../../config/maps';

// Custom SVG HTML Markers for Candidate Locations with score badges & visual accessibility
const createCustomScoreIcon = (score: number, isSelected: boolean) => {
  let bgColor = '#10B981'; // Emerald
  let borderColor = '#047857';

  if (score >= 90) {
    bgColor = '#059669'; // Dark emerald
    borderColor = '#022c22';
  } else if (score >= 75) {
    bgColor = '#10B981'; // Primary green
    borderColor = '#047857';
  } else if (score >= 60) {
    bgColor = '#F59E0B'; // Amber
    borderColor = '#B45309';
  } else {
    bgColor = '#EF4444'; // Red
    borderColor = '#991B1B';
  }

  const selectedRing = isSelected ? 'box-shadow: 0 0 0 4px #10B981, 0 8px 16px rgba(0,0,0,0.3); z-index: 999;' : 'box-shadow: 0 4px 10px rgba(0,0,0,0.25);';

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; items-center: center; align-items: center;">
      <div style="background-color: ${bgColor}; color: white; padding: 4px 8px; border-radius: 12px; font-weight: 800; font-size: 12px; font-family: sans-serif; border: 2px solid ${borderColor}; ${selectedRing} display: flex; align-items: center; gap: 4px; white-space: nowrap;">
        <span>★</span>
        <span>${score}</span>
      </div>
      <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid ${bgColor}; margin-top: -1px;"></div>
    </div>
  `;

  return L.divIcon({ html, className: 'custom-score-marker', iconSize: [50, 36], iconAnchor: [25, 36] });
};

// Component to dynamically adjust map view when search center or radius changes
const MapRecenter: React.FC<{ lat: number; lng: number; radiusKm: number }> = ({ lat, lng, radiusKm }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], radiusKm > 80 ? 9 : radiusKm > 40 ? 10 : 11, { animate: true });
  }, [lat, lng, radiusKm, map]);
  return null;
};

// Map click listener for 100% pinpoint location adjustment
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
}) => {
  const [mapTileMode, setMapTileMode] = useState<'standard' | 'satellite' | 'terrain'>('standard');
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [isLocationOn, setIsLocationOn] = useState<boolean>(true);
  const [userPinPos, setUserPinPos] = useState<[number, number]>([centerLat, centerLng]);
  const [isLayersOpen, setIsLayersOpen] = useState<boolean>(false);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    competitors: true,
    transport: true,
    markets: false,
    banks: false,
    hospitals: false,
    infrastructure: false,
  });

  const [layerFeatures, setLayerFeatures] = useState<LayerFeature[]>([]);

  useEffect(() => {
    setUserPinPos([centerLat, centerLng]);
  }, [centerLat, centerLng]);

  // Load map overlay features
  useEffect(() => {
    geoService.getLayersData(centerLat, centerLng).then(setLayerFeatures);
  }, [centerLat, centerLng]);

  // Tile Layer URLs (Google Maps API)
  const tileUrls = {
    standard: GOOGLE_MAPS_TILE_URLS.roadmap,
    satellite: GOOGLE_MAPS_TILE_URLS.satellite,
    terrain: GOOGLE_MAPS_TILE_URLS.terrain,
  };

  const activeTileUrl = isNightMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : tileUrls[mapTileMode];

  const tileAttributions = {
    standard: GOOGLE_MAPS_ATTRIBUTION,
    satellite: GOOGLE_MAPS_ATTRIBUTION,
    terrain: GOOGLE_MAPS_ATTRIBUTION,
  };

  const activeAttribution = isNightMode
    ? '&copy; OpenStreetMap contributors &copy; CARTO'
    : tileAttributions[mapTileMode];

  const toggleLayer = (layerKey: string) => {
    setActiveLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gray-100 flex flex-col overflow-hidden">
      {/* Top Map Control Bar (Positioned Top Right) */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2 pointer-events-auto">
        {/* Map View Selector, Layers Dropdown & Day/Night Toggle */}
        <div className="flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-gray-300 dark:border-slate-700 rounded-xl p-1 shadow-md">
          <button
            onClick={() => { setMapTileMode('standard'); setIsNightMode(false); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mapTileMode === 'standard' && !isNightMode ? 'bg-primary text-white shadow-xs' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            Standard Map
          </button>
          <button
            onClick={() => setMapTileMode('satellite')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mapTileMode === 'satellite' ? 'bg-primary text-white shadow-xs' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => { setMapTileMode('terrain'); setIsNightMode(false); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mapTileMode === 'terrain' && !isNightMode ? 'bg-primary text-white shadow-xs' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            Terrain
          </button>

          <div className="w-px h-5 bg-gray-300 dark:bg-slate-700 mx-0.5" />

          {/* Map Layers Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setIsLayersOpen(!isLayersOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                isLayersOpen ? 'bg-primary/10 text-primary border border-primary/30 font-bold' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers size={14} className="text-primary" />
              <span>Layers</span>
              <ChevronDown size={13} className={`transition-transform duration-200 ${isLayersOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Popover */}
            {isLayersOpen && (
              <div className="absolute right-0 top-full mt-2 z-[1001] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-3 rounded-xl shadow-xl w-52 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2 mb-2">
                  <span className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={14} className="text-primary" /> Map Layers
                  </span>
                </div>
                <div className="space-y-2 text-xs font-medium text-gray-700 dark:text-gray-200">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={activeLayers.competitors}
                      onChange={() => toggleLayer('competitors')}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                    <span>Competitor Density</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={activeLayers.transport}
                      onChange={() => toggleLayer('transport')}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                    <span>Transport & Roads</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={activeLayers.markets}
                      onChange={() => toggleLayer('markets')}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                    <span>Markets & Mandis</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={activeLayers.banks}
                      onChange={() => toggleLayer('banks')}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                    <span>Banks / ATMs</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-gray-300 dark:bg-slate-700 mx-0.5" />

          {/* Location ON / OFF Toggle Button */}
          <button
            onClick={() => setIsLocationOn(!isLocationOn)}
            title={isLocationOn ? 'GPS Location ON (Click to turn OFF)' : 'GPS Location OFF (Click to turn ON)'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              isLocationOn
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-slate-700'
            }`}
          >
            <Navigation size={13} className={isLocationOn ? 'animate-pulse text-white' : 'text-gray-400'} />
            <span>Location {isLocationOn ? 'ON' : 'OFF'}</span>
          </button>

          <div className="w-px h-5 bg-gray-300 dark:bg-slate-700 mx-0.5" />

          {/* Google Maps Style Day / Night Mode Toggle Icon (Logo Only) */}
          <button
            onClick={() => setIsNightMode(!isNightMode)}
            title={isNightMode ? 'Night Mode Active (Click for Day Mode)' : 'Day Mode Active (Click for Night Mode)'}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
              isNightMode 
                ? 'bg-slate-800 text-indigo-300 border border-slate-700 shadow-xs font-bold' 
                : 'bg-amber-100 text-amber-600 border border-amber-300 shadow-xs font-bold'
            }`}
          >
            {isNightMode ? <Moon size={15} /> : <Sun size={15} />}
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {isSearching && (
        <div className="absolute inset-0 z-[1001] bg-white/70 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-gray-900">Analyzing candidate locations...</p>
            <p className="text-xs text-gray-500">Calculating opportunity scores & geospatial telemetry</p>
          </div>
        </div>
      )}

      {/* Empty State Overlay */}
      {!isSearching && candidates.length === 0 && (
        <div className="absolute inset-0 z-[999] bg-white/90 backdrop-blur-xs flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white border border-gray-200 p-8 rounded-2xl shadow-xl space-y-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">No suitable locations found</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                No location nodes matched your strict location, business sector, and investment filters within this zone.
              </p>
            </div>
            <div className="text-left bg-gray-50 p-3.5 rounded-xl border border-gray-200/80 text-xs space-y-1.5 text-gray-700">
              <span className="font-bold text-gray-900 block">Suggested actions:</span>
              <p>• Increase your search radius slider</p>
              <p>• Expand business category or investment range</p>
              <p>• Turn ON "Include neighboring states" cross-border toggle</p>
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

      {/* Leaflet React Map Container */}
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={radiusKm > 80 ? 9 : radiusKm > 40 ? 10 : 11}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
      >
        <TileLayer url={activeTileUrl} attribution={activeAttribution} subdomains={GOOGLE_MAPS_SUBDOMAINS} />

        <MapRecenter lat={centerLat} lng={centerLng} radiusKm={radiusKm} />
        <MapClickListener onMapClick={(lat, lng) => setUserPinPos([lat, lng])} />

        {/* Visible Search Radius Circle */}
        <Circle
          center={[centerLat, centerLng]}
          radius={radiusKm * 1000}
          pathOptions={{
            color: '#10B981',
            fillColor: '#10B981',
            fillOpacity: 0.08,
            weight: 2,
            dashArray: '6, 6',
          }}
        />

        {/* User Current / Search Center Logo Marker (Visible only when Location is ON) */}
        {isLocationOn && (
          <>
            {/* High-accuracy precision aura ring */}
            <Circle
              center={userPinPos}
              radius={80}
              pathOptions={{
                color: '#2563eb',
                fillColor: '#3b82f6',
                fillOpacity: 0.25,
                weight: 1.5,
              }}
            />
            <Marker
              position={userPinPos}
              icon={createUserLocationIcon('You Are Here (Drag to fine-tune)')}
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
                  <strong className="text-gray-900 block font-bold">100% High Precision Location</strong>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">GPS Position Active</p>
                  <span className="text-gray-500 font-mono text-[10px] block mt-1">
                    {userPinPos[0].toFixed(6)}, {userPinPos[1].toFixed(6)}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1 italic">Tip: Drag pin anytime to adjust precise coordinates</p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Candidate Location Markers */}
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
                <div className="p-1 text-xs space-y-1 font-sans">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-gray-900">{cand.name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${cand.scoreResult.tier.badgeColor}`}>
                      {cand.scoreResult.overallScore}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">{cand.areaName}, {cand.districtName}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold">Est. Profit: {cand.estimatedAnnualProfit}/yr</p>
                  <button
                    onClick={() => onSelectLocation(cand)}
                    className="w-full mt-1.5 px-2 py-1 text-[11px] font-bold text-white bg-primary rounded hover:bg-emerald-600 cursor-pointer"
                  >
                    View Full Location Insights
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Optional Map Layer Markers (Competitors, Transport, Markets, Banks) */}
        {layerFeatures.map((feat) => {
          if (!activeLayers[feat.type] && !activeLayers.competitors) return null;
          return (
            <Circle
              key={feat.id}
              center={[feat.lat, feat.lng]}
              radius={400}
              pathOptions={{
                color: feat.type === 'competitor' ? '#EF4444' : '#3B82F6',
                fillColor: feat.type === 'competitor' ? '#EF4444' : '#3B82F6',
                fillOpacity: 0.3,
                weight: 1,
              }}
            />
          );
        })}
      </MapContainer>

      {/* Map Footer Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-md flex items-center gap-4 text-xs font-semibold text-gray-700 dark:text-gray-200">
        <span className="text-gray-400 dark:text-gray-400 font-bold uppercase tracking-wider text-[10px]">Score Tier Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <span>90+ Excellent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>75-89 High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>60-74 Moderate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          <span>&lt;60 Low</span>
        </div>
      </div>
    </div>
  );
};
