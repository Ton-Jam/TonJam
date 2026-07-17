import React, { useState, useMemo } from 'react';
import * as RechartsPrimitive from "recharts";
import { 
  TrendingUp, 
  Coins, 
  Users, 
  Layers, 
  Activity, 
  Sparkles, 
  TrendingDown,
  ChevronRight,
  Info
} from 'lucide-react';

const { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip 
} = RechartsPrimitive as any;

interface NFTCollection {
  id: string;
  name: string;
  creator: string;
  creatorId?: string;
  volume: string;
  owners: number;
  floorPrice: string;
  imageUrl: string;
  itemCount: number;
  verified?: boolean;
  description?: string;
}

interface FloorPriceHistoryTrackerProps {
  collections: NFTCollection[];
  onSelectCollection?: (col: NFTCollection) => void;
}

export const FloorPriceHistoryTracker: React.FC<FloorPriceHistoryTrackerProps> = ({ 
  collections = [] 
}) => {
  // Fallback if no collections provided
  const availableCollections = useMemo(() => {
    if (collections && collections.length > 0) {
      return collections.slice(0, 6);
    }
    // Hardcoded mock collections if empty
    return [
      { id: 'col-1', name: 'Neon Soundscapes', creator: 'DJ Tonix', floorPrice: '12.5', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&h=150', volume: '14,230', owners: 450, itemCount: 100, verified: true },
      { id: 'col-2', name: 'Ethereal Harmonics', creator: 'Luna Wave', floorPrice: '4.8', imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&h=150', volume: '3,110', owners: 180, itemCount: 50, verified: true },
      { id: 'col-3', name: 'Cybernetic Echoes', creator: 'Static Drift', floorPrice: '18.2', imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&h=150', volume: '22,450', owners: 620, itemCount: 120, verified: false },
    ];
  }, [collections]);

  const [selectedId, setSelectedId] = useState<string>(availableCollections[0]?.id || '');

  const activeCollection = useMemo(() => {
    return availableCollections.find(c => c.id === selectedId) || availableCollections[0];
  }, [availableCollections, selectedId]);

  // Deterministic 30-day data generator for selected collection floor price
  const chartData = useMemo(() => {
    if (!activeCollection) return [];
    
    const basePrice = parseFloat(activeCollection.floorPrice) || 5.0;
    const seedId = activeCollection.id;
    
    // Create seed hash
    let seedNum = 0;
    for (let i = 0; i < seedId.length; i++) {
      seedNum += seedId.charCodeAt(i);
    }
    
    const data = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Generate consistent fluctuations using sine & cosine with seed
      const step = Math.sin(seedNum + i) * (basePrice * 0.04) + Math.cos((seedNum * i) / 2.5) * (basePrice * 0.02);
      const trend = (i / 30) * (basePrice * 0.18); // General upward historical trend
      const price = Number((basePrice * 0.82 + trend + step).toFixed(2));
      
      data.push({
        date: dateStr,
        price: price > 0 ? price : 0.1,
      });
    }
    
    // Ensure the last element matches the actual current floor price perfectly
    if (data.length > 0) {
      data[data.length - 1].price = basePrice;
    }
    
    return data;
  }, [activeCollection]);

  // Derive high, low and percentage change from chart data
  const stats = useMemo(() => {
    if (chartData.length === 0) return { high: 0, low: 0, change: 0, isPositive: true };
    const prices = chartData.map(d => d.price);
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const initial = prices[0];
    const latest = prices[prices.length - 1];
    const change = initial > 0 ? ((latest - initial) / initial) * 100 : 0;
    return {
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      change: Number(change.toFixed(1)),
      isPositive: change >= 0
    };
  }, [chartData]);

  return (
    <div className="bg-[#101A3B]/40 backdrop-blur-md p-6 rounded-3xl shadow-lg space-y-6 text-white font-sans text-left" id="floor-price-tracker-section">
      
      {/* Header Info Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Live Valuation Floor Indexes</span>
          <h2 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#5B6BFF]" />
            Collection Floor Price Explorer (Past 30 Days)
          </h2>
        </div>
        <div className="flex items-center gap-1.5 bg-blue-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400">
          <Sparkles className="w-3.5 h-3.5" />
          Recharts Secured Signals
        </div>
      </div>

      {/* Main Grid: Selector on the Left, Rich Chart and Stats on the Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Popular Collections Selector */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
            Tracked Audio Collections
          </span>
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1" id="floor-tracker-collection-list">
            {availableCollections.map((col) => {
              const isSelected = col.id === selectedId;
              return (
                <button
                  key={col.id}
                  onClick={() => setSelectedId(col.id)}
                  className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all duration-300 relative group overflow-hidden cursor-pointer ${
                    isSelected ? 'bg-blue-500/15' : 'bg-white/[0.015] hover:bg-white/[0.035]'
                  }`}
                >
                  <img 
                    src={col.imageUrl} 
                    alt={col.name} 
                    className="w-10 h-10 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className={`text-xs font-black truncate transition-colors ${isSelected ? 'text-blue-400' : 'text-slate-200'}`}>
                      {col.name}
                    </h5>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      by {col.creator}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono font-black text-white">
                      {col.floorPrice} TON
                    </p>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 block mt-0.5">
                      Floor Price
                    </span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isSelected ? 'translate-x-0.5 text-blue-400' : 'group-hover:translate-x-0.5'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Area Chart and Accompanying Metadata */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-5">
          
          {/* Active Collection Header Info & Key Stats Block */}
          {activeCollection && (
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/[0.02] p-4 rounded-2xl" id="floor-tracker-active-summary">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-white uppercase tracking-wide flex items-center gap-1.5">
                  {activeCollection.name}
                  {activeCollection.verified && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" title="Verified Artist" />
                  )}
                </h4>
                <p className="text-[10px] text-slate-400 max-w-md font-medium">
                  {activeCollection.description || "Premium high fidelity track collection verified on TON network."}
                </p>
              </div>

              {/* Stats Indicators without solid border lines */}
              <div className="flex gap-4 items-center">
                <div className="text-left">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 block mb-0.5">
                    30D Volume
                  </span>
                  <span className="text-xs font-mono font-black text-white flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    {activeCollection.volume} TON
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 block mb-0.5">
                    Collectors
                  </span>
                  <span className="text-xs font-mono font-black text-slate-300 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    {activeCollection.owners}
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 block mb-0.5">
                    Total Items
                  </span>
                  <span className="text-xs font-mono font-black text-slate-300 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    {activeCollection.itemCount}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Area Chart visualization utilizing transparent gradients */}
          <div className="h-56 w-full" id="floor-chart-canvas">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="floorPriceColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  vertical={false} 
                  strokeDasharray="3 3" 
                  stroke="rgba(255,255,255,0.03)" 
                />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 9, fontWeight: 'bold' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 9 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#101a3b', 
                    border: 'none', 
                    borderRadius: '16px', 
                    color: '#fff', 
                    fontSize: '11px', 
                    fontWeight: 'bold',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3b82f6" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#floorPriceColor)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Spark details bar */}
          <div className="flex justify-between items-center bg-white/[0.01] p-3 rounded-2xl" id="floor-tracker-details-footer">
            <div className="flex gap-4">
              <div className="text-left">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                  30D High
                </span>
                <p className="text-xs font-mono font-bold text-white">
                  {stats.high} TON
                </p>
              </div>
              <div className="text-left">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                  30D Low
                </span>
                <p className="text-xs font-mono font-bold text-slate-400">
                  {stats.low} TON
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                30D Trend
              </span>
              <div className={`text-xs font-black flex items-center gap-1 px-2.5 py-1 rounded-full ${
                stats.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {stats.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {stats.isPositive ? '+' : ''}{stats.change}%
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default FloorPriceHistoryTracker;
