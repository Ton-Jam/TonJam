import { TonJamNotification, NotificationCategory } from '../types';

export const INITIAL_CURATED_NOTIFICATIONS: Omit<TonJamNotification, 'id' | 'userId'>[] = [
  // TODAY - Fresh activity
  {
    category: 'artist_release',
    title: 'Tiwa Savage released a new track',
    description: 'Discover the latest afrobeat single "Water & Fire" from an artist you follow.',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18m ago
    read: false,
    senderName: 'Tiwa Savage',
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&fit=crop&q=80',
    musicPreview: {
      trackId: 'track-water-fire',
      title: 'Water & Fire',
      artist: 'Tiwa Savage',
      artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&fit=crop&q=80',
      duration: 198,
      isVerified: true,
    },
    quickAction: {
      label: 'Play Track',
      type: 'play',
      payload: { trackId: 'track-water-fire' },
    },
    metadata: {
      trackId: 'track-water-fire',
      artistName: 'Tiwa Savage',
      isVerified: true,
    },
  },
  {
    category: 'auction',
    title: 'New high bid on your Music NFT',
    description: 'Collector @ton_collector placed a top bid of 45.0 TON on "Cosmic Groove #004".',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45m ago
    read: false,
    senderName: 'ton_collector',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&fit=crop&q=80',
    nftPreview: {
      nftId: 'nft-cosmic-groove-004',
      title: 'Cosmic Groove #004',
      thumbnailUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&fit=crop&q=80',
      event: 'bid',
      amountTon: 45.0,
      sellerOrBidder: 'ton_collector',
    },
    quickAction: {
      label: 'View NFT',
      type: 'bid',
      payload: { nftId: 'nft-cosmic-groove-004' },
    },
    metadata: {
      nftId: 'nft-cosmic-groove-004',
      bidAmount: 45.0,
      subCategory: 'new_bid',
    },
  },
  {
    category: 'mention',
    title: 'Luna Ray mentioned you in a discussion',
    description: '@lunaray: "Checking out the stems and master tracks from the latest community session!"',
    timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(), // 1.5h ago
    read: false,
    senderName: 'Luna Ray',
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&fit=crop&q=80',
    socialPreview: {
      postId: 'post-luna-session',
      postExcerpt: 'Checking out the stems and master tracks from the latest community session! Fantastic tonal balance @you',
      targetUser: 'lunaray',
    },
    quickAction: {
      label: 'Reply',
      type: 'reply',
      payload: { postId: 'post-luna-session' },
    },
    metadata: {
      postId: 'post-luna-session',
      isVerified: true,
    },
  },
  {
    category: 'nft_sale',
    title: 'Music NFT Sale Confirmed',
    description: 'Your 1-of-1 audio artifact "Frequency Artifact #012" sold for 28.5 TON.',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3h ago
    read: false,
    senderName: 'TonJam Marketplace',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&fit=crop&q=80',
    nftPreview: {
      nftId: 'nft-freq-012',
      title: 'Frequency Artifact #012',
      thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&fit=crop&q=80',
      event: 'sale',
      amountTon: 28.5,
      txHash: 'EQD3...92aF',
    },
    quickAction: {
      label: 'View NFT',
      type: 'view',
      payload: { nftId: 'nft-freq-012' },
    },
    metadata: {
      nftId: 'nft-freq-012',
      txHash: 'EQD3...92aF',
      rewardAmount: 28.5,
      subCategory: 'sale',
    },
  },
  {
    category: 'follower',
    title: 'Burna Boy started following your profile',
    description: 'Grammy-winning African Giant is now tracking your music releases and JamSpaces.',
    timestamp: new Date(Date.now() - 1000 * 60 * 270).toISOString(), // 4.5h ago
    read: false,
    senderName: 'Burna Boy',
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&fit=crop&q=80',
    quickAction: {
      label: 'Follow Back',
      type: 'follow',
      payload: { userId: 'burna_boy' },
    },
    metadata: {
      userId: 'burna_boy',
      isVerified: true,
    },
  },
  {
    category: 'like',
    title: 'Wizkid liked your soundtrack "Lagos Midnight"',
    description: 'Your sound design is getting love from top verified creators.',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6h ago
    read: true,
    senderName: 'Wizkid',
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&fit=crop&q=80',
    socialPreview: {
      postExcerpt: 'Lagos Midnight (Original Stem Mix) — Pure vibes and master percussion.',
      postId: 'track-lagos-midnight',
    },
    quickAction: {
      label: 'View',
      type: 'view',
      payload: { trackId: 'track-lagos-midnight' },
    },
    metadata: {
      trackId: 'track-lagos-midnight',
      isVerified: true,
    },
  },

  // YESTERDAY
  {
    category: 'auction',
    title: 'Outbid on "Sonic Key #07"',
    description: 'You were outbid by @vibe_architect. The current high bid is now 32.0 TON.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), // 28h ago (Yesterday)
    read: true,
    senderName: 'vibe_architect',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&fit=crop&q=80',
    nftPreview: {
      nftId: 'nft-sonic-key-07',
      title: 'Sonic Key #07',
      thumbnailUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&fit=crop&q=80',
      event: 'outbid',
      amountTon: 32.0,
      sellerOrBidder: 'vibe_architect',
    },
    quickAction: {
      label: 'Counter Bid',
      type: 'bid',
      payload: { nftId: 'nft-sonic-key-07' },
    },
    metadata: {
      nftId: 'nft-sonic-key-07',
      bidAmount: 32.0,
      subCategory: 'outbid',
    },
  },
  {
    category: 'music',
    title: 'Live JamSpace session in progress',
    description: 'Nadia Synth is hosting an open audio collaboration room with 142 listeners.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 32).toISOString(), // 32h ago (Yesterday)
    read: true,
    senderName: 'Nadia Synth',
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&fit=crop&q=80',
    musicPreview: {
      trackId: 'jamspace-live-synth',
      title: 'Deep House & Modular Synthesis',
      artist: 'Nadia Synth',
      artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&fit=crop&q=80',
      isVerified: true,
    },
    quickAction: {
      label: 'Join Space',
      type: 'join',
      payload: { spaceId: 'jamspace-live-synth' },
    },
    metadata: {
      spaceId: 'jamspace-live-synth',
      subCategory: 'jamspace',
      isVerified: true,
    },
  },
  {
    category: 'comment',
    title: 'Dmitry TON replied to your stem drop',
    description: '@dmitry_ton: "The sub bass progression on the 2nd chorus is phenomenal!"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 38).toISOString(), // 38h ago (Yesterday)
    read: true,
    senderName: 'Dmitry TON',
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&fit=crop&q=80',
    socialPreview: {
      postId: 'stem-drop-chorus',
      postExcerpt: 'The sub bass progression on the 2nd chorus is phenomenal! Would love to mint a remix on TON.',
      targetUser: 'dmitry_ton',
    },
    quickAction: {
      label: 'Reply',
      type: 'reply',
      payload: { commentId: 'comment-sub-bass' },
    },
    metadata: {
      commentId: 'comment-sub-bass',
      isVerified: true,
    },
  },

  // EARLIER
  {
    category: 'system',
    title: 'Artist Verification Approved',
    description: 'Your TonJam Creator Verification has been validated by the protocol. Enjoy zero-gas minting!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 84).toISOString(), // 3.5 days ago (Earlier)
    read: true,
    senderName: 'TonJam Security',
    quickAction: {
      label: 'View Badge',
      type: 'view',
      payload: { section: 'profile' },
    },
    metadata: {
      subCategory: 'verification',
    },
  },
  {
    category: 'royalty',
    title: 'Streaming Royalty Disbursed',
    description: '+12.45 TON was deposited to your linked TON wallet from decentralized streams.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(), // 5 days ago (Earlier)
    read: true,
    senderName: 'TonJam Royalties',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&fit=crop&q=80',
    quickAction: {
      label: 'View Wallet',
      type: 'view',
      payload: { section: 'wallet' },
    },
    metadata: {
      rewardAmount: 12.45,
      subCategory: 'royalty',
    },
  },
  {
    category: 'marketplace',
    title: 'New Genesis Collection Open for Minting',
    description: 'Snoop Dogg dropped exclusive TON audio passes with lifetime streaming perks.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(), // 7 days ago (Earlier)
    read: true,
    senderName: 'Snoop Dogg',
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&fit=crop&q=80',
    nftPreview: {
      nftId: 'nft-snoop-genesis',
      title: 'Death Row TON Pass #001',
      thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&fit=crop&q=80',
      event: 'minted',
      amountTon: 25.0,
      sellerOrBidder: 'Snoop Dogg',
    },
    quickAction: {
      label: 'View NFT',
      type: 'mint',
      payload: { nftId: 'nft-snoop-genesis' },
    },
    metadata: {
      nftId: 'nft-snoop-genesis',
      isVerified: true,
    },
  },
];

export const generateMockNotifications = (userId: string): TonJamNotification[] => {
  return INITIAL_CURATED_NOTIFICATIONS.map((item, index) => ({
    ...item,
    id: `tonjam-notif-${index + 1}`,
    userId,
  }));
};
