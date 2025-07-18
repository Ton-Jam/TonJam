import React from "react";
import "./PlaylistListScreen.css";

const playlists = [
  { id: 1, title: "Drill Playlist", image: "/drill-playlist.png" },
  { id: 2, title: "Afro Playlist", image: "/afro-playlist.png" },
  { id: 3, title: "Soul Playlist", image: "/soul-playlist.png" },
  { id: 4, title: "Chill Vibes", image: "/chillvibes-playlist.png" },
  { id: 5, title: "Party Playlist", image: "/party-playlist.png" },
  { id: 6, title: "TonJam Official", image: "/tonjam-playlist.png" },
  { id: 7, title: "Rap Playlist", image: "/rap-playlist.png" },
  { id: 8, title: "R&B", image: "/rnb-playlist.png" }
];

const PlaylistListScreen = () => {
  return (
    <div className="playlist-list-screen">
      <h2 className="screen-title">🎶 All Playlists</h2>
      <div className="playlist-grid">
        {playlists.map((playlist) => (
          <div key={playlist.id} className="playlist-card">
            <img src={playlist.image} alt={playlist.title} className="playlist-image" />
            <div className="playlist-info">
              <h4>{playlist.title}</h4>
              <button className="play-btn">Preview</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistListScreen;
