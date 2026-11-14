import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, UserCheck, UserPlus, Search, Check, ShieldCheck, 
  MessageSquare, Music, Sparkles, Filter, Disc, ArrowLeft,
  BadgeCheck, Radio, Loader2, Volume2
} from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/layout/ToastProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { getPlaceholderImage } from '@/lib/utils';

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

const ITEMS_PER_PAGE = 20;

export const FollowersFollowing: React.FC = () => {
  const { type: paramType } = useParams<{ type?: 'followers' | 'following', userId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { user: authUser, userProfile } = useAuth();
  const { followedUserIds = [], toggleFollowUser, artists = [] } = useAudio();

  const [firestoreUsers, setFirestoreUsers] = useState<ProfileUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const loadUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const snap = await getDocs(query(collection(db, 'users'), limit(100)));
        if (!isMounted) return;
        const loaded: ProfileUser[] = snap.docs
          .filter((d) => d.id !== authUser?.uid)
          .map((d) => {
            const data = d.data() as any;
            const roleRaw = String(data.role || '').toLowerCase();
            const role: ProfileUser['role'] =
              roleRaw === 'producer'
                ? 'Producer'
                : roleRaw === 'dj'
                ? 'DJ'
                : roleRaw === 'sound engineer'
                ? 'Sound Engineer'
                : data.isVerifiedArtist || data.isArtist || roleRaw === 'artist'
                ? 'Artist'
                : 'Listener';
            return {
              id: d.id,
              name: data.name || data.displayName || 'TonJam Member',
              username: data.username ? (String(data.username).startsWith('@') ? data.username : `@${data.username}`) : '@member',
              avatarUrl: data.avatar || data.photoURL || getPlaceholderImage('artist'),
              role,
              genre: data.genre || undefined,
              bio: data.bio || '',
              followersCount: Array.isArray(data.followers) ? data.followers.length : (typeof data.followers === 'number' ? data.followers : 0),
              followingCount: Array.isArray(data.following) ? data.following.length : (typeof data.following === 'number' ? data.following : 0),
              tracksCount: typeof data.tracksCount === 'number' ? data.tracksCount : 0,
              isVerified: Boolean(data.isVerified || data.isVerifiedArtist),
              followsYou: Array.isArray(data.following) && authUser?.uid ? data.following.includes(authUser.uid) : false,
            };
          });
        setFirestoreUsers(loaded);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'users');
      } finally {
        if (isMounted) setIsLoadingUsers(false);
      }
    };
    loadUsers();
    return () => {
      isMounted = false;
    };
  }, [authUser?.uid]);

  // Combine Firestore user directory with loaded real artists
  const directoryUsers: ProfileUser[] = useMemo(() => {
    const map = new Map<string, ProfileUser>();
    firestoreUsers.forEach((u) => map.set(u.id, u));
    artists.forEach((a) => {
      if (!map.has(a.uid) && a.uid !== authUser?.uid) {
        map.set(a.uid, {
          id: a.uid,
          name: a.name,
          username: a.username ? (a.username.startsWith('@') ? a.username : `@${a.username}`) : `@${a.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          avatarUrl: a.avatarUrl || getPlaceholderImage('artist'),
          role: 'Artist',
          genre: a.genre,
          bio: a.bio || '',
          followersCount: a.followers || 0,
          followingCount: 0,
          tracksCount: 0,
          isVerified: Boolean(a.verified),
          followsYou: false,
        });
      }
    });
    return Array.from(map.values());
  }, [firestoreUsers, artists, authUser?.uid]);

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

  const followersList = useMemo(() => {
    return directoryUsers.filter((u) => u.followsYou);
  }, [directoryUsers]);

  const followingList = useMemo(() => {
    return directoryUsers.filter((u) => followedUserIds.includes(u.id));
  }, [directoryUsers, followedUserIds]);

  // Filter raw data list
  const baseList = useMemo(() => {
    if (activeTab === 'following') {
      return followingList;
    }
    return followersList;
  }, [activeTab, followingList, followersList]);

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
        result = result.filter(u => u.followsYou && followedUserIds.includes(u.id));
      } else if (roleFilter === 'Artists') {
        result = result.filter(u => u.role === 'Artist');
      } else if (roleFilter === 'Producers') {
        result = result.filter(u => u.role === 'Producer');
      } else {
        result = result.filter(u => u.role === roleFilter);
      }
    }

    return result;
  }, [baseList, searchQuery, roleFilter, followedUserIds]);

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
    setPage(prev => prev + 1);
    setIsLoadingMore(false);
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

  const totalFollowersCount = Math.max(
    followersList.length,
    typeof (userProfile as any)?.followers === 'number' ? (userProfile as any).followers : 0
  );

  return (
    <div className="min-h-screen bg-[#050a24] text-white pb-12">
      <PageHeader title={activeTab === 'followers' ? 'Followers' : 'Following'} showBack={true} />
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 pt-2">
        {/* Main Tabs Header */}
        <div className="flex items-center gap-2 bg-[#0e163d]/60 p-1.5 rounded-2xl max-w-md">
        <button
          onClick={() => handleTabChange('followers')}
          aria-pressed={activeTab === 'followers'}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border ${
            activeTab === 'followers'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border-[#c0c0c0]/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border-[#c0c0c0]/25'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Followers</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-black/30">
            {totalFollowersCount}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('following')}
          aria-pressed={activeTab === 'following'}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border ${
            activeTab === 'following'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border-[#c0c0c0]/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border-[#c0c0c0]/25'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Following</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-black/30">
            {followedUserIds.length}
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
              aria-pressed={roleFilter === filter}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all cursor-pointer shrink-0 border ${
                roleFilter === filter
                  ? 'bg-[#0088CC] text-white shadow-[0_0_12px_rgba(0,136,204,0.4)] border-[#c0c0c0]/40'
                  : 'bg-[#050a24] text-slate-400 hover:text-white hover:bg-[#0088CC]/20 border-[#c0c0c0]/25'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Infinite Scroll List */}
      <div className="space-y-3">
        {isLoadingUsers && visibleUsers.length === 0 ? (
          <div className="py-12 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <span>Loading community profiles...</span>
          </div>
        ) : visibleUsers.map((user, idx) => {
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
                    className="w-12 h-12 rounded-full object-cover border border-white/10 group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getPlaceholderImage('artist');
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
                  className={`pill px-4 py-2 rounded-full text-xs font-black tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-md border-0 ${
                    isFollowing
                      ? 'bg-white/10 hover:bg-rose-600/20 text-slate-200 hover:text-rose-300'
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
    </div>
  );
};

export default FollowersFollowing;
