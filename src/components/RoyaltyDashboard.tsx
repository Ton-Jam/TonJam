import React from 'react';
import { ChartLine, Gem, Wallet, Settings } from 'lucide-react';
import { Artist } from '@/types';
import { TJ_COIN_ICON, TON_LOGO } from '@/constants';

interface RoyaltyDashboardProps {
  artist: Artist;
}

const RoyaltyDashboard: React.FC<RoyaltyDashboardProps> = ({ artist }) => {
  const earnings = artist.earnings || { streaming: 0, nftSales: 0, total: 0 };
  const config = artist.royaltyConfig;
  const streamingPercentage = config?.streamingPercentage ?? 0.05;
  const nftSaleShare = config?.nftSaleShare ?? 0.10;

  return (
    <div className="space-y-2 animate-in fade-in duration-700">
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
            <p className="text-[8px] text-foreground/30 mt-2 leading-relaxed italic">"Royalties are distributed automatically via the TonJam Forge protocol upon every successful transaction or stream event."</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoyaltyDashboard;
