// src/components/DownloadManager.tsx
import React from "react";
import "./DownloadManager.css";

const downloads = [
  {
    id: 1,
    title: "Soko",
    artist: "King Soundboi",
    image: "/track1.jpg",
    size: "5.3 MB",
    status: "Downloaded",
  },
  {
    id: 2,
    title: "Midnight Waves",
    artist: "Bella D",
    image: "/track2.jpg",
    size: "6.1 MB",
    status: "Downloaded",
  },
  {
    id: 3,
    title: "Crypto Vibes",
    artist: "Nifty Beatz",
    image: "/track3.jpg",
    size: "4.8 MB",
    status: "Queued",
  },
];

const DownloadManager = () => {
  return (
    <div className="download-manager-section">
      <h2>⬇️ Downloads</h2>
      <div className="download-list">
        {downloads.map((item) => (
          <div key={item.id} className="download-item">
            <img src={item.image} alt={item.title} />
            <div className="download-info">
              <h4>{item.title}</h4>
              <p>{item.artist}</p>
              <span>{item.size} • {item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DownloadManager;
