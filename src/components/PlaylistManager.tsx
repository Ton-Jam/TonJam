// src/components/PlaylistManager.tsx
import React, { useState } from "react";
import "./PlaylistManager.css";

const PlaylistManager = () => {
  const [playlists, setPlaylists] = useState<string[]>(["My Jams", "Vibes 🔥"]);
  const [newPlaylist, setNewPlaylist] = useState("");

  const handleAdd = () => {
    if (newPlaylist.trim()) {
      setPlaylists([...playlists, newPlaylist.trim()]);
      setNewPlaylist("");
    }
  };

  return (
    <div className="playlist-manager">
      <h2>Your Playlists</h2>

      <div className="playlist-input">
        <input
          type="text"
          placeholder="Create new playlist..."
          value={newPlaylist}
          onChange={(e) => setNewPlaylist(e.target.value)}
        />
        <button onClick={handleAdd}>+ Add</button>
      </div>

      <div className="playlist-list">
        {playlists.map((pl, idx) => (
          <div key={idx} className="playlist-item">
            <span>{pl}</span>
            <button className="open-btn">Open</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistManager;
