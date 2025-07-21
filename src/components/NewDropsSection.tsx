import React from 'react';
import './NewDropsSection.css';

const newDrops = [
  {
    id: 1,
    title: 'Galactic Waves',
    artist: 'LunaSoul',
    cover: '/cover1.png',
    isMinted: true,
  },
  {
    id: 2,
    title: 'Crypto Funk',
    artist: 'BeatChain',
    cover: '/cover2.png',
    isMinted: false,
  },
  {
    id: 3,
    title: 'TON Anthem',
    artist: 'BlockSound',
    cover: '/cover3.png',
    isMinted: true,
  },
];

const NewDropsSection = () => {
  return (
    <section className="new-drops-section">
      <h3 className="section-title">🆕 New Drops</h3>
      <div className="drops-scroll">
        {newDrops.map(drop => (
          <div className="drop-card" key={drop.id}>
            <img src={drop.cover} alt={drop.title} className="drop-cover" />
            <div className="drop-info">
              <h4>{drop.title}</h4>
              <p>{drop.artist}</p>
              {drop.isMinted ? (
                <button className="mint-btn">Mint NFT</button>
              ) : (
                <button className="play-btn">Play</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewDropsSection;
