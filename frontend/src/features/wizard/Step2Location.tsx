import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { Navigation, MapPin, Search, CheckCircle, Loader2 } from 'lucide-react';
import { GOOGLE_MAPS_TILE_URLS, GOOGLE_MAPS_SUBDOMAINS, GOOGLE_MAPS_ATTRIBUTION, createUserLocationIcon } from '../../config/maps';
import { detectUserLocation } from '../../services/geolocationService';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapCenter({ position }: { position: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(position, 14, { animate: true });
    }, [position, map]);
    return null;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        }
    });
    return null;
}

export default function Step2Location({ data, onNext, onBack }: any) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [locateError, setLocateError] = useState<string | null>(null);
    
    // Check if we have existing data
    const existingPos: [number, number] | null = data.lat && data.lng ? [data.lat, data.lng] : null;
    
    const [mapPosition, setMapPosition] = useState<[number, number]>(existingPos || [22.9948, 72.6624]); // Default to Vastral, Gujarat
    const [selectedLocation, setSelectedLocation] = useState<any>(
        existingPos 
            ? { geometry: { coordinates: [data.lng, data.lat] }, properties: { name: data.formatted_address || 'Selected Site Location' } } 
            : { geometry: { coordinates: [72.6624, 22.9948] }, properties: { name: 'Vastral, Ahmedabad, Gujarat, India' } }
    );

    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
                headers: { 'User-Agent': 'RuralNex-App/1.0' }
            });
            if (res.ok) {
                const item = await res.json();
                const name = item.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                setSelectedLocation({
                    geometry: { coordinates: [lng, lat] },
                    properties: {
                        name,
                        state_id: item.address?.state,
                        district_id: item.address?.state_district || item.address?.county,
                        block_id: item.address?.subdistrict || item.address?.suburb,
                        village_id: item.address?.village || item.address?.town || item.address?.city,
                    }
                });
                setQuery(name);
            }
        } catch (err) {
            console.warn("Reverse geocode failed", err);
            setSelectedLocation({
                geometry: { coordinates: [lng, lat] },
                properties: { name: `Location Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})` }
            });
        }
    };

    const handleDetectCurrentLocation = async () => {
        setIsLocating(true);
        setLocateError(null);
        try {
            const loc = await detectUserLocation();
            setMapPosition([loc.lat, loc.lng]);
            setSelectedLocation({
                geometry: { coordinates: [loc.lng, loc.lat] },
                properties: {
                    name: loc.formattedAddress,
                    state_id: loc.state,
                    district_id: loc.district,
                    block_id: loc.block,
                    village_id: loc.village,
                }
            });
            setQuery(loc.formattedAddress);
        } catch (err: any) {
            setLocateError(err.message || 'Location detection failed.');
        } finally {
            setIsLocating(false);
        }
    };

    const handleSearch = async (val: string) => {
        setQuery(val);
        if (val.trim().length > 2) {
            setIsSearching(true);
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&addressdetails=1&countrycodes=in&limit=8`, {
                    headers: { 'User-Agent': 'RuralNex-App/1.0' }
                });
                if (res.ok) {
                    const items = await res.json();
                    const formatted = items.map((item: any) => ({
                        id: item.place_id,
                        name: item.display_name.split(',')[0],
                        formatted_address: item.display_name,
                        lat: parseFloat(item.lat),
                        lng: parseFloat(item.lon),
                        raw: item
                    }));
                    setSuggestions(formatted);
                }
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setIsSearching(false);
            }
        } else {
            setSuggestions([]);
        }
    };

    const selectLocation = (loc: any) => {
        const lat = loc.lat;
        const lng = loc.lng;
        setMapPosition([lat, lng]);
        setSelectedLocation({
            geometry: { coordinates: [lng, lat] },
            properties: {
                name: loc.formatted_address,
                state_id: loc.raw?.address?.state,
                district_id: loc.raw?.address?.state_district || loc.raw?.address?.county,
                block_id: loc.raw?.address?.subdistrict || loc.raw?.address?.suburb,
                village_id: loc.raw?.address?.village || loc.raw?.address?.town || loc.raw?.address?.city,
            }
        });
        setQuery(loc.formatted_address);
        setSuggestions([]);
    };

    const handleMapClick = (lat: number, lng: number) => {
        setMapPosition([lat, lng]);
        reverseGeocode(lat, lng);
    };

    const handleContinue = () => {
        if (!selectedLocation) return;
        const [lng, lat] = selectedLocation.geometry.coordinates;
        const props = selectedLocation.properties || {};
        const parts = (props.name || '').split(',').map((s: string) => s.trim());
        const villageName = props.village_id || props.village || parts[0] || 'Selected Village';
        const blockName = props.block_id || props.block || parts[1] || 'Taluka';
        const districtName = props.district_id || props.district || parts[2] || 'District';
        const stateName = props.state_id || props.state || parts[3] || 'State';

        onNext({ 
            lat, 
            lng,
            village_name: villageName,
            block_name: blockName,
            district_name: districtName,
            state_name: stateName,
            state: props.state_id || data.state || '',
            district: props.district_id || data.district || '',
            block: props.block_id || data.block || '',
            village: props.village_id || data.village || '',
            formatted_address: props.name || `${villageName}, ${districtName}`
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Where are you planning to open your business?</h2>
                <p className="text-gray-500 mt-1">Search for your village, block, or district. We use this to analyze local demand and competition.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 h-[520px] w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Left Side Control Panel */}
                <div className="w-full md:w-1/3 flex flex-col p-5 border-r border-gray-100 bg-gray-50 space-y-4">
                    <button
                        type="button"
                        onClick={handleDetectCurrentLocation}
                        disabled={isLocating}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-60"
                    >
                        <Navigation size={15} className={isLocating ? 'animate-spin' : ''} />
                        <span>{isLocating ? 'Detecting GPS Location...' : 'Use My Current Location'}</span>
                    </button>

                    {locateError && (
                        <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 font-medium">
                            {locateError}
                        </p>
                    )}

                    <div className="relative">
                        <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">
                            Search Village / City / District
                        </label>
                        <div className="relative flex items-center">
                            <Search size={16} className="absolute left-3 text-gray-400 pointer-events-none" />
                            <input 
                                type="text" 
                                placeholder="Type location e.g. Vastral, Ahmedabad..."
                                className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl shadow-2xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none text-sm bg-white font-medium text-gray-900 transition-all"
                                value={query}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            {isSearching && (
                                <Loader2 size={16} className="absolute right-3 text-emerald-600 animate-spin" />
                            )}
                        </div>

                        {/* Search Autocomplete Suggestions Dropdown */}
                        {suggestions.length > 0 && (
                            <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto divide-y divide-gray-100">
                                {suggestions.map((s) => (
                                    <div 
                                        key={s.id} 
                                        className="p-3 hover:bg-emerald-50/70 transition cursor-pointer text-sm flex items-start gap-2.5"
                                        onClick={() => selectLocation(s)}
                                    >
                                        <MapPin size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                        <div>
                                            <div className="font-bold text-gray-900 leading-snug">{s.name}</div>
                                            <div className="text-gray-500 text-xs mt-0.5 line-clamp-2 leading-relaxed">{s.formatted_address}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Selected Location Details Card */}
                    {selectedLocation && (
                        <div className="flex-1 flex flex-col justify-between pt-2">
                            <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-xl shadow-2xs space-y-2">
                                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                                    <CheckCircle size={14} className="text-emerald-600" />
                                    <span>Selected Site Location</span>
                                </div>
                                <p className="text-sm text-gray-900 font-semibold leading-relaxed">
                                    {selectedLocation.properties?.name}
                                </p>
                                <p className="text-[11px] text-gray-500 font-mono pt-1 border-t border-emerald-200/50">
                                    Lat: {mapPosition[0].toFixed(5)}, Lng: {mapPosition[1].toFixed(5)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side Google Map */}
                <div className="w-full md:w-2/3 h-full z-0 relative">
                    <MapContainer center={mapPosition} zoom={14} className="w-full h-full">
                        <TileLayer
                            url={GOOGLE_MAPS_TILE_URLS.roadmap}
                            attribution={GOOGLE_MAPS_ATTRIBUTION}
                            subdomains={GOOGLE_MAPS_SUBDOMAINS}
                        />
                        <MapCenter position={mapPosition} />
                        <MapClickHandler onLocationSelect={handleMapClick} />
                        {selectedLocation && (
                            <>
                                <Marker 
                                    position={mapPosition} 
                                    icon={createUserLocationIcon('Selected Business Site')} 
                                    draggable={true}
                                    eventHandlers={{
                                        dragend: (e) => {
                                            const latLng = e.target.getLatLng();
                                            handleMapClick(latLng.lat, latLng.lng);
                                        }
                                    }}
                                />
                                <Circle center={mapPosition} radius={3000} pathOptions={{ color: '#059669', fillColor: '#10b981', fillOpacity: 0.12 }} />
                            </>
                        )}
                    </MapContainer>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-4">
                <button onClick={onBack} className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition">
                    Back
                </button>
                <button 
                    onClick={handleContinue}
                    disabled={!selectedLocation}
                    className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    Confirm Location
                </button>
            </div>
        </div>
    );
}
