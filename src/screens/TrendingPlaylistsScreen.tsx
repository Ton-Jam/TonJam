import React, { useState, useEffect } from "react";
import PlaylistCard from "../components/PlaylistCard";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import "./VerticalListScreen.css";

const allPlaylists = [
  { id: 1, title: "Hip-Hop Daily", creator: "TonJam", image: "/playlist1.png" },
  { id: 2, title: "Afro Hits", creator: "UserX", image: "/playlist2.png" },
  { id: 3, title: "RnB Gems", creator: "Curator", image: "/playlist3.png" },
];

const TrendingPlaylistsScreen = () => {
  const [query, setQuery] = useState("");
  const [sortOption, setSortOption] = useState("default");

  const filtered = allPlaylists
    .filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.creator.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => (sortOption === "az" ? a.title.localeCompare(b.title) : 0));

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
        <h2>🔥 Trending Playlists</h2>
        <select className="sort-dropdown" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="default">Sort</option>
          <option value="az">A-Z</option>
        </select>
      </div>

      <input
        type="text"
        className="filter-input"
        placeholder="Search playlists or creators..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {filtered.length === 0 ? (
        <p className="no-results">No playlists found for “{query}”</p>
      ) : (
        <div className="card-list">
          {displayedData.map((playlist) => (
            <PlaylistCard key={playlist.id} {...playlist} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TrendingPlaylistsScreen;
