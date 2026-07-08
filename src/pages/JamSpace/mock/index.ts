import { User, Artist, Community, Post, Space, NFTDiscussion, MusicNews, Event, JamSpaceNotification } from '../types';

export const MOCK_USERS: Record<string, User> = {
  krupy: {
    id: 'u-1',
    name: 'DJ Krupy',
    username: '@djkrupy',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    isVerified: true,
    contributionPoints: 12450,
    badges: ['👑 Creator King', '⚡ Early Adopter', '💎 TON OG'],
    role: 'artist'
  },
  neon_voyager: {
    id: 'u-2',
    name: 'Neon Voyager',
    username: '@neonvoyager',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    isVerified: true,
    contributionPoints: 8900,
    badges: ['🎵 Synth Lord', '🧬 NFT Curator'],
    role: 'artist'
  },
  ton_whaler: {
    id: 'u-3',
    name: 'TON Whaler',
    username: '@tonwhaler',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    isVerified: false,
    contributionPoints: 15400,
    badges: ['🐋 Whale Collector', '🏆 Top Contributor'],
    role: 'fan'
  },
  cyber_fan: {
    id: 'u-4',
    name: 'Cyber Fan',
    username: '@cyberfan99',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    isVerified: false,
    contributionPoints: 4200,
    badges: ['🔥 Daily Streaker', '🎵 Audiophile'],
    role: 'fan'
  },
  amapiano_queen: {
    id: 'u-5',
    name: 'Amapiano Queen',
    username: '@amapianoqueen',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
    isVerified: true,
    contributionPoints: 9150,
    badges: ['🎹 Amapiano Elite', '🎤 Mic Controller'],
    role: 'artist'
  },
  beat_architect: {
    id: 'u-6',
    name: 'Beat Architect',
    username: '@beatarchitect',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    isVerified: true,
    contributionPoints: 7340,
    badges: ['🎛️ Master Producer', '🦾 Sonic Alchemist'],
    role: 'artist'
  }
};

export const MOCK_ARTISTS: Artist[] = [
  {
    id: 'a-1',
    name: 'DJ Krupy',
    handle: 'djkrupy',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    genre: 'Amapiano & Afro-House',
    followersCount: 42300,
    trackCount: 18,
    nftCount: 12,
    isVerified: true
  },
  {
    id: 'a-2',
    name: 'Neon Voyager',
    handle: 'neonvoyager',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    genre: 'Synthwave & Electronic',
    followersCount: 28900,
    trackCount: 14,
    nftCount: 8,
    isVerified: true
  },
  {
    id: 'a-3',
    name: 'Amapiano Queen',
    handle: 'amapianoqueen',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
    genre: 'Amapiano & Kwaito',
    followersCount: 35100,
    trackCount: 22,
    nftCount: 15,
    isVerified: true
  }
];

