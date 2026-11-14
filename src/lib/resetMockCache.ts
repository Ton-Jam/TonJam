import { UserProfile } from '@/types';

export const GUEST_USER_PROFILE: UserProfile = {
  uid: '',
  name: 'Guest Listener',
  username: 'guest',
  avatar: '/placeholders/artist-placeholder.webp',
  bannerUrl: '/default_tonjam_banner.jpg',
  bio: '',
  walletAddress: '',
  followers: 0,
  following: 0,
  earnings: 0,
  isVerifiedArtist: false,
  jamBalance: 0,
  tjBalance: 0,
  tonBalance: 0,
  stakedJam: 0,
  pendingJamRewards: 0,
  autoCompound: false,
  streamingEarnings: 0,
  nftEarnings: 0,
  followedArtists: [],
  followedUserIds: [],
  friends: [],
  likedTrackIds: [],
  ownedTrackIds: [],
  ownedNftIds: [],
  listedNftIds: [],
  createdPlaylistIds: [],
  role: 'collector',
  verificationStatus: 'unverified',
};

const RESET_FLAG_KEY = 'tonjam_data_reset_v2';

const STALE_MOCK_STORAGE_KEYS = [
  'tonjam_nfts',
  'tonjam_library_tracks',
  'tonjam_library_nfts',
  'tonjam-user-storage',
  'tonjam_posts',
  'tonjam_playlists',
  'tonjam_user_bids',
  'tonjam_listen_streak_v1',
  'tonjam_daily_streak',
  'tonjam_earn_tj_tasks_v2',
  'tonjam_livestreams',
  'tonjam_transactions',
  'tonjam_tasks',
  'tonjam_nft_folders',
  'tonjam_collections',
  'tonjam_collab_requests',
  'tonjam_recently_played',
  'tonjam_bookmarks_v1',
];

const STALE_MOCK_PREFIXES = [
  'tonjam_daily_missions_',
  'tonjam_daily_bonus_',
  'tonjam_user_profile_',
];

/**
 * Clears persisted client mock datasets and mock activity caches once so the
 * app boots cleanly with real Firestore state and accurate user activity.
 */
export function resetStaleMockStateOnce(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    if (window.localStorage.getItem(RESET_FLAG_KEY) === 'true') {
      return;
    }

    STALE_MOCK_STORAGE_KEYS.forEach((key) => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Ignore storage removal errors in restricted frames
      }
    });

    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && STALE_MOCK_PREFIXES.some((prefix) => k.startsWith(prefix))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => {
      try {
        window.localStorage.removeItem(k);
      } catch {
        // Ignore
      }
    });

    window.localStorage.setItem(RESET_FLAG_KEY, 'true');
  } catch {
    // Ignore storage access errors in private browsing / sandboxed iframes
  }
}
