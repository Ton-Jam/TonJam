import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, ChevronRight, Zap, TrendingUp, Music2, ShoppingBag } from 'lucide-react';
import { MOCK_TRACKS, MOCK_NFTS, MOCK_ARTISTS } from '@/constants';
import TrackCard from '@/components/TrackCard';
import NFTCard from '@/components/NFTCard';
import SectionHeader from '@/components/SectionHeader';
import { useAudio } from '@/context/AudioContext';

const Home: React.FC = () => {
  const { playAll, artists } = useAudio();
  
  const featuredTracks = MOCK_TRACKS.slice(0, 4);
  const topNFTs = MOCK_NFTS.slice(0, 4);
  const trendingArtists = artists.slice(0, 5);

  return (
    <div className="p-6 lg:p-10 space-y-12 max-w-[1600px] mx-auto">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900/40 to-black border border-white/5 p-8 lg:p-16">
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
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center gap-3"
            >
              <Play className="h-5 w-5 fill-white" />
              Start Listening
            </button>
            <Link 
              to="/marketplace"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest rounded-2xl border border-white/10 transition-all flex items-center gap-3"
            >
              <ShoppingBag className="h-5 w-5" />
              Explore NFTs
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Tracks */}
      <section>
        <SectionHeader 
          title="Featured Tracks" 
          subtitle="Handpicked for you" 
          viewAllLink="/discover" 
        />
        <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar">
          {featuredTracks.map(track => (
            <div key={track.id} className="min-w-[280px] sm:min-w-[320px]">
              <TrackCard track={track} />
            </div>
          ))}
        </div>
      </section>

      {/* Trending Artists */}
      <section>
        <SectionHeader 
          title="Trending Artists" 
          subtitle="Rising stars on TonJam" 
          viewAllLink="/explore/artists" 
        />
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6 lg:mx-0 lg:px-0">
          {trendingArtists.map(artist => (
            <Link 
              key={artist.id} 
              to={`/artist/${artist.id}`}
              className="flex-shrink-0 group text-center space-y-3"
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
        </div>
      </section>

      {/* Top NFTs */}
      <section>
        <SectionHeader 
          title="Top Music NFTs" 
          subtitle="Rare collectibles & editions" 
          viewAllLink="/marketplace" 
        />
        <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar">
          {topNFTs.map(nft => (
            <div key={nft.id} className="min-w-[280px] sm:min-w-[320px]">
              <NFTCard nft={nft} />
            </div>
          ))}
        </div>
      </section>

      {/* Community Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-500">
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
        
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 flex items-center justify-center text-purple-500">
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
