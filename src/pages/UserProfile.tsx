import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Share2,
  QrCode,
  Zap,
  Globe,
  Send,
  Camera,
  Calendar,
  ShieldCheck,
  Music,
  Sparkles,
  Users,
  UserCheck,
  Disc,
  Layers,
  Gem,
  Flame,
  Trophy,
  Library,
  Twitter,
  Instagram,
  Check,
  Copy,
  ExternalLink,
  Play,
  Pause,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAudio } from '@/contexts/AudioContext';
import { useNFT } from '@/contexts/NFTContext';
import { getPlaceholderImage, cn, validateFile, ALLOWED_IMAGE_TYPES } from '@/lib/utils';
import { UserProfile as UserProfileType, NFTItem, Track } from '@/types';
import { uploadFile } from '@/services/storageService';

// Reusable profile components & modals
import { ProfileQRCodeModal } from '@/components/profile/ProfileQRCodeModal';
import TipArtistModal from '@/components/TipArtistModal';
import { ArtistVerificationBadge } from '@/components/ArtistVerificationBadge';
import { ListenStreakIndicator } from '@/components/profile/ListenStreakIndicator';
import { BadgeSystem } from '@/components/BadgeSystem';
import { AchievementList } from '@/components/profile/AchievementList';
import NFTCard from '@/components/NFTCard';
import PlaylistCard from '@/components/PlaylistCard';
import ArtistListItem from '@/components/ArtistListItem';
import SocialFeed from '@/components/SocialFeed';
import { PageContainer } from '@/components/layout/PageContainer';
import { getInitialListenStreakData } from '@/lib/listenStreak';

