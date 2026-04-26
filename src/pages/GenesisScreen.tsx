import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  ShieldCheck, 
  Music, 
  Gem, 
  Sparkles, 
  Layers, 
  Cpu, 
  Code,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Lock
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MOCK_NFTS, MOCK_ARTISTS, TON_LOGO, TJ_COIN_ICON } from '@/constants';
import NFTCard from '@/components/NFTCard';
import { cn } from '@/lib/utils';

const GenesisScreen: React.FC = () => {
  const navigate = useNavigate();

  const genesisNFTs = useMemo(() => {
    return MOCK_NFTS.filter(nft => nft.title.toLowerCase().includes('genesis') || nft.edition === 'Unique');
  }, []);

  const featuredArtists = useMemo(() => {
    return MOCK_ARTISTS.slice(0, 4);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-x-hidden">
      {/* Immersive Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[1000px] h-[1000px] bg-blue-600/10 blur-[180px] rounded-full -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-purple-600/10 blur-[150px] rounded-full translate-y-1/2"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
      </div>

      {/* Editorial Hero */}
      <section className="relative h-screen flex flex-col items-center justify-center pt-20 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center space-y-8 max-w-5xl relative z-10"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-500"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-500 italic">Protocol V.01 Initialized</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue-500"></div>
          </div>

          <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] italic">
            THE <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-amber-500 animate-pulse">GENESIS</span> <br/>
            FORGE
          </h1>

          <div className="max-w-2xl mx-auto space-y-6">
            <p className="text-muted-foreground text-sm md:text-lg font-medium leading-relaxed tracking-tight">
              The foundational block of TonJam. 1,000 unique audio artifacts forged on TON for the pioneers of decentralized music. This remains the most rare tier in existence.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-6 pt-8">
              <Button 
                size="lg" 
                className="rounded-full px-12 bg-white text-black hover:bg-white/90 font-black italic h-14 group"
              >
                Enter Collection <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full px-12 border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 font-black italic h-14"
              >
                Whitepaper
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/50">Explore Lore</span>
          <div className="w-px h-12 bg-gradient-to-b from-blue-500 to-transparent"></div>
        </div>
      </section>

      {/* Stats Section - Technical Design */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-white/5 divide-x divide-y md:divide-y-0 border-collapse bg-white/[0.02] backdrop-blur-sm">
          {[
            { label: 'Supply Cap', value: '1,000', sub: 'Fixed Forever' },
            { label: 'Forge Date', value: 'OCT 2023', sub: 'Inaugural Batch' },
            { label: 'Protocol', value: 'TON NFT-2', sub: 'Compressed Storage' },
            { label: 'Royalties', value: '7.5%', sub: 'Artist Perpetual' },
          ].map((stat, i) => (
            <div key={i} className="p-8 md:p-12 flex flex-col justify-between group hover:bg-white/[0.03] transition-colors">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground group-hover:text-blue-500 transition-colors">{stat.label}</span>
              <div className="mt-6">
                <p className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground/60 font-bold mt-1 uppercase tracking-widest">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Genesis Grid */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <Badge className="bg-blue-600/10 text-blue-500 border-blue-500/20 font-black italic px-4">MASTERWORKS</Badge>
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
              Artifact <br/> Showcase
            </h2>
          </div>
          <p className="text-muted-foreground max-w-sm text-sm font-medium leading-relaxed">
            Every Genesis NFT functions as a high-fidelity key. Owners receive governance rights, exclusive air-drops, and lifetime whitelist access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {genesisNFTs.map((nft, i) => (
            <motion.div 
              key={nft.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <NFTCard nft={nft} className="bg-white/[0.02] border-white/5 shadow-2xl hover:bg-white/[0.05]" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* The Architects - Artist Highlight */}
      <section className="bg-white/[0.01] border-y border-white/5 py-32 overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-6 space-y-20">
          <div className="text-center space-y-4">
             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500">The Creators</span>
             <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">Architects of Sound</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {featuredArtists.map((artist, i) => (
              <motion.div 
                key={artist.uid}
                whileHover={{ y: -10 }}
                className="flex flex-col items-center text-center space-y-6 group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-blue-500/50 transition-colors">
                    <img src={artist.avatarUrl} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" alt={artist.name} />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black italic uppercase tracking-tight">{artist.name}</h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{artist.genre} Pioneer</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lore / Utility Cards */}
      <section className="w-full max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              title: "Adaptive Audio", 
              desc: "Genesis artifacts are multiversal. Their metadata evolves based on playcount and community interaction.",
              icon: Cpu,
              color: "text-blue-500"
            },
            { 
              title: "IP Governance", 
              desc: "Holders vote on the commercial licensing of Genesis stems for multi-media appearances.",
              icon: ShieldCheck,
              color: "text-amber-500"
            },
            { 
              title: "Forge Priority", 
              desc: "Whitelist access to every subsequent 'Series One' collection and partner drop.",
              icon: Layers,
              color: "text-purple-500"
            },
          ].map((item, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/5 rounded-3xl p-10 space-y-6 hover:border-white/20 transition-all">
              <div className={cn("inline-flex p-4 rounded-2xl bg-white/[0.05]", item.color)}>
                <item.icon className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-black italic uppercase tracking-tight">{item.title}</h4>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Call to Action */}
      <footer className="relative py-40 overflow-hidden text-center bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-500/10"></div>
        <div className="relative z-10 max-w-2xl mx-auto px-6 space-y-10">
          <div className="inline-flex flex-col items-center">
            <img src={TON_LOGO} className="w-12 h-12 mb-6 grayscale hover:grayscale-0 transition-all cursor-pointer" alt="TON" />
            <h2 className="text-5xl font-black italic uppercase tracking-tighter">Secure the Alpha</h2>
            <p className="text-muted-foreground text-lg font-medium">Genesis supply is 94% distributed. Final unique drops occurring soon.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <Button size="lg" className="w-full sm:w-auto rounded-full px-12 bg-white text-black font-black italic h-14">
                Browse Marketplace
             </Button>
             <Button variant="ghost" size="lg" className="w-full sm:w-auto text-blue-500 hover:text-blue-400 font-black italic h-14">
                Contract Proof <ExternalLink className="ml-2 w-4 h-4" />
             </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GenesisScreen;
