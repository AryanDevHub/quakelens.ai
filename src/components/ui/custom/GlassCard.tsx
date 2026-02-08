import React, { memo } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'danger' | 'success' | 'warning' | 'info';
  borderPosition?: 'all' | 'left' | 'right' | 'top' | 'bottom';
  onClick?: () => void;
}

const variantStyles = {
  default: 'bg-white/5 border-white/10',
  danger: 'bg-red-500/5 border-red-500/20',
  success: 'bg-green-500/5 border-green-500/20',
  warning: 'bg-yellow-500/5 border-yellow-500/20',
  info: 'bg-cyan-500/5 border-cyan-500/20',
};

const borderPositionStyles = {
  all: '',
  left: 'border-l-4 border-l-current',
  right: 'border-r-4 border-r-current',
  top: 'border-t-4 border-t-current',
  bottom: 'border-b-4 border-b-current',
};

export const GlassCard = memo<GlassCardProps>(function GlassCard({ 
  children, 
  className,
  variant = 'default',
  borderPosition = 'all',
  onClick
}) {
  return (
    <div 
      className={cn(
        'backdrop-blur-xl rounded-2xl p-4 shadow-2xl transition-all duration-300',
        variantStyles[variant],
        borderPosition !== 'all' && borderPositionStyles[borderPosition],
        onClick && 'cursor-pointer hover:bg-white/10 active:scale-[0.98]',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
});

export default GlassCard;
