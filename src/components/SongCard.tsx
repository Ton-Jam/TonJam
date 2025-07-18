// Filename: src/components/SongCard.tsx
import React from 'react';
import './SongCard.css';

interface SongCardProps {
  imageUrl: string;
  title: string;
  artist: string;
}

const SongCard: React.FC<SongCardProps> = ({ imageUrl, title, artist }) => {
  return (
    <div className="song-card">
      <img src={imageUrl} alt={title} className="song-card-image" />
      <p className="song-card-title">{title}</p>
      <p className="song-card-artist">{artist}</p>
    </div>
  );
};

export default SongCard;
