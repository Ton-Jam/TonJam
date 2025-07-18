// src/screens/QueueScreen.tsx
import React from "react";
import { usePlayer } from "../context/GlobalPlayerContext";
import "../styles/QueueScreen.css";

const QueueScreen = () => {
  const { queue, setCurrentTrack, play } = usePlayer();

  const handlePlayFromQueue = (track) => {
    setCurrentTrack(track);
    play();
  };

  return (
    <div className="queue-screen">
      <h2 className="queue-title">Upcoming Tracks</h2>
      {queue.length === 0 ? (
        <p className="empty-message">Your queue is empty</p>
      ) : (
        <ul className="queue-list">
          {queue.map((track, index) => (
            <li
              key={index}
              className="queue-item"
              onClick={() => handlePlayFromQueue(track)}
            >
              <img src={track.cover} alt={track.title} className="queue-cover" />
              <div className="queue-info">
                <h4>{track.title}</h4>
                <p>{track.artist}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QueueScreen;
