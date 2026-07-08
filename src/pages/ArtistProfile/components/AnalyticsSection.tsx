import * as React from "react";
import { 
  ResponsiveContainer as RechartsResponsiveContainer, 
  AreaChart as RechartsAreaChart, 
  Area as RechartsArea, 
  BarChart as RechartsBarChart, 
  Bar as RechartsBar, 
  XAxis as RechartsXAxis, 
  YAxis as RechartsYAxis, 
  Tooltip as RechartsTooltip 
} from "recharts";

const ResponsiveContainer = RechartsResponsiveContainer as any;
const AreaChart = RechartsAreaChart as any;
const Area = RechartsArea as any;
const BarChart = RechartsBarChart as any;
const Bar = RechartsBar as any;
const XAxis = RechartsXAxis as any;
const YAxis = RechartsYAxis as any;
const Tooltip = RechartsTooltip as any;

import { Artist, Track, NFTItem } from "@/types";
import { ArtistAnalyticsData } from "../types";
import { TrendingUp, Users, Wallet, Play, Globe, MapPin, Award } from "lucide-react";

interface AnalyticsSectionProps {
  artist: Artist;
  analytics: ArtistAnalyticsData;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ artist, analytics }) => {
  return (
    <div className="space-y-10 animate-in fade-in" id="analytics-root">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900/40 p-5 rounded-[10px] space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Total Streams</span>
            <Play className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold tracking-tight">4.8M</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" /> +12.4% this month
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/40 p-5 rounded-[10px] space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Total Supporters</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold tracking-tight">2,450</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" /> +8.2% this month
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/40 p-5 rounded-[10px] space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">NFT Sales</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold tracking-tight">18.5K TON</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" /> +15.1% this month
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/40 p-5 rounded-[10px] space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">TJ Coin Staked</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold tracking-tight">54.2K TJ</div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
              94% active retention
            </div>
          </div>
        </div>
      </div>

      {/* Main Streaming & Followers Area Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900/30 p-5 rounded-[10px] space-y-4">
          <div className="flex flex-col">
            <h4 className="text-sm font-bold tracking-tight text-foreground uppercase tracking-widest text-[11px] text-muted-foreground">Monthly Streaming Activity</h4>
            <span className="text-xl font-bold text-white">184,500 Current Rate</span>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.monthlyStreams} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="streamGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#525252" fontSize={10} tickLine={false} />
                <YAxis stroke="#525252" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#171717", border: "none", borderRadius: "8px" }} />
                <Area type="monotone" dataKey="streams" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#streamGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-neutral-900/30 p-5 rounded-[10px] space-y-4">
          <div className="flex flex-col">
            <h4 className="text-sm font-bold tracking-tight text-foreground uppercase tracking-widest text-[11px] text-muted-foreground">Follower Expansion Network</h4>
            <span className="text-xl font-bold text-white">85,400 Verified Reach</span>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.followersGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="followGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#525252" fontSize={10} tickLine={false} />
                <YAxis stroke="#525252" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#171717", border: "none", borderRadius: "8px" }} />
                <Area type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#followGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Revenue Split Chart */}
      <div className="bg-neutral-900/20 p-5 rounded-[10px] space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">TON Ledger & TJ Coin Distribution</h4>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.revenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#525252" fontSize={10} tickLine={false} />
              <YAxis stroke="#525252" fontSize={10} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#171717", border: "none", borderRadius: "8px" }} />
              <Bar dataKey="ton" fill="#0088cc" radius={[4, 4, 0, 0]} name="TON Ledger Sales" />
              <Bar dataKey="tj" fill="#10b981" radius={[4, 4, 0, 0]} name="TJ Coins Support" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Listening Countries & Top Cities list (Bento Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Listening Countries */}
        <div className="bg-neutral-900/30 p-5 rounded-[10px] space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-white">Listening Countries</h4>
          </div>
          <div className="space-y-3 pt-2">
            {analytics.listeningCountries.map((c, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2 text-white">
                    <span>{c.flag}</span>
                    <span>{c.country}</span>
                  </div>
                  <div className="text-muted-foreground">
                    {c.percentage}% <span className="text-[10px]">({c.streams.toLocaleString()})</span>
                  </div>
                </div>
                {/* Visual bar */}
                <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${c.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Cities */}
        <div className="bg-neutral-900/30 p-5 rounded-[10px] space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-white">Top Active Cities</h4>
          </div>
          <div className="space-y-4 pt-2">
            {analytics.topCities.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4">{idx + 1}</span>
                  <span className="text-sm font-semibold text-white">{c.city}</span>
                </div>
                <div className="text-xs font-mono bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-[4px]">
                  {c.streams.toLocaleString()} Streams
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row - Best Performing assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Most Streamed Songs */}
        <div className="bg-neutral-900/30 p-5 rounded-[10px] space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-white">Most Streamed Releases</h4>
          <div className="space-y-3">
            {analytics.mostStreamedSongs.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 hover:bg-white/[0.02] rounded-[10px]">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={s.coverUrl} className="w-10 h-10 object-cover rounded-[6px]" alt="" />
                  <span className="text-xs font-bold text-white truncate">{s.title}</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{(s.streams / 1000).toFixed(0)}K plays</span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Owned NFTs */}
        <div className="bg-neutral-900/30 p-5 rounded-[10px] space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-white">Top Owned Music NFTs</h4>
          <div className="space-y-3">
            {analytics.mostOwnedNFTs.map((n, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 hover:bg-white/[0.02] rounded-[10px]">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={n.coverUrl} className="w-10 h-10 object-cover rounded-[6px] border border-purple-500/20" alt="" />
                  <span className="text-xs font-bold text-white truncate">{n.title}</span>
                </div>
                <span className="text-xs text-purple-400 font-mono font-semibold">{n.owners} Collectors</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
