import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';

interface VerifiedArtistBadgeProps {
  isVerified?: boolean;
  artistName?: string;
  artistId?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showTooltip?: boolean;
}

export const checkIsArtistVerified = (
  nameOrId?: string, 
  explicitVerified?: boolean,
  artistList?: Array<{ uid?: string; name?: string; verified?: boolean; isVerifiedArtist?: boolean }>
): boolean => {
  if (explicitVerified === true) return true;
  if (!nameOrId || !artistList || artistList.length === 0) return false;

  const normalized = nameOrId.trim().toLowerCase();
  const foundInList = artistList.find(
    (a) => a.uid?.toLowerCase() === normalized || a.name?.toLowerCase() === normalized
  );
  return Boolean(foundInList && (foundInList.verified || foundInList.isVerifiedArtist));
};

export const VerifiedArtistBadge: React.FC<VerifiedArtistBadgeProps> = ({
  isVerified,
  artistName,
  artistId,
  size = 'sm',
  className = '',
  showTooltip = true,
}) => {
  const { artists } = useAudio();
  const verified = isVerified ?? checkIsArtistVerified(artistId || artistName, isVerified, artists);
  if (!verified) return null;

  const sizeMap = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span
      className={`inline-flex items-center align-middle shrink-0 text-[#0088CC] select-none ${className}`}
      title={showTooltip ? `Verified Artist on TON${artistName ? ` (${artistName})` : ''}` : undefined}
      aria-label="Verified Artist"
    >
      <BadgeCheck className={`${sizeMap[size]} fill-[#0088CC]/20 text-[#0088CC] drop-shadow-[0_0_6px_rgba(0,136,204,0.4)]`} />
    </span>
  );
};

export default VerifiedArtistBadge;
