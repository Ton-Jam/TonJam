import React from 'react';
import './TrendPicksSection.css';

const trendPicks = [
  {
    id: 1,
    title: 'Synthwave Saga',
    image: '/trend1.png',
    type: 'Playlist',
  },
  {
    id: 2,
    title: 'KrushBeatz 🔥',
    image: '/Artist4.png',
    type: 'Artist',
  },
  {
    id: 3,
    title: 'NFT: Pulse Echo',
    image: '/nft3.png',
    type: 'NFT',
  },
  {
    id: 4,
    title: 'Lo-Fi Escape',
    image: '/trend2.png',
    type: 'Playlist',
  },
];

const TrendPicksSection = () => {
  return (
    <section className="trend-picks-section">
      <h3 className="section-title">🌟 Trend Picks</h3>
      <div className="trend-pick-scroll">
        {trendPicks.map((item) => (
          <div className="trend-pick-card" key={item.id}>
            <img src={item.image} alt={item.title} className="trend-pick-image" />
            <div className="trend-pick-info">
              <span className="trend-pick-title">{item.title}</span>
              <span className="trend-pick-type">{item.type}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrendPicksSection;
