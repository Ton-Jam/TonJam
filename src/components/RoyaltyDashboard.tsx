import React from 'react';
import { ChartLine, Gem, Wallet, Settings } from 'lucide-react';
import { Artist } from '@/types';
import { TJ_COIN_ICON, TON_LOGO } from '@/constants';

interface RoyaltyDashboardProps {
  artist: Artist;
}

const RoyaltyDashboard: React.FC<RoyaltyDashboardProps> = ({ artist }) => {
  const earnings = artist.earnings || { streaming: '0.0', nftSales: '0.0', total: '0.0' };
  const config = artist.royaltyConfig || { streamingPercentage: 0.05, nftSaleShare: 0.10 };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass border border-blue-500/10 p-8 rounded-[10px] bg-white/[0.02] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <ChartLine className="h-10 w-10 text-blue-500" />
          </div>
          <h3 className="text-[9px] font-bold text-white/20 uppercase tracking-[0.4em] mb-6">Streaming Revenue</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tighter">{earnings.streaming}</span>
            <span className="text-[10px] font-bold text-blue-500 uppercase">TON</span>
          </div>
          <p className="text-[8px] text-white/20 uppercase tracking-widest mt-2">Based on {(config.streamingPercentage * 100).toFixed(1)}% share</p>
        </div>

        <div className="glass border border-blue-500/10 p-8 rounded-[10px] bg-white/[0.02] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Gem className="h-10 w-10 text-amber-500" />
          </div>
          <h3 className="text-[9px] font-bold text-white/20 uppercase tracking-[0.4em] mb-6">NFT Royalties</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tighter">{earnings.nftSales}</span>
            <span className="text-[10px] font-bold text-amber-500 uppercase">TON</span>
          </div>
          <p className="text-[8px] text-white/20 uppercase tracking-widest mt-2">Based on {(config.nftSaleShare * 100).toFixed(1)}% share</p>
        </div>

        <div className="glass border border-blue-500/10 p-8 rounded-[10px] bg-blue-600/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Wallet className="h-10 w-10 text-blue-400" />
          </div>
          <h3 className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.4em] mb-6">Total Earnings</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tighter">{earnings.total}</span>
            <span className="text-[10px] font-bold text-blue-400 uppercase">TON</span>
          </div>
          <button className="w-full mt-6 py-3 bg-blue-600 text-white rounded-[10px] text-[8px] font-bold uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">Withdraw to Wallet</button>
        </div>
      </div>

      {/* Royalty Configuration */}
      <div className="glass border border-blue-500/10 p-10 rounded-[10px] bg-white/[0.01]">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-blue-600/20 rounded-[10px] flex items-center justify-center">
            <Settings className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Distribution Protocol</h3>
            <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Automated Smart Contract Settings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Streaming Share</label>
                <span className="text-[9px] font-bold text-blue-500">{(config.streamingPercentage * 100).toFixed(1)}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: `${config.streamingPercentage * 100}%` }}></div>
              </div>
              <p className="text-[8px] text-white/20 mt-3 leading-relaxed">Percentage of platform-wide streaming pool allocated to your broadcasted frequencies.</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">NFT Secondary Share</label>
                <span className="text-[9px] font-bold text-amber-500">{(config.nftSaleShare * 100).toFixed(1)}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${config.nftSaleShare * 100}%` }}></div>
              </div>
              <p className="text-[8px] text-white/20 mt-3 leading-relaxed">Defined share from every secondary market sale of your minted NFT assets.</p>
            </div>
          </div>

          <div className="bg-blue-600/5 p-8 rounded-[10px]">
            <h4 className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.4em] mb-4">Contract Status</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-[9px] font-bold text-white/60 uppercase">Verified on TON Mainnet</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-[9px] font-bold text-white/60 uppercase">Immutable Logic Active</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-[9px] font-bold text-white/60 uppercase">Real-time Settlement Enabled</span>
              </div>
            </div>
            <p className="text-[8px] text-white/30 mt-6 leading-relaxed italic">"Royalties are distributed automatically via the TonJam Forge protocol upon every successful transaction or stream event."</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoyaltyDashboard;
