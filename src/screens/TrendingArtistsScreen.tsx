import React, { useState, useEffect } from "react";
import ArtistCard from "../components/ArtistCard";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import "./VerticalListScreen.css";

const allArtists = [
  { id: 1, name: "Seyi Vibe", image: "/artist1.png", followers: 10200 },
  { id: 2, name: "Ayra Starr", image: "/artist2.png", followers: 17000 },
  { id: 3, name: "Fireboy", image: "/artist3.png", followers: 14500 },
];

const TrendingArtistsScreen = () => {
  const [query, setQuery] = useState("");
  const [sortOption, setSortOption] = useState("default");

  const filtered = allArtists
    .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (sortOption === "az" ? a.name.localeCompare(b.name) : 0));

  const { displayedData, loadMore } = useInfiniteScroll(filtered);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        loadMore();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMore]);

  return (
    <div className="vertical-list-screen">
      <div className="screen-header">
        <h2>🔥 Trending Artists</h2>
        <select className="sort-dropdown" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="default">Sort</option>
          <option value="az">A-Z</option>
        </select>
      </div>

      <input
        type="text"
        className="filter-input"
        placeholder="Search artist..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {filtered.length === 0 ? (
        <p className="no-results">No artists found for “{query}”</p>
      ) : (
        <div className="card-list">
          {displayedData.map((artist) => (
            <ArtistCard key={artist.id} {...artist} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TrendingArtistsScreen;
