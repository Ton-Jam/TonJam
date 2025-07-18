import React from "react";
import "./AlbumCard.css";

interface AlbumCardProps {
  id: number;
  title: string;
  artist: string;
  image: string;
  onClick?: () => void;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ id, title, artist, image, onClick }) => {
  return (
    <div className="album-card" onClick={onClick}>
      <img src={image} alt={title} className="album-cover" />
      <div className="album-info">
        <div className="album-title">{title}</div>
        <div className="album-artist">{artist}</div>
      </div>
    </div>
  );
};

export default AlbumCard;
