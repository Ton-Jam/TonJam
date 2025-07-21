import React from 'react';
import './JamFeedSlider.css';

interface JamFeedSlideProps {
  image: string;
  title: string;
  artist: string;
  isSponsored?: boolean;
}

const JamFeedSlide: React.FC<JamFeedSlideProps> = ({ image, title, artist, isSponsored }) => {
  return (
    <div className="jam-feed-slide">
      <img src={image} alt={title} className="jam-feed-image" />
      <div className="jam-feed-info">
        <h4 className="jam-feed-title">{title}</h4>
        <p className="jam-feed-artist">{artist}</p>
        {isSponsored && <span className="sponsored-tag">Sponsored</span>}
        <button className="play-button">▶ Play</button>
      </div>
    </div>
  );
};

export default JamFeedSlide;
