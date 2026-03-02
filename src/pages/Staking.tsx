import React, { useState, useMemo } from 'react';
import { Lock, Unlock, Zap, TrendingUp, Coins, Info, ArrowUpRight, History, Sparkles, Filter, ArrowDownUp } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { useTonAddress } from '@tonconnect/ui-react';
import { JAM_PRICE_USD } from '@/constants';

const Staking: React.FC = () => {
  const { userProfile, stakeJam, unstakeJam, claimJamRewards, transactions } = useAudio();
  const userAddress = useTonAddress();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const staked = parseFloat(userProfile.stakedJam || '0');
  const pending = parseFloat(userProfile.pendingJamRewards || '0');
  const balance = parseFloat(userProfile.jamBalance || '0');

  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter(tx => ['stake', 'unstake', 'claim_rewards'].includes(tx.type));
    
    if (filterType !== 'all') {
      filtered = filtered.filter(tx => tx.type === filterType);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [transactions, filterType, sortOrder]);

  const handleStake = async () => {
    if (!stakeAmount || isNaN(parseFloat(stakeAmount))) return;
    setIsProcessing(true);
    try {
      await stakeJam(stakeAmount);
      setStakeAmount('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || isNaN(parseFloat(unstakeAmount))) return;
    setIsProcessing(true);
    try {
      await unstakeJam(unstakeAmount);
      setUnstakeAmount('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClaim = async () => {
    setIsProcessing(true);
    try {
      await claimJamRewards();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-12 animate-in fade-in duration-700 pb-32 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.5em]">DeFi Protocol</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
            JAM <span className="text-blue-500">Staking</span>
          </h1>
          <p className="text-sm font-bold text-white/20 uppercase tracking-[0.3em] mt-4">Lock your tokens to secure the network and earn rewards</p>
        </div>
        
        <div className="flex items-center gap-4 bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-[8px] font-bold text-blue-500/40 uppercase tracking-widest mb-1">Current APR</p>
            <p className="text-xl font-black text-white tracking-tighter">15.0%</p>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-8 rounded-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Lock className="w-24 h-24 text-white" />
          </div>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mb-4">Staked Balance</p>
          <div className="flex items-end justify-between">
            <div className="flex items-end gap-3">
              <span className="text-5xl font-black text-white tracking-tighter">{staked.toFixed(2)}</span>
              <span className="text-xl font-bold text-white/20 mb-1 uppercase">JAM</span>
            </div>
            <div className="text-right mb-1">
              <span className="text-sm font-bold text-white/40">≈ ${(staked * JAM_PRICE_USD).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="glass p-8 rounded-2xl border border-blue-500/20 bg-blue-500/[0.02] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap className="w-24 h-24 text-blue-500" />
          </div>
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] mb-4">Pending Rewards</p>
          <div className="flex flex-col gap-4">
            <div className="flex items-end justify-between">
              <div className="flex items-end gap-3">
                <span className="text-5xl font-black text-white tracking-tighter">{pending.toFixed(4)}</span>
                <span className="text-xl font-bold text-white/20 mb-1 uppercase">JAM</span>
              </div>
              <button 
                onClick={handleClaim}
                disabled={isProcessing || pending <= 0}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
              >
                Claim
              </button>
            </div>
            <div className="text-left">
              <span className="text-sm font-bold text-blue-400">≈ ${(pending * JAM_PRICE_USD).toFixed(4)}</span>
            </div>
          </div>
        </div>

        <div className="glass p-8 rounded-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Coins className="w-24 h-24 text-white" />
          </div>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mb-4">Available Balance</p>
          <div className="flex items-end justify-between">
            <div className="flex items-end gap-3">
              <span className="text-5xl font-black text-white tracking-tighter">{balance.toFixed(2)}</span>
              <span className="text-xl font-bold text-white/20 mb-1 uppercase">JAM</span>
            </div>
            <div className="text-right mb-1">
              <span className="text-sm font-bold text-white/40">≈ ${(balance * JAM_PRICE_USD).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Staking Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stake Section */}
        <div className="glass p-10 rounded-3xl border border-white/5 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500">
              <ArrowUpRight className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Stake Tokens</h3>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Deposit JAM to start earning</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input 
                type="number" 
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black/50 border border-white/10 rounded-2xl py-6 px-8 text-2xl font-black text-white outline-none focus:border-blue-500/50 transition-all"
              />
              <button 
                onClick={() => setStakeAmount(balance.toString())}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400"
              >
                Max
              </button>
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/20 px-2">
              <span>Fee: 0.00 JAM</span>
              <span>Balance: {balance.toFixed(2)} JAM</span>
            </div>
          </div>

          <button 
            onClick={handleStake}
            disabled={isProcessing || !stakeAmount || parseFloat(stakeAmount) <= 0 || parseFloat(stakeAmount) > balance}
            className="w-full py-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {isProcessing ? 'Processing...' : 'Initialize Staking'}
            {!isProcessing && <Lock className="h-4 w-4" />}
          </button>
        </div>

        {/* Unstake Section */}
        <div className="glass p-10 rounded-3xl border border-white/5 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
              <Unlock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Unstake Tokens</h3>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Withdraw your JAM from protocol</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input 
                type="number" 
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black/50 border border-white/10 rounded-2xl py-6 px-8 text-2xl font-black text-white outline-none focus:border-white/20 transition-all"
              />
              <button 
                onClick={() => setUnstakeAmount(staked.toString())}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/40 uppercase tracking-widest hover:text-white"
              >
                Max
              </button>
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/20 px-2">
              <span>Fee: 0.00 JAM</span>
              <span>Staked: {staked.toFixed(2)} JAM</span>
            </div>
          </div>

          <button 
            onClick={handleUnstake}
            disabled={isProcessing || !unstakeAmount || parseFloat(unstakeAmount) <= 0 || parseFloat(unstakeAmount) > staked}
            className="w-full py-6 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-xs uppercase tracking-[0.3em] border border-white/10 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {isProcessing ? 'Processing...' : 'Unstake JAM'}
            {!isProcessing && <Unlock className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gradient-to-br from-blue-600/20 to-black border border-blue-500/20 p-10 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
          <Sparkles className="w-full h-full text-blue-500" />
        </div>
        <div className="relative z-10 space-y-6 max-w-2xl">
          <div className="flex items-center gap-3 text-blue-400">
            <Info className="h-5 w-5" />
            <h4 className="text-sm font-bold uppercase tracking-widest">Staking Protocol Information</h4>
          </div>
          <p className="text-sm text-white/60 leading-relaxed">
            By staking your JAM tokens, you contribute to the liquidity and stability of the TonJam ecosystem. In return, you receive a share of the protocol's inflation and platform fees. Rewards are calculated every 10 seconds and can be claimed at any time. There is no lock-up period for unstaking.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
            <div>
              <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-1">Lock Period</p>
              <p className="text-xs font-bold text-white uppercase">None</p>
            </div>
            <div>
              <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-1">Reward Frequency</p>
              <p className="text-xs font-bold text-white uppercase">10 Seconds</p>
            </div>
            <div>
              <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-1">Min. Stake</p>
              <p className="text-xs font-bold text-white uppercase">1 JAM</p>
            </div>
            <div>
              <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-1">Protocol Fee</p>
              <p className="text-xs font-bold text-white uppercase">0%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Staking History */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-1 h-6 electric-blue-bg rounded-full"></div>
            <h2 className="text-2xl font-bold uppercase tracking-tighter">Staking History</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white/5 rounded-full px-4 py-2 border border-white/10">
              <Filter className="w-3 h-3 text-white/40 mr-2" />
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)} 
                className="bg-transparent text-white text-[9px] font-bold uppercase outline-none cursor-pointer pr-1"
              >
                <option value="all" className="bg-[#050505]">All Actions</option>
                <option value="stake" className="bg-[#050505]">Stakes</option>
                <option value="unstake" className="bg-[#050505]">Unstakes</option>
                <option value="claim_rewards" className="bg-[#050505]">Claims</option>
              </select>
            </div>
            
            <div className="flex items-center bg-white/5 rounded-full px-4 py-2 border border-white/10">
              <ArrowDownUp className="w-3 h-3 text-white/40 mr-2" />
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)} 
                className="bg-transparent text-white text-[9px] font-bold uppercase outline-none cursor-pointer pr-1"
              >
                <option value="newest" className="bg-[#050505]">Newest First</option>
                <option value="oldest" className="bg-[#050505]">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="glass border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-6 py-4 text-[9px] font-bold text-white/40 uppercase tracking-widest">Action</th>
                  <th className="px-6 py-4 text-[9px] font-bold text-white/40 uppercase tracking-widest">Protocol</th>
                  <th className="px-6 py-4 text-[9px] font-bold text-white/40 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-[9px] font-bold text-white/40 uppercase tracking-widest text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.type === 'stake' ? 'bg-blue-500/10 text-blue-500' :
                          tx.type === 'unstake' ? 'bg-white/10 text-white' :
                          'bg-green-500/10 text-green-500'
                        }`}>
                          {tx.type === 'stake' ? <Lock className="h-3 w-3" /> : 
                           tx.type === 'unstake' ? <Unlock className="h-3 w-3" /> :
                           <Zap className="h-3 w-3" />}
                        </div>
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">{tx.type.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[10px] font-bold text-white uppercase tracking-tighter">{tx.trackTitle || 'Staking Protocol'}</p>
                      <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest truncate w-32">{tx.txHash}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-white tracking-tighter">JAM</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-[8px] font-bold text-white/10 uppercase tracking-widest">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </p>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">No staking activity detected</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Staking;
