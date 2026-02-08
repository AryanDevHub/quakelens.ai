import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { Toast as ToastType } from '@/types';

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  success: 'bg-green-500/20 border-green-500/30 text-green-400',
  error: 'bg-red-500/20 border-red-500/30 text-red-400',
  warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
  info: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
};

const ToastItem = memo<{ toast: ToastType; onRemove: (id: string) => void }>(
  function ToastItem({ toast, onRemove }) {
    const Icon = toastIcons[toast.type];
    
    return (
      <motion.div
        initial={{ opacity: 0, x: 50, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 50, scale: 0.9 }}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl ${toastStyles[toast.type]} shadow-lg min-w-[280px] max-w-[400px]`}
      >
        <Icon size={20} className="flex-shrink-0" />
        <p className="text-sm font-medium flex-1">{toast.message}</p>
        <button 
          onClick={() => onRemove(toast.id)}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
        >
          <X size={16} />
        </button>
      </motion.div>
    );
  }
);

export const ToastContainer: React.FC<ToastContainerProps> = memo(function ToastContainer({ 
  toasts, 
  onRemove 
}) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-auto">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
});

export default ToastContainer;
