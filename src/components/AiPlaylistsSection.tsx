import React from "react";
import "./AIPlaylistSection.css";

const aiPlaylists = [
  {
    id: 1,
    title: "Crypto Chill",
    theme: "Lofi for Web3 Devs",
    cover: "/assets/ai-playlists/ai1.png",
  },
  {
    id: 2,
    title: "Rugproof Rhythms",
    theme: "No scam, just jam",
    cover: "/assets/ai-playlists/ai2.png",
  },
  {
    id: 3,
    title: "DeFi Drops",
    theme: "Future finance beats",
    cover: "/assets/ai-playlists/ai3.png",
  },
  {
    id: 4,
    title: "TON Flow",
    theme: "TON-native smooth jams",
    cover: "/assets/ai-playlists/ai4.png",
  },
];

const AIPlaylistSection = () => {
  return (
    <div className="ai-playlist-section">
      <h2 className="section-title">AI Generated Playlists</h2>
      <div className="ai-playlist-scroll">
        {aiPlaylists.map((playlist) => (
          <div className="ai-playlist-card" key={playlist.id}>
            <img src={playlist.cover} alt={playlist.title} className="ai-cover" />
            <div className="ai-info">
              <h3 className="ai-title">{playlist.title}</h3>
              <p className="ai-theme">{playlist.theme}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIPlaylistSection;
