import { Track, NFTItem, Artist, Post, Playlist, UserProfile } from './types';

// Official TonJam Brand Assets
export const APP_LOGO = "https://i.postimg.cc/63GsZHzq/TonJam-icon.png"; 
export const TJ_COIN_ICON = "https://i.postimg.cc/s2QHHMSF/TonjamCoin.png"; 
export const TON_LOGO = "https://i.postimg.cc/jj7HksNw/ton-symbol.png";

// Placeholder price for TJ Coin (JAM) in USD
export const JAM_PRICE_USD = 0.052;

export const MOCK_TRACKS: Track[] = [
  { 
    id: '1', 
    title: 'Solar Pulse', 
    artist: 'Neon Voyager', 
    artistId: 'a1', 
    coverUrl: 'https://picsum.photos/400/400?random=1', 
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 
    duration: 210, 
    genre: 'Electronic', 
    isNFT: true, 
    artistVerified: true, 
    price: '2.5', 
    bpm: 128, 
    key: 'C# min', 
    bitrate: 'FLAC', 
    playCount: 12500, 
    likes: 840, 
    releaseDate: '2023-10-15',
    cid: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    ipfsUrl: 'ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco'
  },
  { 
    id: '2', 
    title: 'Cyber Drift', 
    artist: 'Byte Beat', 
    artistId: 'a2', 
    coverUrl: 'https://picsum.photos/400/400?random=2', 
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 
    duration: 185, 
    genre: 'Synthwave', 
    isNFT: false, 
    artistVerified: true, 
    bpm: 110, 
    key: 'D maj', 
    bitrate: '320kbps', 
    playCount: 8400, 
    likes: 420, 
    releaseDate: '2023-11-02',
    cid: 'QmZ4tjBvTfH2fX9y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1',
    ipfsUrl: 'ipfs://QmZ4tjBvTfH2fX9y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1'
  },
  { 
    id: '3', 
    title: 'Deep Horizon', 
    artist: 'Echo Phase', 
    artistId: 'a3', 
    coverUrl: 'https://picsum.photos/400/400?random=3', 
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 
    duration: 245, 
    genre: 'Ambient', 
    isNFT: true, 
    artistVerified: false, 
    price: '5.0', 
    bpm: 85, 
    key: 'A min', 
    bitrate: 'FLAC', 
    playCount: 15600, 
    likes: 1200, 
    releaseDate: '2023-09-20',
    cid: 'QmT7y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1',
    ipfsUrl: 'ipfs://QmT7y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1'
  },
  { 
    id: '4', 
    title: 'Velvet Sky', 
    artist: 'Luna Ray', 
    artistId: 'a4', 
    coverUrl: 'https://picsum.photos/400/400?random=4', 
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 
    duration: 195, 
    genre: 'Pop', 
    isNFT: false, 
    artistVerified: true, 
    bpm: 120, 
    key: 'G maj', 
    bitrate: '320kbps', 
    playCount: 22000, 
    likes: 3100, 
    releaseDate: '2023-12-01' 
  },
  { 
    id: '5', 
    title: 'Neon Nights', 
    artist: 'City Ghost', 
    artistId: 'a5', 
    coverUrl: 'https://picsum.photos/400/400?random=5', 
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 
    duration: 220, 
    genre: 'Electronic', 
    isNFT: true, 
    artistVerified: false, 
    price: '1.2', 
    bpm: 124, 
    key: 'F# min', 
    bitrate: '320kbps', 
    playCount: 5400, 
    likes: 210, 
    releaseDate: '2023-11-28' 
  },
  { 
    id: '6', 
    title: 'Prism Shift', 
    artist: 'Prism Core', 
    artistId: 'a6', 
    coverUrl: 'https://picsum.photos/400/400?random=6', 
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', 
    duration: 205, 
    genre: 'Techno', 
    isNFT: true, 
    artistVerified: true, 
    price: '3.0', 
    bpm: 132, 
    key: 'E min', 
    bitrate: 'FLAC', 
    playCount: 9800, 
    likes: 650, 
    releaseDate: '2023-10-30' 
  },
  { 
    id: '7', 
    title: 'Midnight Drive', 
    artist: 'Neon Voyager', 
    artistId: 'a1', 
    coverUrl: 'https://picsum.photos/400/400?random=7', 
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', 
    duration: 190, 
    genre: 'Synthwave', 
    isNFT: false, 
    artistVerified: true, 
    playCount: 4500, 
    likes: 320, 
    releaseDate: '2024-01-15' 
  },
  { 
    id: '8', 
    title: 'Ocean Breeze', 
    artist: 'Luna Ray', 
    artistId: 'a4', 
    coverUrl: 'https://picsum.photos/400/400?random=8', 
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', 
    duration: 230, 
    genre: 'Ambient', 
    isNFT: true, 
    artistVerified: true, 
    price: '4.5', 
    playCount: 12000, 
    likes: 950, 
    releaseDate: '2024-02-10' 
  },
  { 
    id: '9', 
    title: 'Glitch City', 
    artist: 'Byte Beat', 
    artistId: 'a2', 
    coverUrl: 'https://picsum.photos/400/400?random=9', 
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', 
    duration: 175, 
    genre: 'Electronic', 
    isNFT: false, 
    artistVerified: true, 
    playCount: 6700, 
    likes: 480, 
    releaseDate: '2024-02-28' 
  },
  { 
    id: '10', 
    title: 'Static Void', 
    artist: 'Echo Phase', 
    artistId: 'a3', 
    coverUrl: 'https://picsum.photos/400/400?random=10', 
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', 
    duration: 300, 
    genre: 'Ambient', 
    isNFT: true, 
    artistVerified: false, 
    price: '10.0', 
    playCount: 3400, 
    likes: 150, 
    releaseDate: '2024-03-01' 
  },
];

