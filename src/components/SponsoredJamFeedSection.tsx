import React from 'react';
import './SponsoredJamFeedSection.css';

const sponsoredFeeds = [
  {
    id: 1,
    image: '/feed1.png',
    title: 'Vibes in Lagos',
    artist: 'DJ Tonboy',
  },
  {
    id: 2,
    image: '/feed2.png',
    title: 'Crypto + Jam',
    artist: 'NFTWiz',
  },
  {
    id: 3,
    image: '/feed3.png',
    title: 'AfroMoon Drop',
    artist: 'LunaJay',
  },
];

const SponsoredJamFeedSection: React.FC = () => {
  return (
    <section className="sponsored-jam-section">
      <h3 className="section-title">Sponsored Jam Feeds</h3>
      <div className="jam-feed-scroll">
        {sponsoredFeeds.map((post) => (
          <div key={post.id} className="jam-feed-card">
            <img src={post.image} alt={post.title} className="jam-feed-img" />
            <div className="jam-feed-content">
              <h4>{post.title}</h4>
              <p>{post.artist}</p>
              <span className="sponsored-label">Sponsored</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SponsoredJamFeedSection;
