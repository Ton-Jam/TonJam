import { Track, NFTItem, Artist, Post, Playlist, UserProfile } from './types';

// Official TonJam Brand Assets
export const APP_LOGO = "https://i.postimg.cc/63GsZHzq/TonJam-icon.png"; 
export const TJ_COIN_ICON = "https://i.postimg.cc/s2QHHMSF/TonjamCoin.png"; 
export const TON_LOGO = "https://i.postimg.cc/jj7HksNw/ton-symbol.png";

// Placeholder price for TJ Coin (JAM) in USD
export const JAM_PRICE_USD = 0.052;
export const JAM_JETTON_MASTER = "EQCxE6mNZ_9MvS_88888888888888888888888888888"; // Placeholder JAM Master Address

export const MOODS = [
  { id: 'chill', name: 'Chill' },
  { id: 'energetic', name: 'Energetic' },
  { id: 'focus', name: 'Focus' },
  { id: 'happy', name: 'Happy' },
  { id: 'melancholic', name: 'Melancholic' },
];

export const MOCK_TRACKS: Track[] = [
  { 
    id: '1', 
    title: 'Solar Pulse', 
    artist: 'Neon Voyager', 
    artistId: 'a1', 
    coverUrl: 'https://image.pollinations.ai/prompt/music%20album%20cover%20Solar%20Pulse%20Neon%20Voyager?width=400&height=400&nologo=true', 
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 
    duration: 210, 
    genre: 'Electronic', 
    mood: 'Energetic',
    isNFT: true, 
    artistVerified: true, 
    price: '2.5', 
    bpm: 128, 
    key: 'C# min', 
    bitrate: 'FLAC', 
    playCount: 12500, 
    likes: 840, 
    releaseDate: '2023-10-15',
    createdAt: '2023-10-15T00:00:00Z',
    cid: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    ipfsUrl: 'ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    lyrics: `[Verse 1]
Digital horizons, neon in the sky
Binary reflections, where the echoes lie
I'm walking through the circuits, feeling the flow
Where the electric rivers start to grow

[Chorus]
Solar pulse, beating in my chest
In the city of light, we never rest
Solar pulse, driving through the night
Everything is clear in the neon light

[Verse 2]
Static in the air, a frequency so pure
In this digital world, we find the cure
The rhythm of the machine, the soul of the code
Taking us further down this electric road

[Chorus]
Solar pulse, beating in my chest
In the city of light, we never rest
Solar pulse, driving through the night
Everything is clear in the neon light`
  },
  { 
    id: '2', 
    title: 'Cyber Drift', 
    artist: 'Byte Beat', 
    artistId: 'a2', 
    coverUrl: 'https://image.pollinations.ai/prompt/music%20album%20cover%20Cyber%20Drift%20Byte%20Beat?width=400&height=400&nologo=true', 
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 
    duration: 185, 
    genre: 'Synthwave', 
    mood: 'Energetic',
    isNFT: false, 
    artistVerified: true, 
    bpm: 110, 
    key: 'D maj', 
    bitrate: '320kbps', 
    playCount: 8400, 
    likes: 420, 
    releaseDate: '2023-11-02',
    createdAt: '2023-11-02T00:00:00Z',
    cid: 'QmZ4tjBvTfH2fX9y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1',
    ipfsUrl: 'ipfs://QmZ4tjBvTfH2fX9y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1'
  },
  { 
    id: '3', 
    title: 'Deep Horizon', 
    artist: 'Echo Phase', 
    artistId: 'a3', 
    coverUrl: 'https://image.pollinations.ai/prompt/music%20album%20cover%20Deep%20Horizon%20Echo%20Phase?width=400&height=400&nologo=true', 
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 
    duration: 245, 
    genre: 'Ambient', 
    mood: 'Chill',
    isNFT: true, 
    artistVerified: false, 
    price: '5.0', 
    bpm: 85, 
    key: 'A min', 
    bitrate: 'FLAC', 
    playCount: 15600, 
    likes: 1200, 
    releaseDate: '2023-09-20',
    createdAt: '2023-09-20T00:00:00Z',
    cid: 'QmT7y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1',
    ipfsUrl: 'ipfs://QmT7y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1'
  },
  { 
    id: '4', 
    title: 'Velvet Sky', 
    artist: 'Luna Ray', 
    artistId: 'a4', 
    coverUrl: 'https://image.pollinations.ai/prompt/music%20album%20cover%20Velvet%20Sky%20Luna%20Ray?width=400&height=400&nologo=true', 
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 
    duration: 195, 
    genre: 'Pop', 
    mood: 'Happy',
    isNFT: false, 
    artistVerified: true, 
    bpm: 120, 
    key: 'G maj', 
    bitrate: '320kbps', 
    playCount: 22000, 
    likes: 3100, 
    releaseDate: '2023-12-01',
    createdAt: '2023-12-01T00:00:00Z'
  },
  { 
    id: '5', 
    title: 'Neon Nights', 
    artist: 'City Ghost', 
    artistId: 'a5', 
    coverUrl: 'https://image.pollinations.ai/prompt/music%20album%20cover%20Neon%20Nights%20City%20Ghost?width=400&height=400&nologo=true', 
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 
    duration: 220, 
    genre: 'Electronic', 
    mood: 'Energetic',
    isNFT: true, 
    artistVerified: false, 
    price: '1.2', 
    bpm: 124, 
    key: 'F# min', 
    bitrate: '320kbps', 
    playCount: 5400, 
    likes: 210, 
    releaseDate: '2023-11-28',
    createdAt: '2023-11-28T00:00:00Z'
  },
  { 
    id: '6', 
    title: 'Prism Shift', 
    artist: 'Prism Core', 
    artistId: 'a6', 
    coverUrl: 'https://image.pollinations.ai/prompt/music%20album%20cover%20Prism%20Shift%20Prism%20Core?width=400&height=400&nologo=true', 
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', 
    duration: 205, 
    genre: 'Techno', 
    mood: 'Energetic',
    isNFT: true, 
    artistVerified: true, 
    price: '3.0', 
    bpm: 132, 
    key: 'E min', 
    bitrate: 'FLAC', 
    playCount: 9800, 
    likes: 650, 
    releaseDate: '2023-10-30',
    createdAt: '2023-10-30T00:00:00Z'
  },
  { 
    id: '7', 
    title: 'Midnight Drive', 
    artist: 'Neon Voyager', 
    artistId: 'a1', 
    coverUrl: 'https://image.pollinations.ai/prompt/music%20album%20cover%20Midnight%20Drive%20Neon%20Voyager?width=400&height=400&nologo=true', 
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', 
    duration: 190, 
    genre: 'Synthwave', 
    mood: 'Chill',
    isNFT: false, 
    artistVerified: true, 
    playCount: 4500, 
    likes: 320, 
    releaseDate: '2024-01-15',
    createdAt: '2024-01-15T00:00:00Z'
  },
  { 
    id: '8', 
    title: 'Ocean Breeze', 
    artist: 'Luna Ray', 
    artistId: 'a4', 
    coverUrl: 'https://image.pollinations.ai/prompt/music%20album%20cover%20Ocean%20Breeze%20Luna%20Ray?width=400&height=400&nologo=true', 
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', 
    duration: 230, 
    genre: 'Ambient', 
    mood: 'Chill',
    isNFT: true, 
    artistVerified: true, 
    price: '4.5', 
    playCount: 12000, 
    likes: 950, 
    releaseDate: '2024-02-10',
    createdAt: '2024-02-10T00:00:00Z'
  },
  { 
    id: '9', 
    title: 'Glitch City', 
    artist: 'Byte Beat', 
    artistId: 'a2', 
    coverUrl: 'https://image.pollinations.ai/prompt/music%20album%20cover%20Glitch%20City%20Byte%20Beat?width=400&height=400&nologo=true', 
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', 
    duration: 175, 
    genre: 'Electronic', 
    mood: 'Energetic',
    isNFT: false, 
    artistVerified: true, 
    playCount: 6700, 
    likes: 480, 
    releaseDate: '2024-02-28',
    createdAt: '2024-02-28T00:00:00Z'
  },
  { 
    id: '10', 
    title: 'Static Void', 
    artist: 'Echo Phase', 
    artistId: 'a3', 
    coverUrl: 'https://image.pollinations.ai/prompt/music%20album%20cover%20Static%20Void%20Echo%20Phase?width=400&height=400&nologo=true', 
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', 
    duration: 300, 
    genre: 'Ambient', 
    mood: 'Melancholic',
    isNFT: true, 
    artistVerified: false, 
    price: '10.0', 
    playCount: 3400, 
    likes: 150, 
    releaseDate: '2024-03-01',
    createdAt: '2024-03-01T00:00:00Z'
  },
  { 
    id: '11', 
    title: 'Exclusive Echoes', 
    artist: 'Neon Voyager', 
    artistId: 'a1', 
    coverUrl: 'https://image.pollinations.ai/prompt/music%20album%20cover%20Exclusive%20Echoes?width=400&height=400&nologo=true', 
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', 
    duration: 240, 
    genre: 'Electronic', 
    mood: 'Focus',
    isNFT: false, 
    artistVerified: true, 
    playCount: 500, 
    likes: 120, 
    releaseDate: '2024-03-15',
    createdAt: '2024-03-15T00:00:00Z',
    tokenGating: {
      enabled: true,
      tokenAddress: JAM_JETTON_MASTER,
      minAmount: '100',
      tokenSymbol: 'JAM',
      tokenType: 'jetton'
    }
  },
];

import { Zap, Moon, Waves, Sparkles, Factory, Coffee } from 'lucide-react';

export const GENRES = [
  { id: 'electronic', name: 'Electronic', icon: Zap, color: 'from-blue-500 to-cyan-500' },
  { id: 'synthwave', name: 'Synthwave', icon: Moon, color: 'from-pink-500 to-purple-500' },
  { id: 'ambient', name: 'Ambient', icon: Waves, color: 'from-emerald-500 to-teal-500' },
  { id: 'pop', name: 'Pop', icon: Sparkles, color: 'from-yellow-400 to-orange-500' },
  { id: 'techno', name: 'Techno', icon: Factory, color: 'from-red-500 to-rose-600' },
  { id: 'lofi', name: 'Lo-Fi', icon: Coffee, color: 'from-stone-500 to-neutral-600' },
];

export const CURATED_PLAYLISTS: Playlist[] = [
  { 
    id: 'curated-1', 
    title: 'TON Top 50', 
    coverUrl: 'https://image.pollinations.ai/prompt/playlist%20cover%20TON%20Top%2050?width=600&height=600&nologo=true', 
    trackCount: 10, 
    creator: 'TonJam Editorial', 
    description: 'The most streamed tracks on the TON network this week.',
    trackIds: ['4', '3', '1', '8', '6', '2', '9', '5', '7', '10']
  },
  { 
    id: 'curated-2', 
    title: 'NFT Alpha', 
    coverUrl: 'https://image.pollinations.ai/prompt/playlist%20cover%20NFT%20Alpha?width=600&height=600&nologo=true', 
    trackCount: 5, 
    creator: 'TonJam Curators', 
    description: 'Rare music NFTs currently trending in the marketplace.',
    trackIds: ['1', '3', '6', '8', '10']
  },
  { 
    id: 'curated-3', 
    title: 'Cyberpunk 2026', 
    coverUrl: 'https://image.pollinations.ai/prompt/playlist%20cover%20Cyberpunk%202026?width=600&height=600&nologo=true', 
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
  avatar: 'https://image.pollinations.ai/prompt/user%20avatar%20CryptoPioneer?width=200&height=200&nologo=true',
  bannerUrl: 'https://image.pollinations.ai/prompt/user%20profile%20banner%20abstract%20digital%20art?width=1200&height=400&nologo=true',
  bio: 'Exploring the intersection of TON blockchain and underground electronic beats. Collector of rare synthwave NFTs.',
  walletAddress: 'UQCc...8xZ2',
  followers: 1240,
  following: 562,
  earnings: 124.5,
  isVerifiedArtist: true,
  jamBalance: 10000,
  stakedJam: 0,
  pendingJamRewards: 0,
  lastStakingUpdate: new Date().toISOString(),
  streamingEarnings: 45.2,
  nftEarnings: 79.3,
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
    title: 'Solar Pulse: Genesis Edition #001', 
    owner: 'Neon Voyager', 
    creator: 'Neon Voyager', 
    price: '12', 
    imageUrl: 'https://image.pollinations.ai/prompt/music%20nft%20Solar%20Pulse%20Genesis?width=600&height=600&nologo=true', 
    edition: 'Unique',
    contractAddress: 'EQD4FP_S54FpX9y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1_P',
    royaltySplits: [{ address: 'Neon Voyager', percentage: 7.5 }],
    stems_available: true,
    description: 'The first ever unique edition of Solar Pulse. Includes high-fidelity stem access and a VIP pass to the upcoming Neon Voyager virtual concert.',
    listingType: 'auction',
    ipfsUrl: 'ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    cid: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
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
    title: 'Deep Horizon: Twilight Series #042', 
    owner: '0xTon...A12B', 
    creator: 'Echo Phase', 
    price: '45', 
    imageUrl: 'https://image.pollinations.ai/prompt/music%20nft%20Deep%20Horizon%20Twilight?width=600&height=600&nologo=true', 
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
    title: 'Neon Nights: Club Pass #007', 
    owner: 'UQCc...8xZ2', 
    creator: 'City Ghost', 
    price: '8', 
    imageUrl: 'https://image.pollinations.ai/prompt/music%20nft%20Neon%20Nights%20Club%20Pass?width=600&height=600&nologo=true', 
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
    title: 'Prism Shift: Monolith #001', 
    owner: 'Prism Core', 
    creator: 'Prism Core', 
    price: '25', 
    imageUrl: 'https://image.pollinations.ai/prompt/music%20nft%20Prism%20Shift%20Monolith?width=600&height=600&nologo=true', 
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
    title: 'Solar Pulse: Flare Edition #002', 
    owner: 'Neon Voyager', 
    creator: 'Neon Voyager', 
    price: '10', 
    imageUrl: 'https://image.pollinations.ai/prompt/music%20nft%20Solar%20Pulse%20Flare?width=600&height=600&nologo=true', 
    edition: 'Limited',
    listingType: 'fixed',
    contractAddress: 'EQD4FP_Solar_Pulse_002',
    royaltySplits: [{ address: 'Neon Voyager', percentage: 7.5 }],
    stems_available: true,
    description: 'Second edition of the Solar Pulse series.',
    ipfsUrl: 'ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    cid: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
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
    handle: '@neon_voyager',
    walletAddress: 'UQCc_NeonVoyager_x9y1_v8s2_m5n6_z2w3',
    avatarUrl: 'https://image.pollinations.ai/prompt/artist%20avatar%20Neon%20Voyager?width=200&height=200&nologo=true', 
    followers: 12400, 
    verified: true,
    isVerifiedArtist: true,
    genre: 'Electronic',
    bio: "Pioneering the sound of the digital frontier. Synthwave frequencies forged in the TON core.",
    bannerUrl: "https://image.pollinations.ai/prompt/artist%20banner%20Neon%20Voyager%20cyberpunk%20city?width=1200&height=400&nologo=true",
    socials: { x: 'https://x.com/neon_voyager', spotify: 'https://spotify.com/artist/neon_voyager', instagram: 'https://instagram.com/neon_voyager', telegram: 'https://t.me/neon_voyager' },
    royaltyConfig: { 
      streamingSplits: [{ address: 'UQCc_NeonVoyager_x9y1_v8s2_m5n6_z2w3', percentage: 0.05, label: 'Main Artist' }],
      nftSaleSplits: [{ address: 'UQCc_NeonVoyager_x9y1_v8s2_m5n6_z2w3', percentage: 0.10, label: 'Main Artist' }]
    },
    earnings: { streaming: 12.4, nftSales: 45.2, total: 57.6 },
    events: [
      { id: 'e1', title: 'Neon Nights Live', date: '2024-05-20', time: '20:00', venue: 'The Digital Dome', location: 'London, UK', ticketUrl: 'https://example.com/tickets' },
      { id: 'e2', title: 'Cyber Drift Tour', date: '2024-06-15', time: '21:30', venue: 'Synth City Arena', location: 'Tokyo, JP' }
    ],
    collaborations: [
      { id: 'c1', artistName: 'Byte Beat', trackTitle: 'Digital Pulse', coverUrl: 'https://image.pollinations.ai/prompt/music%20album%20cover%20Digital%20Pulse?width=200&height=200&nologo=true' },
      { id: 'c2', artistName: 'Luna Ray', trackTitle: 'Starlight Drift', coverUrl: 'https://image.pollinations.ai/prompt/music%20album%20cover%20Starlight%20Drift?width=200&height=200&nologo=true' }
    ]
  },
  { 
    id: 'a2', 
    name: 'Byte Beat', 
    handle: '@byte_beat',
    walletAddress: 'UQByteBeat_n7m2_k9p4_j8h3_f5g6',
    avatarUrl: 'https://image.pollinations.ai/prompt/artist%20avatar%20Byte%20Beat?width=200&height=200&nologo=true', 
    followers: 8900, 
    verified: true,
    isVerifiedArtist: true,
    genre: 'Synthwave',
    bio: "Algorithmically generated beats for the decentralized generation.",
    bannerUrl: "https://image.pollinations.ai/prompt/artist%20banner%20Byte%20Beat%20digital%20circuits?width=1200&height=400&nologo=true",
    socials: { x: 'https://x.com/byte_beat', spotify: 'https://spotify.com/artist/byte_beat' },
    royaltyConfig: { 
      streamingSplits: [{ address: 'UQByteBeat_n7m2_k9p4_j8h3_f5g6', percentage: 0.04, label: 'Main Artist' }],
      nftSaleSplits: [{ address: 'UQByteBeat_n7m2_k9p4_j8h3_f5g6', percentage: 0.08, label: 'Main Artist' }]
    },
    earnings: { streaming: 5.2, nftSales: 12.8, total: 18.0 },
    events: [
      { id: 'e3', title: 'Byte Beat Live Stream', date: '2024-05-25', time: '18:00', venue: 'Twitch / TonJam Live', location: 'Virtual' },
      { id: 'e4', title: 'Decentralized Beats Festival', date: '2024-07-10', time: '14:00', venue: 'Blockchain Park', location: 'Berlin, DE' }
    ],
    collaborations: [
      { id: 'c3', artistName: 'Neon Voyager', trackTitle: 'Digital Pulse', coverUrl: 'https://image.pollinations.ai/prompt/music%20album%20cover%20Digital%20Pulse?width=200&height=200&nologo=true' },
      { id: 'c4', artistName: 'City Ghost', trackTitle: 'Urban Echo', coverUrl: 'https://image.pollinations.ai/prompt/music%20album%20cover%20Urban%20Echo?width=200&height=200&nologo=true' }
    ]
  },
  { 
    id: 'a3', 
    name: 'Echo Phase', 
    handle: '@echo_phase',
    walletAddress: 'UQEchoPhase_v8s1_m5n6_k9p4_j8h3',
    avatarUrl: 'https://image.pollinations.ai/prompt/artist%20avatar%20Echo%20Phase?width=200&height=200&nologo=true', 
    followers: 5600, 
    verified: false,
    isVerifiedArtist: false,
    genre: 'Ambient',
    bio: "Ambient explorations through the blockchain void.",
    bannerUrl: "https://image.pollinations.ai/prompt/artist%20banner%20Echo%20Phase%20ambient%20void?width=1200&height=400&nologo=true",
    socials: { website: 'https://echophase.io' },
    royaltyConfig: { 
      streamingSplits: [{ address: 'UQEchoPhase_v8s1_m5n6_k9p4_j8h3', percentage: 0.03, label: 'Main Artist' }],
      nftSaleSplits: [{ address: 'UQEchoPhase_v8s1_m5n6_k9p4_j8h3', percentage: 0.05, label: 'Main Artist' }]
    },
    earnings: { streaming: 2.1, nftSales: 8.5, total: 10.6 }
  },
  { 
    id: 'a4', 
    name: 'Luna Ray', 
    handle: '@lunaray',
    walletAddress: 'UQLunaRay_p3q9_r7t8_w2x4_b1c2',
    avatarUrl: 'https://image.pollinations.ai/prompt/artist%20avatar%20Luna%20Ray?width=200&height=200&nologo=true', 
    followers: 15200, 
    verified: true,
    isVerifiedArtist: true,
    genre: 'Pop',
    bio: "Ethereal pop melodies floating on top of complex electronic soundscapes.",
    bannerUrl: "https://image.pollinations.ai/prompt/artist%20banner%20Luna%20Ray%20ethereal%20pop?width=1200&height=400&nologo=true",
    socials: { x: 'https://x.com/lunaray', instagram: 'https://instagram.com/lunaray' },
    royaltyConfig: { 
      streamingSplits: [{ address: 'UQLunaRay_p3q9_r7t8_w2x4_b1c2', percentage: 0.06, label: 'Main Artist' }],
      nftSaleSplits: [{ address: 'UQLunaRay_p3q9_r7t8_w2x4_b1c2', percentage: 0.12, label: 'Main Artist' }]
    },
    earnings: { streaming: 18.5, nftSales: 32.1, total: 50.6 }
  },
  { 
    id: 'a5', 
    name: 'City Ghost', 
    handle: '@city_ghost',
    walletAddress: 'UQCityGhost_w2x4_b1c2_d5f6_g7h8',
    avatarUrl: 'https://image.pollinations.ai/prompt/artist%20avatar%20City%20Ghost?width=200&height=200&nologo=true', 
    followers: 4300, 
    verified: false,
    isVerifiedArtist: false,
    genre: 'Electronic',
    bio: "Lo-fi beats captured from the heart of the urban jungle.",
    bannerUrl: "https://image.pollinations.ai/prompt/artist%20banner%20City%20Ghost%20lofi%20urban?width=1200&height=400&nologo=true",
    socials: { spotify: 'https://spotify.com/artist/cityghost' },
    royaltyConfig: { 
      streamingSplits: [{ address: 'UQCityGhost_w2x4_b1c2_d5f6_g7h8', percentage: 0.02, label: 'Main Artist' }],
      nftSaleSplits: [{ address: 'UQCityGhost_w2x4_b1c2_d5f6_g7h8', percentage: 0.04, label: 'Main Artist' }]
    },
    earnings: { streaming: 1.2, nftSales: 4.3, total: 5.5 }
  },
  { 
    id: 'a6', 
    name: 'Prism Core', 
    handle: '@prism_core',
    walletAddress: 'UQPrismCore_d5f6_g7h8_x9y1_v8s2',
    avatarUrl: 'https://image.pollinations.ai/prompt/artist%20avatar%20Prism%20Core?width=200&height=200&nologo=true', 
    followers: 7800, 
    verified: true,
    isVerifiedArtist: true,
    genre: 'Techno',
    bio: "Shattering sonic boundaries with experimental techno and hard-hitting rhythms.",
    bannerUrl: "https://image.pollinations.ai/prompt/artist%20banner%20Prism%20Core%20experimental%20techno?width=1200&height=400&nologo=true",
    socials: { x: 'https://x.com/prismcore', website: 'https://prismcore.tech' },
    royaltyConfig: { 
      streamingSplits: [{ address: 'UQPrismCore_d5f6_g7h8_x9y1_v8s2', percentage: 0.05, label: 'Main Artist' }],
      nftSaleSplits: [{ address: 'UQPrismCore_d5f6_g7h8_x9y1_v8s2', percentage: 0.10, label: 'Main Artist' }]
    },
    earnings: { streaming: 8.4, nftSales: 22.1, total: 30.5 }
  },
];

export const MOCK_SONG_REQUESTS: any[] = [
  {
    id: 'req1',
    artistId: 'a1',
    requesterId: 'u2',
    requesterName: 'Sarah Chen',
    songTitle: 'Neon Nights Acoustic',
    description: 'Would love to hear an acoustic version of Neon Nights!',
    status: 'pending',
    tipAmount: '5.0',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 'req2',
    artistId: 'a1',
    requesterId: 'u3',
    requesterName: 'Mike Johnson',
    songTitle: 'Cyberpunk Theme',
    description: 'A dark synthwave track for my new game.',
    status: 'accepted',
    tipAmount: '20.0',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: 'req3',
    artistId: 'a2',
    requesterId: 'u1',
    requesterName: 'Alex Rivera',
    songTitle: 'Lo-Fi Study Beats',
    description: 'Need some chill beats for studying.',
    status: 'fulfilled',
    tipAmount: '2.5',
    hasTipped: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
  },
  {
    id: 'req4',
    artistId: 'a1',
    requesterId: 'u1',
    requesterName: 'Alex Rivera',
    songTitle: 'Retro Wave Remix',
    description: 'A remix of your old track.',
    status: 'fulfilled',
    tipAmount: '10.0',
    hasTipped: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString()
  }
];

export const MOCK_POSTS: Post[] = [
  { 
    id: 'p1', 
    userId: 'u1', 
    userName: 'Alex Rivera', 
    userAvatar: 'https://image.pollinations.ai/prompt/user%20avatar%20Alex%20Rivera?width=100&height=100&nologo=true', 
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
        userAvatar: 'https://image.pollinations.ai/prompt/user%20avatar%20Sarah%20Jenkins?width=100&height=100&nologo=true',
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
        userAvatar: 'https://image.pollinations.ai/prompt/user%20avatar%20Neon%20Voyager?width=200&height=200&nologo=true',
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
    userAvatar: 'https://image.pollinations.ai/prompt/user%20avatar%20Sarah%20Jenkins?width=100&height=100&nologo=true', 
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
        userAvatar: 'https://image.pollinations.ai/prompt/user%20avatar%20CryptoPioneer?width=200&height=200&nologo=true',
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
    userAvatar: 'https://image.pollinations.ai/prompt/user%20avatar%20Byte%20Beat?width=200&height=200&nologo=true',
    content: 'Working on some new neural frequencies. Stay tuned for the drop! 🎧',
    imageUrl: 'https://image.pollinations.ai/prompt/social%20post%20image%20neural%20frequencies?width=800&height=400&nologo=true',
    likes: 892,
    reposts: 145,
    comments: 34,
    timestamp: '8h ago'
  },
  {
    id: 'p4',
    userId: 'u1',
    userName: 'Alex Rivera',
    userAvatar: 'https://image.pollinations.ai/prompt/user%20avatar%20Alex%20Rivera?width=100&height=100&nologo=true',
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
    avatar: 'https://image.pollinations.ai/prompt/user%20avatar%20Sarah%20Jenkins?width=100&height=100&nologo=true',
    bannerUrl: 'https://image.pollinations.ai/prompt/user%20profile%20banner%20digital%20art?width=1200&height=400&nologo=true',
    bio: 'Digital art enthusiast and music lover.',
    followers: 450,
    following: 120,
    earnings: 0,
    followedArtists: ['a1', 'a5'],
    friends: ['u1']
  },
  {
    id: 'u3',
    name: 'Alex Rivera',
    handle: '@arivera',
    avatar: 'https://image.pollinations.ai/prompt/user%20avatar%20Alex%20Rivera?width=100&height=100&nologo=true',
    bannerUrl: 'https://image.pollinations.ai/prompt/user%20profile%20banner%20future%20sound?width=1200&height=400&nologo=true',
    bio: 'Creating the future of sound.',
    followers: 890,
    following: 340,
    earnings: 0,
    followedArtists: ['a2', 'a3', 'a6'],
    friends: ['u1']
  }
];

export const MOCK_PLAYLISTS: Playlist[] = [
  { id: 'pl1', title: 'Gaming Vibes', coverUrl: '', trackCount: 4, creator: 'User123', trackIds: ['1', '2', '3', '4'] },
  { id: 'pl2', title: 'Late Night Study', coverUrl: 'https://image.pollinations.ai/prompt/playlist%20cover%20Late%20Night%20Study?width=400&height=400&nologo=true', trackCount: 15, creator: 'LofiGirl', trackIds: ['3'] },
];