import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ArrowRight, Satellite, TrendingUp, ChevronRight, Zap } from 'lucide-react';
import { MOCK_NFTS, TON_LOGO, MOCK_USER, MOCK_ARTISTS } from '@/constants';
import NFTCard from '@/components/NFTCard';
import MintModal from '@/components/MintModal';
import TopChartNFTs from '@/components/TopChartNFTs';
import { useAudio } from '@/context/AudioContext';
import { NFTItem } from '@/types';
import { motion } from 'motion/react';

const TABS = ['Trending', 'Auctions', 'Genesis', 'Limited', 'My Bids', 'My NFTs'];
const SORT_OPTIONS = ['Newest', 'Price: Low', 'Price: High', 'Rarity'];

const Marketplace: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Trending');
  const [sortBy, setSortBy] = useState('Newest');
  const [showMintModal, setShowMintModal] = useState(false);
  const { addNotification, allNFTs, userProfile, searchQuery, setSearchQuery } = useAudio();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Premium TonJam Experience: World-Class Marketplace
  // --------------------------------------------------
  // This update focuses on layout density, technical typography, 
  // and hardware-inspired interactive elements.

  const trendingNfts = useMemo(() => {
    return [...allNFTs]
      .sort((a, b) => {
        const offersA = a.offers?.length || 0;
        const offersB = b.offers?.length || 0;
        if (offersB !== offersA) return offersB - offersA;
        return parseFloat(b.price) - parseFloat(a.price);
      })
      .slice(0, 4);
  }, [allNFTs]);

  /* Sorting for Top 4 Most Bidded (based on number of offers) */
  const topBiddedNfts = useMemo(() => {
    return [...allNFTs]
      .filter(nft => nft.listingType === 'auction')
      .sort((a, b) => (b.offers?.length || 0) - (a.offers?.length || 0))
      .slice(0, 4);
  }, [allNFTs]);

  const userBids = useMemo(() => {
    return allNFTs.filter(nft => nft.offers?.some(offer => offer.offerer === userProfile.walletAddress));
  }, [allNFTs, userProfile.walletAddress]);

  const myNfts = useMemo(() => {
    return allNFTs.filter(nft => nft.owner === userProfile.walletAddress);
  }, [allNFTs, userProfile.walletAddress]);

  const filteredNfts = useMemo(() => {
    let list = [...allNFTs].filter(nft => {
      const isMyNft = nft.owner === userProfile.walletAddress;
      if (activeTab === 'My NFTs') {
        if (!isMyNft) return false;
      } else {
        if (!nft.listingType) return false;
      }
      const matchesSearch = nft.title.toLowerCase().includes(searchQuery.toLowerCase()) || nft.creator.toLowerCase().includes(searchQuery.toLowerCase());
      if (activeTab === 'Trending') return matchesSearch;
      if (activeTab === 'Genesis') return matchesSearch && nft.edition === 'Unique';
      if (activeTab === 'Limited') return matchesSearch && nft.edition === 'Limited';
      if (activeTab === 'Auctions') return matchesSearch && nft.listingType === 'auction';
      if (activeTab === 'My Bids') return matchesSearch && nft.offers?.some(o => o.offerer === userProfile.walletAddress);
      if (activeTab === 'My NFTs') return matchesSearch && isMyNft;
      return matchesSearch;
    });

    if (sortBy === 'Price: Low') list.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    if (sortBy === 'Price: High') list.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    if (sortBy === 'Rarity') {
      const rarityMap: any = { 'Unique': 3, 'Rare': 2, 'Limited': 1 };
      list.sort((a, b) => (rarityMap[b.edition] || 0) - (rarityMap[a.edition] || 0));
    }
    return list;
  }, [activeTab, searchQuery, sortBy, allNFTs]);

  /* Auto-scroll logic for Bidding Relay */
  useEffect(() => {
    if (topBiddedNfts.length === 0) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [topBiddedNfts]);

  const calculateMarketCap = (nft: NFTItem) => {
    const price = parseFloat(nft.price);
    const supply = nft.edition === 'Unique' ? 1 : nft.edition === 'Limited' ? 100 : 500;
    return ((price || 0) * supply).toLocaleString();
  };

  return (
    <div className="animate-in fade-in duration-700 pb-40 w-full min-h-screen bg-black">
      {/* 1. COMPACT MARKET TICKER - Adjusted for Global Header */}
      <div className="sticky top-[64px] z-[38] bg-black/90 backdrop-blur-xl border-b border-white/5 py-2 px-6 flex items-center justify-between overflow-hidden whitespace-nowrap">
        <div className="flex items-center gap-3 mr-10 flex-shrink-0">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
          <span className="text-[8px] font-bold text-white/40 uppercase tracking-[0.4em]">Market_Relay: Active</span>
        </div>
        <div className="flex gap-20 animate-[marquee_40s_linear_infinite]">
          {[
            { label: 'TON/USD', val: '$5.42', up: true },
            { label: 'MARKET CAP', val: '24.2M TON', up: true },
            { label: 'AVG FLOOR', val: '4.8 TON', up: false },
            { label: 'NET VOLUME', val: '1.2M TON', up: true },
            { label: 'ACTIVE BIDS', val: '1,242', up: true },
            { label: 'NODES', val: '8,421', up: true },
            { label: 'TON/USD', val: '$5.42', up: true },
            { label: 'MARKET CAP', val: '24.2M TON', up: true },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-[8px] font-bold uppercase text-white/20 tracking-[0.2em]">{stat.label}</span>
              <span className="text-[10px] font-bold text-white tracking-tighter font-mono">{stat.val}</span>
              <TrendingUp className={`h-2.5 w-2.5 ${stat.up ? 'text-emerald-500' : 'text-rose-500 rotate-180'}`} />
            </div>
          ))}
        </div>
      </div>

      {/* 2. PREMIUM HERO / FEATURED AUCTION */}
      <div className="max-w-[1600px] mx-auto px-6 pt-10 mb-16">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-center">
          <div className="xl:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-full">
              <Zap className="h-3 w-3 text-blue-500" />
              <span className="text-[9px] font-bold text-blue-500 uppercase tracking-[0.3em]">Featured Protocol Drop</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter uppercase text-white leading-[0.85]">
              Sonic <br /> <span className="text-blue-600">Relay</span> v1.0
            </h1>
            <p className="text-sm text-white/40 max-w-lg leading-relaxed uppercase tracking-widest font-medium">
              The first generative audio protocol minted on the TonJam neural network. Limited to 100 unique artifacts.
            </p>
            <div className="flex flex-wrap gap-6">
              <button className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[8px] font-bold text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/20 active:scale-95 transition-all">
                Explore Collection
              </button>
              <button className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-[8px] font-bold text-[11px] uppercase tracking-[0.3em] active:scale-95 transition-all">
                View Whitepaper
              </button>
            </div>
          </div>
          <div className="xl:col-span-5 relative group">
            <div className="absolute -inset-4 bg-blue-600/10 blur-3xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity"></div>
            <div className="relative aspect-square rounded-[16px] overflow-hidden border border-white/10 shadow-2xl bg-[#050505]">
              <img src="https://picsum.photos/seed/sonic/800/800" className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-[10s]" alt="Featured NFT" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-10 flex flex-col justify-end">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Current Valuation</p>
                    <p className="text-3xl font-bold text-white tracking-tighter">420.69 <span className="text-sm text-blue-500">TON</span></p>
                  </div>
                  <button className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl active:scale-90 transition-all">
                    <ArrowRight className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. REFINED CONTROLS - Adjusted for Global Header + Ticker */}
      <div className="sticky top-[108px] z-[37] bg-black/95 backdrop-blur-2xl border-b border-white/5 py-5 w-full px-6 mb-12">
        <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-8">
          <div className="flex gap-2 overflow-x-auto no-scrollbar w-full xl:w-auto pb-1">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-shrink-0 px-8 py-3 rounded-[8px] text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative group ${ activeTab === tab ? 'text-white' : 'text-white/20 hover:text-white' }`} >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                )}
                {tab === 'My Bids' && userBids.length > 0 && (
                  <span className="ml-2 text-blue-500 font-mono">[{userBids.length}]</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 w-full xl:w-auto">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-full px-6 py-3">
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest mr-4">Filter:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent text-white text-[10px] font-bold uppercase outline-none cursor-pointer pr-2" >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt} value={opt} className="bg-[#050505]">{opt}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6">
        {/* 4. LIVE BIDDING RELAY - ENHANCED */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_#f59e0b]"></div>
              <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.5em]">Live_Auction_Relay</h3>
            </div>
            <div className="flex gap-2">
              {topBiddedNfts.map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-white/10"></div>
              ))}
            </div>
          </div>
          
          <div ref={scrollRef} className="flex overflow-x-auto no-scrollbar snap-x gap-8 pb-4" >
            {topBiddedNfts.map((nft) => (
              <div key={nft.id} onClick={() => navigate(`/nft/${nft.id}`)} className="flex-shrink-0 w-full lg:w-[calc(50%-16px)] snap-center cursor-pointer group" >
                <div className="relative aspect-[16/7] bg-[#0a0a0a] border border-white/5 rounded-[12px] overflow-hidden transition-all group-hover:border-white/20 shadow-2xl">
                  <img src={nft.imageUrl} className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 transition-all duration-[10s] group-hover:scale-105" alt={nft.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[9px] font-bold uppercase tracking-widest text-amber-500"> 
                        <span className="animate-pulse">●</span> LIVE AUCTION 
                      </div>
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">{nft.offers?.length || 0} SIGNALS</span>
                    </div>
                    <div className="flex items-end justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter text-white mb-2 truncate leading-none">{nft.title}</h2>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                            <img src={`https://picsum.photos/40/40?seed=${nft.creator}`} className="w-4 h-4 rounded-full" alt="" />
                            <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">@{nft.creator}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[7px] text-white/20 uppercase font-bold tracking-widest">Market Cap</span>
                            <span className="text-[10px] text-white font-bold tracking-tighter font-mono">{calculateMarketCap(nft)} TON</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-[12px] flex items-center gap-8 min-w-[280px]">
                        <div className="flex-1">
                          <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.4em] mb-1">High Bid</p>
                          <div className="flex items-center gap-2">
                            <img src={TON_LOGO} className="w-5 h-5" alt="" />
                            <span className="text-2xl font-bold text-white tracking-tighter font-mono">{nft.price}</span>
                          </div>
                        </div>
                        <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-[8px] text-[10px] font-bold uppercase tracking-widest text-white shadow-xl active:scale-95 transition-all"> BID_NOW </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. CREATOR PORTAL - NEW WORLD CLASS SECTION */}
        {userProfile.isVerifiedArtist && (
          <section className="mb-24">
            <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-transparent border border-white/5 p-10 rounded-[20px] flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group">
              <div className="absolute -left-20 -top-20 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full group-hover:bg-blue-600/20 transition-all"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 rounded-[16px] bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-blue-500/50 transition-all">
                  <Plus className="h-8 w-8 text-blue-500" />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-tighter text-white mb-2">Forge New Protocol</h3>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em]">Initialize a new generative asset on the neural relay</p>
                </div>
              </div>
              <button 
                onClick={() => setShowMintModal(true)}
                className="relative z-10 px-12 py-5 bg-white text-black rounded-[10px] font-bold text-[11px] uppercase tracking-[0.3em] hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-2xl"
              >
                Launch_Forge
              </button>
            </div>
          </section>
        )}

        {/* 5. TRENDING & TOP CHARTS - BENTO STYLE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
          <section className="lg:col-span-8">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-5">
                <div className="w-1.5 h-10 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
                <div>
                  <h2 className="text-3xl font-bold tracking-tighter uppercase text-white leading-none">Trending Protocols</h2>
                  <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.5em] mt-2">High-bandwidth market signals detected</p>
                </div>
              </div>
              <button onClick={() => navigate('/explore/nfts?title=Trending Protocols&filter=trending_nfts')} className="text-[10px] font-bold text-white/30 uppercase tracking-widest hover:text-blue-500 transition-all flex items-center group" >
                VIEW ALL <ChevronRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {trendingNfts.map((nft) => (
                <div key={nft.id} onClick={() => navigate(`/nft/${nft.id}`)} className="group relative cursor-pointer" >
                  <div className="relative rounded-[12px] p-3 transition-all bg-[#0a0a0a] border border-white/5 hover:border-white/20 overflow-hidden">
                    <div className="relative aspect-square rounded-[8px] overflow-hidden mb-4">
                      <img src={nft.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={nft.title} />
                      <div className="absolute top-3 right-3">
                        <div className="px-2.5 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-[6px] text-[9px] font-bold uppercase tracking-widest text-white flex items-center gap-2">
                          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                          {nft.price} TON
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-white uppercase tracking-tight truncate">{nft.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest truncate">@{nft.creator}</span>
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="lg:col-span-4">
            <TopChartNFTs nfts={MOCK_NFTS} title="Top Chart NFTs" />
          </section>
        </div>

        {/* 6. MAIN MARKET GRID */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-5">
              <div className="w-1.5 h-10 bg-white/10 rounded-full"></div>
              <h2 className="text-3xl font-bold tracking-tighter uppercase text-white leading-none">Market Explorer</h2>
            </div>
            <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">
              {filteredNfts.length} Protocols Found
            </div>
          </div>
          
          {filteredNfts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {filteredNfts.map((nft, idx) => (
                <motion.div 
                  key={nft.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <NFTCard nft={nft} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-40 flex flex-col items-center justify-center rounded-[16px] text-center bg-[#050505] border border-white/5">
              <div className="w-24 h-24 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-8">
                <Satellite className="h-10 w-10 text-white/10 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-tighter text-white/40">Signal Mismatch</h3>
              <p className="text-[11px] font-bold text-white/10 uppercase tracking-[0.5em] mt-3 px-12 max-w-md mx-auto leading-loose">No matching signals detected in the market relay. Adjust your scanner parameters.</p>
              <button onClick={() => { setActiveTab('Trending'); setSearchQuery(''); }} className="px-12 py-5 mt-12 bg-white/5 border border-white/10 rounded-[10px] text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-95" > Reset Scanner </button>
            </div>
          )}
        </section>

        {/* 7. ALPHA DROP / SUBSCRIPTION */}
        <section className="pb-32">
          <div className="bg-[#0a0a0a] border border-blue-500/20 p-12 md:p-16 rounded-[20px] flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] -rotate-12 group-hover:opacity-[0.06] transition-opacity"><Zap className="h-64 w-64 text-blue-500" /></div>
            <div className="text-center lg:text-left relative z-10">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.6em]">Genesis Whitelist</span>
              </div>
              <h4 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter text-white leading-none mb-6">THE NEURAL <br /> DROP</h4>
              <p className="text-xs text-white/30 uppercase tracking-[0.4em] max-w-md leading-relaxed">Subscribe to the relay for exclusive mint protocols and early access to genesis artifacts.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto relative z-10">
              <input type="email" placeholder="NEURAL_ID@NETWORK.COM" className="flex-1 lg:w-80 bg-black/60 border border-white/10 rounded-[10px] px-6 py-5 text-xs font-bold outline-none text-white focus:border-blue-500/50 transition-all placeholder:text-white/10" />
              <button className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[10px] font-bold text-[11px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-600/30 active:scale-95 transition-all">SYNC_NOW</button>
            </div>
          </div>
        </section>
      </div>
      {showMintModal && <MintModal onClose={() => setShowMintModal(false)} />}
    </div>
  );
};

export default Marketplace;
