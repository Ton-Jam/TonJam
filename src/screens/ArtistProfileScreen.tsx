import React, { useState, useEffect } from 'react';
import './ArtistProfileScreen.css';

const mockArtist = {
  id: 'artist-001',
  name: 'Krusher Krupy',
  isVerified: true,
  followers: 10234,
  image: '/Artist1.png',
  banner: '/bg-profile.png',
  bio: 'Blockchain music pioneer. Minting vibes on TonJam.',
};

const mockNFTs = [
  {
    id: 'nft-1',
    title: 'Midnight Chill',
    cover: '/cover1.png',
    audio: '/sample1.mp3',
  },
  {
    id: 'nft-2',
    title: 'Bass On Fire',
    cover: '/cover2.png',
    audio: '/sample2.mp3',
  },
];

const ArtistProfileScreen = () => {
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'songs' | 'nfts' | 'playlists'>('nfts');

  const toggleFollow = () => setFollowing(prev => !prev);

  return (
    <div className="artist-profile-container">
      <div className="artist-banner" style={{ backgroundImage: `url(${mockArtist.banner})` }}>
        <img className="artist-profile-pic" src={mockArtist.image} alt={mockArtist.name} />
      </div>

      <div className="artist-info">
        <h2>
          {mockArtist.name}
          {mockArtist.isVerified && <img src="/icon-verified-check.png" className="verified-icon" />}
        </h2>
        <p className="artist-bio">{mockArtist.bio}</p>
        <div className="artist-follow">
          <span>{mockArtist.followers.toLocaleString()} followers</span>
          <button onClick={toggleFollow}>
            {following ? 'Unfollow' : 'Follow'}
          </button>
        </div>
      </div>

      <div className="artist-tabs">
        <button className={activeTab === 'songs' ? 'active' : ''} onClick={() => setActiveTab('songs')}>Songs</button>
        <button className={activeTab === 'nfts' ? 'active' : ''} onClick={() => setActiveTab('nfts')}>NFTs</button>
        <button className={activeTab === 'playlists' ? 'active' : ''} onClick={() => setActiveTab('playlists')}>Playlists</button>
      </div>

      <div className="artist-content">
        {activeTab === 'nfts' && (
          <div className="nft-grid">
            {mockNFTs.map(nft => (
              <div key={nft.id} className="nft-card">
                <img src={nft.cover} alt={nft.title} />
                <p>{nft.title}</p>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'songs' && (
          <div className="song-placeholder">🎶 Artist songs will appear here.</div>
        )}
        {activeTab === 'playlists' && (
          <div className="song-placeholder">📻 Artist playlists will appear here.</div>
        )}
      </div>
    </div>
  );
};

export default ArtistProfileScreen;
