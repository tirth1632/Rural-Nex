import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Navigation } from 'lucide-react';
import { GOOGLE_MAPS_TILE_URLS, GOOGLE_MAPS_SUBDOMAINS, GOOGLE_MAPS_ATTRIBUTION, createUserLocationIcon } from '../../config/maps';
import { detectUserLocation } from '../../services/geolocationService';

// Fix leaflet icon issue with webpack/vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper to center map
function MapCenter({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

const LocationSearch = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  
  // Default to central India if nothing selected
  const [mapPosition, setMapPosition] = useState<[number, number]>([20.5937, 78.9629]);
  const [radius, setRadius] = useState<number>(5000); // meters

  const handleDetectLocation = async () => {
    setIsLocating(true);
    setLocateError(null);
    try {
      const loc = await detectUserLocation();
      setMapPosition([loc.lat, loc.lng]);
      setSelectedLocation({
        geometry: { coordinates: [loc.lng, loc.lat] },
        properties: {
          name: loc.formattedAddress,
          village: loc.village,
          block: loc.block,
          district: loc.district,
          state: loc.state,
        }
      });
    } catch (err: any) {
      setLocateError(err.message || 'Location detection failed.');
    } finally {
      setIsLocating(false);
    }
  };
  
  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.length > 2) {
      try {
        const res = await fetch(`/api/locations/search/?q=${val}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error("Search failed", err);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleGeocode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/locations/geocode/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (res.ok) {
        const data = await res.json();
        // The endpoint returns a LocationSummary
        // But we need the point coordinates. 
        // We'll fetch the full location details to get GeoJSON.
        const detailRes = await fetch(`/api/locations/${data.id}/`);
        if (detailRes.ok) {
           const detailData = await detailRes.json();
           selectLocation(detailData);
        }
      }
    } catch (err) {
      console.error("Geocoding failed", err);
    }
  };

  const selectLocation = (loc: any) => {
    setSelectedLocation(loc);
    setSuggestions([]);
    if (loc.geometry && loc.geometry.coordinates) {
      // GeoJSON is [lng, lat]
      const [lng, lat] = loc.geometry.coordinates;
      setMapPosition([lat, lng]);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[600px] w-full p-4 bg-white rounded shadow border border-gray-200">
      
      {/* Sidebar - Search and Summary */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary">Location Intelligence</h2>
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors cursor-pointer"
          >
            <Navigation size={13} className={isLocating ? 'animate-spin' : ''} />
            <span>{isLocating ? 'Locating...' : 'Detect My Location'}</span>
          </button>
        </div>

        {locateError && (
          <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
            {locateError}
          </p>
        )}
        
        <form onSubmit={handleGeocode} className="relative">
          <input 
            type="text" 
            placeholder="Search village, block, district..."
            className="w-full p-3 border rounded shadow-sm focus:ring-1 focus:ring-primary outline-none"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <button type="submit" className="absolute right-2 top-2 bg-primary text-white px-3 py-1 rounded">
            Find
          </button>
          
          {suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((s) => (
                <div 
                  key={s.id} 
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b text-sm"
                  onClick={async () => {
                    const detailRes = await fetch(`/api/locations/${s.id}/`);
                    if (detailRes.ok) {
                      const detailData = await detailRes.json();
                      selectLocation(detailData);
                    }
                  }}
                >
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-gray-500 text-xs">{s.formatted_address || `${s.block}, ${s.district}`}</div>
                </div>
              ))}
            </div>
          )}
        </form>

        {selectedLocation && (
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex-1">
            <h3 className="font-bold text-lg text-blue-900 mb-2">Location Summary</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p><span className="font-semibold">Name:</span> {selectedLocation.properties.name}</p>
              {selectedLocation.properties.village && <p><span className="font-semibold">Village:</span> {selectedLocation.properties.village}</p>}
              {selectedLocation.properties.block && <p><span className="font-semibold">Block:</span> {selectedLocation.properties.block}</p>}
              {selectedLocation.properties.district && <p><span className="font-semibold">District:</span> {selectedLocation.properties.district}</p>}
              
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="font-semibold mb-1">Coordinates:</p>
                <p className="font-mono text-xs">
                  Lat: {selectedLocation.geometry.coordinates[1].toFixed(4)}<br/>
                  Lng: {selectedLocation.geometry.coordinates[0].toFixed(4)}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-blue-200">
                <label className="block font-semibold mb-1">Market Reach Radius</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                >
                  <option value={5000}>5 km</option>
                  <option value={10000}>10 km</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map View */}
      <div className="w-full md:w-2/3 h-full rounded border overflow-hidden z-0 relative">
        <MapContainer center={mapPosition} zoom={11} className="w-full h-full">
          <TileLayer
            attribution={GOOGLE_MAPS_ATTRIBUTION}
            url={GOOGLE_MAPS_TILE_URLS.roadmap}
            subdomains={GOOGLE_MAPS_SUBDOMAINS}
          />
          {selectedLocation && (
            <>
              <MapCenter position={mapPosition} />
              <Marker 
                position={mapPosition} 
                icon={createUserLocationIcon('Your Location (Drag to adjust)')} 
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const latLng = e.target.getLatLng();
                    setMapPosition([latLng.lat, latLng.lng]);
                  }
                }}
              />
              <Circle 
                center={mapPosition}
                radius={radius}
                pathOptions={{ color: radius === 5000 ? 'blue' : 'purple', fillColor: radius === 5000 ? 'blue' : 'purple', fillOpacity: 0.1 }}
              />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default LocationSearch;
