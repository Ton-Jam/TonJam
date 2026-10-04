import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { MOCK_ARTISTS } from '@/constants';

interface VerifiedArtistBadgeProps {
  isVerified?: boolean;
  artistName?: string;
  artistId?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showTooltip?: boolean;
}

const TOP_VERIFIED_ARTIST_NAMES = new Set([
  'tiwa savage',
  'dj krupy',
  'neon voyager',
  'byte beat',
  'echo phase',
  'prism core',
  'smooth operator',
  'city ghost',
  'cosmic echo',
  'elena rostova',
  'cyber nomad',
  'sasha nova',
  'ton prodigy',
  'durov beats',
  'telegram sounds',
  'ton diamond records',
  'tonjam editorial',
  'tonjam curators',
  'tonjam official'
]);

export const checkIsArtistVerified = (
  nameOrId?: string, 
  explicitVerified?: boolean,
  artistList?: Array<{ uid?: string; name?: string; verified?: boolean; isVerifiedArtist?: boolean }>
): boolean => {
  if (explicitVerified === true) return true;
  if (!nameOrId) return false;

  const normalized = nameOrId.trim().toLowerCase();
  if (TOP_VERIFIED_ARTIST_NAMES.has(normalized)) return true;

  const foundInMock = MOCK_ARTISTS.find(
    (a) => a.uid.toLowerCase() === normalized || a.name.toLowerCase() === normalized
  );
  if (foundInMock && (foundInMock.verified || foundInMock.isVerifiedArtist)) {
    return true;
  }

  if (artistList) {
    const foundInList = artistList.find(
      (a) => a.uid?.toLowerCase() === normalized || a.name?.toLowerCase() === normalized
    );
    if (foundInList && (foundInList.verified || foundInList.isVerifiedArtist)) {
      return true;
    }
  }

  return false;
};

export const VerifiedArtistBadge: React.FC<VerifiedArtistBadgeProps> = ({
  isVerified,
  artistName,
  artistId,
  size = 'sm',
  className = '',
  showTooltip = true,
}) => {
  const verified = isVerified ?? checkIsArtistVerified(artistName || artistId);
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
