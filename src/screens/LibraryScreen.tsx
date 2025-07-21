import React from 'react';
import './LibraryScreen.css';
import { useAudioPlayer } from '../context/AudioPlayerContext';

const LibraryScreen: React.FC = () => {
  const { playTrack, pauseTrack, isPlaying, currentTrack } = useAudioPlayer();

  const sampleTrack = 'https://Godplan.mp3'; // Replace with real track

  return (
    <div className="library-screen">
      <h2 className="library-title">Your Library</h2>

      <section className="library-section">
        <h3>Liked Songs</h3>
        <div className="library-placeholder">
          You haven’t liked any songs yet.
          <button onClick={() => playTrack(sampleTrack)} className="play-btn">
            {isPlaying && currentTrack === sampleTrack ? 'Pause' : 'Play'}
          </button>
        </div>
      </section>

      <section className="library-section">
        <h3>Playlists</h3>
        <div className="library-placeholder">Create your first playlist and jam away!</div>
      </section>

      <section className="library-section">
        <h3>Recently Played</h3>
        <div className="library-placeholder">Your recent jams will appear here.</div>
      </section>
    </div>
  );
};

export default LibraryScreen;
