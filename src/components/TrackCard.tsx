import React, { useContext } from 'react';
import './TrackCard.css';
import Equalizer from './Equalizer';
import { PlayerContext } from '../context/PlayerContext';

const TrackCard = ({ track }) => {
  const { currentTrack, isPlaying, playTrack } = useContext(PlayerContext);
  const isCurrent = currentTrack?.id === track.id;

  return (
    <div className="track-card" onClick={() => playTrack(track)}>
      <img src={track.cover} alt={track.title} className="track-art" />
      <div className="track-info">
        <div className="track-title">{track.title}</div>
        <div className="track-artist">{track.artist}</div>
      </div>
      {isCurrent && isPlaying && <Equalizer isPlaying={true} />}
    </div>
  );
};

export default TrackCard;
