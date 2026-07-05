import { NFTItem } from "@/types";
import { NFTCollection, LiveAuction, LeaderboardUser, RecentSale, GenreCategory, MarketplaceStats } from "../types";

// Helper to generate a random number between min and max
const randomRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number, decimals = 1) => 
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

// Arrays of realistic music descriptors to assemble rich mock data
const GENRES = [
  "Afrobeats", "Hip-Hop", "Amapiano", "Pop", "Electronic", 
  "R&B", "Gospel", "Jazz", "Classical", "Experimental"
];

const MOODS = ["chill", "energetic", "focus", "happy", "melancholic"];

const FIRST_NAMES = [
  "DJ", "Lara", "Neon", "Astro", "Serum", "Satoshi", "Krupy", "Vibe", "Zane", "Cleo",
  "Rhythm", "Synth", "Orion", "Zephyr", "Luna", "Kai", "Indigo", "Nova", "Echo", "Flux",
  "Pulse", "Coda", "Beat", "Apex", "Bass", "Treble", "Sonic", "Melody", "Harp", "Lyric",
  "Key", "Chord", "Tempo", "Audrey", "Dev", "Phoenix", "Ember", "Ash", "Storm", "River",
  "Skye", "Sol", "Sage", "Jade", "Onyx", "Gemma", "Milo", "Koa", "Brio", "Muse"
];

const LAST_NAMES = [
  "Forge", "Wave", "Beats", "Pulse", "Moon", "Symphony", "Anthem", "Vibe", "Jam", "Soul",
  "Nights", "Flow", "Echo", "Vortex", "Saga", "Oracle", "Matrix", "Cipher", "Tuning", "Harmonics",
  "Strobe", "Glitch", "Reverb", "Decibel", "Octave", "Fuzz", "Delay", "Filter", "Grover", "Static",
  "Resonance", "Aura", "Drifter", "Glider", "Rider", "Shifter", "Maker", "Breaker", "Weaver", "Spinner",
  "Chaser", "Seeder", "Hunter", "Dreamer", "Seeker", "Walker", "Runner", "Voyager", "Ranger", "Keeper"
];

const ADJECTIVES = [
  "Cosmic", "Golden", "Neon", "Supernova", "Ether", "Digital", "Retro", "Ambient", "Acid", "Velvet",
  "Solar", "Liquid", "Frozen", "Heavy", "Quantum", "Spectral", "Infinite", "Prismatic", "Subliminal", "Stellar",
  "Subzero", "Primal", "Mystic", "Electric", "Magnetic", "Ethereal", "Nomadic", "Savage", "Hidden", "Luminous",
  "Ecliptic", "Galactic", "Stardusted", "Vibrant", "Chilled", "Holographic", "Virtual", "Shadowy", "Glitchy", "Raw"
];

const NOUNS = [
  "Odyssey", "Symphony", "Anthem", "Echoes", "Nights", "Waves", "Pulse", "Vibe", "Vortex", "Horizon",
  "Universe", "Dream", "Dimension", "Rhapsody", "Frenzy", "Glory", "Lullaby", "Interlude", "Cascade", "Mirage",
  "Eclipse", "Strobe", "Ascent", "Descent", "Rebel", "Voyage", "Portal", "Saga", "Drift", "Frequency",
  "Velocity", "Gravity", "Anomaly", "Nebula", "Static", "Zenith", "Nirvana", "Resonance", "Fidelity", "Signal"
];

const COVER_PHOTOS = [
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1487180142328-054b783fc471?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1446057032654-9d8885b7512a?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1453090927415-5f45085b65c0?w=500&auto=format&fit=crop&q=60"
];

// Seed 100 Unique Artists
export const MOCK_ARTISTS: LeaderboardUser[] = Array.from({ length: 100 }).map((_, i) => {
  const isVerified = i < 40; // 40% verified
  const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
  const lastName = LAST_NAMES[(i * 3) % LAST_NAMES.length];
  const name = `${firstName} ${lastName}`;
  const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${i}`;
  
  return {
    id: `art-${i + 1}`,
    name,
    username,
    avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`,
    isVerified,
    salesCount: randomRange(10, 150),
    revenueTON: randomRange(500, 12000).toLocaleString(),
    followersCount: randomRange(150, 45000),
  };
});

