import React from 'react';
import './NewDropSection.css';

const newDrops = [
  {
    id: 1,
    title: 'Space Vibes',
    artist: 'Astro Flow',
    cover: '/drops/drop1.png',
  },
  {
    id: 2,
    title: 'Moon Trap',
    artist: 'LunarBeatz',
    cover: '/drops/drop2.png',
  },
  {
    id: 3,
    title: 'Orbit Sound',
    artist: 'CosmoWave',
    cover: '/drops/drop3.png',
  },
];

const NewDropSection = () => {
  return (
    <div className="new-drop-section">
      <h3 className="section-title">🔥 New Drops</h3>
      <div className="new-drop-scroll">
        {newDrops.map((drop) => (
          <div key={drop.id} className="new-drop-card">
            <img src={drop.cover} alt={drop.title} className="new-drop-cover" />
            <div className="new-drop-info">
              <p className="new-drop-title">{drop.title}</p>
              <p className="new-drop-artist">{drop.artist}</p>
              <button className="play-mint-button">Play / Mint</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewDropSection;
