import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Gavel, 
  Search, 
  Filter, 
  ArrowUpRight, 
  TrendingUp, 
  Clock, 
  Gem, 
  Flame, 
  Zap,
  ChevronRight,
  ShieldCheck,
  Music,
  Share2,
  Users,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MOCK_NFTS, MOCK_ARTISTS, TON_LOGO, APP_LOGO } from '@/constants';
import NFTCard from '@/components/NFTCard';
import SectionHeader from '@/components/SectionHeader';
import { useAudio } from '@/context/AudioContext';
import { NFTItem } from '@/types';
import { cn } from '@/lib/utils';

const AuctionScreen: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification, allNFTs } = useAudio();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortOrder, setSortOrder] = useState<'ending-soon' | 'price-low' | 'price-high' | 'newest'>('ending-soon');
  const [visibleCount, setVisibleCount] = useState(12);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Filter only auction listings and add synthetic items for infinite feel
  const auctionNFTs = useMemo(() => {
    let baseItems = allNFTs.filter(nft => nft.listingType === 'auction');
    
    // Generate synthetic items if we have few auctions for better UX demo
    if (baseItems.length < 12 && MOCK_NFTS.some(n => n.listingType === 'auction')) {
      const mockAuctions = MOCK_NFTS.filter(n => n.listingType === 'auction');
      const extraItems: NFTItem[] = Array.from({ length: 48 }).map((_, i) => ({
        ...mockAuctions[i % mockAuctions.length],
        id: `synthetic-${i}`,
        title: `${mockAuctions[i % mockAuctions.length].title} (Resale #${i + 100})`,
        price: (parseFloat(mockAuctions[i % mockAuctions.length].price) * (0.8 + Math.random() * 0.5)).toFixed(2),
        auctionEndTime: new Date(Date.now() + Math.random() * 1000 * 60 * 60 * 72).toISOString()
      }));
      baseItems = [...baseItems, ...extraItems];
    }

    let filtered = baseItems;
    
    if (activeTab === 'premium') {
      filtered = filtered.filter(nft => parseFloat(nft.price) > 20);
    } else if (activeTab === 'ending') {
      // Logic for ending soon (within 6 hours)
      const sixHoursFromNow = Date.now() + 6 * 60 * 60 * 1000;
      filtered = filtered.filter(nft => nft.auctionEndTime && new Date(nft.auctionEndTime).getTime() < sixHoursFromNow);
    }

    if (searchQuery) {
      filtered = filtered.filter(nft => 
        nft.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        nft.creator.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    switch (sortOrder) {
      case 'ending-soon':
        filtered.sort((a, b) => {
          const timeA = a.auctionEndTime ? new Date(a.auctionEndTime).getTime() : Infinity;
          const timeB = b.auctionEndTime ? new Date(b.auctionEndTime).getTime() : Infinity;
          return timeA - timeB;
        });
        break;
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'price-low':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'newest':
        filtered.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });
        break;
    }

    return filtered;
  }, [searchQuery, activeTab, sortOrder]);

  const recommendations = useMemo(() => {
    return MOCK_NFTS.filter(nft => nft.listingType !== 'auction').slice(0, 4);
  }, []);

  // Infinite Scroll Logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < auctionNFTs.length) {
          setVisibleCount(prev => prev + 8);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [auctionNFTs.length, visibleCount]);

  const featuredAuction = auctionNFTs[0];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Immersive Header */}
      <header className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={featuredAuction?.imageUrl || 'https://image.pollinations.ai/prompt/abstract%20cyberpunk%20blue%20neon%20background?width=1920&height=1080&nologo=true'} 
            className="w-full h-full object-cover opacity-30 scale-105 blur-sm"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 text-blue-500 font-bold uppercase tracking-[0.2em] text-xs">
              <Zap className="w-4 h-4 fill-blue-500" />
              <span>Live Auctions on TON</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
              Genesis <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Forge</span>
            </h1>
            <p className="text-muted-foreground/80 text-sm md:text-base max-w-md font-medium leading-relaxed">
              Propel the decentralized music economy. Bid on rare genesis editions and back your favorite artists directly on the TON blockchain.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/genesis-forge')}
                className="rounded-full px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-bold h-12"
              >
                Enter Genesis Forge
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/marketplace')}
                className="rounded-full px-5 border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 font-bold h-9 text-xs"
              >
                Explore Market
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hidden md:block"
          >
            {featuredAuction && (
              <div className="relative group perspective-1000">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="aspect-square relative">
                    <img src={featuredAuction.imageUrl} className="w-full h-full object-cover" alt={featuredAuction.title} />
                    <div className="absolute top-4 right-4 animate-pulse">
                      <Badge className="bg-red-500 hover:bg-red-600 text-white border-none font-bold px-3">LIVE</Badge>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <h2 className="text-xl font-bold uppercase tracking-tight">{featuredAuction.title}</h2>
                        <p className="text-xs text-muted-foreground font-bold">@{featuredAuction.creator}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Current Bid</p>
                        <div className="flex items-center gap-1 justify-end">
                          <img src={TON_LOGO} alt="TON" className="w-4 h-4" />
                          <span className="text-lg font-black">{featuredAuction.price}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => navigate(`/nft/${featuredAuction.id}`)}
                      className="w-full py-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20"
                    >
                      Place Your Bid
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </header>

      {/* Main Controls */}
      <div className="w-full relative z-20">
        <div className="bg-card border-none rounded-none md:rounded-2xl p-4 md:shadow-2xl flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, artist, or collection..." 
              className="pl-12 bg-background/50 border-none rounded-xl h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="scroll-row w-full md:w-auto mt-2 md:mt-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-transparent p-0 rounded-none w-full">
              <TabsList className="bg-transparent border-none p-0 gap-2 flex">
                <TabsTrigger 
                  value="all" 
                  className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap bg-transparent hover:bg-white/5 text-muted-foreground border border-[#C0C0C0]/25 data-[state=active]:border-transparent hover:border-[#C0C0C0]/50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_12px_rgba(37,99,235,0.2)] hover:text-foreground shrink-0 cursor-pointer h-auto"
                >
                  All
                </TabsTrigger>
                <TabsTrigger 
                  value="ending" 
                  className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap bg-transparent hover:bg-white/5 text-muted-foreground border border-[#C0C0C0]/25 data-[state=active]:border-transparent hover:border-[#C0C0C0]/50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_12px_rgba(37,99,235,0.2)] hover:text-foreground shrink-0 cursor-pointer h-auto"
                >
                  Ending Soon
                </TabsTrigger>
                <TabsTrigger 
                  value="premium" 
                  className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap bg-transparent hover:bg-white/5 text-muted-foreground border border-[#C0C0C0]/25 data-[state=active]:border-transparent hover:border-[#C0C0C0]/50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_12px_rgba(37,99,235,0.2)] hover:text-foreground shrink-0 cursor-pointer h-auto"
                >
                  Premium
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl h-12 gap-2 border-white/5 bg-background/40 font-bold text-xs uppercase tracking-widest min-w-[160px]">
                  <Filter className="w-4 h-4" />
                  {sortOrder.replace('-', ' ')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl bg-card border-white/5">
                <DropdownMenuItem onClick={() => setSortOrder('ending-soon')} className="rounded-lg font-bold">Ending Soon</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder('price-high')} className="rounded-lg font-bold">Price: High to Low</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder('price-low')} className="rounded-lg font-bold">Price: Low to High</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder('newest')} className="rounded-lg font-bold">Newest First</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <main className="w-full max-w-7xl mx-auto px-6 mt-12 space-y-16">
        {/* Statistics Bar */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Volume', value: '1.2M TON', icon: ArrowUpRight, color: 'text-blue-500' },
            { label: 'Active Bidders', value: '4.2k', icon: Users, color: 'text-purple-500' },
            { label: 'Royalties Paid', value: '85.4k TON', icon: Gem, color: 'text-amber-500' },
            { label: 'NFTs Minted', value: '12.8k', icon: Sparkles, color: 'text-emerald-500' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="bg-card/30 border border-white/5 rounded-2xl p-4 flex items-center gap-4"
            >
              <div className={cn("p-3 rounded-xl bg-muted/50", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{stat.label}</p>
                <p className="text-xl font-black">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Live Grid */}
        <section className="space-y-8">
           <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">Live Auctions</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">{auctionNFTs.length} Assets Found</p>
                </div>
              </div>
           </div>

           <div className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {auctionNFTs.slice(0, visibleCount).map((nft, index) => (
                  <motion.div
                    key={nft.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group"
                  >
                     <div className="bg-card border border-white/5 p-3 rounded-xl flex items-center gap-4 hover:border-blue-500/30 transition-all">
                        <img src={nft.imageUrl} className="w-16 h-16 rounded-lg object-cover" alt={nft.title} />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black uppercase tracking-tight text-[11px] truncate">{nft.title}</h3>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase truncate">{nft.creator}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[8px] text-muted-foreground font-black uppercase">Bid</p>
                          <p className="text-xs font-black">{nft.price} TON</p>
                        </div>
                        <Button 
                          onClick={() => navigate(`/nft/${nft.id}`)}
                          className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black text-[9px] uppercase shadow-lg h-7 px-3 flex-shrink-0"
                        >
                          Bid
                        </Button>
                     </div>
                  </motion.div>
                ))}
              </AnimatePresence>
           </div>
           
           {/* Loader Target */}
           <div ref={observerTarget} className="h-20 flex items-center justify-center">
              {visibleCount < auctionNFTs.length && (
                <div className="relative">
                   <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                   <div className="absolute inset-0 bg-blue-500/10 blur-xl animate-pulse rounded-full"></div>
                </div>
              )}
           </div>
        </section>

        {/* Recommendations Section */}
        <section className="bg-muted/10 border border-white/5 rounded-3xl p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          
          <SectionHeader 
            title="Premium Selections" 
            subtitle="Curated picks from our top curators"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {recommendations.map((nft) => (
              <NFTCard key={nft.id} nft={nft} className="bg-background/40 hover:bg-background/60" />
            ))}
          </div>
          
          <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-blue-600/10 rounded-2xl border border-blue-500/20">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                   <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                   <h4 className="font-bold">TonJam Certified Marketplace</h4>
                   <p className="text-xs text-muted-foreground">Every NFT is verified for copyright integrity and artist authenticity.</p>
                </div>
             </div>
             <Button variant="link" className="text-blue-400 font-bold p-0 flex items-center gap-2 group">
                Learn about verification <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </Button>
          </div>
        </section>

        {/* Trust Factors */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10">
          {[
            { 
              title: "Instant Settlements", 
              desc: "Auction proceeds are settled instantly on the TON blockchain after completion.",
              icon: Zap 
            },
            { 
              title: "Verified IP", 
              desc: "Rights management is baked into the metadata via our decentralized storage layer.",
              icon: Music 
            },
            { 
              title: "Low Network Fees", 
              desc: "TON's hyper-scalability ensures you keep more of your money during fierce bidding wars.",
              icon: TrendingUp 
            }
          ].map((item, i) => (
            <div key={i} className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <item.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <h4 className="font-bold text-lg">{item.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </section>
      </main>

      {/* Persistent Call to Action */}
      <footer className="w-full bg-card/60 backdrop-blur-md border-t border-white/5 py-12">
        <div className="max-w-4xl mx-auto text-center px-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
             <img src={APP_LOGO} className="w-16 h-16" alt="TonJam" />
             <h2 className="text-3xl font-black uppercase tracking-tighter">Ready to join the next drop?</h2>
             <p className="text-muted-foreground">Don't miss out on exclusive limited edition NFTs from the world's most promising independent artists.</p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" className="rounded-full bg-foreground text-background font-black h-14 px-10 hover:bg-foreground/90 transition-all">
              Join Discord
            </Button>
            <Button variant="outline" size="lg" className="rounded-full h-14 px-10 border-white/10 bg-white/5 font-black hover:bg-white/10 transition-all">
              Notify Me
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuctionScreen;
