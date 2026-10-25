import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { isVerified as checkIsVerified, UserDocument } from '@/types/user';
import { cn } from '@/lib/utils';

export interface VerifiedBadgeProps {
  user?: Partial<UserDocument> | null;
  isVerified?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  user,
  isVerified: isVerifiedProp,
  size = 'md',
  className
}) => {
  const verified = isVerifiedProp !== undefined ? isVerifiedProp : checkIsVerified(user);

  if (!verified) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span 
      className={cn("inline-flex items-center justify-center shrink-0 select-none", className)}
      role="img"
      aria-label="Verified artist"
      title="Verified artist"
    >
      <BadgeCheck 
        className={cn(
          "text-[#00B4D8] fill-[#00B4D8]/20 transition-transform", 
          sizeClasses[size] || sizeClasses.md
        )} 
      />
    </span>
  );
};

export default VerifiedBadge;
