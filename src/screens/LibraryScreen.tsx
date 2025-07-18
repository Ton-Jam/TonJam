import React, { useEffect, useState } from 'react';
import { getFromLocalStorage } from '../utils/localStorageHelper';
import './LibraryScreen.css';

interface Track {
  id: number;
  title: string;
  artist: string;
  coverImage: string;
  audioUrl: string;
  isNFT?: boolean;
}

const LibraryScreen = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);

  useEffect(() => {
    const savedTracks = getFromLocalStorage('tonjam_tracks');
    setTracks(savedTracks);
  }, []);

  const togglePlay = (track: Track) => {
    if (currentAudio) {
      currentAudio.pause();
      if (playingId === track.id) {
        setPlayingId(null);
        return;
      }
    }

    const audio = new Audio(track.audioUrl);
    audio.play();
    setCurrentAudio(audio);
    setPlayingId(track.id);
  };

  return (
    <div className="library-screen">
      <h2>My Library</h2>
      {tracks.length === 0 ? (
        <p className="empty-library">No tracks uploaded yet.</p>
      ) : (
        <div className="track-list">
          {tracks.map((track) => (
            <div className="track-card" key={track.id}>
              <img src={track.coverImage} alt="Cover" />
              <div className="track-info">
                <h4>{track.title}</h4>
                <p>{track.artist}</p>
                <button onClick={() => togglePlay(track)}>
                  {playingId === track.id ? 'Pause' : 'Play'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryScreen;
