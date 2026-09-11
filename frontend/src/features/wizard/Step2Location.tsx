import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { Navigation, MapPin, Search, CheckCircle, Loader2, X } from 'lucide-react';
import { GOOGLE_MAPS_TILE_URLS, GOOGLE_MAPS_SUBDOMAINS, GOOGLE_MAPS_ATTRIBUTION, createUserLocationIcon } from '../../config/maps';
import { detectUserLocation } from '../../services/geolocationService';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// ─── Map helpers ──────────────────────────────────────────────────────────────
function MapCenter({ position }: { position: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(position, 14, { animate: true });
    }, [position, map]);
    return null;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) { onLocationSelect(e.latlng.lat, e.latlng.lng); }
    });
    return null;
}

// ─── Address utilities ────────────────────────────────────────────────────────
/**
 * Extracts clean village / block / district / state / country
 * from a Nominatim address object.
 * Nominatim address field hierarchy (India-specific):
 *   village / hamlet / suburb / neighbourhood → village/locality
 *   subdistrict / municipality / town          → block / taluka
 *   state_district / county / city             → district
 *   state                                      → state
 */
function extractAddressParts(addr: Record<string, string>) {
    const village =
        addr.village ||
        addr.hamlet ||
        addr.suburb ||
        addr.neighbourhood ||
        addr.town ||
        addr.quarter ||
        '';

    const block =
        addr.subdistrict ||
        addr.municipality ||
        addr.city_district ||
        addr.county ||
        village ||
        '';

    const district =
        addr.state_district ||
        addr.district ||
        addr.city ||
        addr.county ||
        block ||
        '';

    const state = addr.state || addr.region || '';
    const country = addr.country || 'India';
    const pinCode = addr.postcode || '';

    return { village, block, district, state, country, pinCode };
}

function buildFormattedAddress(parts: ReturnType<typeof extractAddressParts>, fallbackName: string) {
    const { village, block, district, state } = parts;
    const segments = [village, block !== village ? block : '', district !== block ? district : '', state]
        .map(s => s.trim())
        .filter(Boolean);
    // De-duplicate consecutive identical segments
    const deduped = segments.filter((s, i) => i === 0 || s !== segments[i - 1]);
    return deduped.join(', ') || fallbackName;
}

// ─── Component ────────────────────────────────────────────────────────────────
// India centroid — neutral default when no prior selection
const INDIA_CENTER: [number, number] = [20.5937, 78.9629];
const INDIA_ZOOM = 5;

