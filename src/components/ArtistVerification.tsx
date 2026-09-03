import React from 'react';
import { Artist } from '@/types';
import { AutomatedArtistVerification } from './AutomatedArtistVerification';

interface ArtistVerificationProps {
  artist: Artist;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ArtistVerification: React.FC<ArtistVerificationProps> = ({ 
  artist, 
  size = 'md',
  showLabel = true 
}) => {
  return (
    <AutomatedArtistVerification
      artist={artist}
      size={size}
      showLabel={showLabel}
    />
  );
};

export default ArtistVerification;