// Seed 100 Unique Buyers/Users (including some overlaps)
export const MOCK_USERS: LeaderboardUser[] = Array.from({ length: 100 }).map((_, i) => {
  const isVerified = i < 15;
  const username = `ton_collector_${i + 1}`;
  return {
    id: `usr-${i + 1}`,
    name: `Collector #${i + 101}`,
    username,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
    isVerified,
    nftsOwnedCount: randomRange(2, 64),
    tonSpent: randomRange(50, 8500).toLocaleString(),
    revenueTON: "0",
    followersCount: randomRange(5, 450),
  };
});

// Seed 100 Collections
export const MOCK_COLLECTIONS: NFTCollection[] = Array.from({ length: 100 }).map((_, i) => {
  const artist = MOCK_ARTISTS[i % MOCK_ARTISTS.length];
  const adjective = ADJECTIVES[i % ADJECTIVES.length];
  const noun = NOUNS[(i * 2) % NOUNS.length];
  const name = `${adjective} ${noun} Collection`;
  
  return {
    id: `col-${i + 1}`,
    name,
    creator: artist.name,
    creatorId: artist.id,
    volume: randomRange(100, 45000).toLocaleString(),
    owners: randomRange(5, 800),
    floorPrice: randomFloat(1.5, 95.0, 1).toString(),
    imageUrl: COVER_PHOTOS[i % COVER_PHOTOS.length],
    itemCount: randomRange(10, 150),
    verified: artist.isVerified,
    description: `A premium soundscape experience compiled of ${adjective.toLowerCase()} frequencies, brought to you by ${artist.name}. Verified on TON.`
  };
});

// Generate 300 Tracks
export const MOCK_TRACKS: NFTItem[] = Array.from({ length: 300 }).map((_, i) => {
  const artist = MOCK_ARTISTS[i % MOCK_ARTISTS.length];
  const collection = MOCK_COLLECTIONS[i % MOCK_COLLECTIONS.length];
  const adjective = ADJECTIVES[(i * 4) % ADJECTIVES.length];
  const noun = NOUNS[(i * 7) % NOUNS.length];
  const title = `${adjective} ${noun}`;
  const genre = GENRES[i % GENRES.length];
  const mood = MOODS[i % MOODS.length];
  
  const isListing = i % 3 !== 0; // 66% listed
  const listingType = isListing ? (i % 5 === 0 ? "auction" : "fixed") : undefined;
  const price = isListing ? `${randomFloat(1.5, 45.0, 1)} TON` : undefined;

  return {
    id: `nft-track-${i + 1}`,
    trackId: `song-${i + 1}`,
    songId: `song-${i + 1}`,
    albumId: collection.id,
    title,
    artist: artist.name,
    artistId: artist.id,
    owner: artist.name,
    creator: artist.name,
    imageUrl: COVER_PHOTOS[(i + 3) % COVER_PHOTOS.length],
    coverUrl: COVER_PHOTOS[(i + 3) % COVER_PHOTOS.length],
    audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3",
    duration: randomRange(110, 310),
    genre,
    mood,
    isNFT: true,
    artistVerified: artist.isVerified,
    price: price || "1.5 TON",
    listingType,
    auctionDuration: listingType === "auction" ? `${randomRange(2, 48)}h` : undefined,
    streamingPrice: "0.005 TON",
    edition: `${randomRange(1, 100)}/${randomRange(100, 1000)}`,
    editions: `${randomRange(1, 100)}/${randomRange(100, 1000)}`,
    minted: randomRange(1, 150),
    editionType: "Limited",
    rarity: i % 11 === 0 ? "Legendary" : (i % 5 === 0 ? "Rare" : "Common"),
    royalty: randomRange(5, 12),
    bpm: randomRange(80, 145),
    key: ["Am", "C", "G", "Em", "F", "Dm", "D", "A"][i % 8],
    bitrate: "320kbps",
    playCount: randomRange(120, 48000),
    likes: randomRange(5, 1200),
    createdAt: new Date(Date.now() - randomRange(1, 180) * 24 * 3600 * 1000).toISOString(),
    description: `Original master recording NFT of "${title}" by ${artist.name}. Enjoy full lossless playback and proof of verified ownership on The Open Network (TON).`
  };
});

