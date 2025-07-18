import React from "react";
import { usePlayer } from "../context/PlayerContext";
import "./NowPlayingBar.css";

const NowPlayingBar = () => {
  const { currentTrack, isPlaying, togglePlay, toggleFullPlayer } = usePlayer();

  if (!currentTrack) return null;

  return (
    <div className="now-playing-bar" onClick={toggleFullPlayer}>
      <img src={currentTrack.artwork} alt="cover" className="np-thumbnail" />
      <div className="np-info">
        <div className="np-title">{currentTrack.title}</div>
        <div className="np-artist">{currentTrack.artist}</div>
      </div>
      <button
        className="np-toggle"
        onClick={(e) => {
          e.stopPropagation(); // prevent opening full player
          togglePlay();
        }}
      >
        {isPlaying ? "⏸" : "▶️"}
      </button>
    </div>
  );
};

export default NowPlayingBar;
