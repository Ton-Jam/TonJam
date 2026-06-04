import { Track, NFTItem, Artist, Post, Playlist, Album, UserProfile } from './types';
import { getPlaceholderImage } from './lib/utils';

// Official TonJam Brand Assets
export const APP_LOGO = "https://i.postimg.cc/63GsZHzq/TonJam-icon.png"; 
export const TJ_COIN_ICON = "https://i.postimg.cc/s2QHHMSF/TonjamCoin.png"; 
export const TON_LOGO = "https://i.postimg.cc/jj7HksNw/ton-symbol.png";
export const DJ_KRUPY_AVATAR = "https://i.postimg.cc/K8QgMBjt/grok-image-1777930555512-2.png";

// Placeholder price for TJ Coin (JAM) in USD
export const JAM_PRICE_USD = 0.052;
export const JAM_JETTON_MASTER = "EQCxE6mNZ_9MvS_88888888888888888888888888888"; // Placeholder JAM Master Address

export const MOODS = [
  { id: 'chill', name: 'Chill', color: 'from-blue-400 to-indigo-500' },
  { id: 'energetic', name: 'Energetic', color: 'from-orange-400 to-red-500' },
  { id: 'focus', name: 'Focus', color: 'from-emerald-400 to-teal-500' },
  { id: 'happy', name: 'Happy', color: 'from-yellow-400 to-orange-500' },
  { id: 'melancholic', name: 'Melancholic', color: 'from-purple-400 to-indigo-500' },
];

