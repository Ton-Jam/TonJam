import * as React from 'react';
import { useState, useEffect } from 'react';
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
  Dna
} from 'lucide-react';
import ArtistProfileHeader from '@/components/ArtistProfileHeader';
import TrackCard from '@/components/TrackCard';
import NFTCard from '@/components/NFTCard';
import { MOCK_ARTISTS, MOCK_TRACKS, MOCK_NFTS } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { Artist, Track, NFTItem } from '@/types';
import { getPlaceholderImage, cn } from '@/lib/utils';
import ArtistVerification from '@/components/ArtistVerification';
import EditArtistProfileModal from '@/components/EditArtistProfileModal';
import { toast } from 'sonner';

type TabType = 'discography' | 'collection' | 'signals' | 'about' | 'collaborations';

const ArtistProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('discography');
  const [isFollowing, setIsFollowing] = useState(false);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [artistTracks, setArtistTracks] = useState<Track[]>([]);
  const [artistNFTs, setArtistNFTs] = useState<NFTItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  // Mock signals/posts for the artist
  const artistPosts = [
    {
      id: 'post-1',
      content: "Just finished a new modular synth session. The frequencies are hitting different today. Can't wait for you all to hear this neural-synch transmission. 🌊",
      timestamp: '2 hours ago',
      likes: 124,
      comments: 12,
      imageUrl: artist?.bannerUrl || getPlaceholderImage('post-1')
    },
    {
      id: 'post-2',
      content: "Limited Edition Genesis NFT drops in 24 hours. Pre-synch enabled for top holders. Ready to forge? 🦾",
      timestamp: '1 day ago',
      likes: 456,
      comments: 89,
    }
  ];

  useEffect(() => {
    // Find artist from mock data or actual DB (re-implementing mock for now)
    const foundArtist = MOCK_ARTISTS.find(a => a.uid === id);
    if (foundArtist) {
      setArtist(foundArtist);
      setArtistTracks(MOCK_TRACKS.filter(t => t.artistId === foundArtist.uid));
      setArtistNFTs(MOCK_NFTS.filter(n => n.creator === foundArtist.name));
    }
    setIsLoading(false);
  }, [id]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast(isFollowing ? "Signal disconnected" : "Neural connection established");
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
          <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter italic">Identity Not Found</h2>
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
      {/* Cover Image */}
      <div className="relative h-[300px] md:h-[450px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
        <img 
          src={artist.bannerUrl || getPlaceholderImage(`cover-${artist.uid}`)} 
          className="w-full h-full object-cover" 
          alt="" 
        />
        
        {/* Header Overlay */}
        <div className="absolute bottom-0 left-0 w-full z-20 px-6 pb-6 md:px-12 md:pb-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-10">
            <ArtistProfileHeader 
              artist={artist} 
              onTip={() => toast("Tip protocol initialized")}
              onEditProfile={() => setShowEditModal(true)}
              isOwnProfile={isOwnProfile}
            />
            
            {/* Contextual Actions */}
            <div className="flex items-center gap-4 mb-4">
              {!isOwnProfile && (
                <button 
                  onClick={handleFollow}
                  className={cn(
                    "px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-2xl flex items-center gap-2 active:scale-95",
                    isFollowing 
                      ? "bg-muted text-muted-foreground border border-border" 
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  )}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="h-4 w-4" />
                      Synchronized
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Synchronize
                    </>
                  )}
                </button>
              )}
              
              <button 
                className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all shadow-xl active:scale-90"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:px-12 space-y-20 relative">
        
        {/* Profile Refinement Suggestion (Only for own profile) */}
        {isOwnProfile && (!artist.bio || !artist.socials?.x || !artist.username) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-blue-500/10 border border-blue-500/20 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <TrendingUp className="w-48 h-48" />
            </div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground uppercase tracking-tighter italic">Boost Your Signal</h3>
                <p className="text-muted-foreground text-sm font-medium mt-1">Your profile has missing nodes. Complete your bio and social links to increase discoverability.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowEditModal(true)}
              className="px-8 py-3 bg-blue-500 text-white rounded-full font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95 whitespace-nowrap relative z-10"
            >
              Refine Profile
            </button>
          </motion.div>
        )}
        
        {/* Navigation Tabs */}
        <div className="sticky top-[72px] z-30 mb-20">
          <div className="flex items-center gap-2 p-1.5 bg-muted/40 backdrop-blur-2xl rounded-full border border-border/50 w-fit mx-auto lg:mx-0 overflow-x-auto no-scrollbar shadow-2xl">
            {(['discography', 'collection', 'signals', 'about', 'collaborations'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
                  activeTab === tab 
                    ? "text-white" 
                    : "text-muted-foreground/60 hover:text-foreground"
                )}
              >
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTabArtist"
                    className="absolute inset-0 bg-blue-500 rounded-full shadow-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'discography' && (
            <div className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Core Metrics */}
              <section>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-1.5 h-8 bg-blue-500 rounded-full"></div>
                  <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase italic">Core Metrics</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { label: 'Network Reach', value: (artist.followers || 1200).toLocaleString(), color: 'blue' },
                    { label: 'Sonic Fluency', value: (artist.playCount || 25000).toLocaleString(), color: 'purple' },
                    { label: 'Artifacts', value: artistTracks.length.toString(), color: 'amber' },
                    { label: 'Market Cap', value: '~4.5K TON', color: 'pink' }
                  ].map((metric) => (
                    <div key={metric.label} className="bg-muted/30 rounded-[32px] p-8 border border-border/50 flex flex-col items-center text-center group hover:border-blue-500/30 transition-all">
                      <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mb-4 group-hover:text-blue-500 transition-colors">{metric.label}</p>
                      <p className="text-4xl font-black text-foreground tracking-tighter italic">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Popular Anthems */}
              <section>
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase italic">Popular Anthems</h3>
                  <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline flex items-center gap-2">
                    View Complete Stream <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-4">
                  {artistTracks.slice(0, 5).map((track, idx) => (
                    <div key={track.id} className="group flex items-center gap-6 p-4 rounded-[28px] bg-muted/30 border border-border/50 hover:bg-muted/80 transition-all hover:scale-[1.02] active:scale-[0.99] cursor-pointer">
                      <span className="w-8 text-center text-xs font-black text-muted-foreground/30 uppercase italic group-hover:text-blue-500 transition-colors">0{idx + 1}</span>
                      <div className="relative w-16 h-16 rounded-[18px] overflow-hidden shadow-2xl">
                        <img src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-6 h-6 text-white fill-current" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-black text-foreground truncate tracking-tight uppercase italic">{track.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">{track.genre || 'Electro'}</span>
                          {track.isNFT && <span className="bg-blue-500/10 text-blue-500 text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-blue-500/20">NFT</span>}
                        </div>
                      </div>
                      <div className="hidden md:flex flex-col items-end mr-8">
                        <span className="text-sm font-black text-foreground/80 tracking-tighter uppercase italic">{(track.playCount || Math.floor(Math.random() * 1000)).toLocaleString()} Plays</span>
                        <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest mt-1">Stream Frequency</span>
                      </div>
                      <div className="flex items-center gap-10">
                        <span className="text-xs font-black text-muted-foreground/60 uppercase italic">{track.duration || '3:45'}</span>
                        <button className="text-muted-foreground/30 hover:text-red-500 transition-colors">
                          <Heart className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Full Discography Grid */}
              <section>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-1.5 h-8 bg-amber-500 rounded-full"></div>
                  <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase italic">Complete Artifacts</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {artistTracks.map(track => (
                    <TrackCard key={track.id} track={track} variant="default" />
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'collection' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase italic">Digital Collectibles</h3>
                <div className="bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{artistNFTs.length} Unique Entities</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
                {artistNFTs.map(nft => (
                  <NFTCard key={nft.id} nft={nft} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'signals' && (
            <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase italic mb-10 text-center">Transmission Stream</h3>
              {artistPosts.length > 0 ? artistPosts.map(post => (
                <div key={post.id} className="bg-muted/30 rounded-[32px] p-10 border border-border/50 backdrop-blur-sm space-y-8 relative overflow-hidden group mb-10">
                  <div className="absolute top-0 left-0 w-1 h-20 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <img src={artist.avatarUrl} className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-500/20 shadow-xl" alt=""/>
                      <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-background">
                        <Send className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-foreground uppercase tracking-tight italic">{artist.name}</h4>
                      <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mt-0.5">{post.timestamp}</p>
                    </div>
                  </div>
                  <p className="text-base leading-relaxed text-foreground/80 font-medium">{post.content}</p>
                  {post.imageUrl && (
                    <div className="rounded-[24px] overflow-hidden shadow-2xl border border-white/5">
                      <img src={post.imageUrl} className="w-full h-auto transition-transform duration-700 group-hover:scale-105" alt=""/>
                    </div>
                  )}
                  <div className="flex items-center gap-10 pt-8 border-t border-border/50">
                    <button className="flex items-center gap-2.5 text-[10px] font-black text-muted-foreground/60 hover:text-blue-500 transition-all group/btn">
                      <Heart className="h-4 w-4 group-hover/btn:fill-current transition-all"/> {post.likes}
                    </button>
                    <button className="flex items-center gap-2.5 text-[10px] font-black text-muted-foreground/60 hover:text-blue-500 transition-all">
                      <MessageCircle className="h-4 w-4"/> {post.comments}
                    </button>
                    <button className="flex items-center gap-2.5 text-[10px] font-black text-muted-foreground/60 hover:text-blue-500 transition-all ml-auto">
                      <Share2 className="h-4 w-4"/>
                    </button>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/30">
                  <Satellite className="w-12 h-12 mb-4 animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">No active signals detected</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <section>
                <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase italic mb-10">Historical Record</h3>
                <div className="bg-muted/30 rounded-[40px] p-12 border border-border/50 backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                    <Info className="w-64 h-64 rotate-12" />
                  </div>
                  <p className="text-lg leading-relaxed text-muted-foreground font-medium italic mb-12 relative z-10">
                    "{artist.bio || "Biographical data transmission pending verification."}"
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pt-12 border-t border-border/50 relative z-10">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Territory</p>
                      <p className="text-base font-black text-foreground uppercase italic">{artist.location || 'Distributed Network'}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Deployment</p>
                      <p className="text-base font-black text-foreground uppercase italic">March 2024</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Sonic Class</p>
                      <p className="text-base font-black text-foreground uppercase italic">{artist.genre || 'Electronic'}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Protocol</p>
                      <p className="text-base font-black text-blue-500 uppercase italic">Verified</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Network Stats */}
              <section className="bg-muted/30 rounded-[32px] p-10 border border-border/50 overflow-hidden relative">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-1.5 h-8 bg-purple-500 rounded-full"></div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-[0.3em] italic">Network Schematics</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Sonic Class', value: artist.genre },
                    { label: 'Verification', value: 'TON L2' },
                    { label: 'Origins', value: artist.location || 'Unknown' },
                    { label: 'Neural Status', value: 'Active' }
                  ].map(stat => (
                    <div key={`stat-${stat.label}`} className="p-6 bg-background/50 rounded-[24px] border border-border/30 hover:border-purple-500/30 transition-all group">
                      <div className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest mb-2 group-hover:text-purple-500 transition-colors">{stat.label}</div>
                      <div className="text-base font-black text-foreground uppercase italic">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Events */}
              {artist.events && artist.events.length > 0 && (
                <div className="space-y-10">
                  <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase italic">Upcoming Transmissions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {artist.events.map((event, idx) => (
                      <div key={idx} className="bg-muted/30 rounded-[32px] p-8 border border-border/50 hover:bg-muted/50 transition-all cursor-pointer group">
                        <div className="flex items-center justify-between mb-6">
                          <div className="bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                            <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Live Signal</span>
                          </div>
                          <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">{event.date}</span>
                        </div>
                        <h4 className="text-xl font-black text-foreground tracking-tighter uppercase italic group-hover:text-blue-500 transition-colors">{event.title}</h4>
                        <p className="text-sm text-muted-foreground mt-2 uppercase tracking-wide font-bold">{event.location}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'collaborations' && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase italic">Joint Operations</h3>
                <div className="flex items-center gap-3 bg-pink-500/10 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">{artist.collaborations?.length || 0} Synchs</span>
                </div>
              </div>
              {artist.collaborations && artist.collaborations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {artist.collaborations.map(collab => (
                    <div key={collab.id} className="group p-5 rounded-[28px] bg-muted/30 border border-border/50 flex items-center gap-6 hover:bg-muted transition-all hover:-translate-y-1">
                      <div className="relative w-16 h-16 rounded-[18px] overflow-hidden shadow-2xl flex-shrink-0">
                        <img src={collab.coverUrl} alt={collab.trackTitle} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                        <div className="absolute inset-0 bg-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base font-black text-foreground truncate tracking-tight uppercase italic">{collab.trackTitle}</h4>
                        <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mt-1">w/ <span className="text-pink-500">{collab.artistName}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted/30 rounded-[32px] p-20 flex flex-col items-center justify-center border border-dashed border-border/50 text-muted-foreground/30">
                  <Dna className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">No synch records found</p>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
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
