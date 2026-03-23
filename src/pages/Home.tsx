import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, ChevronRight, Zap, TrendingUp, TrendingDown, Music2, ShoppingBag, Sparkles, Activity, Flame, Clock, Gavel, PlusCircle, UserCheck, ListMusic, Globe, Radio, Disc, Search, X } from 'lucide-react';
import { MOCK_TRACKS, MOCK_NFTS, CURATED_PLAYLISTS, GENRES } from '@/constants';
import TrackCard from '@/components/TrackCard';
import NFTCard from '@/components/NFTCard';
import ArtistCard from '@/components/ArtistCard';
import PlaylistCard from '@/components/PlaylistCard';
import GenreCard from '@/components/GenreCard';
import AutoCarousel, { CarouselItem } from '@/components/AutoCarousel';
import SectionHeader from '@/components/SectionHeader';
import DiscoveryFeed from '@/components/DiscoveryFeed';
import { useAudio } from '@/context/AudioContext';
import { motion, AnimatePresence } from 'motion/react';

const HomeSection = ({ title, icon: Icon, link, children }: { title: string, icon: React.ElementType, link?: string, children: React.ReactNode }) => {
  return (
    <section className="section-container">
      <SectionHeader title={title} viewAllLink={link} />
      <div className="scroll-row">
        {children}
      </div>
    </section>
  );
};

