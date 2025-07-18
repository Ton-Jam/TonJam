import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FollowContextType {
  following: string[];
  toggleFollow: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export const FollowProvider = ({ children }: { children: ReactNode }) => {
  const [following, setFollowing] = useState<string[]>([]);

  const toggleFollow = (userId: string) => {
    setFollowing(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const isFollowing = (userId: string) => {
    return following.includes(userId);
  };

  return (
    <FollowContext.Provider value={{ following, toggleFollow, isFollowing }}>
      {children}
    </FollowContext.Provider>
  );
};

export const useFollow = (): FollowContextType => {
  const context = useContext(FollowContext);
  if (!context) {
    throw new Error('useFollow must be used within a FollowProvider');
  }
  return context;
};
