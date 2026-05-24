import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Heart, 
  MessageCircle, 
  Share2, 
  Plus, 
  UserPlus, 
  UserCheck, 
  Edit2, 
  MoreVertical,
  Activity,
  Disc,
  Info,
  Clock,
  TrendingUp,
  Award,
  Music,
  LayoutGrid,
  Send,
  Satellite,
  Search,
  ChevronRight,
  ShieldCheck,
  Dna,
  Zap,
  MapPin,
  Ticket,
  Calendar,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { 
  Avatar,
  AvatarImage,
  AvatarFallback
} from "@/components/ui/avatar";
import ArtistProfileHeader from '@/components/ArtistProfileHeader';
import TrackCard from '@/components/TrackCard';
import NFTCard from '@/components/NFTCard';
import ArtistTracksSection from '@/components/ArtistTracksSection';
import ArtistActivitySection from '@/components/ArtistActivitySection';
import { MOCK_ARTISTS, MOCK_TRACKS, MOCK_NFTS } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { useAudio } from '@/context/AudioContext';
import { Artist, Track, NFTItem } from '@/types';
import { getPlaceholderImage, cn } from '@/lib/utils';
import ArtistVerification from '@/components/ArtistVerification';
import CommentsSection from '@/components/CommentsSection';
import { CollaboratorManager } from '@/components/CollaboratorManager';
import EventCard from '@/components/EventCard';
import EditArtistProfileModal from '@/components/EditArtistProfileModal';
import TipArtistModal from '@/components/TipArtistModal';
import ArtistOptionsModal from '@/components/ArtistOptionsModal';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { subscribeToCommunity } from '@/services/fanEngagementService';
import { createActivityPost } from '@/services/socialService';
import SocialFeed from '@/components/SocialFeed';
import { toast } from 'sonner';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TabType = 'discography' | 'music_nfts' | 'collection' | 'signals' | 'fan_club' | 'events' | 'about' | 'collaborations' | 'comments';

const ArtistProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userProfile: authProfile } = useAuth();
  const { addNotification, userProfile, posts: allPosts, setTrackToAddToPlaylist, playTrack, playAll, followedUserIds, toggleFollowUser, setHeaderTitle } = useAudio();
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
  const [trackFilter, setTrackFilter] = useState('All');
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


  // Real-time artist posts
  const artistSignals = useMemo(() => {
    return allPosts.filter(p => (p.userId === id || p.artistId === id || p.targetId === id) && (!p.isExclusive || isFanClubMember));
  }, [allPosts, id, isFanClubMember]);

  // Exclusive member content
  const exclusiveTracksList = useMemo(() => {
    if (!isFanClubMember) return [];
    return [
      {
        id: `exclusive-${id}-1`,
        title: "NEURAL SYNCH (UNRELEASED)",
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
    // Find artist from mock data or actual DB (re-implementing mock for now)
    const foundArtist = MOCK_ARTISTS.find(a => a.uid === id);
    if (foundArtist) {
      // Populate mock events if none exist
      const mockEvents = [
        {
          id: 'event-1',
          artistId: foundArtist.uid,
          title: 'Neural Sync Tour 2026',
          date: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
          time: '20:00 PST',
          venue: 'The Echo Chamber',
          location: 'Neo-Tokyo',
          ticketUrl: 'https://example.com/tickets'
        },
        {
          id: 'event-2',
          artistId: foundArtist.uid,
          title: 'Holographic Showcase',
          date: new Date(Date.now() + 86400000 * 15).toISOString(), // 15 days from now
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
      // ... rest of the state sets
      setArtistTracks(MOCK_TRACKS.filter(t => t.artistId === foundArtist.uid));
      // NFTs created by this artist (Catalog)
      setArtistNFTs(MOCK_NFTS.filter(n => n.creator === foundArtist.name));
      // NFTs owned by this artist (Collection)
      setOwnedNFTs(MOCK_NFTS.filter(n => n.owner === foundArtist.walletAddress && n.creator !== foundArtist.name));
    }
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    // Check if user is already a member
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
      addNotification("Please sign in to join the fan club", "error");
      return;
    }
    
    setIsJoining(true);
    try {
      await subscribeToCommunity(userProfile.uid, id);
      
      await createActivityPost(
        userProfile.uid,
        userProfile.name,
        userProfile.avatar,
        `just joined the elite fan club of`,
        'fan_club_join',
        {
          targetId: id,
          artistName: artist.name
        }
      );

      addNotification(`Welcome to the inner circle of ${artist.name}!`, 'success');
    } catch (error) {
      console.error('Error joining fan club:', error);
      addNotification('Could not join fan club. Try again.', 'error');
    } finally {
      setIsJoining(false);
    }
  };

  const isFollowing = followedUserIds?.includes(artist?.uid || "");
  
  // Get only top 3 tracks for the "Popular Anthems" section
  const topThreeTracks = useMemo(() => {
    return [...artistTracks]
      .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
      .slice(0, 3);
  }, [artistTracks]);

  const handleFollow = () => {
    if (artist?.uid) {
      toggleFollowUser(artist.uid);
      toast(isFollowing ? "Signal disconnected" : "Neural connection established");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Disc className="w-6 h-6 text-blue-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
        <Activity className="w-16 h-16 text-muted-foreground/30" />
        <div>
          <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter">Identity Not Found</h2>
          <p className="text-muted-foreground mt-2 font-medium">The specified artist profile does not exist in our neural network.</p>
        </div>
        <button 
          onClick={() => navigate('/discover')}
          className="px-8 py-3 bg-blue-500 text-white rounded-full font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
        >
          Return to Discover
        </button>
      </div>
    );
  }

  const isOwnProfile = user?.uid === artist.uid;

  return (
    <div className="w-full bg-background min-h-screen">
      {/* Cover Image Area */}
      <div className="relative h-[220px] sm:h-[280px] md:h-[360px] w-full">
        {/* Floating Custom Navigation Bar */}
        <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-white/90 hover:text-white transition-all border border-white/10 active:scale-95 flex items-center justify-center cursor-pointer shadow-lg"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-600/20 blur-[100px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-600/20 blur-[100px] rounded-full animate-pulse delay-700" />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent z-10"></div>
        <img 
          src={artist.bannerImageUrl || artist.bannerUrl || getPlaceholderImage(`cover-${artist.uid}`, 1500, 500)} 
          className="w-full h-full object-cover transition-transform duration-[3s] hover:scale-105" 
          alt="" 
        />
        
        {/* Quick Edit Banner Button (Self only) */}
        {isOwnProfile && (
          <button 
            onClick={() => setShowEditModal(true)}
            className="absolute top-4 right-4 z-30 p-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white/70 hover:text-white transition-all border border-white/10 group active:scale-95"
            title="Edit Banner"
          >
            <Edit2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          </button>
        )}
        
// Three dot menu button (Artist Options)
        <button 
                onClick={() => setShowArtistOptions(true)}
                className="absolute top-4 right-4 z-30 p-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white/90 hover:text-white transition-all border border-white/10 active:scale-95"
            >
                <MoreVertical className="w-4 h-4" />
        </button>

        {/* Artist Options Modal */}
        {showArtistOptions && artist && (
            <ArtistOptionsModal 
                artist={artist}
                onClose={() => setShowArtistOptions(false)}
            />
        )}

        {/* Follow/Tip buttons (middle right of cover) */}
        <div className="absolute top-1/2 right-6 z-30 flex flex-col gap-3 -translate-y-1/2 items-center">
             <button 
                onClick={handleFollow}
                className={cn(
                  "cursor-pointer transition-all px-6 py-2 rounded-lg border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center",
                  isFollowing 
                    ? "bg-muted text-foreground border-muted-foreground" 
                    : "bg-blue-500 text-white border-blue-600"
                )}
              >
                  {isFollowing ? <UserCheck className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />} {isFollowing ? 'Following' : 'Follow'}
             </button>
             <button 
                onClick={() => setShowTipModal(true)}
                className="p-3 rounded-full font-black text-[9px] uppercase tracking-widest border border-white/20 bg-black/50 backdrop-blur-md hover:bg-black/70 text-white transition-all active:scale-95"
              >
                <Zap className="w-4 h-4 text-blue-500 fill-current" />
             </button>
        </div>

        {/* Header Overlay - Positioned to center profile pic on bottom edge */}
        <div className="absolute bottom-0 left-0 w-full z-20 px-4 translate-y-1/2 sm:translate-y-1/2 sm:px-6 md:px-12 flex justify-start items-end gap-4 sm:gap-6">
          
          {/* Avatar (to the left side boundary line - dropping down half over) */}
          <div className="relative group/avatar">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-full" />
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-background shadow-2xl relative z-10 transition-transform duration-700 group-hover/avatar:scale-[1.02] bg-background">
              <AvatarImage src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} alt={artist.name} className="object-cover rounded-full" />
            </Avatar>
            {artist.verified && (
              <div className="absolute bottom-0 right-0 bg-background rounded-full p-0.5 shadow-xl z-20 border border-blue-500/20">
                <CheckCircle2 className="w-4 h-4 text-blue-500 fill-current" />
              </div>
            )}
          </div>

          <div className="max-w-7xl mx-auto flex flex-col gap-2 sm:gap-3 flex-1 pb-2">
              <ArtistProfileHeader 
                artist={artist} 
                onTip={() => setShowTipModal(true)}
                onEditProfile={() => setShowEditModal(true)}
                isOwnProfile={isOwnProfile}
              />
          </div>
        </div>

        {/* Subtle blue boundary line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500/50 z-10" />
        
        {/* Followers / Following Stats below boundary */}
        <div className="absolute bottom-[-30px] left-6 flex items-center gap-4 text-white text-[8px] font-black uppercase tracking-widest z-20">
            <button onClick={() => navigate(`/followers/${artist.uid}`)} className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                <span className="text-white">{(artist.followers || 0).toLocaleString()}</span>
                <span className="text-white/40 font-normal">Followers</span>
            </button>
            <button onClick={() => navigate(`/following/${artist.uid}`)} className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                <span className="text-white">{(0).toLocaleString()}</span>
                <span className="text-white/40 font-normal">Following</span>
            </button>
        </div>
      </div>
      
      {/* Name Section below cover - Refined Typography */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mt-12 relative z-30">
        <div className="flex flex-col gap-1">
            <h1 id="artist-name-display" className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-foreground dark:text-white leading-tight">
                    {artist.name}
            </h1>
            {artist.username && (
                <div className="text-blue-600 font-medium text-sm md:text-base tracking-normal">
                    @{artist.username.replace('@', '')}
                </div>
            )}
        </div>
      </div>
      
      {/* Biometric Identity / About Section - Adjusted margin for better overlap */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mt-12 sm:mt-16 md:mt-20 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <Accordion type="single" collapsible className="bg-muted/30 rounded-[24px] px-6 border-none">
              <AccordionItem value="about" className="border-none">
                <AccordionTrigger className="hover:no-underline py-5">
                  <div className="flex items-center gap-2">
                      <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                      <h3 className="text-lg font-black text-foreground uppercase tracking-tighter">About</h3>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-5">
                  <p className="text-muted-foreground text-xs leading-relaxed tracking-tight font-medium max-w-2xl">
                    {artist.bio || "No narrative provided for this entity."}
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-4 border-t border-border">
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em]">Origin</span>
                      <p className="text-[10px] font-black text-foreground uppercase">{artist.location || 'Global'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em]">Genre</span>
                      <p className="text-[10px] font-black text-blue-500 uppercase">{artist.genre || 'Electronic'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em]">Verified</span>
                      <div className="pt-0.5">
                        <ArtistVerification artist={artist} />
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="space-y-3">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[20px] p-4 flex flex-col items-center justify-center text-center text-white border-none shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-90">Followers</span>
              <div className="text-2xl font-bold tracking-tight">
                {(artist.followers || 0).toLocaleString()}
              </div>
            </Card>
            
            <Card className="bg-background border border-border/50 rounded-[20px] p-4 flex flex-col items-center justify-center text-center text-foreground shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-90">Plays</span>
              <div className="text-2xl font-bold tracking-tight">
                {(artist.playCount || 0).toLocaleString()}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Dedicated Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mt-8 space-y-16 sm:space-y-20">
            {artist.events && artist.events.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                  <h3 className="text-lg font-black text-foreground uppercase tracking-tighter">Upcoming Sequences</h3>
                </div>
                <div className="flex flex-col gap-2">
                  {artist.events.slice(0, 3).map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-5 bg-amber-500 rounded-full"></div>
                <h3 className="text-lg font-black text-foreground uppercase tracking-tighter">Minted Artifacts</h3>
              </div>
              <div className="flex flex-col gap-2">
                {artistNFTs.slice(0, 3).map((nft) => (
                  <NFTCard key={nft.id} nft={nft} variant="row" />
                ))}
              </div>
            </section>

            <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                  <h3 className="text-lg font-black text-foreground uppercase tracking-tighter">Discography</h3>
                </div>
                <ArtistTracksSection 
                  artist={artist}
                  artistTracks={artistTracks}
                  isOwnProfile={isOwnProfile}
                  playAll={playAll}
                  topTracks={artistTracks.slice(0, 3)}
                  trackFilter={trackFilter}
                  setTrackFilter={setTrackFilter}
                />
            </section>
            <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                  <h3 className="text-lg font-black text-foreground uppercase tracking-tighter">Activity</h3>
                </div>
                <ArtistActivitySection artistPosts={artistSignals} />
            </section>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 md:px-12 space-y-12 sm:space-y-16 relative">
        
        {/* Profile Refinement Suggestion (Only for own profile) */}
        {isOwnProfile && (!artist.bio || !artist.socials?.x || !artist.username || (!artist.bannerUrl && !artist.bannerImageUrl) || artist.verificationStatus === 'unverified' || !artist.verified) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-blue-500/10 rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <TrendingUp className="w-48 h-48" />
            </div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">Boost Your Signal</h3>
                <p className="text-muted-foreground text-sm font-medium mt-1">
                  {artist.verificationStatus === 'unverified' || !artist.verified 
                    ? "Your identity is not yet verified on the protocol. Apply for verification to gain full signal trust."
                    : "Your profile has missing nodes. Complete your bio, banner image and social links to increase discoverability."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 relative z-10">
              {(artist.verificationStatus === 'unverified' || !artist.verified) && (
                <ArtistVerification artist={artist} />
              )}
              <button 
                onClick={() => setShowEditModal(true)}
                className="px-8 py-3 bg-white text-black rounded-full font-black uppercase text-xs tracking-widest hover:bg-white/90 transition-all shadow-xl active:scale-95 whitespace-nowrap"
              >
                Refine Profile
              </button>
            </div>
          </motion.div>
        )}
        
        {/* Navigation Tabs */}
        <Tabs defaultValue="discography" value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="w-full">
          <div className="sticky top-0 z-30 mb-6 sm:mb-12">
            <div className="bg-background/80 backdrop-blur-2xl py-4 border-b border-border/40">
              <TabsList className="bg-transparent h-auto p-0 flex flex-nowrap overflow-x-auto no-scrollbar gap-2 justify-start scroll-smooth -mx-4 px-4">
                {(['discography', 'music_nfts', 'collection', 'signals', 'fan_club', 'events', 'about', 'comments'] as TabType[]).map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap bg-white/5 hover:bg-white/10 text-muted-foreground data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_12px_rgba(37,99,235,0.2)] hover:text-foreground border-none shrink-0 cursor-pointer h-auto"
                  >
                    {tab.replace('_', ' ').replace('music nfts', 'NFTs')}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            <TabsContent value="events" className="m-0 focus-visible:outline-none">
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-10">
                  <div>
                    <h3 className="text-3xl font-black text-foreground tracking-tighter uppercase">Event Schedule</h3>
                    <p className="text-muted-foreground font-medium mt-1">Confirmed neural sync sessions and live manifestations.</p>
                  </div>
                </div>
                
                {artist.events && artist.events.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {artist.events.map(event => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted/30 rounded-[40px] p-24 flex flex-col items-center justify-center border border-dashed border-border/50 text-center">
                    <Calendar className="w-16 h-16 text-muted-foreground/20 mb-6" />
                    <h4 className="text-xl font-black text-foreground uppercase tracking-tighter">No Active Sequences</h4>
                    <p className="text-muted-foreground text-sm font-medium mt-2 max-w-xs">This artist hasn't scheduled any live manifestations yet.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="discography" className="m-0 focus-visible:outline-none">
              <div className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Core Metrics */}
                <section>
                  <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-10">
                    <div className="w-1.5 h-6 sm:h-8 bg-blue-500 rounded-full"></div>
                    <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter uppercase">Core Metrics</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
                    {[
                      { label: 'Network Reach', value: (artist.followers || 1200).toLocaleString() },
                      { label: 'Sonic Fluency', value: (artist.playCount || 25000).toLocaleString() },
                      { label: 'Artifacts', value: artistTracks.length.toString() },
                      { label: 'Market Cap', value: '~4.5K TON' }
                    ].map((metric) => (
                    <Card key={metric.label} className="bg-muted/30 border-border/50 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all p-3">
                        <CardContent className="p-0 flex flex-col items-center text-center">
                          <span className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest">{metric.label}</span>
                          <span className="text-xl font-black text-foreground tracking-tighter uppercase">{metric.value}</span>
                        </CardContent>
                    </Card>
                    ))}
                  </div>
                </section>

              {/* Member Exclusive Transmissions */}
              {isFanClubMember && exclusiveTracksList.length > 0 && (
                <section className="animate-in fade-in slide-in-from-left-4 duration-700">
                  <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-10">
                    <div className="w-1.5 h-6 sm:h-8 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                    <h3 className="text-xl sm:text-2xl font-black text-blue-500 tracking-tighter uppercase flex items-center gap-3">
                      <Zap className="w-6 h-6" />
                      Member Exclusive Transmissions
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {exclusiveTracksList.map(track => (
                      <TrackCard key={track.id} track={track} className="bg-blue-500/5 hover:bg-blue-500/10" />
                    ))}
                  </div>
                </section>
              )}

              {/* Popular Anthems */}
              <section>
                <div className="flex items-center justify-between mb-8 sm:mb-12">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-8 bg-foreground rounded-full"></div>
                    <h3 className="text-xl sm:text-3xl font-black text-foreground tracking-tighter uppercase">Popular Anthems</h3>
                  </div>
                  <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline flex items-center gap-2 px-4 py-2 bg-blue-500/5 rounded-full border border-blue-500/10">
                    View All <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  {topThreeTracks.map((track, idx) => (
                    <motion.div 
                      key={track.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group flex items-center gap-4 sm:gap-8 p-3 sm:p-5 rounded-[24px] sm:rounded-[32px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer relative overflow-hidden"
                      onClick={() => playTrack(track)}
                    >
                      {/* Hover Glow */}
                      <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <span className="w-8 sm:w-10 text-center text-xs sm:text-sm font-black text-white/10 uppercase group-hover:text-blue-500 transition-colors relative z-10">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      
                      <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[24px] overflow-hidden shadow-2xl flex-shrink-0 z-10">
                        <img src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center backdrop-blur-[1px] group-hover:backdrop-blur-[2px]">
                          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-blue-500/80 flex items-center justify-center scale-75 group-hover:scale-100 transition-transform shadow-lg">
                            <Play className="w-4 h-4 sm:w-6 sm:h-6 text-white fill-current translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0 z-10">
                        <h4 className="text-base sm:text-xl font-black text-white truncate tracking-tight uppercase group-hover:text-blue-400 transition-colors leading-tight">{track.title}</h4>
                        <div className="flex items-center gap-3 sm:gap-4 mt-1.5">
                          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{track.genre || 'Electro'}</span>
                          <div className="w-1 h-1 rounded-full bg-white/10" />
                          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-1.5">
                            <Activity className="w-3 h-3" /> {(track.playCount || 0).toLocaleString()}
                          </span>
                          {track.isNFT && (
                            <Badge className="bg-blue-500/20 text-blue-500 text-[8px] border-blue-500/20 px-2 py-0">NFT</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="hidden md:flex items-center gap-12 mr-8 z-10">
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-black text-white/60 uppercase">{track.duration || '3:45'}</span>
                          <span className="text-[8px] font-black text-white/10 uppercase tracking-widest mt-1">Duration</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 sm:gap-6 z-10">
                        <button className="p-3 rounded-full hover:bg-white/10 text-white/20 hover:text-red-500 transition-all">
                          <Heart className="h-5 w-5" />
                        </button>
                        <button className="p-3 rounded-full hover:bg-white/10 text-white/20 hover:text-white transition-all hidden sm:block">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Music NFT Highlights */}
              {artistNFTs.length > 0 && (
                <section>
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-12 bg-amber-500 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)]"></div>
                      <div>
                        <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tighter uppercase">Minted Artifacts</h3>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Authenticated on TON Protocol</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('music_nfts')}
                      className="px-8 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 backdrop-blur-md"
                    >
                      Explore Catalog <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
                    {artistNFTs.slice(0, 3).map((nft, idx) => (
                      <motion.div 
                        key={nft.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.15 }}
                      >
                        <NFTCard nft={nft} />
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Full Discography Grid */}
              <section>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-1.5 h-8 bg-amber-500 rounded-full"></div>
                  <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase">Complete Artifacts</h3>
                </div>
                <div className="flex flex-col rounded-xl overflow-hidden bg-muted/5">
                  {artistTracks.map((track, index) => (
                    <TrackCard key={track.id} track={track} variant="row" index={index} />
                  ))}
                </div>
              </section>
            </div>
          </TabsContent>

            <TabsContent value="music_nfts" className="m-0 focus-visible:outline-none">
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-10">
                  <div>
                    <h3 className="text-3xl font-black text-foreground tracking-tighter uppercase">Music NFT Catalog</h3>
                    <p className="text-muted-foreground font-medium mt-1">Unique audio artifacts minted on the TON blockchain.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-500/10 px-6 py-3 rounded-full border border-blue-500/20 shadow-xl">
                      <span className="text-xs font-black text-blue-500 uppercase tracking-widest">{artistNFTs.length} Released Artifacts</span>
                    </div>
                  </div>
                </div>
                
                {artistNFTs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
                    {artistNFTs.map(nft => (
                      <NFTCard key={nft.id} nft={nft} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted/30 rounded-[32px] p-20 flex flex-col items-center justify-center border border-dashed border-border/50 text-muted-foreground/30">
                    <Music className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">No minted artifacts detected</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="collection" className="m-0 focus-visible:outline-none">
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-10">
                  <div>
                    <h3 className="text-3xl font-black text-foreground tracking-tighter uppercase">Curated Collection</h3>
                    <p className="text-muted-foreground font-medium mt-1">Artifacts acquired by this entity from other creators.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-purple-500/10 px-6 py-3 rounded-full border border-purple-500/20 shadow-xl">
                      <span className="text-xs font-black text-purple-500 uppercase tracking-widest">{ownedNFTs.length} Collected Entities</span>
                    </div>
                  </div>
                </div>

                {ownedNFTs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {ownedNFTs.map(nft => (
                      <NFTCard key={nft.id} nft={nft} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted/30 rounded-[40px] p-24 flex flex-col items-center justify-center border border-dashed border-border/50 text-center">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                      <LayoutGrid className="w-10 h-10 text-muted-foreground/20" />
                    </div>
                    <h4 className="text-xl font-black text-foreground uppercase tracking-tighter">Collection Empty</h4>
                    <p className="text-muted-foreground text-sm font-medium mt-2 max-w-xs">This artist hasn't collected any artifacts from the network yet.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="comments" className="m-0 focus-visible:outline-none">
              <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <CommentsSection targetId={id!} targetType="artist" />
              </div>
            </TabsContent>

            <TabsContent value="signals" className="m-0 focus-visible:outline-none">
              <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase mb-10 text-center">Transmission Stream</h3>
                <SocialFeed posts={artistSignals} emptyMessage="No active signals detected in this sector" />
              </div>
            </TabsContent>

            <TabsContent value="fan_club" className="m-0 focus-visible:outline-none">
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-10">
                  <div>
                    <h3 className="text-3xl font-black text-foreground tracking-tighter uppercase">Artist Fan Club</h3>
                    <p className="text-muted-foreground font-medium mt-1">Exclusive access for the most dedicated supporters.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-600/10 px-6 py-3 rounded-full border border-blue-600/20 shadow-xl">
                      <span className="text-xs font-black text-blue-500 uppercase tracking-widest">342 Members</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Benefits Card */}
                  <div className="bg-white/[0.03] border border-white/5 rounded-[40px] p-10 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                      <Award className="w-64 h-64" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Ascension Status</h4>
                      <p className="text-white/40 text-sm font-medium leading-relaxed">
                        Unlock the full potential of your connection with {artist.name}. Membership provides direct access to the artist's inner circle.
                      </p>
                    </div>

                    <ul className="space-y-6">
                      {[
                        { icon: Disc, text: 'Early access to all new artifact transmissions' },
                        { icon: MessageCircle, text: 'Priority access in the Transmission Stream' },
                        { icon: LayoutGrid, text: 'Exclusive NFT drops and sonic artifacts' },
                        { icon: ShieldCheck, text: 'Special badge in the TonJam network' }
                      ].map((benefit, i) => (
                        <li key={i} className="flex items-center gap-4 group/item">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover/item:bg-blue-500 group-hover/item:border-blue-500 transition-all duration-300">
                            <benefit.icon className="w-5 h-5 text-blue-500 group-hover/item:text-white transition-colors" />
                          </div>
                          <span className="text-sm font-black text-white/70 uppercase group-hover/item:text-white transition-colors">{benefit.text}</span>
                        </li>
                      ))}
                    </ul>

                    <button 
                      onClick={handleJoinFanClub}
                      disabled={isJoining || isFanClubMember}
                      className={cn(
                        "w-full py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2",
                        isFanClubMember 
                          ? "bg-green-600/20 text-green-500 border border-green-600/30 cursor-default shadow-none" 
                          : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.3)]"
                      )}
                    >
                      {isJoining ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : isFanClubMember ? (
                        <>
                          <UserCheck className="w-4 h-4" />
                          INNER CIRCLE MEMBER
                        </>
                      ) : (
                        `JOIN THE INNER CIRCLE (5 TON / MO)`
                      )}
                    </button>
                  </div>

                  {/* Exclusive Content Preview */}
                  <div className="space-y-6">
                    <h4 className="text-xl font-black text-white uppercase tracking-tighter px-4">
                      {isFanClubMember ? 'Exclusive Transmissions' : 'Locked Artifacts'}
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      {isFanClubMember ? (
                        exclusiveTracksList.map((track) => (
                          <div 
                            key={track.id} 
                            className="p-4 rounded-2xl bg-blue-500/5 flex items-center justify-between group hover:bg-blue-500/10 transition-all cursor-pointer"
                            onClick={() => setTrackToAddToPlaylist(track)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 relative rounded-lg overflow-hidden">
                                <img src={track.coverUrl} className="w-full h-full object-cover" alt="" />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Play className="w-5 h-5 text-white fill-current" />
                                </div>
                              </div>
                              <div>
                                <h5 className="text-sm font-black text-white uppercase tracking-tight">{track.title}</h5>
                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">Exclusive Artifact</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Zap className="w-4 h-4 text-blue-500" />
                              <ChevronRight className="w-4 h-4 text-white/20" />
                            </div>
                          </div>
                        ))
                      ) : (
                        [1, 2, 3].map((i) => (
                          <div key={i} className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5 flex items-center justify-between group blur-[2px] hover:blur-0 transition-all grayscale hover:grayscale-0">
                            <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-muted rounded-[20px] flex items-center justify-center opacity-40">
                                <Disc className="w-8 h-8" />
                              </div>
                              <div>
                                <div className="h-4 w-32 bg-white/10 rounded-full mb-3" />
                                <div className="h-2 w-20 bg-white/5 rounded-full" />
                              </div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-full">
                              <LayoutGrid className="w-5 h-5 text-white/20" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {!isFanClubMember && (
                      <div className="text-center p-8 bg-blue-500/5 rounded-[40px]">
                        <p className="text-[10px] font-black uppercase text-blue-500/60 tracking-widest leading-relaxed">
                          THIS DATA IS PROTECTED BY THE INNER CIRCLE ENCRYPTION. <br/>
                          JOIN TO UNLOCK THE FULL TRANSMISSION.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="about" className="m-0 focus-visible:outline-none">
              <div className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <section>
                  <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter uppercase mb-6 sm:mb-10 text-center md:text-left">Historical Record</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 bg-muted/30 rounded-2xl sm:rounded-[40px] p-6 sm:p-12 border border-border/50 backdrop-blur-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                        <Info className="w-64 h-64 rotate-12" />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-12 pb-6 sm:pb-12 border-b border-border/50 relative z-10">
                        <div className="space-y-1 sm:space-y-2">
                          <p className="text-[8px] sm:text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Territory</p>
                          <p className="text-sm sm:text-base font-black text-foreground uppercase">{artist.location || 'Distributed'}</p>
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <p className="text-[8px] sm:text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Deployment</p>
                          <p className="text-sm sm:text-base font-black text-foreground uppercase">March 2024</p>
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <p className="text-[8px] sm:text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Sonic Class</p>
                          <p className="text-sm sm:text-base font-black text-foreground uppercase">{artist.genre || 'Electronic'}</p>
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <p className="text-[8px] sm:text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Protocol</p>
                          <p className="text-sm sm:text-base font-black text-blue-500 uppercase">Verified</p>
                        </div>
                      </div>
                    </div>

                    {/* Top Supporters Column */}
                    <div className="space-y-8">
                      <h4 className="text-lg font-black text-foreground uppercase tracking-tighter px-4">Elite Supporters</h4>
                      <div className="space-y-4">
                        {[
                          { name: 'vocal_nebula', contribution: '1,240', badge: 'Gold' },
                          { name: 'deep_node', contribution: '890', badge: 'Silver' },
                          { name: 'synth_weaver', contribution: '450', badge: 'Bronze' }
                        ].map((supporter, i) => (
                          <div key={i} className="flex items-center justify-between p-5 rounded-[28px] bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all cursor-pointer group">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-muted border border-white/10" />
                              <div>
                                <p className="text-xs font-black text-white uppercase">{supporter.name}</p>
                                <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest">{supporter.badge} Patron</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-black text-white tracking-tighter">{supporter.contribution} TON</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" className="w-full py-6 rounded-full text-[10px] font-black uppercase text-white/40 tracking-widest transition-all bg-white/5 hover:bg-white/10 border-white/5">
                        VIEW ALL SUPPORTERS
                      </Button>
                    </div>
                  </div>
                </section>

                {/* Network Stats */}
                <section className="bg-muted/30 rounded-2xl sm:rounded-[32px] p-6 sm:p-10 border border-border/50 overflow-hidden relative">
                  <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="w-1.5 h-6 sm:h-8 bg-purple-500 rounded-full"></div>
                    <h2 className="text-[10px] sm:text-sm font-black text-foreground uppercase tracking-[0.2em] sm:tracking-[0.3em]">Network Schematics</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    {[
                      { label: 'Sonic Class', value: artist.genre },
                      { label: 'Verification', value: 'TON L2' },
                      { label: 'Origins', value: artist.location || 'Unknown' },
                      { label: 'Neural Status', value: 'Active' }
                    ].map(stat => (
                      <div key={`stat-${stat.label}`} className="p-4 sm:p-6 bg-background/50 rounded-xl sm:rounded-[24px] border border-border/30 hover:border-purple-500/30 transition-all group">
                        <div className="text-[7px] sm:text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1 sm:mb-2 group-hover:text-purple-500 transition-colors">{stat.label}</div>
                        <div className="text-xs sm:text-base font-black text-foreground uppercase">{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Events */}
                {artist.events && artist.events.length > 0 && (
                  <div className="space-y-10">
                    <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase">Upcoming Transmissions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {artist.events.map((event, idx) => (
                        <div key={idx} className="bg-muted/30 rounded-[32px] p-8 border border-border/50 hover:bg-muted/50 transition-all group flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-6">
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[8px] font-black uppercase tracking-widest">
                                Live Signal
                              </Badge>
                              <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest text-right">
                                {new Date(event.date).toLocaleDateString()} • {event.time}
                              </span>
                            </div>
                            <h4 className="text-xl font-black text-foreground tracking-tighter uppercase group-hover:text-blue-500 transition-colors">{event.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3 uppercase tracking-wide font-bold">
                              <MapPin className="w-4 h-4" />
                              <span>{event.venue}, {event.location}</span>
                            </div>
                          </div>
                          {event.ticketUrl && (
                            <a 
                              href={event.ticketUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="mt-6 flex items-center justify-center gap-2 bg-blue-500/10 text-blue-500 border border-blue-500/30 rounded-full px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all w-fit"
                            >
                              <Ticket className="w-4 h-4" />
                              Get Tickets
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="collaborations" className="m-0 focus-visible:outline-none">
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <CollaboratorManager 
                  initialCollaborators={artist.collaborations?.map((c, i) => ({
                    id: c.id,
                    name: c.artistName,
                    role: i % 2 === 0 ? 'Producer' : 'Vocalist',
                    royalty: 10 + i * 5,
                    address: ''
                  }))}
                />
              </section>
            </TabsContent>
          </div>
        </Tabs>
      </div>
      {/* Tip Modal */}
      <AnimatePresence>
        {showTipModal && artist && (
          <TipArtistModal 
            artist={artist} 
            onClose={() => setShowTipModal(false)} 
          />
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <EditArtistProfileModal 
            artist={artist} 
            onClose={() => setShowEditModal(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArtistProfile;
