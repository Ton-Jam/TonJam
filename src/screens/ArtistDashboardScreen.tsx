import React from 'react';
import './ArtistDashboardScreen.css';
import { useNavigate } from 'react-router-dom';

const mockMintedTracks = [
  {
    id: 'track1',
    title: 'Moonlight Freestyle',
    coverImage: '/mock-track-1.png',
    mintedDate: '2025-07-10',
  },
  {
    id: 'track2',
    title: 'Midnight Vibe',
    coverImage: '/mock-track-2.png',
    mintedDate: '2025-07-05',
  },
];

const ArtistDashboardScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="artist-dashboard">
      <div className="artist-header">
        <img src="/artist-avatar.png" alt="Artist" className="artist-avatar" />
        <div className="artist-info">
          <h2>Krusher Krupy</h2>
          <p>Verified Artist</p>
        </div>
        <button className="upload-btn" onClick={() => navigate('/upload')}>
          + Upload New Track
        </button>
      </div>

      <h3 className="minted-title">🎵 Minted Tracks</h3>
      <div className="minted-list">
        {mockMintedTracks.map((track) => (
          <div className="minted-track" key={track.id}>
            <img src={track.coverImage} alt={track.title} className="minted-cover" />
            <div className="minted-details">
              <div className="minted-name">{track.title}</div>
              <div className="minted-date">Minted on {track.mintedDate}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtistDashboardScreen;
