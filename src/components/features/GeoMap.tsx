import React, { useState, useCallback, memo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { MapIcon, Navigation, Layers, Info } from 'lucide-react';
import { GlassCard, LoadingSkeleton } from '@/components/ui/custom';
import type { DisasterPoint } from '@/types';
import { AnimatePresence } from 'framer-motion';

// Lazy load the actual map component
const MapComponent = React.lazy(() => import('./MapComponent'));

// Mock disaster data for India (New Delhi area)
const mockDisasterData: DisasterPoint[] = [
  { id: 1, pos: [28.6139, 77.2090], risk: 'HIGH', score: 32, label: 'Sector 4: High-Rise Failure' },
  { id: 2, pos: [28.6239, 77.2190], risk: 'MEDIUM', score: 58, label: 'Govt District: Shear Cracks' },
  { id: 3, pos: [28.6039, 77.1990], risk: 'SAFE', score: 89, label: 'Residential Hub: Secure' },
  { id: 4, pos: [28.6339, 77.2290], risk: 'HIGH', score: 28, label: 'Industrial Zone: Collapse Risk' },
  { id: 5, pos: [28.5939, 77.1890], risk: 'MEDIUM', score: 65, label: 'School Complex: Moderate Damage' },
  { id: 6, pos: [28.6439, 77.2390], risk: 'SAFE', score: 92, label: 'Hospital: Structural Integrity OK' },
];

const riskColors = {
  HIGH: { color: '#ff3131', label: 'High Risk' },
  MEDIUM: { color: '#f59e0b', label: 'Medium Risk' },
  SAFE: { color: '#39ff14', label: 'Safe Zone' },
};

interface GeoMapProps {
  onToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const GeoMap: React.FC<GeoMapProps> = memo(function GeoMap({ onToast }) {
  const [showMap, setShowMap] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<DisasterPoint | null>(null);
  const [mapLayer, setMapLayer] = useState<'satellite' | 'terrain'>('satellite');

  const handleLoadMap = useCallback(() => {
    setShowMap(true);
    onToast?.('Loading satellite imagery...', 'info');
  }, [onToast]);

  const handlePointClick = useCallback((point: DisasterPoint) => {
    setSelectedPoint(point);
  }, []);

  const stats = {
    high: mockDisasterData.filter(d => d.risk === 'HIGH').length,
    medium: mockDisasterData.filter(d => d.risk === 'MEDIUM').length,
    safe: mockDisasterData.filter(d => d.risk === 'SAFE').length,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full space-y-4"
    >
      {/* Map Container */}
      <div className="h-[400px] w-full rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl bg-[#0a0a0c]">
        {!showMap ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
            <LoadingSkeleton className="absolute inset-0 rounded-none" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-10 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto">
                <MapIcon size={28} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white uppercase tracking-wider">Satellite Map</p>
                <p className="text-[10px] text-slate-400 mt-1">Load real-time disaster overlay</p>
              </div>
              <button
                onClick={handleLoadMap}
                className="px-6 py-2.5 bg-cyan-600 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-cyan-500 active:scale-95 transition-all"
              >
                Load Map
              </button>
            </motion.div>
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  <Navigation size={32} className="text-cyan-400" />
                </motion.div>
              </div>
            }
          >
            <MapComponent
              data={mockDisasterData}
              layer={mapLayer}
              onPointClick={handlePointClick}
            />
          </Suspense>
        )}

        {/* Map Controls */}
        {showMap && (
          <>
            {/* Layer Toggle */}
            <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
              <button
                onClick={() => setMapLayer(mapLayer === 'satellite' ? 'terrain' : 'satellite')}
                className="p-2.5 bg-black/80 backdrop-blur-xl rounded-xl border border-white/20 text-white hover:bg-black/60 transition-colors"
              >
                <Layers size={18} />
              </button>
            </div>

            {/* Legend */}
            <div className="absolute top-4 right-4 z-[1000] bg-black/80 backdrop-blur-xl p-3 rounded-2xl border border-white/20 text-[9px] uppercase font-black tracking-widest space-y-2">
              {Object.entries(riskColors).map(([risk, { color, label }]) => (
                <div key={risk} className="flex items-center gap-2" style={{ color }}>
                  <div
                    className="w-2.5 h-2.5 rounded-full shadow-lg border border-white"
                    style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
                  />
                  {label}
                </div>
              ))}
            </div>

            {/* Scan Line */}
            <motion.div
              animate={{ top: ['0%', '100%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="absolute left-0 right-0 h-[2px] bg-cyan-500/30 z-[402] pointer-events-none"
            />
          </>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2">
        <GlassCard variant="danger" className="p-3 text-center">
          <p className="text-2xl font-black text-red-500">{stats.high}</p>
          <p className="text-[8px] uppercase text-slate-500 tracking-wider mt-1">High Risk</p>
        </GlassCard>
        <GlassCard variant="warning" className="p-3 text-center">
          <p className="text-2xl font-black text-yellow-500">{stats.medium}</p>
          <p className="text-[8px] uppercase text-slate-500 tracking-wider mt-1">Medium</p>
        </GlassCard>
        <GlassCard variant="success" className="p-3 text-center">
          <p className="text-2xl font-black text-green-500">{stats.safe}</p>
          <p className="text-[8px] uppercase text-slate-500 tracking-wider mt-1">Safe</p>
        </GlassCard>
      </div>

      {/* Selected Point Info */}
      <AnimatePresence>
        {selectedPoint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassCard
              variant={selectedPoint.risk === 'HIGH' ? 'danger' : selectedPoint.risk === 'MEDIUM' ? 'warning' : 'success'}
              borderPosition="left"
            >
              <div className="flex items-start gap-3">
                <Info size={18} className={
                  selectedPoint.risk === 'HIGH' ? 'text-red-400' :
                  selectedPoint.risk === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'
                } />
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider mb-1">
                    {selectedPoint.label}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Stability Score: <span className={
                      selectedPoint.score < 60 ? 'text-red-400' :
                      selectedPoint.score < 80 ? 'text-yellow-400' : 'text-green-400'
                    }>{selectedPoint.score}%</span>
                  </p>
                  <p className="text-[9px] text-slate-500 mt-1">
                    Coordinates: {selectedPoint.pos[0].toFixed(4)}, {selectedPoint.pos[1].toFixed(4)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPoint(null)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Regional Command Link */}
      <GlassCard className="flex items-center gap-4 border-l-4 border-cyan-500 bg-cyan-500/5 py-3">
        <MapIcon className="text-cyan-500 animate-pulse" size={24} />
        <div>
          <p className="text-[10px] uppercase font-black text-cyan-400 tracking-widest">
            Regional Command Link
          </p>
          <p className="text-[11px] text-slate-300 italic">
            Global Triage synthesized via on-ground Mesh Node telemetry.
          </p>
        </div>
      </GlassCard>
    </motion.div>
  );
});

export default GeoMap;
