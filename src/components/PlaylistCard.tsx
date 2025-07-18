import React, { useContext } from 'react';
import './PlaylistCard.css';
import Equalizer from './Equalizer';
import { PlayerContext } from '../context/PlayerContext';

const PlaylistCard = ({ playlist }) => {
  const { currentTrack, isPlaying } = useContext(PlayerContext);
  const isCurrentPlaylist = playlist.tracks?.some(t => t.id === currentTrack?.id);

  return (
    <div className="playlist-card">
      <img src={playlist.cover} alt={playlist.title} className="playlist-cover" />
      <div className="playlist-info">
        <div className="playlist-title">{playlist.title}</div>
        <div className="playlist-count">{playlist.tracks.length} tracks</div>
      </div>
      {isCurrentPlaylist && isPlaying && <Equalizer isPlaying={true} />}
    </div>
  );
};

export default PlaylistCard;
