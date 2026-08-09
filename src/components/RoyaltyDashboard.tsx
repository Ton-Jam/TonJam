import React from 'react';
import { ChartLine, Gem, Wallet, Settings, Cpu, Play, Terminal, Check, ChevronDown, ChevronUp, Code, Sparkles, TrendingUp } from 'lucide-react';
import { Artist } from '@/types';
import { TJ_COIN_ICON, TON_LOGO } from '@/constants';
import RoyaltyStatusCard from '@/components/RoyaltyStatusCard';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

const ResponsiveContainerRC = ResponsiveContainer as any;
const AreaChartRC = AreaChart as any;
const AreaRC = Area as any;
const XAxisRC = XAxis as any;
const YAxisRC = YAxis as any;
const TooltipRC = Tooltip as any;
const CartesianGridRC = CartesianGrid as any;

interface RoyaltyDashboardProps {
  artist: Artist;
  onConfigure?: () => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950 p-3 rounded-lg border-none shadow-2xl space-y-1.5 min-w-[124px]">
        <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{label} 2026</p>
        <div className="space-y-1">
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center justify-between gap-4">
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: entry.color }}>
                {entry.name}
              </span>
              <span className="text-[10px] font-bold text-white font-mono">
                {entry.value} GRAM
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const RoyaltyDashboard: React.FC<RoyaltyDashboardProps> = ({ artist, onConfigure }) => {
  const earnings = artist.earnings || { streaming: 0, nftSales: 0, total: 0 };
  const config = artist.royaltyConfig;
  const streamingPercentage = config?.streamingPercentage ?? 0.05;
  const nftSaleShare = config?.nftSaleShare ?? 0.10;

  const streamingSplits = config?.streamingSplits || [];
  const nftSaleSplits = config?.nftSaleSplits || [];

  const [activeSim, setActiveSim] = React.useState<'stream' | 'resale' | null>(null);
  const [simPrice, setSimPrice] = React.useState<string>('25');
  const [simLogs, setSimLogs] = React.useState<Array<{ text: string, type: 'info' | 'success' | 'warn' | 'header' | 'metric' }>>([]);
  const [showTactCode, setShowTactCode] = React.useState<boolean>(false);
  const [simStats, setSimStats] = React.useState({
    totalRuns: 0,
    gasSaved: 145000,
    settledTON: 0
  });

  const handleSimulateStream = () => {
    setActiveSim('stream');
    setSimLogs([]);
    const logs: Array<{ text: string, type: 'info' | 'success' | 'warn' | 'header' | 'metric' }> = [];
    
    logs.push({ text: '▶ STARTING TVM TRANSACTION EXECUTION...', type: 'header' });
    logs.push({ text: '⚡ Calling contract: TonJamRoyaltyDistributor.tact', type: 'info' });
    logs.push({ text: `📥 Incoming stream trigger (Value: 0.001 GRAM / Track: #${(artist.name || 'track').toUpperCase().replace(/\s+/g, '_')}_TRK)`, type: 'info' });
    
    logs.push({ text: '⚙️ Parsing context. Sender address: EQD_USER_LISTENER_481a', type: 'info' });
    logs.push({ text: '⛽ Gas consumed: 12,450 nanoton (Optimized via Tact compiler)', type: 'metric' });
    
    const platformFee = 0.001 * 0.10;
    const royaltyShare = 0.001 * 0.90;
    logs.push({ text: `💸 Platform fee (10%): ${platformFee.toFixed(5)} GRAM -> fee_destination`, type: 'info' });
    
    if (streamingSplits.length === 0) {
      logs.push({ text: `✨ Distributing 100% of remaining to Main Artist: ${royaltyShare.toFixed(5)} GRAM -> ${artist.walletAddress || 'EQA_ARTIST_CREATOR_71f'}`, type: 'success' });
    } else {
      streamingSplits.forEach((split) => {
        const amt = royaltyShare * split.percentage;
        logs.push({ text: `✨ Split (${(split.percentage * 100).toFixed(1)}%): ${amt.toFixed(5)} GRAM -> ${split.label || 'Collaborator'} (${split.address ? split.address.slice(0, 8) + '...' : 'EQA_COLLAB_6b2'})`, type: 'success' });
      });
    }
    
    logs.push({ text: '🔒 TRANSACTION COMMITTED TO BLOCKCHAIN', type: 'header' });
    logs.push({ text: `✅ STATUS: SUCCESS | Block height: #38942102 | TX: e7a9...f5b2`, type: 'success' });

    let delay = 0;
    logs.forEach((log) => {
      setTimeout(() => {
        setSimLogs(prev => [...prev, log]);
      }, delay);
      delay += 100;
    });

    setSimStats(prev => ({
      totalRuns: prev.totalRuns + 1,
      gasSaved: prev.gasSaved + 23400,
      settledTON: parseFloat((prev.settledTON + 0.001).toFixed(5))
    }));
  };

  const handleSimulateResale = () => {
    const saleAmt = parseFloat(simPrice) || 25;
    setActiveSim('resale');
    setSimLogs([]);
    const logs: Array<{ text: string, type: 'info' | 'success' | 'warn' | 'header' | 'metric' }> = [];
    
    logs.push({ text: '▶ STARTING TVM NFT MARKETPLACE TRANSACTION...', type: 'header' });
    logs.push({ text: `⚡ Invoking: TonJamMarketplace.tact -> ResolveNFTResaleMessage`, type: 'info' });
    logs.push({ text: `📥 Resale event triggered. Sale Price: ${saleAmt.toFixed(2)} GRAM`, type: 'info' });
    
    logs.push({ text: '⚙️ Fetching contract states: NFTItem.tact & TonJamMarketplace.tact', type: 'info' });
    logs.push({ text: '⛽ Gas consumed: 45,820 nanoton (Custodial-bypass optimization)', type: 'metric' });
    
    const platformFee = saleAmt * 0.10;
    const royaltyCommission = saleAmt * 0.10;
    const sellerProceeds = saleAmt - platformFee - royaltyCommission;

    logs.push({ text: `🏦 Platform fee (10%): ${platformFee.toFixed(2)} GRAM -> fee_destination`, type: 'info' });
    logs.push({ text: `🎨 Original Creator Royalty (10%): ${royaltyCommission.toFixed(2)} GRAM`, type: 'info' });
    
    if (nftSaleSplits.length === 0) {
      logs.push({ text: `   └─ 100% of Royalty -> Main Artist: ${royaltyCommission.toFixed(2)} GRAM -> ${artist.walletAddress || 'EQA_ARTIST_CREATOR_71f'}`, type: 'success' });
    } else {
      nftSaleSplits.forEach((split) => {
        const amt = royaltyCommission * split.percentage;
        logs.push({ text: `   └─ Split (${(split.percentage * 100).toFixed(1)}%): ${amt.toFixed(2)} GRAM -> ${split.label || 'Collaborator'} (${split.address ? split.address.slice(0, 8) + '...' : 'EQA_COLLAB_6b2'})`, type: 'success' });
      });
    }

    logs.push({ text: `👤 Current NFT Owner (Seller) Payout (80%): ${sellerProceeds.toFixed(2)} GRAM -> EQD_PREV_HOLDER_95b`, type: 'success' });
    
    logs.push({ text: '🔒 MUTATION COMMITTED TO LEDGER', type: 'header' });
    logs.push({ text: `✅ STATUS: SUCCESS | Block height: #38942103 | TX: a32b...0d9c`, type: 'success' });

    let delay = 0;
    logs.forEach((log) => {
      setTimeout(() => {
        setSimLogs(prev => [...prev, log]);
      }, delay);
      delay += 80;
    });

    setSimStats(prev => ({
      totalRuns: prev.totalRuns + 1,
      gasSaved: prev.gasSaved + 89000,
      settledTON: parseFloat((prev.settledTON + saleAmt).toFixed(2))
    }));
  };

  const monthlyData = React.useMemo(() => {
    const streamingTotal = earnings.streaming || 0;
    const nftTotal = earnings.nftSales || 0;

    const progression = [0.15, 0.32, 0.48, 0.65, 0.82, 1.0];
    const months = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
    
    // Deterministic factor based on artist name length to give unique but stable shapes
    const seed = (artist.name || '').length || 5;

    return months.map((month, idx) => {
      const multiplier = progression[idx];
      // Deterministic pseudo-random variation based on seed and index
      const varianceFactor = 0.9 + (((seed * (idx + 1)) % 10) / 50); // range 0.9 to 1.08
      const sVal = parseFloat((streamingTotal * multiplier * varianceFactor).toFixed(1));
      const nVal = parseFloat((nftTotal * multiplier * (1.98 - varianceFactor)).toFixed(1));
      const totalVal = parseFloat((sVal + nVal).toFixed(1));

      return {
        name: month,
        Streaming: sVal,
        NFTs: nVal,
        Total: totalVal,
      };
    });
  }, [earnings.streaming, earnings.nftSales, artist.name]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Royalty Status Card */}
      <RoyaltyStatusCard artistName={artist?.name} />

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="glass border border-neutral-500/10 p-2 rounded-[4px] bg-foreground/[0.02] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
            <ChartLine className="h-10 w-10 text-blue-500" />
          </div>
          <h3 className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.4em] mb-2">Streaming Revenue</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-bold text-blue-400 tracking-tighter">{earnings.streaming}</span>
            <span className="text-[10px] font-bold text-blue-500 uppercase">GRAM</span>
          </div>
          <p className="text-[8px] text-blue-400/70 uppercase tracking-widest mt-2">Based on {(streamingPercentage * 100).toFixed(1)}% share</p>
        </div>

        <div className="glass border border-neutral-500/10 p-2 rounded-[4px] bg-foreground/[0.02] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
            <Gem className="h-10 w-10 text-amber-500" />
          </div>
          <h3 className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.4em] mb-2">NFT Royalties</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-bold text-blue-400 tracking-tighter">{earnings.nftSales}</span>
            <span className="text-[10px] font-bold text-amber-500 uppercase">GRAM</span>
          </div>
          <p className="text-[8px] text-blue-400/70 uppercase tracking-widest mt-2">Based on {(nftSaleShare * 100).toFixed(1)}% share</p>
        </div>

        <div className="glass border border-neutral-500/10 p-2 rounded-[4px] bg-blue-600/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <Wallet className="h-10 w-10 text-blue-400" />
          </div>
          <h3 className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.4em] mb-2">Total Earnings</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-bold text-blue-400 tracking-tighter">{earnings.total}</span>
            <span className="text-[10px] font-bold text-blue-400 uppercase">GRAM</span>
          </div>
          <button className="w-full mt-2 py-2 bg-blue-600 text-foreground rounded-[4px] text-[8px] font-bold uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">Withdraw to Wallet</button>
        </div>
      </div>

      {/* Monthly Royalty Trends Chart (No border lines) */}
      <div className="glass p-5 rounded-[4px] bg-[#18181b]/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.4em]">Royalty Payout Trends</h3>
            <p className="text-[8px] text-muted-foreground uppercase tracking-widest mt-1">Monthly streaming and NFT royalty velocity</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Streaming</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">NFT Royalties</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Total</span>
            </div>
          </div>
        </div>

        <div className="h-[200px] w-full pt-4">
          <ResponsiveContainerRC width="100%" height="100%">
            <AreaChartRC data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorStreaming" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorNFTs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c084fc" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#c084fc" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGridRC strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.03)" />
              <XAxisRC 
                dataKey="name" 
                stroke="rgba(255, 255, 255, 0.15)"
                fontSize={8}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxisRC 
                stroke="rgba(255, 255, 255, 0.15)"
                fontSize={8}
                tickLine={false}
                axisLine={false}
                dx={-5}
                unit="T"
              />
              <TooltipRC content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }} />
              <AreaRC 
                type="monotone" 
                name="Streaming" 
                dataKey="Streaming" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorStreaming)" 
              />
              <AreaRC 
                type="monotone" 
                name="NFT Royalties" 
                dataKey="NFTs" 
                stroke="#c084fc" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorNFTs)" 
              />
            </AreaChartRC>
          </ResponsiveContainerRC>
        </div>
      </div>

      {/* Royalty Configuration & Interactive TVM Sandbox */}
      <div className="p-4 rounded-[4px] bg-[#121214]/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600/10 rounded-[4px] flex items-center justify-center">
              <Settings className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground uppercase tracking-tighter">Distribution Protocol</h3>
              <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Automated Smart Contract Settings</p>
            </div>
          </div>
          {onConfigure && (
            <button
              onClick={onConfigure}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-foreground rounded-[4px] text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              Configure Splits
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Streaming Share</label>
                <span className="text-[9px] font-bold text-blue-500">{(streamingPercentage * 100).toFixed(1)}%</span>
              </div>
              <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: `${streamingPercentage * 100}%` }}></div>
              </div>
              <p className="text-[8px] text-muted-foreground/50 mt-2 leading-relaxed">Percentage of platform-wide streaming pool allocated to your broadcasted frequencies.</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">NFT Secondary Share</label>
                <span className="text-[9px] font-bold text-amber-500">{(nftSaleShare * 100).toFixed(1)}%</span>
              </div>
              <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${nftSaleShare * 100}%` }}></div>
              </div>
              <p className="text-[8px] text-muted-foreground/50 mt-2 leading-relaxed">Defined share from every secondary market sale of your minted NFT assets.</p>
            </div>
          </div>

          <div className="bg-blue-600/5 p-4 rounded-[4px] flex flex-col justify-between">
            <div>
              <h4 className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.4em] mb-3">Contract Status</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]"></div>
                  <span className="text-[9px] font-bold text-muted-foreground/80 uppercase">Verified on GRAM Mainnet</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]"></div>
                  <span className="text-[9px] font-bold text-muted-foreground/80 uppercase">Immutable Logic Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]"></div>
                  <span className="text-[9px] font-bold text-muted-foreground/80 uppercase">Real-time Settlement Enabled</span>
                </div>
              </div>
            </div>
            <p className="text-[8px] text-foreground/30 mt-4 leading-relaxed font-semibold italic">
              "Royalties are distributed automatically via the TonJam Forge protocol upon every successful transaction or stream event."
            </p>
          </div>
        </div>

        {/* Dynamic Splits List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Streaming Splits Card */}
          <div className="bg-black/20 p-4 rounded-[4px] space-y-3">
            <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center justify-between">
              <span>Streaming Split Recipients</span>
              <span className="text-[9px] px-2 py-0.5 bg-blue-500/10 rounded text-blue-400 font-mono">
                {streamingSplits.length} Accounts
              </span>
            </h4>

            {streamingSplits.length > 0 && (
              <div className="h-2 w-full bg-white/[0.02] rounded-full overflow-hidden flex">
                {streamingSplits.map((split, i) => {
                  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500', 'bg-amber-500'];
                  return (
                    <div
                      key={`stream-bar-${split.address}-${i}`}
                      className={`${colors[i % colors.length]} transition-all duration-500`}
                      style={{ width: `${split.percentage * 100}%` }}
                      title={`${split.label || 'Collaborator'}: ${(split.percentage * 100).toFixed(1)}%`}
                    />
                  );
                })}
              </div>
            )}

            {streamingSplits.length === 0 ? (
              <p className="text-[9px] text-zinc-500 uppercase tracking-wider">No custom splits configured. Defaulting to 100% to creator.</p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
                {streamingSplits.map((split, i) => {
                  const colors = ['text-blue-400', 'text-emerald-400', 'text-purple-400', 'text-pink-400', 'text-cyan-400', 'text-amber-400'];
                  const shareAmount = ((earnings.streaming || 0) * split.percentage).toFixed(4);
                  return (
                    <div key={`stream-${split.address}-${i}`} className="flex items-center justify-between text-[10px] p-2 bg-white/[0.01] rounded">
                      <div className="space-y-0.5 truncate pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                          <span className="font-bold text-white uppercase block truncate">{split.label || 'Collaborator'}</span>
                        </div>
                        <span className="text-[8px] font-mono text-zinc-500 block truncate ml-3">{split.address || 'No wallet address'}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-blue-400 font-black font-mono block">{(split.percentage * 100).toFixed(1)}%</span>
                        <span className="text-[8px] font-mono text-zinc-400 block">{shareAmount} GRAM</span>
                      </div>
                    </div>
                  );
                })}
                {streamingSplits.length === 1 && streamingSplits[0].percentage === 1 && (
                  <p className="text-[8px] text-zinc-500 italic mt-2 text-center">
                    All streaming royalties flow to you. Add other artists or producers under 'Configure Splits' to split automatically.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* NFT Splits Card */}
          <div className="bg-black/20 p-4 rounded-[4px] space-y-3">
            <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center justify-between">
              <span>NFT Royalty Recipients</span>
              <span className="text-[9px] px-2 py-0.5 bg-amber-500/10 rounded text-amber-400 font-mono">
                {nftSaleSplits.length} Accounts
              </span>
            </h4>

            {nftSaleSplits.length > 0 && (
              <div className="h-2 w-full bg-white/[0.02] rounded-full overflow-hidden flex">
                {nftSaleSplits.map((split, i) => {
                  const colors = ['bg-amber-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-pink-500', 'bg-purple-500', 'bg-blue-500'];
                  return (
                    <div
                      key={`nft-bar-${split.address}-${i}`}
                      className={`${colors[i % colors.length]} transition-all duration-500`}
                      style={{ width: `${split.percentage * 100}%` }}
                      title={`${split.label || 'Collaborator'}: ${(split.percentage * 100).toFixed(1)}%`}
                    />
                  );
                })}
              </div>
            )}

            {nftSaleSplits.length === 0 ? (
              <p className="text-[9px] text-zinc-500 uppercase tracking-wider">No custom splits configured. Defaulting to 100% to creator.</p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
                {nftSaleSplits.map((split, i) => {
                  const colors = ['text-amber-400', 'text-cyan-400', 'text-emerald-400', 'text-pink-400', 'text-purple-400', 'text-blue-400'];
                  const shareAmount = ((earnings.nftSales || 0) * split.percentage).toFixed(2);
                  return (
                    <div key={`nft-${split.address}-${i}`} className="flex items-center justify-between text-[10px] p-2 bg-white/[0.01] rounded">
                      <div className="space-y-0.5 truncate pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                          <span className="font-bold text-white uppercase block truncate">{split.label || 'Collaborator'}</span>
                        </div>
                        <span className="text-[8px] font-mono text-zinc-500 block truncate ml-3">{split.address || 'No wallet address'}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-amber-500 font-black font-mono block">{(split.percentage * 100).toFixed(1)}%</span>
                        <span className="text-[8px] font-mono text-zinc-400 block">{shareAmount} GRAM</span>
                      </div>
                    </div>
                  );
                })}
                {nftSaleSplits.length === 1 && nftSaleSplits[0].percentage === 1 && (
                  <p className="text-[8px] text-zinc-500 italic mt-2 text-center">
                    All NFT secondary sales flow to you. Click 'Configure Splits' to divide secondary proceeds among your collaborators.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ==========================================
            TVM SMART CONTRACT INTERACTIVE SANDBOX
            ========================================== */}
        <div className="p-4 rounded-[4px] bg-[#0E1528]/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-[4px] bg-[#2BE08C]/10 flex items-center justify-center">
                <Cpu className="h-4 w-4 text-[#2BE08C]" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest">TVM Royalty Settlement Sandbox</h4>
                <p className="text-[8px] font-bold text-[#9AA0AE]/60 uppercase tracking-widest">Simulate real-time on-chain royalty distribution events</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTactCode(!showTactCode)}
                className="px-2.5 py-1.5 bg-white/[0.02] hover:bg-white/5 rounded text-[8px] font-black uppercase tracking-widest text-[#9AA0AE] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Code className="h-3 w-3" />
                {showTactCode ? 'Hide Tact Contract' : 'View Tact Contract'}
              </button>
            </div>
          </div>

          {/* Collapsible Tact Contract View */}
          {showTactCode && (
            <div className="rounded p-4 bg-black/40 text-left overflow-x-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">TonJamRoyaltyDistributor.tact</span>
                <span className="text-[7.5px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 font-bold uppercase rounded tracking-widest">TACT 1.6.1</span>
              </div>
              <pre className="text-[8.5px] font-mono text-zinc-300 leading-relaxed overflow-x-auto no-scrollbar select-all">
{`import "@stdlib/deploy";

