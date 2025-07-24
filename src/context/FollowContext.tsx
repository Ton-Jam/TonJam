import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './AuthContext';
import { useAuth } from './AuthContext';

interface FollowContextType {
  followUser: (followedId: string) => Promise<void>;
  unfollowUser: (followedId: string) => Promise<void>;
  isFollowing: (followedId: string) => Promise<boolean>;
  followingCount: number;
  followerCount: number;
  error: string | null;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export function FollowProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [followingCount, setFollowingCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch follow counts on user change
  useEffect(() => {
    const fetchFollowCounts = async () => {
      if (!user) {
        setFollowingCount(0);
        setFollowerCount(0);
        return;
      }
      try {
        // Count users the current user is following
        const { count: following, error: followingError } = await supabase
          .from('follows')
          .select('id', { count: 'exact' })
          .eq('follower_id', user.id);

        // Count users following the current user
        const { count: followers, error: followerError } = await supabase
          .from('follows')
          .select('id', { count: 'exact' })
          .eq('followed_id', user.id);

        if (followingError) throw followingError;
        if (followerError) throw followerError;

        setFollowingCount(following || 0);
        setFollowerCount(followers || 0);
      } catch (err: any) {
        setError(`Failed to fetch follow counts: ${err.message}`);
        console.error('Follow count error:', err);
      }
    };

    fetchFollowCounts();
  }, [user]);

  const followUser = async (followedId: string) => {
    if (!user) {
      setError('You must be logged in to follow users');
      return;
    }
    if (user.id === followedId) {
      setError('You cannot follow yourself');
      return;
    }
    try {
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: user.id, followed_id: followedId });
      if (error) throw error;
      setFollowingCount((prev) => prev + 1);
      setError(null);
    } catch (err: any) {
      setError(`Failed to follow user: ${err.message}`);
      console.error('Follow error:', err);
    }
  };

  const unfollowUser = async (followedId: string) => {
    if (!user) {
      setError('You must be logged in to unfollow users');
      return;
    }
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('followed_id', followedId);
      if (error) throw error;
      setFollowingCount((prev) => prev - 1);
      setError(null);
    } catch (err: any) {
      setError(`Failed to unfollow user: ${err.message}`);
      console.error('Unfollow error:', err);
    }
  };

  const isFollowing = async (followedId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('followed_id', followedId)
        .single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116: no rows found
      return !!data;
    } catch (err: any) {
      setError(`Failed to check follow status: ${err.message}`);
      console.error('IsFollowing error:', err);
      return false;
    }
  };

  return (
    <FollowContext.Provider value={{ followUser, unfollowUser, isFollowing, followingCount, followerCount, error }}>
      {children}
    </FollowContext.Provider>
  );
}

export const useFollow = () => {
  const context = useContext(FollowContext);
  if (!context) throw new Error('useFollow must be used within a FollowProvider');
  return context;
};
