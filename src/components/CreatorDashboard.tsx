import React, { useMemo, useState } from 'react';
import * as RechartsPrimitive from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  DollarSign, 
  ShoppingBag, 
  MessageCircle, 
  Heart, 
  Share2,
  ArrowUpRight,
  Zap,
  Star,
  Award,
  Trophy,
  Crown,
  Medal,
  Gem
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

import FanLeaderboardWidget from './FanLeaderboardWidget';

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
  Cell
} = RechartsPrimitive as any;

const CreatorDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('7d');

  // simulated metrics based on time range
  const metrics = useMemo(() => {
    const multipliers = {
      '7d': 1,
      '30d': 3.8,
      '90d': 10.5,
      'all': 45.2
    };
    const m = multipliers[timeRange];
    return {
      earnings: 1420.50 * m,
      sales: Math.floor(156 * m),
      collectors: Math.floor(4821 * (m * 0.8)),
      engagement: Math.min(1000, Math.floor(842 * (1 + (m * 0.01))))
    };
  }, [timeRange]);

  // Mock data for sales velocity
  const salesData = useMemo(() => {
    const base = [
      { day: 'Mon', sales: 12, volume: 45 },
      { day: 'Tue', sales: 19, volume: 72 },
      { day: 'Wed', sales: 15, volume: 58 },
      { day: 'Thu', sales: 22, volume: 85 },
      { day: 'Fri', sales: 30, volume: 120 },
      { day: 'Sat', sales: 28, volume: 110 },
      { day: 'Sun', sales: 25, volume: 95 },
    ];
    
    if (timeRange === '7d') return base;
    
    // For longer ranges, we'll return more data points or aggregated labels
    const ranges = {
      '30d': ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
      '90d': ['Month 1', 'Month 2', 'Month 3'],
      'all': ['2023', 'Q1 24', 'Q2 24', 'Q3 24', 'Q4 24']
    };
    
    const labels = ranges[timeRange as keyof typeof ranges];
    return labels.map(label => ({
      day: label,
      sales: Math.floor(Math.random() * 100 * (timeRange === 'all' ? 5 : 2)),
      volume: Math.floor(Math.random() * 500 * (timeRange === 'all' ? 10 : 3))
    }));
  }, [timeRange]);

  // Mock engagement data
  const engagementMetrics = useMemo(() => {
    const m = timeRange === '7d' ? 1 : timeRange === '30d' ? 4 : timeRange === '90d' ? 12 : 50;
    return [
      { name: 'Likes', count: Math.floor(1240 * m), icon: Heart, color: 'text-success' },
      { name: 'Comments', count: Math.floor(482 * m), icon: MessageCircle, color: 'text-primary' },
      { name: 'Shares', count: Math.floor(156 * m), icon: Share2, color: 'text-verified' },
      { name: 'NFT Resales', count: Math.floor(84 * m), icon: ShoppingBag, color: 'text-primary' },
    ];
  }, [timeRange]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-text-primary uppercase tracking-tight flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Creator Intelligence
          </h2>
          <p className="text-caption uppercase mt-1">
            Real-time market analytics for {userProfile?.name || 'Artist'}
          </p>
        </div>

        <div className="flex bg-surface p-1 rounded-button border border-divider">
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-4 py-1.5 rounded-button text-[10px] font-black uppercase tracking-widest transition-all",
                timeRange === range ? "bg-primary text-black" : "text-text-muted hover:text-text-primary"
              )}
            >
              {range === 'all' ? 'ALL' : range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} className="bg-surface border border-divider p-5 rounded-card group hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-success/10 rounded-xl">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <span className="text-[10px] font-black text-success flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +24%
            </span>
          </div>
          <p className="text-caption uppercase">Total Earnings</p>
          <div className="flex items-baseline gap-1 mt-1">
            <h3 className="text-2xl font-black text-text-primary font-mono">{metrics.earnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <span className="text-xs font-bold text-text-muted">TON</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-surface border border-divider p-5 rounded-card group hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[10px] font-black text-primary flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +{Math.floor(metrics.sales * 0.08)}
            </span>
          </div>
          <p className="text-caption uppercase">NFT Sales</p>
          <div className="flex items-baseline gap-1 mt-1">
            <h3 className="text-2xl font-black text-text-primary font-mono">{metrics.sales.toLocaleString()}</h3>
            <span className="text-xs font-bold text-text-muted">Items</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-surface border border-divider p-5 rounded-card group hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-verified/10 rounded-xl">
              <Users className="w-5 h-5 text-verified" />
            </div>
            <span className="text-[10px] font-black text-verified flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +{Math.floor(metrics.collectors * 0.2)}
            </span>
          </div>
          <p className="text-caption uppercase">Total Collectors</p>
          <div className="flex items-baseline gap-1 mt-1">
            <h3 className="text-2xl font-black text-text-primary font-mono">{metrics.collectors.toLocaleString()}</h3>
            <span className="text-xs font-bold text-text-muted">Fans</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-surface border border-divider p-5 rounded-card group hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-success/10 rounded-xl">
              <Star className="w-5 h-5 text-success" />
            </div>
            <span className="text-[10px] font-black text-success flex items-center gap-0.5">
              Level {metrics.engagement > 800 ? '5' : '4'}
            </span>
          </div>
          <p className="text-caption uppercase">Fan Engagement Score</p>
          <div className="flex items-baseline gap-1 mt-1">
            <h3 className="text-2xl font-black text-text-primary font-mono">{metrics.engagement}</h3>
            <span className="text-xs font-bold text-text-muted">/ 1000</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Velocity Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-surface border border-divider p-6 rounded-card">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-success" />
                Sales Velocity
              </h3>
              <p className="text-caption uppercase mt-1">Performance trend index</p>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-divider)" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontWeight: 600 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="var(--color-primary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#salesGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Engagement Breakdown */}
        <motion.div variants={itemVariants} className="bg-surface border border-divider p-6 rounded-card">
          <h3 className="text-sm font-black text-text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
            <Heart className="w-4 h-4 text-error" />
            Social Engagement
          </h3>
          
          <div className="space-y-6">
            {engagementMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.name} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-xl bg-background group-hover:scale-110 transition-transform", metric.color)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-text-primary">{metric.name}</span>
                    </div>
                    <span className="text-sm font-black text-text-primary font-mono">{metric.count.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(metric.count / (1500 * (timeRange === 'all' ? 50 : 1))) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={cn("h-full rounded-full", metric.color.replace('text-', 'bg-'))}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 p-4 bg-success/5 border border-success/10 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-success" />
              <span className="text-[10px] font-black text-success uppercase tracking-widest">Growth Recommendation</span>
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed font-medium">
              Your engagement is up 12% this week. Releasing a limited 1/1 NFT could capture current momentum.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Fan Leaderboard Section */}
      <FanLeaderboardWidget />

      {/* Recent Activity Table */}
      <motion.div variants={itemVariants} className="bg-surface border border-divider p-6 rounded-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Fan Signals</h3>
          <button className="text-caption uppercase hover:text-text-primary transition-colors">View All Activity</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-divider">
                <th className="pb-4 text-caption uppercase">Collector</th>
                <th className="pb-4 text-caption uppercase">Event</th>
                <th className="pb-4 text-caption uppercase text-right">Value</th>
                <th className="pb-4 text-caption uppercase text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {[
                { user: 'Alex.ton', type: 'NFT Purchase', value: '5.2 TON', time: '2m ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
                { user: 'Sarah_Vibes', type: 'Super Like', value: '10 JAM', time: '12m ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
                { user: 'NeonCollector', type: 'Auction Bid', value: '12.5 TON', time: '45m ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neon' },
                { user: 'CryptoPunk', type: 'Resale Royalty', value: '0.45 TON', time: '1h ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Punk' },
              ].map((activity, i) => (
                <tr key={i} className="group hover:bg-background/20 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <img src={activity.avatar} className="w-8 h-8 rounded-full bg-background" alt="" />
                      <span className="text-xs font-bold text-text-primary">{activity.user}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-xs font-medium text-text-muted">{activity.type}</span>
                  </td>
                  <td className="py-4 text-right">
                    <span className="text-xs font-black text-text-primary font-mono">{activity.value}</span>
                  </td>
                  <td className="py-4 text-right">
                    <span className="text-[10px] font-bold text-text-muted">{activity.time}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreatorDashboard;
