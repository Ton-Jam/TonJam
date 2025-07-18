import React, { useState, useEffect } from "react";
import AlbumCard from "../components/AlbumCard";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import "./VerticalListScreen.css";

const allAlbums = [
  { id: 1, title: "Takeover", artist: "Lamar", image: "/album1.png" },
  { id: 2, title: "Views", artist: "Drake", image: "/album2.png" },
  { id: 3, title: "Astroworld", artist: "Travis", image: "/album3.png" },
  // Add more...
];

const TrendingAlbumsScreen = () => {
  const [query, setQuery] = useState("");
  const [sortOption, setSortOption] = useState("default");

  const filtered = allAlbums
    .filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.artist.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === "az") return a.title.localeCompare(b.title);
      return 0;
    });

  const { displayedData, loadMore } = useInfiniteScroll(filtered);

  useEffect(() => {
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        loadMore();
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [loadMore]);

  return (
    <div className="vertical-list-screen">
      <div className="screen-header">
        <h2>🔥 Trending Albums</h2>
        <select className="sort-dropdown" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="default">Sort</option>
          <option value="az">A-Z</option>
        </select>
      </div>

      <input
        type="text"
        className="filter-input"
        placeholder="Search albums or artists..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {filtered.length === 0 ? (
        <p className="no-results">No albums found for “{query}”</p>
      ) : (
        <div className="card-list">
          {displayedData.map((album) => (
            <AlbumCard key={album.id} {...album} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TrendingAlbumsScreen;
