import React from 'react';
import { Artist } from '@/types';
import { ArtistVerificationBadge } from './ArtistVerificationBadge';

interface ArtistVerificationProps {
  artist: Artist;
}

const ArtistVerification: React.FC<ArtistVerificationProps> = ({ artist }) => {
  const isVerified = Boolean(artist.verificationStatus === 'verified' || artist.verified || artist.isVerifiedArtist);

  return (
    <ArtistVerificationBadge
      isVerified={isVerified}
      artistName={artist.name}
      artistUid={artist.uid}
      size="md"
    />
  );
};

export default ArtistVerification;