export const GENRES = [
  { id: 'electronic', name: 'Electronic', icon: '⚡', color: 'from-blue-500 to-cyan-500' },
  { id: 'synthwave', name: 'Synthwave', icon: '🌃', color: 'from-pink-500 to-purple-500' },
  { id: 'ambient', name: 'Ambient', icon: '🌊', color: 'from-emerald-500 to-teal-500' },
  { id: 'pop', name: 'Pop', icon: '✨', color: 'from-yellow-400 to-orange-500' },
  { id: 'techno', name: 'Techno', icon: '🏭', color: 'from-red-500 to-rose-600' },
  { id: 'lofi', name: 'Lo-Fi', icon: '☕', color: 'from-stone-500 to-neutral-600' },
];

export const CURATED_PLAYLISTS: Playlist[] = [
  { 
    id: 'curated-1', 
    title: 'TON Top 50', 
    coverUrl: 'https://picsum.photos/600/600?random=101', 
    trackCount: 10, 
    creator: 'TonJam Editorial', 
    description: 'The most streamed tracks on the TON network this week.',
    trackIds: ['4', '3', '1', '8', '6', '2', '9', '5', '7', '10']
  },
  { 
    id: 'curated-2', 
    title: 'NFT Alpha', 
    coverUrl: 'https://picsum.photos/600/600?random=102', 
    trackCount: 5, 
    creator: 'TonJam Curators', 
    description: 'Rare music NFTs currently trending in the marketplace.',
    trackIds: ['1', '3', '6', '8', '10']
  },
  { 
    id: 'curated-3', 
    title: 'Cyberpunk 2026', 
    coverUrl: 'https://picsum.photos/600/600?random=103', 
    trackCount: 4, 
    creator: 'Neon Voyager', 
    description: 'A collection of high-energy synthwave and techno for the digital age.',
    trackIds: ['2', '6', '7', '9']
  }
];

