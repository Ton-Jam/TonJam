import React from "react";
import { usePlayer } from "../context/GlobalPlayerContext";
import "./MiniPlayer.css";

const MiniPlayer = () => {
  const { currentTrack } = usePlayer();

  if (!currentTrack) return null;

  return (
    <div className="mini-player">
      <img src={currentTrack.image} alt="Cover" className="mini-cover" />
      <div className="mini-info">
        <div className="mini-title">{currentTrack.title}</div>
        <div className="mini-artist">{currentTrack.artist}</div>
      </div>
      <audio src={currentTrack.audioSrc} controls autoPlay />
    </div>
  );
};

export default MiniPlayer;
