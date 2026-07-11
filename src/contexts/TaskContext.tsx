import React, { createContext, useContext } from 'react';
const TaskContext = createContext<any>(null);
export const useTask = () => useContext(TaskContext);
export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TaskContext.Provider value={{}}>{children}</TaskContext.Provider>
);
