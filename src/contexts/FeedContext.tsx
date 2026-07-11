import React, { createContext, useContext } from 'react';
const FeedContext = createContext<any>(null);
export const useFeed = () => useContext(FeedContext);
export const FeedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <FeedContext.Provider value={{}}>{children}</FeedContext.Provider>
);
