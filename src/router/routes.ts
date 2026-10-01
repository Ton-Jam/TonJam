/**
 * EXACT REPOSITORY DESTINATION ROUTES
 * Locked internal mapping discovered directly from AppRouter.tsx and repository screen registration.
 */

export const APP_ROUTES = {
  HOME: '/',
  EARN_TJ: '/tasks',
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  USER_PROFILE: (id: string) => `/user/${id}`,
  TRACK_DETAIL: (id: string) => `/track/${id}`,
  NFT_DETAIL: (id: string) => `/nft/${id}`,
  PLAYLIST_DETAIL: (id: string) => `/playlist/${id}`,
  COLLECTION_DETAIL: (collectionId: string) => `/collections/${collectionId}`,
  ARTIST_PROFILE: (id: string) => `/artist/${id}`,
  MARKETPLACE: '/marketplace',
  DISCOVER: '/discover',
  JAMSPACE: '/jamspace',
  MINT: '/mint',
  SETTINGS: '/settings',
  WALLET: '/wallet',
  COLLECTIONS: '/collections',
  REFERRALS: '/referrals',
} as const;

export const HOME_DESTINATIONS = {
  earnTJ: APP_ROUTES.EARN_TJ,
  notifications: APP_ROUTES.NOTIFICATIONS,
  profile: APP_ROUTES.PROFILE,
  trackDetail: APP_ROUTES.TRACK_DETAIL,
  nftDetail: APP_ROUTES.NFT_DETAIL,
  playlist: APP_ROUTES.PLAYLIST_DETAIL,
  collection: APP_ROUTES.COLLECTION_DETAIL,
  artist: APP_ROUTES.ARTIST_PROFILE,
} as const;
