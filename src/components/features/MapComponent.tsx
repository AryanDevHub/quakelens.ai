import React, { memo } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import type { DisasterPoint } from '@/types';

interface MapComponentProps {
  data: DisasterPoint[];
  layer: 'satellite' | 'terrain';
  onPointClick?: (point: DisasterPoint) => void;
}

// Map controller to set view
const MapController = memo(function MapController() {
  const map = useMap();
  
  React.useEffect(() => {
    map.setView([28.6139, 77.2090], 12);
  }, [map]);
  
  return null;
});

const riskColors = {
  HIGH: '#ff3131',
  MEDIUM: '#f59e0b',
  SAFE: '#39ff14',
};

const MapComponent: React.FC<MapComponentProps> = memo(function MapComponent({ 
  data, 
  layer,
  onPointClick 
}) {
  const tileUrl = layer === 'satellite'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div className="absolute inset-0 grayscale-[0.2] brightness-[0.4] contrast-[1.2]">
      <MapContainer
        center={[28.6139, 77.2090]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        scrollWheelZoom={false}
      >
        <MapController />
        <TileLayer url={tileUrl} />
        {data.map((point) => (
          <Circle
            key={point.id}
            center={point.pos}
            radius={650}
            pathOptions={{
              color: 'white',
              weight: 1.5,
              fillColor: riskColors[point.risk],
              fillOpacity: 0.8,
            }}
            eventHandlers={{
              click: () => onPointClick?.(point),
            }}
          >
            <Popup>
              <div className="text-xs p-2 font-mono uppercase font-bold tracking-tighter min-w-[150px]">
                <p className="font-black mb-1" style={{ color: riskColors[point.risk] }}>
                  {point.label}
                </p>
                <p className="text-slate-400 text-[10px]">
                  TAG: {point.risk}
                </p>
                <p className="text-slate-400 text-[10px]">
                  SCORE: {point.score}%
                </p>
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
});

export default MapComponent;
