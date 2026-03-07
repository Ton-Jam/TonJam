import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, ChevronRight, Zap, TrendingUp, TrendingDown, Music2, ShoppingBag, Sparkles, Activity, Flame, Clock, Gavel, PlusCircle, UserCheck, ListMusic, Globe, Radio, Disc, Search } from 'lucide-react';
import { MOCK_TRACKS, MOCK_NFTS, CURATED_PLAYLISTS, GENRES } from '@/constants';
import TrackCard from '@/components/TrackCard';
import NFTCard from '@/components/NFTCard';
import ArtistCard from '@/components/ArtistCard';
import PlaylistCard from '@/components/PlaylistCard';
import GenreCard from '@/components/GenreCard';
import AutoCarousel, { CarouselItem } from '@/components/AutoCarousel';
import SectionHeader from '@/components/SectionHeader';
import { useAudio } from '@/context/AudioContext';

const HomeSection = ({ title, icon: Icon, link, subtitle, children }: { title: string, icon: React.ElementType, link?: string, subtitle?: string, children: React.ReactNode }) => {
  return (
    <section className="space-y-6">
      <SectionHeader title={title} subtitle={subtitle} viewAllLink={link} />
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory">
        {children}
      </div>
    </section>
  );
};

const FEATURED_POSTS: CarouselItem[] = [
  {
    id: 'sp1',
    title: 'Neon Voyager Live',
    subtitle: 'Exclusive Virtual Concert on TON',
    imageUrl: 'https://picsum.photos/1200/400?random=101',
    link: '/artist/a1',
    cta: 'Get Tickets'
  },
  {
    id: 'sp2',
    title: 'Genesis NFT Drop',
    subtitle: 'Echo Phase limited edition',
    imageUrl: 'https://picsum.photos/1200/400?random=102',
    link: '/marketplace',
    cta: 'Mint Now'
  },
  {
    id: 'sp3',
    title: 'TonJam Weekly Top 10',
    subtitle: 'Discover the hottest tracks',
    imageUrl: 'https://picsum.photos/1200/400?random=103',
    link: '/discover',
    cta: 'Listen'
  }
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { playTrack, playAll, artists, userProfile, recentlyPlayed, getTrendingTracks, getTopNFTTracks, allPlaylists, searchQuery, setSearchQuery } = useAudio();
  
  const trendingTracks = useMemo(() => getTrendingTracks(), [getTrendingTracks]);
  const topNFTTracks = useMemo(() => getTopNFTTracks(), [getTopNFTTracks]);
  
  // Data slices for different sections
  const recommendedNFTs = MOCK_NFTS.slice(0, 5);
  const newlyMintedNFTs = MOCK_NFTS.slice(2, 7);
  const recommendedArtists = artists.slice(0, 5);

  return (
    <div className="p-4 lg:p-6 space-y-16 w-full pb-32">
      {/* Search Bar for Home Screen */}
      <div className="max-w-2xl mx-auto w-full relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-blue-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Search tracks, artists, NFTs..." 
          className="w-full bg-white/5 border border-white/10 rounded-[12px] py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20 shadow-2xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Featured Sponsored Posts Carousel */}
      <AutoCarousel items={FEATURED_POSTS} />

      {/* Hero Section */}
      <section className="relative rounded-[10px] overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent z-0"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 p-8 lg:p-20 max-w-3xl space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            <Zap className="h-3 w-3" />
            Live on TON Blockchain
          </div>
          
          <h1 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.85] text-white">
            The Future of <span className="text-blue-500">Music</span> is Here
          </h1>
          
          <p className="text-lg lg:text-xl text-white/40 leading-relaxed font-medium max-w-xl">
            Stream high-fidelity music, collect rare artifacts, and join the decentralized revolution on the TON blockchain.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              onClick={() => playAll(MOCK_TRACKS)}
              className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest rounded-[5px] transition-all shadow-xl shadow-blue-600/20 flex items-center gap-3 group/btn"
            >
              <Play className="h-5 w-5 fill-white group-hover/btn:scale-110 transition-transform" />
              Start Listening
            </button>
            <Link 
              to="/marketplace"
              className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest rounded-[5px] border border-white/10 transition-all flex items-center gap-3"
            >
              <ShoppingBag className="h-5 w-5" />
              Explore NFTs
            </Link>
          </div>
        </div>
      </section>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <HomeSection title="Jump Back In" subtitle="Pick up where you left off" icon={Clock} link="/explore/tracks?title=Recently Played&filter=recent">
          {recentlyPlayed.map(track => (
            <div key={`recent-${track.id}`} className="flex-shrink-0 w-40 sm:w-48 snap-start">
              <TrackCard track={track} />
            </div>
          ))}
        </HomeSection>
      )}

      {/* Trending Tracks */}
      <HomeSection title="Trending Signals" subtitle="The hottest tracks on the network" icon={Flame} link="/explore/tracks?title=Trending Signals&filter=trending">
        {trendingTracks.map(track => (
          <div key={`trend-${track.id}`} className="flex-shrink-0 w-40 sm:w-48 snap-start">
            <TrackCard track={track} />
          </div>
        ))}
      </HomeSection>

      {/* Top Charts - List View */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <SectionHeader title="Global Top 10" subtitle="Most streamed across the TON ecosystem" viewAllLink="/explore/tracks?title=Global Top 10&filter=trending" />
          <div className="grid grid-rows-2 grid-flow-col gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory no-scrollbar">
            {trendingTracks.slice(0, 10).map((track, idx) => (
              <div 
                key={`chart-${track.id}`} 
                onClick={() => playTrack(track)}
                className="flex items-center gap-4 group cursor-pointer p-2 rounded-[5px] hover:bg-white/5 transition-all w-[85vw] sm:w-[300px] snap-start"
              >
                <span className="text-2xl font-black italic text-white/10 group-hover:text-blue-500/40 transition-colors w-8 text-center">
                  {idx + 1}
                </span>
                <div className="w-12 h-12 rounded-[5px] overflow-hidden flex-shrink-0">
                  <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold uppercase tracking-tight text-white truncate group-hover:text-blue-400 transition-colors">{track.title}</h4>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate">{track.artist}</p>
                </div>
                <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-2">
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

        <div className="space-y-6">
          <SectionHeader title="New Releases" subtitle="Fresh signals from the void" viewAllLink="/explore/tracks?title=New Releases&filter=new" />
          <div className="space-y-4">
            {MOCK_TRACKS.slice(0, 5).map(track => (
              <div 
                key={`new-${track.id}`} 
                onClick={() => playTrack(track)}
                className="flex items-center gap-4 group cursor-pointer"
              >
                <div className="relative w-16 h-16 rounded-[5px] overflow-hidden flex-shrink-0">
                  <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="h-4 w-4 text-white fill-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold uppercase tracking-tight text-white truncate">{track.title}</h4>
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest truncate">{track.artist}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] font-bold px-1.5 py-0.5 bg-white/5 rounded text-white/40 uppercase tracking-widest">
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
      <HomeSection title="Curated for You" subtitle="Hand-picked by TonJam editors" icon={Sparkles} link="/explore/playlists?title=Curated Playlists&filter=curated">
        {CURATED_PLAYLISTS.map(playlist => (
          <div key={`playlist-${playlist.id}`} className="flex-shrink-0 w-64 md:w-72 snap-start">
            <PlaylistCard playlist={playlist} onClick={() => navigate(`/library`)} />
          </div>
        ))}
      </HomeSection>

      {/* Genre Grid - Quick Access */}
      <section className="space-y-6">
        <SectionHeader title="Explore Genres" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {GENRES.map(genre => (
            <GenreCard key={genre.id} genre={genre} />
          ))}
        </div>
      </section>

      {/* Top NFT Sales */}
      <HomeSection title="NFT Alpha" subtitle="Highest valued music artifacts" icon={Activity} link="/explore/nfts?title=NFT Alpha&filter=top_nfts">
        {topNFTTracks.map(track => (
          <div key={`nft-alpha-${track.id}`} className="flex-shrink-0 w-40 sm:w-48 snap-start">
            <TrackCard track={track} />
          </div>
        ))}
      </HomeSection>

      {/* Recommended Artists */}
      <HomeSection title="Rising Stars" subtitle="Artists you should follow" icon={UserCheck} link="/explore/artists?title=Rising Stars&filter=rising">
        {recommendedArtists.map(artist => (
          <div key={`artist-${artist.id}`} className="flex-shrink-0 w-48 sm:w-56 snap-start">
            <ArtistCard artist={artist} />
          </div>
        ))}
      </HomeSection>

      {/* Marketplace Highlights */}
      <HomeSection title="New in Marketplace" subtitle="Freshly minted music NFTs" icon={PlusCircle} link="/explore/nfts?title=New in Marketplace&filter=new_nfts">
        {newlyMintedNFTs.map(nft => (
          <div key={`minted-${nft.id}`} className="flex-shrink-0 w-40 sm:w-48 snap-start">
            <NFTCard nft={nft} />
          </div>
        ))}
      </HomeSection>

      {/* Community & Artist CTA Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass border border-blue-500/10 bg-white/[0.02] p-10 rounded-[10px] space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <Radio className="h-32 w-32 text-blue-500" />
          </div>
          <div className="w-12 h-12 rounded-[5px] bg-blue-600/20 flex items-center justify-center text-blue-500">
            <Music2 className="h-6 w-6" />
          </div>
          <h3 className="text-3xl font-bold uppercase tracking-tighter text-white">Join the JamSpace</h3>
          <p className="text-white/40 leading-relaxed max-w-md">
            Connect with other music lovers, share your favorite tracks, and discover new sounds in our community-driven social feed.
          </p>
          <Link to="/jamspace" className="inline-flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors group/link">
            Enter JamSpace <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="glass border border-purple-500/10 bg-white/[0.02] p-10 rounded-[10px] space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <Disc className="h-32 w-32 text-purple-500" />
          </div>
          <div className="w-12 h-12 rounded-[5px] bg-purple-600/20 flex items-center justify-center text-purple-500">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h3 className="text-3xl font-bold uppercase tracking-tighter text-white">
            {userProfile.isVerifiedArtist ? 'Artist Hub' : 'Mint Your Legacy'}
          </h3>
          <p className="text-white/40 leading-relaxed max-w-md">
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

      {/* Decentralized Footer Info */}
      <section className="py-12 border-t border-white/5 flex flex-col items-center text-center space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">
          <Globe className="h-3 w-3" />
          Secured by TON Blockchain
        </div>
        <p className="text-[10px] text-white/10 uppercase tracking-widest">
          TonJam v2.6.4 • Decentralized Music Protocol
        </p>
      </section>
    </div>
  );
};

export default Home;
