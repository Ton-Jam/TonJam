import React from 'react';
import './TrendingArtistsSection.css';

const trendingArtists = [
  {
    id: 1,
    name: 'KrushBeat',
    avatar: '/Artist1.png',
    verified: true,
  },
  {
    id: 2,
    name: 'SynthNova',
    avatar: '/Artist2.png',
    verified: true,
  },
  {
    id: 3,
    name: 'ToneVerse',
    avatar: '/Artist3.png',
    verified: true,
  },
];

const TrendingArtistsSection = () => {
  return (
    <section className="trending-artists-section">
      <h3 className="section-title">🎤 Trending Artists</h3>
      <div className="artist-scroll">
        {trendingArtists.map((artist) => (
          <div className="artist-card" key={artist.id}>
            <img src={artist.avatar} alt={artist.name} className="artist-avatar" />
            <div className="artist-name">
              {artist.name}
              {artist.verified && (
                <img
                  src="/icon-verified-check.png"
                  alt="Verified"
                  className="verified-icon"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrendingArtistsSection;