export const MOCK_USER: UserProfile = {
  id: 'u1',
  name: 'CryptoPioneer',
  handle: '@pioneer_ton',
  avatar: 'https://picsum.photos/200/200?random=50',
  bannerUrl: 'https://picsum.photos/1200/400?random=99',
  bio: 'Exploring the intersection of TON blockchain and underground electronic beats. Collector of rare synthwave NFTs.',
  walletAddress: 'UQCc...8xZ2',
  followers: 1240,
  following: 562,
  earnings: '124.5',
  isVerifiedArtist: true,
  streamingEarnings: '45.2',
  nftEarnings: '79.3',
  followedArtists: ['a1', 'a2', 'a4'],
  followedUserIds: ['u2', 'u3'],
  friends: ['u2', 'u3'],
  socials: {
    x: 'https://x.com/pioneer_ton',
    instagram: 'https://instagram.com/pioneer_ton',
    telegram: 'https://t.me/pioneer_ton'
  }
};

export const MOCK_NFTS: NFTItem[] = [
  { 
    id: 'n1', 
    trackId: '1', 
    title: 'Solar Pulse #001', 
    owner: 'Neon Voyager', 
    creator: 'Neon Voyager', 
    price: '12', 
    imageUrl: 'https://picsum.photos/600/600?random=11', 
    edition: 'Unique',
    contractAddress: 'EQD4FP_S54FpX9y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1_P',
    royaltySplits: [{ address: 'Neon Voyager', percentage: 7.5 }],
    stems_available: true,
    description: 'The first ever unique edition of Solar Pulse. Includes high-fidelity stem access and a VIP pass to the upcoming Neon Voyager virtual concert.',
    listingType: 'auction',
    auctionEndTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Ends in 24h
    startingBid: '5.0',
    traits: [
      { trait_type: 'Bitrate', value: 'FLAC' },
      { trait_type: 'Scale', value: 'C# Minor' },
      { trait_type: 'Access', value: 'VIP Stems' },
      { trait_type: 'Rarity', value: 'Mythic' }
    ],
    history: [
      { event: 'Minted', from: '0x000...000', to: 'Neon Voyager', date: '2023-10-01' },
      { event: 'Auction Started', from: 'Neon Voyager', to: 'Marketplace', date: '2023-10-02', price: '5' }
    ],
    offers: [
      { id: 'off1', offerer: 'UQDa...X9y1', price: '12', duration: '3 days', timestamp: '2023-10-06' },
      { id: 'off2', offerer: '0xTon...A12B', price: '10.5', duration: '1 day', timestamp: '2023-10-05' },
      { id: 'off3', offerer: 'UQCc...8xZ2', price: '8', duration: 'Expired', timestamp: '2023-10-01' }
    ]
  },
  { 
    id: 'n2', 
    trackId: '3', 
    title: 'Deep Horizon #042', 
    owner: '0xTon...A12B', 
    creator: 'Echo Phase', 
    price: '45', 
    imageUrl: 'https://picsum.photos/600/600?random=12', 
    edition: 'Limited',
    listingType: 'fixed',
    contractAddress: 'EQBj_K4m0_UQCc_8xZ2_8xZ2_8xZ2_8xZ2_8xZ2_8xZ2_8xZ2_L',
    royaltySplits: [{ address: 'Echo Phase', percentage: 5.0 }],
    stems_available: false,
    description: 'Part of the Deep Horizon limited series. Capturing the essence of digital twilight.',
    traits: [
      { trait_type: 'Bitrate', value: '320kbps' },
      { trait_type: 'Vibe', value: 'Chilled' },
      { trait_type: 'Rarity', value: 'Legendary' }
    ],
    history: [
      { event: 'Minted', from: '0x000...000', to: 'Echo Phase', date: '2023-09-15' },
      { event: 'Sale', from: 'Echo Phase', to: '0xTon...A12B', date: '2023-09-20', price: '45' }
    ],
    offers: [
      { id: 'off3', offerer: 'UQCc...8xZ2', price: '40', duration: '7 days', timestamp: '2023-11-01' },
      { id: 'off4', offerer: 'UQDa...X9y1', price: '35', duration: 'Expired', timestamp: '2023-10-25' }
    ]
  },
  { 
    id: 'n3', 
    trackId: '5', 
    title: 'Neon Nights #101', 
    owner: 'UQCc...8xZ2', 
    creator: 'City Ghost', 
    price: '8', 
    imageUrl: 'https://picsum.photos/600/600?random=13', 
    edition: 'Rare',
    listingType: 'fixed',
    contractAddress: 'EQE998_CityGhost_CityGhost_CityGhost_CityGhost_R',
    royaltySplits: [{ address: 'City Ghost', percentage: 10.0 }],
    stems_available: true,
    description: 'Electric energy captured in a digital bottle. A rare collectible from City Ghost.',
    traits: [
      { trait_type: 'Bitrate', value: '320kbps' },
      { trait_type: 'Instrument', value: 'Moog Synth' },
      { trait_type: 'Rarity', value: 'Rare' }
    ],
    history: [
      { event: 'Minted', from: '0x000...000', to: 'City Ghost', date: '2023-11-10' },
      { event: 'Sale', from: 'City Ghost', to: 'UQCc...8xZ2', date: '2023-11-12', price: '8' }
    ],
    offers: [
      { id: 'off_n3_1', offerer: '0xTon...A12B', price: '15', duration: '2 days', timestamp: '2023-11-15' },
      { id: 'off_n3_2', offerer: 'Neon Voyager', price: '12', duration: '5 days', timestamp: '2023-11-14' }
    ]
  },
  { 
    id: 'n4', 
    trackId: '6', 
    title: 'Prism Shift #001', 
    owner: 'Prism Core', 
    creator: 'Prism Core', 
    price: '25', 
    imageUrl: 'https://picsum.photos/600/600?random=14', 
    edition: 'Unique',
    listingType: 'auction',
    auctionEndTime: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    contractAddress: 'EQPrism_Core_Unique_001',
    royaltySplits: [{ address: 'Prism Core', percentage: 8.0 }],
    stems_available: true,
    description: 'The genesis unique edition of Prism Shift. A masterpiece of experimental techno.',
    traits: [
      { trait_type: 'Genre', value: 'Techno' },
      { trait_type: 'Energy', value: 'High' }
    ],
    history: [],
    offers: []
  },
  { 
    id: 'n5', 
    trackId: '1', 
    title: 'Solar Pulse #002', 
    owner: 'Neon Voyager', 
    creator: 'Neon Voyager', 
    price: '10', 
    imageUrl: 'https://picsum.photos/600/600?random=15', 
    edition: 'Limited',
    listingType: 'fixed',
    contractAddress: 'EQD4FP_Solar_Pulse_002',
    royaltySplits: [{ address: 'Neon Voyager', percentage: 7.5 }],
    stems_available: true,
    description: 'Second edition of the Solar Pulse series.',
    traits: [
      { trait_type: 'Bitrate', value: 'FLAC' },
      { trait_type: 'Rarity', value: 'Rare' }
    ],
    history: [],
    offers: []
  },
];

