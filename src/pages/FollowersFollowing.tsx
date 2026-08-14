import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, UserCheck, UserPlus, Search, Check, ShieldCheck, 
  MessageSquare, Music, Sparkles, Filter, Disc, ArrowLeft,
  BadgeCheck, Radio, Loader2, Volume2
} from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { useToast } from '@/components/layout/ToastProvider';
import { BackButton } from '@/components/BackButton';

interface ProfileUser {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  role: 'Artist' | 'Producer' | 'DJ' | 'Sound Engineer' | 'Listener';
  genre?: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  tracksCount: number;
  isVerified: boolean;
  followsYou: boolean;
}

// Generate extended mock user database (60+ items for infinite scrolling demo)
const GENERATED_USERS: ProfileUser[] = [
  {
    id: 'art-1',
    name: 'DJ Krupy',
    username: '@djkrupy',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    role: 'Artist',
    genre: 'Afrobeats & EDM',
    bio: 'Pioneer of TonJam Sonic Synth. Lossless audio creator & Web3 music innovator.',
    followersCount: 14200,
    followingCount: 385,
    tracksCount: 24,
    isVerified: true,
    followsYou: true,
  },
  {
    id: 'art-2',
    name: 'ElectroX Lab',
    username: '@electrox',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    role: 'Producer',
    genre: 'Glitch Hop',
    bio: 'Crafting heavy bass matrixes and modular analog synthesizers on-chain.',
    followersCount: 8900,
    followingCount: 120,
    tracksCount: 18,
    isVerified: true,
    followsYou: true,
  },
  {
    id: 'art-3',
    name: 'Luna Vibes',
    username: '@lunavibes',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
    role: 'Artist',
    genre: 'Ambient & Chill',
    bio: 'Binaural 432Hz soundscapes & spatial audio sound designer.',
    followersCount: 19500,
    followingCount: 410,
    tracksCount: 32,
    isVerified: true,
    followsYou: false,
  },
  {
    id: 'art-4',
    name: 'Burna Boy',
    username: '@burnaboy',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
    role: 'Artist',
    genre: 'Afrobeats',
    bio: 'The African Giant. Blending Afrobeats, dancehall & global soul.',
    followersCount: 1250000,
    followingCount: 95,
    tracksCount: 88,
    isVerified: true,
    followsYou: false,
  },
  {
    id: 'art-5',
    name: 'Cyber Wave',
    username: '@cyberwave',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300',
    role: 'DJ',
    genre: 'Synthwave',
    bio: 'Retro futuristic neon electronic audio producer & live performer.',
    followersCount: 6400,
    followingCount: 210,
    tracksCount: 14,
    isVerified: false,
    followsYou: true,
  },
  {
    id: 'art-6',
    name: 'Aria Rhythm',
    username: '@ariarhythm',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300',
    role: 'Artist',
    genre: 'Neo Soul',
    bio: 'Vocalist, songwriter & acoustic stem artist.',
    followersCount: 11200,
    followingCount: 340,
    tracksCount: 21,
    isVerified: true,
    followsYou: true,
  },
  ...Array.from({ length: 54 }).map((_, index) => {
    const idx = index + 7;
    const roles: ('Artist' | 'Producer' | 'DJ' | 'Sound Engineer' | 'Listener')[] = [
      'Artist', 'Producer', 'DJ', 'Sound Engineer', 'Listener'
    ];
    const genres = ['Deep House', 'Lo-Fi Beats', 'Techno', 'Hyperpop', 'Jazz Fusion', 'Afro-House', 'Drum & Bass'];
    const names = [
      'Echo Phoenix', 'Quantum Bass', 'Solar Eclipse', 'Velvet Groove',
      'Krypton Pulse', 'Frequency Shift', 'Cosmic Modular', 'Starlight Vocal',
      'Neon Spectrum', 'Aura Waves', 'Subwoofer King', 'Hyper Drive',
      'Orion Beats', 'Chroma Sound', 'Zenith Resonance', 'Sonic Titan'
    ];
    
    const role = roles[idx % roles.length];
    const genre = genres[idx % genres.length];
    const name = `${names[idx % names.length]} #${idx}`;
    const username = `@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    
    return {
      id: `usr-${idx}`,
      name,
      username,
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + (idx * 12345) % 10000000}?w=300&auto=format&fit=crop&q=80`,
      role,
      genre,
      bio: `Official ${role.toLowerCase()} on TonJam ecosystem producing high-fidelity ${genre} music NFTs.`,
      followersCount: Math.floor((idx * 739) % 25000) + 120,
      followingCount: Math.floor((idx * 43) % 900) + 15,
      tracksCount: Math.floor((idx * 3) % 40),
      isVerified: idx % 3 === 0,
      followsYou: idx % 2 === 0,
    };
  })
];

