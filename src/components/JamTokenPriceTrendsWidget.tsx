import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Coins, 
  Flame, 
  Lock, 
  RefreshCw,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { TJ_COIN_ICON, JAM_PRICE_USD, JAM_JETTON_MASTER, TON_LOGO } from '@/constants';
import { useTonPrice } from '@/contexts/TonPriceContext';

export type JamTimeframe = '24H' | '7D' | '30D' | '90D' | '1Y';

export interface JamPricePoint {
  timestamp: string;
  label: string;
  price: number;
  volume: number;
  high: number;
  low: number;
}

interface JamTokenPriceTrendsWidgetProps {
  className?: string;
  showQuickActions?: boolean;
}

// Generate realistic daily trend curves based on the JAM base price
const generateDailyTrendData = (timeframe: JamTimeframe, basePrice: number): JamPricePoint[] => {
  const pointsCount = timeframe === '24H' ? 24 : timeframe === '7D' ? 7 : timeframe === '30D' ? 30 : timeframe === '90D' ? 45 : 52;
  const now = new Date();
  const data: JamPricePoint[] = [];

  // Seeded random walk for smooth realistic market curves
  let current = basePrice * 0.94;
  const volatility = timeframe === '24H' ? 0.008 : 0.025;

  for (let i = pointsCount; i >= 0; i--) {
    const d = new Date(now);
    if (timeframe === '24H') {
      d.setHours(d.getHours() - i);
    } else {
      d.setDate(d.getDate() - (timeframe === '1Y' ? i * 7 : i * (timeframe === '90D' ? 2 : 1)));
    }

    const shock = (Math.sin(i * 0.7) * 0.015) + ((Math.random() - 0.47) * volatility);
    current = Math.max(0.038, current * (1 + shock));
    
    // Ensure the last point aligns closely to live price
    if (i === 0) {
      current = basePrice;
    }

    const formattedLabel = timeframe === '24H' 
      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString([], { month: 'short', day: 'numeric' });

    data.push({
      timestamp: d.toISOString(),
      label: formattedLabel,
      price: Number(current.toFixed(4)),
      volume: Math.floor(120000 + (Math.sin(i * 0.5) + 1) * 65000 + Math.random() * 20000),
      high: Number((current * 1.018).toFixed(4)),
      low: Number((current * 0.982).toFixed(4)),
    });
  }

  return data;
};