export const MOCK_TRACKS: Track[] = [
  { 
    id: '1', 
    songId: 'song-1',
    title: 'Solar Pulse', 
    artist: 'DJ Krupy', 
    artistId: 'dj-krupy', 
    coverUrl: 'https://image.pollinations.ai/prompt/cyberpunk%20electronic%20music%20album%20cover%20solar%20pulse%20neon%20orange?width=600&height=600&nologo=true', 
    audioUrl: 'https://storage.googleapis.com/media-session/sintel/snow-fight.mp3', 
    duration: 210, 
    genre: 'Electronic', 
    mood: 'Energetic',
    isNFT: true, 
    artistVerified: true, 
    price: '2.5', 
    bpm: 128, 
    key: 'C# min', 
    isExplicit: true,
    bitrate: 'FLAC', 
    playCount: 45600, 
    likes: 3840, 
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
    songId: 'song-2',
    title: 'Cyber Drift', 
    artist: 'Byte Beat', 
    artistId: 'a2', 
    coverUrl: 'https://image.pollinations.ai/prompt/vaporwave%20city%20night%20drifting%20car%20synthwave%20aesthetic?width=600&height=600&nologo=true', 
    audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3', 
    duration: 185, 
    genre: 'Synthwave', 
    mood: 'Energetic',
    isNFT: false, 
    artistVerified: true, 
    bpm: 110, 
    key: 'D maj', 
    bitrate: '320kbps', 
    playCount: 18400, 
    likes: 1420, 
    releaseDate: '2023-11-02',
    createdAt: '2023-11-02T00:00:00Z',
    cid: 'QmZ4tjBvTfH2fX9y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1',
    ipfsUrl: 'ipfs://QmZ4tjBvTfH2fX9y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1'
  },
  { 
    id: '3', 
    songId: 'song-3',
    title: 'Deep Horizon', 
    artist: 'Echo Phase', 
    artistId: 'a3', 
    coverUrl: 'https://image.pollinations.ai/prompt/deep%20underwater%20abyss%20glowing%20creatures%20ambient%20music%20art?width=600&height=600&nologo=true', 
    audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3', 
    duration: 245, 
    genre: 'Ambient', 
    mood: 'Chill',
    isNFT: true, 
    artistVerified: false, 
    price: '5.0', 
    bpm: 85, 
    key: 'A min', 
    bitrate: 'FLAC', 
    playCount: 35600, 
    likes: 4200, 
    releaseDate: '2023-09-20',
    createdAt: '2023-09-20T00:00:00Z',
    cid: 'QmT7y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1',
    ipfsUrl: 'ipfs://QmT7y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1'
  },
  { 
    id: '4', 
    songId: 'song-4',
    title: 'Velvet Sky', 
    artist: 'Luna Ray', 
    artistId: 'a4', 
    coverUrl: 'https://image.pollinations.ai/prompt/dreamy%20pink%20and%20purple%20sky%20with%20clouds%20pop%20music%20cover?width=600&height=600&nologo=true', 
    audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3', 
    duration: 195, 
    genre: 'Pop', 
    mood: 'Happy',
    isNFT: false, 
    artistVerified: true, 
    bpm: 120, 
    key: 'G maj', 
    bitrate: '320kbps', 
    playCount: 52000, 
    likes: 8100, 
    releaseDate: '2023-12-01',
    createdAt: '2023-12-01T00:00:00Z'
  },
  { 
    id: '5', 
    songId: 'song-5',
    title: 'Neon Nights', 
    artist: 'City Ghost', 
    artistId: 'a5', 
    coverUrl: 'https://image.pollinations.ai/prompt/futuristic%20city%20rain%20at%20night%20with%20neon%20signs%20lofi%20hiphop?width=600&height=600&nologo=true', 
    audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3', 
    duration: 220, 
    genre: 'Electronic', 
    mood: 'Energetic',
    isNFT: true, 
    artistVerified: false, 
    price: '1.2', 
    bpm: 124, 
    key: 'F# min', 
    bitrate: '320kbps', 
    playCount: 15400, 
    likes: 1210, 
    releaseDate: '2023-11-28',
    createdAt: '2023-11-28T00:00:00Z'
  },
  { 
    id: '6', 
    songId: 'song-6',
    title: 'Prism Shift', 
    artist: 'Prism Core', 
    artistId: 'a6', 
    coverUrl: 'https://image.pollinations.ai/prompt/abstract%20triangular%20prism%20refracting%20light%20techno%20music%20art?width=600&height=600&nologo=true', 
    audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3', 
    duration: 205, 
    genre: 'Techno', 
    mood: 'Energetic',
    isNFT: true, 
    artistVerified: true, 
    price: '3.0', 
    bpm: 132, 
    key: 'E min', 
    isExplicit: true,
    bitrate: 'FLAC', 
    playCount: 29800, 
    likes: 3650, 
    releaseDate: '2023-10-30',
    createdAt: '2023-10-30T00:00:00Z'
  },
  { 
    id: '7', 
    songId: 'song-7',
    title: 'Midnight Drive', 
    artist: 'Cosmic Echo', 
    artistId: 'a1', 
    coverUrl: 'https://image.pollinations.ai/prompt/retro%20car%20dashboard%20at%20night%20driving%20through%20space%20synthwave?width=600&height=600&nologo=true', 
    audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3', 
    duration: 190, 
    genre: 'Synthwave', 
    mood: 'Chill',
    isNFT: false, 
    artistVerified: true, 
    playCount: 14500, 
    likes: 2320, 
    releaseDate: '2024-01-15',
    createdAt: '2024-01-15T00:00:00Z'
  },
  { 
    id: '8', 
    songId: 'song-8',
    title: 'Ocean Breeze', 
    artist: 'Luna Ray', 
    artistId: 'a4', 
    coverUrl: 'https://image.pollinations.ai/prompt/tropical%20beach%20at%20sunset%20with%20calm%20waves%20ambient%20music?width=600&height=600&nologo=true', 
    audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3', 
    duration: 230, 
    genre: 'Ambient', 
    mood: 'Chill',
    isNFT: true, 
    artistVerified: true, 
    price: '4.5', 
    playCount: 32000, 
    likes: 4950, 
    releaseDate: '2024-02-10',
    createdAt: '2024-02-10T00:00:00Z'
  },
  { 
    id: '9', 
    songId: 'song-9',
    title: 'Glitch City', 
    artist: 'Byte Beat', 
    artistId: 'a2', 
    coverUrl: 'https://image.pollinations.ai/prompt/glitched%20digital%20cityscape%20corrupted%20pixels%20abstract%20electronic%20art?width=600&height=600&nologo=true', 
    audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3', 
    duration: 175, 
    genre: 'Electronic', 
    mood: 'Energetic',
    isNFT: false, 
    artistVerified: true, 
    playCount: 26700, 
    likes: 3480, 
    releaseDate: '2024-02-28',
    createdAt: '2024-02-28T00:00:00Z'
  },
  { 
    id: '10', 
    songId: 'song-10',
    title: 'Static Void', 
    artist: 'Echo Phase', 
    artistId: 'a3', 
    coverUrl: 'https://image.pollinations.ai/prompt/minimalist%20black%20hole%20with%20white%20event%20horizon%20ambient%20art?width=600&height=600&nologo=true', 
    audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3', 
    duration: 300, 
    genre: 'Ambient', 
    mood: 'Melancholic',
    isNFT: true, 
    artistVerified: false, 
    price: '10.0', 
    playCount: 13400, 
    likes: 1150, 
    releaseDate: '2024-03-01',
    createdAt: '2024-03-01T00:00:00Z'
  },
  { 
    id: '11', 
    songId: 'song-11',
    title: 'Exclusive Echoes', 
    artist: 'Cosmic Echo', 
    artistId: 'a1', 
    coverUrl: 'https://image.pollinations.ai/prompt/mystical%20mountain%20range%20with%20aurora%20borealis%20cinematic%20art?width=600&height=600&nologo=true', 
    audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3', 
    duration: 240, 
    genre: 'Electronic', 
    mood: 'Focus',
    isNFT: false, 
    artistVerified: true, 
    playCount: 8500, 
    likes: 1120, 
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
  { 
    id: '12', 
    songId: 'song-12',
    title: 'Midnight Bourbon', 
    artist: 'Smooth Operator', 
    artistId: 'a7', 
    coverUrl: 'https://image.pollinations.ai/prompt/smoky%20jazz%20club%20with%20a%20glass%20of%20bourbon%20on%20a%20piano?width=600&height=600&nologo=true', 
    audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3', 
    duration: 255, 
    genre: 'Jazz', 
    mood: 'Chill',
    isNFT: true, 
    artistVerified: true, 
    price: '3.5', 
    bpm: 78, 
    key: 'Bb maj', 
    bitrate: '320kbps', 
    playCount: 9200, 
    likes: 1310, 
    releaseDate: '2024-04-01',
    createdAt: '2024-04-01T00:00:00Z'
  },
  { 
    id: '13', 
    songId: 'song-13',
    title: 'Concrete Jungle', 
    artist: 'Urban Flow', 
    artistId: 'a8', 
    coverUrl: 'https://image.pollinations.ai/prompt/gritty%20urban%20alleyway%20with%20graffiti%20hiphop%20street%20art?width=600&height=600&nologo=true', 
    audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3', 
    duration: 180, 
    genre: 'Hip Hop', 
    mood: 'Energetic',
    isNFT: false, 
    artistVerified: true, 
    bpm: 95, 
    key: 'C min', 
    bitrate: '320kbps', 
    playCount: 45400, 
    likes: 6240, 
    releaseDate: '2024-04-05',
    createdAt: '2024-04-05T00:00:00Z'
  },
  { 
    id: '14', 
    songId: 'song-14',
    title: 'Eternal Resonance', 
    artist: 'Serenity Strings', 
    artistId: 'a9', 
    coverUrl: 'https://image.pollinations.ai/prompt/classical%20violin%20resting%20on%20sheet%20music%20elegant%20lighting?width=600&height=600&nologo=true', 
    audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3', 
    duration: 420, 
    genre: 'Classical', 
    mood: 'Melancholic',
    isNFT: true, 
    artistVerified: false, 
    price: '15.0', 
    bpm: 65, 
    key: 'D min', 
    bitrate: 'FLAC', 
    playCount: 8100, 
    likes: 1450, 
    releaseDate: '2024-04-10',
    createdAt: '2024-04-10T00:00:00Z'
  },
  { 
    id: '15', 
    songId: 'song-15',
    title: 'Voltage Peak', 
    artist: 'Electric Storm', 
    artistId: 'a10', 
    coverUrl: 'https://image.pollinations.ai/prompt/explosive%20lightning%20strike%20over%20a%20mountain%20rock%20music%20energy?width=600&height=600&nologo=true', 
    audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3', 
    duration: 215, 
    genre: 'Rock', 
    mood: 'Energetic',
    isNFT: false, 
    artistVerified: true, 
    bpm: 145, 
    key: 'E maj', 
    bitrate: '320kbps', 
    playCount: 18900, 
    likes: 2560, 
    releaseDate: '2024-04-15',
    createdAt: '2024-04-15T00:00:00Z'
  },
  { 
    id: '16', 
    songId: 'song-16',
    title: 'Rainy Window', 
    artist: 'Chill Coffee', 
    artistId: 'a11', 
    coverUrl: 'https://image.pollinations.ai/prompt/cozy%20cafe%20window%20with%20rain%20drops%20and%20a%20warm%20latte%20lofi?width=600&height=600&nologo=true', 
    audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3', 
    duration: 165, 
    genre: 'Lo-Fi', 
    mood: 'Focus',
    isNFT: true, 
    artistVerified: true, 
    price: '1.5', 
    bpm: 82, 
    key: 'F maj', 
    bitrate: '320kbps', 
    playCount: 125000, 
    likes: 14200, 
    releaseDate: '2024-04-20',
    createdAt: '2024-04-20T00:00:00Z'
  },
];

import { Zap, Moon, Waves, Sparkles, Factory, Coffee, Headphones, Guitar, Music, Piano } from 'lucide-react';

export const MOCK_ALBUMS: Album[] = [
  {
    id: 'alb-1',
    title: 'Neon Pulse',
    artist: 'Neon Voyager',
    artistId: 'a1',
    coverUrl: 'https://image.pollinations.ai/prompt/music%20album%20cover%20Neon%20Pulse?width=400&height=400&nologo=true',
    releaseYear: 2023,
    trackIds: ['1', '7', '11'],
    genre: 'Electronic',
    description: 'The debut album defining the digital frontier.'
  },
  {
    id: 'alb-2',
    title: 'Digital Dreams',
    artist: 'Byte Beat',
    artistId: 'a2',
    coverUrl: 'https://image.pollinations.ai/prompt/music%20album%20cover%20Digital%20Dreams?width=400&height=400&nologo=true',
    releaseYear: 2024,
    trackIds: ['2', '9'],
    genre: 'Synthwave',
    description: 'A collection of synthesized melodies.'
  },
  {
    id: 'alb-3',
    title: 'Atmospheric Voids',
    artist: 'Echo Phase',
    artistId: 'a3',
    coverUrl: 'https://image.pollinations.ai/prompt/music%20album%20cover%20Atmospheric%20Voids?width=400&height=400&nologo=true',
    releaseYear: 2024,
    trackIds: ['3', '10'],
    genre: 'Ambient',
    description: 'Drifting through the blockchain.'
  }
];

export const GENRES = [
  { id: 'electronic', name: 'Electronic', icon: Zap, color: 'from-blue-500 to-cyan-500' },
  { id: 'synthwave', name: 'Synthwave', icon: Moon, color: 'from-purple-500 to-pink-500' },
  { id: 'ambient', name: 'Ambient', icon: Waves, color: 'from-teal-500 to-emerald-500' },
  { id: 'pop', name: 'Pop', icon: Sparkles, color: 'from-rose-500 to-orange-500' },
  { id: 'techno', name: 'Techno', icon: Factory, color: 'from-indigo-500 to-purple-500' },
  { id: 'lofi', name: 'Lo-Fi', icon: Coffee, color: 'from-amber-500 to-yellow-500' },
  { id: 'hiphop', name: 'Hip Hop', icon: Headphones, color: 'from-red-500 to-rose-500' },
  { id: 'rock', name: 'Rock', icon: Guitar, color: 'from-slate-600 to-slate-800' },
  { id: 'jazz', name: 'Jazz', icon: Music, color: 'from-fuchsia-500 to-pink-500' },
  { id: 'classical', name: 'Classical', icon: Piano, color: 'from-sky-500 to-blue-500' },
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
  uid: 'u1',
  name: 'DJ Krupy',
  username: '@dj_krupy',
  avatar: 'https://i.postimg.cc/K8QgMBjt/grok-image-1777930555512-2.png',
  bannerUrl: 'https://image.pollinations.ai/prompt/cool%20dj%20profile%20banner%20cyberpunk%20night%20city?width=1200&height=400&nologo=true',
  bio: 'Pioneering the Krupy Vibez on TON. Underground electronic beats and rare synthwave NFTs collector.',
  walletAddress: 'UQCc_DJ_Krupy_Vibez_x9y1_8888',
  followers: 1240,
  following: 562,
  earnings: 124.5,
  isVerifiedArtist: true,
  jamBalance: 12500,
  stakedJam: 5000,
  pendingJamRewards: 45.2,
  lastStakingUpdate: new Date().toISOString(),
  autoCompound: false,
  streamingEarnings: 45.2,
  nftEarnings: 79.3,
  followedArtists: ['a1', 'a2', 'a4', 'dj-krupy'],
  followedUserIds: ['u2', 'u3'],
  friends: ['u2', 'u3'],
  socials: {
    x: 'https://x.com/dj_krupy',
    instagram: 'https://instagram.com/dj_krupy',
    telegram: 'https://t.me/dj_krupy'
  },
  role: 'artist'
};

export const MOCK_NFTS: NFTItem[] = [
  { 
    id: 'n1', 
    trackId: '1', 
    title: 'Solar Pulse: Genesis Edition #001', 
    owner: 'UQCc_NeonVoyager_x9y1_v8s2_m5n6_z2w3', 
    creator: 'DJ Krupy', 
    price: '12', 
    imageUrl: 'https://image.pollinations.ai/prompt/music%20nft%20Solar%20Pulse%20Genesis%20Mythic%20Rare?width=600&height=600&nologo=true', 
    edition: 'Unique',
    contractAddress: 'EQD4FP_S54FpX9y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1_P',
    royaltySplits: [{ address: 'UQCc_DJ_Krupy_Vibez_x9y1_8888', percentage: 7.5 }],
    stems_available: true,
    description: 'The first ever unique edition of Solar Pulse. Includes high-fidelity stem access and a VIP pass to the upcoming Krupy Vibez virtual concert.',
    listingType: 'auction',
    ipfsUrl: 'ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    cid: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    auctionEndTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), 
    startingBid: '5.0',
    traits: [
      { trait_type: 'Bitrate', value: 'FLAC' },
      { trait_type: 'Scale', value: 'C# Minor' },
      { trait_type: 'Access', value: 'VIP Stems' },
      { trait_type: 'Rarity', value: 'Mythic' }
    ],
    history: [
      { event: 'Minted', from: '0x000...000', to: 'DJ Krupy', date: '2023-10-01' },
      { event: 'Auction Started', from: 'DJ Krupy', to: 'Marketplace', date: '2023-10-02', price: '5' }
    ],
    offers: [
      { id: 'off1', offerer: 'UQDa...X9y1', price: '12', duration: '3 days', timestamp: '2023-10-06' },
      { id: 'off2', offerer: '0xTon...A12B', price: '10.5', duration: '1 day', timestamp: '2023-10-05' }
    ]
  },
  { 
    id: 'n2', 
    trackId: '3', 
    title: 'Deep Horizon: Twilight Series #042', 
    owner: '0xTon...A12B', 
    creator: 'Echo Phase', 
    price: '45', 
    imageUrl: 'https://image.pollinations.ai/prompt/music%20nft%20Deep%20Horizon%20Twilight%20Legendary?width=600&height=600&nologo=true', 
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
    offers: []
  },
  { 
    id: 'n3', 
    trackId: '5', 
    title: 'Neon Nights: Club Pass #007', 
    owner: 'UQCc_DJ_Krupy_Vibez_x9y1_8888', 
    creator: 'City Ghost', 
    price: '8', 
    imageUrl: 'https://image.pollinations.ai/prompt/music%20nft%20Neon%20Nights%20Club%20Pass%20Rare?width=600&height=600&nologo=true', 
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
      { event: 'Sale', from: 'City Ghost', to: 'DJ Krupy', date: '2023-11-12', price: '8' }
    ],
    offers: []
  },
  { 
    id: 'n4', 
    trackId: '6', 
    title: 'Prism Shift: Monolith #001', 
    owner: 'UQPrismCore_d5f6_g7h8_x9y1_v8s2', 
    creator: 'Prism Core', 
    price: '25', 
    imageUrl: 'https://image.pollinations.ai/prompt/music%20nft%20Prism%20Shift%20Monolith%20Unique%20Digital?width=600&height=600&nologo=true', 
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
    trackId: '12', 
    title: 'Midnight Bourbon: Vintage Cask #001', 
    owner: 'UQJazzMan_j1a2_z3z4_m5a6_n7n8', 
    creator: 'Smooth Operator', 
    price: '25', 
    imageUrl: 'https://image.pollinations.ai/prompt/music%20nft%20Midnight%20Bourbon%20Vintage%20Cask%20Jazz?width=600&height=600&nologo=true', 
    edition: 'Unique',
    listingType: 'fixed',
    contractAddress: 'EQSmooth_Operator_Jazz_001',
    royaltySplits: [{ address: 'Smooth Operator', percentage: 10.0 }],
    stems_available: true,
    description: 'A smooth, vintage jazz NFT. Granting access to live improv sessions.',
    traits: [
      { trait_type: 'Genre', value: 'Jazz' },
      { trait_type: 'Rarity', value: 'Exotic' }
    ],
    history: [],
    offers: []
  },
];

