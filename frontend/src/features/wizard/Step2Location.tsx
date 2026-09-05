import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapCenter({ position }: { position: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(position, map.getZoom());
    }, [position, map]);
    return null;
}

export default function Step2Location({ data, onNext, onBack }: any) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    
    // Check if we have existing data
    const existingPos: [number, number] | null = data.lat && data.lng ? [data.lat, data.lng] : null;
    
    const [mapPosition, setMapPosition] = useState<[number, number]>(existingPos || [20.5937, 78.9629]);
    const [selectedLocation, setSelectedLocation] = useState<any>(existingPos ? { geometry: { coordinates: [data.lng, data.lat] }, properties: { name: 'Saved Location' } } : null);

    const handleSearch = async (val: string) => {
        setQuery(val);
        if (val.length > 2) {
            try {
                const res = await fetch(`/api/locations/search/?q=${val}`);
                if (res.ok) {
                    const d = await res.json();
                    setSuggestions(d);
                }
            } catch (err) {
                console.error("Search failed", err);
            }
        } else {
            setSuggestions([]);
        }
    };

    const selectLocation = (loc: any) => {
        setSelectedLocation(loc);
        setSuggestions([]);
        if (loc.geometry && loc.geometry.coordinates) {
            const [lng, lat] = loc.geometry.coordinates;
            setMapPosition([lat, lng]);
        }
    };

    const handleContinue = () => {
        if (!selectedLocation) return;
        const [lng, lat] = selectedLocation.geometry.coordinates;
        onNext({ 
            lat, 
            lng,
            // Assuming the API returns these properties:
            state: selectedLocation.properties?.state_id || data.state,
            district: selectedLocation.properties?.district_id || data.district,
            block: selectedLocation.properties?.block_id || data.block,
            village: selectedLocation.properties?.village_id || data.village,
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Where are you planning to open your business?</h2>
                <p className="text-gray-500 mt-1">Search for your village, block, or district. We use this to analyze local demand and competition.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 h-[500px] w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="w-full md:w-1/3 flex flex-col p-4 border-r border-gray-100 bg-gray-50">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search location..."
                            className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-primary outline-none"
                            value={query}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        {suggestions.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border rounded shadow-xl max-h-60 overflow-y-auto">
                                {suggestions.map((s) => (
                                    <div 
                                        key={s.id} 
                                        className="p-3 hover:bg-gray-50 cursor-pointer border-b text-sm"
                                        onClick={async () => {
                                            const detailRes = await fetch(`/api/locations/${s.id}/`);
                                            if (detailRes.ok) {
                                                const detailData = await detailRes.json();
                                                selectLocation(detailData);
                                            }
                                        }}
                                    >
                                        <div className="font-semibold text-gray-900">{s.name}</div>
                                        <div className="text-gray-500 text-xs">{s.formatted_address || `${s.block}, ${s.district}`}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {selectedLocation && (
                        <div className="mt-6 flex-1 flex flex-col justify-between">
                            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                                <h3 className="font-semibold text-primary mb-2">Selected Location</h3>
                                <p className="text-sm text-gray-800 font-medium">{selectedLocation.properties.name}</p>
                                <p className="text-xs text-gray-500 mt-2 font-mono">
                                    {mapPosition[0].toFixed(4)}, {mapPosition[1].toFixed(4)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-full md:w-2/3 h-full z-0 relative">
                    <MapContainer center={mapPosition} zoom={existingPos ? 13 : 5} className="w-full h-full">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {selectedLocation && (
                            <>
                                <MapCenter position={mapPosition} />
                                <Marker position={mapPosition} />
                                <Circle center={mapPosition} radius={5000} pathOptions={{ color: 'blue', fillOpacity: 0.1 }} />
                            </>
                        )}
                    </MapContainer>
                </div>
            </div>

            <div className="flex justify-between pt-6">
                {/* Step 2 doesn't technically need back if it's the first real input, but we include it for structural safety */}
                <button onClick={onBack} className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Back</button>
                <button 
                    onClick={handleContinue}
                    disabled={!selectedLocation}
                    className="px-8 py-2 bg-primary text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
                >
                    Confirm Location
                </button>
            </div>
        </div>
    );
}