export const MOCK_COMMUNITIES: Community[] = [
  {
    id: 'c-1',
    name: 'TON NFT Music Collectors',
    description: 'The premier community for collectors of audio NFTs, limited-edition sound drops, and visual-audio collaborations on TON.',
    category: 'NFTs',
    memberCount: 8450,
    liveSpacesCount: 1,
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    joined: true
  },
  {
    id: 'c-2',
    name: 'Afrobeats Worldwide',
    description: 'Celebrating the heavy rhythms, infectious melodies, and major artists driving the modern African sound global.',
    category: 'Afrobeats',
    memberCount: 14300,
    liveSpacesCount: 2,
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80',
    joined: false
  },
  {
    id: 'c-3',
    name: 'Amapiano Lounge',
    description: 'For lovers of deep house, jazz, and lounge-inspired basslines. Log in, share your latest tracks, and vibe with piano heads.',
    category: 'Amapiano',
    memberCount: 11200,
    liveSpacesCount: 0,
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80',
    joined: false
  },
  {
    id: 'c-4',
    name: 'Synthwave & Retrowave Lounge',
    description: 'Outrun the grid with 80s nostalgic synths, neon grids, and vintage analog drum machine loops.',
    category: 'Electronic',
    memberCount: 6800,
    liveSpacesCount: 1,
    imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=300&q=80',
    joined: true
  }
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'p-1',
    user: MOCK_USERS.krupy,
    content: '🚨 JUST IN: I am dropping my exclusive limited-edition "Yanos Awakening" NFT track tomorrow on TonJam! Fully loaded with live acoustic marimbas and heavy log drum loops. Royalties are set at 10% to all initial holders. Let me know what you think of the snippet below! 👇 #Amapiano #TONNFT',
    timestamp: '2 hours ago',
    likes: 342,
    commentsCount: 89,
    reposts: 54,
    isPinned: true,
    category: 'Artists',
    isLiked: true,
    attachments: [
      {
        type: 'track',
        id: 't-yanos',
        title: 'Yanos Awakening (Acoustic Club Snippet)',
        artist: 'DJ Krupy',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
      }
    ]
  },
  {
    id: 'p-2',
    user: MOCK_USERS.neon_voyager,
    content: 'Which digital synthesizers should I dive deep into for the live space tonight? Running a masterclass on sound design and minting stem NFTs on the TON network.',
    timestamp: '4 hours ago',
    likes: 189,
    commentsCount: 65,
    reposts: 22,
    category: 'Spaces',
    poll: {
      question: 'Synthesis Engine Preference',
      options: [
        { text: 'Analog Model (Moog / Sequential)', votes: 245 },
        { text: 'FM Synthesis (DX7 Style)', votes: 112 },
        { text: 'Wavetable (Serum / Pigments)', votes: 310 },
        { text: 'Physical Modeling (Modular Keys)', votes: 85 }
      ],
      totalVotes: 752,
      votedIndex: 2
    }
  },
  {
    id: 'p-3',
    user: MOCK_USERS.ton_whaler,
    content: 'Just swept the floor of DJ Krupy\'s retro-futurism collection! Sound design is crisp and the smart contracts on TON are operating with flawless speed. Check out the latest addition to my vault.',
    timestamp: '6 hours ago',
    likes: 95,
    commentsCount: 14,
    reposts: 8,
    category: 'NFTs',
    attachments: [
      {
        type: 'nft',
        id: 'nft-retro-1',
        title: 'Retro-Futurism Soundscape #04',
        artist: 'DJ Krupy',
        price: '45 TON',
        url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80'
      }
    ]
  },
  {
    id: 'p-4',
    user: MOCK_USERS.cyber_fan,
    content: 'This new track from Neon Voyager is absolutely incredible. Listening on loop while trading jettons. The bassline completely drives the groove! #Synthwave',
    timestamp: '8 hours ago',
    likes: 54,
    commentsCount: 12,
    reposts: 4,
    category: 'Fans',
    attachments: [
      {
        type: 'track',
        id: 't-neon-space',
        title: 'Cosmic Drive (Radio Edit)',
        artist: 'Neon Voyager',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
      }
    ]
  },
  {
    id: 'p-5',
    user: MOCK_USERS.amapiano_queen,
    content: 'Pre-production for my next album in Johannesburg is going crazy! Standardizing raw percussions with dynamic 808s. Who wants an early beta leak link inside their Telegram client? 🇿🇦🔥',
    timestamp: '1 day ago',
    likes: 512,
    commentsCount: 142,
    reposts: 95,
    category: 'Artists',
    attachments: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80'
      }
    ]
  }
];

export const MOCK_SPACES: Space[] = [
  {
    id: 's-1',
    title: 'Amapiano Global Takeover & NFT Utility Discussion',
    host: MOCK_USERS.krupy,
    listenerCount: 1240,
    speakerAvatars: [
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
    ],
    isLive: true,
    description: 'Discussing the future of Amapiano distribution using TON smart contracts and rewarding direct community contributions.',
    speakers: ['DJ Krupy', 'Amapiano Queen', 'Beat Architect']
  },
  {
    id: 's-2',
    title: 'Sound Design 101: Synthesis & Stem Royalties',
    host: MOCK_USERS.neon_voyager,
    listenerCount: 520,
    speakerAvatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    ],
    isLive: true,
    description: 'Learn how to split audio stems and bundle them as smart contracts on TON for passive royalty streams.',
    speakers: ['Neon Voyager', 'TON Whaler']
  },
  {
    id: 's-3',
    title: 'Sonic Alchemy Live Stream Listening Session',
    host: MOCK_USERS.beat_architect,
    listenerCount: 0,
    speakerAvatars: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
    ],
    isLive: false,
    scheduledTime: 'Today at 8:00 PM',
    description: 'An exclusive play-through of Beat Architect\'s brand-new concept EP "Alloy Sparks". Includes active collector Q&A.',
    speakers: ['Beat Architect']
  }
];

