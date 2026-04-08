import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Users, 
  Layers, 
  Disc, 
  Box, 
  ArrowLeft,
  Gem,
  Share2,
  Camera
} from 'lucide-react';

import { MOCK_USERS, MOCK_TRACKS, MOCK_NFTS, MOCK_POSTS, MOCK_ARTISTS } from '@/constants';
import TrackCard from '@/components/TrackCard';
import NFTCard from '@/components/NFTCard';
import ArtistListItem from '@/components/ArtistListItem';
import SocialFeed from '@/components/SocialFeed';
import PlaylistCard from '@/components/PlaylistCard';
import { useAudio } from '@/context/AudioContext';
import { getPlaceholderImage, cn, validateFile, ALLOWED_IMAGE_TYPES } from '@/lib/utils';
import { ProfileCard } from '@/components/ProfileCard';
import { UserProfile as UserProfileType } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { uploadFile } from '@/services/storageService';

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { allTracks, allNFTs, userProfile, toggleFollowUser, followedUserIds, addNotification, playlists } = useAudio();
  
  const [user, setUser] = useState<UserProfileType | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'activity' | 'network'>('overview');

  useEffect(() => {
    // If the ID matches the current user, redirect to their profile
    if (id === userProfile.uid) {
      navigate('/profile');
      return;
    }

    const foundUser = MOCK_USERS.find(u => u.uid === id);
    if (foundUser) {
      setUser(foundUser);
    } else {
      // Handle not found
      navigate('/');
    }
    window.scrollTo(0, 0);
  }, [id, userProfile.uid, navigate]);

  const isFollowing = useMemo(() => {
    return followedUserIds.includes(id || '');
  }, [followedUserIds, id]);

  const handleFollow = () => {
    if (id) {
      toggleFollowUser(id);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file, 'image', 5);
      if (!validation.isValid) {
        addNotification(validation.error || "Invalid file", "error");
        e.target.value = '';
        return;
      }
      
      try {
        addNotification("Adding banner image...", "info");
        const storagePath = `profiles/${userProfile.uid}/banner.png`;
        const { downloadUrl } = await uploadFile(file, storagePath);
        setUser(prev => prev ? { ...prev, bannerUrl: downloadUrl } : null);
        addNotification("Banner image added successfully", "success");
      } catch (error: any) {
        console.error("Banner upload failed:", error);
        addNotification(`Banner upload failed: ${error.message}`, "error");
      }
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const userPosts = useMemo(() => {
    if (!user) return [];
    return MOCK_POSTS.filter(p => p.userId === user.uid);
  }, [user]);

  const ownedNfts = useMemo(() => {
    if (!user) return [];
    return allNFTs.filter(nft => nft.owner === user.walletAddress || nft.owner === user.name);
  }, [user, allNFTs]);

  const uploadedTracks = useMemo(() => {
    if (!user) return [];
    return allTracks.filter(t => t.artistId === user.uid);
  }, [user, allTracks]);

  const userPlaylists = useMemo(() => {
    if (!user) return [];
    return playlists.filter(p => p.creator === user.name || p.creator === user.username);
  }, [user, playlists]);

  if (!user) return null;

  const themeClass = user.profileTheme
    ? user.profileTheme === 'dark' || user.profileTheme === 'light' 
      ? user.profileTheme 
      : `theme-${user.profileTheme}`
    : '';

  return (
    <div className={`animate-in fade-in duration-1000 pb-24 min-h-screen font-sans ${themeClass} bg-background`}>
      {/* 1. CINEMATIC BANNER (Audiomack Style) */}
      <div className="relative h-[250px] md:h-[350px] overflow-hidden group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${user.bannerUrl || getPlaceholderImage(`user-banner-${user.uid}`, 1200, 400)})` }}
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent"></div>
        
        {/* Banner Upload Trigger */}
        {id === userProfile.uid && (
          <div className="absolute top-6 right-6 z-40">
            <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-all shadow-lg border border-white/10 hover:scale-110 active:scale-90" >
              <Camera className="h-5 w-5" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleBannerUpload} accept={ALLOWED_IMAGE_TYPES.join(',')} className="hidden" />
          </div>
        )}
      </div>

      {/* 2. IDENTITY & ACTIONS (Audiomack Style) */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-30">
        <div className="flex flex-row items-end justify-between gap-6 -mt-16 md:-mt-24 pb-8">
          <div className="flex flex-row items-end gap-6 w-full">
            {/* Profile Picture (Overlapping) */}
            <div className="relative">
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-[6px] border-background shadow-2xl bg-muted ring-1 ring-white/10">
                <img 
                  src={user.avatar || getPlaceholderImage(`user-${user.uid}`)} 
                  className="w-full h-full object-cover" 
                  alt={user.name} 
                />
              </div>
            </div>
            
            <div className="flex flex-col items-start text-left flex-1 pb-2">
              <div className="flex flex-col gap-1 mb-4">
                <div className="flex items-center gap-2 justify-start">
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-lg">
                    {user.name}
                  </h1>
                  {user.isVerified && (
                    <div className="bg-orange-500 rounded-full p-1 shadow-lg">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-white/80 font-bold text-sm md:text-base drop-shadow-md">
                  @{user.username || (user.name || 'user').toLowerCase().replace(/\s+/g, '')}
                </span>
              </div>
              
              <div className="flex items-center gap-8 mb-4">
                <div className="flex flex-col items-start">
                  <span className="text-xl font-black text-white drop-shadow-md">{(user.followers || 0).toLocaleString()}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-black">Followers</span>
                </div>
                <div className="flex flex-col items-start border-l border-white/10 pl-8">
                  <span className="text-xl font-black text-white drop-shadow-md">{(user.following || 0).toLocaleString()}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-black">Following</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 pb-2">
            <button 
              onClick={handleFollow} 
              className={cn(
                "px-10 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-xl",
                isFollowing 
                  ? "bg-white/10 text-white border border-white/20 backdrop-blur-md hover:bg-white/20" 
                  : "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/30"
              )}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
            <button 
              onClick={() => {
                navigator.share?.({ title: user.name, url: window.location.href })
                  .catch(() => {
                    navigator.clipboard.writeText(window.location.href);
                    addNotification("Link copied", "success");
                  });
              }}
              className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all border border-white/20 backdrop-blur-md"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. TABS NAVIGATION */}
      <div className="sticky top-[var(--header-height,64px)] z-30 bg-background/95 backdrop-blur-xl border-b border-border mb-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
            {['overview', 'inventory', 'activity', 'network'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab as any)} 
                className={cn(
                  "py-4 text-sm font-bold transition-all relative whitespace-nowrap",
                  activeTab === tab ? "text-orange-500" : "text-muted-foreground hover:text-foreground"
                )} 
              >
                {tab === 'inventory' ? 'Collection' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTabUser"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-t-full" 
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="min-h-[500px]">
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* My Activity (Recent Posts) */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-black">Activity</h3>
                      <button onClick={() => setActiveTab('activity')} className="text-xs font-bold text-orange-500 hover:text-orange-400 uppercase tracking-widest">View All</button>
                    </div>
                    {userPosts.length > 0 ? (
                      <SocialFeed posts={userPosts.slice(0, 3)} />
                    ) : (
                      <div className="bg-muted/20 p-8 rounded-2xl text-center">
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No recent activity</p>
                      </div>
                    )}
                  </div>

                  {/* Followed Artists */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-black">Followed Artists</h3>
                      <button onClick={() => setActiveTab('network')} className="text-xs font-bold text-orange-500 hover:text-orange-400 uppercase tracking-widest">View All</button>
                    </div>
                    {user.followedArtists && user.followedArtists.length > 0 ? (
                      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                        {user.followedArtists.slice(0, 5).map(artistId => {
                          const artist = MOCK_ARTISTS.find(a => a.uid === artistId);
                          if (!artist) return null;
                          return <div key={artist.uid} className="flex-shrink-0 w-40 sm:w-48"><ArtistListItem artist={artist} /></div>;
                        })}
                      </div>
                    ) : (
                      <div className="bg-muted/20 p-8 rounded-2xl text-center">
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Not following any artists</p>
                      </div>
                    )}
                  </div>

                  {/* Created Playlists */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-black">Created Playlists</h3>
                    </div>
                    {userPlaylists.length > 0 ? (
                      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                        {userPlaylists.slice(0, 5).map(pl => (
                          <div key={pl.id} className="flex-shrink-0 w-40 sm:w-48">
                            <PlaylistCard playlist={pl} onClick={() => navigate(`/playlist/${pl.id}`)} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-muted/20 p-8 rounded-2xl text-center">
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No playlists created</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'inventory' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Owned NFTs */}
                  <div>
                    <h3 className="text-xl font-black mb-6">Digital Assets</h3>
                    {ownedNfts.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {ownedNfts.map(nft => (
                          <NFTCard key={nft.id} nft={nft} />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-muted/20 p-12 rounded-2xl text-center flex flex-col items-center justify-center">
                        <Gem className="w-12 h-12 text-muted-foreground/30 mb-4" />
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No assets acquired yet</p>
                      </div>
                    )}
                  </div>

                  {/* Uploaded Tracks (if any) */}
                  {uploadedTracks.length > 0 && (
                    <div>
                      <h3 className="text-xl font-black mb-6">Uploaded Tracks</h3>
                      <div className="space-y-1">
                        {uploadedTracks.map((track, index) => (
                          <div 
                            key={track.id} 
                            className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-all cursor-pointer group"
                          >
                            <span className="w-6 text-xs font-bold text-muted-foreground text-center">{index + 1}</span>
                            <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                              <img src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold truncate">{track.title}</h4>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{track.genre}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {userPosts.length > 0 ? (
                    <SocialFeed posts={userPosts} />
                  ) : (
                    <div className="bg-muted/20 p-12 rounded-2xl text-center flex flex-col items-center justify-center">
                      <Layers className="w-12 h-12 text-muted-foreground/30 mb-4" />
                      <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No recent activity</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'network' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                  {/* Followed Artists */}
                  <div>
                    <h3 className="text-xl font-black mb-6">Followed Artists</h3>
                    {user.followedArtists && user.followedArtists.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {user.followedArtists.map(artistId => {
                            const artist = MOCK_ARTISTS.find(a => a.uid === artistId);
                            if (!artist) return null;
                            return <ArtistListItem key={artist.uid} artist={artist} />;
                         })}
                      </div>
                    ) : (
                      <div className="bg-muted/20 p-12 rounded-2xl text-center">
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Not following any artists</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-muted/20 p-6 rounded-2xl">
              <h3 className="text-sm font-black uppercase tracking-wider mb-4">About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {user.bio || "No biography available."}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
