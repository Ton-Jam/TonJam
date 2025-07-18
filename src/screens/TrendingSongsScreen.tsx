// TrendingSongsScreen.tsx
import React, { useState, useEffect } from "react";
import TrackCard from "../components/TrackCard";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import AIPlaylistSection from "../components/AIPlaylistSection";
import "./VerticalListScreen.css";

const allSongs = [
  { id: 1, title: "Plans", artist: "Drakee", image: "/drake.png", audioUrl: "/mock.mp3" },
  { id: 2, title: "Three", artist: "Chancee", image: "/chance.png", audioUrl: "/mock.mp3" },
  { id: 3, title: "Sophisticated", artist: "Snoops", image: "/snoopy.png", audioUrl: "/mock.mp3" },
  // ...more songs
];

const TrendingSongsScreen = () => {
  const [query, setQuery] = useState("");
  const filtered = allSongs.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.artist.toLowerCase().includes(query.toLowerCase())
  );

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
      <h2>Trending Songs</h2>
      <input
        type="text"
        className="filter-input"
        placeholder="Search songs or artists..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <div className="card-list">
        {displayedData.map(song => (
          <TrackCard key={song.id} {...song} />
        ))}
      </div>
      <AIPlaylistSection />
    </div>
  );
};

export default TrendingSongsScreen;
