import { Track, NFTItem, Artist, Post, Playlist, UserProfile } from './types';

// Official TonJam Brand Assets
export const APP_LOGO = "https://i.postimg.cc/63GsZHzq/TonJam-icon.png"; 
export const TJ_COIN_ICON = "https://i.postimg.cc/s2QHHMSF/TonjamCoin.png"; 
export const TON_LOGO = "https://i.postimg.cc/jj7HksNw/ton-symbol.png";

export const MOCK_TRACKS: Track[] = [
  { id: '1', title: 'Solar Pulse', artist: 'Neon Voyager', artistId: 'a1', coverUrl: 'https://picsum.photos/400/400?random=1', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: 210, genre: 'Electronic', isNFT: true, artistVerified: true, price: '2.5', bpm: 128, key: 'C# min', bitrate: 'FLAC', playCount: 12500, likes: 840 },
  { id: '2', title: 'Cyber Drift', artist: 'Byte Beat', artistId: 'a2', coverUrl: 'https://picsum.photos/400/400?random=2', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', duration: 185, genre: 'Synthwave', isNFT: false, artistVerified: true, bpm: 110, key: 'D maj', bitrate: '320kbps', playCount: 8400, likes: 420 },
  { id: '3', title: 'Deep Horizon', artist: 'Echo Phase', artistId: 'a3', coverUrl: 'https://picsum.photos/400/400?random=3', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', duration: 245, genre: 'Ambient', isNFT: true, artistVerified: false, price: '5.0', bpm: 85, key: 'A min', bitrate: 'FLAC', playCount: 15600, likes: 1200 },
  { id: '4', title: 'Velvet Sky', artist: 'Luna Ray', artistId: 'a4', coverUrl: 'https://picsum.photos/400/400?random=4', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', duration: 195, genre: 'Pop', isNFT: false, artistVerified: true, bpm: 120, key: 'G maj', bitrate: '320kbps', playCount: 22000, likes: 3100 },
  { id: '5', title: 'Neon Nights', artist: 'City Ghost', artistId: 'a5', coverUrl: 'https://picsum.photos/400/400?random=5', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', duration: 220, genre: 'Electronic', isNFT: true, artistVerified: false, price: '1.2', bpm: 124, key: 'F# min', bitrate: '320kbps', playCount: 5400, likes: 210 },
  { id: '6', title: 'Prism Shift', artist: 'Prism Core', artistId: 'a6', coverUrl: 'https://picsum.photos/400/400?random=6', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', duration: 205, genre: 'Techno', isNFT: true, artistVerified: true, price: '3.0', bpm: 132, key: 'E min', bitrate: 'FLAC', playCount: 9800, likes: 650 },
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
  isVerifiedArtist: false
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
    royalty: 7.5,
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
      { id: 'off1', offerer: 'UQDa...X9y1', price: '12', duration: '3 days', timestamp: '2023-10-06' }
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
    royalty: 5.0,
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
      { id: 'off3', offerer: 'UQCc...8xZ2', price: '40', duration: '7 days', timestamp: '2023-11-01' }
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
    royalty: 10.0,
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
    offers: []
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
    royalty: 8.0,
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
    royalty: 7.5,
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
    avatarUrl: 'https://picsum.photos/200/200?random=21', 
    followers: 12400, 
    verified: true,
    bio: "Pioneering the sound of the digital frontier. Synthwave frequencies forged in the TON core.",
    bannerUrl: "https://picsum.photos/1200/400?random=1001",
    socials: { x: 'https://x.com/neon_voyager', spotify: 'https://spotify.com/artist/neon_voyager', instagram: 'https://instagram.com/neon_voyager' }
  },
  { 
    id: 'a2', 
    name: 'Byte Beat', 
    avatarUrl: 'https://picsum.photos/200/200?random=22', 
    followers: 8900, 
    verified: true,
    bio: "Algorithmically generated beats for the decentralized generation.",
    bannerUrl: "https://picsum.photos/1200/400?random=1002",
    socials: { x: 'https://x.com/byte_beat', spotify: 'https://spotify.com/artist/byte_beat' }
  },
  { 
    id: 'a3', 
    name: 'Echo Phase', 
    avatarUrl: 'https://picsum.photos/200/200?random=23', 
    followers: 5600, 
    verified: false,
    bio: "Ambient explorations through the blockchain void.",
    bannerUrl: "https://picsum.photos/1200/400?random=1003",
    socials: { website: 'https://echophase.io' }
  },
  { 
    id: 'a4', 
    name: 'Luna Ray', 
    avatarUrl: 'https://picsum.photos/200/200?random=24', 
    followers: 15200, 
    verified: true,
    bio: "Ethereal pop melodies floating on top of complex electronic soundscapes.",
    bannerUrl: "https://picsum.photos/1200/400?random=1004",
    socials: { x: 'https://x.com/lunaray', instagram: 'https://instagram.com/lunaray' }
  },
  { 
    id: 'a5', 
    name: 'City Ghost', 
    avatarUrl: 'https://picsum.photos/200/200?random=25', 
    followers: 4300, 
    verified: false,
    bio: "Lo-fi beats captured from the heart of the urban jungle.",
    bannerUrl: "https://picsum.photos/1200/400?random=1005",
    socials: { spotify: 'https://spotify.com/artist/cityghost' }
  },
  { 
    id: 'a6', 
    name: 'Prism Core', 
    avatarUrl: 'https://picsum.photos/200/200?random=26', 
    followers: 7800, 
    verified: true,
    bio: "Shattering sonic boundaries with experimental techno and hard-hitting rhythms.",
    bannerUrl: "https://picsum.photos/1200/400?random=1006",
    socials: { x: 'https://x.com/prismcore', website: 'https://prismcore.tech' }
  },
];

export const MOCK_POSTS: Post[] = [
  { id: 'p1', userId: 'u1', userName: 'Alex Rivera', userAvatar: 'https://picsum.photos/100/100?random=31', content: 'Just dropped my new single on TonJam! Check it out.', trackId: '1', likes: 245, comments: 12, timestamp: '2h ago' },
  { id: 'p2', userId: 'u2', userName: 'Sarah Jenkins', userAvatar: 'https://picsum.photos/100/100?random=32', content: 'The marketplace is booming today. Nabbed a Neon Voyager NFT!', likes: 89, comments: 5, timestamp: '4h ago' },
];

export const MOCK_PLAYLISTS: Playlist[] = [
  { id: 'pl1', title: 'Gaming Vibes', coverUrl: '', trackCount: 4, creator: 'User123', trackIds: ['1', '2', '3', '4'] },
  { id: 'pl2', title: 'Late Night Study', coverUrl: 'https://picsum.photos/400/400?random=42', trackCount: 15, creator: 'LofiGirl', trackIds: ['3'] },
];