export const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    userProfile: currentUserProfile, 
    toggleFollowUser, 
    followedUserIds, 
    addNotification, 
    posts, 
    allTracks, 
    playlists, 
    artists,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay
  } = useAudio();
  const { nfts } = useNFT();

  const [user, setUser] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState<boolean>(false);
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);
  const [streakDays, setStreakDays] = useState<number>(5);

  const isOwnProfile = !id || id === currentUserProfile?.uid;
  const isFollowing = useMemo(() => {
    return followedUserIds.includes(id || '');
  }, [followedUserIds, id]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const data = getInitialListenStreakData();
    setStreakDays(data.currentStreak);
  }, []);

  useEffect(() => {
    if (isOwnProfile && currentUserProfile) {
      setUser(currentUserProfile);
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      try {
        if (!id) {
          navigate('/profile');
          return;
        }

        // First check in Firestore
        const userDoc = await getDoc(doc(db, 'users', id));
        if (userDoc.exists()) {
          setUser(userDoc.data() as UserProfileType);
        } else {
          // Check if it matches an artist in state
          const foundArtist = artists.find(a => a.uid === id);
          if (foundArtist) {
            setUser({
              uid: foundArtist.uid,
              name: foundArtist.name,
              username: foundArtist.username || foundArtist.name.toLowerCase().replace(/\s+/g, ''),
              avatar: foundArtist.avatarUrl || getPlaceholderImage(`user-${foundArtist.uid}`),
              bannerUrl: foundArtist.bannerUrl || foundArtist.bannerImageUrl || '',
              bio: foundArtist.bio || '',
              walletAddress: foundArtist.walletAddress || '',
              isVerifiedArtist: foundArtist.isVerifiedArtist || true,
              role: 'artist',
              followers: foundArtist.followers || 0,
              following: 0,
              earnings: 0,
              createdAt: new Date().toISOString(),
              tjBalance: 500
            } as UserProfileType);
          } else {
            // Fallback user state
            setUser({
              uid: id,
              name: 'TONJam Explorer',
              username: `user_${id.slice(0, 6)}`,
              avatar: getPlaceholderImage(`user-${id}`),
              bannerUrl: '',
              bio: 'Active on-chain music collector and listener on TonJam ecosystem.',
              walletAddress: `EQD${id.slice(0, 6)}...${id.slice(-4)}`,
              isVerifiedArtist: false,
              role: 'collector',
              followers: 12,
              following: 48,
              earnings: 0,
              createdAt: new Date().toISOString(),
              tjBalance: 150
            } as UserProfileType);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUser({
          uid: id || 'guest',
          name: 'TONJam Collector',
          username: 'collector',
          avatar: getPlaceholderImage(`user-${id || 'guest'}`),
          bannerUrl: '',
          bio: 'Music and NFT Enthusiast.',
          walletAddress: '',
          followers: 0,
          following: 0,
          earnings: 0,
          tjBalance: 100
        } as UserProfileType);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, isOwnProfile, currentUserProfile, artists, navigate]);

  const handleFollow = () => {
    if (id) {
      toggleFollowUser(id);
      if (!isFollowing) {
        toast.success(`Following @${user?.username || user?.name}`);
      } else {
        toast.info(`Unfollowed @${user?.username || user?.name}`);
      }
    }
  };

  const handleCopyWallet = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      setCopiedAddress(true);
      toast.success('Wallet address copied to clipboard');
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUserProfile) {
      const validation = validateFile(file, 'image', 5);
      if (!validation.isValid) {
        toast.error(validation.error || 'Invalid file format');
        e.target.value = '';
        return;
      }
      
      try {
        toast.info('Uploading profile cover...');
        const storagePath = `profiles/${currentUserProfile.uid}/banner.png`;
        const { downloadUrl } = await uploadFile(file, storagePath);
        setUser(prev => prev ? { ...prev, bannerUrl: downloadUrl } : null);
        toast.success('Banner updated successfully');
      } catch (error: any) {
        console.error('Banner upload failed:', error);
        toast.error(`Upload failed: ${error.message}`);
      }
    }
  };

  // Filtered User Assets
  const userPosts = useMemo(() => {
    if (!user) return [];
    return posts.filter(p => p.userId === user.uid);
  }, [user, posts]);

  const ownedNfts = useMemo(() => {
    if (!user) return [];
    return nfts.filter(
      nft => 
        (user.walletAddress && nft.owner === user.walletAddress) || 
        nft.owner === user.name ||
        nft.ownerId === user.uid
    );
  }, [user, nfts]);

  const uploadedTracks = useMemo(() => {
    if (!user) return [];
    return allTracks.filter(t => t.artistId === user.uid || t.artist === user.name);
  }, [user, allTracks]);

  const userPlaylists = useMemo(() => {
    if (!user) return [];
    return playlists.filter(p => p.creator === user.name || p.creator === user.username);
  }, [user, playlists]);

  if (loading) {
    return (
      <PageContainer animate={false} className="min-h-screen bg-[#050A24] text-white p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Synchronizing Profile Hub...</span>
        </div>
      </PageContainer>
    );
  }

  if (!user) return null;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'nfts', label: `Collection (${ownedNfts.length})` },
    { id: 'tracks', label: `Tracks (${uploadedTracks.length})` },
    { id: 'playlists', label: `Playlists (${userPlaylists.length})` },
    { id: 'activity', label: 'Feed & Activity' },
    { id: 'network', label: 'Followers & Artists' },
    { id: 'about', label: 'About & Badges' },
  ];

  return (
    <PageContainer animate={true} hasPlayerSpacing={true} className="min-h-screen bg-[#050A24] text-white font-sans pb-32">
      
      {/* 1. CINEMATIC COVER HEADER */}
      <div className="relative w-full h-36 sm:h-44 md:h-52 overflow-hidden bg-slate-950">
        <img 
          src={user.bannerUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&h=450&q=80'} 
          alt="Profile cover" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        {/* Soft darken overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Top Floating Navigation Bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-[#050A24]/80 hover:bg-[#050A24] text-white rounded-full transition-all cursor-pointer shadow-lg active:scale-95"
            title="Go Back"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-200 hover:text-white" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="p-2.5 bg-[#050A24]/80 hover:bg-[#050A24] text-white rounded-full transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center"
              title="Share Profile QR Code"
              aria-label="QR Code"
            >
              <QrCode className="w-5 h-5 text-[#0098EA]" />
            </button>

            {!isOwnProfile && (
              <button
                onClick={() => setIsTipModalOpen(true)}
                className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase tracking-wider rounded-full shadow-lg transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Tip TON</span>
              </button>
            )}

            {isOwnProfile && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-[#050A24]/80 hover:bg-[#050A24] text-xs font-semibold rounded-full tracking-wider uppercase backdrop-blur-sm transition-all cursor-pointer flex items-center gap-1.5 text-slate-300 hover:text-white shadow-lg"
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Change Cover</span>
              </button>
            )}
            <input type="file" ref={fileInputRef} onChange={handleBannerUpload} accept={ALLOWED_IMAGE_TYPES.join(',')} className="hidden" />
          </div>
        </div>
      </div>

      {/* 2. PROFILE DETAILS & STATS HERO */}
      <div className="px-4 sm:px-8 relative pb-6">
        
        {/* Avatar & Action Row */}
        <div className="relative -mt-12 sm:-mt-16 mb-4 flex items-end justify-between flex-wrap gap-4">
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-[#050A24] bg-slate-900 shadow-2xl">
              <img 
                src={user.avatar || getPlaceholderImage(`user-${user.uid}`)} 
                alt={user.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Action Buttons Column */}
          <div className="flex items-center gap-2 pt-2">
            {!isOwnProfile ? (
              <>
                <button
                  onClick={handleFollow}
                  className={`px-6 py-2.5 rounded-full font-extrabold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg active:scale-95 ${
                    isFollowing
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-[#0052FF] hover:bg-[#1a66ff] text-white shadow-[0_4px_16px_rgba(0,82,255,0.4)]'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow User'}
                </button>
                <button
                  onClick={() => setIsQRModalOpen(true)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all cursor-pointer shadow-md"
                  title="Share Profile"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/edit-profile')}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Identity & Badges */}
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase font-sans">
              {user.name}
            </h1>
            <ArtistVerificationBadge 
              isVerified={Boolean(user.isVerifiedArtist || user.isVerified || user.role === 'artist')}
              artistName={user.name}
              size="md"
            />
            {user.role === 'artist' && (
              <span className="px-2.5 py-0.5 bg-[#0052FF]/20 text-[#0098EA] rounded-full text-[10px] font-bold uppercase tracking-wider">
                Artist
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm font-mono text-slate-400">
            <span>@{user.username || (user.name || 'user').toLowerCase().replace(/\s+/g, '')}</span>
            {user.walletAddress && (
              <button 
                onClick={handleCopyWallet}
                className="flex items-center gap-1.5 px-2.5 py-0.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-full transition-colors cursor-pointer"
                title="Copy TON Wallet Address"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#0098EA]" />
                <span className="font-mono text-[11px]">{user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}</span>
                {copiedAddress ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              </button>
            )}
          </div>

          {user.bio && (
            <p className="text-sm text-slate-300 leading-relaxed font-sans pt-1">
              {user.bio}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-medium pt-1">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : 'March 2026'}</span>
            </div>
            {user.location && (
              <div className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>{user.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. PROFILE STATS ROW (Matching Profile Hub) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div 
            onClick={() => {
              const el = document.getElementById('listen-streak-user');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-[#101A3B] rounded-[12px] p-3.5 flex flex-col justify-between transition-all duration-200 shadow-md bg-gradient-to-br from-[#101A3B] to-[#1a1435] cursor-pointer"
          >
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider leading-none text-orange-300">
                Listen Streak
              </span>
              <div className="shrink-0 p-1 rounded-md bg-orange-500/20">
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
            </div>
            <div className="mt-1">
              <span className="text-lg sm:text-xl font-bold font-mono tracking-tight text-amber-300">
                {streakDays} Days 🔥
              </span>
            </div>
          </div>

          <div className="bg-[#101A3B] rounded-[12px] p-3.5 flex flex-col justify-between transition-all duration-200 shadow-md">
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider leading-none text-slate-400">
                Followers
              </span>
              <div className="shrink-0 p-1 rounded-md bg-white/5">
                <Users className="w-4 h-4 text-[#0052FF]" />
              </div>
            </div>
            <div className="mt-1">
              <span className="text-lg sm:text-xl font-bold font-mono tracking-tight text-white">
                {(user.followers || 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-[#101A3B] rounded-[12px] p-3.5 flex flex-col justify-between transition-all duration-200 shadow-md">
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider leading-none text-slate-400">
                NFTs Owned
              </span>
              <div className="shrink-0 p-1 rounded-md bg-white/5">
                <Gem className="w-4 h-4 text-slate-300" />
              </div>
            </div>
            <div className="mt-1">
              <span className="text-lg sm:text-xl font-bold font-mono tracking-tight text-white">
                {ownedNfts.length}
              </span>
            </div>
          </div>

          <div className="bg-[#101A3B] rounded-[12px] p-3.5 flex flex-col justify-between transition-all duration-200 shadow-md">
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider leading-none text-slate-400">
                TJ Points
              </span>
              <div className="shrink-0 p-1 rounded-md bg-white/5">
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
            </div>
            <div className="mt-1">
              <span className="text-lg sm:text-xl font-bold font-mono tracking-tight text-amber-300">
                {user.tjBalance || 150}
              </span>
            </div>
          </div>
        </div>

        {/* 4. PROFILE TABS (Matching Profile Hub) */}
        <div className="w-full flex gap-1.5 overflow-x-auto no-scrollbar py-4 px-1 select-none scroll-smooth mt-6">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors duration-200 focus:outline-none cursor-pointer whitespace-nowrap shrink-0 z-10"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeUserTabPill"
                    className="absolute inset-0 bg-[#0088CC] shadow-[0_0_15px_rgba(0,136,204,0.4)] rounded-full -z-10"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className={isActive ? 'text-white font-black' : 'text-slate-400 hover:text-slate-200'}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* 5. TAB CONTENT PANELS */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Listen Streak Indicator */}
                  <div id="listen-streak-user">
                    <ListenStreakIndicator isOwnProfile={isOwnProfile} />
                  </div>

                  {/* Featured NFTs Showcase */}
                  {ownedNfts.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                          <Gem className="w-4 h-4 text-purple-400" />
                          Featured Collectibles
                        </h3>
                        <button 
                          onClick={() => setActiveTab('nfts')} 
                          className="text-xs font-bold text-[#0098EA] hover:text-blue-300 uppercase tracking-wider cursor-pointer"
                        >
                          View All ({ownedNfts.length})
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {ownedNfts.slice(0, 3).map(nft => (
                          <NFTCard key={nft.id} nft={nft} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Created Playlists Shelf */}
                  {userPlaylists.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                          <Library className="w-4 h-4 text-emerald-400" />
                          Curated Playlists
                        </h3>
                        <button 
                          onClick={() => setActiveTab('playlists')} 
                          className="text-xs font-bold text-[#0098EA] hover:text-blue-300 uppercase tracking-wider cursor-pointer"
                        >
                          View All
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {userPlaylists.slice(0, 4).map(pl => (
                          <PlaylistCard key={pl.id} playlist={pl} onClick={() => navigate(`/playlist/${pl.id}`)} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Badges & Achievements Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#101A3B] p-6 rounded-2xl shadow-md">
                      <BadgeSystem user={user} isOwnProfile={isOwnProfile} />
                    </div>
                    <div className="bg-[#101A3B] p-6 rounded-2xl shadow-md">
                      <AchievementList userId={user.uid} />
                    </div>
                  </div>

                  {/* Recent Community Activity */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      Recent Activity
                    </h3>
                    {userPosts.length > 0 ? (
                      <SocialFeed posts={userPosts.slice(0, 3)} />
                    ) : (
                      <div className="bg-[#101A3B] p-8 rounded-2xl text-center">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">No recent social posts</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* NFTS COLLECTION TAB */}
              {activeTab === 'nfts' && (
                <div className="space-y-6">
                  {ownedNfts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {ownedNfts.map(nft => (
                        <NFTCard key={nft.id} nft={nft} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#101A3B] p-12 rounded-2xl text-center flex flex-col items-center justify-center space-y-3">
                      <Gem className="w-12 h-12 text-slate-600" />
                      <h4 className="text-base font-bold text-white uppercase tracking-wider">No Digital Assets Yet</h4>
                      <p className="text-xs text-slate-400 max-w-sm">This collector hasn't minted or acquired any music NFTs on TON yet.</p>
                      <button
                        onClick={() => navigate('/launchpad')}
                        className="mt-2 px-6 py-2.5 bg-[#0052FF] hover:bg-[#1a66ff] text-white rounded-full font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg"
                      >
                        Explore Launchpad Drops
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TRACKS TAB */}
              {activeTab === 'tracks' && (
                <div className="space-y-4">
                  {uploadedTracks.length > 0 ? (
                    <div className="bg-[#101A3B] rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
                      {uploadedTracks.map((track, idx) => {
                        const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
                        return (
                          <div 
                            key={track.id}
                            onClick={() => playTrack(track)}
                            className="p-4 flex items-center justify-between hover:bg-white/[0.04] transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <span className="w-6 text-xs font-mono text-slate-400 text-center font-bold">
                                {idx + 1}
                              </span>
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-900">
                                <img src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} alt={track.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  {isCurrentPlaying ? (
                                    <Pause className="w-5 h-5 text-white fill-current" />
                                  ) : (
                                    <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                                  )}
                                </div>
                              </div>
                              <div className="min-w-0">
                                <h4 className={`text-sm font-bold truncate ${isCurrentPlaying ? 'text-[#0098EA]' : 'text-white'}`}>
                                  {track.title}
                                </h4>
                                <p className="text-xs text-slate-400 font-medium truncate">
                                  {track.artist || user.name}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs font-mono text-slate-400 shrink-0">
                              <span className="hidden sm:inline">{(track.playCount || 1200).toLocaleString()} streams</span>
                              <span>{track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : '3:45'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-[#101A3B] p-12 rounded-2xl text-center flex flex-col items-center justify-center space-y-3">
                      <Disc className="w-12 h-12 text-slate-600" />
                      <h4 className="text-base font-bold text-white uppercase tracking-wider">No Tracks Uploaded</h4>
                      <p className="text-xs text-slate-400">User hasn't published songs to the streaming catalog.</p>
                    </div>
                  )}
                </div>
              )}

              {/* PLAYLISTS TAB */}
              {activeTab === 'playlists' && (
                <div className="space-y-6">
                  {userPlaylists.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {userPlaylists.map(pl => (
                        <PlaylistCard key={pl.id} playlist={pl} onClick={() => navigate(`/playlist/${pl.id}`)} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#101A3B] p-12 rounded-2xl text-center flex flex-col items-center justify-center space-y-3">
                      <Library className="w-12 h-12 text-slate-600" />
                      <h4 className="text-base font-bold text-white uppercase tracking-wider">No Playlists Created</h4>
                      <p className="text-xs text-slate-400">No public playlists found for this user.</p>
                    </div>
                  )}
                </div>
              )}

              {/* FEED & ACTIVITY TAB */}
              {activeTab === 'activity' && (
                <div className="max-w-2xl mx-auto space-y-6">
                  {userPosts.length > 0 ? (
                    <SocialFeed posts={userPosts} />
                  ) : (
                    <div className="bg-[#101A3B] p-12 rounded-2xl text-center flex flex-col items-center justify-center space-y-3">
                      <Layers className="w-12 h-12 text-slate-600" />
                      <h4 className="text-base font-bold text-white uppercase tracking-wider">No Activity Logged</h4>
                      <p className="text-xs text-slate-400">Posts, likes and comments will appear here.</p>
                    </div>
                  )}
                </div>
              )}

              {/* NETWORK TAB */}
              {activeTab === 'network' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#0052FF]" />
                    Followed Artists & Connections
                  </h3>

                  {user.followedArtists && user.followedArtists.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {user.followedArtists.map(artistId => {
                        const artist = artists.find(a => a.uid === artistId);
                        if (!artist) return null;
                        return <ArtistListItem key={artist.uid} artist={artist} />;
                      })}
                    </div>
                  ) : (
                    <div className="bg-[#101A3B] p-12 rounded-2xl text-center">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Not following any artists currently</p>
                    </div>
                  )}
                </div>
              )}

              {/* ABOUT & BADGES TAB */}
              {activeTab === 'about' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#101A3B] p-6 rounded-2xl shadow-md space-y-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Profile Bio & Verification</h3>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {user.bio || 'Active participant in the TonJam decentralized music movement.'}
                    </p>

                    {user.walletAddress && (
                      <div className="pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">TON Wallet Address</span>
                        <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl">
                          <span className="font-mono text-xs text-[#0098EA] truncate">{user.walletAddress}</span>
                          <button onClick={handleCopyWallet} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 cursor-pointer">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {(user.socials?.x || user.socials?.instagram || user.socials?.website || user.socials?.telegram) && (
                      <div className="pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Connected Channels</span>
                        <div className="flex flex-wrap gap-2">
                          {user.socials?.x && (
                            <a href={user.socials.x} target="_blank" rel="noreferrer" className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white">
                              <Twitter className="w-4 h-4" />
                            </a>
                          )}
                          {user.socials?.instagram && (
                            <a href={user.socials.instagram} target="_blank" rel="noreferrer" className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white">
                              <Instagram className="w-4 h-4" />
                            </a>
                          )}
                          {user.socials?.telegram && (
                            <a href={user.socials.telegram} target="_blank" rel="noreferrer" className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white">
                              <Send className="w-4 h-4" />
                            </a>
                          )}
                          {user.socials?.website && (
                            <a href={user.socials.website} target="_blank" rel="noreferrer" className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white">
                              <Globe className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="bg-[#101A3B] p-6 rounded-2xl shadow-md">
                      <BadgeSystem user={user} isOwnProfile={isOwnProfile} />
                    </div>
                    <div className="bg-[#101A3B] p-6 rounded-2xl shadow-md">
                      <AchievementList userId={user.uid} />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* MODALS */}
      <ProfileQRCodeModal 
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        profile={{
          name: user.name,
          username: user.username || user.name.toLowerCase().replace(/\s+/g, ''),
          avatar: user.avatar,
          role: user.isVerifiedArtist ? 'Verified Creator' : 'Fan / Collector',
          bio: user.bio,
          isVerified: Boolean(user.isVerifiedArtist || user.isVerified),
          uid: user.uid
        }}
      />

      {isTipModalOpen && (
        <TipArtistModal 
          onClose={() => setIsTipModalOpen(false)}
          artist={{
            uid: user.uid,
            name: user.name,
            walletAddress: user.walletAddress,
            avatarUrl: user.avatar
          }}
        />
      )}
    </PageContainer>
  );
};

export default UserProfile;
