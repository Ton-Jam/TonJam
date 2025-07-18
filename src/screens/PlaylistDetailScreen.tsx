import React from 'react';
import './PlaylistDetailScreen.css';

const PlaylistDetailScreen = () => {
  const playlist = {
    title: 'Top TON Hits',
    cover: '/playlist-cover.png',
    description: 'A collection of top TON blockchain music NFTs.',
    tracks: [
      { id: 1, title: 'Crystal Beats', artist: 'Tonny Flow', duration: '3:21', cover: '/Track1.png' },
      { id: 2, title: 'Chain Melody', artist: 'Block Diva', duration: '4:05', cover: '/Track2.png' },
      { id: 3, title: 'Gasless Groove', artist: 'Smart Vibe', duration: '2:58', cover: '/Track3.png' },
    ],
  };

  return (
    <div className="playlist-detail-container">
      <div className="playlist-header">
        <img src={playlist.cover} alt="Playlist Cover" className="playlist-cover" />
        <h2 className="playlist-title">{playlist.title}</h2>
        <p className="playlist-description">{playlist.description}</p>
        <div className="playlist-actions">
          <button className="play-btn">▶️ Play All</button>
          <button className="shuffle-btn">🔀 Shuffle</button>
        </div>
      </div>

      <div className="track-list-section">
        <h3>Tracks</h3>
        <div className="track-list">
          {playlist.tracks.map((track) => (
            <div key={track.id} className="track-item">
              <img src={track.cover} alt={track.title} />
              <div>
                <h4>{track.title}</h4>
                <span>{track.artist}</span>
              </div>
              <span className="duration">{track.duration}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlaylistDetailScreen;
