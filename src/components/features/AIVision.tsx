import React, { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Camera, Scan, CheckCircle, RefreshCcw } from 'lucide-react';
import { useCamera } from '@/hooks';
import { GlassCard } from '@/components/ui/custom';
import type { DetectionResult } from '@/types';

const mockDetections: DetectionResult[] = [
  { label: 'Shear_Crack', confidence: 0.94, bbox: { x: 15, y: 25, width: 30, height: 30 } },
  { label: 'Spalling', confidence: 0.82, bbox: { x: 55, y: 50, width: 25, height: 20 } },
];

interface DetectionBoxProps {
  detection: DetectionResult;
  index: number;
}

const DetectionBox = memo<DetectionBoxProps>(function DetectionBox({ detection, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.2 }}
      className="absolute border-2 border-red-500 rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.6)] z-30"
      style={{
        left: `${detection.bbox.x}%`,
        top: `${detection.bbox.y}%`,
        width: `${detection.bbox.width}%`,
        height: `${detection.bbox.height}%`,
      }}
    >
      <div className="absolute -top-6 left-0 bg-red-500 text-[9px] px-2 py-0.5 font-black text-white uppercase tracking-tighter rounded-t-md whitespace-nowrap shadow-lg">
        {detection.label.replace('_', ' ')}: {(detection.confidence * 100).toFixed(0)}%
      </div>
    </motion.div>
  );
});

export const AIVision: React.FC = memo(function AIVision() {
  const { videoRef, isActive, error, startCamera, stopCamera } = useCamera();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const startAIScan = useCallback(() => {
    setIsProcessing(true);
    setShowResults(false);
    
    setTimeout(() => {
      setIsProcessing(false);
      setShowResults(true);
    }, 3000);
  }, []);

  const handleReset = useCallback(() => {
    setShowResults(false);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Visual Header */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <Scan size={14} className="text-cyan-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Optical Triage</span>
        </div>
        {isActive && (
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_red]" />
              <span className="text-[9px] font-mono text-red-500 font-bold uppercase">Live_NPU_Link</span>
           </div>
        )}
      </div>

      {/* Main Container */}
      <div className="relative w-full h-80 bg-black rounded-[2.5rem] border-2 border-white/10 overflow-hidden shadow-2xl">
        
        {/* State 1: Error */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-900 z-50">
            <AlertTriangle className="text-red-500 mb-4" size={48} />
            <p className="text-xs text-white font-mono uppercase tracking-tighter mb-4">{error}</p>
            <button onClick={startCamera} className="px-6 py-2 bg-red-500/20 border border-red-500/50 rounded-xl text-red-500 text-[10px] font-bold uppercase tracking-widest">Retry Hardware Auth</button>
          </div>
        )}

        {/* State 2: Idle (No Camera) */}
        {!isActive && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10 transition-colors">
            <Camera className="text-cyan-500 mb-4 opacity-20" size={64} />
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mb-6">Camera_Stream_Offline</p>
            <button
              onClick={startCamera}
              className="px-8 py-3 bg-cyan-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-cyan-500 active:scale-95 transition-all shadow-lg shadow-cyan-900/40"
            >
              Enable Live Feed
            </button>
          </div>
        )}

        {/* State 3: Active Camera Feed */}
        {isActive && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover opacity-80 z-0 scale-x-[-1]" // scale-x-[-1] for mirror effect if using front cam
          />
        )}
        
        {/* Overlay: Scanning Animation */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ top: '-5%' }}
              animate={{ top: '105%' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_30px_cyan] z-40"
            />
          )}
        </AnimatePresence>

        {/* Overlay: AI Detections */}
        <AnimatePresence>
          {showResults && !isProcessing && (
            <div className="absolute inset-0 z-30">
              {mockDetections.map((d, i) => <DetectionBox key={i} detection={d} index={i} />)}
            </div>
          )}
        </AnimatePresence>

        {/* Tactical Badges */}
        <div className="absolute top-4 left-4 p-2 bg-black/60 rounded-lg backdrop-blur-md text-[8px] font-mono text-cyan-400 border border-cyan-500/30 z-50 uppercase tracking-widest">
          Engine: YOLOv4.2 // Quantized_INT8
        </div>
      </div>

      {/* Action Interface */}
      <div className="flex gap-2">
        {isActive ? (
          <>
            <button
              onClick={showResults ? handleReset : startAIScan}
              disabled={isProcessing}
              className="flex-1 py-4 rounded-3xl font-black uppercase tracking-[0.2em] bg-cyan-600 text-white shadow-xl shadow-cyan-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? <RefreshCcw className="animate-spin" size={18} /> : <Scan size={18} />}
              {isProcessing ? 'Analyzing...' : showResults ? 'Reset Scan' : 'Run AI Analysis'}
            </button>
            <button 
              onClick={stopCamera}
              className="p-4 bg-slate-800 rounded-3xl text-slate-400 hover:text-white transition-colors border border-white/5 shadow-xl"
            >
              <Camera size={20} />
            </button>
          </>
        ) : (
          <GlassCard className="w-full py-4 text-center opacity-40">
             <span className="text-[10px] font-black uppercase tracking-widest italic">Awaiting Hardware Activation</span>
          </GlassCard>
        )}
      </div>

      {/* Result Card */}
      <AnimatePresence>
        {showResults && !isProcessing && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <GlassCard variant="danger" borderPosition="left" className="p-5 border-l-red-500">
               <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="text-red-500" size={18} />
                  <p className="text-xs font-black text-red-500 uppercase tracking-widest leading-none">Structural Anomaly Logged</p>
               </div>
               <p className="text-[11px] text-slate-300 leading-relaxed italic">
                 The Vision Engine has identified 45° Shear Cracking and Concrete Spalling. Structural Integrity Score has been downgraded to 38%. Evacuation is highly recommended.
               </p>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default AIVision;