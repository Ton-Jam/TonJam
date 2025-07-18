import React from "react";
import "./GenreFilterBar.css";

const genres = ["All", "Afrobeats", "Trap", "RnB", "Pop", "Jazz"];

const GenreFilterBar = ({ selectedGenre, onSelect }: any) => {
  return (
    <div className="genre-filter-bar">
      {genres.map((genre) => (
        <button
          key={genre}
          className={`genre-pill ${selectedGenre === genre ? "active" : ""}`}
          onClick={() => onSelect(genre)}
        >
          {genre}
        </button>
      ))}
    </div>
  );
};

export default GenreFilterBar;
