import React from 'react';

interface SkeletonCardProps {
  className?: string;
  variant?: 'default' | 'row' | 'compact';
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '', variant = 'default' }) => {
  if (variant === 'compact') {
    return (
      <div className={`animate-pulse flex items-center gap-3 p-2 rounded-[4px] bg-muted/20 w-full ${className}`}>
        <div className="w-10 h-10 rounded-[4px] bg-muted flex-shrink-0"></div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="h-2.5 bg-muted rounded-[4px] w-3/4"></div>
          <div className="h-2 bg-muted rounded-[4px] w-1/2"></div>
        </div>
      </div>
    );
  }

  if (variant === 'row') {
    return (
      <div className={`animate-pulse flex items-center gap-2 p-2 rounded-[4px] bg-muted/50 glass w-full ${className}`}>
        <div className="w-12 h-12 rounded-[4px] bg-muted flex-shrink-0"></div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-3 bg-muted rounded-[4px] w-1/2"></div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-muted"></div>
            <div className="h-2 bg-muted rounded-[4px] w-1/4"></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-12 h-4 bg-muted rounded-[4px]"></div>
           <div className="w-8 h-8 rounded-full bg-muted"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`animate-pulse rounded-[4px] p-3 bg-muted/50 border border-border/50 ${className}`}>
      <div className="aspect-square rounded-[4px] bg-muted mb-3"></div>
      <div className="space-y-3 px-1">
        <div className="flex justify-between items-start">
          <div className="h-4 bg-muted rounded-[4px] w-3/4"></div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-4 h-4 rounded-full bg-muted"></div>
          <div className="h-3 bg-muted rounded-[4px] w-1/2"></div>
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="w-16 h-4 bg-muted rounded-[4px]"></div>
          <div className="w-16 h-8 rounded-full bg-muted"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
