import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  History, 
  Search, 
  Flame, 
  ArrowLeft, 
  Filter, 
  Clock, 
  Sparkles,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MOCK_NFTS, TON_LOGO } from '@/constants';
import NFTCard from '@/components/NFTCard';
import SectionHeader from '@/components/SectionHeader';
import { cn } from '@/lib/utils';

const LimitedNFTs: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | '1/1' | 'under-100'>('all');

  const limitedNFTs = useMemo(() => {
    let filtered = MOCK_NFTS.filter(nft => 
      nft.edition !== 'Open' && nft.edition !== 'Unlimited'
    );

    if (filterType === '1/1') {
      filtered = filtered.filter(nft => nft.edition === 'Unique' || nft.edition === '1/1');
    } else if (filterType === 'under-100') {
      filtered = filtered.filter(nft => {
        const supply = parseInt(nft.edition.split('/')[1] || nft.edition);
        return supply <= 100 && supply > 1;
      });
    }

    if (searchQuery) {
      filtered = filtered.filter(nft => 
        nft.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        nft.creator.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [searchQuery, filterType]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Editorial Header */}
      <div className="relative h-[300px] flex items-center justify-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full"></div>
        
        <div className="relative z-10 text-center space-y-6 px-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-orange-500">High Demand Sector</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
            Limited <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Editions</span>
          </h1>
          <p className="max-w-xl mx-auto text-muted-foreground text-sm font-medium leading-relaxed">
            Exclusive scarcity-backed audio artifacts. These editions are guaranteed to never be minted again, preserving provenance on the TON blockchain.
          </p>
        </div>
      </div>

      <main className="w-full w-full max-w-full px-6 mt-12 space-y-12">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass p-4 rounded-2xl border border-white/5">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search limited editions..." 
              className="pl-12 bg-background/50 border-none rounded-xl h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  const q = searchQuery.trim();
                  const saved = localStorage.getItem('tonjam_search_history') || localStorage.getItem('recentSearches');
                  const curr = saved ? JSON.parse(saved) : [];
                  const updated = [q, ...curr.filter((h: string) => h !== q)].slice(0, 10);
                  localStorage.setItem('tonjam_search_history', JSON.stringify(updated));
                  localStorage.setItem('recentSearches', JSON.stringify(updated));
                }
              }}
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
             {['all', '1/1', 'under-100'].map((type) => (
               <button
                 key={type}
                 onClick={() => setFilterType(type as any)}
                 className={cn(
                   "px-6 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                   filterType === type 
                     ? "bg-blue-600 text-white border-transparent shadow-lg shadow-blue-500/20" 
                     : "bg-transparent text-silver border-silver hover:bg-white/5 hover:text-white"
                 )}
               >
                 {type.replace('-', ' ')}
               </button>
             ))}
          </div>
        </div>

        {/* Results Grid */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
               <h2 className="text-xl font-black uppercase tracking-tight">{limitedNFTs.length} Artifacts Discovered</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {limitedNFTs.map((nft, i) => (
                <motion.div
                  key={nft.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: (i % 4) * 0.1 }}
                >
                  <NFTCard nft={nft} className="bg-white/[0.02] border-white/5 hover:bg-white/[0.04]" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {limitedNFTs.length === 0 && (
            <div className="py-32 flex flex-col items-center text-center space-y-6 glass border-white/5 rounded-3xl">
              <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center">
                 <Zap className="w-10 h-10 text-muted-foreground/30" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tighter">No Limited Editions Found</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">Try adjusting your filters or search query to find other rare audio artifacts.</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => { setSearchQuery(''); setFilterType('all'); }}
                className="rounded-full px-8 h-12 border-white/10 hover:bg-white/5 font-bold uppercase tracking-widest text-xs"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </section>

        {/* Scarcity Explained */}
        <section className="bg-gradient-to-br from-blue-600/5 to-purple-600/5 border border-white/5 rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
             <div className="space-y-8">
                <div className="space-y-2">
                   <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">Scarcity as a <br /> Protocol</h2>
                   <p className="text-muted-foreground text-sm md:text-base font-medium leading-relaxed">
                     On TonJam, scarcity is not just a marketing tool. It's a fundamental attribute of the minted artifact, enforced by smart contracts on the TON blockchain.
                   </p>
                </div>
                
                <div className="space-y-4">
                   {[
                     { title: 'Unique 1/1 Editions', desc: 'The most prestigious tier. Only one copy exists in perpetuity.' },
                     { title: 'Legendary Supplies', desc: 'Limited to fewer than 100 copies. Reserved for milestone tracks.' },
                     { title: 'Genesis Imprints', desc: 'The very first edition of any track ever minted on the platform.' }
                   ].map((item, i) => (
                     <div key={i} className="flex gap-4">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                           <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        </div>
                        <div>
                           <h4 className="font-bold text-sm uppercase tracking-tight">{item.title}</h4>
                           <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
             
             <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-black/40 border border-white/10 rounded-2xl p-8 space-y-6 backdrop-blur-xl">
                   <SectionHeader title="Verified Provenance" subtitle="On-chain Verification" />
                   <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                         <span className="text-[10px] font-bold text-muted-foreground uppercase">Token Standard</span>
                         <span className="text-xs font-black text-blue-400">TON NFT-v2</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                         <span className="text-[10px] font-bold text-muted-foreground uppercase">Storage Protocol</span>
                         <span className="text-xs font-black text-purple-400">TON Storage</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                         <span className="text-[10px] font-bold text-muted-foreground uppercase">Rights Management</span>
                         <span className="text-xs font-black text-emerald-400">Embedded Metadata</span>
                      </div>
                   </div>
                   <Button className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700 font-black shadow-xl shadow-blue-500/20">
                      View Protocol Documentation
                   </Button>
                </div>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LimitedNFTs;
