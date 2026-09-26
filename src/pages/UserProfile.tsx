import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAudio } from '@/contexts/AudioContext';
import { useNFT } from '@/contexts/NFTContext';
import { getPlaceholderImage } from '@/lib/utils';
import { UserProfile as UserProfileType } from '@/types';

// Reusable profile components
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { UserProfileContent } from '@/components/profile/UserProfileContent';
import { ArtistProfileContent } from '@/components/profile/ArtistProfileContent';
import { ProfileQRCodeModal } from '@/components/profile/ProfileQRCodeModal';
import TipArtistModal from '@/components/TipArtistModal';
import { PageContainer } from '@/components/layout/PageContainer';
import { getInitialListenStreakData } from '@/lib/listenStreak';

export const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    userProfile: currentUserProfile, 
    toggleFollowUser, 
    followedUserIds, 
    posts, 
    allTracks, 
    playlists, 
    artists,
    currentTrack,
    isPlaying,
    playTrack,
    recentlyPlayed,
    likedTrackIds,
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

        // 1. Try Firestore users collection
        const userDoc = await getDoc(doc(db, 'users', id));
        if (userDoc.exists()) {
          setUser(userDoc.data() as UserProfileType);
        } else {
          // 2. Try match from state artists
          const foundArtist = artists.find(a => a.uid === id || a.name.toLowerCase() === id.toLowerCase());
          if (foundArtist) {
            setUser({
              uid: foundArtist.uid,
              name: foundArtist.name,
              username: foundArtist.username || foundArtist.name.toLowerCase().replace(/\s+/g, ''),
              avatar: foundArtist.avatarUrl || getPlaceholderImage(`artist-${foundArtist.uid}`),
              bannerUrl: foundArtist.bannerUrl || foundArtist.bannerImageUrl || '',
              bio: foundArtist.bio || '',
              walletAddress: foundArtist.walletAddress || '',
              isVerifiedArtist: true,
              role: 'artist',
              followers: foundArtist.followers || 1420,
              following: 12,
              earnings: 0,
              createdAt: new Date().toISOString(),
              tjBalance: 500,
              monthlyListeners: 34500,
              totalStreams: 182000
            } as UserProfileType);
          } else {
            // 3. Fallback collector profile
            setUser({
              uid: id,
              name: 'TONJam Explorer',
              username: `user_${id.slice(0, 6)}`,
              avatar: getPlaceholderImage(`user-${id}`),
              bannerUrl: '',
              bio: 'Active on-chain music collector and listener on TonJam ecosystem.',
              walletAddress: id.startsWith('EQ') ? id : `EQD${id.slice(0, 6)}...${id.slice(-4)}`,
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

  const isArtist = Boolean(user?.role === 'artist' || user?.isVerifiedArtist);

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

  // Filtered Assets
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

  const likedTracks = useMemo(() => {
    if (!likedTrackIds || likedTrackIds.length === 0) return [];
    return allTracks.filter(t => likedTrackIds.includes(t.id));
  }, [likedTrackIds, allTracks]);

  // Context-aware Spotify-inspired Tab Options
  const tabs = useMemo(() => {
    if (isArtist) {
      return [
        { id: 'overview', label: 'Overview' },
        { id: 'tracks', label: `Discography (${uploadedTracks.length})` },
        { id: 'nfts', label: `NFT Releases (${ownedNfts.length})` },
        { id: 'albums', label: `Albums & Compilations (${userPlaylists.length})` },
        { id: 'about', label: 'About' },
      ];
    }

    return [
      { id: 'overview', label: 'Overview' },
      { id: 'recent', label: `Recently Played (${recentlyPlayed.length})` },
      { id: 'nfts', label: `My NFTs (${ownedNfts.length})` },
      { id: 'playlists', label: `Playlists (${userPlaylists.length})` },
      { id: 'activity', label: 'Activity' },
      { id: 'about', label: 'About' },
    ];
  }, [isArtist, uploadedTracks.length, ownedNfts.length, userPlaylists.length, recentlyPlayed.length]);

  if (loading) {
    return (
      <PageContainer animate={false} className="min-h-screen bg-[#050A24] text-white p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0052FF]/20 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-[#0052FF] border-t-transparent animate-spin" />
          </div>
          <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Loading TonJam Profile...</span>
        </div>
      </PageContainer>
    );
  }

  if (!user) return null;

  return (
    <PageContainer animate={true} hasPlayerSpacing={true} className="min-h-screen bg-[#050A24] text-white font-sans pb-32">
      
      {/* 1. Transparent Spotify-Inspired Profile Header */}
      <ProfileHeader
        user={user}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        onFollow={handleFollow}
        onShare={() => setIsQRModalOpen(true)}
        onTipArtist={() => setIsTipModalOpen(true)}
        onEditProfile={() => navigate('/edit-profile')}
      />

      {/* 2. Main Profile Content Canvas */}
      <div className="px-4 sm:px-8 space-y-6">
        
        {/* Navigation Tabs Pill Bar */}
        <div className="pt-2">
          <ProfileTabs activeTab={activeTab} onChangeTab={setActiveTab} tabs={tabs} />
        </div>

        {/* Tab Content Panels */}
        <div className="pt-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {isArtist ? (
                <ArtistProfileContent
                  user={user}
                  isOwnProfile={isOwnProfile}
                  activeTab={activeTab}
                  tracks={uploadedTracks.length > 0 ? uploadedTracks : allTracks.slice(0, 5)}
                  nfts={ownedNfts}
                  playlists={userPlaylists}
                  posts={userPosts}
                  stats={{
                    monthlyListeners: (user as any).monthlyListeners || 48200,
                    totalStreams: (user as any).totalStreams || 124900,
                    followers: user.followers,
                  }}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  playTrack={playTrack}
                  setActiveTab={setActiveTab}
                  onTipArtist={() => setIsTipModalOpen(true)}
                />
              ) : (
                <UserProfileContent
                  user={user}
                  isOwnProfile={isOwnProfile}
                  activeTab={activeTab}
                  ownedNfts={ownedNfts}
                  uploadedTracks={uploadedTracks}
                  userPlaylists={userPlaylists}
                  userPosts={userPosts}
                  artists={artists}
                  streakDays={streakDays}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  playTrack={playTrack}
                  setActiveTab={setActiveTab}
                  onCopyWallet={handleCopyWallet}
                  copiedAddress={copiedAddress}
                  recentlyPlayed={recentlyPlayed}
                  likedTracks={likedTracks}
                />
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
          role: isArtist ? 'Verified Artist' : 'Music Collector',
          bio: user.bio,
          isVerified: isArtist,
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
