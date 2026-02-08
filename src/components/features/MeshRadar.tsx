import React, { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, AlertTriangle, Users, Signal, Zap } from 'lucide-react';
import { GlassCard } from '@/components/ui/custom';

interface MeshNode {
  id: string;
  x: number;
  y: number;
  status: 'active' | 'warning' | 'critical';
  signal: number;
  lastSeen: string;
  type: 'responder' | 'victim' | 'hub';
}

const mockNodes: MeshNode[] = [
  { id: 'Node_778X', x: 33, y: 25, status: 'critical', signal: 23, lastSeen: '2s ago', type: 'hub' },
  { id: 'Node_891A', x: 66, y: 40, status: 'active', signal: 87, lastSeen: '1s ago', type: 'responder' },
  { id: 'Node_452B', x: 45, y: 60, status: 'warning', signal: 54, lastSeen: '5s ago', type: 'victim' },
  { id: 'Node_123C', x: 75, y: 70, status: 'active', signal: 92, lastSeen: '1s ago', type: 'responder' },
  { id: 'Node_999D', x: 20, y: 75, status: 'warning', signal: 45, lastSeen: '8s ago', type: 'victim' },
];

const mockAlerts = [
  { id: 1, node: 'Node_778X', message: 'SHEAR_FAILURE_DETECTED', time: 'SEC: 124', type: 'critical' as const },
  { id: 2, node: 'Node_891A', message: 'RESCUE_TEAM_ARRIVED', time: 'SEC: 89', type: 'info' as const },
  { id: 3, node: 'Node_452B', message: 'VICTIM_LOCATED', time: 'SEC: 45', type: 'warning' as const },
];

const statusColors = {
  active: 'bg-green-500',
  warning: 'bg-yellow-500',
  critical: 'bg-red-500',
};

const typeIcons = {
  responder: Zap,
  victim: Users,
  hub: Signal,
};

interface MeshRadarProps {
  onToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const MeshRadar: React.FC<MeshRadarProps> = memo(function MeshRadar({ onToast }) {
  const [selectedNode, setSelectedNode] = useState<MeshNode | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  const toggleScan = useCallback(() => {
    setIsScanning(prev => !prev);
    onToast?.(isScanning ? 'Radar paused' : 'Radar scanning resumed', 'info');
  }, [isScanning, onToast]);

  const activeNodes = mockNodes.filter(n => n.status === 'active').length;
  const totalNodes = mockNodes.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {/* Radar Display */}
      <GlassCard className="relative h-72 overflow-hidden flex items-center justify-center bg-black/40 border-cyan-500/20 shadow-inner">
        {/* Grid Background */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(#06b6d4 1px, transparent 0)',
            backgroundSize: '20px 20px',
          }}
        />
        
        {/* Radar Sweep */}
        {isScanning && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            className="absolute w-[140%] h-[140%] border-r border-cyan-500/30 rounded-full bg-gradient-to-r from-cyan-500/10 to-transparent origin-center"
          />
        )}

        {/* Concentric Circles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[30, 50, 70].map((size) => (
            <div
              key={size}
              className="absolute rounded-full border border-cyan-500/10"
              style={{ width: `${size}%`, height: `${size}%` }}
            />
          ))}
        </div>

        {/* Center Hub */}
        <div className="absolute w-4 h-4 bg-cyan-500 rounded-full shadow-[0_0_20px_#06b6d4] z-10">
          <motion.div
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-cyan-500 rounded-full opacity-50"
          />
        </div>

        {/* Nodes */}
        {mockNodes.map((node) => {
          const Icon = typeIcons[node.type];
          return (
            <motion.button
              key={node.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.2 }}
              onClick={() => setSelectedNode(node)}
              className={`absolute w-4 h-4 rounded-full shadow-lg cursor-pointer z-20 ${statusColors[node.status]}`}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                boxShadow: `0 0 15px ${node.status === 'active' ? '#22c55e' : node.status === 'warning' ? '#eab308' : '#ef4444'}`,
              }}
            >
              <Icon size={10} className="absolute -top-5 left-1/2 -translate-x-1/2 text-slate-400" />
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className={`absolute inset-0 rounded-full ${statusColors[node.status]} opacity-50`}
              />
            </motion.button>
          );
        })}

        {/* Status Bar */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <Radio size={14} className={`${isScanning ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
          <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-tighter italic">
            {isScanning ? 'Propagating_Digital_Breadcrumbs...' : 'Radar_Paused'}
          </p>
        </div>

        {/* Node Count */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/10">
          <p className="text-[9px] uppercase text-slate-500 tracking-wider">Active Nodes</p>
          <p className="text-lg font-black text-cyan-400">{activeNodes}/{totalNodes}</p>
        </div>

        {/* Scan Toggle */}
        <button
          onClick={toggleScan}
          className="absolute bottom-4 right-4 p-2 bg-cyan-600/20 border border-cyan-500/30 rounded-lg hover:bg-cyan-600/30 transition-colors"
        >
          <Radio size={14} className={isScanning ? 'text-cyan-400' : 'text-slate-500'} />
        </button>
      </GlassCard>

      {/* Selected Node Info */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <GlassCard
              variant={selectedNode.status === 'critical' ? 'danger' : selectedNode.status === 'warning' ? 'warning' : 'success'}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">{selectedNode.id}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{selectedNode.type} • Signal: {selectedNode.signal}%</p>
                  <p className="text-[9px] text-slate-500">Last seen: {selectedNode.lastSeen}</p>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerts Feed */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-2">
          Recent Alerts
        </p>
        {mockAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-3 rounded-xl border flex justify-between items-center ${
              alert.type === 'critical'
                ? 'bg-red-500/10 border-red-500/20'
                : alert.type === 'warning'
                ? 'bg-yellow-500/10 border-yellow-500/20'
                : 'bg-cyan-500/10 border-cyan-500/20'
            }`}
          >
            <div className="flex gap-3 items-center">
              <AlertTriangle
                size={16}
                className={
                  alert.type === 'critical'
                    ? 'text-red-500'
                    : alert.type === 'warning'
                    ? 'text-yellow-500'
                    : 'text-cyan-400'
                }
              />
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-white tracking-tighter block">
                  {alert.node}: {alert.message}
                </span>
              </div>
            </div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest italic">
              {alert.time}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Mesh Stats */}
      <div className="grid grid-cols-3 gap-2">
        <GlassCard className="p-3 text-center">
          <p className="text-xl font-black text-cyan-400">{totalNodes}</p>
          <p className="text-[8px] uppercase text-slate-500 tracking-wider mt-1">Total Nodes</p>
        </GlassCard>
        <GlassCard className="p-3 text-center">
          <p className="text-xl font-black text-green-400">{activeNodes}</p>
          <p className="text-[8px] uppercase text-slate-500 tracking-wider mt-1">Online</p>
        </GlassCard>
        <GlassCard className="p-3 text-center">
          <p className="text-xl font-black text-yellow-400">2</p>
          <p className="text-[8px] uppercase text-slate-500 tracking-wider mt-1">Victims</p>
        </GlassCard>
      </div>
    </motion.div>
  );
});

export default MeshRadar;
