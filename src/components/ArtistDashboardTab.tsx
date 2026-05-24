import * as React from 'react';
import * as RechartsPrimitive from 'recharts';
import { Twitter, Instagram, Music, CheckCircle2 } from 'lucide-react';

const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } = RechartsPrimitive as any;

const ResponsiveContainerRC = ResponsiveContainer as any;
const BarChartRC = BarChart as any;
const BarRC = Bar as any;
const XAxisRC = XAxis as any;
const YAxisRC = YAxis as any;
const TooltipRC = Tooltip as any;
const LegendRC = Legend as any;
const PieChartRC = PieChart as any;
const PieRC = Pie as any;
const CellRC = Cell as any;
const LineChartRC = LineChart as any;
const LineRC = Line as any;
const CartesianGridRC = CartesianGrid as any;
import { Button } from "@/components/ui/button";
import { useNotification } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { motion } from "motion/react";

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export const ArtistDashboardTab: React.FC<{ totalEarnings: number }> = ({ totalEarnings }) => {
  const genreData = [
    { name: 'Electronic', value: 400 },
    { name: 'Lo-fi', value: 300 },
    { name: 'Ambient', value: 300 },
    { name: 'Hip-Hop', value: 200 },
  ];

  // Timeframe states for all charts
  const [revenueTimeFrame, setRevenueTimeFrame] = React.useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [expandedMonth, setExpandedMonth] = React.useState<string | null>(null);
  const [activityTimeFrame, setActivityTimeFrame] = React.useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [performanceTimeFrame, setPerformanceTimeFrame] = React.useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [activeSubTab, setActiveSubTab] = React.useState<'overview' | 'audit'>('overview');

  // Timeframe toggle component
  const TimeFrameToggle = ({ value, onChange }: { value: string, onChange: (val: any) => void }) => (
    <div className="inline-flex bg-background rounded-full p-1 border border-border">
      {['Daily', 'Weekly', 'Monthly'].map(tf => (
        <button
          key={tf}
          onClick={() => onChange(tf)}
          className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full transition-all ${value === tf ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {tf}
        </button>
      ))}
    </div>
  );

  // Last 30 days revenue trend data
  const revenueTrendData = React.useMemo(() => {
    const rawData = Array.from({ length: 90 }, (_, i) => ({
        day: i + 1,
        revenue: Math.floor(Math.random() * 500) + 100,
    }));
    
    if (revenueTimeFrame === 'Daily') {
        const history = rawData.slice(-30);
        
        // Calculate velocity (average daily increase)
        const diffs = [];
        for (let i = 1; i < history.length; i++) {
            diffs.push(history[i].revenue - history[i-1].revenue);
        }
        const avgIncrease = diffs.reduce((a, b) => a + b, 0) / diffs.length;
        
        // Generate projection
        const projection = [];
        let lastRevenue = history[history.length - 1].revenue;
        for (let i = 1; i <= 30; i++) {
            lastRevenue += avgIncrease;
            projection.push({ 
                day: 30 + i, 
                revenue: lastRevenue,
                projected: true 
            });
        }
        
        return [...history.map(d => ({ ...d, projected: false })), ...projection];
    }

    if (revenueTimeFrame === 'Weekly') {
      const weekly = [];
      for(let i=0; i<rawData.length; i+=7) weekly.push({ day: `W${i/7+1}`, revenue: rawData.slice(i, i+7).reduce((acc, cur) => acc + cur.revenue, 0) });
      return weekly.slice(-12);
    }
    const monthly = [{ day: 'Jan', revenue: 5000 }, { day: 'Feb', revenue: 7000 }, { day: 'Mar', revenue: 6000 }];
    return monthly;
  }, [revenueTimeFrame]);

  // Hourly streaming activity (24 hours)
  const streamingActivityData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    streams: Math.floor(Math.random() * 1000),
  }));

  // Weekly stream performance
  const [weeklyStreamsData, setWeeklyStreamsData] = React.useState<{ day: string; streams: number }[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Fan Engagement Data
  const engagementData = [
    { x: 10, y: 30, z: 200, location: 'New York' },
    { x: 20, y: 50, z: 400, location: 'London' },
    { x: 30, y: 70, z: 300, location: 'Tokyo' },
    { x: 40, y: 20, z: 500, location: 'Berlin' },
    { x: 50, y: 80, z: 250, location: 'LA' },
  ];

  // Royalty Splits State
  const [splits, setSplits] = React.useState([
      { name: 'Self', value: 50 },
      { name: 'Producer', value: 25 },
      { name: 'Manager', value: 15 },
      { name: 'Collaborator', value: 10 },
  ]);

  // Royalty Notifications
  const [notifications, setNotifications] = React.useState([
      { id: 1, message: 'Producer split processed: 25% (track: Neon Waves)', timestamp: 'Just now' },
      { id: 2, message: 'Manager split processed: 15% (track: Echoes)', timestamp: '2h ago' },
  ]);

  // Royalty Audit Table
  interface AuditEntry {
      id: string;
      date: string;
      collaborator: string;
      amount: number;
      txHash: string;
  }

  const mockAuditData: AuditEntry[] = Array.from({ length: 15 }, (_, i) => ({
      id: `${i}`,
      date: `2026-05-${20 - (i % 5)}`,
      collaborator: ['Producer A', 'Manager B', 'Lyricist C'][i % 3],
      amount: Math.floor(Math.random() * 200) + 50,
      txHash: `0x${Math.random().toString(16).slice(2, 10)}...`
  }));

  const handleExportCSV = () => {
    const headers = ['Date', 'Collaborator', 'Amount (TON)', 'TX Hash'];
    const rows = mockAuditData.map(entry => [entry.date, entry.collaborator, entry.amount, entry.txHash]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'royalty_audit_log.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const [auditPage, setAuditPage] = React.useState(1);
  const itemsPerPage = 5;
  const paginatedAuditData = mockAuditData.slice((auditPage - 1) * itemsPerPage, auditPage * itemsPerPage);

  // AI Royalty Advisor
  const [advice, setAdvice] = React.useState<string[]>([]);
  const [adviceLoading, setAdviceLoading] = React.useState(false);
  
  // AI Audit Analysis
  const [auditFindings, setAuditFindings] = React.useState<string[]>([]);
  const [auditLoading, setAuditLoading] = React.useState(false);

  const { user } = useAuth();
  const { preferences, addNotification } = useNotification();
  const hasAlerted = React.useRef(false);

  React.useEffect(() => {
    if (user && preferences.revenueThreshold && totalEarnings >= preferences.revenueThreshold && !hasAlerted.current) {
        addNotification({
            userId: user.uid,
            type: 'general',
            title: 'Revenue Milestone!',
            message: `Congratulations! Your monthly revenue has exceeded ${preferences.revenueThreshold} TON.`,
        });
        hasAlerted.current = true;
    }
  }, [user, totalEarnings, preferences.revenueThreshold]);

  const fetchRoyaltyAdvice = async () => {
    setAdviceLoading(true);
    try {
        const perfData = { streams: 14000, growth: "18.2%", tracks: ["Neon Waves"] }; // Mock current performance
        const response = await fetch('/api/royalty-advice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trackPerformance: perfData })
        });
        const data = await response.json();
        setAdvice(data.recommendations || []);
    } catch(e) {
        console.error("Failed to get advice", e);
    } finally {
        setAdviceLoading(false);
    }
  };

  const fetchRoyaltyAudit = async () => {
    setAuditLoading(true);
    try {
        const response = await fetch('/api/royalty-audit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ auditData: mockAuditData })
        });
        const data = await response.json();
        setAuditFindings(data.findings || []);
    } catch(e) {
        console.error("Failed to get audit findings", e);
    } finally {
        setAuditLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRoyaltyAdvice();
    fetchRoyaltyAudit();
  }, []);

  const updateSplit = (index: number, newValue: string) => {
      const val = parseInt(newValue) || 0;
      setSplits(prev => prev.map((s, i) => i === index ? { ...s, value: val } : s));
  };

  React.useEffect(() => {
    // Simulated Firestore fetch for the last 7 days
    const fetchWeeklyStreams = async () => {
      try {
          // In a real implementation, you would query Firestore:
          // const q = query(collection(db, 'streams'), where('timestamp', '>=', sevenDaysAgo));
          // const snapshot = await getDocs(q);
          
          // Simulating the data for now
          const data = [
            { day: 'Mon', streams: 1200 },
            { day: 'Tue', streams: 1900 },
            { day: 'Wed', streams: 1500 },
            { day: 'Thu', streams: 2100 },
            { day: 'Fri', streams: 3200 },
            { day: 'Sat', streams: 2800 },
            { day: 'Sun', streams: 2500 },
          ];
          setWeeklyStreamsData(data);
      } catch (error) {
        console.error("Error fetching weekly streams:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWeeklyStreams();
  }, []);

  const MetricCard = ({ title, value, sub }: { title: string, value: string, sub: string }) => (
      <div className="bg-card p-6 rounded-3xl border border-border">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</h4>
          <p className="text-3xl font-black mt-2">{value}</p>
          <p className="text-[10px] font-bold text-emerald-500 mt-1">{sub}</p>
      </div>
  );

  const [linkedSocials, setLinkedSocials] = React.useState({ twitter: false, instagram: false, spotify: false });

  const handleVerify = async (provider: string) => {
    try {
        const response = await fetch(`/api/auth/${provider.toLowerCase()}/url`);
        const { url } = await response.json();
        const authWindow = window.open(url, 'oauth_popup', 'width=600,height=700');
        
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.provider === provider.toLowerCase()) {
                window.removeEventListener('message', handleMessage);
                setLinkedSocials(prev => ({ ...prev, [provider.toLowerCase()]: true }));
                console.log(`Successfully linked ${provider}!`);
            }
        };
        window.addEventListener('message', handleMessage);
        
    } catch (e) {
        console.error('OAuth initiation error:', e);
    }
  };

  const socials = [
    { name: 'Twitter', icon: Twitter, color: 'text-blue-400' },
    { name: 'Instagram', icon: Instagram, color: 'text-pink-400' },
    { name: 'Spotify', icon: Music, color: 'text-green-400' },
  ];

  return (
    <div className="p-6 bg-background space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-black uppercase tracking-widest text-foreground">Artist Performance Dashboard</h2>
        
        {/* Flat style Subtab Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'overview' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-muted-foreground hover:text-foreground'}`}
          >
            Overview
          </button>
          <button
            id="artist-audit-tab"
            onClick={() => setActiveSubTab('audit')}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'audit' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-muted-foreground hover:text-foreground'}`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {activeSubTab === 'overview' ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <MetricCard title="Recent Earnings" value={`$${totalEarnings.toLocaleString()}`} sub="+12.5% from last month" />
              <MetricCard title="Top Performing Track" value="Neon Waves" sub="14k streams last week" />
              <MetricCard title="Monthly Growth" value="18.2%" sub="Total platform presence" />
          </div>

          {/* Social Verification Section */}
          <div className="bg-card p-6 rounded-3xl border border-border">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Verify Socials</h3>
            <div className="flex gap-4">
              {socials.map((social) => {
                 const Icon = social.icon;
                 const isLinked = linkedSocials[social.name.toLowerCase() as keyof typeof linkedSocials];
                 
                 return (
                   <div key={social.name}>
                     {isLinked ? (
                       <span className="text-emerald-500 text-[10px] font-bold uppercase flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                         <CheckCircle2 className="w-3 h-3" /> Linked {social.name}
                       </span>
                     ) : (
                       <Button variant="outline" onClick={() => handleVerify(social.name)} className="flex items-center gap-2 rounded-full border-white/10">
                         <Icon className={`w-4 h-4 ${social.color}`} /> Link {social.name}
                       </Button>
                     )}
                   </div>
                 );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Genre Breakdown */}
            <div className="bg-card p-6 rounded-3xl border border-border">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Streams by Genre</h3>
              <div className="h-64">
                <ResponsiveContainerRC width="100%" height="100%">
                  <PieChartRC>
                    <PieRC
                      data={genreData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {genreData.map((entry, index) => (
                        <CellRC key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </PieRC>
                    <TooltipRC />
                    <LegendRC />
                  </PieChartRC>
                </ResponsiveContainerRC>
              </div>
            </div>

            {/* Earning Trends */}
            <div className="bg-card p-6 rounded-3xl border border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest">Revenue Trend</h3>
                <TimeFrameToggle value={revenueTimeFrame} onChange={setRevenueTimeFrame} />
              </div>
              <div className="h-64">
                <ResponsiveContainerRC width="100%" height="100%">
                  <LineChartRC data={revenueTrendData}>
                    <CartesianGridRC strokeDasharray="4 4" stroke="#333" />
                    <XAxisRC dataKey="day" stroke="#666" fontSize={10} />
                    <YAxisRC stroke="#666" fontSize={10} />
                    <TooltipRC contentStyle={{ backgroundColor: '#111', border: 'none' }} />
                    <LineRC type="monotone" dataKey="revenue" data={revenueTrendData.filter(d => !d.projected)} stroke="#3b82f6" strokeWidth={2} dot={false} />
                    {revenueTimeFrame === 'Daily' && (
                      <LineRC type="monotone" dataKey="revenue" data={revenueTrendData.filter(d => d.projected)} stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    )}
                  </LineChartRC>
                </ResponsiveContainerRC>
              </div>

              {/* Month Breakdown Selector */}
              {revenueTimeFrame === 'Monthly' && (
                <div className="mt-6 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#666] mb-3">
                    Monthly Source Splits
                  </p>
                  {[
                    { 
                      month: 'Jan', 
                      revenue: 5000, 
                      tracks: [
                        { name: 'Neon Waves', type: 'Track Stream', count: '10,200', amount: 2800 },
                        { name: 'Echoes of Sky', type: 'Track Stream', count: '4,500', amount: 1200 },
                        { name: 'Cyberpunk Genesis #01', type: 'NFT Royalty', count: '1 copy', amount: 1000 }
                      ]
                    },
                    { 
                      month: 'Feb', 
                      revenue: 7000, 
                      tracks: [
                        { name: 'Neon Waves', type: 'Track Stream', count: '15,800', amount: 4100 },
                        { name: 'Electric Dreams #04', type: 'NFT Sale', count: '1 copy', amount: 2000 },
                        { name: 'Sunset Vibe', type: 'Track Stream', count: '3,100', amount: 900 }
                      ]
                    },
                    { 
                      month: 'Mar', 
                      revenue: 6000, 
                      tracks: [
                        { name: 'Neon Waves', type: 'Track Stream', count: '12,400', amount: 3200 },
                        { name: 'Retro Beats #12', type: 'NFT Royalty', count: '2 copies', amount: 1800 },
                        { name: 'Echoes of Sky', type: 'Track Stream', count: '3,800', amount: 1000 }
                      ]
                    }
                  ].map((d) => {
                    const isExpanded = expandedMonth === d.month;
                    return (
                      <div key={d.month} className="bg-white/5 rounded-2xl p-4 transition-all duration-250">
                        <div 
                          onClick={() => setExpandedMonth(isExpanded ? null : d.month)}
                          className="flex items-center justify-between cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center font-bold text-xs text-blue-400">
                              {d.month[0]}
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase tracking-wider text-white">{d.month} Earnings</p>
                              <p className="text-[10px] text-[#666] font-bold">{d.tracks.length} Revenue Sources</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-xs font-black text-blue-400">${d.revenue.toLocaleString()}</p>
                            <span className="text-[10px] text-[#666] transition-transform duration-250" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                              ▼
                            </span>
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-white/[0.05] space-y-3">
                            {d.tracks.map((track, i) => (
                              <div key={i} className="flex items-center justify-between py-1 text-xs">
                                <div>
                                  <p className="font-bold text-white uppercase tracking-tight text-[11px]">{track.name}</p>
                                  <span className="text-[9px] text-[#666] uppercase tracking-widest">{track.type} • {track.count}</span>
                                </div>
                                <p className="font-mono font-bold text-emerald-400 text-[11px]">+${track.amount}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Daily Streaming Activity */}
          <div className="bg-card p-6 rounded-3xl border border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest">Daily Streaming Activity</h3>
                <TimeFrameToggle value={activityTimeFrame} onChange={setActivityTimeFrame} />
              </div>
              <div className="h-64">
                <ResponsiveContainerRC width="100%" height="100%">
                  <BarChartRC data={streamingActivityData}>
                    <CartesianGridRC strokeDasharray="4 4" stroke="#333" />
                    <XAxisRC dataKey="hour" stroke="#666" fontSize={10} />
                    <YAxisRC stroke="#666" fontSize={10} />
                    <TooltipRC contentStyle={{ backgroundColor: '#111', border: 'none' }} />
                    <BarRC dataKey="streams" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChartRC>
                </ResponsiveContainerRC>
              </div>
          </div>

          {/* Weekly Stream Performance */}
          <div className="bg-card p-6 rounded-3xl border border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest">Weekly Stream Performance</h3>
                <TimeFrameToggle value={performanceTimeFrame} onChange={setPerformanceTimeFrame} />
              </div>
              <div className="h-64">
                <ResponsiveContainerRC width="100%" height="100%">
                  <LineChartRC data={weeklyStreamsData}>
                    <CartesianGridRC strokeDasharray="4 4" stroke="#333" />
                    <XAxisRC dataKey="day" stroke="#666" fontSize={10} />
                    <YAxisRC stroke="#666" fontSize={10} />
                    <TooltipRC contentStyle={{ backgroundColor: '#111', border: 'none' }} />
                    <LineRC type="monotone" dataKey="streams" stroke="#ec4899" strokeWidth={2} />
                  </LineChartRC>
                </ResponsiveContainerRC>
              </div>
          </div>

          {/* Automated Royalty Splitter */}
          <div className="bg-card p-6 rounded-3xl border border-border">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Automated Royalty Splitter</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                      {splits.map((split, index) => (
                          <div key={split.name} className="flex items-center gap-4">
                              <label className="text-xs font-bold text-muted-foreground w-20">{split.name}</label>
                              <input 
                                  type="number" 
                                  value={split.value} 
                                  onChange={(e) => updateSplit(index, e.target.value)}
                                  className="w-16 bg-background rounded-lg border border-border p-2 text-center text-xs font-bold"
                              />
                              <span className="text-xs text-muted-foreground">%</span>
                          </div>
                      ))}
                  </div>
                  <div className="h-48">
                    <ResponsiveContainerRC width="100%" height="100%">
                      <PieChartRC>
                          <PieRC data={splits} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8">
                              {splits.map((entry, index) => (
                                  <CellRC key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                          </PieRC>
                          <TooltipRC />
                      </PieChartRC>
                    </ResponsiveContainerRC>
                  </div>
              </div>
          </div>

          {/* AI Royalty Advisor */}
          <div className="bg-card p-6 rounded-3xl border border-border">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6">AI Royalty Advisor</h3>
              {adviceLoading ? (
                <p className="text-[10px] text-muted-foreground animate-pulse">Analyzing performance...</p>
              ) : (
                <div className="space-y-4">
                  {advice.map((item, index) => (
                      <div key={index} className="p-4 bg-background rounded-2xl border border-border text-xs text-foreground">
                          {item}
                      </div>
                  ))}
                </div>
              )}
          </div>

          {/* Automated Royalty Payout Notifications */}
          <div className="bg-card p-6 rounded-3xl border border-border">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Royalty Payout Notifications</h3>
              <div className="space-y-4">
                  {notifications.map((notif) => (
                      <div key={notif.id} className="flex items-center justify-between p-4 bg-background rounded-2xl border border-border">
                          <p className="text-xs font-medium text-foreground">{notif.message}</p>
                          <span className="text-[10px] text-muted-foreground">{notif.timestamp}</span>
                      </div>
                  ))}
              </div>
          </div>
        </>
      ) : (
        <>
          {/* AI Audit Findings */}
          <div className="bg-card p-6 rounded-3xl border border-border">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6">AI Audit Findings</h3>
              {auditLoading ? (
                <p className="text-[10px] text-muted-foreground animate-pulse">Running audit...</p>
              ) : auditFindings.length > 0 ? (
                <div className="space-y-4">
                  {auditFindings.map((finding, index) => (
                      <div key={index} className="p-4 bg-background rounded-2xl border border-border text-xs text-foreground">
                          {finding}
                      </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No anomalies detected.</p>
              )}
          </div>
          
          {/* Royalty Audit Table */}
          <div className="bg-card p-6 rounded-3xl border border-border">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest">Royalty Ledger</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Processed Payments and Blockchain Transaction Hashes</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportCSV}>Export CSV</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="border-b border-border text-muted-foreground">
                            <th className="p-3">Date</th>
                            <th className="p-3">Collaborator</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">TX Hash</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedAuditData.map(entry => (
                            <motion.tr 
                                key={entry.id} 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="border-b border-border/50"
                            >
                                <td className="p-3">{entry.date}</td>
                                <td className="p-3">{entry.collaborator}</td>
                                <td className="p-3 font-mono">{entry.amount} TON</td>
                                <td className="p-3 font-mono text-muted-foreground">{entry.txHash}</td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center mt-4">
                  <Button variant="ghost" size="sm" onClick={() => setAuditPage(Math.max(1, auditPage - 1))} disabled={auditPage === 1}>Prev</Button>
                  <span className="text-xs text-muted-foreground">Page {auditPage} of {Math.ceil(mockAuditData.length / itemsPerPage)}</span>
                  <Button variant="ghost" size="sm" onClick={() => setAuditPage(Math.min(Math.ceil(mockAuditData.length / itemsPerPage), auditPage + 1))} disabled={auditPage >= Math.ceil(mockAuditData.length / itemsPerPage)}>Next</Button>
              </div>
          </div>
        </>
      )}
    </div>
  );
};
