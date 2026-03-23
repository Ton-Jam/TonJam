import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  TrendingUp, 
  Activity, 
  Coins, 
  ArrowLeft, 
  ExternalLink, 
  Search,
  Filter
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { TON_LOGO } from '@/constants';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { transactions } = useAudio();

  const platformStats = useMemo(() => {
    const totalVolume = transactions.reduce((acc, tx) => acc + parseFloat(tx.amount), 0);
    const totalFees = transactions.reduce((acc, tx) => acc + parseFloat(tx.platformFee), 0);
    const streamCount = transactions.filter(tx => tx.type === 'stream').length;
    const saleCount = transactions.filter(tx => tx.type === 'nft_sale').length;

    return {
      totalVolume: totalVolume.toFixed(4),
      totalFees: totalFees.toFixed(4),
      streamCount,
      saleCount
    };
  }, [transactions]);

  return (
    <div className="min-h-screen bg-background pb-4 pt-4 px-4 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto">
        <header className="mb-4">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-[0.5em]">Platform Governance</span>
              </div>
              <h1 className="text-[32px] font-bold text-foreground tracking-tighter uppercase flex items-center gap-4">
                Admin Console <Shield className="h-8 w-8 text-muted-foreground/30" />
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="glass px-4 py-4 rounded-[10px] flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Platform Balance</p>
                  <p className="text-lg font-bold text-foreground tracking-tighter">{platformStats.totalFees} TON</p>
                </div>
                <img src={TON_LOGO} className="w-6 h-6" alt="" />
              </div>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            { label: 'Total Volume', value: `${platformStats.totalVolume} TON`, icon: <TrendingUp className="h-4 w-4" />, color: 'blue' },
            { label: 'Revenue (Fees)', value: `${platformStats.totalFees} TON`, icon: <Coins className="h-4 w-4" />, color: 'green' },
            { label: 'Total Streams', value: platformStats.streamCount.toLocaleString(), icon: <Activity className="h-4 w-4" />, color: 'purple' },
            { label: 'NFT Transactions', value: platformStats.saleCount.toLocaleString(), icon: <Shield className="h-4 w-4" />, color: 'amber' },
          ].map((stat, i) => (
            <div key={i} className="glass border border-border/50 bg-foreground/[0.02] rounded-[10px] p-4">
              <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center mb-4 bg-${stat.color}-500/10 text-${stat.color}-500`}>
                {stat.icon}
              </div>
              <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-4">{stat.label}</p>
              <h3 className="text-xl font-bold text-foreground tracking-tighter">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Transaction Master Ledger */}
        <div className="glass border border-border/50 bg-foreground/[0.02] rounded-[10px] p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Global Transaction Ledger</h3>
              <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em] mt-4">Real-time auditable blockchain events</p>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50" />
                <input type="text" placeholder="Search Hash/Address..." className="w-full bg-muted/50 border border-border rounded-[5px] py-4 pl-4 pr-4 text-[10px] outline-none text-foreground placeholder:text-muted-foreground/50 dark:placeholder:text-neutral-500" />
              </div>
              <button className="p-4 bg-muted/50 rounded-[5px] text-muted-foreground hover:text-foreground transition-all">
                <Filter className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="pb-4 text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Timestamp</th>
                  <th className="pb-4 text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Type</th>
                  <th className="pb-4 text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Asset</th>
                  <th className="pb-4 text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Total Amount</th>
                  <th className="pb-4 text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Platform Fee</th>
                  <th className="pb-4 text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Artist Share</th>
                  <th className="pb-4 text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Recipient</th>
                  <th className="pb-4 text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest text-right">Explorer</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-border/50 hover:bg-foreground/[0.01] transition-colors group">
                      <td className="py-4 text-[9px] text-muted-foreground font-mono">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-4">
                        <span className={`text-[7px] font-bold uppercase px-4 py-4 rounded-[4px] ${tx.type === 'stream' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                          {tx.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4">
                        <p className="text-[9px] font-bold text-foreground uppercase truncate max-w-[100px]">{tx.trackTitle || 'Unknown'}</p>
                      </td>
                      <td className="py-4 text-[9px] font-mono text-foreground">{tx.amount} TON</td>
                      <td className="py-4 text-[9px] font-mono text-amber-500">+{tx.platformFee}</td>
                      <td className="py-4 text-[9px] font-mono text-green-400">+{tx.artistShare}</td>
                      <td className="py-4">
                        <p className="text-[7px] font-mono text-muted-foreground">{tx.recipientAddress.slice(0, 6)}...{tx.recipientAddress.slice(-4)}</p>
                      </td>
                      <td className="py-4 text-right">
                        <button className="p-4 bg-muted/50 rounded-[4px] text-muted-foreground/50 hover:text-blue-400 transition-all">
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-4 text-center">
                      <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.5em]">Zero activity detected in the current epoch.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
