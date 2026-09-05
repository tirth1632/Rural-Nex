import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ExternalDataBadge, EstimateBadge } from './ObservationBadges';

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
    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden border shadow-sm">
            <MapContainer center={[userLat, userLng]} zoom={radiusKm === 5 ? 12 : 11} scrollWheelZoom={false} className="h-full w-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* User Location */}
                <Marker position={[userLat, userLng]}>
                    <Popup>
                        <strong>Selected Location</strong>
                        <p className="text-sm text-gray-600">Search Center</p>
                    </Popup>
                </Marker>
                
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