export const JamTokenPriceTrendsWidget: React.FC<JamTokenPriceTrendsWidgetProps> = ({
  className = '',
  showQuickActions = true,
}) => {
  const navigate = useNavigate();
  const { price: tonUsdPrice } = useTonPrice();
  const [timeframe, setTimeframe] = useState<JamTimeframe>('30D');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Compute daily price trends
  const trendData = useMemo(() => {
    return generateDailyTrendData(timeframe, JAM_PRICE_USD);
  }, [timeframe]);

  const firstPrice = trendData[0]?.price || JAM_PRICE_USD;
  const latestPrice = trendData[trendData.length - 1]?.price || JAM_PRICE_USD;
  const priceChange = latestPrice - firstPrice;
  const percentageChange = Number(((priceChange / firstPrice) * 100).toFixed(2));
  const isPositive = percentageChange >= 0;

  const minPrice = useMemo(() => Math.min(...trendData.map(d => d.price)), [trendData]);
  const maxPrice = useMemo(() => Math.max(...trendData.map(d => d.price)), [trendData]);
  const totalVolume = useMemo(() => trendData.reduce((acc, curr) => acc + curr.volume, 0), [trendData]);
  const avgVolume = Math.round(totalVolume / trendData.length);

  // Approximate TON equivalent (e.g. JAM in TON)
  const jamInTon = tonUsdPrice && tonUsdPrice > 0 ? (latestPrice / tonUsdPrice).toFixed(4) : '0.0081';

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Custom Recharts Tooltip matching TonJam dark navy identity
  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: JamPricePoint = payload[0].payload;
      return (
        <div className="bg-[#0A1628]/95 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl text-xs space-y-1.5 min-w-[170px]">
          <div className="flex items-center justify-between text-slate-400 font-semibold pb-1">
            <span>{data.label}</span>
            <span className="text-[10px] text-cyan-400 font-mono">JAM / USD</span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-slate-400 font-medium">Price:</span>
            <span className="text-white font-mono font-bold text-sm tracking-tight">${data.price.toFixed(4)}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-slate-400 font-medium">24h Vol:</span>
            <span className="text-slate-200 font-mono">${data.volume.toLocaleString()}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3 text-[11px] pt-0.5">
            <span className="text-slate-400 font-medium">Range:</span>
            <span className="text-slate-400 font-mono">${data.low.toFixed(4)} - ${data.high.toFixed(4)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-[#0A1628]/70 backdrop-blur-md rounded-2xl p-5 sm:p-6 text-white space-y-6 ${className}`}>
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={TJ_COIN_ICON} 
              alt="JAM Token" 
              className="w-11 h-11 object-contain rounded-full bg-[#07111F]/80 p-0.5 shadow-lg shadow-[#0088CC]/10" 
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#0088CC] flex items-center justify-center text-[9px] font-black text-white">
              TJ
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                JAM Token
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0088CC]/15 text-[#00B4D8]">
                Native Utility
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Daily market price trends, liquidity & staking metrics
            </p>
          </div>
        </div>

        {/* Timeframe Filter Buttons - Completely Borderless */}
        <div className="flex items-center gap-1 bg-[#07111F]/80 p-1 rounded-full self-start sm:self-auto">
          {(['24H', '7D', '30D', '90D', '1Y'] as JamTimeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer outline-none ${
                timeframe === tf
                  ? 'bg-[#0088CC] text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {tf}
            </button>
          ))}
          <button 
            onClick={handleRefresh}
            title="Refresh trend data"
            className="p-1.5 ml-1 rounded-full text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00B4D8]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Primary Price & Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#07111F]/60 p-4 rounded-2xl">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Current Price
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white">
              ${latestPrice.toFixed(4)}
            </span>
            <div className={`flex items-center text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{Math.abs(percentageChange)}%</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <img src={TON_LOGO} alt="TON" className="w-3 h-3 object-contain inline" />
            <span>≈ {jamInTon} TON</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Period High / Low
          </span>
          <div className="text-xs font-mono font-bold text-white">
            <span className="text-emerald-400">${maxPrice.toFixed(4)}</span>
            <span className="text-slate-500 mx-1">/</span>
            <span className="text-rose-400">${minPrice.toFixed(4)}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Selected {timeframe} window
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Avg Daily Volume
          </span>
          <div className="text-xs sm:text-sm font-mono font-bold text-white">
            ${avgVolume.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">
            DEX & Marketplace
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Market Cap
          </span>
          <div className="text-xs sm:text-sm font-mono font-bold text-white">
            ${(latestPrice * 100000000).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <p className="text-[11px] text-slate-400">
            100M Circulating JAM
          </p>
        </div>
      </div>

      {/* Recharts Price Trend Chart */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="flex items-center gap-1.5 text-white font-semibold">
            <TrendingUp className="w-4 h-4 text-[#00B4D8]" />
            Daily Price Trend Curve
          </span>
          <span className="text-[11px] font-mono text-[#00B4D8]">
            TON Jetton DEX Liquidity
          </span>
        </div>

        <div className="h-[230px] sm:h-[260px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={trendData} 
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="jamPriceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00B4D8" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#0088CC" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} 
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={['dataMin - 0.002', 'dataMax + 0.002']}
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                tickFormatter={(val) => `$${val.toFixed(3)}`}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#00B4D8" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#jamPriceGradient)" 
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Token Utilities & Quick Actions */}
      {showQuickActions && (
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#00B4D8]" />
              <span>42.3M Staked (42.3%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>1.42M Burned</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/staking')}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Coins className="w-3.5 h-3.5 text-cyan-400" />
              Stake JAM
            </button>
            <button
              onClick={() => navigate('/wallet')}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#0088CC] hover:bg-[#0098EA] text-xs font-semibold text-white shadow-md shadow-[#0088CC]/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Swap & Buy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JamTokenPriceTrendsWidget;
