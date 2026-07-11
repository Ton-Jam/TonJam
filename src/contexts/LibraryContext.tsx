import React, { createContext, useContext } from 'react';
const LibraryContext = createContext<any>(null);
export const useLibrary = () => useContext(LibraryContext);
export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LibraryContext.Provider value={{}}>{children}</LibraryContext.Provider>
);