export default function Step2Location({ data, onNext, onBack }: any) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [locateError, setLocateError] = useState<string | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Restore from prior wizard step data
    const hasExisting = !!(data.lat && data.lng);
    const existingPos: [number, number] | null = hasExisting ? [data.lat, data.lng] : null;

    const [mapPosition, setMapPosition] = useState<[number, number]>(existingPos || INDIA_CENTER);
    const [mapZoom] = useState(hasExisting ? 14 : INDIA_ZOOM);
    const [selectedLocation, setSelectedLocation] = useState<any>(
        hasExisting
            ? {
                geometry: { coordinates: [data.lng, data.lat] },
                properties: {
                    name: data.formatted_address || `${data.village_name || ''}, ${data.district_name || ''}`.trim().replace(/^,\s*/, ''),
                    village_id: data.village_name || '',
                    block_id: data.block_name || '',
                    district_id: data.district_name || '',
                    state_id: data.state_name || '',
                }
            }
            : null   // ← no default fake location
    );

    // ─── Reverse geocode (map click / GPS) ──────────────────────────────────
    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&addressdetails=1`,
                { headers: { 'User-Agent': 'RuralNex-App/1.0', 'Accept-Language': 'en' } }
            );
            if (res.ok) {
                const item = await res.json();
                const addr = item.address || {};
                const parts = extractAddressParts(addr);
                const formatted = buildFormattedAddress(parts, item.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
                setSelectedLocation({
                    geometry: { coordinates: [lng, lat] },
                    properties: {
                        name: formatted,
                        village_id: parts.village,
                        block_id: parts.block,
                        district_id: parts.district,
                        state_id: parts.state,
                        pin_code: parts.pinCode,
                    }
                });
                setQuery(formatted);
            }
        } catch (err) {
            console.warn('Reverse geocode failed', err);
            setSelectedLocation({
                geometry: { coordinates: [lng, lat] },
                properties: {
                    name: `GPS Pin (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
                    village_id: '', block_id: '', district_id: '', state_id: ''
                }
            });
        }
    };

    // ─── GPS detect ──────────────────────────────────────────────────────────
    const handleDetectCurrentLocation = async () => {
        setIsLocating(true);
        setLocateError(null);
        try {
            const loc = await detectUserLocation();
            const pos: [number, number] = [loc.lat, loc.lng];
            setMapPosition(pos);
            setSelectedLocation({
                geometry: { coordinates: [loc.lng, loc.lat] },
                properties: {
                    name: loc.formattedAddress,
                    village_id: loc.village,
                    block_id: loc.block,
                    district_id: loc.district,
                    state_id: loc.state,
                    pin_code: loc.pinCode,
                }
            });
            setQuery(loc.formattedAddress);
        } catch (err: any) {
            const msg: Record<string, string> = {
                PERMISSION_DENIED: 'Location access denied. Please allow location permission and try again.',
                POSITION_UNAVAILABLE: 'GPS signal unavailable. Try searching your location manually.',
                TIMEOUT: 'Location detection timed out. Try again or search manually.',
            };
            setLocateError(msg[err.message] || 'Location detection failed. Please search manually.');
        } finally {
            setIsLocating(false);
        }
    };

    // ─── Search with debounce ────────────────────────────────────────────────
    const handleSearch = (val: string) => {
        setQuery(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (val.trim().length < 3) { setSuggestions([]); return; }

        debounceRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=jsonv2&addressdetails=1&countrycodes=in&limit=8&dedupe=1`,
                    { headers: { 'User-Agent': 'RuralNex-App/1.0', 'Accept-Language': 'en' } }
                );
                if (res.ok) {
                    const items = await res.json();
                    const formatted = items.map((item: any) => {
                        const addr = item.address || {};
                        const parts = extractAddressParts(addr);
                        const displayName = buildFormattedAddress(parts, item.display_name);
                        return {
                            id: item.place_id,
                            name: addr.village || addr.suburb || addr.neighbourhood || addr.town ||
                                addr.city_district || addr.city || item.display_name.split(',')[0],
                            formatted_address: displayName,
                            full_display: item.display_name,
                            lat: parseFloat(item.lat),
                            lng: parseFloat(item.lon),
                            parts,
                            type: item.type,
                        };
                    });
                    setSuggestions(formatted);
                }
            } catch (err) {
                console.warn('Location search failed', err);
            } finally {
                setIsSearching(false);
            }
        }, 350); // 350ms debounce
    };

    // ─── Select from dropdown ─────────────────────────────────────────────────
    const selectLocation = (loc: any) => {
        const pos: [number, number] = [loc.lat, loc.lng];
        setMapPosition(pos);
        setSelectedLocation({
            geometry: { coordinates: [loc.lng, loc.lat] },
            properties: {
                name: loc.formatted_address,
                village_id: loc.parts?.village || '',
                block_id: loc.parts?.block || '',
                district_id: loc.parts?.district || '',
                state_id: loc.parts?.state || '',
                pin_code: loc.parts?.pinCode || '',
            }
        });
        setQuery(loc.formatted_address);
        setSuggestions([]);
    };

    // ─── Map click ────────────────────────────────────────────────────────────
    const handleMapClick = (lat: number, lng: number) => {
        const pos: [number, number] = [lat, lng];
        setMapPosition(pos);
        reverseGeocode(lat, lng);
    };

    // ─── Continue ─────────────────────────────────────────────────────────────
    const handleContinue = () => {
        if (!selectedLocation) return;
        const [lng, lat] = selectedLocation.geometry.coordinates;
        const props = selectedLocation.properties || {};

        // Use structured fields extracted at selection time (never comma-split the display name)
        const villageName = props.village_id || 'Selected Village';
        const blockName = props.block_id || villageName;
        const districtName = props.district_id || 'District';
        const stateName = props.state_id || 'State';

        onNext({
            lat,
            lng,
            village_name: villageName,
            block_name: blockName,
            district_name: districtName,
            state_name: stateName,
            state: stateName,
            district: districtName,
            block: blockName,
            village: villageName,
            formatted_address: props.name || `${villageName}, ${districtName}, ${stateName}`,
        });
    };

    const canContinue = selectedLocation && selectedLocation.geometry.coordinates[0] !== 0;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Where are you planning to open your business?</h2>
                <p className="text-gray-500 mt-1">Search for your village, block, or district. We use this to analyze local demand and competition.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 h-[520px] w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* ── Left Control Panel ── */}
                <div className="w-full md:w-1/3 flex flex-col p-5 border-r border-gray-100 bg-gray-50 space-y-4 overflow-y-auto">
                    <button
                        type="button"
                        onClick={handleDetectCurrentLocation}
                        disabled={isLocating}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-60"
                    >
                        <Navigation size={15} className={isLocating ? 'animate-spin' : ''} />
                        <span>{isLocating ? 'Detecting GPS...' : 'Use My Current Location'}</span>
                    </button>

                    {locateError && (
                        <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 p-3 rounded-xl border border-red-200">
                            <X size={13} className="shrink-0 mt-0.5 text-red-500" />
                            <span className="font-medium">{locateError}</span>
                        </div>
                    )}

                    {/* Search Input */}
                    <div className="relative">
                        <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">
                            Search Village / City / District
                        </label>
                        <div className="relative flex items-center">
                            <Search size={16} className="absolute left-3 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="e.g. Vastral, Surat, Jaipur Rural..."
                                className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl shadow-2xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none text-sm bg-white font-medium text-gray-900 transition-all"
                                value={query}
                                onChange={(e) => handleSearch(e.target.value)}
                                autoComplete="off"
                            />
                            {isSearching && <Loader2 size={16} className="absolute right-3 text-emerald-600 animate-spin" />}
                            {!isSearching && query && (
                                <button
                                    onClick={() => { setQuery(''); setSuggestions([]); }}
                                    className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </div>

                        {/* Suggestions Dropdown */}
                        {suggestions.length > 0 && (
                            <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto divide-y divide-gray-100">
                                {suggestions.map((s) => (
                                    <div
                                        key={s.id}
                                        className="p-3 hover:bg-emerald-50/70 transition cursor-pointer text-sm flex items-start gap-2.5"
                                        onClick={() => selectLocation(s)}
                                    >
                                        <MapPin size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                        <div className="min-w-0">
                                            <div className="font-bold text-gray-900 leading-snug truncate">{s.name}</div>
                                            <div className="text-gray-500 text-xs mt-0.5 line-clamp-2 leading-relaxed">{s.formatted_address}</div>
                                            {s.parts?.district && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {s.parts.district && (
                                                        <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 rounded-md px-1.5 py-0.5 font-semibold">{s.parts.district}</span>
                                                    )}
                                                    {s.parts.state && (
                                                        <span className="text-[10px] bg-gray-100 text-gray-600 border border-gray-200 rounded-md px-1.5 py-0.5 font-semibold">{s.parts.state}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* No results */}
                        {!isSearching && query.length >= 3 && suggestions.length === 0 && (
                            <div className="mt-2 text-xs text-gray-500 text-center py-2">
                                No results — try a broader name or click on the map
                            </div>
                        )}
                    </div>

                    {/* Selected Location Card */}
                    {selectedLocation ? (
                        <div className="flex-1 flex flex-col justify-between pt-2">
                            <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-xl shadow-2xs space-y-2.5">
                                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                                    <CheckCircle size={14} className="text-emerald-600" />
                                    <span>Selected Site Location</span>
                                </div>
                                <p className="text-sm text-gray-900 font-semibold leading-relaxed">
                                    {selectedLocation.properties?.name}
                                </p>
                                {/* Address breakdown chips */}
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {selectedLocation.properties?.village_id && (
                                        <span className="text-[10px] bg-white border border-emerald-200 text-emerald-800 rounded-md px-2 py-0.5 font-bold">
                                            📍 {selectedLocation.properties.village_id}
                                        </span>
                                    )}
                                    {selectedLocation.properties?.block_id && selectedLocation.properties.block_id !== selectedLocation.properties.village_id && (
                                        <span className="text-[10px] bg-white border border-blue-200 text-blue-700 rounded-md px-2 py-0.5 font-bold">
                                            🏘 {selectedLocation.properties.block_id}
                                        </span>
                                    )}
                                    {selectedLocation.properties?.district_id && (
                                        <span className="text-[10px] bg-white border border-purple-200 text-purple-700 rounded-md px-2 py-0.5 font-bold">
                                            🏛 {selectedLocation.properties.district_id}
                                        </span>
                                    )}
                                    {selectedLocation.properties?.state_id && (
                                        <span className="text-[10px] bg-white border border-gray-200 text-gray-600 rounded-md px-2 py-0.5 font-bold">
                                            {selectedLocation.properties.state_id}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-500 font-mono pt-1 border-t border-emerald-200/50">
                                    Lat: {mapPosition[0].toFixed(5)}, Lng: {mapPosition[1].toFixed(5)}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center text-gray-400 space-y-2 p-4">
                                <MapPin size={28} className="mx-auto text-gray-300" />
                                <p className="text-xs font-medium">Search above or click on the map to pin your site</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Right Map ── */}
                <div className="w-full md:w-2/3 h-full z-0 relative">
                    <MapContainer
                        center={mapPosition}
                        zoom={hasExisting ? 14 : INDIA_ZOOM}
                        className="w-full h-full"
                    >
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
                                <Circle
                                    center={mapPosition}
                                    radius={3000}
                                    pathOptions={{ color: '#059669', fillColor: '#10b981', fillOpacity: 0.12 }}
                                />
                            </>
                        )}
                    </MapContainer>

                    {/* Map hint overlay */}
                    {!selectedLocation && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-black/70 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg pointer-events-none backdrop-blur-sm">
                            🗺 Click anywhere on the map to pin your site
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-4">
                <button onClick={onBack} className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition">
                    Back
                </button>
                <button
                    onClick={handleContinue}
                    disabled={!canContinue}
                    className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    Confirm Location
                </button>
            </div>
        </div>
    );
}
