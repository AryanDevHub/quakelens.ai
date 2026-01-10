import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Camera, Radio, ShieldAlert, Navigation, Zap, AlertTriangle, Layers, Map as MapIcon, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';

// --- SHARED UI COMPONENTS ---
const GlassCard = ({ children, className }) => (
  <div className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 ${className}`}>
    {children}
  </div>
);

// --- MOCK DATA FOR INDIA (New Delhi Triage) ---
const mockDisasterData = [
  { id: 1, pos: [28.6139, 77.2090], risk: 'HIGH', score: 32, label: "Connaught Place Sector" },
  { id: 2, pos: [28.6239, 77.2190], risk: 'MEDIUM', score: 58, label: "Government District" },
  { id: 3, pos: [28.6039, 77.1990], risk: 'SAFE', score: 89, label: "South Delhi Hub" },
];

// --- MODULE 1: AI VISION (LIVE CAMERA FEED) ---
const AIVision = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const videoRef = useRef(null);

  // Initialize Live Camera
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    }
    startCamera();
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startAIScan = () => {
    setIsProcessing(true);
    setShowResults(false);
    setTimeout(() => {
      setIsProcessing(false);
      setShowResults(true);
    }, 3000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="relative w-full h-80 bg-black rounded-3xl border-2 border-cyan-500/30 overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.2)]">
        
        {/* LIVE CAMERA FEED */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />

        {/* Scanning Line Animation */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div 
              initial={{ top: '-5%' }}
              animate={{ top: '105%' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_20px_cyan] z-20"
            />
          )}
        </AnimatePresence>

        {/* AI Detection Boxes (Mock Overlay) */}
        {showResults && (
          <div className="absolute inset-0 z-10 p-6 text-white uppercase font-black tracking-tighter">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute top-20 left-10 border-2 border-red-500 w-24 h-24 rounded-sm shadow-[0_0_10px_red]">
              <span className="absolute -top-5 left-0 bg-red-500 text-[8px] px-1">Shear_Crack: 0.94</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="absolute bottom-16 right-12 border-2 border-yellow-500 w-32 h-16 rounded-sm shadow-[0_0_10px_yellow]">
              <span className="absolute -top-5 left-0 bg-yellow-500 text-[8px] px-1">Spalling: 0.78</span>
            </motion.div>
          </div>
        )}
        <div className="absolute top-4 left-4 p-2 bg-black/60 rounded backdrop-blur-md text-[8px] font-mono text-cyan-400 border border-cyan-500/30">AI_ENGINE: LIVE_STREAM // EDGE_V4.2</div>
      </div>
      <button onClick={startAIScan} disabled={isProcessing} className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${isProcessing ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-cyan-600 text-white shadow-[0_0_25px_rgba(6,182,212,0.4)] active:scale-95'}`}>
        {isProcessing ? 'Analyzing Frame...' : <><Camera size={20}/> Start AI Vision Scan</>}
      </button>
    </motion.div>
  );
};

// --- MODULE 2: STRUCTURAL PULSE (VIBRATION ANALYSIS) ---
const StructuralPulse = ({ status, progress, score, startScan }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
    <div className="relative w-full h-80 flex items-center justify-center">
       <AnimatePresence>
          {status === 'SCANNING' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute flex items-center justify-center">
              <div className="w-64 h-64 border border-cyan-500/30 rounded-full animate-ping absolute" />
              <div className="w-64 h-64 border-t-2 border-cyan-400 rounded-full animate-spin absolute" />
            </motion.div>
          )}
       </AnimatePresence>
       <motion.div onClick={startScan} className={`w-56 h-56 rounded-full border-2 flex flex-col items-center justify-center z-10 transition-all duration-700 shadow-2xl ${status === 'RESULT' ? (score < 60 ? 'border-red-500 bg-red-500/20 shadow-red-500/20' : 'border-green-500 bg-green-500/20 shadow-green-500/20') : 'border-cyan-500/20 bg-white/5'}`}>
          {status === 'IDLE' && <><Zap className="text-cyan-400 mb-2 animate-pulse" size={32} /><span className="text-xs uppercase font-black tracking-widest">Start Pulse</span></>}
          {status === 'SCANNING' && <><span className="text-5xl font-black">{progress}%</span><span className="text-[10px] uppercase tracking-[0.3em] text-cyan-400">FFT Processing</span></>}
          {status === 'RESULT' && <><span className={`text-6xl font-black ${score < 60 ? 'text-red-500' : 'text-green-500'}`}>{score}%</span><span className="text-[10px] uppercase tracking-widest opacity-60">Stability</span></>}
       </motion.div>
    </div>
    <div className="w-full grid grid-cols-2 gap-3 mt-2">
        <GlassCard className="flex flex-col items-center"><p className="text-[8px] uppercase text-slate-500 mb-1 tracking-widest">Fundamental Freq</p><p className="font-mono text-xl">{status === 'SCANNING' ? (Math.random()*5).toFixed(2) : '2.42'}Hz</p></GlassCard>
        <GlassCard className="flex flex-col items-center"><p className="text-[8px] uppercase text-slate-500 mb-1 tracking-widest">Modal Peak</p><p className="font-mono text-xl text-cyan-400">0.02mm</p></GlassCard>
    </div>
  </motion.div>
);