export const MOCK_ARTISTS: Artist[] = [
  {
    uid: 'dj-krupy',
    name: 'DJ Krupy',
    username: '@dj_krupy',
    walletAddress: 'UQCc_DJ_Krupy_Vibez_x9y1_8888',
    avatarUrl: 'https://i.postimg.cc/K8QgMBjt/grok-image-1777930555512-2.png',
    followers: 85400,
    verified: true,
    isVerifiedArtist: true,
    genre: 'Electronic',
    bio: "The legend of the Krupy Vibez. Delivering high-energy underground electronic beats and exclusive digital artifacts.",
    bannerUrl: "https://image.pollinations.ai/prompt/cool%20dj%20profile%20banner%20cyberpunk%20night%20city?width=1200&height=400&nologo=true",
    bannerImageUrl: "https://image.pollinations.ai/prompt/cool%20dj%20profile%20banner%20cyberpunk%20night%20city?width=1500&height=500&nologo=true",
    socials: { x: 'https://x.com/dj_krupy', instagram: 'https://instagram.com/dj_krupy', telegram: 'https://t.me/dj_krupy' },
    royaltyConfig: { 
      streamingSplits: [{ address: 'UQCc_DJ_Krupy_Vibez_x9y1_8888', percentage: 0.08, label: 'Main Artist' }],
      nftSaleSplits: [{ address: 'UQCc_DJ_Krupy_Vibez_x9y1_8888', percentage: 0.15, label: 'Main Artist' }]
    },
    earnings: { streaming: 154.5, nftSales: 892.4, total: 1046.9 },
    events: [
      { id: 'e-krupy-1', artistId: 'dj-krupy', title: 'Solar Pulse Genesis', date: '2024-12-25', time: '22:00', venue: 'TON Digital Arena', location: 'Metaverse', ticketUrl: 'https://tonjam.io/tickets/krupy' }
    ]
  },
  { 
    uid: 'a1', 
    name: 'Drake', 
    username: '@drake',
    walletAddress: 'UQDrake_x9y1_8888',
    avatarUrl: 'https://i.postimg.cc/LhhtQkF0/drake.jpg', 
    followers: 95000, 
    verified: true,
    isVerifiedArtist: true,
    genre: 'Hip Hop',
    bio: "Global icon bringing the best of hip hop to the TonJam network.",
    bannerUrl: "https://image.pollinations.ai/prompt/cool%20hip%20hop%20banner%20drake?width=1200&height=400&nologo=true",
    socials: { x: 'https://x.com/drake', instagram: 'https://instagram.com/drake' },
    royaltyConfig: { 
      streamingSplits: [{ address: 'UQDrake_x9y1_8888', percentage: 0.10, label: 'Main Artist' }],
      nftSaleSplits: [{ address: 'UQDrake_x9y1_8888', percentage: 0.20, label: 'Main Artist' }]
    },
    earnings: { streaming: 500.0, nftSales: 1500.0, total: 2000.0 },
    events: [],
    collaborations: []
  },
  { 
    uid: 'a2', 
    name: 'Wizkid', 
    username: '@wizkid',
    walletAddress: 'UQualWizkid_n7m2_k9p4',
    avatarUrl: 'https://i.postimg.cc/y3SS1PVB/wizkid.jpg', 
    followers: 88000, 
    verified: true,
    isVerifiedArtist: true,
    genre: 'Afrobeats',
    bio: "Pioneering the afrobeats sound globally.",
    bannerUrl: "https://image.pollinations.ai/prompt/afrobeats%20vibe%20banner%20wizkid?width=1200&height=400&nologo=true",
    socials: { x: 'https://x.com/wizkid', instagram: 'https://instagram.com/wizkid' },
    royaltyConfig: { 
      streamingSplits: [{ address: 'UQualWizkid_n7m2_k9p4', percentage: 0.08, label: 'Main Artist' }],
      nftSaleSplits: [{ address: 'UQualWizkid_n7m2_k9p4', percentage: 0.15, label: 'Main Artist' }]
    },
    earnings: { streaming: 400.0, nftSales: 1200.0, total: 1600.0 },
    events: [],
    collaborations: []
  },
  { 
    uid: 'a3', 
    name: 'Rihanna', 
    username: '@rihanna',
    walletAddress: 'UQRihanna_v8s1_m5n6',
    avatarUrl: 'https://i.postimg.cc/hh7J72qs/rihanna.jpg', 
    followers: 120000, 
    verified: true,
    isVerifiedArtist: true,
    genre: 'Pop',
    bio: "Global icon and fashion mogul.",
    bannerUrl: "https://image.pollinations.ai/prompt/glamorous%20pop%20star%20banner%20rihanna?width=1200&height=400&nologo=true",
    socials: { x: 'https://x.com/rihanna', instagram: 'https://instagram.com/rihanna' },
    royaltyConfig: { 
      streamingSplits: [{ address: 'UQRihanna_v8s1_m5n6', percentage: 0.10, label: 'Main Artist' }],
      nftSaleSplits: [{ address: 'UQRihanna_v8s1_m5n6', percentage: 0.20, label: 'Main Artist' }]
    },
    earnings: { streaming: 600.0, nftSales: 2000.0, total: 2600.0 },
    events: [],
    collaborations: []
  },
  { 
    uid: 'a4', 
    name: 'Asake', 
    username: '@asake',
    walletAddress: 'UQAsake_p3q9_r7t8',
    avatarUrl: 'https://i.postimg.cc/p96TmFcH/asake.jpg', 
    followers: 70000, 
    verified: true,
    isVerifiedArtist: true,
    genre: 'Afrobeats',
    bio: "Energy, Afrobeats, vibes.",
    bannerUrl: "https://image.pollinations.ai/prompt/asake%20vibe%20banner?width=1200&height=400&nologo=true",
    socials: { x: 'https://x.com/asake', instagram: 'https://instagram.com/asake' },
    royaltyConfig: { 
      streamingSplits: [{ address: 'UQAsake_p3q9_r7t8', percentage: 0.07, label: 'Main Artist' }],
      nftSaleSplits: [{ address: 'UQAsake_p3q9_r7t8', percentage: 0.12, label: 'Main Artist' }]
    },
    earnings: { streaming: 300.0, nftSales: 900.0, total: 1200.0 },
    events: [],
    collaborations: []
  },
  { 
    uid: 'a5', 
    name: 'Justin Bieber', 
    username: '@justinbieber',
    walletAddress: 'UQJBieber_w2x4_b1c2',
    avatarUrl: 'https://i.postimg.cc/VdWkjTZr/bieber.jpg', 
    followers: 150000, 
    verified: true,
    isVerifiedArtist: true,
    genre: 'Pop',
    bio: "Global pop sensation.",
    bannerUrl: "https://image.pollinations.ai/prompt/bieber%20pop%20banner?width=1200&height=400&nologo=true",
    socials: { x: 'https://x.com/justinbieber', instagram: 'https://instagram.com/justinbieber' },
    royaltyConfig: { 
      streamingSplits: [{ address: 'UQJBieber_w2x4_b1c2', percentage: 0.10, label: 'Main Artist' }],
      nftSaleSplits: [{ address: 'UQJBieber_w2x4_b1c2', percentage: 0.20, label: 'Main Artist' }]
    },
    earnings: { streaming: 700.0, nftSales: 2500.0, total: 3200.0 },
    events: [],
    collaborations: []
  },
  { 
    uid: 'a6', 
    name: 'Beyonce', 
    username: '@beyonce',
    walletAddress: 'UQBeyonce_d5f6_g7h8',
    avatarUrl: 'https://i.postimg.cc/94Kmmjzc/beyonce.jpg', 
    followers: 160000, 
    verified: true,
    isVerifiedArtist: true,
    genre: 'Pop / R&B',
    bio: "Queen Bey. Global superstar.",
    bannerUrl: "https://image.pollinations.ai/prompt/beyonce%20queen%20banner?width=1200&height=400&nologo=true",
    socials: { x: 'https://x.com/beyonce', instagram: 'https://instagram.com/beyonce' },
    royaltyConfig: { 
      streamingSplits: [{ address: 'UQBeyonce_d5f6_g7h8', percentage: 0.12, label: 'Main Artist' }],
      nftSaleSplits: [{ address: 'UQBeyonce_d5f6_g7h8', percentage: 0.25, label: 'Main Artist' }]
    },
    earnings: { streaming: 800.0, nftSales: 3000.0, total: 3800.0 },
    events: [],
    collaborations: []
  },
  { 
    uid: 'a7', 
    name: 'Snoop Dogg', 
    username: '@snoopdogg',
    walletAddress: 'UQSnoopDogg_j1a2_z3z4',
    avatarUrl: 'https://i.postimg.cc/Yj1rHZ7t/snoop.jpg', 
    followers: 100000, 
    verified: true,
    isVerifiedArtist: true,
    genre: 'Hip Hop',
    bio: "West coast hip hop legend.",
    bannerUrl: "https://image.pollinations.ai/prompt/snoop%20dogg%20banner?width=1200&height=400&nologo=true",
    socials: { x: 'https://x.com/snoopdogg', instagram: 'https://instagram.com/snoopdogg' },
    royaltyConfig: { 
      streamingSplits: [{ address: 'UQSnoopDogg_j1a2_z3z4', percentage: 0.08, label: 'Main Artist' }],
      nftSaleSplits: [{ address: 'UQSnoopDogg_j1a2_z3z4', percentage: 0.15, label: 'Main Artist' }]
    },
    earnings: { streaming: 500.0, nftSales: 1500.0, total: 2000.0 },
    events: [],
    collaborations: []
  },
  { 
    uid: 'a8', 
    name: 'Jay-Z', 
    username: '@jayz',
    walletAddress: 'UQJayZ_h1i2_p3h4',
    avatarUrl: 'https://i.postimg.cc/JsdmxWNn/jayz.jpg', 
    followers: 110000, 
    verified: true,
    isVerifiedArtist: true,
    genre: 'Hip Hop',
    bio: "Hip hop legend and mogul.",
    bannerUrl: "https://image.pollinations.ai/prompt/jayz%20banner?width=1200&height=400&nologo=true",
    socials: { x: 'https://x.com/jayz', instagram: 'https://instagram.com/jayz' },
    royaltyConfig: { 
      streamingSplits: [{ address: 'UQJayZ_h1i2_p3h4', percentage: 0.10, label: 'Main Artist' }],
      nftSaleSplits: [{ address: 'UQJayZ_h1i2_p3h4', percentage: 0.20, label: 'Main Artist' }]
    },
    earnings: { streaming: 600.0, nftSales: 2000.0, total: 2600.0 },
    events: [],
    collaborations: []
  },
  { 
    uid: 'a9', 
    name: '2Pac', 
    username: '@2pac',
    walletAddress: 'UQ2Pac_c1l2_a3s4',
    avatarUrl: 'https://i.postimg.cc/1VH1qxRD/2pac.jpg', 
    followers: 150000, 
    verified: true,
    isVerifiedArtist: true,
    genre: 'Hip Hop',
    bio: "Legendary hip hop artist.",
    bannerUrl: "https://image.pollinations.ai/prompt/2pac%20banner?width=1200&height=400&nologo=true",
    socials: { x: 'https://x.com/2pac' },
    royaltyConfig: { 
      streamingSplits: [{ address: 'UQ2Pac_c1l2_a3s4', percentage: 0.10, label: 'Main Artist' }],
      nftSaleSplits: [{ address: 'UQ2Pac_c1l2_a3s4', percentage: 0.20, label: 'Main Artist' }]
    },
    earnings: { streaming: 500.0, nftSales: 1500.0, total: 2000.0 },
    events: [],
    collaborations: []
  },
  { 
    uid: 'a10', 
    name: '50 Cent', 
    username: '@50cent',
    walletAddress: 'UQ50Cent_r1o2_c3k4',
    avatarUrl: 'https://i.postimg.cc/ftQb7Nsm/50cent.jpg', 
    followers: 90000, 
    verified: true,
    isVerifiedArtist: true,
    genre: 'Hip Hop',
    bio: "Hip hop legend and star.",
    bannerUrl: "https://image.pollinations.ai/prompt/50cent%20banner?width=1200&height=400&nologo=true",
    socials: { x: 'https://x.com/50cent', instagram: 'https://instagram.com/50cent' },
    royaltyConfig: { 
      streamingSplits: [{ address: 'UQ50Cent_r1o2_c3k4', percentage: 0.08, label: 'Main Artist' }],
      nftSaleSplits: [{ address: 'UQ50Cent_r1o2_c3k4', percentage: 0.15, label: 'Main Artist' }]
    },
    earnings: { streaming: 400.0, nftSales: 1200.0, total: 1600.0 },
    events: [],
    collaborations: []
  },
  { 
    uid: 'a11', 
    name: 'Wiz Khalifa', 
    username: '@wizkhalifa',
    walletAddress: 'UQLoFi_l1o2_f3i4',
    avatarUrl: 'https://i.postimg.cc/JG0RknJR/wizkhalifa.jpg', 
    followers: 80000, 
    verified: true,
    isVerifiedArtist: true,
    genre: 'Hip Hop',
    bio: "Hip hop artist and lifestyle icon.",
    bannerUrl: "https://image.pollinations.ai/prompt/wiz%20khalifa%20banner?width=1200&height=400&nologo=true",
    socials: { x: 'https://x.com/wizkhalifa', instagram: 'https://instagram.com/wizkhalifa' },
    royaltyConfig: { 
      streamingSplits: [{ address: 'UQLoFi_l1o2_f3i4', percentage: 0.07, label: 'Main Artist' }],
      nftSaleSplits: [{ address: 'UQLoFi_l1o2_f3i4', percentage: 0.12, label: 'Main Artist' }]
    },
    earnings: { streaming: 300.0, nftSales: 900.0, total: 1200.0 },
    events: [],
    collaborations: []
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
    userName: 'DJ Krupy', 
    userAvatar: 'https://image.pollinations.ai/prompt/cool%20dj%20profile%20picture%20cyberpunk%20neon%20glasses?width=400&height=400&nologo=true', 
    content: 'Just dropped my new single "Solar Pulse" on TonJam! Check out the limited NFT edition too. 🔥🚀', 
    trackId: '1', 
    likes: 1245, 
    reposts: 242,
    isLiked: true,
    isReposted: false,
    comments: 4, 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    commentList: [
      {
        id: 'c1',
        userId: 'u2',
        userName: 'Sarah Jenkins',
        userAvatar: 'https://image.pollinations.ai/prompt/young%20woman%20avatar%20with%20cool%20glasses%20and%20headphones?width=400&height=400&nologo=true',
        content: 'This is fire! The energy is unmatched. 🔥',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
        likes: 12,
        reactions: { '🔥': 5 },
        userReactions: ['🔥']
      },
      {
        id: 'c2',
        userId: 'a1',
        userName: 'Cosmic Echo',
        userAvatar: 'https://image.pollinations.ai/prompt/mystical%20space%20traveler%20avatar%20synthwave%20colors?width=400&height=400&nologo=true',
        content: 'Great work on the production here. The synth layers are impeccable.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
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
    userAvatar: 'https://image.pollinations.ai/prompt/young%20woman%20avatar%20with%20cool%20glasses%20and%20headphones?width=400&height=400&nologo=true', 
    content: 'The marketplace is booming today. Nabbed a rare Cosmic Echo NFT! The collection is looking strong. 💎', 
    nftId: 'n1',
    likes: 89, 
    reposts: 15,
    isLiked: false,
    isReposted: true,
    comments: 1, 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    commentList: [
      {
        id: 'c3',
        userId: 'u1',
        userName: 'DJ Krupy',
        userAvatar: 'https://image.pollinations.ai/prompt/cool%20dj%20profile%20picture%20cyberpunk%20neon%20glasses?width=400&height=400&nologo=true',
        content: 'Nice grab! The Genesis editions are going to be legendary.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        likes: 4
      }
    ]
  },
  {
    id: 'p3',
    userId: 'a2',
    userName: 'Byte Beat',
    userAvatar: 'https://image.pollinations.ai/prompt/digital%20humanoid%20avatar%20glitch%20art?width=400&height=400&nologo=true',
    content: 'Working on some new neural frequencies. Stay tuned for the drop! 🎧✨',
    imageUrl: 'https://image.pollinations.ai/prompt/abstract%20digital%20neural%20network%20glowing%20lines%20music%20visualization?width=1200&height=600&nologo=true',
    likes: 892,
    reposts: 145,
    comments: 34,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
  }
];

export const MOCK_USERS: UserProfile[] = [
  MOCK_USER,
  {
    uid: 'u2',
    name: 'Sarah Jenkins',
    username: '@sarahj',
    avatar: 'https://image.pollinations.ai/prompt/young%20woman%20avatar%20with%20cool%20glasses%20and%20headphones?width=400&height=400&nologo=true',
    bannerUrl: 'https://image.pollinations.ai/prompt/aesthetic%20bedroom%20lofi%20vibes%20banner?width=1200&height=400&nologo=true',
    bio: 'Digital art enthusiast and music lover. Collectible hunter on TON.',
    followers: 450,
    following: 120,
    earnings: 0,
    followedArtists: ['a1', 'a5'],
    friends: ['u1'],
    role: 'collector'
  },
  {
    uid: 'u3',
    name: 'Alex Rivera',
    username: '@arivera',
    avatar: 'https://image.pollinations.ai/prompt/young%20man%20avatar%20with%20streetwear%20and%20cap?width=400&height=400&nologo=true',
    bannerUrl: 'https://image.pollinations.ai/prompt/abstract%20sound%20waves%20colorful%20banner?width=1200&height=400&nologo=true',
    bio: 'Creating the future of sound. Electronic producer and synth enthusiast.',
    followers: 890,
    following: 340,
    earnings: 0,
    followedArtists: ['a2', 'a3', 'a6'],
    friends: ['u1'],
    role: 'artist'
  }
];

export const MOCK_PLAYLISTS: Playlist[] = [
  { 
    id: 'pl1', 
    title: 'Gaming Vibes', 
    coverUrl: 'https://image.pollinations.ai/prompt/gaming%20setup%20neon%20lights%20headphones%20cyberpunk?width=400&height=400&nologo=true', 
    trackCount: 4, 
    creator: 'DJ Krupy', 
    trackIds: ['1', '2', '6', '15'] 
  },
  { 
    id: 'pl2', 
    title: 'Late Night Study', 
    coverUrl: 'https://image.pollinations.ai/prompt/cozy%20library%20at%20night%20with%20warm%20lamp%20lofi%20aesthetic?width=400&height=400&nologo=true', 
    trackCount: 15, 
    creator: 'Chill Coffee', 
    trackIds: ['3', '16', '11'] 
  },
  {
    id: 'pl3',
    title: 'Cyberpunk Drive',
    coverUrl: 'https://image.pollinations.ai/prompt/futuristic%20highway%20at%20night%20with%20fast%20cars%20synthwave?width=400&height=400&nologo=true',
    trackCount: 8,
    creator: 'Cosmic Echo',
    trackIds: ['2', '7', '9']
  }
];

export const MOCK_EVENTS = MOCK_ARTISTS.flatMap(a => a.events || []).map(e => ({
  ...e,
  imageUrl: getPlaceholderImage(`event-${e.id}`, 800, 400),
  bannerImageUrl: getPlaceholderImage(`banner-${e.id}`, 1200, 300)
}));
