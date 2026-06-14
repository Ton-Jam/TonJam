import React, { useMemo, useState } from "react";
import * as RechartsPrimitive from "recharts";
import { NFTHistory, NFTOffer } from "@/types";
import { cn } from "@/lib/utils";
import { 
  TrendingUp, 
  History, 
  Zap, 
  ArrowUpRight, 
  Info,
  Activity,
  Coins
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "motion/react";

const {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Scatter,
  ComposedChart,
  Line,
} = RechartsPrimitive as any;

interface MarketActivityChartProps {
  history?: NFTHistory[];
  offers?: NFTOffer[];
  currentPrice: string;
  className?: string;
}

interface ChartDataPoint {
  date: number; // timestamp
  dateLabel: string;
  price: number;
  event: string;
  type: 'sale' | 'bid' | 'list' | 'current';
  fullDate: string;
}

const cleanPrice = (priceStr?: string): number => {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9.]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const containerVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1
    }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

export const MarketActivityChart: React.FC<MarketActivityChartProps> = ({
  history,
  offers,
  currentPrice,
  className
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'sales' | 'bids'>('all');

  const chartData = useMemo(() => {
    const data: ChartDataPoint[] = [];

    // 1. Process History (Sales and List events)
    if (history) {
      history.forEach((h) => {
        const price = cleanPrice(h.price);
        if (price === 0) return;

        const dateObj = new Date(h.date);
        if (isNaN(dateObj.getTime())) return;

        const eventType = h.event.toLowerCase();
        let type: 'sale' | 'list' | 'bid' = 'sale';
        if (eventType.includes('list')) type = 'list';
        if (eventType.includes('bid')) type = 'bid';

        data.push({
          date: dateObj.getTime(),
          dateLabel: format(dateObj, "MMM d"),
          fullDate: format(dateObj, "MMM d, yyyy HH:mm"),
          price,
          event: h.event,
          type
        });
      });
    }

    // 2. Process Offers as Bids
    if (offers) {
      offers.forEach((o) => {
        const price = cleanPrice(o.price);
        if (price === 0) return;

        // Try to handle varied timestamp formats
        let dateObj = new Date(o.timestamp);
        if (isNaN(dateObj.getTime())) {
          // If it's a relative string like "Just now" or "2h ago", use current time for simplicity in chart
          dateObj = new Date();
        }

        data.push({
          date: dateObj.getTime(),
          dateLabel: format(dateObj, "MMM d"),
          fullDate: format(dateObj, "MMM d, yyyy HH:mm"),
          price,
          event: "Bid Received",
          type: 'bid'
        });
      });
    }

    // 3. Add current price as latest point
    const now = new Date();
    data.push({
      date: now.getTime(),
      dateLabel: format(now, "MMM d"),
      fullDate: format(now, "MMM d, yyyy HH:mm"),
      price: cleanPrice(currentPrice),
      event: "Current Price",
      type: 'current'
    });

    // Sort by date
    return data.sort((a, b) => a.date - b.date);
  }, [history, offers, currentPrice]);

  const filteredData = useMemo(() => {
    if (activeTab === 'all') return chartData;
    if (activeTab === 'sales') return chartData.filter(d => d.type === 'sale' || d.type === 'current');
    if (activeTab === 'bids') return chartData.filter(d => d.type === 'bid');
    return chartData;
  }, [chartData, activeTab]);

  const stats = useMemo(() => {
    const salePrices = chartData.filter(d => d.type === 'sale').map(d => d.price);
    const bidPrices = offers?.map(o => cleanPrice(o.price)) || [];
    
    return {
      avgSale: salePrices.length > 0 ? (salePrices.reduce((a, b) => a + b, 0) / salePrices.length).toFixed(2) : "0.00",
      maxBid: bidPrices.length > 0 ? Math.max(...bidPrices).toFixed(2) : "0.00",
      totalEvents: chartData.length
    };
  }, [chartData, offers]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      return (
        <div className="bg-black/95 backdrop-blur-xl border border-white/10 p-3 rounded-[4px] shadow-2xl min-w-[160px]">
          <div className="flex items-center justify-between mb-2">
             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{data.fullDate}</span>
             <div className={cn(
               "w-1.5 h-1.5 rounded-full animate-pulse",
               data.type === 'sale' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
               data.type === 'bid' ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" :
               "bg-amber-500"
             )} />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-white uppercase tracking-tight">{data.event}</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-white font-mono">{data.price}</span>
              <span className="text-[10px] font-bold text-blue-400">TON</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn("bg-white/5 backdrop-blur-xl rounded-[4px] p-6 flex flex-col gap-6", className)}
    >
      <div className="flex items-center justify-between">
        <motion.div variants={itemVariants} className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500" />
            <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.4em]">Market Activity</h3>
          </div>
          <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest pl-6">Neural Transaction History</p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center gap-1 bg-black/40 p-1 rounded-[4px]">
          {(['all', 'sales', 'bids'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-1.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest transition-all",
                activeTab === tab 
                  ? "bg-blue-600/20 text-blue-400" 
                  : "text-muted-foreground/60 hover:text-white"
              )}
            >
              {tab}
            </button>
          ))}
        </motion.div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Avg Sale", value: stats.avgSale, unit: "TON" },
          { label: "Highest Bid", value: stats.maxBid, unit: "TON" },
          { label: "Data Points", value: stats.totalEvents, unit: "LOGS" }
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            className="bg-white/[0.02] p-3 rounded-[4px]"
          >
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">{stat.label}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black text-white font-mono">{stat.value}</span>
              <span className="text-[8px] font-bold text-blue-500">{stat.unit}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants} className="h-[300px] w-full relative -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={filteredData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <defs>
              <linearGradient id="colorPriceActivity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis 
              dataKey="dateLabel" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 9, fontWeight: 700, fill: '#666', letterSpacing: '0.1em' }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 9, fontWeight: 700, fill: '#666', fontFamily: 'monospace' }} 
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
            
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorPriceActivity)" 
              activeDot={{ r: 4, strokeWidth: 0, fill: '#3b82f6' }}
              isAnimationActive={true}
              animationDuration={2000}
              animationBegin={400}
            />
            
            <Scatter 
              data={filteredData.filter(d => d.type === 'bid')} 
              fill="#22c55e" 
              shape="circle"
              isAnimationActive={true}
            />
            
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="transparent" 
              isAnimationActive={true}
              animationDuration={2000}
              animationBegin={400}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (payload.type === 'sale') {
                  return (
                    <circle 
                      key={`sale-dot-${payload.date}`}
                      cx={cx} 
                      cy={cy} 
                      r={4} 
                      fill="#10b981" 
                      stroke="#000" 
                      strokeWidth={1}
                    />
                  );
                }
                return null as any;
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center justify-between text-[8px] font-bold text-muted-foreground uppercase tracking-widest pt-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>Valuation Trend</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span>Confirmed Sale</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span>Bids Recorded</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Zap className="h-3 w-3 text-amber-500" />
           <span>Neural Bridge Active</span>
        </div>
      </motion.div>
    </motion.div>
  );
};