const ITEMS_PER_PAGE = 10;

export const FollowersFollowing: React.FC = () => {
  const { type: paramType } = useParams<{ type?: 'followers' | 'following', userId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { followedUserIds = [], toggleFollowUser } = useAudio();

  // Determine active tab based on params or path
  const initialTab = useMemo(() => {
    if (paramType === 'following' || location.pathname.includes('following')) {
      return 'following';
    }
    return 'followers';
  }, [paramType, location.pathname]);

  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');

  // Infinite Scroll Pagination State
  const [page, setPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  // Sync state if URL changes
  useEffect(() => {
    if (paramType === 'following' || location.pathname.includes('following')) {
      setActiveTab('following');
    } else if (paramType === 'followers' || location.pathname.includes('followers')) {
      setActiveTab('followers');
    }
  }, [paramType, location.pathname]);

  // Filter raw data list
  const baseList = useMemo(() => {
    if (activeTab === 'following') {
      // Show users that match followedUserIds + sample subset of generated users
      return GENERATED_USERS.filter(u => followedUserIds.includes(u.id) || u.id === 'art-1' || u.id === 'art-2');
    }
    // Followers tab shows all followers
    return GENERATED_USERS;
  }, [activeTab, followedUserIds]);

  // Filter by search & role
  const filteredList = useMemo(() => {
    let result = [...baseList];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u => 
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.genre && u.genre.toLowerCase().includes(q)) ||
        u.bio.toLowerCase().includes(q)
      );
    }

    if (roleFilter !== 'All') {
      if (roleFilter === 'Mutuals') {
        result = result.filter(u => u.followsYou);
      } else {
        result = result.filter(u => u.role === roleFilter);
      }
    }

    return result;
  }, [baseList, searchQuery, roleFilter]);

  // Paginated visible list for Infinite Scroll
  const visibleUsers = useMemo(() => {
    return filteredList.slice(0, page * ITEMS_PER_PAGE);
  }, [filteredList, page]);

  const hasMore = visibleUsers.length < filteredList.length;

  // Reset pagination when tab, search or filter changes
  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery, roleFilter]);

  // Load next chunk handler
  const loadNextPage = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setPage(prev => prev + 1);
      setIsLoadingMore(false);
    }, 400);
  }, [isLoadingMore, hasMore]);

  // IntersectionObserver for Infinite Scroll
  useEffect(() => {
    const target = observerTargetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadNextPage();
        }
      },
      { threshold: 0.2, rootMargin: '100px' }
    );

    observer.observe(target);
    return () => {
      observer.unobserve(target);
    };
  }, [hasMore, isLoadingMore, loadNextPage]);

  // Toggle follow action
  const handleToggleFollow = (user: ProfileUser, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFollowUser(user.id);
    const isNowFollowing = !followedUserIds.includes(user.id);
    if (isNowFollowing) {
      toast.success(`You are now following ${user.name}`);
    } else {
      toast.info(`Unfollowed ${user.name}`);
    }
  };

  const handleTabChange = (tab: 'followers' | 'following') => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#050a24] text-white p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span>Community Connections</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore your network of artists, producers, and lossless audio collectors
            </p>
          </div>
        </div>

        {/* Total stats pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-mono font-bold bg-[#0e163d] px-3 py-1.5 rounded-xl border border-white/5 text-slate-300">
            Total: <strong className="text-blue-400">{filteredList.length}</strong> Users
          </span>
        </div>
      </div>

      {/* Main Tabs Header */}
      <div className="flex items-center gap-2 bg-[#0e163d]/60 p-1.5 rounded-2xl border border-white/5 max-w-md">
        <button
          onClick={() => handleTabChange('followers')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'followers'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Followers</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-black/30">
            1,420
          </span>
        </button>

        <button
          onClick={() => handleTabChange('following')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'following'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Following</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-black/30">
            {followedUserIds.length || 385}
          </span>
        </button>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0e163d]/40 p-3 rounded-2xl border border-white/5">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, handle, genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050a24] text-xs text-white placeholder-slate-500 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-white/5"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {['All', 'Artists', 'Producers', 'DJ', 'Mutuals'].map((filter) => (
            <button
              key={filter}
              onClick={() => setRoleFilter(filter)}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all cursor-pointer shrink-0 border-none ${
                roleFilter === filter
                  ? 'bg-[#0088CC] text-white shadow-[0_0_12px_rgba(0,136,204,0.4)]'
                  : 'bg-[#050a24] text-slate-400 hover:text-white hover:bg-[#0088CC]/20'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Infinite Scroll List */}
      <div className="space-y-3">
        {visibleUsers.map((user, idx) => {
          const isFollowing = followedUserIds.includes(user.id);

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: (idx % 10) * 0.03 }}
              onClick={() => navigate(user.role === 'Artist' ? `/artist/${user.id}` : `/user/${user.id}`)}
              className="bg-[#0e163d]/60 hover:bg-[#121c4e] rounded-2xl p-4 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg group"
            >
              {/* Left: User Avatar & Meta */}
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="relative shrink-0">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-white/10 group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300';
                    }}
                  />
                  {user.isVerified && (
                    <span className="absolute -bottom-1 -right-1 bg-cyan-500 text-black p-0.5 rounded-full ring-2 ring-[#0e163d]">
                      <BadgeCheck className="w-3.5 h-3.5 fill-cyan-400 text-black" />
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">
                      {user.name}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      {user.username}
                    </span>

                    {user.followsYou && (
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        Follows You
                      </span>
                    )}

                    <span className="text-[9px] font-bold uppercase tracking-wider text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                      {user.role}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1 max-w-xl">
                    {user.bio}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span>
                      <strong className="text-white">{user.followersCount.toLocaleString()}</strong> followers
                    </span>
                    <span>•</span>
                    <span>
                      <strong className="text-white">{user.tracksCount}</strong> tracks
                    </span>
                    {user.genre && (
                      <>
                        <span>•</span>
                        <span className="text-cyan-400">{user.genre}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.info(`Opening message thread with ${user.name}`);
                  }}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer border border-white/5"
                  title="Send Message"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => handleToggleFollow(user, e)}
                  className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-md ${
                    isFollowing
                      ? 'bg-white/10 hover:bg-rose-600/20 text-slate-200 hover:text-rose-300 border border-white/10'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredList.length === 0 && (
        <div className="py-16 text-center bg-[#0e163d]/30 rounded-2xl border border-white/5">
          <Users className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            No {activeTab} match your filter criteria
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Try resetting your search query or role filter.
          </p>
        </div>
      )}

      {/* Infinite Scroll Trigger Sentinel & Loading Indicator */}
      <div 
        ref={observerTargetRef} 
        className="py-8 flex flex-col items-center justify-center gap-3 text-center"
      >
        {isLoadingMore && (
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400 bg-[#0e163d] px-4 py-2 rounded-full border border-blue-500/20 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading more audio creators...</span>
          </div>
        )}

        {!hasMore && filteredList.length > 0 && (
          <span className="text-xs text-slate-500 font-mono">
            ✓ End of list ({filteredList.length} users loaded)
          </span>
        )}

        {hasMore && !isLoadingMore && (
          <button
            onClick={loadNextPage}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer border border-white/5"
          >
            Load More Users
          </button>
        )}
      </div>

    </div>
  );
};

export default FollowersFollowing;
