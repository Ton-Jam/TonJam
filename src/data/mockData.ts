import { TrackData, AlbumData, PlaylistData } from '../components/cards/music/MusicCards';
import { NFTData, CollectionData } from '../components/cards/nft/NFTCards';
import { ArtistData } from '../components/cards/artist/ArtistCards';
import { SocialPostData, CommentData, SpaceData, EventData } from '../components/cards/feed/SocialCards';
import { UserProfileData, AchievementData, FollowUserData } from '../components/cards/profile/ProfileCards';
import { MissionData, LeaderboardUserData } from '../components/cards/task/TaskCards';
import { TokenData, TransactionData } from '../components/cards/wallet/WalletCards';

// --- GENERATOR HELPERS ---

const GENRES = ['Synthwave', 'Phonk', 'Future Funk', 'Web3 Bass', 'ChillHop', 'Techno', 'Hyperpop', 'Ambient', 'Afrobeats', 'Grime'];
const ADJECTIVES = ['Cyber', 'Neon', 'Lunar', 'Electric', 'Solar', 'Atomic', 'Cosmic', 'Pixel', 'Acid', 'Vapor', 'Echo', 'Static'];
const NOUNS = ['Pulse', 'Waves', 'Groove', 'Vibe', 'Drift', 'Rhythm', 'Drip', 'Glitch', 'Jam', 'Bounce', 'System', 'Force'];
const ARTIST_FIRST = ['DJ', 'Lil', 'MC', 'Krupy', 'Satoshi', 'Zora', 'Vandal', 'Nova', 'Specter', 'Luna', 'Vapor', 'Aero'];
const ARTIST_LAST = ['Sonic', 'Glow', 'Jammer', 'Byte', 'Sync', 'Synth', 'Beats', 'Web3', 'Flow', 'Sovereign', 'Pixel'];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- 1. 100 ARTISTS ---
export const artists: ArtistData[] = Array.from({ length: 100 }, (_, i) => {
  const firstName = randomElement(ARTIST_FIRST);
  const lastName = randomElement(ARTIST_LAST);
  const name = i === 0 ? 'DJ Krupy' : `${firstName} ${lastName}`;
  const username = `@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  return {
    id: `artist-${i + 1}`,
    name,
    username,
    avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + (i * 1234)}?auto=format&fit=crop&q=80&w=150&h=150`,
    bannerUrl: `https://images.unsplash.com/photo-${1600000000000 + (i * 2345)}?auto=format&fit=crop&q=80&w=800&h=400`,
    isVerified: i % 4 === 0,
    followersCount: randomRange(500, 240000),
    monthlyListeners: randomRange(1000, 450000),
    featuredTrackTitle: `${randomElement(ADJECTIVES)} ${randomElement(NOUNS)}`,
    genre: randomElement(GENRES),
    bio: `Web3 Sound Architect weaving ${randomElement(GENRES)} melodies for the Open Network. Connecting directly with fans via TonJam.`,
    nftHolders: randomRange(10, 450),
    totalSalesVolume: (randomRange(50, 4500)).toString(),
    rank: i + 1,
    mutualFollowers: i % 3 === 0 ? ['@krupy', '@ton_user'] : [],
  };
});

// --- 2. 500 TRACKS ---
export const tracks: TrackData[] = Array.from({ length: 500 }, (_, i) => {
  const title = `${randomElement(ADJECTIVES)} ${randomElement(NOUNS)}`;
  const artistObj = artists[i % artists.length];
  const durationMin = randomRange(2, 4);
  const durationSec = randomRange(10, 59).toString().padStart(2, '0');
  
  return {
    id: `track-${i + 1}`,
    title,
    artist: artistObj.name,
    artistAvatar: artistObj.avatarUrl,
    isVerified: artistObj.isVerified,
    coverUrl: `https://images.unsplash.com/photo-${1510000000000 + (i * 3456)}?auto=format&fit=crop&q=80&w=200&h=200`,
    duration: `${durationMin}:${durationSec}`,
    genre: randomElement(GENRES),
    isExplicit: i % 15 === 0,
    isNFT: i % 2.5 === 0, // Generates roughly 200 NFT Tracks
    streams: randomRange(100, 1500000),
    isLiked: i % 6 === 0,
    trendRank: i < 50 ? i + 1 : undefined,
    trendDirection: i % 3 === 0 ? 'up' : i % 3 === 1 ? 'down' : 'stable',
    playedAt: `${randomRange(2, 59)}m ago`,
    listenPercentage: randomRange(20, 100),
    recommendationReason: i % 10 === 0 ? `Based on ${randomElement(GENRES)}` : undefined,
  };
});

// --- 3. 200 NFT TRACKS ---
export const nftTracks: TrackData[] = tracks.filter(t => t.isNFT).slice(0, 200);

// --- 4. 150 ALBUMS ---
export const albums: AlbumData[] = Array.from({ length: 150 }, (_, i) => {
  const artistObj = artists[i % artists.length];
  return {
    id: `album-${i + 1}`,
    title: `${randomElement(ADJECTIVES)} Anthology`,
    artist: artistObj.name,
    isArtistVerified: artistObj.isVerified,
    coverUrl: `https://images.unsplash.com/photo-${1520000000000 + (i * 4567)}?auto=format&fit=crop&q=80&w=200&h=200`,
    releaseYear: randomRange(2022, 2026),
    trackCount: randomRange(6, 16),
    duration: `${randomRange(20, 50)}m`,
    genre: randomElement(GENRES),
    isNFTCollection: i % 5 === 0,
    isDolbyAtmos: i % 3 === 0,
    isLiked: i % 7 === 0,
  };
});

