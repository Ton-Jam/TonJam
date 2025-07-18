import React from "react";
import { usePlayer } from "../context/GlobalPlayerContext";
import { useNavigate } from "react-router-dom";
import "../styles/FullPlayerView.css";

const FullPlayerView = () => {
  const {
    currentTrack,
    isPlaying,
    play,
    pause,
    next,
    previous,
    toggleShuffle,
    toggleRepeat,
    isShuffling,
    isRepeating
  } = usePlayer();

  const navigate = useNavigate();

  if (!currentTrack) {
    return <div className="full-player-view">No track selected</div>;
  }

  return (
    <div className="full-player-view">
      <img src={currentTrack.cover} alt={currentTrack.title} className="player-cover" />
      <h2 className="player-title">{currentTrack.title}</h2>
      <p className="player-artist">{currentTrack.artist}</p>

      <div className="player-controls">
        <button onClick={toggleShuffle} className={isShuffling ? "active" : ""}>🔀</button>
        <button onClick={previous}>⏮️</button>
        <button onClick={isPlaying ? pause : play}>
          {isPlaying ? "⏸️" : "▶️"}
        </button>
        <button onClick={next}>⏭️</button>
        <button onClick={toggleRepeat} className={isRepeating ? "active" : ""}>🔁</button>
      </div>

      <button onClick={() => navigate("/queue")} className="queue-btn">
        View Queue
      </button>
    </div>
  );
};

export default FullPlayerView;