export const MOCK_ARTISTS: Artist[] = [
  { 
    id: 'a1', 
    name: 'Neon Voyager', 
    walletAddress: 'EQD4FP_Neon_Voyager_Wallet_Address_X9y1',
    avatarUrl: 'https://picsum.photos/200/200?random=21', 
    followers: 12400, 
    verified: true,
    isVerifiedArtist: true,
    genre: 'Electronic',
    bio: "Pioneering the sound of the digital frontier. Synthwave frequencies forged in the TON core.",
    bannerUrl: "https://picsum.photos/1200/400?random=1001",
    socials: { x: 'https://x.com/neon_voyager', spotify: 'https://spotify.com/artist/neon_voyager', instagram: 'https://instagram.com/neon_voyager' },
    royaltyConfig: { streamingPercentage: 0.05, nftSaleShare: 0.10 },
    earnings: { streaming: '12.4', nftSales: '45.2', total: '57.6' }
  },
  { 
    id: 'a2', 
    name: 'Byte Beat', 
    walletAddress: 'EQB_Byte_Beat_Wallet_Address_7777',
    avatarUrl: 'https://picsum.photos/200/200?random=22', 
    followers: 8900, 
    verified: true,
    isVerifiedArtist: true,
    genre: 'Synthwave',
    bio: "Algorithmically generated beats for the decentralized generation.",
    bannerUrl: "https://picsum.photos/1200/400?random=1002",
    socials: { x: 'https://x.com/byte_beat', spotify: 'https://spotify.com/artist/byte_beat' },
    royaltyConfig: { streamingPercentage: 0.04, nftSaleShare: 0.08 },
    earnings: { streaming: '5.2', nftSales: '12.8', total: '18.0' }
  },
  { 
    id: 'a3', 
    name: 'Echo Phase', 
    walletAddress: 'EQE_Echo_Phase_Wallet_Address_8888',
    avatarUrl: 'https://picsum.photos/200/200?random=23', 
    followers: 5600, 
    verified: false,
    isVerifiedArtist: false,
    genre: 'Ambient',
    bio: "Ambient explorations through the blockchain void.",
    bannerUrl: "https://picsum.photos/1200/400?random=1003",
    socials: { website: 'https://echophase.io' },
    royaltyConfig: { streamingPercentage: 0.03, nftSaleShare: 0.05 },
    earnings: { streaming: '2.1', nftSales: '8.5', total: '10.6' }
  },
  { 
    id: 'a4', 
    name: 'Luna Ray', 
    walletAddress: 'EQL_Luna_Ray_Wallet_Address_9999',
    avatarUrl: 'https://picsum.photos/200/200?random=24', 
    followers: 15200, 
    verified: true,
    isVerifiedArtist: true,
    genre: 'Pop',
    bio: "Ethereal pop melodies floating on top of complex electronic soundscapes.",
    bannerUrl: "https://picsum.photos/1200/400?random=1004",
    socials: { x: 'https://x.com/lunaray', instagram: 'https://instagram.com/lunaray' },
    royaltyConfig: { streamingPercentage: 0.06, nftSaleShare: 0.12 },
    earnings: { streaming: '18.5', nftSales: '32.1', total: '50.6' }
  },
  { 
    id: 'a5', 
    name: 'City Ghost', 
    walletAddress: 'EQC_City_Ghost_Wallet_Address_5555',
    avatarUrl: 'https://picsum.photos/200/200?random=25', 
    followers: 4300, 
    verified: false,
    isVerifiedArtist: false,
    genre: 'Electronic',
    bio: "Lo-fi beats captured from the heart of the urban jungle.",
    bannerUrl: "https://picsum.photos/1200/400?random=1005",
    socials: { spotify: 'https://spotify.com/artist/cityghost' },
    royaltyConfig: { streamingPercentage: 0.02, nftSaleShare: 0.04 },
    earnings: { streaming: '1.2', nftSales: '4.3', total: '5.5' }
  },
  { 
    id: 'a6', 
    name: 'Prism Core', 
    walletAddress: 'EQP_Prism_Core_Wallet_Address_1111',
    avatarUrl: 'https://picsum.photos/200/200?random=26', 
    followers: 7800, 
    verified: true,
    isVerifiedArtist: true,
    genre: 'Techno',
    bio: "Shattering sonic boundaries with experimental techno and hard-hitting rhythms.",
    bannerUrl: "https://picsum.photos/1200/400?random=1006",
    socials: { x: 'https://x.com/prismcore', website: 'https://prismcore.tech' },
    royaltyConfig: { streamingPercentage: 0.05, nftSaleShare: 0.10 },
    earnings: { streaming: '8.4', nftSales: '22.1', total: '30.5' }
  },
];

