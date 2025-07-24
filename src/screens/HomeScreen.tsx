import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFollow } from '../context/FollowContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import './HomeScreen.css';

const HomeScreen: React.FC = () => {
  console.log('HomeScreen rendering...');
  const { user } = useAuth() || { user: null };
  console.log('useAuth result:', user);
  const { followUser, unfollowUser, following = [] } = useFollow() || {};
  console.log('useFollow result:', { followUser, unfollowUser, following });
  const { play, pause, isPlaying = false } = useAudioPlayer() || {};
  console.log('useAudioPlayer result:', { play, pause, isPlaying });

  const [isLoading, setIsLoading] = useState(true);

  const trendingArtists = Array.from({ length: 10 }, (_, i) => ({
    id: (i + 1).toString(),
    name: `Artist ${String.fromCharCode(65 + i)}`,
    isVerified: i % 2 === 0,
  }));

  const newReleases = Array.from({ length: 10 }, (_, i) => ({
    id: (i + 1).toString(),
    title: `Track ${i + 1}`,
    url: `https://example.com/track${i + 1}.mp3`,
  }));

  const featuredNFTs = Array.from({ length: 10 }, (_, i) => ({
    id: (i + 1).toString(),
    title: `NFT Art ${i + 1}`,
    image: `https://via.placeholder.com/150?text=NFT${i + 1}`,
  }));

  useEffect(() => {
    console.log('HomeScreen useEffect triggered');
    const initialFollowStatus: { [key: string]: boolean } = {};
    trendingArtists.forEach((artist) => {
      initialFollowStatus[artist.id] = Math.random() > 0.5;
    });
    setIsLoading(false); // Simulate data load
  }, []);

  const handleFollow = (artistId: string) => {
    if (followUser) followUser(artistId);
  };

  const handleUnfollow = (artistId: string) => {
    if (unfollowUser) unfollowUser(artistId);
  };

  const handlePlayPause = (url: string) => {
    if (play && pause) {
      if (isPlaying) {
        pause();
      } else {
        play(url);
      }
    }
  };

  const isFollowing = (artistId: string) => following.includes(artistId);

  if (isLoading) {
    return (
      <div className="home-loader">
        <div className="spinner">
          <div className="spinner-inner"></div>
        </div>
        <p className="loader-text">Loading Home Content...</p>
      </div>
    );
  }

  return (
    <div className="home-screen">
      <div className="greeting-section">
        <h2>Welcome to TonJam! 🎶</h2>
        {user && <p>Welcome, {user.email || user.id}!</p>}
        <p>Explore trending artists, new releases, and NFTs.</p>
      </div>
      <div className="section">
        <h3>Trending Artists</h3>
        <div className="card-grid">
          {trendingArtists.map((artist) => (
            <div key={artist.id} className="card artist-card">
              <h4>{artist.name}</h4>
              <p>{artist.isVerified ? 'Verified' : 'Unverified'}</p>
              {user && user.id !== artist.id && (
                <button
                  onClick={() =>
                    isFollowing(artist.id)
                      ? handleUnfollow(artist.id)
                      : handleFollow(artist.id)
                  }
                  className="follow-btn"
                >
                  {isFollowing(artist.id) ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="section">
        <h3>New Releases</h3>
        <div className="card-grid">
          {newReleases.map((release) => (
            <div key={release.id} className="card audio-card">
              <h4>{release.title}</h4>
              <button
                onClick={() => handlePlayPause(release.url)}
                className="play-btn"
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="section">
        <h3>Featured NFTs</h3>
        <div className="card-grid">
          {featuredNFTs.map((nft) => (
            <div key={nft.id} className="card nft-card">
              <img src={nft.image} alt={nft.title} className="nft-image" />
              <h4>{nft.title}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
