import React, { createContext, useContext } from 'react';
const FollowContext = createContext<any>(null);
export const useFollow = () => useContext(FollowContext);
export const FollowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <FollowContext.Provider value={{}}>{children}</FollowContext.Provider>
);
