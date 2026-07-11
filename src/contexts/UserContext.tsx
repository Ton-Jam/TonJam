import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { UserProfile } from '@/types';

interface UserContextType {
  user: any;
  userProfile: UserProfile | null;
  loading: boolean;
  isArtist: boolean;
  isAdmin: boolean;
}

const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    return { user: null, userProfile: null, loading: true, isArtist: false, isAdmin: false };
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile, loading, isArtist, isAdmin } = useAuth();
  
  return (
    <UserContext.Provider value={{ user, userProfile, loading, isArtist, isAdmin }}>
      {children}
    </UserContext.Provider>
  );
};
