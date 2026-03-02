import React, { useState } from 'react';
import { Wallet as WalletIcon, TrendingUp, ArrowRight, CheckCircle2, Zap, Coins, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { TON_LOGO, JAM_PRICE_USD } from '@/constants';

const Wallet: React.FC = () => {
  const { userProfile, purchaseJAM, subscribePremium, transactions } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const [isProcessing, setIsProcessing] = useState(false);

  const jamPackages = [
    { id: 'p1', amount: '100', price: '1', label: 'Starter Pack' },
    { id: 'p2', amount: '500', price: '4.5', label: 'Pro Pack', popular: true },
    { id: 'p3', amount: '1200', price: '10', label: 'Elite Pack' },
  ];

  const handlePurchaseJAM = async (price: string, amount: string) => {
    if (!userAddress) {
      tonConnectUI.openModal();
      return;
    }
    setIsProcessing(true);
    try {
      await purchaseJAM(price, amount);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubscribePremium = async () => {
    if (!userAddress) {
      tonConnectUI.openModal();
      return;
    }
    setIsProcessing(true);
    try {
      await subscribePremium('5'); // 5 TON for Premium
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-12 animate-in fade-in duration-700 pb-32">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.5em]">Financial Protocol</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tighter uppercase">My Wallet</h1>
        </div>
        
        {!userAddress ? (
          <button 
            onClick={() => tonConnectUI.openModal()}
            className="px-8 py-4 electric-blue-bg text-white rounded-[5px] font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-3"
          >
            <WalletIcon className="h-4 w-4" />
            Connect Wallet
          </button>
        ) : (
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-[5px] border border-white/10">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <WalletIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-1">Connected Address</p>
              <p className="text-[10px] font-bold text-white uppercase tracking-tighter truncate w-32 md:w-48">
                {userAddress}
              </p>
            </div>
          </div>
        )}
      </header>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600/20 to-black border border-blue-500/20 p-8 rounded-[5px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <img src={TON_LOGO} className="w-32 h-32" alt="" />
          </div>
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] mb-4">TON Balance</p>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black text-white tracking-tighter">0.00</span>
            <span className="text-xl font-bold text-white/40 mb-1">TON</span>
          </div>
          <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-6">Protocol: TON Mainnet</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-black border border-purple-500/20 p-8 rounded-[5px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Coins className="w-32 h-32 text-purple-500" />
          </div>
          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.3em] mb-4">JAM Tokens</p>
          <div className="flex items-end justify-between">
            <div className="flex items-end gap-3">
              <span className="text-5xl font-black text-white tracking-tighter">{userProfile.jamBalance || '0'}</span>
              <span className="text-xl font-bold text-white/40 mb-1">JAM</span>
            </div>
            <div className="text-right mb-1">
              <span className="text-sm font-bold text-purple-400">≈ ${(parseFloat(userProfile.jamBalance || '0') * JAM_PRICE_USD).toFixed(2)}</span>
            </div>
          </div>
          <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-6">Utility: In-App Currency</p>
        </div>

        <div className={`border p-8 rounded-[5px] relative overflow-hidden group transition-all ${userProfile.isPremium ? 'bg-gradient-to-br from-amber-600/20 to-black border-amber-500/20' : 'bg-white/5 border-white/10'}`}>
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldCheck className={`w-32 h-32 ${userProfile.isPremium ? 'text-amber-500' : 'text-white'}`} />
          </div>
          <p className={`text-[10px] font-bold uppercase tracking-[0.3em] mb-4 ${userProfile.isPremium ? 'text-amber-500' : 'text-white/40'}`}>Subscription Status</p>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-black text-white tracking-tighter uppercase">
              {userProfile.isPremium ? 'Premium' : 'Standard'}
            </span>
            {userProfile.isPremium && <CheckCircle2 className="h-6 w-6 text-amber-500" />}
          </div>
          <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-6">
            {userProfile.isPremium ? 'All features unlocked' : 'Upgrade for high-fidelity audio'}
          </p>
        </div>
      </div>

      {/* JAM Purchase Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-1 h-6 electric-blue-bg rounded-full"></div>
          <h2 className="text-2xl font-bold uppercase tracking-tighter">Purchase JAM Tokens</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {jamPackages.map(pkg => (
            <div key={pkg.id} className={`relative p-8 rounded-[5px] border transition-all hover:scale-[1.02] cursor-pointer group ${pkg.popular ? 'bg-blue-600/5 border-blue-500/30' : 'bg-white/5 border-white/10'}`}>
              {pkg.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-blue-600 text-[8px] font-bold uppercase tracking-widest rounded-full">Most Popular</div>
              )}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-tight text-white">{pkg.label}</h3>
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Utility Tokens</p>
                </div>
                <Coins className={`h-6 w-6 ${pkg.popular ? 'text-blue-500' : 'text-white/20'}`} />
              </div>
              
              <div className="flex items-end gap-2 mb-8">
                <span className="text-4xl font-black text-white tracking-tighter">{pkg.amount}</span>
                <span className="text-lg font-bold text-white/40 mb-1 uppercase">JAM</span>
              </div>
              
              <button 
                onClick={() => handlePurchaseJAM(pkg.price, pkg.amount)}
                disabled={isProcessing}
                className={`w-full py-4 rounded-[5px] text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${pkg.popular ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
              >
                {isProcessing ? 'Processing...' : `Buy for ${pkg.price} TON`}
                {!isProcessing && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Premium Upgrade Section */}
      {!userProfile.isPremium && (
        <section className="relative rounded-[5px] overflow-hidden bg-gradient-to-br from-amber-600/20 to-black border border-amber-500/20 p-8 lg:p-16">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <Zap className="w-full h-full text-amber-500" />
          </div>
          
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-[0.2em]">
              <Sparkles className="h-3 w-3" />
              Premium Protocol
            </div>
            
            <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.9] text-white">
              Unlock <span className="text-amber-500">High-Fidelity</span> Audio
            </h2>
            
            <ul className="space-y-3">
              {[
                'Lossless FLAC Streaming (24-bit/192kHz)',
                'Early access to Genesis NFT drops',
                'Zero platform fees on secondary sales',
                'Exclusive Premium profile badge',
                'Unlimited JamSpace reactions'
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-white/60 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-amber-500" />
                  {feature}
                </li>
              ))}
            </ul>
            
            <div className="pt-6">
              <button 
                onClick={handleSubscribePremium}
                disabled={isProcessing}
                className="px-12 py-5 bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-widest rounded-[5px] transition-all shadow-xl shadow-amber-600/20 flex items-center gap-4"
              >
                {isProcessing ? 'Processing...' : 'Upgrade Now for 5 TON'}
                {!isProcessing && <Zap className="h-5 w-5 fill-white" />}
              </button>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-4">One-time payment for lifetime access</p>
            </div>
          </div>
        </section>
      )}

      {/* Transaction History */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-1 h-6 electric-blue-bg rounded-full"></div>
            <h2 className="text-2xl font-bold uppercase tracking-tighter">Transaction Ledger</h2>
          </div>
          <button className="text-[10px] font-bold text-white/20 uppercase tracking-widest hover:text-white transition-colors">Export CSV</button>
        </div>
        
        <div className="glass border border-white/5 rounded-[5px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-6 py-4 text-[9px] font-bold text-white/40 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-[9px] font-bold text-white/40 uppercase tracking-widest">Asset / Protocol</th>
                  <th className="px-6 py-4 text-[9px] font-bold text-white/40 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-[9px] font-bold text-white/40 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[9px] font-bold text-white/40 uppercase tracking-widest text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.filter(tx => tx.senderAddress === userAddress || tx.recipientAddress === userAddress || tx.type === 'jam_purchase' || tx.type === 'premium_subscription').map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.type === 'nft_sale' ? 'bg-green-500/10 text-green-500' :
                          tx.type === 'jam_purchase' ? 'bg-blue-500/10 text-blue-500' :
                          tx.type === 'premium_subscription' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-white/5 text-white/40'
                        }`}>
                          {tx.type === 'nft_sale' ? <TrendingUp className="h-3 w-3" /> : 
                           tx.type === 'jam_purchase' ? <Coins className="h-3 w-3" /> :
                           tx.type === 'premium_subscription' ? <Zap className="h-3 w-3" /> :
                           <Clock className="h-3 w-3" />}
                        </div>
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">{tx.type.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[10px] font-bold text-white uppercase tracking-tighter">{tx.trackTitle || 'Network Protocol'}</p>
                      <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest truncate w-32">{tx.txHash}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <img src={TON_LOGO} className="w-3 h-3" alt="" />
                        <span className="text-[11px] font-bold text-white tracking-tighter">{tx.amount} TON</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-[8px] font-bold uppercase tracking-widest">Completed</span>
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
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">No transaction signals detected</p>
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

export default Wallet;
