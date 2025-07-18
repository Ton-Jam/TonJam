import React from "react";
import "./TrackCardVertical.css";

const TrackCardVertical = ({ title, artist, image }) => {
  return (
    <div className="track-card-vertical">
      <img src={image} alt={title} className="track-image" />
      <div className="track-details">
        <h4>{title}</h4>
        <p>{artist}</p>
      </div>
    </div>
  );
};

export default TrackCardVertical;
