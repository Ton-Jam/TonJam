// Filename: src/components/BannerCarousel.tsx
import React from 'react';
import './BannerCarousel.css';

const BannerCarousel = ({ items }: { items: any[] }) => {
  // In a real app, you'd use state to control the slide. For this demo, we'll show the first one.
  const currentItem = items[0];

  return (
    <div className="banner-carousel">
      <div className="banner-slide" style={{ backgroundImage: `url(${currentItem.imageUrl})` }}>
        <div className="banner-overlay">
          <h3>{currentItem.title}</h3>
          <p>{currentItem.subtitle}</p>
          <button className="play-button-banner">
            <img src="/icon-play-solid.png" alt="Play" />
            <span>Play</span>
          </button>
        </div>
      </div>
      {/* Dots for navigation can be added here later */}
    </div>
  );
};
export default BannerCarousel;
