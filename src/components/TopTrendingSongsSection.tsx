import React from 'react';
import './TopTrendingSongsSection.css';

const trendingSongs = [
  {
    id: 1,
    title: 'Midnight Jam',
    artist: 'SynthNova',
    cover: '/cover4.png',
  },
  {
    id: 2,
    title: 'On The Blockchain',
    artist: 'ToneVerse',
    cover: '/cover5.png',
  },
  {
    id: 3,
    title: 'Neon Riddim',
    artist: 'KrushBeat',
    cover: '/cover6.png',
  },
];

const TopTrendingSongsSection = () => {
  return (
    <section className="top-trending-section">
      <h3 className="section-title">🔥 Top Trending Songs</h3>
      <div className="trending-scroll">
        {trendingSongs.map((song) => (
          <div className="song-card" key={song.id}>
            <img src={song.cover} alt={song.title} className="song-cover" />
            <div className="song-info">
              <h4>{song.title}</h4>
              <p>{song.artist}</p>
              <button className="play-btn">Play</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopTrendingSongsSection;
