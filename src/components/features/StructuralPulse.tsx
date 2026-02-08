import React, { useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Zap, Activity, Volume2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/custom';
import type { PulseStatus } from '@/types';

interface StructuralPulseProps {
  status: PulseStatus;
  progress: number;
  score: number | null;
  onStartScan: () => void;
}

const getScoreColor = (score: number): { border: string; bg: string; text: string; glow: string } => {
  if (score < 40) return {
    border: 'border-red-500',
    bg: 'bg-red-500/20',
    text: 'text-red-500',
    glow: 'shadow-red-500/20'
  };
  if (score < 60) return {
    border: 'border-yellow-500',
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-500',
    glow: 'shadow-yellow-500/20'
  };
  if (score < 80) return {
    border: 'border-cyan-500',
    bg: 'bg-cyan-500/20',
    text: 'text-cyan-500',
    glow: 'shadow-cyan-500/20'
  };
  return {
    border: 'border-green-500',
    bg: 'bg-green-500/20',
    text: 'text-green-500',
    glow: 'shadow-green-500/20'
  };
};

const getScoreLabel = (score: number): string => {
  if (score < 40) return 'CRITICAL - EVACUATE';
  if (score < 60) return 'UNSTABLE - CAUTION';
  if (score < 80) return 'MODERATE - MONITOR';
  return 'STABLE - SECURE';
};

export const StructuralPulse: React.FC<StructuralPulseProps> = memo(function StructuralPulse({
  status,
  progress,
  score,
  onStartScan,
}) {
  const scoreColors = useMemo(() => {
    if (score === null) return null;
    return getScoreColor(score);
  }, [score]);

  const handleScan = useCallback(() => {
    if (status === 'RESULT') {
      // Reset and start new scan
      onStartScan();
    } else {
      onStartScan();
    }
  }, [status, onStartScan]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center space-y-6"
    >
      {/* Main Pulse Circle */}
      <div className="relative w-full h-80 flex items-center justify-center">
        {/* Background Rings */}
        <AnimatePresence>
          {status === 'SCANNING' && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute flex items-center justify-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-64 h-64 border border-cyan-500/30 rounded-full absolute"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                  className="w-64 h-64 border-t-2 border-cyan-400 rounded-full absolute"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
                  className="w-56 h-56 border-b-2 border-cyan-500/50 rounded-full absolute"
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Interactive Circle */}
        <motion.button
          onClick={handleScan}
          disabled={status === 'SCANNING'}
          whileHover={status === 'IDLE' ? { scale: 1.05 } : {}}
          whileTap={status === 'IDLE' ? { scale: 0.95 } : {}}
          className={`w-56 h-56 rounded-full border-2 flex flex-col items-center justify-center z-10 transition-all duration-700 shadow-2xl ${
            status === 'RESULT' && scoreColors
              ? `${scoreColors.border} ${scoreColors.bg} ${scoreColors.glow}`
              : 'border-cyan-500/20 bg-white/5 hover:border-cyan-500/40 hover:bg-white/10'
          } ${status === 'SCANNING' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {status === 'IDLE' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Zap className="text-cyan-400 mb-3" size={40} />
              </motion.div>
              <span className="text-xs uppercase font-black tracking-[0.3em] text-slate-300">
                Start Pulse
              </span>
              <span className="text-[9px] text-slate-500 mt-2 uppercase tracking-wider">
                Tap to Analyze
              </span>
            </motion.div>
          )}

          {status === 'SCANNING' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <span className="text-6xl font-black text-white">{progress}%</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-cyan-400 font-bold mt-2">
                FFT Analysis
              </span>
              <div className="flex gap-1 mt-3">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [8, 24, 8] }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      delay: i * 0.2,
                    }}
                    className="w-1.5 bg-cyan-400 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {status === 'RESULT' && score !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <span className={`text-7xl font-black ${scoreColors?.text}`}>
                {score}%
              </span>
              <span className="text-[10px] uppercase tracking-widest opacity-60 font-bold mt-2">
                Stability Index
              </span>
              <span className={`text-[9px] uppercase tracking-wider mt-2 font-bold ${scoreColors?.text}`}>
                {getScoreLabel(score)}
              </span>
            </motion.div>
          )}
        </motion.button>

        {/* Decorative Elements */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[9px] font-mono text-slate-500 uppercase tracking-tighter">
          <Activity size={12} className={status === 'SCANNING' ? 'text-cyan-400 animate-pulse' : ''} />
          {status === 'IDLE' && 'Ready for Analysis'}
          {status === 'SCANNING' && 'Processing Vibration Data...'}
          {status === 'RESULT' && 'Analysis Complete'}
        </div>
      </div>

      {/* Sensor Data Cards */}
      <div className="w-full grid grid-cols-2 gap-3">
        <GlassCard className="flex flex-col items-center p-4 hover:bg-white/10 transition-colors">
          <p className="text-[8px] uppercase text-slate-500 mb-2 font-bold tracking-widest">
            Floor Level (Baro)
          </p>
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-cyan-400" />
            <p className="font-mono text-lg text-white tracking-widest uppercase">
              Level_04
            </p>
          </div>
          <p className="text-[8px] text-slate-600 mt-1">Pressure: 1013.25 hPa</p>
        </GlassCard>

        <GlassCard className="flex flex-col items-center p-4 hover:bg-white/10 transition-colors">
          <p className="text-[8px] uppercase text-slate-500 mb-2 font-bold tracking-widest">
            Acoustic Sonar
          </p>
          <div className="flex items-center gap-2">
            <Volume2 size={14} className={status === 'SCANNING' ? 'text-cyan-400 animate-pulse' : 'text-green-400'} />
            <p className={`font-mono text-lg ${status === 'SCANNING' ? 'text-cyan-400' : 'text-green-400'}`}>
              {status === 'SCANNING' ? 'SCANNING' : 'NOMINAL'}
            </p>
          </div>
          <p className="text-[8px] text-slate-600 mt-1">Freq: 20-20k Hz</p>
        </GlassCard>
      </div>

      {/* Additional Info */}
      {status === 'RESULT' && score !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <GlassCard variant={score < 60 ? 'danger' : score < 80 ? 'warning' : 'success'}>
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-bold tracking-wider">
                Analysis Summary
              </p>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="text-slate-400">
                  <span className="text-slate-500">Vibration:</span> {score < 50 ? 'High Amplitude' : score < 75 ? 'Moderate' : 'Low'}
                </div>
                <div className="text-slate-400">
                  <span className="text-slate-500">Resonance:</span> {score < 50 ? 'Critical' : score < 75 ? 'Elevated' : 'Normal'}
                </div>
                <div className="text-slate-400">
                  <span className="text-slate-500">Frequency:</span> {score < 50 ? '2.4 Hz' : score < 75 ? '1.8 Hz' : '0.9 Hz'}
                </div>
                <div className="text-slate-400">
                  <span className="text-slate-500">Duration:</span> 3.2s
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
});

// Need to import AnimatePresence
import { AnimatePresence } from 'framer-motion';

export default StructuralPulse;
