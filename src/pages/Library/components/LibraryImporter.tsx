import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/layout/ToastProvider';
import { 
  Database, RefreshCw, CheckCircle2, Music, ListMusic, Plus, 
  AlertCircle, Sparkles, ChevronRight, Check, X, ShieldAlert, Key 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LibraryImporterProps {
  importTracks: (tracks: { title: string; artist: string; album?: string; coverUrl?: string; duration?: number }[]) => void;
  importPlaylistWithTracks: (title: string, coverUrl: string, tracks: { title: string; artist: string; album?: string; coverUrl?: string; duration?: number }[]) => void;
}

interface ExternalPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  tracks: { total: number };
  tracksList: { title: string; artist: string; album?: string; duration: number }[];
}

interface ExternalTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: number;
}

// Highly detailed realistic demo datasets
const DEMO_SPOTIFY_PLAYLISTS: ExternalPlaylist[] = [
  {
    id: 'sp-pl-1',
    name: 'Web3 Late Night Coding',
    description: 'Deconstruct smart contracts with deep synthwave rhythms and atmospheric electronic frequencies.',
    images: [{ url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&h=300&q=80' }],
    tracks: { total: 5 },
    tracksList: [
      { title: 'Sovereign Nodes', artist: 'DJ Krupy', album: 'TON Genesis', duration: 198 },
      { title: 'Neon Horizon', artist: 'Satoshi Sync', album: 'Future Ledger', duration: 225 },
      { title: 'Consensus Drift', artist: 'Hyperion', album: 'Ethereal Orbit', duration: 182 },
      { title: 'Gas Price Chill', artist: 'EVM Demigod', album: 'Mempool Melodies', duration: 210 },
      { title: 'Distributed Grooves', artist: 'Satoshi Sync', album: 'Distributed Hearts', duration: 245 }
    ]
  },
  {
    id: 'sp-pl-2',
    name: 'DeFi Summer Chill Vibes',
    description: 'Smooth lo-fi and gentle hip-hop beats to calm your yield farming anxiety.',
    images: [{ url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&h=300&q=80' }],
    tracks: { total: 4 },
    tracksList: [
      { title: 'Blockchain Romance', artist: 'Satoshi Sync', album: 'Distributed Hearts', duration: 245 },
      { title: 'Liquid Royalty', artist: 'DJ Krupy', album: 'TON Genesis', duration: 211 },
      { title: 'Smart Contract Love', artist: 'Satoshi Sync', album: 'Distributed Hearts', duration: 228 },
      { title: 'Degen Serenade', artist: 'Durov Collective', album: 'The Telegram Way', duration: 176 }
    ]
  },
  {
    id: 'sp-pl-3',
    name: 'Proof of Workout',
    description: 'High-energy electronic, psy-trance, and club bangers to burn that gas limit.',
    images: [{ url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&h=300&q=80' }],
    tracks: { total: 4 },
    tracksList: [
      { title: 'Gas Limit Overflow', artist: 'EVM Demigod', album: 'Mempool Melodies', duration: 164 },
      { title: 'Gram Gram Vibing', artist: 'Durov Collective', album: 'The Telegram Way', duration: 191 },
      { title: 'Sovereign Nodes (Remix)', artist: 'DJ Krupy', album: 'TON Genesis Extra', duration: 215 },
      { title: 'EVM Firestorm', artist: 'Hyperion', album: 'Ethereal Orbit', duration: 198 }
    ]
  }
];

const DEMO_SPOTIFY_LIKED: ExternalTrack[] = [
  { id: 'sp-tr-1', title: 'Sovereign Nodes', artist: 'DJ Krupy', album: 'TON Genesis', coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=150&h=150&q=80', duration: 198 },
  { id: 'sp-tr-2', title: 'Blockchain Romance', artist: 'Satoshi Sync', album: 'Distributed Hearts', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=150&h=150&q=80', duration: 245 },
  { id: 'sp-tr-3', title: 'Consensus Drift', artist: 'Hyperion', album: 'Ethereal Orbit', coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=150&h=150&q=80', duration: 182 },
  { id: 'sp-tr-4', title: 'Liquid Royalty', artist: 'DJ Krupy', album: 'TON Genesis', coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=150&h=150&q=80', duration: 211 },
  { id: 'sp-tr-5', title: 'Smart Contract Love', artist: 'Satoshi Sync', album: 'Distributed Hearts', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&h=150&q=80', duration: 228 },
  { id: 'sp-tr-6', title: 'Gas Limit Overflow', artist: 'EVM Demigod', album: 'Mempool Melodies', coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=150&h=150&q=80', duration: 164 },
  { id: 'sp-tr-7', title: 'Gram Gram Vibing', artist: 'Durov Collective', album: 'The Telegram Way', coverUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&h=150&q=80', duration: 191 }
];

const DEMO_APPLE_PLAYLISTS: ExternalPlaylist[] = [
  {
    id: 'ap-pl-1',
    name: 'Spatial Chill Experience',
    description: 'Immersive Dolby Atmos music curation featuring experimental lo-fi and organic acoustics.',
    images: [{ url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=300&h=300&q=80' }],
    tracks: { total: 4 },
    tracksList: [
      { title: 'Satoshi Serenity', artist: 'Satoshi Sync', album: 'Distributed Hearts', duration: 212 },
      { title: 'Atmospheric Vault', artist: 'Hyperion', album: 'Ethereal Orbit', duration: 254 },
      { title: 'Decentralized Whisper', artist: 'DJ Krupy', album: 'TON Genesis', duration: 189 },
      { title: 'Bounty Hunters', artist: 'EVM Demigod', album: 'Mempool Melodies', duration: 195 }
    ]
  },
  {
    id: 'ap-pl-2',
    name: 'Decentralized Classical Remixed',
    description: 'Symphonies blended with subtle granular synthesis and digital glitches.',
    images: [{ url: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=300&h=300&q=80' }],
    tracks: { total: 3 },
    tracksList: [
      { title: 'Bach Crypto Fugue', artist: 'Satoshi Sync', album: 'Polyphony', duration: 280 },
      { title: 'Vivaldi Node Autumn', artist: 'DJ Krupy', album: 'The Four Ledgers', duration: 195 },
      { title: 'Consensus Waltz', artist: 'Hyperion', album: 'Block Harmony', duration: 230 }
    ]
  }
];

export const LibraryImporter: React.FC<LibraryImporterProps> = ({ 
  importTracks, 
  importPlaylistWithTracks 
}) => {
  const toast = useToast();

  // Authentication State
  const [spotifyUser, setSpotifyUser] = useState<any | null>(null);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [appleUser, setAppleUser] = useState<any | null>(null);

  // Connection mode: 'real' | 'demo'
  const [spotifyMode, setSpotifyMode] = useState<'real' | 'demo' | null>(null);
  const [appleMode, setAppleMode] = useState<'real' | 'demo' | null>(null);

  // Active view inside connected account
  const [activeService, setActiveService] = useState<'spotify' | 'apple' | null>(null);
  const [activeSection, setActiveSection] = useState<'playlists' | 'liked'>('playlists');

  // Playlists and Tracks lists (Fetched dynamically or mock populated)
  const [playlists, setPlaylists] = useState<ExternalPlaylist[]>([]);
  const [likedSongs, setLikedSongs] = useState<ExternalTrack[]>([]);
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Syncing State
  const [syncingPlaylistId, setSyncingPlaylistId] = useState<string | null>(null);
  const [isSyncingAllLiked, setIsSyncingAllLiked] = useState(false);
  const [loadingMedia, setLoadingMedia] = useState(false);

  // OAuth developer credentials instruction view
  const [showSpotifyCredentialsGuide, setShowSpotifyCredentialsGuide] = useState(false);

  // Read persisted connection stats
  useEffect(() => {
    const savedSpUser = localStorage.getItem('tonjam_spotify_user');
    const savedSpToken = localStorage.getItem('tonjam_spotify_token');
    const savedSpMode = localStorage.getItem('tonjam_spotify_mode');
    const savedApUser = localStorage.getItem('tonjam_apple_user');
    const savedApMode = localStorage.getItem('tonjam_apple_mode');

    if (savedSpUser && savedSpToken) {
      setSpotifyUser(JSON.parse(savedSpUser));
      setSpotifyToken(savedSpToken);
      setSpotifyMode((savedSpMode as any) || 'real');
    } else if (savedSpMode === 'demo') {
      setSpotifyUser({ display_name: 'Collector Demo', images: [{ url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80' }] });
      setSpotifyMode('demo');
    }

    if (savedApUser) {
      setAppleUser(JSON.parse(savedApUser));
      setAppleMode((savedApMode as any) || 'demo');
    }
  }, []);

  // Listen for Spotify OAuth message from callback popup
  useEffect(() => {
    const handleSpotifyMessage = (event: MessageEvent) => {
      // Validate origin
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }

      if (event.data?.type === 'SPOTIFY_VERIFIED') {
        const profile = event.data.data;
        if (profile) {
          const { access_token, ...userProfile } = profile;
          setSpotifyUser(userProfile);
          setSpotifyToken(access_token);
          setSpotifyMode('real');

          localStorage.setItem('tonjam_spotify_user', JSON.stringify(userProfile));
          localStorage.setItem('tonjam_spotify_token', access_token);
          localStorage.setItem('tonjam_spotify_mode', 'real');

          toast.success('Spotify Connected', `Welcome, ${userProfile.display_name}! Ready to import.`);
          setActiveService('spotify');
          setActiveSection('playlists');
          loadSpotifyData(access_token);
        }
      }
    };

    window.addEventListener('message', handleSpotifyMessage);
    return () => window.removeEventListener('message', handleSpotifyMessage);
  }, []);

  // Sync Spotify data if logged in
  useEffect(() => {
    if (activeService === 'spotify') {
      if (spotifyMode === 'real' && spotifyToken) {
        loadSpotifyData(spotifyToken);
      } else if (spotifyMode === 'demo') {
        setLoadingMedia(true);
        setTimeout(() => {
          setPlaylists(DEMO_SPOTIFY_PLAYLISTS);
          setLikedSongs(DEMO_SPOTIFY_LIKED);
          setLoadingMedia(false);
        }, 600);
      }
    } else if (activeService === 'apple') {
      setLoadingMedia(true);
      setTimeout(() => {
        setPlaylists(DEMO_APPLE_PLAYLISTS);
        setLikedSongs(DEMO_SPOTIFY_LIKED.slice(0, 5)); // reusable
        setLoadingMedia(false);
      }, 600);
    }
  }, [activeService, spotifyMode, appleMode]);

  const loadSpotifyData = async (token: string) => {
    setLoadingMedia(true);
    try {
      // Fetch playlists from API
      const playlistsRes = await fetch(`/api/spotify/playlists?token=${encodeURIComponent(token)}`);
      if (!playlistsRes.ok) throw new Error('Failed to fetch playlists');
      const playlistsData = await playlistsRes.json();

      // Fetch liked songs
      const songsRes = await fetch(`/api/spotify/liked-songs?token=${encodeURIComponent(token)}`);
      if (!songsRes.ok) throw new Error('Failed to fetch liked songs');
      const songsData = await songsRes.json();

      // Format playlists
      const formattedPlaylists: ExternalPlaylist[] = (playlistsData.items || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description || 'Spotify playlist',
        images: p.images || [],
        tracks: { total: p.tracks?.total || 0 },
        tracksList: [] // lazy load
      }));

      // Format liked songs
      const formattedLiked: ExternalTrack[] = (songsData.items || []).map((item: any) => ({
        id: item.track.id,
        title: item.track.name,
        artist: item.track.artists?.map((a: any) => a.name).join(', ') || 'Unknown',
        album: item.track.album?.name || 'Unknown',
        coverUrl: item.track.album?.images?.[0]?.url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&h=300&q=80',
        duration: Math.round(item.track.duration_ms / 1000)
      }));

      setPlaylists(formattedPlaylists);
      setLikedSongs(formattedLiked);
    } catch (err: any) {
      console.error(err);
      toast.error('Spotify API Warning', 'Could not query Spotify servers directly. Switching to fully interactive Sandbox Mode.');
      // Fallback to high-fidelity Sandbox mode
      setPlaylists(DEMO_SPOTIFY_PLAYLISTS);
      setLikedSongs(DEMO_SPOTIFY_LIKED);
      setSpotifyMode('demo');
    } finally {
      setLoadingMedia(false);
    }
  };

  // Connect Real Spotify
  const handleConnectSpotifyReal = async () => {
    try {
      const response = await fetch('/api/auth/spotify/url');
      if (!response.ok) {
        if (response.status === 500) {
          setShowSpotifyCredentialsGuide(true);
          throw new Error('Spotify is currently unconfigured. Read the setup instruction below.');
        }
        throw new Error('Failed to get Spotify authorization URL');
      }

      const { url } = await response.json();
      const popup = window.open(
        url,
        'spotify_auth_popup',
        'width=600,height=700,status=no,resizable=yes,scrollbars=yes'
      );

      if (!popup) {
        toast.error('Popup Blocked', 'Please enable popups to authenticate with Spotify.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Connection Unconfigured', err.message);
    }
  };

  // Connect Demo Spotify
  const handleConnectSpotifyDemo = () => {
    const mockProfile = {
      display_name: 'Soundwave Collector (Demo)',
      images: [{ url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80' }]
    };
    setSpotifyUser(mockProfile);
    setSpotifyMode('demo');
    localStorage.setItem('tonjam_spotify_user', JSON.stringify(mockProfile));
    localStorage.setItem('tonjam_spotify_mode', 'demo');
    localStorage.setItem('tonjam_spotify_token', 'demo-token');

    toast.success('Connected (Sandbox Mode)', 'Connected to simulated Spotify vault.');
    setActiveService('spotify');
    setActiveSection('playlists');
  };

  // Connect Demo Apple Music
  const handleConnectAppleDemo = () => {
    const mockProfile = {
      display_name: 'Apple Music Fan (Demo)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
    };
    setAppleUser(mockProfile);
    setAppleMode('demo');
    localStorage.setItem('tonjam_apple_user', JSON.stringify(mockProfile));
    localStorage.setItem('tonjam_apple_mode', 'demo');

    toast.success('Apple Music Connected (Sandbox)', 'Connected to simulated Apple Music vault.');
    setActiveService('apple');
    setActiveSection('playlists');
  };

  // Disconnect Account
  const handleDisconnect = (service: 'spotify' | 'apple') => {
    if (service === 'spotify') {
      setSpotifyUser(null);
      setSpotifyToken(null);
      setSpotifyMode(null);
      localStorage.removeItem('tonjam_spotify_user');
      localStorage.removeItem('tonjam_spotify_token');
      localStorage.removeItem('tonjam_spotify_mode');
      toast.success('Spotify Disconnected', 'Account details deleted from browser session.');
    } else {
      setAppleUser(null);
      setAppleMode(null);
      localStorage.removeItem('tonjam_apple_user');
      localStorage.removeItem('tonjam_apple_mode');
      toast.success('Apple Music Disconnected', 'Account details deleted from browser session.');
    }
    if (activeService === service) {
      setActiveService(null);
    }
  };

  // Single Playlist Sync
  const handleSyncPlaylist = async (playlist: ExternalPlaylist) => {
    setSyncingPlaylistId(playlist.id);
    
    // Simulate mapping & importing delay
    setTimeout(async () => {
      let tracksList = playlist.tracksList;

      // Real query for tracks if connected on real Spotify
      if (spotifyMode === 'real' && activeService === 'spotify' && spotifyToken) {
        try {
          const tracksRes = await fetch(`/api/spotify/playlist-tracks?token=${encodeURIComponent(spotifyToken)}&playlistId=${playlist.id}`);
          if (tracksRes.ok) {
            const data = await tracksRes.json();
            tracksList = (data.items || []).map((item: any) => ({
              title: item.track.name,
              artist: item.track.artists?.map((a: any) => a.name).join(', ') || 'Unknown',
              album: item.track.album?.name || 'Unknown',
              coverUrl: item.track.album?.images?.[0]?.url || '',
              duration: Math.round(item.track.duration_ms / 1000)
            }));
          }
        } catch (err) {
          console.error('Real tracks query failed, using static list', err);
        }
      }

      // Default fallback if tracksList is empty or unpopulated
      if (!tracksList || tracksList.length === 0) {
        tracksList = [
          { title: 'Sovereign Nodes', artist: 'DJ Krupy', album: 'TON Genesis', duration: 198 },
          { title: 'Blockchain Romance', artist: 'Satoshi Sync', album: 'Distributed Hearts', duration: 245 }
        ];
      }

      const coverUrl = playlist.images?.[0]?.url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&h=300&q=80';
      
      importPlaylistWithTracks(playlist.name, coverUrl, tracksList);
      setSyncingPlaylistId(null);
    }, 1800);
  };

  // Multiple Songs Sync
  const handleSyncSelectedLiked = () => {
    if (selectedTrackIds.length === 0) return;
    setIsSyncingAllLiked(true);

    setTimeout(() => {
      const selectedTracks = likedSongs.filter(t => selectedTrackIds.includes(t.id));
      importTracks(selectedTracks.map(t => ({
        title: t.title,
        artist: t.artist,
        album: t.album,
        coverUrl: t.coverUrl,
        duration: t.duration
      })));
      setSelectedTrackIds([]);
      setIsSyncingAllLiked(false);
    }, 2000);
  };

  const toggleSelectTrack = (trackId: string) => {
    setSelectedTrackIds(prev => 
      prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTrackIds.length === filteredSongs.length) {
      setSelectedTrackIds([]);
    } else {
      setSelectedTrackIds(filteredSongs.map(s => s.id));
    }
  };

  const filteredSongs = likedSongs.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* INTEGRATIONS LAUNCH CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* SPOTIFY CARD */}
        <div className="relative overflow-hidden bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#1DB954]/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#1DB954]/10 text-[#1DB954] rounded-xl border border-[#1DB954]/10">
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.377-1.454-5.37-1.783-8.893-.982-.336.075-.668-.135-.744-.47-.077-.337.135-.668.47-.745 3.856-.88 7.15-.502 9.816 1.132.295.18.387.563.208.858zm1.224-2.723c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.076-1.182-.413.125-.848-.107-.973-.52-.125-.413.108-.847.52-.973 3.665-1.11 8.236-.574 11.343 1.334.368.228.488.708.26 1.08zm.105-2.822C14.545 8.783 9.006 8.6 5.812 9.57c-.49.15-1.01-.13-1.16-.62-.15-.49.13-1.01.62-1.16C8.948 6.64 15.043 6.85 19.342 9.4c.44.26.58.83.32 1.27-.26.44-.83.58-1.27.32z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Spotify Sync</h3>
                <p className="text-xs text-slate-400">Sync custom playlists and favorite liked songs</p>
              </div>
            </div>
            
            {spotifyUser ? (
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest rounded-full border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-slate-800 text-slate-400 text-[10px] font-extrabold uppercase tracking-widest rounded-full border border-white/5">
                Disconnected
              </span>
            )}
          </div>

          {spotifyUser ? (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={spotifyUser.images?.[0]?.url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80'} 
                  alt="Spotify profile"
                  className="w-10 h-10 rounded-full border border-white/10"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">{spotifyUser.display_name}</h4>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">
                    Spotify {spotifyMode === 'demo' ? 'Sandbox Account' : 'Partner linked'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveService(activeService === 'spotify' ? null : 'spotify')}
                  className="px-3 py-1.5 bg-[#1DB954] hover:bg-[#1ed760] text-black text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  {activeService === 'spotify' ? 'Hide Vault' : 'Explore Vault'}
                </button>
                <button
                  onClick={() => handleDisconnect('spotify')}
                  className="p-1.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-lg transition-colors cursor-pointer"
                  title="Disconnect account"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2.5">
                <button
                  onClick={handleConnectSpotifyReal}
                  className="flex-1 py-2.5 bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" /> Connect Spotify
                </button>
                <button
                  onClick={handleConnectSpotifyDemo}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                  title="Connect via simulated sandbox account"
                >
                  <Sparkles className="w-4 h-4" /> Sandbox
                </button>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal text-center">
                Secure integration via standard Spotify API credentials. Sandbox mode allows instant testing.
              </p>
            </div>
          )}
        </div>

        {/* APPLE MUSIC CARD */}
        <div className="relative overflow-hidden bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FC3C44]/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#FC3C44]/10 text-[#FC3C44] rounded-xl border border-[#FC3C44]/10">
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm2.986 11.233c.01.071.014.143.014.215 0 1.25-.986 2.222-2.202 2.222-1.127 0-2.05-.826-2.186-1.895l-.014-.23c0-1.25.986-2.223 2.202-2.223.181 0 .356.021.523.063V8.895c0-.62-.423-.846-.94-.504l-2.012 1.332a.555.555 0 0 1-.307.093.562.562 0 0 1-.563-.562c0-.18.087-.348.236-.45l2.42-1.603a1.536 1.536 0 0 1 .843-.248c.846 0 1.537.691 1.537 1.537v4.743z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Apple Music Sync</h3>
                <p className="text-xs text-slate-400">Sync spatial audio files and library playlists</p>
              </div>
            </div>
            
            {appleUser ? (
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest rounded-full border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-slate-800 text-slate-400 text-[10px] font-extrabold uppercase tracking-widest rounded-full border border-white/5">
                Disconnected
              </span>
            )}
          </div>

          {appleUser ? (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={appleUser.avatar} 
                  alt="Apple profile"
                  className="w-10 h-10 rounded-full border border-white/10"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">{appleUser.display_name}</h4>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">
                    Apple Music Sandbox
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveService(activeService === 'apple' ? null : 'apple')}
                  className="px-3 py-1.5 bg-[#FC3C44] hover:bg-[#ff4f56] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  {activeService === 'apple' ? 'Hide Vault' : 'Explore Vault'}
                </button>
                <button
                  onClick={() => handleDisconnect('apple')}
                  className="p-1.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-lg transition-colors cursor-pointer"
                  title="Disconnect account"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                onClick={handleConnectAppleDemo}
                className="w-full py-2.5 bg-[#FC3C44] hover:bg-[#ff4f56] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Connect Apple Music (Sandbox)
              </button>
              <p className="text-[10px] text-slate-500 leading-normal text-center">
                Sandbox connection allows you to experience fully-featured synced compilation pipelines instantly.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* DEVELOPER SPOTIFY CONFIG GUIDE */}
      <AnimatePresence>
        {showSpotifyCredentialsGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-slate-900/60 border border-amber-500/20 rounded-2xl p-5 space-y-4"
          >
            <div className="flex gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div className="space-y-1.5">
                <h4 className="text-xs font-extrabold text-amber-500 uppercase tracking-widest">Spotify API Unconfigured</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  To connect your real Spotify account, the server needs your standard Spotify Client ID and Secrets. This is normal during development in AI Studio.
                </p>
              </div>
            </div>

            <div className="bg-black/20 rounded-xl p-4 text-xs font-mono text-slate-300 space-y-3.5 leading-relaxed border border-white/5">
              <p className="text-white font-bold border-b border-white/5 pb-2">📋 Spotify Developer Portal Setup Steps:</p>
              <ol className="list-decimal list-inside space-y-2 text-slate-400">
                <li>Go to <a href="https://developer.spotify.com/dashboard" target="_blank" className="text-[#1DB954] underline">developer.spotify.com/dashboard</a> and create an App.</li>
                <li>Set the Redirect URI to: <code className="text-white bg-slate-800 px-1.5 py-0.5 rounded text-[11px] font-bold">{`${window.location.origin}/api/auth/spotify/callback`}</code></li>
                <li>Open the settings icon in AI Studio Build.</li>
                <li>Add these environment variables:
                  <div className="mt-2 pl-4 space-y-1 text-[11px] text-white font-bold">
                    <div>• <code className="text-green-400">SPOTIFY_CLIENT_ID</code> = <span className="text-slate-400">Your Spotify Client ID</span></div>
                    <div>• <code className="text-green-400">SPOTIFY_CLIENT_SECRET</code> = <span className="text-slate-400">Your Spotify Client Secret</span></div>
                  </div>
                </li>
              </ol>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => setShowSpotifyCredentialsGuide(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Close Guide
              </button>
              <button
                onClick={() => {
                  setShowSpotifyCredentialsGuide(false);
                  handleConnectSpotifyDemo();
                }}
                className="px-4 py-2 bg-[#1DB954] hover:bg-[#1ed760] text-black text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> Launch Sandbox Instead
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MEDIA VAULT EXPLORER PANEL */}
      <AnimatePresence mode="wait">
        {activeService && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden"
          >
            {/* Header / Subtab selector */}
            <div className="p-5 border-b border-white/5 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-[#0052FF]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  {activeService === 'spotify' ? 'Spotify Sync Vault' : 'Apple Music Sync Vault'}
                </h3>
              </div>

              {/* Subtab Controllers */}
              <div className="flex bg-slate-900 border border-white/5 rounded-[10px] p-1">
                <button
                  onClick={() => {
                    setActiveSection('playlists');
                    setSelectedTrackIds([]);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeSection === 'playlists' ? 'bg-[#0052FF] text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <ListMusic className="w-4 h-4" /> Playlists
                </button>
                <button
                  onClick={() => {
                    setActiveSection('liked');
                    setSelectedTrackIds([]);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeSection === 'liked' ? 'bg-[#0052FF] text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <Music className="w-4 h-4" /> Liked Songs
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-5 min-h-[250px] relative">
              {loadingMedia ? (
                <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center space-y-4">
                  <RefreshCw className="w-8 h-8 text-[#0052FF] animate-spin" />
                  <p className="text-xs text-slate-400 font-extrabold uppercase tracking-widest">Accessing secure Vault...</p>
                </div>
              ) : null}

              {/* SECTION 1: PLAYLISTS SECTION */}
              {activeSection === 'playlists' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {playlists.map((playlist) => {
                    const isSyncing = syncingPlaylistId === playlist.id;
                    return (
                      <div 
                        key={playlist.id}
                        className="bg-slate-950 border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:border-white/10 transition-colors"
                      >
                        <img 
                          src={playlist.images?.[0]?.url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=150&h=150&q=80'} 
                          alt={playlist.name}
                          className="w-16 h-16 rounded-lg object-cover border border-white/5"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="text-xs font-bold text-white truncate" title={playlist.name}>{playlist.name}</h4>
                          <p className="text-[10px] text-slate-500 truncate">{playlist.description}</p>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                              {playlist.tracks?.total || 0} Tracks
                            </span>
                            <button
                              disabled={isSyncing}
                              onClick={() => handleSyncPlaylist(playlist)}
                              className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer ${isSyncing ? 'bg-[#0052FF]/20 text-white' : 'bg-slate-800 hover:bg-[#0052FF] hover:text-white text-slate-300'}`}
                            >
                              {isSyncing ? (
                                <>
                                  <RefreshCw className="w-3 h-3 animate-spin" /> Syncing
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" /> Sync Node
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* SECTION 2: LIKED SONGS SECTION */}
              {activeSection === 'liked' && (
                <div className="space-y-4">
                  {/* Filter and selection tools */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <button
                        onClick={toggleSelectAll}
                        className="px-3 py-1.5 bg-slate-900 border border-white/5 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-lg hover:text-white cursor-pointer"
                      >
                        {selectedTrackIds.length === filteredSongs.length && filteredSongs.length > 0 ? 'Deselect All' : 'Select All'}
                      </button>
                      <span className="text-xs text-slate-400 font-semibold">
                        {selectedTrackIds.length} songs selected
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <input
                        type="text"
                        placeholder="Search song, artist..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-slate-900 border border-white/5 rounded-lg px-3 py-1.5 text-xs font-semibold outline-none focus:border-[#0052FF] text-white placeholder:text-slate-500 w-full sm:w-48"
                      />
                      <button
                        disabled={selectedTrackIds.length === 0 || isSyncingAllLiked}
                        onClick={handleSyncSelectedLiked}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${selectedTrackIds.length > 0 && !isSyncingAllLiked ? 'bg-[#0052FF] hover:bg-[#0040D9] text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                      >
                        {isSyncingAllLiked ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Syncing
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" /> Sync Liked ({selectedTrackIds.length})
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Songs list */}
                  <div className="max-h-[350px] overflow-y-auto border border-white/5 rounded-xl divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/5">
                    {filteredSongs.length > 0 ? (
                      filteredSongs.map((song) => {
                        const isChecked = selectedTrackIds.includes(song.id);
                        return (
                          <div 
                            key={song.id}
                            onClick={() => toggleSelectTrack(song.id)}
                            className={`p-3 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer transition-colors ${isChecked ? 'bg-[#0052FF]/5' : ''}`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isChecked ? 'border-[#0052FF] bg-[#0052FF] text-white' : 'border-white/10 bg-slate-950'}`}>
                                {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <img 
                                src={song.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=50&h=50&q=80'} 
                                alt={song.title}
                                className="w-10 h-10 rounded object-cover border border-white/5"
                              />
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white truncate">{song.title}</h4>
                                <p className="text-[10px] text-slate-400 truncate">{song.artist} • <span className="text-slate-500">{song.album}</span></p>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-500 font-semibold pr-2">
                              {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center text-slate-500 text-xs font-semibold">
                        No songs match your search query.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER METRICS INFO */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Database className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-semibold">
            TonJam secure library import matches tracks metadata dynamically against the decentralized music repository.
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">All Pipelines Online</span>
        </div>
      </div>

    </div>
  );
};