struct RoyaltyParams {
    numerator: Int as uint16;
    denominator: Int as uint16;
    destination: Address;
}

contract TonJamRoyaltyDistributor with Deployable {
    owner: Address;
    fee_destination: Address;
    royalty_percentage: Int as uint16; // 10% defaults (1000/10000)

    init(owner: Address, fee_dest: Address) {
        self.owner = owner;
        self.fee_destination = fee_dest;
        self.royalty_percentage = 1000; 
    }

    // Handles stream micro-payout royalty distribution
    receive(msg: DistributeStreamRoyalty) {
        let ctx: Context = context();
        let balance: Int = myBalance();
        let platform_fee: Int = (msg.amount * 10) / 100; // 10%
        let artist_payout: Int = msg.amount - platform_fee;

        // Disperse Platform Service Fee
        send(SendParameters{
            to: self.fee_destination,
            value: platform_fee,
            mode: SendPayGasSeparately
        });

        // Disperse Remaining directly to Creator Splits
        send(SendParameters{
            to: msg.artist_address,
            value: artist_payout,
            mode: SendRemainingValue
        });
    }

    // Handles marketplace secondary resale royalty distribution
    receive(msg: DistributeResaleRoyalty) {
        let ctx: Context = context();
        let platform_fee: Int = (msg.amount * 10) / 100; // 10% platform fee
        let royalty_commission: Int = (msg.amount * 10) / 100; // 10% artist royalty commission
        let seller_proceeds: Int = msg.amount - platform_fee - royalty_commission; // 80% to current holder

        // 1. Fee Destination transfer
        send(SendParameters{
            to: self.fee_destination,
            value: platform_fee,
            mode: SendPayGasSeparately
        });

        // 2. Creator royalty commission split
        send(SendParameters{
            to: msg.creator_address,
            value: royalty_commission,
            mode: SendPayGasSeparately
        });

        // 3. Current Seller payout (former owner)
        send(SendParameters{
            to: msg.seller_address,
            value: seller_proceeds,
            mode: SendRemainingValue
        });
    }
}`}
              </pre>
            </div>
          )}

          {/* Sandbox Controls & Output */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Control Column */}
            <div className="lg:col-span-2 space-y-3.5 text-left">
              <div className="bg-white/[0.01] p-3 rounded space-y-2.5">
                <span className="text-[8.5px] font-black text-[#9AA0AE]/60 uppercase tracking-widest block">Sandbox State</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-black/25 p-2 rounded">
                    <span className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-widest block">Total Runs</span>
                    <span className="text-xs font-black text-white font-mono">{simStats.totalRuns}</span>
                  </div>
                  <div className="bg-black/25 p-2 rounded">
                    <span className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-widest block">Gas Optimization</span>
                    <span className="text-xs font-black text-emerald-400 font-mono">{(simStats.gasSaved / 1000).toFixed(1)}k</span>
                  </div>
                  <div className="bg-black/25 p-2 rounded">
                    <span className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-widest block">Settled GRAM</span>
                    <span className="text-xs font-black text-blue-400 font-mono">{simStats.settledTON}</span>
                  </div>
                </div>
              </div>

              {/* Simulation Actions */}
              <div className="space-y-2">
                <div className="p-3 bg-white/[0.01] rounded space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[8.5px] font-black text-[#2BE08C] uppercase tracking-widest">1. Track Stream Royalty</span>
                    <span className="text-[8.5px] text-[#9AA0AE]/50 font-mono">0.001 GRAM</span>
                  </div>
                  <p className="text-[8px] text-zinc-500 leading-normal">
                    Triggers a streaming micro-payment. TVM intercepts and splits 10% to platform fee, and 90% automatically dispersed among your streaming split recipients.
                  </p>
                  <button
                    onClick={handleSimulateStream}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-[3px] text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/15"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    Simulate Stream Event
                  </button>
                </div>

                <div className="p-3 bg-white/[0.01] rounded space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[8.5px] font-black text-[#2BE08C] uppercase tracking-widest">2. NFT Marketplace Resale</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={simPrice}
                        onChange={(e) => setSimPrice(e.target.value)}
                        className="w-10 h-5 px-1 bg-black/40 text-[9px] font-bold font-mono text-white text-center rounded border-none focus-visible:outline-none"
                      />
                      <span className="text-[8.5px] text-zinc-500 font-mono">GRAM</span>
                    </div>
                  </div>
                  <p className="text-[8px] text-zinc-500 leading-normal">
                    Triggers secondary market sale. On-chain protocol sends 10% platform fee, 10% royalty commission to you (the original artist/splits), and 80% directly to the seller (former owner).
                  </p>
                  <button
                    onClick={handleSimulateResale}
                    className="w-full py-2 bg-[#2BE08C] hover:bg-[#20c076] text-black rounded-[3px] text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-[#2BE08C]/15"
                  >
                    <TrendingUp className="h-3 w-3" />
                    Simulate Resale Event
                  </button>
                </div>
              </div>
            </div>

            {/* Trace Output Log Column */}
            <div className="lg:col-span-3 bg-black/40 rounded p-3 flex flex-col justify-between h-[305px] overflow-hidden">
              <div className="flex items-center justify-between pb-2">
                <span className="text-[8.5px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-zinc-400" />
                  TVM_LOGS: ON-CHAIN SETTLEMENT TRACE
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></span>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar font-mono text-[8.5px] text-left space-y-1.5 pr-1 max-h-[250px]">
                {simLogs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600 py-10">
                    <Terminal className="h-8 w-8 text-zinc-700 mb-2" />
                    <p className="uppercase tracking-widest text-[8px] font-bold">Awaiting Transaction Call...</p>
                    <p className="text-[7.5px] text-zinc-500/80 mt-1">Select an event trigger on the left to watch on-chain smart contract execution</p>
                  </div>
                ) : (
                  simLogs.map((log, i) => (
                    <div
                      key={i}
                      className={`p-1.5 rounded-sm select-text ${
                        log.type === 'header'
                          ? 'text-[#2BE08C] font-bold border-none bg-emerald-500/[0.03]'
                          : log.type === 'success'
                          ? 'text-emerald-400 bg-emerald-500/[0.02]'
                          : log.type === 'metric'
                          ? 'text-amber-400 bg-amber-500/[0.02]'
                          : 'text-zinc-300'
                      }`}
                    >
                      {log.text}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoyaltyDashboard;
