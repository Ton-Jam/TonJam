import React, { useMemo, useState, useEffect } from 'react';
import * as RechartsPrimitive from 'recharts';
import { 
  TrendingUp, 
  Music, 
  Coins, 
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  Activity,
  DollarSign
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const {
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  LineChart,
  Line
} = RechartsPrimitive as any;

interface DashboardData {
  time: string;
  earnings: number;
  streams: number;
  royalties: number;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const ArtistRevenueDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData[]>([]);
  const [activeMetric, setActiveMetric] = useState<'earnings' | 'streams' | 'royalties'>('earnings');

  // Initialize and update real-time data
  useEffect(() => {
    const initialData = Array.from({ length: 20 }, (_, i) => ({
      time: `${i}:00`,
      earnings: 50 + Math.random() * 100,
      streams: 1000 + Math.random() * 5000,
      royalties: 20 + Math.random() * 50,
    }));
    setData(initialData);

    const interval = setInterval(() => {
      setData(prev => {
        const nextTime = (parseInt(prev[prev.length - 1].time.split(':')[0]) + 1) % 24;
        const newDataPoint = {
          time: `${nextTime}:00`,
          earnings: 50 + Math.random() * 100,
          streams: 1000 + Math.random() * 5000,
          royalties: 20 + Math.random() * 50,
        };
        return [...prev.slice(1), newDataPoint];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const totalStreams = data.reduce((acc, curr) => acc + curr.streams, 0);
    const totalEarnings = data.reduce((acc, curr) => acc + curr.earnings, 0);
    const totalRoyalties = data.reduce((acc, curr) => acc + curr.royalties, 0);
    
    return {
      totalStreams,
      totalEarnings,
      totalRoyalties,
      avgEarnings: totalEarnings / data.length,
    };
  }, [data]);

  const royaltyDistribution = [
    { name: 'Direct Sales', value: 45 },
    { name: 'Secondary Royalties', value: 25 },
    { name: 'Streaming Payouts', value: 20 },
    { name: 'License Fees', value: 10 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <p className="text-sm font-black text-white">
                {entry.name === 'earnings' || entry.name === 'royalties' ? '$' : ''}
                {entry.value.toLocaleString()}
                {entry.name === 'streams' ? ' Streams' : ''}
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <motion.div 
        variants={itemVariants}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Artist Revenue Command
          </h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">
            Real-time signal analysis of music NFT economy
          </p>
        </div>

        <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
          {(['earnings', 'streams', 'royalties'] as const).map(metric => (
            <button
              key={metric}
              onClick={() => setActiveMetric(metric)}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                activeMetric === metric 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                  : "text-muted-foreground hover:text-white"
              )}
            >
              {metric}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4 }}
          className="bg-white/[0.03] p-5 rounded-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Music className="w-9 h-9 text-white" />
          </div>
          <div className="relative z-10">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Network Streams</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black text-white font-mono">
                {stats.totalStreams.toLocaleString()}
              </h3>
              <span className="text-[10px] font-bold text-emerald-500 mb-1 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> 12%
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4 }}
          className="bg-white/[0.03] p-5 rounded-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Coins className="w-9 h-9 text-white" />
          </div>
          <div className="relative z-10">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">NFT Revenue</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black text-white font-mono">
                ${stats.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <span className="text-[10px] font-bold text-emerald-500 mb-1 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> 8.4%
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4 }}
          className="bg-white/[0.03] p-5 rounded-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-9 h-9 text-white" />
          </div>
          <div className="relative z-10">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Active Royalty Pool</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black text-white font-mono">
                ${stats.totalRoyalties.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <span className="text-[10px] font-bold text-blue-500 mb-1 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> 4.2%
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 bg-white/[0.02] p-6 rounded-3xl"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                {activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)} Velocity
              </h3>
              <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase">24-Hour Signal Strength</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-[9px] font-bold text-slate-400 uppercase">Live Pulse</span>
              </div>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeMetric === 'earnings' ? '#3b82f6' : activeMetric === 'streams' ? '#8b5cf6' : '#ec4899'} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={activeMetric === 'earnings' ? '#3b82f6' : activeMetric === 'streams' ? '#8b5cf6' : '#ec4899'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                  interval={2}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff10', strokeWidth: 2 }} />
                <Area 
                  type="monotone" 
                  dataKey={activeMetric} 
                  stroke={activeMetric === 'earnings' ? '#3b82f6' : activeMetric === 'streams' ? '#8b5cf6' : '#ec4899'} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorMetric)" 
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Royalty Distribution */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/[0.02] p-6 rounded-3xl flex flex-col"
        >
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Royalty Architecture</h3>
          <p className="text-[10px] text-muted-foreground font-bold uppercase mb-6">Secondary distribution breakdown</p>
          
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={royaltyDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {royaltyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff', fontWeight: 800 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total</span>
              <span className="text-xl font-black text-white">100%</span>
            </div>
          </div>

          <div className="mt-auto space-y-3">
            {royaltyDistribution.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-[11px] font-bold text-slate-300">{item.name}</span>
                </div>
                <span className="text-[11px] font-black text-white font-mono">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ArtistRevenueDashboard;
