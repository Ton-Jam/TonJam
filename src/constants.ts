import { Track, NFTItem, Artist, Post, Playlist, Album, UserProfile } from './types';
import { GUEST_USER_PROFILE } from './lib/resetMockCache';
import { Zap, Moon, Waves, Sparkles, Factory, Coffee, Headphones, Guitar, Music, Piano } from 'lucide-react';

// Official TonJam Brand Assets
export const APP_LOGO = "https://i.postimg.cc/63GsZHzq/TonJam-icon.png";
export const TJ_COIN_ICON = "https://i.postimg.cc/s2QHHMSF/TonjamCoin.png";
export const TON_LOGO = "https://i.postimg.cc/jj7HksNw/ton-symbol.png";
export const DJ_KRUPY_AVATAR = "https://i.postimg.cc/K8QgMBjt/grok-image-1777930555512-2.png";

// Placeholder price for TJ Coin (JAM) in USD
export const JAM_PRICE_USD = 0.052;
export const JAM_JETTON_MASTER = "EQCxE6mNZ_9MvS_88888888888888888888888888888";

// Official Configured TonJam Treasury Receiving Wallet Address
export const TONJAM_TREASURY_ADDRESS = (import.meta.env.VITE_TONJAM_TREASURY_ADDRESS as string) || "UQD_VZD-zU7IQ4nLBDPssEzApiFbWpV6lSmkmybWxgzLFkEr";

export const MOODS = [
  { id: 'chill', name: 'Chill', color: 'from-blue-400 to-indigo-500' },
  { id: 'energetic', name: 'Energetic', color: 'from-orange-400 to-red-500' },
  { id: 'focus', name: 'Focus', color: 'from-emerald-400 to-teal-500' },
  { id: 'happy', name: 'Happy', color: 'from-yellow-400 to-orange-500' },
  { id: 'melancholic', name: 'Melancholic', color: 'from-purple-400 to-indigo-500' },
];

export const MOCK_TRACKS: Track[] = [];

export const MOCK_ALBUMS: Album[] = [];

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

export const CURATED_PLAYLISTS: Playlist[] = [];

export const MOCK_USER: UserProfile = { ...GUEST_USER_PROFILE };

export const MOCK_NFTS: NFTItem[] = [];

export const MOCK_ARTISTS: Artist[] = [];

export const MOCK_SONG_REQUESTS: any[] = [];

export const MOCK_POSTS: Post[] = [];

export const MOCK_USERS: UserProfile[] = [];

export const MOCK_PLAYLISTS: Playlist[] = [];

export const MOCK_EVENTS: any[] = [];
