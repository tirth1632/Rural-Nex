import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  center: [number, number];
  zoom?: number;
  competitors?: Array<{ id: number, lat: number, lng: number, name: string, category: string }>;
  radiusKm?: number;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  center, 
  zoom = 13, 
  competitors = [], 
  radiusKm = 5 
}) => {
  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border shadow-sm">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Village/Block Center */}
        <Marker position={center}>
          <Popup>Proposed Location</Popup>
        </Marker>

        {/* Market Reach Radius */}
        <Circle 
          center={center} 
          pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }} 
          radius={radiusKm * 1000} 
        />

        {/* Competitor POIs */}
        {competitors.map(comp => (
          <Marker key={comp.id} position={[comp.lat, comp.lng]}>
            <Popup>
              <strong>{comp.name}</strong><br/>
              {comp.category}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
