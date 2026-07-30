import React, { createContext, useContext } from 'react';
import { useAudio } from './AudioContext';

const PlayerContext = createContext<any>(null);

export const usePlayer = () => {
  const audio = useAudio();
  const playerCtx = useContext(PlayerContext);
  return { ...audio, ...playerCtx };
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <PlayerContext.Provider value={{}}>
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerContext;

