import React, { useState, useEffect } from "react";
import NFTCard from "../components/NFTCard";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import "./VerticalListScreen.css";

const allNFTs = [
  { id: 1, title: "Waveform", artist: "TonDrop", image: "/nft1.png", price: "4.5 TON" },
  { id: 2, title: "Vibes", artist: "AfroFella", image: "/nft2.png", price: "2.8 TON" },
  { id: 3, title: "TrapSunset", artist: "TrapSoul", image: "/nft3.png", price: "7.1 TON" },
];

const TrendingNFTsScreen = () => {
  const [query, setQuery] = useState("");
  const [sortOption, setSortOption] = useState("default");

  const filtered = allNFTs
    .filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.artist.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => (sortOption === "az" ? a.title.localeCompare(b.title) : 0));

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
        <h2>🔥 Trending NFTs</h2>
        <select className="sort-dropdown" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="default">Sort</option>
          <option value="az">A-Z</option>
        </select>
      </div>

      <input
        type="text"
        className="filter-input"
        placeholder="Search NFTs or artists..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {filtered.length === 0 ? (
        <p className="no-results">No NFTs found for “{query}”</p>
      ) : (
        <div className="card-list">
          {displayedData.map((nft) => (
            <NFTCard key={nft.id} {...nft} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TrendingNFTsScreen;
