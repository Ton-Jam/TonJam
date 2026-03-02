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
    <div className="min-h-screen bg-black pb-32 pt-24 px-6 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-white/30 hover:text-blue-400 mb-6 transition-all group" >
            <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> BACK
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-[0.5em]">Platform Governance</span>
              </div>
              <h1 className="text-4xl font-bold text-white tracking-tighter uppercase flex items-center gap-4">
                Admin Console <Shield className="h-8 w-8 text-white/10" />
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="glass px-6 py-3 rounded-[10px] flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Platform Balance</p>
                  <p className="text-xl font-bold text-white tracking-tighter">{platformStats.totalFees} TON</p>
                </div>
                <img src={TON_LOGO} className="w-8 h-8" alt="" />
              </div>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Volume', value: `${platformStats.totalVolume} TON`, icon: <TrendingUp className="h-5 w-5" />, color: 'blue' },
            { label: 'Revenue (Fees)', value: `${platformStats.totalFees} TON`, icon: <Coins className="h-5 w-5" />, color: 'green' },
            { label: 'Total Streams', value: platformStats.streamCount.toLocaleString(), icon: <Activity className="h-5 w-5" />, color: 'purple' },
            { label: 'NFT Transactions', value: platformStats.saleCount.toLocaleString(), icon: <Shield className="h-5 w-5" />, color: 'amber' },
          ].map((stat, i) => (
            <div key={i} className="glass border border-white/5 bg-white/[0.02] rounded-[10px] p-6">
              <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center mb-4 bg-${stat.color}-500/10 text-${stat.color}-500`}>
                {stat.icon}
              </div>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white tracking-tighter">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Transaction Master Ledger */}
        <div className="glass border border-white/5 bg-white/[0.02] rounded-[10px] p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Global Transaction Ledger</h3>
              <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.4em] mt-1">Real-time auditable blockchain events</p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-white/20" />
                <input type="text" placeholder="Search Hash/Address..." className="w-full bg-white/5 border border-white/10 rounded-[5px] py-2 pl-9 pr-4 text-[10px] outline-none text-white placeholder:text-white/10" />
              </div>
              <button className="p-2 bg-white/5 rounded-[5px] text-white/40 hover:text-white transition-all">
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-4 text-[9px] font-bold text-white/20 uppercase tracking-widest">Timestamp</th>
                  <th className="pb-4 text-[9px] font-bold text-white/20 uppercase tracking-widest">Type</th>
                  <th className="pb-4 text-[9px] font-bold text-white/20 uppercase tracking-widest">Asset</th>
                  <th className="pb-4 text-[9px] font-bold text-white/20 uppercase tracking-widest">Total Amount</th>
                  <th className="pb-4 text-[9px] font-bold text-white/20 uppercase tracking-widest">Platform Fee</th>
                  <th className="pb-4 text-[9px] font-bold text-white/20 uppercase tracking-widest">Artist Share</th>
                  <th className="pb-4 text-[9px] font-bold text-white/20 uppercase tracking-widest">Recipient</th>
                  <th className="pb-4 text-[9px] font-bold text-white/20 uppercase tracking-widest text-right">Explorer</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                      <td className="py-4 text-[10px] text-white/40 font-mono">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-4">
                        <span className={`text-[8px] font-bold uppercase px-2 py-1 rounded-[5px] ${tx.type === 'stream' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                          {tx.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4">
                        <p className="text-[10px] font-bold text-white uppercase truncate max-w-[120px]">{tx.trackTitle || 'Unknown'}</p>
                      </td>
                      <td className="py-4 text-[10px] font-mono text-white">{tx.amount} TON</td>
                      <td className="py-4 text-[10px] font-mono text-amber-500">+{tx.platformFee}</td>
                      <td className="py-4 text-[10px] font-mono text-green-400">+{tx.artistShare}</td>
                      <td className="py-4">
                        <p className="text-[8px] font-mono text-white/40">{tx.recipientAddress.slice(0, 8)}...{tx.recipientAddress.slice(-4)}</p>
                      </td>
                      <td className="py-4 text-right">
                        <button className="p-2 bg-white/5 rounded-[5px] text-white/20 hover:text-blue-400 transition-all">
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-32 text-center">
                      <p className="text-[10px] font-bold text-white/10 uppercase tracking-[0.5em]">Zero activity detected in the current epoch.</p>
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
