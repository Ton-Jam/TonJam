import React, { createContext, useContext, useState } from 'react';

const FollowContext = createContext<any>(null);

export const FollowProvider = ({ children }: { children: React.ReactNode }) => {
  const [following, setFollowing] = useState<string[]>([]);

  const follow = (id: string) => setFollowing(prev => [...new Set([...prev, id])]);
  const unfollow = (id: string) => setFollowing(prev => prev.filter(f => f !== id));
  const isFollowing = (id: string) => following.includes(id);

  return (
    <FollowContext.Provider value={{ following, follow, unfollow, isFollowing }}>
      {children}
    </FollowContext.Provider>
  );
};

export const useFollow = () => useContext(FollowContext);
