import React, { createContext, useContext } from 'react';
const ArtistContext = createContext<any>(null);
export const useArtist = () => useContext(ArtistContext);
export const ArtistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ArtistContext.Provider value={{}}>{children}</ArtistContext.Provider>
);
