import React, { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Camera, Scan, CheckCircle } from 'lucide-react';
import { useCamera } from '@/hooks';
import { GlassCard } from '@/components/ui/custom';
import type { DetectionResult } from '@/types';

// Mock detection results for demo
const mockDetections: DetectionResult[] = [
  { label: 'Shear_Crack', confidence: 0.94, bbox: { x: 10, y: 20, width: 24, height: 24 } },
  { label: 'Facade_Damage', confidence: 0.87, bbox: { x: 60, y: 40, width: 20, height: 20 } },
  { label: 'Column_Failure', confidence: 0.91, bbox: { x: 30, y: 60, width: 18, height: 18 } },
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
      transition={{ delay: index * 0.15 }}
      className="absolute border-2 border-red-500 rounded-sm shadow-[0_0_15px_rgba(239,68,68,0.5)]"
      style={{
        left: `${detection.bbox.x}%`,
        top: `${detection.bbox.y}%`,
        width: `${detection.bbox.width}%`,
        height: `${detection.bbox.height}%`,
      }}
    >
      <span className="absolute -top-6 left-0 bg-red-500 text-[8px] px-2 py-1 font-bold text-white uppercase tracking-tighter rounded whitespace-nowrap">
        {detection.label}: {(detection.confidence * 100).toFixed(0)}%
      </span>
    </motion.div>
  );
});

export const AIVision: React.FC = memo(function AIVision() {
  const { videoRef, isActive, error, startCamera } = useCamera();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [detections, setDetections] = useState<DetectionResult[]>([]);

  const startAIScan = useCallback(() => {
    setIsProcessing(true);
    setShowResults(false);
    
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowResults(true);
      setDetections(mockDetections);
    }, 3000);
  }, []);

  const resetScan = useCallback(() => {
    setShowResults(false);
    setDetections([]);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Camera Feed Container */}
      <div className="relative w-full h-80 bg-black rounded-3xl border-2 border-cyan-500/30 overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.2)]">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900 font-mono">
            <AlertTriangle className="text-yellow-500 mb-4" size={48} />
            <p className="text-sm text-slate-300 mb-2 uppercase tracking-wider">Camera Access Error</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter italic max-w-[250px]">
              {error}
            </p>
            <button
              onClick={startCamera}
              className="mt-4 px-4 py-2 bg-cyan-600/20 border border-cyan-500/30 rounded-lg text-cyan-400 text-xs uppercase tracking-wider hover:bg-cyan-600/30 transition-colors"
            >
              Retry Camera
            </button>
          </div>
        ) : !isActive ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900">
            <Camera className="text-cyan-500 mb-4" size={48} />
            <p className="text-sm text-slate-300 mb-4 uppercase tracking-wider">Camera Preview</p>
            <button
              onClick={startCamera}
              className="px-6 py-3 bg-cyan-600 text-white rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-cyan-500 transition-colors active:scale-95"
            >
              Start Camera
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover opacity-70"
            />
            
            {/* Scanning Animation */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ top: '-5%' }}
                  animate={{ top: '105%' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_20px_cyan] z-20"
                />
              )}
            </AnimatePresence>

            {/* Detection Results */}
            <AnimatePresence>
              {showResults && (
                <div className="absolute inset-0 z-10 p-6">
                  {detections.map((detection, index) => (
                    <DetectionBox key={detection.label} detection={detection} index={index} />
                  ))}
                </div>
              )}
            </AnimatePresence>

            {/* AI Engine Badge */}
            <div className="absolute top-4 left-4 p-2 bg-black/60 rounded-lg backdrop-blur-md text-[8px] font-mono text-cyan-400 border border-cyan-500/30 uppercase tracking-widest">
              AI_ENGINE: YOLOv8_SEG // NPU_ACTIVE
            </div>

            {/* Detection Count */}
            {showResults && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-4 right-4 p-2 bg-red-500/80 rounded-lg backdrop-blur-md text-[10px] font-bold text-white border border-red-500/50"
              >
                {detections.length} Issues Detected
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {showResults ? (
          <button
            onClick={resetScan}
            className="flex-1 py-4 rounded-2xl font-black uppercase tracking-[0.2em] bg-slate-700 text-white hover:bg-slate-600 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Scan size={18} />
            New Scan
          </button>
        ) : (
          <button
            onClick={startAIScan}
            disabled={isProcessing || !isActive}
            className="flex-1 py-4 rounded-2xl font-black uppercase tracking-[0.2em] bg-cyan-600 text-white shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  <Scan size={18} />
                </motion.div>
                SCANNING...
              </>
            ) : (
              <>
                <Camera size={18} />
                INITIATE SCAN
              </>
            )}
          </button>
        )}
      </div>

      {/* Results Summary */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassCard variant="danger" borderPosition="left">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-400">
                    Structural Damage Detected
                  </p>
                  <ul className="space-y-1">
                    {detections.map((d) => (
                      <li key={d.label} className="text-[11px] text-slate-300 flex items-center gap-2">
                        <CheckCircle size={12} className="text-red-500" />
                        {d.label.replace(/_/g, ' ')} ({(d.confidence * 100).toFixed(0)}% confidence)
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-slate-500 italic mt-2">
                    Recommend immediate evacuation and professional structural assessment.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default AIVision;
