import * as React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Heart, UserCheck, 
  Edit2, MoreVertical, LayoutGrid, Zap, 
  MapPin, Ticket, Calendar, ArrowLeft, Verified, ChevronRight, Activity, Award, UserPlus, Gem,
  Twitter, Instagram, Globe, Send, ExternalLink
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import TrackCard from '@/components/TrackCard';
import NFTCard from '@/components/NFTCard';
import { MOCK_ARTISTS, MOCK_TRACKS, MOCK_NFTS } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { useAudio } from '@/context/AudioContext';
import { Artist, Track, NFTItem } from '@/types';
import { getPlaceholderImage, cn } from '@/lib/utils';
import EventCard from '@/components/EventCard';
import EditArtistProfileModal from '@/components/EditArtistProfileModal';
import TipArtistModal from '@/components/TipArtistModal';
import ArtistOptionsModal from '@/components/ArtistOptionsModal';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { subscribeToCommunity } from '@/services/fanEngagementService';
import { createActivityPost } from '@/services/socialService';
import SocialFeed from '@/components/SocialFeed';
import { ArtistSummaryCard } from '@/components/ArtistSummaryCard';
import { ArtistPortfolio } from '@/components/ArtistPortfolio';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FanTokenHub } from '@/components/FanTokenHub';
import { FanPowerTracker } from '@/components/FanPowerTracker';
import { useAudioStore } from '@/store/audioStore';

type TabType = 'discography' | 'nfts' | 'tokens' | 'portfolio' | 'collection' | 'posts' | 'fan_club' | 'events' | 'about' | 'fan_power';

const ArtistProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    addNotification, 
    userProfile, 
    posts: allPosts, 
    setTrackToAddToPlaylist, 
    playTrack, 
    playAll, 
    followedUserIds, 
    toggleFollowUser, 
    setHeaderTitle,
    currentTrack,
    repeatMode
  } = useAudio();
  const setRepeatMode = useAudioStore(state => state.setRepeatMode);
  const [activeTab, setActiveTab] = useState<TabType>('discography');
  const [artist, setArtist] = useState<Artist | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 300;
      if (window.scrollY > scrollThreshold) {
        setHeaderTitle(artist?.name || '');
      } else {
        setHeaderTitle('');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      setHeaderTitle('');
    };
  }, [artist?.name, setHeaderTitle]);

  const [artistTracks, setArtistTracks] = useState<Track[]>([]);
  const [artistNFTs, setArtistNFTs] = useState<NFTItem[]>([]);
  const [ownedNFTs, setOwnedNFTs] = useState<NFTItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [showArtistOptions, setShowArtistOptions] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isFanClubMember, setIsFanClubMember] = useState(false);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('tippingModalState', { detail: { open: showTipModal } }));
  }, [showTipModal]);

  const artistPosts = useMemo(() => {
    return allPosts.filter(p => (p.userId === id || p.artistId === id || p.targetId === id) && (!p.isExclusive || isFanClubMember));
  }, [allPosts, id, isFanClubMember]);

  const listedNFTs = useMemo(() => {
    return artistNFTs.filter(n => n.listingType === 'fixed' || n.listingType === 'auction');
  }, [artistNFTs]);

  const exclusiveTracksList = useMemo(() => {
    if (!isFanClubMember) return [];
    return [
      {
        id: `exclusive-${id}-1`,
        title: "Exclusive Track 1",
        artist: artist?.name || "Artist",
        artistId: id || "",
        coverUrl: getPlaceholderImage(`exclusive-1`),
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        duration: 342,
        isNFT: false,
        genre: "Experimental",
        isExclusive: true,
        playCount: 12,
        createdAt: new Date().toISOString()
      } as Track
    ];
  }, [isFanClubMember, artist?.name, id]);

  useEffect(() => {
    const foundArtist = MOCK_ARTISTS.find(a => a.uid === id);
    if (foundArtist) {
      const mockEvents = [
        {
          id: 'event-1',
          artistId: foundArtist.uid,
          title: 'Live at Neo-Tokyo',
          date: new Date(Date.now() + 86400000 * 5).toISOString(),
          time: '20:00 PST',
          venue: 'The Echo Chamber',
          location: 'Tokyo',
          ticketUrl: 'https://example.com/tickets'
        },
        {
          id: 'event-2',
          artistId: foundArtist.uid,
          title: 'Acoustic Session',
          date: new Date(Date.now() + 86400000 * 15).toISOString(),
          time: '22:30 GMT',
          venue: 'Cyberia Arena',
          location: 'London',
          ticketUrl: 'https://example.com/tickets'
        }
      ];

      const artistWithEvents = {
        ...foundArtist,
        events: foundArtist.events?.length ? foundArtist.events : mockEvents
      };

      setArtist(artistWithEvents);
      setArtistTracks(MOCK_TRACKS.filter(t => t.artistId === foundArtist.uid));
      setArtistNFTs(MOCK_NFTS.filter(n => n.creator === foundArtist.name));
      setOwnedNFTs(MOCK_NFTS.filter(n => n.owner === foundArtist.walletAddress && n.creator !== foundArtist.name));
    }
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    if (userProfile?.uid && id) {
      const q = query(
        collection(db, 'subscriptions'),
        where('userId', '==', userProfile.uid),
        where('artistId', '==', id),
        where('status', '==', 'active')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setIsFanClubMember(!snapshot.empty);
      }, (error) => handleFirestoreError(error, OperationType.LIST, 'subscriptions'));

      return () => unsubscribe();
    }
  }, [userProfile?.uid, id]);

  const handleJoinFanClub = async () => {
    if (!userProfile?.uid || !id || !artist) {
      addNotification("Please sign in to join", "error");
      return;
    }
    
    setIsJoining(true);
    try {
      await subscribeToCommunity(userProfile.uid, id);
      
      await createActivityPost(
        userProfile.uid,
        userProfile.name,
        userProfile.avatar,
        `joined the fan club of`,
        'fan_club_join',
        {
          targetId: id,
          artistName: artist.name
        }
      );

      addNotification(`Joined ${artist.name}'s fan club!`, 'success');
    } catch (error) {
      console.error('Error joining fan club:', error);
      addNotification('Could not join fan club. Try again.', 'error');
    } finally {
      setIsJoining(false);
    }
  };

  const isFollowing = followedUserIds?.includes(artist?.uid || "");
  
  const topThreeTracks = useMemo(() => {
    return [...artistTracks]
      .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
      .slice(0, 3);
  }, [artistTracks]);

  const isAutoLoopOn = useMemo(() => {
    return repeatMode === 'one' && topThreeTracks.length > 0 && currentTrack?.id === topThreeTracks[0]?.id;
  }, [repeatMode, currentTrack, topThreeTracks]);

  const handleToggleAutoLoop = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const topHit = topThreeTracks[0];
    if (!topHit) return;

    if (isAutoLoopOn) {
      setRepeatMode('off');
      toast.success("Auto-loop turned off");
    } else {
      await playTrack(topHit);
      setRepeatMode('one');
      toast.success(`Looping Artist's Top Hit: ${topHit.title}`);
    }
  }, [isAutoLoopOn, topThreeTracks, playTrack, setRepeatMode]);

  const handleFollow = () => {
    if (artist?.uid) {
      toggleFollowUser(artist.uid);
      toast(isFollowing ? "Unfollowed" : "Followed");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">Artist Not Found</h2>
        <p className="text-muted-foreground text-sm">This artist's profile does not exist.</p>
        <button 
          onClick={() => navigate('/discover')}
          className="px-6 py-2 bg-foreground text-background rounded-full font-medium text-sm transition-opacity hover:opacity-90"
        >
          Return Home
        </button>
      </div>
    );
  }

  const isOwnProfile = user?.uid === artist.uid;

  return (
    <div className="w-full bg-background min-h-screen text-foreground pb-24">
      {/* Cover Image */}
      <div className="relative w-[851px] h-[315px] bg-muted mx-auto overflow-hidden">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-4 left-4 z-30 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white/90 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <img 
          src={artist.bannerImageUrl || artist.bannerUrl || getPlaceholderImage(`banner-${artist.uid}`, 1500, 500)} 
          className="w-full h-full object-cover" 
          alt="" 
        />
        
        {isOwnProfile && (
          <button 
            onClick={() => setShowEditModal(true)}
            className="absolute top-4 right-4 z-30 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white/90 transition-all"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
        
        {!isOwnProfile && (
          <button 
            onClick={() => setShowArtistOptions(true)}
            className="absolute top-4 right-4 z-30 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white/90 transition-all"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        )}

        <div className="absolute left-4 md:left-12 -bottom-16 z-20 flex items-end gap-6">
          <Avatar className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-background bg-muted">
            <AvatarImage src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} alt={artist.name} className="object-cover" />
            <AvatarFallback>{artist.name[0]}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 md:px-12 mt-20 md:mt-24">
        {/* Action Buttons Below Cover */}
        {!isOwnProfile && (
            <div className="flex items-center gap-2 mb-6">
                <button 
                   onClick={handleFollow}
                   className={cn(
                     "px-6 py-2 rounded-full font-semibold text-xs transition-colors flex items-center gap-1.5",
                     isFollowing 
                       ? "bg-white/10 text-white hover:bg-white/20 border border-white/20" 
                       : "bg-white text-black hover:bg-white/90"
                   )}
                 >
                     {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                     {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button 
                   onClick={() => setShowTipModal(true)}
                   className="px-6 py-2 rounded-full font-semibold text-xs border border-white/20 hover:bg-white text-white hover:text-black transition-colors"
                 >
                   Tip
                </button>
            </div>
        )}

        {/* Name & Basic Info */}
        <div className="flex flex-col gap-2 mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
                      {artist.name}
              </h1>
              {artist.verified && (
                <Verified className="w-6 h-6 text-blue-500 mt-1 fill-white" />
              )}
            </div>
            {artist.username && (
                <div className="text-muted-foreground font-medium text-base">
                    @{artist.username.replace('@', '')}
                </div>
            )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-8 text-sm mb-12">
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground">{(artist.followers || 0).toLocaleString()}</span>
              <span className="text-muted-foreground text-xs uppercase tracking-wider">Followers</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground">{(artist.playCount || 0).toLocaleString()}</span>
              <span className="text-muted-foreground text-xs uppercase tracking-wider">Plays</span>
            </div>
        </div>
        
        {/* Visual Summary Card */}
        <ArtistSummaryCard artist={artist} />

        {/* Split Multi-Column Layout: Biography & Direct Crypto Support left, Tabs right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT PANEL: Permanent Bio & Crypto Support Card (No Borders) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Biography block */}
            <div className="bg-[#18181b]/40 p-6 rounded-2xl space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-white">Biography</h3>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {artist.bio || "No biography provided yet. This creator is building the soundscapes of the future."}
              </p>
              
              <div className="space-y-3 pt-4 border-t border-white/[0.04]">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground uppercase tracking-wider font-bold">Location</span>
                  <span className="text-white font-semibold">{artist.location || 'Distributed Node'}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground uppercase tracking-wider font-bold">Genre</span>
                  <span className="text-white font-semibold">{artist.genre || 'Electronic / Web3'}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground uppercase tracking-wider font-bold">Network Status</span>
                  <span className="text-emerald-400 font-bold uppercase tracking-widest text-[9px] flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                  </span>
                </div>
              </div>

              {artist.socials && Object.values(artist.socials).some(Boolean) && (
                <div className="pt-4 border-t border-white/[0.04] space-y-2">
                  <span className="text-muted-foreground uppercase tracking-wider font-bold text-[11px] block">Socials & Networks</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {artist.socials.x && (
                      <a 
                        href={artist.socials.x} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all text-xs font-semibold"
                        id="artist-social-x"
                      >
                        <Twitter className="w-3.5 h-3.5 text-blue-400" />
                        <span>X.Com</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                      </a>
                    )}
                    {artist.socials.instagram && (
                      <a 
                        href={artist.socials.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all text-xs font-semibold"
                        id="artist-social-instagram"
                      >
                        <Instagram className="w-3.5 h-3.5 text-pink-500" />
                        <span>Instagram</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                      </a>
                    )}
                    {artist.socials.telegram && (
                      <a 
                        href={artist.socials.telegram} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all text-xs font-semibold"
                        id="artist-social-telegram"
                      >
                        <Send className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Telegram</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                      </a>
                    )}
                    {artist.socials.website && (
                      <a 
                        href={artist.socials.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all text-xs font-semibold"
                        id="artist-social-website"
                      >
                        <Globe className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Website</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Direct Support via Crypto block */}
            <div className="bg-gradient-to-br from-indigo-950/20 to-blue-950/25 p-6 rounded-2xl space-y-5">
              <div className="space-y-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400">Direct Support</h3>
                <p className="text-[10px] text-muted-foreground">Fund cryptocurrency donations to support this artist directly through decentralized relays.</p>
              </div>

              {/* Wallet Address Block */}
              {artist.walletAddress && (
                <div className="bg-black/30 p-3 rounded-xl space-y-1">
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block font-mono">Verified Ledger:</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-mono text-white/90 truncate max-w-[150px] select-all" title={artist.walletAddress}>
                      {artist.walletAddress}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(artist.walletAddress || '');
                        toast("Wallet address copied to clipboard!");
                        addNotification("Artist wallet address copied!", "success");
                      }}
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white rounded-[4px] font-bold text-[8px] uppercase tracking-widest transition-all cursor-pointer border-none"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {/* Tips & Donations button */}
              <button
                onClick={() => setShowTipModal(true)}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all cursor-pointer border-none flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
              >
                <Zap className="w-3.5 h-3.5 fill-current text-white animate-pulse" /> Support verified artist
              </button>

              <p className="text-[8px] text-muted-foreground uppercase tracking-[0.15em] leading-relaxed text-center">
                100% of tips, monthly subscriptions, and direct NFT purchases go directly to {artist.name}'s verified ledger.
              </p>
            </div>
          </div>

          {/* RIGHT PANEL: Interaction Tabs (Discography, NFTs, and more) */}
          <div className="lg:col-span-8 w-full">
            {/* Main Content Tabs */}
            <Tabs defaultValue="discography" value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="w-full">
          <TabsList className="bg-transparent h-auto p-0 flex flex-nowrap overflow-x-auto no-scrollbar gap-8 justify-start border-b border-border mb-10 w-full rounded-none pb-px scroll-smooth snap-x">
            {(['discography', 'tokens', 'fan_power', 'nfts', 'portfolio', 'collection', 'posts', 'fan_club', 'events', 'about'] as TabType[]).map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="px-0 py-3 rounded-none text-sm font-semibold transition-all whitespace-nowrap bg-transparent text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:shadow-none hover:text-foreground border-b-2 border-transparent h-auto shadow-none snap-center cursor-pointer"
              >
                {tab.replace('_', ' ').toUpperCase()}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="min-h-[400px]">
            {/* DISCOGRAPHY */}
            <TabsContent value="discography" className="m-0 focus-visible:outline-none space-y-12">
              
              {/* Popular Tracks */}
              {topThreeTracks.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold tracking-tight">Popular</h3>
                    
                    {/* Auto-Loop Toggle */}
                    <div 
                      onClick={handleToggleAutoLoop}
                      className="flex items-center gap-2 bg-[#18181b]/60 hover:bg-[#18181b]/80 py-1.5 px-3 rounded-full cursor-pointer select-none transition-all duration-200 active:scale-95"
                    >
                      <span className="text-[9px] font-black uppercase tracking-wider text-neutral-400">
                        Auto-Loop Top Hit
                      </span>
                      <div className={cn(
                        "w-7 h-4 rounded-full p-0.5 transition-colors duration-200 ease-in-out flex items-center",
                        isAutoLoopOn ? "bg-emerald-500" : "bg-neutral-800"
                      )}>
                        <motion.div 
                          layout 
                          className="w-3 h-3 bg-white rounded-full shadow-sm"
                          animate={{ x: isAutoLoopOn ? 12 : 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {topThreeTracks.map((track, idx) => {
                      const associatedNft = MOCK_NFTS.find(n => n.trackId === track.id);
                      return (
                        <div 
                          key={track.id} 
                          className="group flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => playTrack(track)}
                        >
                          <div className="flex items-center gap-4">
                            <span className="w-6 text-center text-sm font-medium text-muted-foreground group-hover:hidden">
                              {idx + 1}
                            </span>
                            <span className="w-6 text-center text-sm font-medium hidden group-hover:flex items-center justify-center">
                              <Play className="w-4 h-4 fill-current text-foreground" />
                            </span>
                            
                            <img src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} className="w-12 h-12 rounded-md object-cover" alt="" />
                            
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-semibold truncate group-hover:text-blue-500 transition-colors">{track.title}</h4>
                                {associatedNft && (
                                  <span 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/nft/${associatedNft.id}`);
                                    }}
                                    className="flex items-center gap-1 text-[8px] font-black text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 px-1.5 py-0.5 rounded-[4px] transition-colors uppercase tracking-widest cursor-pointer whitespace-nowrap"
                                  >
                                    <Gem className="w-2.5 h-2.5 text-purple-400" /> Linked NFT
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground truncate">{track.genre}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-8">
                            <span className="text-xs text-muted-foreground hidden md:block">
                              {(track.playCount || 0).toLocaleString()} <span className="sr-only">plays</span>
                            </span>
                            <span className="text-xs text-muted-foreground hidden md:block">{track.duration || '3:45'}</span>
                            <button className="p-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-accent-foreground" onClick={(e) => { e.stopPropagation(); /* handle heart */ }}>
                              <Heart className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Fan Club Concept */}
              {isFanClubMember && exclusiveTracksList.length > 0 && (
                <section>
                  <h3 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
                     Exclusive Content
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {exclusiveTracksList.map(track => (
                      <TrackCard key={track.id} track={track} />
                    ))}
                  </div>
                </section>
              )}

              {/* Full Discography */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold tracking-tight">Releases</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {artistTracks.map((track) => (
                    <TrackCard key={track.id} track={track} />
                  ))}
                </div>
              </section>
            </TabsContent>

            {/* PORTFOLIO */}
            <TabsContent value="portfolio" className="m-0 focus-visible:outline-none">
                <ArtistPortfolio artist={artist} tracks={artistTracks} />
            </TabsContent>

            {/* NFTS */}
            <TabsContent value="nfts" className="m-0 focus-visible:outline-none space-y-12">
              {/* Active Market Listings (Buy / Bid CTAs active) */}
              <div className="space-y-6 animate-in fade-in" id="active-market-listings-section">
                <div className="flex flex-col gap-1">
                  <h3 className="text-2xl font-bold tracking-tight">Active Market Listings</h3>
                  <p className="text-xs text-muted-foreground">Digital collectibles open for direct purchase or active auction bidding.</p>
                </div>
                
                {listedNFTs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {listedNFTs.map(nft => (
                      <NFTCard key={`listed-${nft.id}`} nft={nft} />
                    ))}
                  </div>
                ) : (
                  <div className="col-span-full border border-dashed border-white/5 rounded-2xl p-8 text-center bg-white/[0.01]">
                    <p className="text-muted-foreground text-sm">No active listings or live auctions for this artist at the moment.</p>
                  </div>
                )}
              </div>

              {/* All Curated Creations */}
              <div className="space-y-6 pt-6 border-t border-white/[0.04]" id="all-created-artifacts-section">
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-bold tracking-tight font-sans">All Curated Creations</h3>
                  <p className="text-xs text-muted-foreground">The complete decentralized catalog of minted creative artifacts.</p>
                </div>
                
                {artistNFTs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {artistNFTs.map(nft => (
                      <NFTCard key={`created-${nft.id}`} nft={nft} />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No NFTs curated yet.</p>
                )}
              </div>
            </TabsContent>

            {/* COLLECTION */}
            <TabsContent value="collection" className="m-0 focus-visible:outline-none">
              <div className="space-y-8 animate-in fade-in">
                <h3 className="text-2xl font-bold tracking-tight mb-6">Collection</h3>
                {ownedNFTs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {ownedNFTs.map(nft => (
                      <NFTCard key={nft.id} nft={nft} />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Collection is empty.</p>
                )}
              </div>
            </TabsContent>

            {/* POSTS */}
            <TabsContent value="posts" className="m-0 focus-visible:outline-none">
              <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in">
                <SocialFeed posts={artistPosts} emptyMessage="No posts yet." />
              </div>
            </TabsContent>

            {/* FAN CLUB */}
            <TabsContent value="fan_club" className="m-0 focus-visible:outline-none">
              <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in mt-8">
                <div className="bg-muted/30 rounded-3xl p-8 md:p-12 border border-border/50 text-center">
                  <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Award className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight mb-4">Fan Club</h3>
                  <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-10 leading-relaxed">
                    Support {artist.name} directly to get early access to drops, exclusive tracks, and special community features.
                  </p>
                  
                  <button 
                    onClick={handleJoinFanClub}
                    disabled={isJoining || isFanClubMember}
                    className={cn(
                      "px-8 py-4 rounded-full font-bold text-sm tracking-wide transition-all w-full sm:w-auto min-w-[200px]",
                      isFanClubMember 
                        ? "bg-muted text-foreground cursor-default" 
                        : "bg-foreground text-background hover:opacity-90 shadow-lg"
                    )}
                  >
                    {isJoining ? 'Processing...' : isFanClubMember ? 'Member' : 'Join Club - 5 TON/mo'}
                  </button>
                </div>
              </div>
            </TabsContent>

            {/* FAN TOKENS */}
            <TabsContent value="tokens" className="m-0 focus-visible:outline-none">
              <div className="mt-8">
                <FanTokenHub artist={artist} />
              </div>
            </TabsContent>

            {/* FAN POWER */}
            <TabsContent value="fan_power" className="m-0 focus-visible:outline-none">
              <div className="mt-8">
                {artist && <FanPowerTracker artist={artist} />}
              </div>
            </TabsContent>

            {/* EVENTS */}
            <TabsContent value="events" className="m-0 focus-visible:outline-none">
              <div className="space-y-8 animate-in fade-in">
                <h3 className="text-2xl font-bold tracking-tight mb-6">Upcoming Events</h3>
                {artist.events && artist.events.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {artist.events.map(event => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No upcoming events.</p>
                )}
              </div>
            </TabsContent>

            {/* ABOUT */}
            <TabsContent value="about" className="m-0 focus-visible:outline-none">
              <div className="max-w-3xl space-y-12 animate-in fade-in">
                <section>
                  <h3 className="text-2xl font-bold tracking-tight mb-4">Bio</h3>
                  <p className="text-muted-foreground text-base leading-relaxed whitespace-pre-wrap">
                    {artist.bio || "No information provided."}
                  </p>
                </section>
                
                <section className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-border">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</span>
                    <p className="font-medium text-base">{artist.location || 'Unknown'}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Genre</span>
                    <p className="font-medium text-base">{artist.genre || 'Electronic'}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</span>
                    <p className="font-medium text-base">Mar 2024</p>
                  </div>
                </section>
              </div>
            </TabsContent>

          </div>
        </Tabs>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showTipModal && artist && (
          <TipArtistModal artist={artist} onClose={() => setShowTipModal(false)} />
        )}
        {showEditModal && (
          <EditArtistProfileModal artist={artist} onClose={() => setShowEditModal(false)} />
        )}
        {showArtistOptions && artist && (
          <ArtistOptionsModal artist={artist} onClose={() => setShowArtistOptions(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArtistProfile;
