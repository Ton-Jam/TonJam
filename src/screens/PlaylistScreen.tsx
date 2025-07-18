import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./PlaylistScreen.css";

const mockPlaylistData = {
  "drill-playlist": {
    title: "Drill Playlist",
    image: "/drill-playlist.png",
    tracks: [
      { id: 1, title: "No Hook", artist: "K-Trap", src: "/track1.mp3" },
      { id: 2, title: "Zone 2", artist: "Headie One", src: "/track2.mp3" },
      { id: 3, title: "War", artist: "Digga D", src: "/track3.mp3" },
    ],
  },
  "afro-playlist": {
    title: "Afro Playlist",
    image: "/afro-playlist.png",
    tracks: [
      { id: 1, title: "Soco", artist: "Wizkid", src: "/track4.mp3" },
      { id: 2, title: "Last Last", artist: "Burna Boy", src: "/track5.mp3" },
      { id: 3, title: "Peru", artist: "Fireboy DML", src: "/track6.mp3" },
    ],
  },
  // Add more playlists if needed...
};

const PlaylistScreen = () => {
  const { playlistId } = useParams();
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const data = mockPlaylistData[playlistId ?? "drill-playlist"];
  const [shuffled, setShuffled] = useState(false);
  const [tracks, setTracks] = useState(data.tracks);

  const handlePlay = (src: string) => {
    if (audio) {
      audio.pause();
    }
    const newAudio = new Audio(src);
    newAudio.play();
    setAudio(newAudio);
  };

  const shuffleTracks = () => {
    const shuffledTracks = [...tracks].sort(() => Math.random() - 0.5);
    setShuffled(true);
    setTracks(shuffledTracks);
  };

  return (
    <div className="playlist-screen">
      <div className="playlist-header">
        <img src={data.image} alt={data.title} className="playlist-cover" />
        <div className="playlist-info">
          <h2>{data.title}</h2>
          <button onClick={shuffleTracks} className="shuffle-button">
            Shuffle
          </button>
        </div>
      </div>
      <div className="track-list">
        {tracks.map((track) => (
          <div key={track.id} className="track-item" onClick={() => handlePlay(track.src)}>
            <div className="track-text">
              <h4>{track.title}</h4>
              <p>{track.artist}</p>
            </div>
            <img src="/play-icon.png" alt="Play" className="play-icon" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistScreen;
