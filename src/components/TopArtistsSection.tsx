import React from 'react';
import ArtistLeaderboard from './ArtistLeaderboard';

const TopArtistsSection: React.FC = () => {
  return (
    <div className="space-y-4 text-left px-0.5">
      <ArtistLeaderboard 
        title="Top Artists Leaderboard" 
        description="Ranked by NFT sales volume and streaming activity from Firestore"
        limit={5} 
      />
    </div>
  );
};

export default TopArtistsSection;