// --- 5. 120 PLAYLISTS ---
export const playlists: PlaylistData[] = Array.from({ length: 120 }, (_, i) => {
  return {
    id: `playlist-${i + 1}`,
    title: `${randomElement(GENRES)} Mix Vol. ${randomRange(1, 10)}`,
    creator: i % 3 === 0 ? 'TonJam Official' : artists[i % artists.length].name,
    isCreatorVerified: i % 3 === 0,
    coverUrl: `https://images.unsplash.com/photo-${1530000000000 + (i * 5678)}?auto=format&fit=crop&q=80&w=200&h=200`,
    trackCount: randomRange(10, 40),
    duration: `${randomRange(1, 3)}h`,
    followersCount: randomRange(100, 25000),
    isCollaborative: i % 6 === 0,
    isPrivate: i % 10 === 0,
    isLiked: i % 4 === 0,
  };
});

// --- 6. 300 USERS ---
export const users: UserProfileData[] = Array.from({ length: 300 }, (_, i) => {
  const name = `SyncFan_${i + 1}`;
  return {
    id: `user-${i + 1}`,
    username: `@${name.toLowerCase()}`,
    displayName: `Listener ${i + 1}`,
    avatarUrl: `https://images.unsplash.com/photo-${1540000000000 + (i * 6789)}?auto=format&fit=crop&q=80&w=150&h=150`,
    bio: `Proud Web3 Sync enthusiast. Collected ${randomRange(2, 25)} NFT Tracks on TonJam!`,
    isVerified: i % 10 === 0,
    isPremium: i % 3 === 0,
    followersCount: randomRange(5, 1200),
    followingCount: randomRange(10, 500),
    streamsCount: randomRange(50, 50000),
    nftsCount: randomRange(1, 30),
    xpPoints: randomRange(100, 15000),
    level: randomRange(1, 45),
    streakDays: randomRange(0, 30),
  };
});

// --- 7. 50 COLLECTIONS ---
export const collections: CollectionData[] = Array.from({ length: 50 }, (_, i) => {
  const artistObj = artists[i % artists.length];
  return {
    id: `collection-${i + 1}`,
    name: `${randomElement(ADJECTIVES)} Genesis Pack`,
    creator: artistObj.name,
    coverUrl: `https://images.unsplash.com/photo-${1550000000000 + (i * 7890)}?auto=format&fit=crop&q=80&w=200&h=200`,
    itemCount: randomRange(10, 200),
    floorPrice: (randomRange(1, 150)).toString(),
    totalVolume: (randomRange(100, 50000)).toString(),
    isVerified: artistObj.isVerified,
    previewImages: [
      `https://images.unsplash.com/photo-${1550000000000 + (i * 7891)}?auto=format&fit=crop&q=80&w=100&h=100`,
      `https://images.unsplash.com/photo-${1550000000000 + (i * 7892)}?auto=format&fit=crop&q=80&w=100&h=100`,
    ],
  };
});

// --- 8. 30 WALLETS ---
export const wallets = Array.from({ length: 30 }, (_, i) => {
  return {
    id: `wallet-${i + 1}`,
    address: `EQ${Array.from({ length: 44 }, () => Math.random().toString(36)[2]).join('').toUpperCase()}`,
    balanceTon: (randomRange(2, 4500) + Math.random()).toFixed(2),
    balanceUsd: (randomRange(5, 15000)).toLocaleString(),
    tokens: [
      { id: 't1', name: 'The Open Network', symbol: 'TON', balance: '254.20', priceUsd: '6.45', change24h: 3.4 },
      { id: 't2', name: 'TonJam Native', symbol: 'JAM', balance: '12,500.00', priceUsd: '0.12', change24h: 12.5 },
    ]
  };
});

// --- 9. 50 FEED POSTS ---
export const feedPosts: SocialPostData[] = Array.from({ length: 50 }, (_, i) => {
  const artistObj = artists[i % artists.length];
  return {
    id: `post-${i + 1}`,
    authorName: artistObj.name,
    authorUsername: artistObj.username,
    authorAvatar: artistObj.avatarUrl,
    isAuthorVerified: artistObj.isVerified,
    content: `Just dropped a brand new NFT exclusive track titled "${randomElement(ADJECTIVES)} ${randomElement(NOUNS)}"! Minting is officially OPEN on my launchpad. Only a few left before sold out! 🚀💎`,
    imageUrl: i % 2 === 0 ? `https://images.unsplash.com/photo-${1560000000000 + (i * 8901)}?auto=format&fit=crop&q=80&w=500&h=300` : undefined,
    likesCount: randomRange(5, 1200),
    commentsCount: randomRange(2, 450),
    sharesCount: randomRange(1, 150),
    timeString: `${randomRange(1, 23)}h ago`,
    isLiked: i % 5 === 0,
  };
});

// --- 10. 50 MISSIONS ---
export const missions: MissionData[] = Array.from({ length: 50 }, (_, i) => {
  return {
    id: `mission-${i + 1}`,
    title: `Sync with ${randomRange(3, 10)} New Artists`,
    description: `Expand your Web3 sound roster by following upcoming ${randomElement(GENRES)} creators.`,
    rewardText: `+${randomRange(50, 500)} XP`,
    progressValue: randomRange(0, 5),
    progressMax: 5,
    isCompleted: i % 4 === 0,
    isClaimed: false,
  };
});
