import React from 'react';

interface SkeletonCardProps {
  className?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse rounded-[12px] p-3 bg-muted/50 ${className}`}>
      <div className="aspect-square rounded-[8px] bg-muted mb-3"></div>
      <div className="space-y-2 px-1">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-3 bg-muted rounded w-1/2"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
