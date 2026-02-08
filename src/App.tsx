import React, { useState, useCallback, Suspense, lazy, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Camera,
  Radio,
  ShieldAlert,
  Navigation,
  Map as MapIcon,
  MessageSquare,
} from 'lucide-react';
import { useToast, useNetworkStatus } from '@/hooks';
import {
  ErrorBoundary,
  ToastContainer,
  OfflineIndicator,
  StructuralPulse,
  GuardianChat,
  GlassCard,
} from '@/components';

// Lazy load heavy components
const AIVision = lazy(() => import('@/components/features/AIVision'));
const GeoMap = lazy(() => import('@/components/features/GeoMap'));
const MeshRadar = lazy(() => import('@/components/features/MeshRadar'));

// Tab configuration
const TABS = [
  { id: 'VISION', icon: Camera, label: 'Vision' },
  { id: 'PULSE', icon: Activity, label: 'Pulse' },
  { id: 'CHAT', icon: MessageSquare, label: 'Guardian' },
  { id: 'MAP', icon: MapIcon, label: 'Map' },
  { id: 'RADAR', icon: Navigation, label: 'Radar' },
] as const;

type TabId = typeof TABS[number]['id'];

// Pulse scan state types
type PulseStatus = 'IDLE' | 'SCANNING' | 'RESULT';

interface PulseState {
  status: PulseStatus;
  progress: number;
  score: number | null;
}

// Loading fallback for lazy components
const TabLoadingFallback = memo(function TabLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-80">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"
      />
    </div>
  );
});

// Tab content wrapper with animation
interface TabContentProps {
  children: React.ReactNode;
  tabId: TabId;
}

const TabContent = memo<TabContentProps>(function TabContent({ children, tabId }) {
  return (
    <motion.div
      key={tabId}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex-1 pb-24 overflow-y-auto scrollbar-hide"
    >
      <Suspense fallback={<TabLoadingFallback />}>
        {children}
      </Suspense>
    </motion.div>
  );
});

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('PULSE');
  const [pulseState, setPulseState] = useState<PulseState>({
    status: 'IDLE',
    progress: 0,
    score: null,
  });

  const { toasts, addToast, removeToast } = useToast();
  const { isOnline, isOffline, wasOffline } = useNetworkStatus();

  // Handle pulse scan
  const startPulseScan = useCallback(() => {
    setPulseState({ status: 'SCANNING', progress: 0, score: null });

    const interval = setInterval(() => {
      setPulseState((prev) => {
        if (prev.progress >= 100) {
          clearInterval(interval);
          const score = Math.floor(Math.random() * 45) + 35;
          
          // Show toast based on score
          if (score < 50) {
            addToast('CRITICAL: Structural integrity compromised!', 'error');
          } else if (score < 75) {
            addToast('WARNING: Moderate structural damage detected', 'warning');
          } else {
            addToast('Building structure is stable', 'success');
          }
          
          return { status: 'RESULT', progress: 100, score };
        }
        return { ...prev, progress: prev.progress + 5 };
      });
    }, 100);
  }, [addToast]);

  // Handle tab change
  const handleTabChange = useCallback((tabId: TabId) => {
    setActiveTab(tabId);
    
    // Show info toast for certain tabs
    if (tabId === 'VISION') {
      addToast('Camera access requires HTTPS connection', 'info');
    } else if (tabId === 'MAP') {
      addToast('Tap "Load Map" to view satellite imagery', 'info');
    }
  }, [addToast]);

  // Render active tab content
  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case 'VISION':
        return (
          <TabContent tabId="VISION">
            <AIVision />
          </TabContent>
        );
      case 'PULSE':
        return (
          <TabContent tabId="PULSE">
            <StructuralPulse
              status={pulseState.status}
              progress={pulseState.progress}
              score={pulseState.score}
              onStartScan={startPulseScan}
            />
          </TabContent>
        );
      case 'CHAT':
        return (
          <TabContent tabId="CHAT">
            <GuardianChat onToast={addToast} />
          </TabContent>
        );
      case 'MAP':
        return (
          <TabContent tabId="MAP">
            <GeoMap onToast={addToast} />
          </TabContent>
        );
      case 'RADAR':
        return (
          <TabContent tabId="RADAR">
            <MeshRadar onToast={addToast} />
          </TabContent>
        );
      default:
        return null;
    }
  }, [activeTab, pulseState, startPulseScan, addToast]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#050507] text-slate-200 p-5 flex flex-col font-sans max-w-md mx-auto relative border-x border-white/5 shadow-2xl overflow-hidden selection:bg-cyan-500/30">
        {/* Offline Indicator */}
        <OfflineIndicator isOffline={isOffline} wasOffline={wasOffline} />

        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />

        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <div className="z-10 text-left">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-black tracking-tighter italic flex items-center gap-2 uppercase"
            >
              <ShieldAlert className="text-cyan-400 shadow-cyan-500/20" size={26} />
              QUAKELENS
            </motion.h1>
            <div className="flex items-center gap-2 mt-1">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_green]"
              />
              <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-slate-500 tracking-tighter">
                Tactical_Hub_Active // {isOnline ? 'Online_Mesh' : 'Offline_Mesh'}
              </p>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-cyan-500/10 p-2 rounded-xl border border-cyan-500/20"
          >
            <Radio size={20} className="text-cyan-400 animate-pulse" />
          </motion.div>
        </header>

        {/* Connection Status Card (shown when offline) */}
        <AnimatePresence>
          {isOffline && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <GlassCard variant="warning" className="py-2 px-3">
                <p className="text-[10px] text-yellow-400 uppercase tracking-wider font-bold text-center">
                  ⚠️ Operating in Offline Mode - Local Protocols Active
                </p>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {renderTabContent()}
        </AnimatePresence>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-4 left-4 right-4 max-w-[380px] mx-auto bg-slate-950/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-2 flex justify-between shadow-2xl z-[5000]">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 flex flex-col items-center py-2 transition-all duration-300 rounded-[2rem] ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-400/10 shadow-[inset_0_0_10px_rgba(34,211,238,0.1)]'
                    : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                <motion.div
                  animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon size={18} />
                </motion.div>
                <span className="text-[7px] font-black uppercase mt-1 tracking-[0.15em] font-mono tracking-tighter">
                  {tab.label}
                </span>
                
                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="w-1 h-1 rounded-full bg-cyan-400 mt-1"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Version Badge */}
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 text-[8px] text-slate-600 uppercase tracking-widest">
          v2.0 • Refactored
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
