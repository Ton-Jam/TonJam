import React from 'react';
import { ChartLine, Gem, Wallet, Settings } from 'lucide-react';
import { Artist } from '@/types';
import { TJ_COIN_ICON, TON_LOGO } from '@/constants';
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
                {entry.value} TON
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const RoyaltyDashboard: React.FC<RoyaltyDashboardProps> = ({ artist }) => {
  const earnings = artist.earnings || { streaming: 0, nftSales: 0, total: 0 };
  const config = artist.royaltyConfig;
  const streamingPercentage = config?.streamingPercentage ?? 0.05;
  const nftSaleShare = config?.nftSaleShare ?? 0.10;

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
    <div className="space-y-4 animate-in fade-in duration-700">
      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="glass border border-neutral-500/10 p-2 rounded-[10px] bg-foreground/[0.02] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
            <ChartLine className="h-10 w-10 text-blue-500" />
          </div>
          <h3 className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.4em] mb-2">Streaming Revenue</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-bold text-blue-400 tracking-tighter">{earnings.streaming}</span>
            <span className="text-[10px] font-bold text-blue-500 uppercase">TON</span>
          </div>
          <p className="text-[8px] text-blue-400/70 uppercase tracking-widest mt-2">Based on {(streamingPercentage * 100).toFixed(1)}% share</p>
        </div>

        <div className="glass border border-neutral-500/10 p-2 rounded-[10px] bg-foreground/[0.02] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
            <Gem className="h-10 w-10 text-amber-500" />
          </div>
          <h3 className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.4em] mb-2">NFT Royalties</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-bold text-blue-400 tracking-tighter">{earnings.nftSales}</span>
            <span className="text-[10px] font-bold text-amber-500 uppercase">TON</span>
          </div>
          <p className="text-[8px] text-blue-400/70 uppercase tracking-widest mt-2">Based on {(nftSaleShare * 100).toFixed(1)}% share</p>
        </div>

        <div className="glass border border-neutral-500/10 p-2 rounded-[10px] bg-blue-600/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <Wallet className="h-10 w-10 text-blue-400" />
          </div>
          <h3 className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.4em] mb-2">Total Earnings</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-bold text-blue-400 tracking-tighter">{earnings.total}</span>
            <span className="text-[10px] font-bold text-blue-400 uppercase">TON</span>
          </div>
          <button className="w-full mt-2 py-2 bg-blue-600 text-foreground rounded-[10px] text-[8px] font-bold uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">Withdraw to Wallet</button>
        </div>
      </div>

      {/* Monthly Royalty Trends Chart (No border lines) */}
      <div className="glass p-5 rounded-[10px] bg-[#18181b]/30 space-y-4">
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

      {/* Royalty Configuration */}
      <div className="glass border border-neutral-500/10 p-2 rounded-[10px] bg-foreground/[0.01]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-blue-600/20 rounded-[10px] flex items-center justify-center">
            <Settings className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground uppercase tracking-tighter">Distribution Protocol</h3>
            <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Automated Smart Contract Settings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="space-y-2">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Streaming Share</label>
                <span className="text-[9px] font-bold text-blue-500">{(streamingPercentage * 100).toFixed(1)}%</span>
              </div>
              <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: `${streamingPercentage * 100}%` }}></div>
              </div>
              <p className="text-[8px] text-muted-foreground/50 mt-2 leading-relaxed">Percentage of platform-wide streaming pool allocated to your broadcasted frequencies.</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">NFT Secondary Share</label>
                <span className="text-[9px] font-bold text-amber-500">{(nftSaleShare * 100).toFixed(1)}%</span>
              </div>
              <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${nftSaleShare * 100}%` }}></div>
              </div>
              <p className="text-[8px] text-muted-foreground/50 mt-2 leading-relaxed">Defined share from every secondary market sale of your minted NFT assets.</p>
            </div>
          </div>

          <div className="bg-blue-600/5 p-2 rounded-[10px]">
            <h4 className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.4em] mb-2">Contract Status</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-[9px] font-bold text-muted-foreground/80 uppercase">Verified on TON Mainnet</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-[9px] font-bold text-muted-foreground/80 uppercase">Immutable Logic Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-[9px] font-bold text-muted-foreground/80 uppercase">Real-time Settlement Enabled</span>
              </div>
            </div>
            <p className="text-[8px] text-foreground/30 mt-2 leading-relaxed">"Royalties are distributed automatically via the TonJam Forge protocol upon every successful transaction or stream event."</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoyaltyDashboard;
