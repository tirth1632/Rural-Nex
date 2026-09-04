import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Badge } from '../components/common/Badge';
import {
  MapPin,
  Layers,
  Filter,
  Search,
  Building,
  Phone,
  Star,
  Navigation,
  CheckCircle,
} from 'lucide-react';
import { mockCompetitors } from '../mock/competitorMock';
import type { Competitor } from '../types';

// Custom Leaflet Pin Icons
const createCustomPin = (color: string) => {
  return L.divIcon({
    className: 'custom-leaflet-pin',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">📍</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const competitorIcon = createCustomPin('#115E59');
const userLocationIcon = createCustomPin('#DC2626');

export const GISMap: React.FC = () => {
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(mockCompetitors[0]);
  const [radiusKm, setRadiusKm] = useState(10);
  const [showCompetitorPins, setShowCompetitorPins] = useState(true);
  const [showDemandHeat, setShowDemandHeat] = useState(true);
  const [showRadiusOverlay, setShowRadiusOverlay] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  // Center Coordinates: Karnal, Haryana (29.6857, 76.9905)
  const centerLat = 29.6857;
  const centerLng = 76.9905;

  const filteredCompetitors = mockCompetitors.filter((c) =>
    categoryFilter === 'All Categories' ? true : c.category === categoryFilter
  );

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col space-y-3">
      {/* Top GIS Header Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-subtle flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gov-800" />
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">GIS Spatial Analytics & Location Engine</h1>
            <p className="text-[11px] text-slate-500">Spatial radius coverage & competitor spatial distribution in Karnal District</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Village / Mandi..."
              className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-300 rounded text-xs focus:bg-white"
            />
          </div>
          <Badge variant="navy">OpenStreetMap Engine</Badge>
        </div>
      </div>

      {/* Main 3-Panel GIS Interface */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        {/* LEFT PANEL: Filters & Layers */}
        <div className="lg:col-span-3 bg-white rounded-lg border border-slate-200 p-4 shadow-subtle overflow-y-auto flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-gov-800" /> Layer Controls
              </span>
              <button
                onClick={() => {
                  setShowCompetitorPins(true);
                  setShowDemandHeat(true);
                  setShowRadiusOverlay(true);
                }}
                className="text-[10px] text-gov-800 font-semibold hover:underline"
              >
                Reset Layers
              </button>
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Filter Business Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded font-medium"
              >
                <option>All Categories</option>
                <option>Dairy Processing</option>
                <option>Food Processing</option>
                <option>Farm Machinery</option>
                <option>Cold Storage</option>
              </select>
            </div>

            {/* Radius Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Analysis Buffer Radius:</span>
                <span className="text-gov-800 font-bold">{radiusKm} km</span>
              </div>
              <input
                type="range"
                min={2}
                max={25}
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded accent-gov-800 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>2 km</span>
                <span>10 km</span>
                <span>25 km</span>
              </div>
            </div>

            {/* Layer Toggles */}
            <div className="space-y-2 border-t border-slate-200 pt-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Active GIS Layers</span>

              <label className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 cursor-pointer text-xs">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <Layers className="w-3.5 h-3.5 text-gov-800" /> Registered Competitors Pin
                </span>
                <input
                  type="checkbox"
                  checked={showCompetitorPins}
                  onChange={(e) => setShowCompetitorPins(e.target.checked)}
                  className="accent-gov-800"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 cursor-pointer text-xs">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" /> Market Buffer Overlay ({radiusKm}km)
                </span>
                <input
                  type="checkbox"
                  checked={showRadiusOverlay}
                  onChange={(e) => setShowRadiusOverlay(e.target.checked)}
                  className="accent-gov-800"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 cursor-pointer text-xs">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Village Panchayat Heatmap
                </span>
                <input
                  type="checkbox"
                  checked={showDemandHeat}
                  onChange={(e) => setShowDemandHeat(e.target.checked)}
                  className="accent-gov-800"
                />
              </label>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="font-bold text-slate-800">Spatial Intelligence Summary</div>
            <div>Showing <strong>{filteredCompetitors.length}</strong> active competitors inside <strong>{radiusKm} km</strong> buffer zone.</div>
          </div>
        </div>

        {/* CENTER PANEL: Interactive Leaflet Map */}
        <div className="lg:col-span-6 bg-white rounded-lg border border-slate-200 shadow-subtle overflow-hidden relative">
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={12}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Radius Circle Overlay */}
            {showRadiusOverlay && (
              <Circle
                center={[centerLat, centerLng]}
                radius={radiusKm * 1000}
                pathOptions={{ color: '#115E59', fillColor: '#115E59', fillOpacity: 0.08, weight: 1.5 }}
              />
            )}

            {/* Proposed Business User Pin */}
            <Marker position={[centerLat, centerLng]} icon={userLocationIcon}>
              <Popup>
                <div className="p-2 text-xs">
                  <div className="font-bold text-slate-900">Your Proposed Business Site</div>
                  <div className="text-slate-600">Stundi Village, Gharaunda Block</div>
                </div>
              </Popup>
            </Marker>

            {/* Competitor Pins */}
            {showCompetitorPins &&
              filteredCompetitors.map((comp) => (
                <Marker
                  key={comp.id}
                  position={[comp.lat, comp.lng]}
                  icon={competitorIcon}
                  eventHandlers={{
                    click: () => setSelectedCompetitor(comp),
                  }}
                >
                  <Popup>
                    <div className="p-2 text-xs space-y-1">
                      <div className="font-bold text-slate-900">{comp.name}</div>
                      <div className="text-slate-600">{comp.category} • {comp.village}</div>
                      <div className="font-semibold text-emerald-800">Distance: {comp.distanceKm} km</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>

        {/* RIGHT PANEL: Selected Location Inspector */}
        <div className="lg:col-span-3 bg-white rounded-lg border border-slate-200 p-4 shadow-subtle overflow-y-auto space-y-4">
          <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-gov-800" /> Location Inspector
            </span>
            <Badge variant="green">Active Selection</Badge>
          </div>

          {selectedCompetitor ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedCompetitor.name}</h3>
                <div className="text-xs text-slate-500 mt-0.5">{selectedCompetitor.category} • {selectedCompetitor.village}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Distance from Proposed Site:</span>
                  <span className="font-bold text-gov-800 flex items-center gap-1">
                    <Navigation className="w-3 h-3" /> {selectedCompetitor.distanceKm} km
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Daily Processing Capacity:</span>
                  <span className="font-bold text-slate-900">{selectedCompetitor.dailyCapacity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Estimated Unit Price:</span>
                  <span className="font-bold text-slate-900">₹{selectedCompetitor.pricePerUnit} / L</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Local Market Share:</span>
                  <span className="font-bold text-slate-900">{selectedCompetitor.marketSharePercent}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Threat Level Index:</span>
                  <Badge variant={selectedCompetitor.threatLevel === 'High' ? 'red' : 'amber'}>
                    {selectedCompetitor.threatLevel}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-600">Farmer Rating:</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {selectedCompetitor.rating} / 5.0
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" /> Contact Info
                </div>
                <div className="text-slate-600">{selectedCompetitor.phone}</div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-8 text-center">
              Click any competitor pin marker on the map to inspect spatial properties.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