// --- MODULE 3: GEO-TRIAGE MAP (Indian Satellite Triage) ---
const GeoMap = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full space-y-4">
    <div className="h-[400px] w-full rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl bg-[#0a0a0c]">
      
      {/* Dark Filtered Satellite View */}
      <div className="absolute inset-0 grayscale-[0.2] brightness-[0.4] contrast-[1.2]">
        <MapContainer center={[28.6139, 77.2090]} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          {mockDisasterData.map(point => (
            <Circle key={point.id} center={point.pos} radius={600} pathOptions={{ 
              color: 'white', weight: 2,
              fillColor: point.risk === 'HIGH' ? '#ff3131' : point.risk === 'MEDIUM' ? '#f59e0b' : '#39ff14', 
              fillOpacity: 0.8, 
            }}>
              <Popup>
                <div className="text-xs p-1">
                  <p className="font-bold">{point.label}</p>
                  <p className="text-[9px] uppercase tracking-tighter">Status: {point.risk}</p>
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>

      <div className="absolute top-4 right-4 z-[1000] bg-black/80 backdrop-blur-xl p-3 rounded-2xl border border-white/20 text-[9px] uppercase font-black tracking-widest space-y-2">
        <div className="flex items-center gap-2 text-red-500"><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_red] border border-white" /> High Risk</div>
        <div className="flex items-center gap-2 text-[#39ff14]"><div className="w-2 h-2 rounded-full bg-[#39ff14] shadow-[0_0_10px_#39ff14] border border-white" /> Safe Hub</div>
      </div>
    </div>
    <GlassCard className="flex items-center gap-4 border-l-4 border-cyan-500 bg-cyan-500/5">
      <AlertCircle className="text-cyan-500" />
      <div><p className="text-[10px] uppercase font-black text-slate-400">UAV Triangulation</p><p className="text-[11px] text-slate-300 italic">Regional integrity heatmap synthesized via drone swarm data.</p></div>
    </GlassCard>
  </motion.div>
);

// --- MODULE 4: MESH RADAR ---
const MeshRadar = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
    <GlassCard className="relative h-72 overflow-hidden flex items-center justify-center bg-black/40">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#06b6d4 1px, transparent 0)', backgroundSize: '20px 20px' }} />
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="absolute w-[150%] h-[150%] border-r border-cyan-500/20 rounded-full bg-gradient-to-r from-cyan-500/10 to-transparent origin-center" />
      <div className="relative w-full h-full">
        <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_15px_green]" />
        <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-red-600 rounded-full shadow-[0_0_20px_red]" />
        <div className="absolute bottom-1/4 left-1/2 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_15px_green]" />
      </div>
      <div className="absolute bottom-4 left-4 flex items-center gap-2"><Radio size={14} className="text-cyan-400 animate-pulse" /><p className="text-[10px] font-mono text-cyan-400 uppercase tracking-tighter">Nodes: 03 Connected (Offline Mesh)</p></div>
    </GlassCard>
    <div className="space-y-2">
       <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/30 flex justify-between items-center">
          <div className="flex gap-3 items-center"><AlertTriangle size={16} className="text-red-500" /><span className="text-[11px] font-mono font-bold uppercase tracking-widest text-white tracking-tighter">Node_778X: Crit_Damage</span></div>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">2m ago</span>
       </div>
    </div>
  </motion.div>
);

// --- MAIN APP SHELL ---
export default function QuakeLens() {
  const [activeTab, setActiveTab] = useState('PULSE'); 
  const [status, setStatus] = useState('IDLE');
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(null);

  const startScan = () => {
    setStatus('SCANNING');
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); setStatus('RESULT'); setScore(Math.floor(Math.random() * 45) + 35); return 100; }
        return p + 4;
      });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#050507] text-slate-200 p-5 flex flex-col font-sans max-w-md mx-auto relative border-x border-white/5 shadow-2xl overflow-hidden">
      
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tighter italic flex items-center gap-2 uppercase">
            <ShieldAlert className="text-cyan-400" size={26} /> QUAKELENS
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-slate-500 underline underline-offset-4 decoration-cyan-500/50">Tactical Hub Active</p>
          </div>
        </div>
        <Radio size={20} className="text-cyan-400" />
      </header>

      <div className="flex-1 pb-24 overflow-y-auto scrollbar-hide">
        {activeTab === 'VISION' && <AIVision />}
        {activeTab === 'PULSE' && <StructuralPulse status={status} progress={progress} score={score} startScan={startScan} />}
        {activeTab === 'MAP' && <GeoMap />}
        {activeTab === 'RADAR' && <MeshRadar />}
      </div>

      <nav className="fixed bottom-6 left-6 right-6 max-w-[380px] mx-auto bg-slate-950/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-2 flex justify-between shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-[5000]">
        {[
          { id: 'VISION', icon: Camera, label: 'Vision' },
          { id: 'PULSE', icon: Activity, label: 'Pulse' },
          { id: 'MAP', icon: MapIcon, label: 'Map' },
          { id: 'RADAR', icon: Navigation, label: 'Radar' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center py-3 transition-all duration-300 rounded-[2rem] ${activeTab === tab.id ? 'text-cyan-400 bg-cyan-400/10 shadow-[inset_0_0_10px_rgba(34,211,238,0.1)]' : 'text-slate-600'}`}
          >
            <tab.icon size={22} className={activeTab === tab.id ? "scale-110" : ""} />
            <span className="text-[8px] font-black uppercase mt-1 tracking-[0.15em]">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}