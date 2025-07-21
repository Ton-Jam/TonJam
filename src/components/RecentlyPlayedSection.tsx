import React from 'react';
import './RecentlyPlayedSection.css';

const recentlyPlayed = [
  {
    id: 1,
    title: 'Echoes of Ton',
    artist: 'DJ Pulse',
    image: '/track1.png',
  },
  {
    id: 2,
    title: 'Space Jams',
    artist: 'KrushBeatz',
    image: '/track2.png',
  },
  {
    id: 3,
    title: 'TON Nation Anthem',
    artist: 'T-Wave',
    image: '/track3.png',
  },
  {
    id: 4,
    title: 'Jam Spirit',
    artist: 'Lo-Fi Bot',
    image: '/track4.png',
  },
];

const RecentlyPlayedSection = () => {
  return (
    <section className="recently-played-section">
      <h3 className="section-title">🎧 Recently Played</h3>
      <div className="recently-played-scroll">
        {recentlyPlayed.map((track) => (
          <div className="recently-played-card" key={track.id}>
            <img src={track.image} alt={track.title} className="recently-played-image" />
            <div className="recently-played-info">
              <span className="track-title">{track.title}</span>
              <span className="track-artist">{track.artist}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentlyPlayedSection;
