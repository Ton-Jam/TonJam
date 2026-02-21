import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_ARTISTS, MOCK_TRACKS, MOCK_NFTS, MOCK_POSTS, TON_LOGO } from '../constants';
import TrackCard from '../components/TrackCard';
import NFTCard from '../components/NFTCard';
import PostCard from '../components/PostCard';
import { useAudio } from '../context/AudioContext';
import { Artist, Track, Post } from '../types';
import { getArtistSonicDNA, findRelatedArtists } from '../services/geminiService';

const ArtistProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification, playAll, currentTrack, isPlaying, followedUserIds, toggleFollowUser } = useAudio();
  const [activeTab, setActiveTab] = useState<'tracks' | 'nfts' | 'signals' | 'about'>('tracks');
  
  const isFollowing = useMemo(() => id ? followedUserIds.includes(id) : false, [id, followedUserIds]);
  const [sonicDNA, setSonicDNA] = useState<{ signature: string, vibes: string[] } | null>(null);
  const [isDNAStreaming, setIsDNAStreaming] = useState(false);
  const [relatedArtists, setRelatedArtists] = useState<Artist[]>([]);
  const [isRelatedLoading, setIsRelatedLoading] = useState(false);
  const [customBanner, setCustomBanner] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const artist = useMemo(() => MOCK_ARTISTS.find(a => a.id === id), [id]);
  const artistTracks = useMemo(() => MOCK_TRACKS.filter(t => t.artistId === id), [id]);
  const artistNFTs = useMemo(() => MOCK_NFTS.filter(n => n.creator === artist?.name), [artist]);
  const artistPosts = useMemo(() => MOCK_POSTS.filter(p => p.userName === artist?.name), [artist]);

  const trendingTracks = useMemo(() => {
    return [...artistTracks]
      .sort((a, b) => {
        const scoreA = (a.playCount || 0) + (a.likes || 0) * 5;
        const scoreB = (b.playCount || 0) + (b.likes || 0) * 5;
        return scoreB - scoreA;
      })
      .slice(0, 3);
  }, [artistTracks]);

  const marketStats = useMemo(() => {
    if (!artistNFTs.length) return null;
    const prices = artistNFTs.map(n => parseFloat(n.price));
    return {
      floor: Math.min(...prices).toFixed(1),
      volume: prices.reduce((a, b) => a + b, 0).toFixed(1),
      holders: Math.floor(artist ? artist.followers / 12 : 0) // Simulated holder count
    };
  }, [artistNFTs, artist]);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    if (artist && artistTracks.length > 0) {
      handleSyncDNA();
    }
  }, [id, artist]);

  useEffect(() => {
    if (activeTab === 'about' && artist) {
      handleFetchRelated();
    }
  }, [activeTab, artist, id]);

  const handleSyncDNA = async () => {
    if (!artist) return;
    setIsDNAStreaming(true);
    try {
      const dna = await getArtistSonicDNA(artist, artistTracks);
      setSonicDNA(dna);
    } catch (e: any) {
      addNotification(e.message || "Failed to sync Sonic DNA.", "warning");
    } finally {
      setIsDNAStreaming(false);
    }
  };

  const handleFetchRelated = async () => {
    if (!artist) return;
    setIsRelatedLoading(true);
    try {
      const catalog = MOCK_ARTISTS.filter(a => a.id !== artist.id);
      const relatedIds = await findRelatedArtists(artist, artistTracks, catalog);
      const matches = MOCK_ARTISTS.filter(a => relatedIds.includes(a.id));
      setRelatedArtists(matches.slice(0, 3));
    } catch (e: any) {
      const fallback = MOCK_ARTISTS.filter(a => a.id !== artist.id).slice(0, 3);
      setRelatedArtists(fallback);
    } finally {
      setIsRelatedLoading(false);
    }
  };

  if (!artist) return null;

  const handleFollow = () => {
    if (id) toggleFollowUser(id);
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addNotification("File too large. Max 5MB allowed.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomBanner(reader.result as string);
        addNotification("Banner protocol updated successfully.", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const StatBox = ({ label, value, sub, tooltip }: { label: string, value: string, sub?: string, tooltip?: string }) => (
    <div className="flex flex-col glass backdrop-blur-md bg-white/[0.02] border border-white/5 p-3 rounded-xl hover:border-blue-500/30 transition-all group relative">
      <div className="flex items-center gap-1 mb-1">
        <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.4em] group-hover:text-blue-400/50 transition-colors">{label}</span>
        {tooltip && (
          <div className="relative group/tooltip">
            <i className="fas fa-info-circle text-[6px] text-white/20 hover:text-blue-400 cursor-help transition-colors"></i>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg text-[8px] text-white/70 normal-case tracking-normal font-medium opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 text-center pointer-events-none">
              {tooltip}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white/10"></div>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-black text-white tracking-tighter leading-none group-hover:text-blue-400 transition-colors">{value}</span>
        {sub && <span className="text-[8px] font-black text-blue-500 uppercase">{sub}</span>}
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-1000 pb-32 bg-black min-h-screen font-sans">
      {/* 1. COMPACT CINEMATIC BANNER */}
      <div className="relative h-[30vh] md:h-[35vh] overflow-hidden group/banner">
        <img 
          src={customBanner || artist.bannerUrl || `https://picsum.photos/1200/400?seed=${artist.id}`} 
          className="w-full h-full object-cover grayscale-[0.5] brightness-[0.3] transition-transform duration-[30s] group-hover/banner:scale-110" 
          alt="" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        
        {/* Banner Upload Trigger */}
        <div className="absolute top-6 right-6 z-40 opacity-0 group-hover/banner:opacity-100 transition-opacity">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 glass rounded-lg text-[8px] font-black uppercase tracking-widest text-white/60 border border-white/10 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <i className="fas fa-camera"></i> UPDATE_PROTOCOL
          </button>
          <input type="file" ref={fileInputRef} onChange={handleBannerUpload} accept="image/*" className="hidden" />
        </div>
      </div>

      {/* 2. INTEGRATED IDENTITY & ACTION HUB */}
      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-30">
        <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6 pb-8 border-b border-white/5">
          
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* Profile Picture & Socials Stack */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full blur opacity-30 group-hover:opacity-80 transition duration-1000"></div>
                <div className="relative p-1 rounded-full bg-black">
                  <img src={artist.avatarUrl} className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border border-white/10" alt={artist.name} />
                  {artist.verified && (
                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-blue-600 rounded-full border-2 border-black flex items-center justify-center shadow-xl">
                      <i className="fas fa-check text-white text-[8px]"></i>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Links - Compacted */}
              {artist.socials && (
                <div className="flex gap-2">
                  {artist.socials.x && (
                    <a href={artist.socials.x} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-white hover:border-blue-500/50 transition-all group">
                      <i className="fab fa-x-twitter text-[10px] group-hover:scale-110 transition-transform"></i>
                    </a>
                  )}
                  {artist.socials.spotify && (
                    <a href={artist.socials.spotify} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-[#1DB954] hover:border-[#1DB954]/50 transition-all group">
                      <i className="fab fa-spotify text-[10px] group-hover:scale-110 transition-transform"></i>
                    </a>
                  )}
                  {artist.socials.instagram && (
                    <a href={artist.socials.instagram} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-[#E4405F] hover:border-[#E4405F]/50 transition-all group">
                      <i className="fab fa-instagram text-[10px] group-hover:scale-110 transition-transform"></i>
                    </a>
                  )}
                  {artist.socials.website && (
                    <a href={artist.socials.website} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-blue-400 hover:border-blue-400/50 transition-all group">
                      <i className="fas fa-globe text-[10px] group-hover:scale-110 transition-transform"></i>
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center md:items-start text-center md:text-left mb-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.4em]">NODE_SYNC: ACTIVE</span>
              </div>
              <div className="flex items-center gap-4 mb-1">
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-white leading-none">
                  {artist.name}
                </h1>
                {artist.verified && <i className="fas fa-check-circle text-blue-500 text-2xl md:text-4xl"></i>}
              </div>
              <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] opacity-70">
                @sonic_architect_{artist.id}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center lg:items-end gap-5">
            <div className="flex gap-8 md:gap-10">
              <StatBox label="Fans" value={artist.followers.toLocaleString()} tooltip="Total number of users synchronized with this artist's neural network." />
              <StatBox label="Tracks" value={artistTracks.length.toString()} tooltip="Total number of sonic frequencies broadcasted by this artist." />
              {marketStats && <StatBox label="Floor" value={marketStats.floor} sub="TON" tooltip="The lowest current market price for this artist's Genesis NFTs." />}
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => playAll(artistTracks)}
                className="px-6 py-2.5 electric-blue-bg text-white rounded-lg font-black text-[8px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <i className="fas fa-play text-[7px]"></i> SYNC_CATALOG
              </button>
              <button 
                onClick={handleFollow}
                className={`px-6 py-2.5 rounded-lg font-black text-[8px] uppercase tracking-widest transition-all active:scale-95 border ${isFollowing ? 'bg-white/5 border-white/10 text-white/40' : 'bg-white text-black shadow-lg shadow-white/5'}`}
              >
                {isFollowing ? 'SYNCED' : 'FOLLOW'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Tracks Relay */}
      {trendingTracks.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-12 animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-4 electric-blue-bg rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
            <h2 className="text-[9px] font-black text-white/40 uppercase tracking-[0.5em]">Trending Frequencies</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingTracks.map((track, idx) => (
              <div 
                key={`trending-${track.id}`}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative glass p-4 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-all bg-[#0a0a0a]/40 flex items-center gap-4">
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden shadow-lg">
                    <img src={track.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                    <button 
                      onClick={() => playAll([track])}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <i className="fas fa-play text-white text-xs"></i>
                    </button>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[7px] font-black text-blue-500 uppercase">#{idx + 1} Trending</span>
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tighter truncate leading-tight mb-1">{track.title}</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <i className="fas fa-play text-[7px] text-white/20"></i>
                        <span className="text-[8px] font-black text-white/40">{(track.playCount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <i className="fas fa-heart text-[7px] text-red-500/40"></i>
                        <span className="text-[8px] font-black text-white/40">{(track.likes || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left: Intelligence Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Sonic DNA Panel */}
            <section className="glass backdrop-blur-2xl bg-white/[0.02] p-8 rounded-2xl border-blue-500/20 border relative overflow-hidden group shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
               <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity"><i className="fas fa-dna text-3xl text-blue-500"></i></div>
               <div className="absolute -left-20 -top-20 w-40 h-40 bg-blue-600/10 blur-[80px] rounded-full"></div>
               <h3 className="text-[9px] font-black text-blue-400 uppercase tracking-[0.4em] mb-6 relative z-10">Neural DNA Signature</h3>
               
               {isDNAStreaming ? (
                 <div className="py-8 flex flex-col items-center gap-4 relative z-10">
                    <div className="flex gap-1 items-end h-6">
                      {[0.1, 0.4, 0.2, 0.8, 0.5].map((d, i) => (
                        <div key={i} className="w-1 bg-blue-500 rounded-full animate-bounce shadow-[0_0_8px_rgba(59,130,246,0.5)]" style={{ animationDelay: `${d}s`, height: `${d * 100}%` }}></div>
                      ))}
                    </div>
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest animate-pulse">Scanning Frequencies...</p>
                 </div>
               ) : sonicDNA ? (
                 <div className="space-y-6 animate-in fade-in duration-700 relative z-10">
                    <p className="text-xs text-white/60 leading-relaxed border-l border-blue-500/30 pl-6">
                      "{sonicDNA.signature}"
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {sonicDNA.vibes.map(vibe => (
                        <span key={vibe} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[8px] font-black text-blue-400 uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all cursor-default">#{vibe}</span>
                      ))}
                    </div>
                 </div>
               ) : null}
            </section>

            {/* Market Insights */}
            {marketStats && (
              <section className="glass backdrop-blur-xl bg-white/[0.02] p-8 rounded-2xl border-amber-500/20 border relative shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full"></div>
                <h3 className="text-[9px] font-black text-amber-500/60 uppercase tracking-[0.4em] mb-6 relative z-10">Market Ledger</h3>
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-center group/stat">
                    <span className="text-[8px] font-black text-white/20 uppercase group-hover/stat:text-white/40 transition-colors">Floor</span>
                    <span className="text-xs font-black text-white group-hover:text-amber-500 transition-colors">{marketStats.floor} TON</span>
                  </div>
                  <div className="flex justify-between items-center group/stat">
                    <span className="text-[8px] font-black text-white/20 uppercase group-hover/stat:text-white/40 transition-colors">Volume</span>
                    <span className="text-xs font-black text-white group-hover:text-amber-500 transition-colors">{marketStats.volume} TON</span>
                  </div>
                  <div className="flex justify-between items-center group/stat">
                    <span className="text-[8px] font-black text-white/20 uppercase group-hover/stat:text-white/40 transition-colors">Holders</span>
                    <span className="text-xs font-black text-white group-hover:text-amber-500 transition-colors">{marketStats.holders}</span>
                  </div>
                  <button onClick={() => navigate('/marketplace')} className="w-full py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[7px] font-black text-amber-500 uppercase tracking-widest hover:bg-amber-500 hover:text-black transition-all mt-2 shadow-lg shadow-amber-500/5">Trade Assets</button>
                </div>
              </section>
            )}

            {/* Biography */}
            <section className="p-8 glass backdrop-blur-xl bg-white/[0.01] rounded-2xl border border-white/5">
              <h3 className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-6">Origin Narrative</h3>
              <p className="text-xs text-white/40 leading-relaxed">{artist.bio || "No biographical record in neural archive."}</p>
            </section>
          </div>

          {/* Right: Content Feed */}
          <div className="lg:col-span-8">
            <nav className="flex items-center gap-8 border-b border-white/5 mb-8 overflow-x-auto no-scrollbar">
              {['tracks', 'nfts', 'signals', 'about'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`pb-4 text-[9px] font-black uppercase tracking-[0.3em] transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-blue-500' : 'text-white/20 hover:text-white'}`}
                >
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></div>}
                </button>
              ))}
            </nav>

            <div className="min-h-[500px]">
              {activeTab === 'tracks' && (
                <div className="space-y-10 animate-in fade-in duration-500">
                  {/* Popular Syncs Section */}
                  {artistTracks.length > 3 && (
                    <section>
                      <div className="flex items-center gap-2 mb-5">
                        <i className="fas fa-fire text-amber-500 text-[8px]"></i>
                        <h4 className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">Popular Syncs</h4>
                      </div>
                      <div className="space-y-1">
                        {artistTracks.slice(0, 4).map(t => (
                          <TrackCard key={`popular-${t.id}`} track={t} variant="row" />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* All Tracks Grid */}
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <i className="fas fa-list-ul text-white/20 text-[8px]"></i>
                      <h4 className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">All Frequencies</h4>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                      {artistTracks.map(t => (
                        <TrackCard key={t.id} track={t} />
                      ))}
                    </div>
                    {artistTracks.length === 0 && (
                       <div className="py-24 text-center glass rounded-2xl border-dashed border-white/10">
                          <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">No tracks broadcasted.</p>
                       </div>
                    )}
                  </section>
                </div>
              )}

              {activeTab === 'nfts' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5 animate-in slide-in-from-right-4 duration-500">
                  {artistNFTs.map(n => <NFTCard key={n.id} nft={n} />)}
                  {artistNFTs.length === 0 && (
                     <div className="col-span-full py-24 text-center glass rounded-2xl border-dashed border-white/10">
                        <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">No assets detected.</p>
                     </div>
                  )}
                </div>
              )}

              {activeTab === 'signals' && (
                <div className="space-y-5 animate-in slide-in-from-bottom-4 duration-500">
                   {artistPosts.length > 0 ? (
                      artistPosts.map(p => <PostCard key={p.id} post={p} />)
                   ) : (
                     <div className="py-24 text-center glass rounded-2xl border-dashed border-white/10">
                        <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">Signal void detected.</p>
                     </div>
                   )}
                </div>
              )}

              {activeTab === 'about' && (
                <div className="space-y-12 animate-in fade-in duration-700">
                  {/* Proximity Matching */}
                  <section className="glass p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-8 opacity-5"><i className="fas fa-microchip text-5xl"></i></div>
                     <h3 className="text-lg font-black tracking-tighter text-white mb-1">Sonic Proximity</h3>
                     <p className="text-[8px] font-black text-blue-400 uppercase tracking-[0.4em] mb-10">Neural Matching Protocol Active</p>
                     
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       {isRelatedLoading ? (
                          [1,2,3].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse"></div>)
                       ) : relatedArtists.map(related => (
                          <div 
                            key={related.id} 
                            onClick={() => navigate(`/artist/${related.id}`)}
                            className="bg-[#050505] p-5 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-all cursor-pointer text-center group"
                          >
                             <div className="relative w-20 h-20 mx-auto mb-3">
                                <img src={related.avatarUrl} className="w-full h-full object-cover rounded-full border border-white/10 group-hover:border-blue-500 transition-all" alt="" />
                             </div>
                             <h4 className="text-[10px] font-black uppercase text-white tracking-tight">{related.name}</h4>
                             <p className="text-[6px] font-black text-white/20 uppercase tracking-widest mt-1">{related.followers.toLocaleString()} Fans</p>
                          </div>
                       ))}
                     </div>
                  </section>
                  
                  {/* Verification Block */}
                  <div className="p-10 bg-blue-600/5 rounded-[2.5rem] border border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
                     <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                           <i className="fas fa-shield-check text-white text-xl"></i>
                        </div>
                        <div>
                           <h4 className="text-lg font-black text-white uppercase tracking-tighter">Verified Architect</h4>
                           <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mt-1">Confirmed Identity on TON Blockchain</p>
                        </div>
                     </div>
                     <button className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">Report Identity</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="h-32"></div>
    </div>
  );
};

export default ArtistProfile;