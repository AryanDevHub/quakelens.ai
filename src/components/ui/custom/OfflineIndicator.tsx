import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';

interface OfflineIndicatorProps {
  isOffline: boolean;
  wasOffline: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = memo(function OfflineIndicator({ 
  isOffline, 
  wasOffline 
}) {
  return (
    <AnimatePresence mode="wait">
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 z-[9998] bg-red-500/90 backdrop-blur-md text-white py-2 px-4 flex items-center justify-center gap-2"
        >
          <WifiOff size={16} className="animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest">
            Offline Mode - Using Local Emergency Protocols
          </span>
        </motion.div>
      )}
      {!isOffline && wasOffline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ delay: 0.5 }}
          className="fixed top-0 left-0 right-0 z-[9998] bg-green-500/90 backdrop-blur-md text-white py-2 px-4 flex items-center justify-center gap-2"
        >
          <Wifi size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">
            Back Online - Cloud Services Restored
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default OfflineIndicator;