const FEATURED_TRACKS_CAROUSEL: CarouselItem[] = MOCK_TRACKS.slice(0, 3).map(track => ({
  id: track.id,
  title: track.title,
  subtitle: track.artist,
  imageUrl: track.coverUrl,
  link: `/track/${track.id}`,
  cta: 'Play'
}));

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { playTrack, playAll, artists, userProfile, recentlyPlayed, getTrendingTracks, getTopNFTTracks, allPlaylists, searchQuery, setSearchQuery, generateDiscoverWeekly, getRecommendations, allNFTs } = useAudio();
  
  useEffect(() => {
    generateDiscoverWeekly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'discovery'>('overview');

  const handleCtaClick = (item: CarouselItem) => {
    const track = MOCK_TRACKS.find(t => t.id === item.id);
    if (track) {
      playTrack(track);
    }
  };

  const trendingTracks = useMemo(() => {
    let tracks = getTrendingTracks();
    if (selectedGenre) {
      tracks = tracks.filter(t => t.genre === selectedGenre);
    }
    return tracks;
  }, [getTrendingTracks, selectedGenre]);

  const trendingArtists = useMemo(() => {
    let filteredArtists = [...artists];
    if (selectedGenre) {
      filteredArtists = filteredArtists.filter(a => a.genre === selectedGenre);
    }
    return filteredArtists.sort((a, b) => Number(b.earnings?.total || 0) - Number(a.earnings?.total || 0)).slice(0, 3);
  }, [artists, selectedGenre]);

  const trendingNFTs = useMemo(() => {
    let filteredNFTs = [...allNFTs];
    if (selectedGenre) {
      const genreTrackIds = MOCK_TRACKS.filter(t => t.genre === selectedGenre).map(t => t.id);
      filteredNFTs = filteredNFTs.filter(n => genreTrackIds.includes(n.trackId));
    }
    return filteredNFTs.sort((a, b) => parseFloat(b.price || '0') - parseFloat(a.price || '0')).slice(0, 3);
  }, [allNFTs, selectedGenre]);

  const topNFTTracks = useMemo(() => {
    let tracks = getTopNFTTracks();
    if (selectedGenre) {
      tracks = tracks.filter(t => t.genre === selectedGenre);
    }
    return tracks;
  }, [getTopNFTTracks, selectedGenre]);
  
  const { recommendedTracks, recommendedNFTs } = useMemo(() => {
    const { recommendedTracks: tracks, recommendedNFTs: nfts } = getRecommendations();
    
    let filteredTracks = tracks;
    let filteredNFTs = nfts;

    if (selectedGenre) {
      filteredTracks = tracks.filter(t => t.genre === selectedGenre);
      
      const genreTrackIds = MOCK_TRACKS.filter(t => t.genre === selectedGenre).map(t => t.id);
      filteredNFTs = nfts.filter(n => genreTrackIds.includes(n.trackId));
    }

    return {
      recommendedTracks: filteredTracks,
      recommendedNFTs: filteredNFTs.slice(0, 5)
    };
  }, [getRecommendations, selectedGenre]);

  const filteredRecentlyPlayed = useMemo(() => {
    if (!selectedGenre) return recentlyPlayed;
    return recentlyPlayed.filter(t => t.genre === selectedGenre);
  }, [recentlyPlayed, selectedGenre]);

  const newReleases = useMemo(() => {
    let tracks = [...MOCK_TRACKS];
    if (selectedGenre) {
      tracks = tracks.filter(t => t.genre === selectedGenre);
    }
    // Sort by release date descending (mocking new releases)
    return tracks.sort((a, b) => new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime()).slice(0, 5);
  }, [selectedGenre]);

  const curatedPlaylists = useMemo(() => {
    const basePlaylists = allPlaylists.filter(p => p.creator === 'TonJam AI' || CURATED_PLAYLISTS.find(cp => cp.id === p.id));
    if (!selectedGenre) return basePlaylists;
    
    const genreTrackIds = MOCK_TRACKS.filter(t => t.genre === selectedGenre).map(t => t.id);
    return basePlaylists.filter(p => p.trackIds?.some(id => genreTrackIds.includes(id)));
  }, [allPlaylists, selectedGenre]);

  const recommendedArtists = useMemo(() => {
    let recArtists = artists;
    if (selectedGenre) {
      recArtists = recArtists.filter(a => a.genre === selectedGenre);
    }
    return recArtists.slice(0, 5);
  }, [artists, selectedGenre]);

  const newlyMintedNFTs = useMemo(() => {
    let nfts = [...allNFTs];
    if (selectedGenre) {
      const genreTrackIds = MOCK_TRACKS.filter(t => t.genre === selectedGenre).map(t => t.id);
      nfts = nfts.filter(n => genreTrackIds.includes(n.trackId));
    }
    return nfts.slice(2, 7);
  }, [allNFTs, selectedGenre]);

  return (
    <div className="page-container w-full">
      {/* Filter Section */}
      <div className="max-w-3xl mx-auto w-full relative z-20">
        <div className="flex items-center justify-between mb-4 pb-1">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`text-xl font-bold uppercase tracking-tighter transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm ${activeTab === 'overview' ? 'text-blue-500' : 'text-neutral-500 hover:text-neutral-400'}`}
            >
              Overview
              {activeTab === 'overview' && (
                <motion.div layoutId="homeTab" className="absolute -bottom-3 left-0 right-0 h-1 bg-blue-500 rounded-full" />
              )}
            </button>
            <button 
              onClick={() => setActiveTab('discovery')}
              className={`text-xl font-bold uppercase tracking-tighter transition-all relative flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm ${activeTab === 'discovery' ? 'text-blue-500' : 'text-neutral-500 hover:text-neutral-400'}`}
            >
              Discovery
              <Sparkles className={`h-4 w-4 ${activeTab === 'discovery' ? 'text-blue-400' : 'text-muted-foreground/50'}`} />
              {activeTab === 'discovery' && (
                <motion.div layoutId="homeTab" className="absolute -bottom-3 left-0 right-0 h-1 bg-blue-500 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="scroll-row py-1">
            <button
              onClick={() => setSelectedGenre(null)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all snap-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 border ${
                selectedGenre === null 
                  ? 'bg-blue-500 text-white border-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.3)]' 
                  : 'bg-white dark:bg-muted/50 text-blue-500 dark:text-neutral-500 border-silver-300 dark:border-transparent hover:text-blue-600 dark:hover:text-neutral-400 hover:bg-muted/10 inactive-pill'
              }`}
            >
              All Vibes
            </button>
            {GENRES.map((genre) => {
              const isSelected = selectedGenre === genre.name;
              const Icon = genre.icon;
              return (
                <button
                  key={genre.id}
                  onClick={() => setSelectedGenre(genre.name)}
                  className={`relative flex-shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all snap-start overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 border ${
                    isSelected 
                      ? 'bg-blue-500 text-white border-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.3)]' 
                      : 'bg-white dark:bg-muted/50 text-blue-500 dark:text-neutral-500 border-silver-300 dark:border-transparent hover:text-blue-600 dark:hover:text-neutral-400 hover:bg-muted/10 inactive-pill'
                  }`}
                >
                  {isSelected && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${genre.color} opacity-80`}></div>
                  )}
                  {!isSelected && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${genre.color} opacity-0 group-hover:opacity-20 transition-opacity`}></div>
                  )}
                  <Icon className={`relative z-10 h-3 w-3 ${isSelected ? 'text-white' : 'text-blue-500 dark:text-neutral-500 group-hover:text-blue-600 dark:group-hover:text-neutral-400'}`} />
                  <span className="relative z-10">{genre.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'discovery' ? (
          <motion.div
            key="discovery-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <DiscoveryFeed />
          </motion.div>
        ) : (
          <motion.div
            key="overview-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Featured Sponsored Posts Carousel */}
            <AutoCarousel items={FEATURED_TRACKS_CAROUSEL} onCtaClick={handleCtaClick} />

            {/* Hero Section */}
            <section className="relative rounded-[10px] overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-transparent z-0"></div>
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10 p-4 lg:p-6 max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-blue-500/10 border border-neutral-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                  <Zap className="h-3 w-3" />
                  Live on TON Blockchain
                </div>
                
                <h1 className="text-[32px] lg:text-[60px] font-black uppercase tracking-tighter leading-[0.85] text-foreground">
                  The Future of <span className="text-blue-500">Music</span> is Here
                </h1>
                
                <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed font-medium max-w-xl">
                  Stream high-fidelity music, collect rare artifacts, and join the decentralized revolution on the TON blockchain.
                </p>
                
                <div className="flex flex-wrap gap-3 pt-2">
                  <button 
                    onClick={() => playAll(MOCK_TRACKS)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-foreground font-bold uppercase tracking-widest rounded-full transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2 group/btn text-xs"
                  >
                    <Play className="h-4 w-4 fill-white group-hover/btn:scale-110 transition-transform" />
                    Start Listening
                  </button>
                  <Link 
                    to="/marketplace"
                    className="px-4 py-2 bg-muted/50 hover:bg-muted text-foreground font-bold uppercase tracking-widest rounded-full transition-all flex items-center gap-2 text-xs"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Explore NFTs
                  </Link>
                </div>
              </div>
            </section>

            {/* Trending Now Section */}
            <section className="section-container">
              <SectionHeader title="Trending Now" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Top 5 Songs</h4>
                  {trendingTracks.slice(0, 5).map((track, idx) => (
                    <div key={`trend-track-${track.id}`} className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate(`/track/${track.id}`)}>
                      <span className="text-lg font-black italic text-muted-foreground/30 w-6">{idx + 1}</span>
                      <div className="relative w-12 h-12 rounded-[5px] overflow-hidden flex-shrink-0">
                        <img src={track.coverUrl} className="w-full h-full object-cover" alt={track.title} />
                        <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" onClick={(e) => { e.stopPropagation(); playTrack(track); }}>
                          <Play className="h-4 w-4 text-foreground fill-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-foreground">{track.title}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate">{track.artist}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Top 3 Artists</h4>
                  {trendingArtists.map((artist) => (
                    <div key={`trend-artist-${artist.id}`} className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate(`/artist/${artist.id}`)}>
                      <img src={artist.avatarUrl} className="w-12 h-12 rounded-full object-cover" alt={artist.name} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-foreground">{artist.name}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate">{artist.genre}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Top 3 NFTs</h4>
                  {trendingNFTs.map((nft) => (
                    <div key={`trend-nft-${nft.id}`} className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate(`/nft/${nft.id}`)}>
                      <img src={nft.imageUrl} className="w-12 h-12 rounded-[5px] object-cover" alt={nft.title} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-foreground">{nft.title}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate">{nft.price} TON</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Recently Played */}
            {filteredRecentlyPlayed.length > 0 && (
              <HomeSection title="Jump Back In" icon={Clock} link="/explore/tracks?title=Recently Played&filter=recent">
                {filteredRecentlyPlayed.map(track => (
                  <div key={`recent-${track.id}`} className="flex-shrink-0 w-40 sm:w-48 snap-start">
                    <TrackCard track={track} />
                  </div>
                ))}
              </HomeSection>
            )}

            {/* Recommended Tracks */}
            {recommendedTracks.length > 0 && (
              <HomeSection title="Recommended for You" icon={Sparkles} link="/explore/tracks?title=Recommended for You&filter=recommended">
                {recommendedTracks.map(track => (
                  <div key={`rec-track-${track.id}`} className="flex-shrink-0 w-40 sm:w-48 snap-start">
                    <TrackCard track={track} />
                  </div>
                ))}
              </HomeSection>
            )}

            {/* Trending Tracks */}
            <HomeSection title="Trending Signals" icon={Flame} link="/explore/tracks?title=Trending Signals&filter=trending">
              {trendingTracks.map(track => (
                <div key={`trend-${track.id}`} className="flex-shrink-0 w-40 sm:w-48 snap-start">
                  <TrackCard track={track} />
                </div>
              ))}
            </HomeSection>

            {/* Top Charts - List View */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <SectionHeader title="Global Top 10" viewAllLink="/explore/tracks?title=Global Top 10&filter=trending" />
                <div className="grid grid-rows-2 grid-flow-col gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory no-scrollbar">
                  {trendingTracks.slice(0, 10).map((track, idx) => (
                    <div 
                      key={`chart-${track.id}`} 
                      onClick={() => navigate(`/track/${track.id}`)}
                      className="flex items-center gap-4 group cursor-pointer p-2 rounded-[5px] hover:bg-muted/50 transition-all w-[85vw] sm:w-[300px] snap-start"
                    >
                      <span className="text-[20px] font-black italic text-muted-foreground/30 group-hover:text-blue-500/40 transition-colors w-8 text-center">
                        {idx + 1}
                      </span>
                      <div className="relative w-12 h-12 rounded-[5px] overflow-hidden flex-shrink-0">
                        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" onClick={(e) => { e.stopPropagation(); playTrack(track); }}>
                          <Play className="h-4 w-4 text-foreground fill-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold uppercase tracking-tight text-foreground truncate group-hover:text-blue-400 transition-colors">{track.title}</h4>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">{track.artist}</p>
                      </div>
                      <div className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1">
                        {Math.random() > 0.5 ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        {(track.playCount || 0).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <SectionHeader title="New Releases" viewAllLink="/explore/tracks?title=New Releases&filter=new" />
                <div className="space-y-4">
                  {newReleases.map(track => (
                    <div 
                      key={`new-${track.id}`} 
                      onClick={() => navigate(`/track/${track.id}`)}
                      className="flex items-center gap-4 group cursor-pointer"
                    >
                      <div className="relative w-16 h-16 rounded-[5px] overflow-hidden flex-shrink-0">
                        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" onClick={(e) => { e.stopPropagation(); playTrack(track); }}>
                          <Play className="h-4 w-4 text-foreground fill-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[10px] font-bold uppercase tracking-tight text-foreground truncate">{track.title}</h4>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest truncate">{track.artist}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[7px] font-bold px-1.5 py-0.5 bg-muted/50 rounded text-muted-foreground uppercase tracking-widest">
                            {track.genre}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Curated Playlists */}
            {curatedPlaylists.length > 0 && (
              <HomeSection title="Curated for You" icon={Sparkles} link="/explore/playlists?title=Curated Playlists&filter=curated">
                {curatedPlaylists.map(playlist => (
                  <div key={`playlist-${playlist.id}`} className="flex-shrink-0 w-40 sm:w-48 snap-start">
                    <PlaylistCard playlist={playlist} onClick={() => navigate(`/playlist/${playlist.id}`)} />
                  </div>
                ))}
              </HomeSection>
            )}

            {/* Genre Grid - Quick Access */}
            <section className="section-container">
              <SectionHeader title="Explore Genres" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {GENRES.map(genre => (
                  <GenreCard key={genre.id} genre={genre} />
                ))}
              </div>
            </section>

            {/* Top NFT Sales */}
            <HomeSection title="NFT Alpha" icon={Activity} link="/explore/nfts?title=NFT Alpha&filter=top_nfts">
              {topNFTTracks.map(track => (
                <div key={`nft-alpha-${track.id}`} className="flex-shrink-0 w-40 sm:w-48 snap-start">
                  <TrackCard track={track} />
                </div>
              ))}
            </HomeSection>

            {/* Recommended Artists */}
            <HomeSection title="Rising Stars" icon={UserCheck} link="/explore/artists?title=Rising Stars&filter=rising">
              {recommendedArtists.map(artist => (
                <div key={`artist-${artist.id}`} className="flex-shrink-0 w-48 sm:w-56 snap-start">
                  <ArtistCard artist={artist} />
                </div>
              ))}
            </HomeSection>

            {/* Recommended NFTs */}
            {recommendedNFTs.length > 0 && (
              <HomeSection title="Curated Collectibles" icon={Sparkles} link="/explore/nfts?title=Curated Collectibles&filter=recommended">
                {recommendedNFTs.map(nft => (
                  <div key={`rec-nft-${nft.id}`} className="flex-shrink-0 w-40 sm:w-48 snap-start">
                    <NFTCard nft={nft} />
                  </div>
                ))}
              </HomeSection>
            )}

            {/* Marketplace Highlights */}
            <HomeSection title="New in Marketplace" icon={PlusCircle} link="/explore/nfts?title=New in Marketplace&filter=new_nfts">
              {newlyMintedNFTs.map(nft => (
                <div key={`minted-${nft.id}`} className="flex-shrink-0 w-40 sm:w-48 snap-start">
                  <NFTCard nft={nft} />
                </div>
              ))}
            </HomeSection>

            {/* Community & Artist CTA Section */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="glass bg-card/50 p-6 rounded-[10px] space-y-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Radio className="h-32 w-32 text-blue-500" />
                </div>
                <div className="w-12 h-12 rounded-[5px] bg-blue-600/10 flex items-center justify-center text-blue-500">
                  <Music2 className="h-6 w-6" />
                </div>
                <h3 className="text-[26px] font-bold uppercase tracking-tighter text-foreground">Join the JamSpace</h3>
                <p className="text-muted-foreground leading-relaxed max-w-md">
                  Connect with other music lovers, share your favorite tracks, and discover new sounds in our community-driven social feed.
                </p>
                <Link to="/jamspace" className="inline-flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors group/link">
                  Enter JamSpace <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              <div className="glass bg-card/50 p-6 rounded-[10px] space-y-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Disc className="h-32 w-32 text-purple-500" />
                </div>
                <div className="w-12 h-12 rounded-[5px] bg-purple-600/10 flex items-center justify-center text-purple-500">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-[26px] font-bold uppercase tracking-tighter text-foreground">
                  {userProfile.isVerifiedArtist ? 'Artist Hub' : 'Mint Your Legacy'}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-md">
                  {userProfile.isVerifiedArtist 
                    ? 'Manage your music, track your earnings, and connect with your fans through our powerful artist tools.'
                    : 'Join the revolution. Upload your music, mint limited edition NFTs, and start earning royalties directly on TON.'}
                </p>
                <Link 
                  to={userProfile.isVerifiedArtist ? '/artist-dashboard' : '/artist-onboarding'} 
                  className="inline-flex items-center gap-2 text-xs font-bold text-purple-500 uppercase tracking-widest hover:text-purple-400 transition-colors group/link"
                >
                  {userProfile.isVerifiedArtist ? 'Go to Dashboard' : 'Start Onboarding'} <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decentralized Footer Info */}
      <section className="py-4 flex flex-col items-center text-center space-y-1">
        <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em]">
          <Globe className="h-3 w-3" />
          Secured by TON Blockchain
        </div>
        <p className="text-[9px] text-muted-foreground/30 uppercase tracking-widest">
          TonJam v2.6.4 • Decentralized Music Protocol
        </p>
      </section>
    </div>
  );
};

export default Home;
