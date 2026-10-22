import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { isVerified, type UserDocument } from '@/types/user';

export interface VerifiedBadgeProps {
  user?: UserDocument | null;
  isVerified?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  user,
  isVerified: propIsVerified,
  size = 'md',
  className = '',
  title = 'Verified Artist',
}) => {
  const verified = propIsVerified !== undefined ? propIsVerified : isVerified(user);

  if (!verified) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span
      className={`inline-flex items-center justify-center text-[#0098EA] dark:text-[#2EA8FF] shrink-0 ${className}`}
      role="img"
      aria-label="Verified artist"
      title={title}
    >
      <BadgeCheck className={`${sizeClasses[size]} fill-[#0098EA]/10 text-[#0098EA] dark:fill-[#2EA8FF]/15 dark:text-[#2EA8FF]`} />
    </span>
  );
};

export default VerifiedBadge;
