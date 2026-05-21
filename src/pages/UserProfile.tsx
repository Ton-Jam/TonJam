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
  Camera,
  Twitter,
  Instagram,
  Send,
  Globe
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
    <div className={`animate-in fade-in duration-1000 pb-24 min-h-screen font-sans ${themeClass} bg-background text-foreground`}>
      {/* 1. CINEMATIC BANNER (Audiomack Style) */}
      <div className="relative h-[140px] sm:h-[200px] md:h-[300px] overflow-hidden group bg-blue-950 border-b-4 border-muted/20">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105 opacity-80"
          style={{ backgroundImage: `url(${user.bannerUrl || getPlaceholderImage(`user-banner-${user.uid}`, 1200, 400)})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-background/60 to-background"></div>
        
        {/* Extreme Left Actions ON Cover Picture */}
        <div className="absolute bottom-4 left-4 z-40 flex items-center gap-1.5">
          <button 
            onClick={handleFollow} 
            className={cn(
              "cursor-pointer transition-all px-6 py-2 rounded-lg border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] font-black text-[10px] uppercase tracking-wider transition-all",
              isFollowing 
                ? "bg-white/20 text-white border-white/40 backdrop-blur-md" 
                : "bg-blue-500 text-white border-blue-600 shadow-white/20"
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
            className="p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-all border border-white/10 backdrop-blur-md shadow-lg"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
        </div>
        
        {/* Banner Upload Trigger */}
        {id === userProfile.uid && (
          <div className="absolute top-4 right-4 z-40">
            <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-blue-600 transition-all shadow-lg border border-white/10 hover:scale-110 active:scale-90" >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleBannerUpload} accept={ALLOWED_IMAGE_TYPES.join(',')} className="hidden" />
          </div>
        )}
      </div>

      {/* 2. IDENTITY & ACTIONS (Refined) */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-30">
        <div className="flex flex-col md:flex-row items-end gap-4 sm:gap-8 -mt-12 sm:-mt-20 pb-6 border-b border-border/50">
          {/* Profile Picture (Refined Overlap) */}
          <div className="relative flex-shrink-0">
            <div 
              className="w-20 h-20 sm:w-28 sm:h-28 md:w-40 md:h-40 overflow-hidden border-4 border-background shadow-2xl bg-muted rounded-full"
            >
              <img 
                src={user.avatar || getPlaceholderImage(`user-${user.uid}`)} 
                className="w-full h-full object-cover rounded-full" 
                alt={user.name} 
              />
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 pb-2">
            <div className="flex flex-col gap-0.5 mb-4">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h1 className="text-2xl md:text-4xl font-black tracking-tight text-foreground">
                  {user.name}
                </h1>
                {user.isVerified && (
                  <div className="text-blue-500">
                    <CheckCircle className="h-4 w-4 md:h-6 md:w-6" />
                  </div>
                )}
              </div>
              <span className="text-muted-foreground font-medium text-xs md:text-sm">
                @{user.username || (user.name || 'user').toLowerCase().replace(/\s+/g, '')}
              </span>
            </div>
            
            {/* Action buttons could go here in a refined layout too */}
          </div>

          <div className="flex items-center gap-4 pb-2">
            <Link to={`/user/${id}/follows/followers`} className="flex flex-col items-center group">
              <span className="text-lg font-black text-foreground">{(user.followers || 0).toLocaleString()}</span>
              <span className="text-[9px] uppercase font-bold text-muted-foreground mt-0.5">Followers</span>
            </Link>
            <Link to={`/user/${id}/follows/following`} className="flex flex-col items-center group">
              <span className="text-lg font-black text-foreground">{(user.following || 0).toLocaleString()}</span>
              <span className="text-[9px] uppercase font-bold text-muted-foreground mt-0.5">Following</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. TABS NAVIGATION */}
      <div className="sticky top-[var(--header-height,64px)] z-30 bg-background/90 backdrop-blur-xl border-b border-white/5 mb-4 sm:mb-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-4 sm:gap-10 overflow-x-auto no-scrollbar">
            {['overview', 'inventory', 'activity', 'network'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab as any)} 
                className={cn(
                  "py-3 sm:py-5 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap",
                  activeTab === tab ? "text-blue-500" : "text-muted-foreground hover:text-foreground"
                )} 
              >
                {tab === 'inventory' ? 'Collection' : tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTabUser"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full shadow-[0_-2px_10px_rgba(59,130,246,0.5)]" 
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="min-h-[400px]">
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* My Activity (Recent Posts) */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-black">Activity</h3>
                      <button onClick={() => setActiveTab('activity')} className="text-xs font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest">View All</button>
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
                      <button onClick={() => setActiveTab('network')} className="text-xs font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest">View All</button>
                    </div>
                    {user.followedArtists && user.followedArtists.length > 0 ? (
                      <div className="space-y-4">
                        {user.followedArtists.slice(0, 3).map(artistId => {
                          const artist = MOCK_ARTISTS.find(a => a.uid === artistId);
                          if (!artist) return null;
                          return <ArtistListItem key={artist.uid} artist={artist} />;
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
            <div className="bg-card p-8 rounded-3xl border border-border shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-muted-foreground">About</h3>
              <p className="text-sm text-foreground leading-relaxed mb-6">
                {user.bio || "No biography available."}
              </p>

              {(user.socials?.x || user.socials?.instagram || user.socials?.website || user.socials?.telegram) && (
                <div className="flex flex-wrap gap-3 pt-6 border-t border-border">
                  {user.socials?.x && (
                    <a 
                      href={user.socials.x} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-3 bg-muted hover:bg-muted/80 text-foreground rounded-full transition-all"
                      title="Twitter / X"
                    >
                      <Twitter className="h-4 w-4" />
                    </a>
                  )}
                  {user.socials?.instagram && (
                    <a 
                      href={user.socials.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-3 bg-muted hover:bg-muted/80 text-foreground rounded-full transition-all"
                      title="Instagram"
                    >
                      <Instagram className="h-4 w-4" />
                    </a>
                  )}
                  {user.socials?.website && (
                    <a 
                      href={user.socials.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-3 bg-muted hover:bg-muted/80 text-foreground rounded-full transition-all"
                      title="Website"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  )}
                  {user.socials?.telegram && (
                    <a 
                      href={user.socials.telegram} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-3 bg-muted hover:bg-muted/80 text-foreground rounded-full transition-all"
                      title="Telegram"
                    >
                      <Send className="h-4 w-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