export const MOCK_POSTS: Post[] = [
  { 
    id: 'p1', 
    userId: 'u1', 
    userName: 'Alex Rivera', 
    userAvatar: 'https://picsum.photos/100/100?random=31', 
    content: 'Just dropped my new single on TonJam! Check it out.', 
    trackId: '1', 
    likes: 245, 
    reposts: 42,
    isLiked: true,
    isReposted: false,
    comments: 2, 
    timestamp: '2h ago',
    commentList: [
      {
        id: 'c1',
        userId: 'u2',
        userName: 'Sarah Jenkins',
        userAvatar: 'https://picsum.photos/100/100?random=32',
        content: 'This is fire! 🔥',
        timestamp: '1h ago',
        likes: 12,
        reactions: { '🔥': 5 },
        userReactions: ['🔥']
      },
      {
        id: 'c2',
        userId: 'a1',
        userName: 'Neon Voyager',
        userAvatar: 'https://picsum.photos/200/200?random=21',
        content: 'Great work on the production here.',
        timestamp: '30m ago',
        likes: 8,
        reactions: { '🚀': 3 },
        userReactions: []
      }
    ]
  },
  { 
    id: 'p2', 
    userId: 'u2', 
    userName: 'Sarah Jenkins', 
    userAvatar: 'https://picsum.photos/100/100?random=32', 
    content: 'The marketplace is booming today. Nabbed a Neon Voyager NFT!', 
    nftId: 'nft1',
    likes: 89, 
    reposts: 15,
    isLiked: false,
    isReposted: true,
    comments: 1, 
    timestamp: '4h ago',
    commentList: [
      {
        id: 'c3',
        userId: 'u1',
        userName: 'CryptoPioneer',
        userAvatar: 'https://picsum.photos/200/200?random=50',
        content: 'Nice grab! That one is a classic.',
        timestamp: '2h ago',
        likes: 4
      }
    ]
  },
  {
    id: 'p3',
    userId: 'a2',
    userName: 'Byte Beat',
    userAvatar: 'https://picsum.photos/200/200?random=22',
    content: 'Working on some new neural frequencies. Stay tuned for the drop! 🎧',
    imageUrl: 'https://picsum.photos/800/400?random=501',
    likes: 892,
    reposts: 145,
    comments: 34,
    timestamp: '8h ago'
  },
  {
    id: 'p4',
    userId: 'u1',
    userName: 'Alex Rivera',
    userAvatar: 'https://picsum.photos/100/100?random=31',
    content: 'The TON ecosystem is growing so fast. TonJam is the future of music! 🚀',
    likes: 45,
    reposts: 5,
    comments: 3,
    timestamp: '12h ago'
  }
];

