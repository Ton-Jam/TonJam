import React, { createContext, useContext } from 'react';
const PlayerContext = createContext<any>(null);
export const usePlayer = () => useContext(PlayerContext);
export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PlayerContext.Provider value={{}}>{children}</PlayerContext.Provider>
);