// Seed 100 Auctions
export const MOCK_AUCTIONS: LiveAuction[] = MOCK_TRACKS
  .filter(t => t.listingType === "auction")
  .slice(0, 100)
  .map((track, i) => {
    const currentBidVal = randomFloat(2.0, 25.0, 1);
    const bidder = MOCK_USERS[(i * 3) % MOCK_USERS.length];
    
    // Distribute auction end times: some very soon (live feedback), some later
    const hourDelta = i % 5 === 0 ? randomFloat(0.1, 0.8, 2) : randomRange(1, 48);
    const endsAt = new Date(Date.now() + hourDelta * 3600 * 1000).toISOString();

    return {
      id: `auc-${i + 1}`,
      nft: track,
      currentBid: `${currentBidVal} TON`,
      highestBidder: bidder.name,
      endsAt,
      minIncrement: "0.5 TON",
      watchers: randomRange(12, 430),
      bidsCount: randomRange(1, 15),
      isLive: true
    };
  });

// Seed 100 Sales
export const MOCK_SALES: RecentSale[] = Array.from({ length: 100 }).map((_, i) => {
  const track = MOCK_TRACKS[i % MOCK_TRACKS.length];
  const buyer = MOCK_USERS[i % MOCK_USERS.length];
  const seller = MOCK_ARTISTS[(i + 5) % MOCK_ARTISTS.length];
  const priceVal = randomFloat(1.5, 60.0, 1);

  // Distribute sales over the last 48 hours
  const minuteDelta = randomRange(5, 2880);
  const date = new Date(Date.now() - minuteDelta * 60 * 1000);
  
  let timeStr = "";
  if (minuteDelta < 60) {
    timeStr = `${minuteDelta}m ago`;
  } else if (minuteDelta < 1440) {
    timeStr = `${Math.floor(minuteDelta / 60)}h ago`;
  } else {
    timeStr = `${Math.floor(minuteDelta / 1440)}d ago`;
  }

  return {
    id: `sale-${i + 1}`,
    nftId: track.id,
    nftTitle: track.title,
    nftCoverUrl: track.coverUrl,
    buyerName: buyer.name,
    buyerAddress: `EQD...${buyer.username.substring(0, 4).toUpperCase()}`,
    sellerName: seller.name,
    sellerAddress: `EQA...${seller.username.substring(0, 4).toUpperCase()}`,
    price: `${priceVal} TON`,
    timestamp: timeStr
  };
});

// Top-Level Genre Data mapping
export const GENRE_CATEGORIES: GenreCategory[] = [
  { id: "g1", name: "Afrobeats", count: "12,450 NFTs", coverUrl: COVER_PHOTOS[0], colorClass: "from-amber-600 to-yellow-900" },
  { id: "g2", name: "Hip-Hop", count: "34,120 NFTs", coverUrl: COVER_PHOTOS[1], colorClass: "from-blue-600 to-indigo-950" },
  { id: "g3", name: "Amapiano", count: "8,920 NFTs", coverUrl: COVER_PHOTOS[2], colorClass: "from-purple-600 to-pink-950" },
  { id: "g4", name: "Pop", count: "19,250 NFTs", coverUrl: COVER_PHOTOS[3], colorClass: "from-emerald-600 to-teal-950" },
  { id: "g5", name: "Electronic", count: "42,800 NFTs", coverUrl: COVER_PHOTOS[4], colorClass: "from-cyan-600 to-blue-950" },
  { id: "g6", name: "R&B", count: "11,200 NFTs", coverUrl: COVER_PHOTOS[5], colorClass: "from-rose-600 to-red-950" },
  { id: "g7", name: "Gospel", count: "4,350 NFTs", coverUrl: COVER_PHOTOS[6], colorClass: "from-amber-500 to-stone-900" },
  { id: "g8", name: "Jazz", count: "6,410 NFTs", coverUrl: COVER_PHOTOS[7], colorClass: "from-sky-700 to-slate-900" },
  { id: "g9", name: "Classical", count: "3,120 NFTs", coverUrl: COVER_PHOTOS[8], colorClass: "from-zinc-600 to-neutral-900" },
  { id: "g10", name: "Experimental", count: "7,800 NFTs", coverUrl: COVER_PHOTOS[9], colorClass: "from-fuchsia-700 to-purple-950" }
];

// Seed Analytics Statistics
export const MOCK_STATS: MarketplaceStats = {
  volumeTotal: "342,850 TON",
  volumeChange24h: "+14.8%",
  dailySalesCount: 184,
  weeklySalesCount: 1290,
  monthlySalesCount: 5820,
  totalOwners: 8240,
  floorPrice: "1.8 TON",
  highestSale: "4,200 TON"
};