export const MOCK_USERS: UserProfile[] = [
  MOCK_USER,
  {
    id: 'u2',
    name: 'Sarah Jenkins',
    handle: '@sarahj',
    avatar: 'https://picsum.photos/100/100?random=32',
    bannerUrl: 'https://picsum.photos/1200/400?random=33',
    bio: 'Digital art enthusiast and music lover.',
    followers: 450,
    following: 120,
    earnings: '0',
    followedArtists: ['a1', 'a5'],
    friends: ['u1']
  },
  {
    id: 'u3',
    name: 'Alex Rivera',
    handle: '@arivera',
    avatar: 'https://picsum.photos/100/100?random=31',
    bannerUrl: 'https://picsum.photos/1200/400?random=34',
    bio: 'Creating the future of sound.',
    followers: 890,
    following: 340,
    earnings: '0',
    followedArtists: ['a2', 'a3', 'a6'],
    friends: ['u1']
  }
];

export const MOCK_PLAYLISTS: Playlist[] = [
  { id: 'pl1', title: 'Gaming Vibes', coverUrl: '', trackCount: 4, creator: 'User123', trackIds: ['1', '2', '3', '4'] },
  { id: 'pl2', title: 'Late Night Study', coverUrl: 'https://picsum.photos/400/400?random=42', trackCount: 15, creator: 'LofiGirl', trackIds: ['3'] },
];