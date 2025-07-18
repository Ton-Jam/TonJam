import React from 'react';
import './Equalizer.css';

interface EqualizerProps {
  isPlaying: boolean;
}

const Equalizer: React.FC<EqualizerProps> = ({ isPlaying }) => {
  return (
    <svg
      className={`svg-equalizer ${isPlaying ? 'playing' : ''}`}
      width="24"
      height="24"
      viewBox="0 0 100 100"
    >
      <rect className="bar bar1" x="15" width="10" y="30" height="40" rx="4" />
      <rect className="bar bar2" x="35" width="10" y="20" height="60" rx="4" />
      <rect className="bar bar3" x="55" width="10" y="35" height="30" rx="4" />
      <rect className="bar bar4" x="75" width="10" y="25" height="50" rx="4" />
    </svg>
  );
};

export default Equalizer;
