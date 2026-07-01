import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, TrendingUp, TrendingDown, Headphones, DollarSign, 
  Layers, Users, Award, ShieldAlert, Zap, Clock, Activity 
} from 'lucide-react';

// --- TS INTERFACES ---

export interface AnalyticsMetric {
  label: string;
  value: string;
  changePercent: number; // e.g. 12.4 or -5.2
  timeRange: string; // e.g. "Last 30 days"
  chartData?: number[];
}

export interface RankedItem {
  rank: number;
  name: string;
  avatarUrl?: string;
  volume: string;
  isVerified?: boolean;
}

// --- 1. STREAMS CARD ---
export const StreamsCard: React.FC<{
  metric: AnalyticsMetric;
  className?: string;
}> = ({ metric, className = '' }) => {
  const isUp = metric.changePercent >= 0;
  const chartPoints = metric.chartData || [30, 45, 35, 60, 50, 75, 90];
  const maxVal = Math.max(...chartPoints);

  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white w-full max-w-[280px] shrink-0 flex flex-col justify-between h-44 ${className}`}>
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] uppercase font-black tracking-widest text-[#9AA0AE]">Total Streams</span>
          <span className={`text-[9px] font-mono font-black ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {isUp ? '▲' : '▼'} {Math.abs(metric.changePercent).toFixed(1)}%
          </span>
        </div>
        <h3 className="text-xl font-black font-mono leading-none">{metric.value}</h3>
        <p className="text-[9px] text-[#9AA0AE] font-mono mt-1">{metric.timeRange}</p>
      </div>

      {/* Mini sparkline bar chart */}
      <div className="flex items-end justify-between h-14 gap-1.5 pt-2">
        {chartPoints.map((pt, idx) => {
          const heightPct = Math.max(10, Math.round((pt / maxVal) * 100));
          return (
            <div key={idx} className="flex-1 bg-white/5 rounded-t-sm h-full flex items-end">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${heightPct}%` }}
                className={`w-full rounded-t-sm ${isUp ? 'bg-blue-500' : 'bg-red-500'}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- 2. REVENUE CARD ---
export const RevenueCard: React.FC<{
  metric: AnalyticsMetric;
  className?: string;
}> = ({ metric, className = '' }) => {
  const isUp = metric.changePercent >= 0;
  const chartPoints = metric.chartData || [20, 35, 25, 45, 55, 40, 65];
  const maxVal = Math.max(...chartPoints);

  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white w-full max-w-[280px] shrink-0 flex flex-col justify-between h-44 ${className}`}>
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] uppercase font-black tracking-widest text-[#9AA0AE]">Total Revenue</span>
          <span className={`text-[9px] font-mono font-black ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {isUp ? '▲' : '▼'} {Math.abs(metric.changePercent).toFixed(1)}%
          </span>
        </div>
        <h3 className="text-xl font-black font-mono leading-none text-emerald-400">{metric.value}</h3>
        <p className="text-[9px] text-[#9AA0AE] font-mono mt-1">{metric.timeRange}</p>
      </div>

      {/* Mini line style sparkline */}
      <div className="flex items-end justify-between h-14 gap-1 pt-2 relative">
        {chartPoints.map((pt, idx) => {
          const heightPct = Math.max(10, Math.round((pt / maxVal) * 100));
          return (
            <div key={idx} className="flex-1 h-full flex flex-col justify-end items-center relative">
              <motion.div 
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                style={{ height: `${heightPct}%` }}
                className="w-1 bg-emerald-400 rounded-full"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- 3. FLOOR PRICE ANALYTICS CARD ---
export const FloorPriceAnalytics: React.FC<{
  collectionName: string;
  currentFloor: string;
  change7d: number;
  volume24h: string;
  className?: string;
}> = ({ collectionName, currentFloor, change7d, volume24h, className = '' }) => {
  const isUp = change7d >= 0;
  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white w-full max-w-[280px] shrink-0 flex flex-col justify-between h-40 ${className}`}>
      <div>
        <span className="text-[9px] font-black uppercase text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full inline-block">FLOOR ANALYSIS</span>
        <h4 className="text-[13px] font-bold text-white mt-2 truncate">{collectionName}</h4>
      </div>

      <div className="mt-2.5 pt-2.5 border-t border-white/5 flex justify-between items-baseline font-mono text-[11px] text-[#9AA0AE]">
        <div>
          <span>Current Floor</span>
          <span className="block text-base font-black text-white mt-1">{currentFloor} TON</span>
        </div>
        <div className="text-right">
          <span>7D Change</span>
          <span className={`block font-black mt-1 ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {isUp ? '+' : ''}{change7d.toFixed(1)}%
          </span>
        </div>
      </div>
      <p className="text-[9px] text-[#9AA0AE] font-mono">24h volume: {volume24h} TON</p>
    </div>
  );
};

// --- 4. MARKETPLACE VOLUME CARD ---
export const MarketplaceVolume: React.FC<{
  metric: AnalyticsMetric;
  className?: string;
}> = ({ metric, className = '' }) => {
  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white w-full max-w-[280px] shrink-0 ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] uppercase font-black tracking-widest text-[#9AA0AE]">Volume Volatility</span>
        <span className="text-[9px] text-blue-400 font-mono">24h Peak</span>
      </div>
      <h3 className="text-lg font-black font-mono">{metric.value} TON</h3>
      <div className="mt-4 space-y-1">
        <div className="flex justify-between text-[9px] text-[#9AA0AE] font-mono">
          <span>Low</span>
          <span>High</span>
        </div>
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full w-3/4" />
        </div>
      </div>
    </div>
  );
};

// --- 5. TOP SELLERS CARD ---
export const TopSellers: React.FC<{
  sellers: RankedItem[];
  className?: string;
}> = ({ sellers, className = '' }) => {
  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white w-full max-w-[280px] shrink-0 ${className}`}>
      <div className="flex items-center gap-2 mb-3.5">
        <Award className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-black uppercase tracking-widest text-[#9AA0AE]">Top Sellers</span>
      </div>
      <div className="space-y-2.5">
        {sellers.map((s) => (
          <div key={s.rank} className="flex items-center justify-between p-1.5 bg-white/[0.01] rounded-[6px] text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="font-mono text-[11px] font-bold text-white/30 w-5 text-center">{s.rank}</span>
              <span className="font-bold text-white truncate">{s.name}</span>
            </div>
            <span className="font-mono text-emerald-400 font-bold">{s.volume} TON</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 6. TOP BUYERS CARD ---
export const TopBuyers: React.FC<{
  buyers: RankedItem[];
  className?: string;
}> = ({ buyers, className = '' }) => {
  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white w-full max-w-[280px] shrink-0 ${className}`}>
      <div className="flex items-center gap-2 mb-3.5">
        <Award className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-black uppercase tracking-widest text-[#9AA0AE]">Top Buyers</span>
      </div>
      <div className="space-y-2.5">
        {buyers.map((b) => (
          <div key={b.rank} className="flex items-center justify-between p-1.5 bg-white/[0.01] rounded-[6px] text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="font-mono text-[11px] font-bold text-white/30 w-5 text-center">{b.rank}</span>
              <span className="font-bold text-white truncate">{b.name}</span>
            </div>
            <span className="font-mono text-blue-400 font-bold">{b.volume} TON</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 7. TOP COLLECTIONS CARD ---
export const TopCollections: React.FC<{
  collections: RankedItem[];
  className?: string;
}> = ({ collections, className = '' }) => {
  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white w-full max-w-[280px] shrink-0 ${className}`}>
      <div className="flex items-center gap-2 mb-3.5">
        <Layers className="w-4 h-4 text-purple-400" />
        <span className="text-xs font-black uppercase tracking-widest text-[#9AA0AE]">Top Collections</span>
      </div>
      <div className="space-y-2.5">
        {collections.map((c) => (
          <div key={c.rank} className="flex items-center justify-between p-1.5 bg-white/[0.01] rounded-[6px] text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="font-mono text-[11px] font-bold text-white/30 w-5 text-center">{c.rank}</span>
              <span className="font-bold text-white truncate">{c.name}</span>
            </div>
            <span className="font-mono text-white font-bold">{c.volume} TON</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 8. FOLLOWERS GROWTH CARD ---
export const FollowersGrowth: React.FC<{
  currentCount: number;
  growthThisMonth: number;
  className?: string;
}> = ({ currentCount, growthThisMonth, className = '' }) => {
  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white w-full max-w-[280px] shrink-0 ${className}`}>
      <span className="text-[10px] uppercase font-black tracking-widest text-[#9AA0AE]">Audience Syncs</span>
      <h3 className="text-xl font-black font-mono mt-1">{currentCount.toLocaleString()}</h3>
      <div className="mt-3 flex items-center gap-1 text-[11px] font-mono text-emerald-400">
        <TrendingUp className="w-3.5 h-3.5" />
        <span>+{growthThisMonth.toLocaleString()} synced this month</span>
      </div>
    </div>
  );
};

// --- 9. ENGAGEMENT CARD ---
export const EngagementCard: React.FC<{
  likesRate: string;
  commentsRate: string;
  sharesRate: string;
  className?: string;
}> = ({ likesRate, commentsRate, sharesRate, className = '' }) => {
  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white w-full max-w-[280px] shrink-0 ${className}`}>
      <div className="flex items-center gap-2 mb-3.5">
        <Activity className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-black uppercase tracking-widest text-[#9AA0AE]">Social Engagement</span>
      </div>
      <div className="space-y-3 font-mono text-[10px] text-[#9AA0AE]">
        <div>
          <div className="flex justify-between mb-1">
            <span>Likes Conversion</span>
            <span className="text-white font-bold">{likesRate}</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full w-[65%]" />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span>Comments Conversion</span>
            <span className="text-white font-bold">{commentsRate}</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full w-[45%]" />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 10. LISTENING ANALYTICS CARD ---
export const ListeningAnalytics: React.FC<{
  averageListeningTime: string;
  peakGenre: string;
  className?: string;
}> = ({ averageListeningTime, peakGenre, className = '' }) => {
  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white w-full max-w-[280px] shrink-0 ${className}`}>
      <span className="text-[10px] uppercase font-black tracking-widest text-[#9AA0AE]">Listening Behavior</span>
      <div className="mt-3.5 flex justify-between items-center">
        <div>
          <span className="text-[9px] uppercase tracking-wider text-[#9AA0AE] block">Avg. Session</span>
          <span className="text-base font-black text-emerald-400 font-mono mt-0.5 block">{averageListeningTime}</span>
        </div>
        <div className="text-right">
          <span className="text-[9px] uppercase tracking-wider text-[#9AA0AE] block">Peak Genre</span>
          <span className="text-xs font-black text-blue-400 uppercase mt-0.5 block">{peakGenre}</span>
        </div>
      </div>
    </div>
  );
};
