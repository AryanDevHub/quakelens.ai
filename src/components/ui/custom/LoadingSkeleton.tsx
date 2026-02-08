import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'pulse' | 'shimmer' | 'wave';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = memo(function LoadingSkeleton({ 
  className,
  variant = 'shimmer'
}) {
  const variants = {
    pulse: 'animate-pulse',
    shimmer: '',
    wave: '',
  };

  if (variant === 'shimmer') {
    return (
      <div className={cn('relative overflow-hidden bg-white/5 rounded-xl', className)}>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div className={cn('bg-white/5 rounded-xl', variants[variant], className)} />
  );
});

interface SkeletonCardProps {
  lines?: number;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = memo(function SkeletonCard({ 
  lines = 3,
  className 
}) {
  return (
    <div className={cn('space-y-3 p-4', className)}>
      <LoadingSkeleton className="h-4 w-3/4" />
      {Array.from({ length: lines }).map((_, i) => (
        <LoadingSkeleton key={i} className="h-3 w-full" />
      ))}
    </div>
  );
});

export default LoadingSkeleton;
