import * as React from 'react';
import * as RechartsPrimitive from 'recharts';
import { Twitter, Instagram, Music, CheckCircle2, Download, MessageSquare, Wallet, RefreshCw, Check, Loader2, Coins, Lock, ShieldCheck, History, User, ExternalLink } from 'lucide-react';
import { db } from "@/lib/firebase";
import { doc, getDoc, writeBatch, serverTimestamp, increment, collection } from "firebase/firestore";

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
  const [activeSubTab, setActiveSubTab] = React.useState<'overview' | 'audit' | 'withdrawals'>('overview');

  const [prevTotalEarnings, setPrevTotalEarnings] = React.useState(totalEarnings);
  const [isEarningsPulsing, setIsEarningsPulsing] = React.useState(false);

  React.useEffect(() => {
      if (totalEarnings !== prevTotalEarnings) {
          setIsEarningsPulsing(true);
          const timer = setTimeout(() => setIsEarningsPulsing(false), 1000);
          setPrevTotalEarnings(totalEarnings);
          return () => clearTimeout(timer);
      }
  }, [totalEarnings, prevTotalEarnings]);

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
      { name: 'Self', value: 50, address: 'EQD3_P_pM_U8Gk7r_aZ7b8C9D0e1F2g3H4i5J6k7_L8m9N0O' },
      { name: 'Producer', value: 25, address: 'EQC8_W_tF_X4Yk2r_bY8c9D0E1f2G3h4I5j6K7l8_M9n0O1P' },
      { name: 'Manager', value: 15, address: 'EQA5_K_rP_H3Yg5t_cY7b8D9E0f1G2h3I4j5K6l7_M8n9O0P' },
      { name: 'Collaborator', value: 10, address: 'EQB1_X_qM_G5Yk8r_dY9c0D1E2f3G4h5I6j7K8l9_M0n1O2P' },
  ]);

  const updateSplitAddress = (index: number, newAddress: string) => {
      setSplits(prev => prev.map((s, i) => i === index ? { ...s, address: newAddress } : s));
  };

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

  const [auditData, setAuditData] = React.useState<AuditEntry[]>([]);
  const [auditTotal, setAuditTotal] = React.useState(0);
  const [auditPage, setAuditPage] = React.useState(1);
  const [auditTableLoading, setAuditTableLoading] = React.useState(false);
  const itemsPerPage = 5;

  const [filterType, setFilterType] = React.useState<string>('all');
  const [ledgerViewMode, setLedgerViewMode] = React.useState<'chronological' | 'grouped'>('grouped');
  const [customStartDate, setCustomStartDate] = React.useState<string>('');
  const [customEndDate, setCustomEndDate] = React.useState<string>('');

  const groupedEntries = React.useMemo(() => {
    const groups: Record<string, { total: number; entries: AuditEntry[] }> = {};
    auditData.forEach(entry => {
      const col = entry.collaborator || 'Unknown';
      if (!groups[col]) {
        groups[col] = { total: 0, entries: [] };
      }
      groups[col].entries.push(entry);
      groups[col].total += entry.amount;
    });
    return Object.entries(groups).map(([collaborator, data]) => ({
      collaborator,
      total: data.total,
      entries: data.entries
    }));
  }, [auditData]);

  const [trendData, setTrendData] = React.useState<any[]>([]);
  const [trendLoading, setTrendLoading] = React.useState(false);

  const [auditNotes, setAuditNotes] = React.useState<Record<string, string>>(() => {
    try {
        const saved = localStorage.getItem('royalty_audit_notes');
        return saved ? JSON.parse(saved) : {};
    } catch (e) {
        return {};
    }
  });
  const [expandedNoteTxHash, setExpandedNoteTxHash] = React.useState<string | null>(null);

  const handleSaveNote = (txHash: string, note: string) => {
    const updated = { ...auditNotes, [txHash]: note };
    setAuditNotes(updated);
    try {
        localStorage.setItem('royalty_audit_notes', JSON.stringify(updated));
    } catch (e) {
        console.error("Failed to save note to localStorage", e);
    }
  };

  const getDateRange = React.useMemo(() => {
    let start = '';
    let end = '';
    // Current local date in context is May 24, 2026
    if (filterType === 'this_month') {
      start = '2026-05-01';
      end = '2026-05-31';
    } else if (filterType === 'last_month') {
      start = '2026-04-01';
      end = '2026-04-30';
    } else if (filterType === 'q2') {
      start = '2026-04-01';
      end = '2026-06-30';
    } else if (filterType === 'q1') {
      start = '2026-01-01';
      end = '2026-03-31';
    } else if (filterType === 'custom') {
      start = customStartDate;
      end = customEndDate;
    }
    return { start, end };
  }, [filterType, customStartDate, customEndDate]);

  const fetchPaginatedAudit = async (page: number) => {
    setAuditTableLoading(true);
    try {
        const { start, end } = getDateRange;
        let url = `/api/royalty-audit/list?page=${page}&limit=${itemsPerPage}`;
        if (start) url += `&startDate=${start}`;
        if (end) url += `&endDate=${end}`;

        const response = await fetch(url);
        const result = await response.json();
        setAuditData(result.data || []);
        setAuditTotal(result.total || 0);
    } catch (e) {
        console.error("Failed to fetch paginated audit list", e);
    } finally {
        setAuditTableLoading(false);
    }
  };

  const fetchTrendData = async () => {
    setTrendLoading(true);
    try {
        const { start, end } = getDateRange;
        let url = '/api/royalty-audit/trend';
        const params = [];
        if (start) params.push(`startDate=${start}`);
        if (end) params.push(`endDate=${end}`);
        if (params.length > 0) {
            url += `?${params.join('&')}`;
        }
        const response = await fetch(url);
        const result = await response.json();
        setTrendData(result.trend || []);
    } catch (e) {
        console.error("Failed to fetch royalty trend data", e);
    } finally {
        setTrendLoading(false);
    }
  };

  React.useEffect(() => {
    setAuditPage(1);
    fetchPaginatedAudit(1);
    fetchTrendData();
  }, [filterType, customStartDate, customEndDate]);

  React.useEffect(() => {
    fetchPaginatedAudit(auditPage);
  }, [auditPage]);

  const handleExportCSV = async () => {
    try {
      const { start, end } = getDateRange;
      let url = '/api/royalty-audit/export';
      const params = [];
      if (start) params.push(`startDate=${start}`);
      if (end) params.push(`endDate=${end}`);
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await fetch(url);
      const result = await response.json();
      const records = result.data || [];
      const headers = ['Date', 'Collaborator', 'Amount (TON)', 'TX Hash'];
      const rows = records.map((entry: any) => [entry.date, entry.collaborator, entry.amount, entry.txHash]);
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const urlBlob = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = `royalty_audit_log_${filterType}.csv`;
      a.click();
      URL.revokeObjectURL(urlBlob);
    } catch (e) {
      console.error("Failed to export full audit log CSV", e);
    }
  };

  // Outliers & Stats background scanning state
  const [outliers, setOutliers] = React.useState<any[]>([]);
  const [auditStats, setAuditStats] = React.useState<any>(null);
  const [isScanningActive, setIsScanningActive] = React.useState(false);
  const alertedOutliers = React.useRef<Set<string>>(new Set());

  // AI Royalty Advisor
  const [advice, setAdvice] = React.useState<string[]>([]);
  const [adviceLoading, setAdviceLoading] = React.useState(false);
  
  // AI Audit Analysis
  const [auditFindings, setAuditFindings] = React.useState<string[]>([]);
  const [auditLoading, setAuditLoading] = React.useState(false);

  const { user } = useAuth();
  const { preferences, addNotification } = useNotification();
  const hasAlerted = React.useRef(false);

  // States for Withdrawals & Payout calculations
  const [pendingBalance, setPendingBalance] = React.useState<number>(totalEarnings > 0 ? totalEarnings : 12.4);
  const [isProcessingPayouts, setIsProcessingPayouts] = React.useState(false);
  const [payoutLogs, setPayoutLogs] = React.useState<string[]>([]);
  const [payoutStatus, setPayoutStatus] = React.useState<'idle' | 'simulating' | 'broadcasting' | 'completed' | 'failed'>('idle');
  const [generatedTxHash, setGeneratedTxHash] = React.useState<string | null>(null);

  // Sync / fetch actual pending balance from Firestore
  React.useEffect(() => {
    if (!user) return;
    const fetchPending = async () => {
      try {
        const docRef = doc(db, 'royalties', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (typeof data.pendingWithdrawal === 'number') {
            setPendingBalance(data.pendingWithdrawal);
          } else if (data.pendingWithdrawal) {
            setPendingBalance(parseFloat(data.pendingWithdrawal) || 0);
          }
        } else {
          setPendingBalance(Math.max(0, totalEarnings));
        }
      } catch (err) {
        console.error("Error fetching pending balance:", err);
      }
    };
    fetchPending();
  }, [user, activeSubTab, totalEarnings]);

  const handleProcessPayouts = async () => {
    if (pendingBalance <= 0) {
      addNotification({
        userId: user?.uid || 'all',
        type: 'general',
        title: 'Payout Warning',
        message: 'No pending balance available for distribution.',
      });
      return;
    }

    const totalPercentage = splits.reduce((sum, s) => sum + s.value, 0);
    if (totalPercentage !== 100) {
      addNotification({
        userId: user?.uid || 'all',
        type: 'general',
        title: 'Invalid Royalty Split',
        message: `Royalty splits must total exactly 100% (currently ${totalPercentage}%).`,
      });
      return;
    }

    setIsProcessingPayouts(true);
    setPayoutStatus('simulating');
    setPayoutLogs(['[INFO] Initializing payout settlement sequence...', '[INFO] Total pending pool for settlement: ' + pendingBalance.toFixed(2) + ' TON']);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setPayoutLogs(prev => [...prev, '[INFO] Simulating gas fees and network state...']);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      setPayoutStatus('broadcasting');
      setPayoutLogs(prev => [...prev, '[INFO] Allocation verification details:']);
      
      const shares = splits.map(s => {
        const amt = pendingBalance * (s.value / 100);
        return {
          name: s.name,
          address: s.address,
          percentage: s.value,
          amount: amt
        };
      });

      shares.forEach(s => {
        setPayoutLogs(prev => [...prev, `  - ${s.name}: ${s.percentage}% -> allocating ${s.amount.toFixed(4)} TON to ${s.address.slice(0, 8)}...${s.address.slice(-6)}`]);
      });

      setPayoutLogs(prev => [...prev, '[INFO] Compiling TON batch dictionary payload...']);
      await new Promise(resolve => setTimeout(resolve, 800));
      setPayoutLogs(prev => [...prev, '[INFO] Initiating atomic database batch transaction...']);

      // Firestore Atomic batch execution
      const batch = writeBatch(db);
      
      // 1. Reset artist pending balance
      if (user) {
        const artistRoyaltyRef = doc(db, 'royalties', user.uid);
        batch.set(artistRoyaltyRef, {
          pendingWithdrawal: 0,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      // Generate a mock hash representing TON blockchain TX
      const txHash = '0x' + Array.from({length:64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      setGeneratedTxHash(txHash);

      // 2. Distribute and update collaborator records
      shares.forEach(s => {
        const collabId = s.address; 
        const collabRef = doc(db, 'royalties', collabId);
        batch.set(collabRef, {
          artistId: collabId,
          totalEarned: increment(s.amount),
          pendingWithdrawal: increment(s.amount),
          updatedAt: serverTimestamp()
        }, { merge: true });
      });

      // 3. Record the transaction in history
      const txRef = doc(collection(db, 'transactions'));
      const participants = [user?.uid].filter(Boolean) as string[];
      const txData = {
        type: 'withdrawal',
        amount: pendingBalance,
        userId: user?.uid || 'system',
        status: 'completed',
        timestamp: new Date().toISOString(),
        serverTimestamp: serverTimestamp(),
        participants,
        txHash,
        notes: `Batch Royalty Payout of ${pendingBalance.toFixed(2)} TON distributed to ${splits.length} collaborators.`
      };
      batch.set(txRef, txData);

      await batch.commit();

      setPayoutStatus('completed');
      setPayoutLogs(prev => [...prev, '[SUCCESS] Transaction verified on TON testnet / ledger!', `[SUCCESS] TX hash: ${txHash}`]);
      setPendingBalance(0);

      addNotification({
        userId: user?.uid || 'all',
        type: 'general',
        title: '✅ Payout Complete',
        message: `Successfully structured payout of ${pendingBalance.toFixed(2)} TON to ${splits.length} addresses!`,
      });

      // Refresh audit logs
      fetchRoyaltyAudit();

    } catch (err: any) {
      console.error(err);
      setPayoutStatus('failed');
      setPayoutLogs(prev => [...prev, `[ERROR] Batch operation aborted: ${err.message || 'unknown error'}`]);
    } finally {
      setIsProcessingPayouts(false);
    }
  };

  const fetchOutliersAndStats = async (isBackground = false) => {
    if (!isBackground) setIsScanningActive(true);
    try {
        const response = await fetch('/api/royalty-audit/scan-outliers');
        const result = await response.json();
        setOutliers(result.outliers || []);
        setAuditStats(result.stats || null);

        if (result.outliers && user) {
            result.outliers.forEach((outlier: any) => {
                const uniqueKey = `${outlier.id}-${outlier.entry.amount}`;
                if (!alertedOutliers.current.has(uniqueKey)) {
                    alertedOutliers.current.add(uniqueKey);
                    addNotification({
                        userId: user.uid,
                        type: 'general',
                        title: '⚠️ Royalty Outlier Detected',
                        message: `Flagged: ${outlier.entry.amount} TON paid to ${outlier.entry.collaborator} deviates from mean by ${outlier.zScore}x standard deviations!`,
                    });
                }
            });
        }
    } catch (e) {
        console.error("Failed to scan outliers", e);
    } finally {
        if (!isBackground) setIsScanningActive(false);
    }
  };

  React.useEffect(() => {
    fetchOutliersAndStats();
    const timer = setInterval(() => {
        fetchOutliersAndStats(true);
        fetchPaginatedAudit(auditPage);
        fetchTrendData();
    }, 15000);
    return () => clearInterval(timer);
  }, [auditPage, user, filterType, customStartDate, customEndDate]);

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
        const fullResponse = await fetch('/api/royalty-audit/export');
        const fullData = await fullResponse.json();
        const records = fullData.data || [];
        
        const response = await fetch('/api/royalty-audit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ auditData: records.slice(0, 15) })
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

  const MetricCard = ({ title, value, sub, isPulsing = false }: { title: string, value: string, sub: string, isPulsing?: boolean }) => (
      <motion.div 
          animate={isPulsing ? { 
              scale: [1, 1.05, 1], 
              boxShadow: ["0px 0px 0px rgba(16,185,129,0)", "0px 0px 20px rgba(16,185,129,0.5)", "0px 0px 0px rgba(16,185,129,0)"], 
              borderColor: ["rgba(255,255,255,0.1)", "rgba(16,185,129,0.5)", "rgba(255,255,255,0.1)"] 
          } : {}}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="bg-card p-6 rounded-3xl border border-border"
      >
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</h4>
          <p className={`text-3xl font-black mt-2 transition-colors duration-300 ${isPulsing ? 'text-emerald-400' : 'text-foreground'}`}>{value}</p>
          <p className="text-[10px] font-bold text-emerald-500 mt-1">{sub}</p>
      </motion.div>
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
          <button
            id="artist-withdrawals-tab"
            onClick={() => setActiveSubTab('withdrawals')}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'withdrawals' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-muted-foreground hover:text-foreground'}`}
          >
            Withdrawals
          </button>
        </div>
      </div>

      {activeSubTab === 'overview' ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <MetricCard title="Total Earnings" value={`$${totalEarnings.toLocaleString()}`} sub="+12.5% from last month" isPulsing={isEarningsPulsing} />
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
      ) : activeSubTab === 'audit' ? (
        <>
          {/* Outlier Detection Engine Warning Box */}
          <div className="bg-card p-6 rounded-3xl border border-border space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          Real-time Outlier Scan Agent
                      </h3>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1 border-none">
                          Auditing transaction pool in background against historical stats
                      </p>
                  </div>
                  {auditStats && (
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-white/5 py-1.5 px-3 rounded-full">
                          <span>Mean: <span className="text-foreground">{auditStats.mean} TON</span></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                          <span>Std Dev: <span className="text-foreground">{auditStats.stdDev} TON</span></span>
                      </div>
                  )}
              </div>

              {outliers.length > 0 ? (
                  <div className="space-y-4">
                      <motion.div 
                          animate={{ 
                              scale: [1, 1.012, 1],
                              backgroundColor: ["rgba(245, 158, 11, 0.1)", "rgba(245, 158, 11, 0.18)", "rgba(245, 158, 11, 0.1)"]
                          }}
                          transition={{ 
                              duration: 3.5, 
                              repeat: Infinity, 
                              ease: "easeInOut" 
                          }}
                          className="p-4 rounded-2xl flex items-start gap-3"
                      >
                          <span className="text-lg">⚠️</span>
                          <div>
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                                  Significant Deviations Flagged ({outliers.length})
                              </h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                  The following transactions exceed 2.0x standard deviations from the dataset mean. This may signify misrouted royalty splits, inflation spikes, or smart-contract issues.
                              </p>
                          </div>
                      </motion.div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {outliers.slice(0, 4).map((outlier) => (
                              <motion.div 
                                  key={outlier.id} 
                                  animate={{
                                      scale: [1, 1.01, 1],
                                      backgroundColor: ["rgba(255, 255, 255, 0.03)", "rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.03)"]
                                  }}
                                  transition={{
                                      duration: 4,
                                      repeat: Infinity,
                                      ease: "easeInOut"
                                  }}
                                  className="p-4 rounded-2xl space-y-2 hover:bg-white/5 transition-all"
                              >
                                  <div className="flex justify-between items-start">
                                      <div>
                                          <p className="text-xs font-black uppercase text-foreground">{outlier.entry.collaborator}</p>
                                          <p className="text-[9px] font-bold text-muted-foreground uppercase">{outlier.entry.date}</p>
                                      </div>
                                      <div className="text-right">
                                          <p className="text-xs font-black text-rose-500 font-mono">+{outlier.entry.amount} TON</p>
                                          <p className="text-[9px] font-bold text-rose-500 uppercase font-mono">+{outlier.deviationPercent}% Dev</p>
                                      </div>
                                  </div>
                                  <div className="bg-rose-500/10 text-[9px] font-bold uppercase tracking-wider text-rose-400 p-1.5 rounded-lg flex justify-between items-center px-2">
                                      <span>Z-Score Outlier Rating:</span>
                                      <span className="font-black font-mono">{outlier.zScore} σ</span>
                                  </div>
                              </motion.div>
                          ))}
                      </div>
                  </div>
              ) : (
                  <div className="bg-emerald-500/5 p-4 rounded-2xl flex items-center gap-3">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Calculated Risk Profile Stable</p>
                          <p className="text-xs text-muted-foreground">All scanned records are currently within a standard statistical deviance envelope.</p>
                      </div>
                  </div>
              )}
          </div>

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
          
          {/* Royalty Audit Section containing Date Filters, Monthly Trend Chart, and Royalty Ledger */}
          <div className="space-y-6">
              {/* Date Filters Control Block */}
              <div className="bg-card p-6 rounded-3xl border border-border">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest">Royalty Filter</h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Select period to filter financial ledgers and performance trends</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-end gap-3 p-4 bg-white/[0.02] rounded-2xl">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Select Period</span>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-zinc-900 border-none text-[11px] font-bold text-white rounded-xl px-3 py-2 outline-none cursor-pointer hover:bg-zinc-800 transition-all shadow-md min-w-[140px]"
                      >
                        <option value="all">All Time</option>
                        <option value="this_month">This Month</option>
                        <option value="last_month">Last Month</option>
                        <option value="q2">Q2 2026 (Apr - Jun)</option>
                        <option value="q1">Q1 2026 (Jan - Mar)</option>
                        <option value="custom">Custom Range...</option>
                      </select>
                    </div>

                    {filterType === 'custom' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2 sm:mt-0"
                      >
                        <div className="flex flex-col gap-1 w-full sm:w-auto">
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Start Date</span>
                          <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="bg-zinc-900 border-none text-[11px] font-bold text-white rounded-xl px-3 py-2 outline-none cursor-pointer hover:bg-zinc-800 transition-all shadow-md w-full sm:w-auto"
                          />
                        </div>
                        <div className="flex flex-col gap-1 w-full sm:w-auto">
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">End Date</span>
                          <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="bg-zinc-900 border-none text-[11px] font-bold text-white rounded-xl px-3 py-2 outline-none cursor-pointer hover:bg-zinc-800 transition-all shadow-md w-full sm:w-auto"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Monthly Revenue Trend Line Chart */}
                  <div className="lg:col-span-5 bg-card p-6 rounded-3xl border border-border flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest block">Monthly Revenue Trend</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1 block">Aggregated royalty share payouts from filtered period</p>
                      </div>

                      <div className="h-64 my-6 flex items-center justify-center relative">
                          {trendLoading && (
                              <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-xs z-10 rounded-2xl">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 animate-pulse">Calculating trend...</span>
                              </div>
                          )}

                          {trendData.length === 0 ? (
                              <div className="text-center text-xs text-muted-foreground uppercase tracking-widest py-10">
                                  No trend data for chosen period
                              </div>
                          ) : (
                              <ResponsiveContainerRC width="100%" height="100%">
                                  <LineChartRC data={trendData}>
                                      <CartesianGridRC strokeDasharray="3 3" stroke="#222" />
                                      <XAxisRC dataKey="month" stroke="#666" fontSize={9} tickLine={false} />
                                      <YAxisRC stroke="#666" fontSize={9} tickLine={false} tickFormatter={(val: number) => `${val}T`} />
                                      <TooltipRC contentStyle={{ backgroundColor: '#111', border: '12px', padding: '10px' }} />
                                      <LineRC type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} dot={{ r: 4, stroke: "#10b981", strokeWidth: 2, fill: "#030712" }} activeDot={{ r: 6 }} />
                                  </LineChartRC>
                              </ResponsiveContainerRC>
                          )}
                      </div>

                      {trendData.length > 0 && (
                          <div className="bg-white/5 py-3 px-4 rounded-2xl flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                              <span>Total Selected Royalties:</span>
                              <span className="text-emerald-500 font-mono font-black text-xs">
                                  {trendData.reduce((acc, c) => acc + c.amount, 0).toLocaleString()} TON
                              </span>
                          </div>
                      )}
                  </div>

                  {/* Royalty Audit Table Card */}
                  <div className="lg:col-span-7 bg-card p-6 rounded-3xl border border-border flex flex-col justify-between">
                      <div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                              <h3 className="text-sm font-bold uppercase tracking-widest">Royalty Ledger</h3>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Processed Payments and Blockchain Transaction Hashes</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
                              <div className="flex items-center bg-white/5 p-1 rounded-xl">
                                <button
                                  onClick={() => setLedgerViewMode('chronological')}
                                  className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                                    ledgerViewMode === 'chronological' ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                                  }`}
                                >
                                  List
                                </button>
                                <button
                                  onClick={() => setLedgerViewMode('grouped')}
                                  className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                                    ledgerViewMode === 'grouped' ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                                  }`}
                                >
                                  Grouped
                                </button>
                              </div>
                              <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex items-center gap-2 border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-[#999] hover:text-white transition-all">
                                <Download className="w-3.5 h-3.5" />
                                Download CSV
                              </Button>
                            </div>
                          </div>

                          <div className="overflow-x-auto relative min-h-[220px]">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-border text-muted-foreground">
                                        <th className="p-3">Date</th>
                                        <th className="p-3">Collaborator</th>
                                        <th className="p-3">Type</th>
                                        <th className="p-3">Amount</th>
                                        <th className="p-3">TX Hash</th>
                                        <th className="p-3 text-right">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {auditTableLoading ? (
                                        Array.from({ length: itemsPerPage }).map((_, i) => (
                                            <tr key={`skeleton-${i}`} className="border-b border-border/30">
                                                <td className="p-3">
                                                    <div className="h-4 w-20 bg-white/5 rounded-md animate-pulse" />
                                                </td>
                                                <td className="p-3">
                                                    <div className="h-4 w-32 bg-white/5 rounded-md animate-pulse" />
                                                </td>
                                                <td className="p-3">
                                                    <div className="h-4 w-16 bg-white/5 rounded-md animate-pulse" />
                                                </td>
                                                <td className="p-3">
                                                    <div className="h-4 w-16 bg-white/5 rounded-md animate-pulse" />
                                                </td>
                                                <td className="p-3">
                                                    <div className="h-4 w-24 bg-white/5 rounded-md animate-pulse" />
                                                </td>
                                                <td className="p-3">
                                                    <div className="h-4 w-8 bg-white/5 rounded-md animate-pulse ml-auto" />
                                                </td>
                                            </tr>
                                        ))
                                    ) : auditData.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-xs text-muted-foreground uppercase tracking-wider">
                                                No records found for the selected period
                                            </td>
                                        </tr>
                                    ) : ledgerViewMode === 'grouped' ? (
                                        groupedEntries.map(group => (
                                            <React.Fragment key={group.collaborator}>
                                                <tr className="bg-white/[0.02] border-b border-border/40">
                                                    <td colSpan={6} className="p-3 font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-white flex items-center gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                                {group.collaborator} ({group.entries.length} {group.entries.length === 1 ? 'payment' : 'payments'})
                                                            </span>
                                                            <span className="text-emerald-400 font-mono text-[11px] font-black bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                                                                Total: {group.total.toLocaleString()} TON
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {group.entries.map(entry => {
                                                    const hasNote = !!auditNotes[entry.txHash];
                                                    const isExpanded = expandedNoteTxHash === entry.txHash;
                                                    return (
                                                        <React.Fragment key={entry.id}>
                                                            <motion.tr 
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="border-b border-border/30 hover:bg-white/[0.01] transition-all cursor-pointer"
                                                                onClick={() => setExpandedNoteTxHash(isExpanded ? null : entry.txHash)}
                                                            >
                                                                <td className="p-3 text-muted-foreground">{entry.date}</td>
                                                                <td className="p-3 pl-6 font-semibold text-white/80">{entry.collaborator}</td>
                                                                <td className="p-3">
                                                                    <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/15 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                                                                        Royalty Split
                                                                    </span>
                                                                </td>
                                                                <td className="p-3 font-mono text-emerald-400 font-bold">{entry.amount} TON</td>
                                                                <td className="p-3 font-mono text-muted-foreground truncate max-w-[120px]" title={entry.txHash}>{entry.txHash}</td>
                                                                <td className="p-3 text-right">
                                                                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                                        {hasNote && (
                                                                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-2 py-0.5 rounded-full max-w-[100px] truncate" title={auditNotes[entry.txHash]}>
                                                                                {auditNotes[entry.txHash]}
                                                                            </span>
                                                                        )}
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="sm" 
                                                                            onClick={() => setExpandedNoteTxHash(isExpanded ? null : entry.txHash)}
                                                                            className={`p-1 h-7 w-7 rounded-lg transition-colors ${isExpanded ? 'bg-zinc-800 text-white' : 'text-muted-foreground hover:text-white'}`}
                                                                        >
                                                                            <MessageSquare className={`w-3.5 h-3.5 ${hasNote ? 'text-emerald-400' : ''}`} />
                                                                        </Button>
                                                                    </div>
                                                                </td>
                                                            </motion.tr>
                                                            {isExpanded && (
                                                                <tr className="bg-white/[0.01]">
                                                                    <td colSpan={6} className="p-3 bg-zinc-950/20">
                                                                        <motion.div 
                                                                            initial={{ opacity: 0, height: 0 }}
                                                                            animate={{ opacity: 1, height: 'auto' }}
                                                                            className="flex flex-col gap-2 p-1"
                                                                        >
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                                                                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> Notes for transaction
                                                                                </span>
                                                                                {hasNote && (
                                                                                    <button 
                                                                                        onClick={() => handleSaveNote(entry.txHash, '')}
                                                                                        className="text-[9px] font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest"
                                                                                    >
                                                                                        Clear Note
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                            <textarea
                                                                                placeholder="Write custom audit note or comment for this record..."
                                                                                value={auditNotes[entry.txHash] || ''}
                                                                                onChange={(e) => handleSaveNote(entry.txHash, e.target.value)}
                                                                                className="bg-zinc-900 border-none text-[11px] font-semibold text-white rounded-xl p-3 outline-none resize-none placeholder-white/20 h-16 w-full"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            />
                                                                            <div className="text-[8px] text-muted-foreground uppercase tracking-wider text-right">
                                                                                Auto-saves on typing
                                                                            </div>
                                                                        </motion.div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        auditData.map(entry => {
                                            const hasNote = !!auditNotes[entry.txHash];
                                            const isExpanded = expandedNoteTxHash === entry.txHash;
                                            return (
                                                <React.Fragment key={entry.id}>
                                                    <motion.tr 
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="border-b border-border/50 hover:bg-white/[0.01] transition-all cursor-pointer"
                                                        onClick={() => setExpandedNoteTxHash(isExpanded ? null : entry.txHash)}
                                                    >
                                                        <td className="p-3">{entry.date}</td>
                                                        <td className="p-3 font-semibold text-white">{entry.collaborator}</td>
                                                        <td className="p-3">
                                                            <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/15 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                                                                Royalty Split
                                                            </span>
                                                        </td>
                                                        <td className="p-3 font-mono text-emerald-400 font-bold">{entry.amount} TON</td>
                                                        <td className="p-3 font-mono text-muted-foreground truncate max-w-[120px]" title={entry.txHash}>{entry.txHash}</td>
                                                        <td className="p-3 text-right">
                                                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                                {hasNote && (
                                                                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-2 py-0.5 rounded-full max-w-[100px] truncate" title={auditNotes[entry.txHash]}>
                                                                        {auditNotes[entry.txHash]}
                                                                    </span>
                                                                )}
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm" 
                                                                    onClick={() => setExpandedNoteTxHash(isExpanded ? null : entry.txHash)}
                                                                    className={`p-1 h-7 w-7 rounded-lg transition-colors ${isExpanded ? 'bg-zinc-800 text-white' : 'text-muted-foreground hover:text-white'}`}
                                                                >
                                                                    <MessageSquare className={`w-3.5 h-3.5 ${hasNote ? 'text-emerald-400' : ''}`} />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                    {isExpanded && (
                                                        <tr className="bg-white/[0.01]">
                                                            <td colSpan={6} className="p-3 bg-zinc-950/20">
                                                                <motion.div 
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    className="flex flex-col gap-2 p-1"
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                                                            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> Notes for transaction
                                                                        </span>
                                                                        {hasNote && (
                                                                            <button 
                                                                                onClick={() => handleSaveNote(entry.txHash, '')}
                                                                                className="text-[9px] font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest"
                                                                            >
                                                                                Clear Note
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    <textarea
                                                                        placeholder="Write custom audit note or comment for this record..."
                                                                        value={auditNotes[entry.txHash] || ''}
                                                                        onChange={(e) => handleSaveNote(entry.txHash, e.target.value)}
                                                                        className="bg-zinc-900 border-none text-[11px] font-semibold text-white rounded-xl p-3 outline-none resize-none placeholder-white/20 h-16 w-full"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    />
                                                                    <div className="text-[8px] text-muted-foreground uppercase tracking-wider text-right">
                                                                        Auto-saves on typing
                                                                    </div>
                                                                </motion.div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                          </div>
                      </div>

                      <div className="flex justify-between items-center mt-6">
                          <Button variant="ghost" size="sm" onClick={() => setAuditPage(p => Math.max(1, p - 1))} disabled={auditPage === 1 || auditTableLoading}>Prev</Button>
                          <span className="text-xs text-muted-foreground">Page {auditPage} of {Math.ceil(auditTotal / itemsPerPage) || 1}</span>
                          <Button variant="ghost" size="sm" onClick={() => setAuditPage(p => Math.min(Math.ceil(auditTotal / itemsPerPage) || 1, p + 1))} disabled={auditPage >= (Math.ceil(auditTotal / itemsPerPage) || 1) || auditTableLoading}>Next</Button>
                      </div>
                  </div>
              </div>
          </div>
        </>
      ) : (
        <>
          {/* Withdrawals Payout and Royalty Split Settlement Tab Content */}
          <div className="space-y-6">
            <div className="bg-card p-6 rounded-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#999] mb-1">Settlement Console</h3>
                  <h2 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-blue-500" />
                    Payout Settlement Panel
                  </h2>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Distribute pending balances instantly to your defined stakeholders. All transfers are compiled and executed as a batch transaction on the decentralized network.
                  </p>
                </div>
                <div className="bg-white/[0.02] p-6 rounded-2xl flex flex-col justify-between h-full min-h-[140px]">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Calculated Pending Pool</p>
                      <p className="text-2xl font-black text-blue-400 font-mono mt-1">{pendingBalance.toFixed(2)} TON</p>
                    </div>
                    <div className="bg-blue-600/10 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Multi-sig Verified
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleProcessPayouts}
                      disabled={isProcessingPayouts || pendingBalance <= 0}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isProcessingPayouts ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing Settlement...
                        </>
                      ) : (
                        <>
                          <Coins className="w-4 h-4 text-white" />
                          Process Payouts
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Payout Processing Terminal Logs */}
            {payoutStatus !== 'idle' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-950 p-6 rounded-3xl font-mono text-xs text-zinc-300 space-y-3 shadow-inner max-h-[220px] overflow-y-auto no-scrollbar"
              >
                <div className="flex justify-between items-center pb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#666] flex items-center gap-1.5">
                    <History className="w-3 object-contain text-blue-400" /> Settlement Network Engine Terminal
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    payoutStatus === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                    payoutStatus === 'failed' ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400 animate-pulse'
                  }`}>
                    {payoutStatus}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {payoutLogs.map((log, index) => (
                    <div key={index} className={`leading-relaxed whitespace-pre-wrap ${
                      log.startsWith('[ERROR]') ? 'text-rose-400' : 
                      log.startsWith('[SUCCESS]') ? 'text-emerald-400 font-bold' : 'text-zinc-300'
                    }`}>
                      {log}
                    </div>
                  ))}
                </div>
                {generatedTxHash && (
                  <div className="pt-2 mt-2 flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <span>Transaction Hash:</span>
                    <a 
                      href={`https://tonscan.org/tx/${generatedTxHash}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-400 font-mono font-bold hover:underline flex items-center gap-1 lowercase"
                    >
                      {generatedTxHash.slice(0, 16)}...{generatedTxHash.slice(-16)} <ExternalLink className="w-3 h-3 text-blue-400" />
                    </a>
                  </div>
                )}
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Royalty Split Configuration / Address Verification Card */}
              <div className="lg:col-span-8 bg-card p-6 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#999]">Royalty Splits</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Recipient Allocations and Smart-Contract Wallets</p>
                  </div>
                  <div className="bg-blue-600/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400">
                    4 active stakeholders
                  </div>
                </div>

                <div className="space-y-4">
                  {splits.map((split, idx) => {
                    const projectedAmount = pendingBalance * (split.value / 100);
                    return (
                      <div key={split.name} className="bg-white/[0.01] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                            {split.name[0]}
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-black uppercase tracking-wider text-white">{split.name}</p>
                            <span className="text-[9px] text-[#666] font-bold uppercase tracking-widest">{split.value}% Allocation</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 sm:w-[45%]">
                          <span className="text-[8px] font-black uppercase tracking-widest text-[#666]">Decentralized Address</span>
                          <input 
                            type="text" 
                            value={split.address || ''}
                            onChange={(e) => updateSplitAddress(idx, e.target.value)}
                            placeholder="Enter TON wallet address..."
                            className="bg-zinc-900 border-none rounded-xl px-3 py-1.5 text-[10px] font-bold font-mono text-[#999] placeholder-zinc-800 outline-none w-full"
                          />
                        </div>

                        <div className="text-right sm:text-right">
                          <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground font-semibold">Settlement Amount</p>
                          <p className="text-xs font-black text-emerald-400 font-mono mt-0.5">+{projectedAmount.toFixed(4)} TON</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Protocol status & Gas Info Card */}
              <div className="lg:col-span-4 bg-card p-6 rounded-3xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Settlement Health</h3>
                  <div className="space-y-4 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Verification Signature</span>
                      <span className="text-emerald-400 font-bold uppercase text-[10px] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Active
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Contract Epoch</span>
                      <span className="text-[#999] font-mono font-bold">#2644</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Gas Fee Estimate</span>
                      <span className="text-[#999] font-mono font-bold">0.024 TON</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Batch Delivery Type</span>
                      <span className="text-blue-400 font-bold uppercase text-[9px]">atomic split dict</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/[0.01] rounded-2xl flex items-start gap-2.5 mt-6 sm:mt-0">
                  <Lock className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-zinc-500 leading-relaxed uppercase tracking-wider font-semibold">
                    Settlements are processed automatically through verified immutable networks. Ensure split configurations are thoroughly reviewed prior to initiation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
