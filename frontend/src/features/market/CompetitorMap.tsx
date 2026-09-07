import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ExternalDataBadge, EstimateBadge } from './ObservationBadges';
import { GOOGLE_MAPS_TILE_URLS, GOOGLE_MAPS_SUBDOMAINS, GOOGLE_MAPS_ATTRIBUTION, createUserLocationIcon } from '../../config/maps';

// Fix for default Leaflet markers in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Competitor {
    id: number;
    name: string;
    category: string;
    location: { lat: number; lng: number } | null;
    distance_km: number;
    data_source: any | null;
}

interface CompetitorMapProps {
    userLat: number;
    userLng: number;
    radiusKm: number;
    competitors: Competitor[];
}

export default function CompetitorMap({ userLat, userLng, radiusKm, competitors }: CompetitorMapProps) {
    const [isLocationOn, setIsLocationOn] = useState<boolean>(true);
    const [pinPos, setPinPos] = useState<[number, number]>([userLat, userLng]);

    return (
        <div className="relative h-[400px] w-full rounded-xl overflow-hidden border shadow-sm">
            {/* Map Controls */}
            <div className="absolute top-3 right-3 z-[1000]">
                <button
                    onClick={() => setIsLocationOn(!isLocationOn)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-md transition-colors cursor-pointer ${
                        isLocationOn ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Location {isLocationOn ? 'ON' : 'OFF'}
                </button>
            </div>

            <MapContainer center={pinPos} zoom={radiusKm === 5 ? 12 : 11} scrollWheelZoom={false} className="h-full w-full">
                <TileLayer
                    attribution={GOOGLE_MAPS_ATTRIBUTION}
                    url={GOOGLE_MAPS_TILE_URLS.roadmap}
                    subdomains={GOOGLE_MAPS_SUBDOMAINS}
                />
                
                {/* User Location */}
                {isLocationOn && (
                    <Marker 
                        position={pinPos} 
                        icon={createUserLocationIcon('Your Location (Drag to adjust)')}
                        draggable={true}
                        eventHandlers={{
                            dragend: (e) => {
                                const latLng = e.target.getLatLng();
                                setPinPos([latLng.lat, latLng.lng]);
                            }
                        }}
                    >
                        <Popup>
                            <strong>100% Precise Location</strong>
                            <p className="text-xs text-gray-600">{pinPos[0].toFixed(5)}, {pinPos[1].toFixed(5)}</p>
                        </Popup>
                    </Marker>
                )}
                
                {/* Search Radius */}
                <Circle 
                    center={[userLat, userLng]} 
                    radius={radiusKm * 1000} 
                    pathOptions={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.1 }} 
                />

                {/* Competitors */}
                {competitors.map(comp => {
                    if (!comp.location) return null;
                    return (
                        <Marker key={comp.id} position={[comp.location.lat, comp.location.lng]}>
                            <Popup>
                                <div className="min-w-[150px]">
                                    <strong className="block text-lg">{comp.name}</strong>
                                    <span className="text-sm text-gray-500 mb-2 block">{comp.category}</span>
                                    
                                    <div className="mb-2">
                                        {comp.data_source ? (
                                            <ExternalDataBadge source={comp.data_source} />
                                        ) : (
                                            <EstimateBadge />
                                        )}
                                    </div>
                                    <p className="text-sm"><strong>Distance:</strong> {comp.distance_km} km</p>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
