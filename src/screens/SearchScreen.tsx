import React, { useState } from 'react';
import './SearchScreen.css';
import TrackCard from '../components/TrackCard';
import NFTCard from '../components/NFTCard';
import ArtistCard from '../components/ArtistCard';

const mockTracks = [
  { id: 1, title: "Energy Flow", artist: "Zino", cover: "/cover1.png" },
  { id: 2, title: "Midnight Groove", artist: "Maya", cover: "/cover2.png" },
];

const mockNFTs = [
  { id: 1, title: "Crypto Tune", artist: "Lexx", cover: "/nft1.png" },
  { id: 2, title: "BeatChain", artist: "Yuno", cover: "/nft2.png" },
];

const mockArtists = [
  { id: 1, name: "Zino", image: "/artist1.png", isFollowing: false },
  { id: 2, name: "Maya", image: "/artist2.png", isFollowing: true },
];

const SearchScreen = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'songs' | 'nfts'>('all');

  const renderContent = () => {
    switch (activeFilter) {
      case 'songs':
        return mockTracks.map(track => <TrackCard key={track.id} {...track} />);
      case 'nfts':
        return mockNFTs.map(nft => <NFTCard key={nft.id} {...nft} />);
      case 'all':
      default:
        return (
          <>
            <div className="section-title">Trending Songs</div>
            <div className="card-list">{mockTracks.map(track => <TrackCard key={track.id} {...track} />)}</div>

            <div className="section-title">Trending NFTs</div>
            <div className="card-list">{mockNFTs.map(nft => <NFTCard key={nft.id} {...nft} />)}</div>

            <div className="section-title">Trending Artists</div>
            <div className="card-list">{mockArtists.map(artist => <ArtistCard key={artist.id} {...artist} />)}</div>
          </>
        );
    }
  };

  return (
    <div className="search-screen">
      <h2 className="title">Search</h2>

      <div className="filter-bar">
        <button onClick={() => setActiveFilter('all')} className={activeFilter === 'all' ? 'active' : ''}>All</button>
        <button onClick={() => setActiveFilter('songs')} className={activeFilter === 'songs' ? 'active' : ''}>Songs</button>
        <button onClick={() => setActiveFilter('nfts')} className={activeFilter === 'nfts' ? 'active' : ''}>NFTs</button>
      </div>

      <div className="search-results">
        {renderContent()}
      </div>
    </div>
  );
};

export default SearchScreen;
