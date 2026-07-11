import React, { createContext, useContext } from 'react';
const TJContext = createContext<any>(null);
export const useTJ = () => useContext(TJContext);
export const TJProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TJContext.Provider value={{}}>{children}</TJContext.Provider>
);
