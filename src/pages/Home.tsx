import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ChevronRight, Zap, TrendingUp, Music2, ShoppingBag, Sparkles, Activity, Flame, Clock, Gavel, PlusCircle, UserCheck, ListMusic } from 'lucide-react';
import { MOCK_TRACKS, MOCK_NFTS } from '@/constants';
import TrackCard from '@/components/TrackCard';
import NFTCard from '@/components/NFTCard';
import AutoCarousel, { CarouselItem } from '@/components/AutoCarousel';
import { useAudio } from '@/context/AudioContext';

const HomeSection = ({ title, icon: Icon, link, children }: { title: string, icon: React.ElementType, link: string, children: React.ReactNode }) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-blue-500" />
          <h2 className="text-[18px] font-semibold text-white">{title}</h2>
        </div>
        <Link to={link} className="text-sm text-blue-500 hover:text-blue-400 font-medium">
          More →
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 pb-4 snap-x snap-mandatory">
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
  const { playAll, artists } = useAudio();
  
  // Data slices for different sections
  const recommendedNFTs = MOCK_NFTS.slice(0, 5);
  const mostTradedNFTs = [...MOCK_NFTS].reverse().slice(0, 5);
  const trendingNFTs = MOCK_NFTS.slice(1, 6);
  const recentTracks = MOCK_TRACKS.slice(0, 5);
  const mostBidNFTs = [...MOCK_NFTS].sort((a, b) => (b.offers?.length || 0) - (a.offers?.length || 0)).slice(0, 5);
  const newlyMintedNFTs = MOCK_NFTS.slice(2, 7);
  const recommendedArtists = artists.slice(0, 5);
  const featuredPlaylist = MOCK_TRACKS.slice(1, 6);

  return (
    <div className="py-4 lg:py-6 space-y-12 w-full">
      {/* Featured Sponsored Posts Carousel */}
      <AutoCarousel items={FEATURED_POSTS} />

      {/* Hero Section */}
      <section className="relative rounded-[5px] overflow-hidden bg-gradient-to-br from-blue-900/40 to-black border border-white/5 p-8 lg:p-16 mx-4 lg:mx-6">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            <Zap className="h-3 w-3" />
            Live on TON Blockchain
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9] text-white">
            The Future of <span className="text-blue-500">Music</span> is Decentralized
          </h1>
          
          <p className="text-lg text-white/60 leading-relaxed font-medium">
            TonJam is the ultimate platform for artists and fans. Stream high-fidelity music, collect rare NFTs, and join the revolution on the TON blockchain.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              onClick={() => playAll(MOCK_TRACKS)}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest rounded-[5px] transition-all shadow-xl shadow-blue-600/20 flex items-center gap-3"
            >
              <Play className="h-5 w-5 fill-white" />
              Start Listening
            </button>
            <Link 
              to="/marketplace"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest rounded-[5px] border border-white/10 transition-all flex items-center gap-3"
            >
              <ShoppingBag className="h-5 w-5" />
              Explore NFTs
            </Link>
          </div>
        </div>
      </section>

      {/* 1. Recommended NFTs */}
      <HomeSection title="Recommended NFTs" icon={Sparkles} link="/marketplace">
        {recommendedNFTs.map(nft => (
          <div key={`rec-nft-${nft.id}`} className="flex-shrink-0 w-40 sm:w-48 snap-start">
            <NFTCard nft={nft} />
          </div>
        ))}
      </HomeSection>

      {/* 2. Most Traded NFTs */}
      <HomeSection title="Most Traded NFTs" icon={Activity} link="/marketplace">
        {mostTradedNFTs.map(nft => (
          <div key={`traded-${nft.id}`} className="flex-shrink-0 w-40 sm:w-48 snap-start">
            <NFTCard nft={nft} />
          </div>
        ))}
      </HomeSection>

      {/* 3. Trending NFTs */}
      <HomeSection title="Trending NFTs" icon={Flame} link="/marketplace">
        {trendingNFTs.map(nft => (
          <div key={`trend-nft-${nft.id}`} className="flex-shrink-0 w-40 sm:w-48 snap-start">
            <NFTCard nft={nft} />
          </div>
        ))}
      </HomeSection>

      {/* 4. Recently Listed Tracks */}
      <HomeSection title="Recently Listed Tracks" icon={Clock} link="/discover">
        {recentTracks.map(track => (
          <div key={`recent-${track.id}`} className="flex-shrink-0 w-40 sm:w-48 snap-start">
            <TrackCard track={track} />
          </div>
        ))}
      </HomeSection>

      {/* 5. Most Bid NFTs */}
      <HomeSection title="Most Bid NFTs" icon={Gavel} link="/marketplace">
        {mostBidNFTs.map(nft => (
          <div key={`bid-${nft.id}`} className="flex-shrink-0 w-40 sm:w-48 snap-start">
            <NFTCard nft={nft} />
          </div>
        ))}
      </HomeSection>

      {/* 6. Newly Minted NFTs */}
      <HomeSection title="Newly Minted NFTs" icon={PlusCircle} link="/marketplace">
        {newlyMintedNFTs.map(nft => (
          <div key={`minted-${nft.id}`} className="flex-shrink-0 w-40 sm:w-48 snap-start">
            <NFTCard nft={nft} />
          </div>
        ))}
      </HomeSection>

      {/* 7. Jam Recommended Artist */}
      <HomeSection title="Jam Recommended Artists" icon={UserCheck} link="/explore/artists">
        {recommendedArtists.map(artist => (
          <Link 
            key={`artist-${artist.id}`} 
            to={`/artist/${artist.id}`}
            className="flex-shrink-0 group text-center space-y-3 snap-start"
          >
            <div className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-2 border-white/5 group-hover:border-blue-500/50 transition-all">
              <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-tight text-white group-hover:text-blue-500 transition-colors">{artist.name}</p>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{artist.followers.toLocaleString()} Followers</p>
            </div>
          </Link>
        ))}
      </HomeSection>

      {/* 8. Featured Playlist */}
      <HomeSection title="Featured Playlist" icon={ListMusic} link="/discover">
        {featuredPlaylist.map(track => (
          <div key={`playlist-${track.id}`} className="flex-shrink-0 w-40 sm:w-48 snap-start">
            <TrackCard track={track} />
          </div>
        ))}
      </HomeSection>

      {/* Community Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 lg:px-6">
        <div className="border border-white/5 rounded-[5px] p-8 space-y-6 bg-white/[0.02]">
          <div className="w-12 h-12 rounded-[5px] bg-blue-600/20 flex items-center justify-center text-blue-500">
            <Music2 className="h-6 w-6" />
          </div>
          <h3 className="text-3xl font-bold uppercase tracking-tighter text-white">Join the JamSpace</h3>
          <p className="text-white/40 leading-relaxed">
            Connect with other music lovers, share your favorite tracks, and discover new sounds in our community-driven JamSpace.
          </p>
          <Link to="/jamspace" className="inline-flex items-center gap-2 text-sm font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">
            Enter JamSpace <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        
        <div className="border border-white/5 rounded-[5px] p-8 space-y-6 bg-white/[0.02]">
          <div className="w-12 h-12 rounded-[5px] bg-purple-600/20 flex items-center justify-center text-purple-500">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h3 className="text-3xl font-bold uppercase tracking-tighter text-white">Artist Dashboard</h3>
          <p className="text-white/40 leading-relaxed">
            Are you a creator? Manage your music, track your earnings, and connect with your fans through our powerful artist tools.
          </p>
          <Link to="/artist-dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-purple-500 uppercase tracking-widest hover:text-purple-400 transition-colors">
            Go to Dashboard <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
