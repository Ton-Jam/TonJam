import React from "react";
import "./GenreFilter.css";

const GenreFilter = ({
  genres,
  selectedGenre,
  onSelectGenre,
}: {
  genres: string[];
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
}) => {
  return (
    <div className="genre-filter scroll-row">
      {genres.map((genre) => (
        <button
          key={genre}
          className={`genre-pill ${selectedGenre === genre ? "active" : ""}`}
          onClick={() => onSelectGenre(genre)}
        >
          {genre}
        </button>
      ))}
    </div>
  );
};

export default GenreFilter;
