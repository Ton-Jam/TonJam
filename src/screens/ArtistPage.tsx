import React from 'react';
import '../screens/ArtistPage.css';
import ArtistHeader from '../components/ArtistHeader';
import TrackCard from '../components/TrackCard';
import NFTCard from '../components/NFTCard';

const ArtistPage: React.FC = () => {
  const artist = {
    name: 'Krusher Krupy',
    bio: 'Verified Afrobeat sensation on TON. Minting exclusive drops for fans.',
    followers: 12800,
    image: '/Artist9.png',
    verified: true,
  };

  const tracks = [
    { id: 1, title: 'TON Vibes', cover: '/track1.png', plays: '42.3K', duration: '2:58' },
    { id: 2, title: 'Chain Melody', cover: '/track2.png', plays: '31.2K', duration: '3:14' },
  ];

  const nfts = [
    { id: 1, title: 'Blue Flame NFT', image: '/nft1.png', price: '24 TON' },
    { id: 2, title: 'Vibe Token', image: '/nft2.png', price: '18 TON' },
  ];

  return (
    <div className="artist-page">
      <ArtistHeader artist={artist} />

      <div className="artist-section">
        <h2>Top Tracks</h2>
        <div className="track-list">
          {tracks.map(track => (
            <TrackCard key={track.id} {...track} />
          ))}
        </div>
      </div>

      <div className="artist-section">
        <h2>Minted NFTs</h2>
        <div className="nft-list">
          {nfts.map(nft => (
            <NFTCard key={nft.id} {...nft} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtistPage;
