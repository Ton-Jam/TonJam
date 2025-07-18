import React, { useState } from "react";
import "./GenreTabs.css";

const genres = ["All", "Afrobeats", "Hip-Hop", "Dancehall", "R&B", "Amapiano"];

const GenreTabs = ({ onSelect }) => {
  const [active, setActive] = useState("All");

  const handleClick = (genre) => {
    setActive(genre);
    onSelect(genre);
  };

  return (
    <div className="genre-tabs">
      {genres.map((genre) => (
        <button
          key={genre}
          className={`genre-tab ${active === genre ? "active" : ""}`}
          onClick={() => handleClick(genre)}
        >
          {genre}
        </button>
      ))}
    </div>
  );
};

export default GenreTabs;
