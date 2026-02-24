
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_NFTS, TON_LOGO, MOCK_USER, MOCK_ARTISTS } from '../constants';
import NFTCard from '../components/NFTCard';
import MintModal from '../components/MintModal';
import TopChartNFTs from '../components/TopChartNFTs';
import { useAudio } from '../context/AudioContext';
import { NFTItem } from '../types';

const TABS = ['Trending', 'Auctions', 'Genesis', 'Limited', 'My Bids', 'My NFTs'];
const SORT_OPTIONS = ['Newest', 'Price: Low', 'Price: High', 'Rarity'];

const Marketplace: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Newest');
  const [showMintModal, setShowMintModal] = useState(false);
  const { addNotification } = useAudio();
  const scrollRef = useRef<HTMLDivElement>(null);

  const trendingNfts = useMemo(() => {
    return [...MOCK_NFTS]
      .sort((a, b) => {
        const offersA = a.offers?.length || 0;
        const offersB = b.offers?.length || 0;
        if (offersB !== offersA) return offersB - offersA;
        return parseFloat(b.price) - parseFloat(a.price);
      })
      .slice(0, 4);
  }, []);

  // Sorting for Top 4 Most Bidded (based on number of offers)
  const topBiddedNfts = useMemo(() => {
    return [...MOCK_NFTS]
      .filter(nft => nft.listingType === 'auction')
      .sort((a, b) => (b.offers?.length || 0) - (a.offers?.length || 0))
      .slice(0, 4);
  }, []);

  const userBids = useMemo(() => {
    return MOCK_NFTS.filter(nft => 
      nft.offers?.some(offer => offer.offerer === MOCK_USER.walletAddress)
    );
  }, []);

  const myNfts = useMemo(() => {
    return MOCK_NFTS.filter(nft => nft.owner === MOCK_USER.walletAddress);
  }, []);

  const filteredNfts = useMemo(() => {
    let list = [...MOCK_NFTS].filter(nft => {
      // For My NFTs tab, we want to show them regardless of listing status if they are owned by user
      // But for other tabs, we might only want listed ones. 
      // The original code filtered by `!nft.listingType` at the start.
      // We should adjust this.
      
      const isMyNft = nft.owner === MOCK_USER.walletAddress;
      
      // If we are in "My NFTs" tab, we show all owned NFTs
      if (activeTab === 'My NFTs') {
        if (!isMyNft) return false;
      } else {
        // For other tabs, generally show listed items
        if (!nft.listingType) return false;
      }

      const matchesSearch = nft.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           nft.creator.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (activeTab === 'Trending') return matchesSearch;
      if (activeTab === 'Genesis') return matchesSearch && nft.edition === 'Unique';
      if (activeTab === 'Limited') return matchesSearch && nft.edition === 'Limited';
      if (activeTab === 'Auctions') return matchesSearch && nft.listingType === 'auction';
      if (activeTab === 'My Bids') return matchesSearch && nft.offers?.some(o => o.offerer === MOCK_USER.walletAddress);
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
  }, [activeTab, searchQuery, sortBy]);

  // Auto-scroll logic for Bidding Relay
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
    return (price * supply).toLocaleString();
  };

  return (
    <div className="animate-in fade-in duration-700 pb-40 w-full min-h-screen">
      
      {/* 1. COMPACT MARKET TICKER */}
      <div className="sticky top-0 z-[45] bg-black/95 backdrop-blur-xl border-b border-white/5 py-1.5 px-6 flex items-center justify-between overflow-hidden whitespace-nowrap">
        <div className="flex items-center gap-2 mr-8 flex-shrink-0">
          <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em]">NODE_RELAY: ONLINE</span>
        </div>
        <div className="flex gap-16 animate-[marquee_35s_linear_infinite]">
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
            <div key={i} className="flex items-center gap-2">
              <span className="text-[7px] font-black uppercase text-white/20 tracking-widest">{stat.label}</span>
              <span className="text-[9px] font-black text-white tracking-tighter">{stat.val}</span>
              <i className={`fas fa-caret-${stat.up ? 'up text-green-500' : 'down text-red-500'} text-[6px]`}></i>
            </div>
          ))}
        </div>
      </div>

      {/* 3. REFINED CONTROLS (Compact & Integrated) - MOVED TO TOP */}
      <div className="sticky top-[28px] md:top-[28px] z-[39] bg-black/95 backdrop-blur-xl py-4 w-full px-4 md:px-8 border-y border-white/5 mb-8">
        <div className="max-w-[1280px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-6">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar w-full xl:w-auto pb-1">
            {TABS.map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${
                  activeTab === tab 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-500/20' 
                  : 'bg-white/5 text-white/30 border-white/5 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab}
                {tab === 'My Bids' && userBids.length > 0 && (
                  <span className="ml-2 text-blue-400">({userBids.length})</span>
                )}
                {tab === 'My NFTs' && myNfts.length > 0 && (
                  <span className="ml-2 text-blue-400">({myNfts.length})</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-1 xl:w-[280px]">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-[10px]"></i>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Scan Network..." 
                className="w-full bg-white/5 border border-white/10 py-2 pl-10 pr-4 rounded-full text-[11px] outline-none focus:border-blue-500/40 transition-all placeholder:text-white/10 text-white"
              />
            </div>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2">
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mr-3">Sort:</span>
              <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-white text-[9px] font-black uppercase outline-none cursor-pointer pr-1"
              >
                  {SORT_OPTIONS.map(opt => (
                      <option key={opt} value={opt} className="bg-[#050505]">{opt}</option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 pt-6">
        
        {/* 2. AUTO-SCROLLING BIDDING RELAY (1080x566 aspect) */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-amber-500 rounded-full animate-pulse shadow-[0_0_6px_#f59e0b]"></div>
              <h3 className="text-[8px] font-black text-white/40 uppercase tracking-[0.4em]">Live Relay: Top Bids</h3>
            </div>
            <div className="flex gap-1">
               {topBiddedNfts.map((_, i) => (
                 <div key={i} className="w-0.5 h-0.5 rounded-full bg-white/10"></div>
               ))}
            </div>
          </div>
          
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto no-scrollbar snap-x gap-4 pb-2"
          >
            {topBiddedNfts.map((nft) => (
              <div 
                key={nft.id}
                onClick={() => navigate(`/nft/${nft.id}`)}
                className="flex-shrink-0 w-full max-w-[1080px] snap-center cursor-pointer group"
              >
                <div className="relative aspect-[1080/480] bg-[#050505] rounded-xl overflow-hidden border border-white/5 hover:border-amber-500/30 transition-all shadow-2xl">
                  <img src={nft.imageUrl} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-[8s] group-hover:scale-105" alt={nft.title} />
                  
                  {/* Premium Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent flex flex-col justify-end p-5 md:p-8">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 glass rounded-md text-[8px] font-black uppercase tracking-widest border border-amber-500/20 text-amber-500 animate-pulse">
                        LIVE AUCTION
                      </span>
                      <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">{nft.offers?.length || 0} ACTIVE BIDS</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                      <div className="flex-1">
                        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white mb-1 leading-none drop-shadow-2xl">{nft.title}</h2>
                        <div className="flex items-center gap-3 text-blue-500">
                          <div className="flex items-center gap-2">
                            <img src={`https://picsum.photos/40/40?seed=${nft.creator}`} className="w-4 h-4 rounded-full border border-blue-500/30" alt="" />
                            <p className="text-[9px] font-black uppercase tracking-widest">@{nft.creator}</p>
                            {MOCK_ARTISTS.find(a => a.name === nft.creator)?.verified && (
                              <i className="fas fa-check-circle text-blue-500 text-[8px]"></i>
                            )}
                          </div>
                          <div className="h-3 w-px bg-white/10"></div>
                          <div className="flex flex-col">
                            <span className="text-[6px] text-white/40 uppercase font-black tracking-widest">Est. Market Cap</span>
                            <span className="text-[9px] text-white font-black tracking-tighter">{calculateMarketCap(nft)} TON</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 glass p-4 rounded-xl border-white/10 min-w-[240px]">
                        <div className="flex-1">
                          <p className="text-[7px] font-black text-white/20 uppercase tracking-[0.3em] mb-0.5">Highest Bid</p>
                          <div className="flex items-center gap-1.5">
                            <img src={TON_LOGO} className="w-4 h-4" alt="" />
                            <span className="text-xl font-black text-white tracking-tighter">{nft.price} TON</span>
                          </div>
                        </div>
                        <button className="px-6 py-2.5 electric-blue-bg rounded-lg text-[9px] font-black uppercase tracking-widest text-white shadow-xl active:scale-95 transition-all flex items-center gap-2">
                          BID NOW <i className="fas fa-chevron-right text-[7px]"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Forge Portal (Responsive Aspect) */}
            <div 
              onClick={() => setShowMintModal(true)}
              className="flex-shrink-0 w-full max-w-[1080px] aspect-[1080/480] snap-center border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center group cursor-pointer hover:border-blue-500/20 transition-all hover:bg-white/[0.01]"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-blue-500/10 transition-all border border-white/5">
                <i className="fas fa-plus text-white/10 group-hover:text-blue-500 transition-colors text-xl"></i>
              </div>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] group-hover:text-white transition-colors">Forge New Protocol</span>
            </div>
          </div>
        </section>

        {/* 2.5 TRENDING PROTOCOLS & TOP CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
          <section className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 electric-blue-bg rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
                <div>
                  <h2 className="text-xl font-black tracking-tighter uppercase text-white leading-none">Trending Protocols</h2>
                  <p className="text-[7px] font-black text-white/20 uppercase tracking-[0.4em] mt-1">High-bandwidth market signals detected</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('Trending')}
                className="text-[9px] font-black text-white/30 uppercase tracking-widest hover:text-blue-400 transition-colors flex items-center gap-2"
              >
                VIEW ALL <i className="fas fa-arrow-right text-[7px]"></i>
              </button>
            </div>
  
            <div className="flex overflow-x-auto no-scrollbar gap-5 pb-4 mask-linear-fade">
              {trendingNfts.map((nft, idx) => (
                <div 
                  key={nft.id}
                  onClick={() => navigate(`/nft/${nft.id}`)}
                  className="flex-shrink-0 w-56 md:w-64 group relative cursor-pointer"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  <div className="relative glass rounded-xl p-4 border border-white/5 hover:border-blue-500/30 transition-all bg-[#0a0a0a]/40 overflow-hidden">
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
                      <img src={nft.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={nft.title} />
                      <div className="absolute top-2 right-2">
                        <div className="px-2 py-1 glass rounded-md text-[7px] font-black uppercase tracking-widest text-white border border-white/10 flex items-center gap-1.5">
                          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                          {nft.price} TON
                        </div>
                      </div>
                    </div>
                      <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-white uppercase tracking-tighter truncate flex-1">{nft.title}</h3>
                        <span className="text-[6px] font-black text-blue-500 uppercase tracking-widest ml-2">{nft.edition}</span>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <img src={`https://picsum.photos/40/40?seed=${nft.creator}`} className="w-3.5 h-3.5 rounded-full border border-white/10" alt="" />
                          <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter">@{nft.creator}</span>
                          {MOCK_ARTISTS.find(a => a.name === nft.creator)?.verified && (
                            <i className="fas fa-check-circle text-blue-500 text-[7px]"></i>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <i className="fas fa-chart-line text-[7px] text-green-500"></i>
                          <span className="text-[8px] font-black text-white">{nft.offers?.length || 0} Bids</span>
                        </div>
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
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* 4. COMPACT MARKET GRID */}
        <section>
          {filteredNfts.length > 0 ? (
            <div className="flex overflow-x-auto no-scrollbar gap-6 pb-12 mask-linear-fade">
              {filteredNfts.map((nft, idx) => (
                <div key={nft.id} className="flex-shrink-0 w-56 md:w-64 animate-in slide-in-from-bottom-2" style={{ animationDelay: `${idx * 40}ms` }}>
                    <NFTCard nft={nft} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-32 flex flex-col items-center justify-center glass rounded-3xl border-dashed border-white/5 text-center bg-[#050505]/50">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <i className="fas fa-satellite-dish text-3xl text-white/5 animate-pulse"></i>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter text-white/20">Frequency Mismatch</h3>
              <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em] mt-2 px-8">No matching signals detected in the market relay.</p>
              <button 
                onClick={() => { setActiveTab('Trending'); setSearchQuery(''); }} 
                className="px-10 py-4 mt-10 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all active:scale-95"
              >
                Reset Scanner
              </button>
            </div>
          )}
        </section>

        {/* 5. MINIMALIST ALPHA DROP */}
        <section className="mt-16 pb-16">
          <div className="glass p-8 md:p-10 rounded-2xl border border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden bg-gradient-to-br from-blue-500/[0.03] to-transparent">
             <div className="absolute top-0 right-0 p-10 opacity-[0.02] -rotate-12"><i className="fas fa-bolt text-[10rem]"></i></div>
             <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-[8px] font-black text-blue-400 uppercase tracking-[0.5em]">Genesis Whitelist</span>
                </div>
                <h4 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-white leading-none">THE NEURAL DROP</h4>
                <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] mt-1.5">Subscribe to the relay for exclusive mint protocols.</p>
             </div>
             <div className="flex gap-2 w-full md:w-auto">
                <input type="email" placeholder="NEURAL_ID@MAIL.COM" className="flex-1 md:w-64 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-[9px] font-black outline-none focus:border-blue-500 text-white" />
                <button className="px-8 py-3 electric-blue-bg text-white rounded-lg font-black text-[9px] uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">SYNC</button>
             </div>
          </div>
        </section>
      </div>

      {showMintModal && <MintModal onClose={() => setShowMintModal(false)} />}
    </div>
  );
};

export default Marketplace;