export const MOCK_NFT_DISCUSSIONS: NFTDiscussion[] = [
  {
    id: 'n-1',
    title: 'Amapiano Legacy Stem Pack #01',
    imageUrl: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?auto=format&fit=crop&w=400&q=80',
    currentBid: '150 TON',
    timeLeft: '4h 12m',
    author: 'DJ Krupy',
    royaltyPercent: 12,
    marketplaceUrl: '/explore/nfts',
    royaltiesEarned: '450 TON',
    bidsCount: 18
  },
  {
    id: 'n-2',
    title: 'Neon Odyssey Synth Stem Pack',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    currentBid: '85 TON',
    timeLeft: '12h 45m',
    author: 'Neon Voyager',
    royaltyPercent: 10,
    marketplaceUrl: '/explore/nfts',
    royaltiesEarned: '210 TON',
    bidsCount: 9
  }
];

export const MOCK_NEWS: MusicNews[] = [
  {
    id: 'nw-1',
    title: 'TonJam Upgrades Smart Contract Protocol to V4',
    summary: 'The latest network upgrade decreases gas costs for audio mints by 45%, enabling high-frequency drops and decentralized storage integration.',
    category: 'announcement',
    timestamp: 'Today',
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=300&q=80',
    readTime: '3 min read'
  },
  {
    id: 'nw-2',
    title: 'DJ Krupy Reaches Over 100k total streams on TON network',
    summary: 'With his pioneering Amapiano audio-visual collections, the Johannesburg DJ has officially set a record for organic listener engagements.',
    category: 'release',
    timestamp: 'Yesterday',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80',
    readTime: '4 min read'
  }
];

export const MOCK_EVENTS: Event[] = [
  {
    id: 'ev-1',
    title: 'Genesis Node Club Night (Virtual Venue)',
    type: 'concert',
    date: 'July 12, 2026',
    location: 'TonJam Global Audio Node',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80',
    host: 'DJ Krupy',
    interestedCount: 1420,
    interested: true
  },
  {
    id: 'ev-2',
    title: 'Limited Edition Sound-Vibe NFT Auction',
    type: 'nft',
    date: 'July 15, 2026',
    location: 'TonJam Digital Auction Block',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
    host: 'Neon Voyager',
    interestedCount: 840,
    interested: false
  }
];

export const MOCK_NOTIFICATIONS: JamSpaceNotification[] = [
  {
    id: 'nt-1',
    type: 'like',
    user: MOCK_USERS.cyber_fan,
    content: 'liked your post about "Yanos Awakening" stem splits.',
    timestamp: '5m ago',
    read: false
  },
  {
    id: 'nt-2',
    type: 'reply',
    user: MOCK_USERS.amapiano_queen,
    content: 'commented: "Let\'s do a live back-to-back set in the Pretoria Node next week!"',
    timestamp: '1h ago',
    read: false
  },
  {
    id: 'nt-3',
    type: 'follow',
    user: MOCK_USERS.ton_whaler,
    content: 'started following you. They hold 15 of your limited audio NFTs!',
    timestamp: '4h ago',
    read: true
  }
];

export const MOCK_LEADERBOARD = [
  {
    rank: 1,
    user: MOCK_USERS.ton_whaler,
    score: 15400,
    badge: '👑 Master Collector'
  },
  {
    rank: 2,
    user: MOCK_USERS.krupy,
    score: 12450,
    badge: '🎙️ Amplified Creator'
  },
  {
    rank: 3,
    user: MOCK_USERS.amapiano_queen,
    score: 9150,
    badge: '💎 Golden Ear'
  },
  {
    rank: 4,
    user: MOCK_USERS.neon_voyager,
    score: 8900,
    badge: '🚀 Synth Pioneer'
  }
];
