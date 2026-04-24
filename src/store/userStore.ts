import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '@/types';
import { MOCK_USER } from '@/constants';

interface UserState {
  userProfile: UserProfile;
  followedUserIds: string[];
  likedTrackIds: string[];
  // Actions
  setUserProfile: (profile: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  setFollowedUserIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  setLikedTrackIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  toggleFollowUser: (userId: string) => void;
  toggleLikeTrack: (trackId: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userProfile: MOCK_USER,
      followedUserIds: MOCK_USER.followedUserIds || [],
      likedTrackIds: MOCK_USER.likedTrackIds || [],

      setUserProfile: (profile) => set((state) => ({
        userProfile: typeof profile === 'function' ? profile(state.userProfile) : profile
      })),
      
      updateUserProfile: (updates) => set((state) => ({
        userProfile: { ...state.userProfile, ...updates }
      })),

      setFollowedUserIds: (ids) => set((state) => ({ followedUserIds: typeof ids === 'function' ? ids(state.followedUserIds) : ids })),
      
      setLikedTrackIds: (ids) => set((state) => ({ likedTrackIds: typeof ids === 'function' ? ids(state.likedTrackIds) : ids })),

      toggleFollowUser: (userId) => {
        const { followedUserIds } = get();
        if (followedUserIds.includes(userId)) {
          set({ followedUserIds: followedUserIds.filter(id => id !== userId) });
        } else {
          set({ followedUserIds: [...followedUserIds, userId] });
        }
      },

      toggleLikeTrack: (trackId) => {
        const { likedTrackIds } = get();
        if (likedTrackIds.includes(trackId)) {
          set({ likedTrackIds: likedTrackIds.filter(id => id !== trackId) });
        } else {
          set({ likedTrackIds: [...likedTrackIds, trackId] });
        }
      }
    }),
    {
      name: 'tonjam-user-storage',
      partialize: (state) => ({
        userProfile: state.userProfile,
        followedUserIds: state.followedUserIds,
        likedTrackIds: state.likedTrackIds
      })
    }
  )
);
