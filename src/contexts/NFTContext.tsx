import React, { createContext, useContext } from 'react';
const NFTContext = createContext<any>(null);
export const useNFT = () => useContext(NFTContext);
export const NFTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <NFTContext.Provider value={{}}>{children}</NFTContext.Provider>
);
