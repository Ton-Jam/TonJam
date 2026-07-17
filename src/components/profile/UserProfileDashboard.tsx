import React, { useState, useMemo } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { 
  Wallet, 
  Gem, 
  Activity, 
  ArrowUpRight, 
  ShoppingBag, 
  TrendingUp, 
  Coins, 
  Cpu, 
  Clock, 
  ExternalLink, 
  ShieldCheck, 
  Copy, 
  Check, 
  Play, 
  Pause, 
  Award,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar 
} from 'recharts';

export const UserProfileDashboard: React.FC = () => {
  const { 
    userProfile, 
    userNFTs = [], 
    transactions = [], 
    playTrack, 
    currentTrack, 
    isPlaying, 
    allTracks = [],
    addNotification 
  } = useAudio();

  const [copied, setCopied] = useState(false);
  const [nftSearch, setNftSearch] = useState('');

  // Clean TON Address
  const walletAddress = userProfile?.walletAddress || 'EQBvW3Fi_ZcrT9S6Jv5N3m9T7y9H5n7P5w9N7K5w9N7K5w9';
  const truncatedAddress = useMemo(() => {
    if (!walletAddress) return '';
    return `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 6)}`;
  }, [walletAddress]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    addNotification("Wallet address copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  // Recent Purchases Filtered
  const recentPurchases = useMemo(() => {
    return transactions
      .filter(tx => 
        tx.type === 'nft_sale' || 
        tx.type === 'jam_purchase' || 
        tx.type === 'premium_subscription' ||
        tx.type === 'tip' ||
        tx.type?.includes('purchase')
      )
      .slice(0, 5);
  }, [transactions]);

  // Owned NFTs filtered by search query
  const filteredNFTs = useMemo(() => {
    return userNFTs.filter(nft => {
      const q = nftSearch.toLowerCase();
      return (
        nft.title?.toLowerCase().includes(q) ||
        nft.creator?.toLowerCase().includes(q) ||
        nft.artist?.toLowerCase().includes(q)
      );
    });
  }, [userNFTs, nftSearch]);

  // Generate mock chart data based on transaction timestamps or fallback to nice activity data
  const activityChartData = useMemo(() => {
    if (transactions.length > 0) {
      // Group by last 7 days
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const counts: { [key: string]: { txs: number; gas: number; points: number } } = {};
      
      // Seed last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = days[d.getDay()];
        counts[dayName] = { txs: 0, gas: 0, points: 10 + (i * 5) };
      }

      transactions.forEach(tx => {
        const date = new Date(tx.timestamp);
        const dayName = days[date.getDay()];
        if (counts[dayName]) {
          counts[dayName].txs += 1;
          counts[dayName].gas += 0.012; // average simulated gas per transaction
          counts[dayName].points += 15;
        }
      });

      return Object.keys(counts).map(day => ({
        day,
        "Transactions": counts[day].txs || Math.floor(Math.random() * 3) + 1,
        "Gas Saved (mTON)": Math.round((counts[day].gas || (Math.random() * 0.05 + 0.01)) * 1000),
        "Ecosystem Points": counts[day].points
      }));
    }

    // Default mock data if no transactions yet
    return [
      { day: 'Mon', "Transactions": 2, "Gas Saved (mTON)": 24, "Ecosystem Points": 45 },
      { day: 'Tue', "Transactions": 5, "Gas Saved (mTON)": 60, "Ecosystem Points": 110 },
      { day: 'Wed', "Transactions": 3, "Gas Saved (mTON)": 36, "Ecosystem Points": 80 },
      { day: 'Thu', "Transactions": 8, "Gas Saved (mTON)": 96, "Ecosystem Points": 220 },
      { day: 'Fri', "Transactions": 6, "Gas Saved (mTON)": 72, "Ecosystem Points": 160 },
      { day: 'Sat', "Transactions": 12, "Gas Saved (mTON)": 144, "Ecosystem Points": 340 },
      { day: 'Sun', "Transactions": 9, "Gas Saved (mTON)": 108, "Ecosystem Points": 290 },
    ];
  }, [transactions]);

  const handlePlayNFT = (nft: any) => {
    // Try to find matching track in allTracks
    const matchingTrack = allTracks.find(t => t.id === nft.trackId || t.title?.toLowerCase() === nft.title?.toLowerCase());
    if (matchingTrack) {
      playTrack(matchingTrack);
    } else {
      // Play mock track created from NFT
      playTrack({
        id: nft.id || nft.trackId || 'mock-nft-track',
        title: nft.title || 'NFT Collectible',
        artist: nft.artist || nft.creator || 'Creator',
        coverUrl: nft.imageUrl || nft.coverUrl || '',
        audioUrl: nft.audioUrl || '',
        genre: 'Web3 Single',
        duration: 180,
        playCount: 1,
        likes: 1
      } as any);
    }
  };

  return (
    <div className="space-y-6 text-white font-sans" id="user-web3-profile-dashboard">
      
      {/* 1. TON Network Status & Balance Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="dashboard-web3-stats-grid">
        {/* Wallet Address & Status Card */}
        <div className="bg-[#101A3B]/60 backdrop-blur-md p-5 rounded-2xl flex flex-col justify-between shadow-lg" id="dashboard-card-wallet">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ledger Node</span>
              <div className="flex items-center gap-1.5 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Connected</span>
              </div>
            </div>
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-blue-400" />
              Active Wallet
            </h4>
            <p className="text-xs font-mono font-medium text-slate-400 mt-2 flex items-center gap-1.5 bg-white/[0.03] p-2 rounded-xl">
              {truncatedAddress}
              <button 
                onClick={handleCopyAddress} 
                className="hover:text-white ml-auto cursor-pointer p-1 rounded-md hover:bg-white/5 transition-colors"
                title="Copy address"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </p>
          </div>
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-4">
            TON Network Ingress Protocol
          </div>
        </div>

        {/* TON & JAM Balances Card */}
        <div className="bg-[#101A3B]/60 backdrop-blur-md p-5 rounded-2xl flex flex-col justify-between shadow-lg" id="dashboard-card-balance">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Liquid Asset</span>
              <Coins className="w-4 h-4 text-amber-400" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300">TON Balance</span>
                <span className="text-sm font-mono font-black text-white">{(userProfile?.tonBalance || 12.5).toFixed(2)} TON</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300">JAM Fuel</span>
                <span className="text-sm font-mono font-black text-blue-400">{(userProfile?.jamBalance || 450).toFixed(0)} JAM</span>
              </div>
            </div>
          </div>
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-4">
            Consolidated Crypto Valuation
          </div>
        </div>

        {/* Total Collectibles Card */}
        <div className="bg-[#101A3B]/60 backdrop-blur-md p-5 rounded-2xl flex flex-col justify-between shadow-lg" id="dashboard-card-collectibles">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Cryptographic Keys</span>
              <Gem className="w-4 h-4 text-purple-400" />
            </div>
            <h4 className="text-sm font-bold text-slate-200">Collected Music NFTs</h4>
            <p className="text-2xl font-mono font-black text-white mt-2">
              {userNFTs.length} <span className="text-xs font-normal text-slate-400">artifacts</span>
            </p>
          </div>
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-4">
            Decentralized Audio Catalog
          </div>
        </div>

        {/* Network Efficiency Summary */}
        <div className="bg-[#101A3B]/60 backdrop-blur-md p-5 rounded-2xl flex flex-col justify-between shadow-lg" id="dashboard-card-efficiency">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Network Telemetry</span>
              <Cpu className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">Transactions Count</span>
                <span className="font-mono font-bold">{transactions.length || 8}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">Gas Optimizer</span>
                <span className="font-mono font-bold text-emerald-400">Active</span>
              </div>
            </div>
          </div>
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-4">
            Performance Index: Excellent
          </div>
        </div>
      </div>

      {/* 2. Visual Area Chart - TON Network Transactions & Activity */}
      <div className="bg-[#101A3B]/40 backdrop-blur-md p-5 rounded-3xl shadow-lg space-y-4" id="dashboard-activity-chart-container">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ecosystem Heatmap</span>
            <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-400" />
              TON Network & Interaction Index
            </h4>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Gas Saved</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Points</span>
          </div>
        </div>

        {/* Chart View */}
        <div className="h-44 w-full" id="dashboard-chart-render">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 10 }} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#101a3b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px', fontWeight: 'bold' }} 
              />
              <Area 
                type="monotone" 
                dataKey="Gas Saved (mTON)" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorGas)" 
              />
              <Area 
                type="monotone" 
                dataKey="Ecosystem Points" 
                stroke="#a855f7" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPoints)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Main Dashboard Body - Columns Layout: Owned Music NFTs vs Recent Purchases */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-split-panels">
        {/* LEFT COLUMN: Owned Music NFTs Explorer (8 cols) */}
        <div className="lg:col-span-8 bg-[#101A3B]/40 backdrop-blur-md p-5 rounded-3xl shadow-lg space-y-4" id="dashboard-nft-explorer">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Vault Assets</span>
              <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                <Gem className="w-4 h-4 text-purple-400" />
                Your Owned Music NFTs
              </h4>
            </div>
            
            {/* Asset Search */}
            <input 
              type="text" 
              placeholder="Search owned items..." 
              value={nftSearch}
              onChange={(e) => setNftSearch(e.target.value)}
              className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-full text-xs font-medium placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all border-none"
            />
          </div>

          {/* Grid list of owned music NFTs */}
          {filteredNFTs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto pr-1" id="owned-nfts-grid-scroll">
              {filteredNFTs.map((nft) => {
                const isCurrent = currentTrack && (currentTrack.id === nft.trackId || currentTrack.title === nft.title);
                return (
                  <div 
                    key={nft.id} 
                    className="bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl p-3.5 flex items-center gap-4 transition-all duration-300 relative group overflow-hidden"
                  >
                    {/* Cover Photo */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                      <img 
                        src={nft.imageUrl || nft.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&h=150'} 
                        className="w-full h-full object-cover" 
                        alt={nft.title} 
                      />
                      
                      {/* Hover Overlay Play Icon */}
                      <button 
                        onClick={() => handlePlayNFT(nft)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                      >
                        {isCurrent && isPlaying ? (
                          <Pause className="w-5 h-5 text-blue-400 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 text-white fill-current" />
                        )}
                      </button>
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded text-[7px] font-black uppercase tracking-wider">
                          Edition {nft.edition || '1/1'}
                        </span>
                        <span className="text-[8px] font-mono text-slate-500 font-bold uppercase tracking-wider shrink-0">
                          {nft.price ? `${nft.price} TON` : 'Gated'}
                        </span>
                      </div>
                      <h5 className="text-xs font-black truncate text-slate-100 group-hover:text-blue-400 transition-colors">
                        {nft.title}
                      </h5>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                        {nft.artist || nft.creator || 'Emerging Creator'}
                      </p>
                      
                      {/* Active Player Stream indicator */}
                      {isCurrent && isPlaying && (
                        <div className="flex items-center gap-1.5 mt-2 text-[9px] font-bold text-blue-400 uppercase tracking-widest">
                          <span className="flex gap-0.5">
                            <span className="w-0.5 h-2 bg-blue-400 rounded animate-[bounce_0.6s_infinite_100ms]" />
                            <span className="w-0.5 h-3.5 bg-blue-400 rounded animate-[bounce_0.6s_infinite_200ms]" />
                            <span className="w-0.5 h-2 bg-blue-400 rounded animate-[bounce_0.6s_infinite_300ms]" />
                          </span>
                          <span>Streaming live</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-white/[0.015] flex flex-col items-center justify-center space-y-3" id="no-nfts-matched-placeholder">
              <Gem className="w-10 h-10 text-slate-600/50" />
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">No Web3 Collectibles Found</p>
                <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed font-medium">
                  {nftSearch ? "Try refining your search query." : "Expand your collection list by supporting artist drops in the Marketplace."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Recent Purchases Ledger (4 cols) */}
        <div className="lg:col-span-4 bg-[#101A3B]/40 backdrop-blur-md p-5 rounded-3xl shadow-lg space-y-4" id="dashboard-recent-purchases">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Cryptographic Invoices</span>
            <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              Recent Purchases
            </h4>
          </div>

          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1" id="recent-purchases-scroll">
            {recentPurchases.length > 0 ? (
              recentPurchases.map((tx) => (
                <div 
                  key={tx.id} 
                  className="bg-white/[0.015] p-3 rounded-2xl flex items-center justify-between border-none hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-200 truncate uppercase tracking-tight">
                        {tx.type === 'nft_sale' ? 'NFT Collectible' : (tx.type || 'Ecosystem Item').replace('_', ' ')}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5 font-bold tracking-tight">
                        {tx.trackTitle || 'Network Upgrade'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono font-black text-white">
                      {tx.amount} TON
                    </p>
                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 mt-0.5 block flex items-center gap-1 justify-end">
                      <ShieldCheck className="w-3 h-3" />
                      Settled
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center rounded-2xl bg-white/[0.015] flex flex-col items-center justify-center space-y-2" id="no-purchases-placeholder">
                <Clock className="w-8 h-8 text-slate-600/50 animate-pulse" />
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Zero Ledger Purchases</p>
                  <p className="text-[8px] text-slate-500 max-w-xs leading-relaxed font-medium">
                    New transaction confirmations will display immediately on completion.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileDashboard;
