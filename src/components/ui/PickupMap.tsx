'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { PICKUP_POINTS } from '@/lib/constants';
import { useEffect } from 'react';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 12, { duration: 2 }); 
  }, [center, map]);
  return null;
};

interface Props {
  selectedId: string;
  onSelect: (pointId: string) => void;
}

const PickupMap = ({ selectedId, onSelect }: Props) => {
  const activePoint = PICKUP_POINTS.find(p => p.id === selectedId) || PICKUP_POINTS[0];

  return (
    <div style={{ height: '350px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd', marginTop: 15 }}>
      <MapContainer 
        center={[activePoint.lat, activePoint.lng]} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {/* Этот компонент будет двигать карту */}
        <MapUpdater center={[activePoint.lat, activePoint.lng]} />

        {PICKUP_POINTS.map((point) => (
          <Marker 
            key={point.id} 
            position={[point.lat, point.lng]} 
            icon={icon}
            eventHandlers={{
              click: () => onSelect(point.id), 
            }}
          >
            <Popup>
              <strong>{point.city}</strong><br/>
              {point.address}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default PickupMap;