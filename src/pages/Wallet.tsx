import React, { useState } from 'react';
import { Wallet as WalletIcon, TrendingUp, ArrowRight, CheckCircle2, Zap, Coins, ShieldCheck, Clock, Sparkles, X, AlertTriangle } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { TON_LOGO, JAM_PRICE_USD, TJ_COIN_ICON } from '@/constants';

const Wallet: React.FC = () => {
  const { userProfile, purchaseJAM, subscribePremium, transactions, depositTON, withdrawTON } = useAudio();
  const safeTransactions = transactions || [];
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Modal state
  const [modalType, setModalType] = useState<'deposit' | 'withdraw' | null>(null);
  const [modalCurrency, setModalCurrency] = useState<'TON' | 'JAM'>('TON');
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState(userAddress || '');

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

  const handleModalSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    
    setIsProcessing(true);
    try {
      if (modalType === 'deposit') {
        await depositTON(amount);
      } else if (modalType === 'withdraw') {
        if (!walletAddress) return;
        await withdrawTON(amount, walletAddress);
      }
      setModalType(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const openModal = (type: 'deposit' | 'withdraw', currency: 'TON' | 'JAM') => {
    setModalType(type);
    setModalCurrency(currency);
    setAmount('');
    setWalletAddress(type === 'withdraw' ? userAddress || '' : '');
  };

  return (
    <div className="p-4 lg:p-4 space-y-4 animate-in fade-in duration-700 pb-4">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.5em]">Financial Protocol</span>
          </div>
          <h1 className="text-[32px] font-bold text-foreground tracking-tighter uppercase">My Wallet</h1>
        </div>
        
        <div className="flex items-center">
          <button 
            onClick={() => tonConnectUI.openModal()}
            className="p-4 rounded-[5px] bg-muted/50 hover:bg-muted transition-all"
          >
            <WalletIcon className="h-6 w-6 text-blue-500" />
          </button>
        </div>
      </header>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600/20 to-black p-4 rounded-[5px] relative overflow-hidden group flex flex-col justify-between">
          <div>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <img src={TON_LOGO} className="w-32 h-32" alt="" />
            </div>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] mb-4">TON Balance</p>
            <div className="flex items-end gap-4">
              <span className="text-[44px] font-black text-foreground tracking-tighter">{userProfile.tonBalance?.toFixed(2) || '0.00'}</span>
              <span className="text-xl font-bold text-muted-foreground mb-4">TON</span>
            </div>
            <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-4 mb-4">Protocol: TON Mainnet</p>
          </div>
          <div className="flex gap-2 relative z-10 mt-auto">
            <button onClick={() => openModal('deposit', 'TON')} className="flex-1 py-3 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-[5px] text-[10px] font-bold uppercase tracking-widest transition-all border border-blue-500/20">Deposit</button>
            <button onClick={() => openModal('withdraw', 'TON')} className="flex-1 py-3 bg-white/5 text-foreground hover:bg-white/10 rounded-[5px] text-[10px] font-bold uppercase tracking-widest transition-all border border-white/10">Withdraw</button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-black p-4 rounded-[5px] relative overflow-hidden group flex flex-col justify-between">
          <div>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <img src={TJ_COIN_ICON} className="w-32 h-32" />
            </div>
            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.3em] mb-4">JAM Tokens</p>
            <div className="flex items-end justify-between">
              <div className="flex items-end gap-4">
                <span className="text-[44px] font-black text-foreground tracking-tighter">{userProfile.jamBalance || '0'}</span>
                <span className="text-xl font-bold text-muted-foreground mb-4">JAM</span>
              </div>
              <div className="text-right mb-4">
                <span className="text-sm font-bold text-purple-400">≈ ${((userProfile.jamBalance || 0) * JAM_PRICE_USD).toFixed(2)}</span>
              </div>
            </div>
            <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-4 mb-4">Utility: In-App Currency</p>
          </div>
          <div className="flex gap-2 relative z-10 mt-auto">
            <button onClick={() => openModal('deposit', 'JAM')} className="flex-1 py-3 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-[5px] text-[10px] font-bold uppercase tracking-widest transition-all border border-purple-500/20">Deposit</button>
            <button onClick={() => openModal('withdraw', 'JAM')} className="flex-1 py-3 bg-white/5 text-foreground hover:bg-white/10 rounded-[5px] text-[10px] font-bold uppercase tracking-widest transition-all border border-white/10">Withdraw</button>
          </div>
        </div>

        <div className={`p-4 rounded-[5px] relative overflow-hidden group transition-all flex flex-col justify-between ${userProfile.isPremium ? 'bg-gradient-to-br from-amber-600/20 to-black' : 'bg-muted/50'}`}>
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldCheck className={`w-32 h-32 ${userProfile.isPremium ? 'text-amber-500' : 'text-foreground'}`} />
          </div>
          <p className={`text-[10px] font-bold uppercase tracking-[0.3em] mb-4 ${userProfile.isPremium ? 'text-amber-500' : 'text-muted-foreground'}`}>Subscription Status</p>
          <div className="flex items-center gap-4">
            <span className="text-[32px] font-black text-foreground tracking-tighter uppercase">
              {userProfile.isPremium ? 'Premium' : 'Standard'}
            </span>
            {userProfile.isPremium && <CheckCircle2 className="h-6 w-6 text-amber-500" />}
          </div>
          <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-4">
            {userProfile.isPremium ? 'All features unlocked' : 'Upgrade for high-fidelity audio'}
          </p>
        </div>
      </div>

      {/* JAM Purchase Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-1 h-6 electric-blue-bg rounded-full"></div>
          <h2 className="text-[20px] font-bold uppercase tracking-tighter">Purchase JAM Tokens</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {jamPackages.map(pkg => (
            <div key={pkg.id} className={`relative p-4 rounded-[5px] transition-all hover:scale-[1.02] cursor-pointer group ${pkg.popular ? 'bg-blue-600/5' : 'bg-muted/50'}`}>
              {pkg.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-1 bg-blue-600 text-[6px] font-bold uppercase tracking-widest rounded-full">Most Popular</div>
              )}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-tight text-foreground">{pkg.label}</h3>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Utility Tokens</p>
                </div>
                <img src={TJ_COIN_ICON} className="h-6 w-6" />
              </div>
              
              <div className="flex items-end gap-4 mb-4">
                <span className="text-[32px] font-black text-foreground tracking-tighter">{pkg.amount}</span>
                <span className="text-lg font-bold text-muted-foreground mb-4 uppercase">JAM</span>
              </div>
              
              <button 
                onClick={() => handlePurchaseJAM(pkg.price, pkg.amount)}
                disabled={isProcessing}
                className={`w-full py-4 rounded-[5px] text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-4 ${pkg.popular ? 'bg-blue-600 text-foreground shadow-xl shadow-blue-500/20' : 'bg-muted/50 text-muted-foreground/80 hover:bg-muted'}`}
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
        <section className="relative rounded-[5px] overflow-hidden bg-gradient-to-br from-amber-600/20 to-black p-4 lg:p-4">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <Zap className="w-full h-full text-amber-500" />
          </div>
          
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-4 px-4 py-4 rounded-full bg-amber-500/10 border border-neutral-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-[0.2em]">
              <Sparkles className="h-3 w-3" />
              Premium Protocol
            </div>
            
            <h2 className="text-[32px] lg:text-[56px] font-black uppercase tracking-tighter leading-[0.9] text-foreground">
              Unlock <span className="text-amber-500">High-Fidelity</span> Audio
            </h2>
            
            <ul className="space-y-4">
              {[
                'Lossless FLAC Streaming (24-bit/192kHz)',
                'Early access to Genesis NFT drops',
                'Zero platform fees on secondary sales',
                'Exclusive Premium profile badge',
                'Unlimited JamSpace reactions'
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-4 text-sm text-muted-foreground/80 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-amber-500" />
                  {feature}
                </li>
              ))}
            </ul>
            
            <div className="pt-4">
              <button 
                onClick={handleSubscribePremium}
                disabled={isProcessing}
                className="px-4 py-4 bg-amber-600 hover:bg-amber-500 text-foreground font-bold uppercase tracking-widest rounded-[5px] transition-all shadow-xl shadow-amber-600/20 flex items-center gap-4"
              >
                {isProcessing ? 'Processing...' : 'Upgrade Now for 5 TON'}
                {!isProcessing && <Zap className="h-5 w-5 fill-white" />}
              </button>
              <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-4">One-time payment for lifetime access</p>
            </div>
          </div>
        </section>
      )}

      {/* Transaction History */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-1 h-6 electric-blue-bg rounded-full"></div>
            <h2 className="text-[20px] font-bold uppercase tracking-tighter">Transaction Ledger</h2>
          </div>
          <button className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest hover:text-foreground transition-colors">Export CSV</button>
        </div>
        
        <div className="glass rounded-[5px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-foreground/[0.02] border-b border-border/50">
                  <th className="px-4 py-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Type</th>
                  <th className="px-4 py-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Asset / Protocol</th>
                  <th className="px-4 py-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Amount</th>
                  <th className="px-4 py-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                  <th className="px-4 py-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {safeTransactions.filter(tx => tx.senderAddress === userAddress || tx.recipientAddress === userAddress || tx.type === 'jam_purchase' || tx.type === 'premium_subscription').map((tx) => (
                  <tr key={tx.id} className="hover:bg-foreground/[0.01] transition-colors group">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.type === 'nft_sale' ? 'bg-green-500/10 text-green-500' :
                          tx.type === 'jam_purchase' ? 'bg-blue-500/10 text-blue-500' :
                          tx.type === 'premium_subscription' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-muted/50 text-muted-foreground'
                        }`}>
                          {tx.type === 'nft_sale' ? <TrendingUp className="h-3 w-3" /> : 
                           tx.type === 'jam_purchase' ? <img src={TJ_COIN_ICON} className="h-3 w-3" /> :
                           tx.type === 'premium_subscription' ? <Zap className="h-3 w-3" /> :
                           <Clock className="h-3 w-3" />}
                        </div>
                        <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">{(tx.type || 'transaction').replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-[10px] font-bold text-foreground uppercase tracking-tighter">{tx.trackTitle || 'Network Protocol'}</p>
                      <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest truncate w-32">{tx.txHash}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        <img src={TON_LOGO} className="w-3 h-3" alt="" />
                        <span className="text-[11px] font-bold text-foreground tracking-tighter">{tx.amount} TON</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-4 py-4 rounded-full bg-green-500/10 text-green-500 text-[8px] font-bold uppercase tracking-widest">Completed</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-widest">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </p>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center">
                      <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">No transaction signals detected</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      {/* Modal for Deposit/Withdraw */}
      {modalType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-background/90 backdrop-blur-xl"
            onClick={() => setModalType(null)}
          ></div>
          <div className="relative w-full max-w-md glass border border-neutral-500/20 bg-foreground/[0.02] rounded-[10px] p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[20px] font-bold text-foreground tracking-tighter uppercase">
                {modalType === 'deposit' ? 'Deposit' : 'Withdraw'} {modalCurrency}
              </h2>
              <button onClick={() => setModalType(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {modalCurrency === 'JAM' && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-[5px] p-4 mb-6 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Feature Disabled</p>
                  <p className="text-xs text-amber-500/80">
                    {modalType === 'deposit' ? 'Deposits' : 'Withdrawals'} for JAM are currently disabled for future functionality updates. Please check back later.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2 block">
                  Amount ({modalCurrency})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className={`w-full bg-foreground/[0.03] border border-border/50 rounded-[5px] p-4 text-sm text-foreground outline-none focus:border-blue-500/50 transition-all ${modalCurrency === 'JAM' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={modalCurrency === 'JAM' || isProcessing}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{modalCurrency}</span>
                  </div>
                </div>
              </div>

              {modalType === 'withdraw' && (
                <div>
                  <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2 block">
                    Destination Address
                  </label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder={`Enter ${modalCurrency} address`}
                    className={`w-full bg-foreground/[0.03] border border-border/50 rounded-[5px] p-4 text-sm text-foreground outline-none focus:border-blue-500/50 transition-all ${modalCurrency === 'JAM' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={modalCurrency === 'JAM' || isProcessing}
                  />
                </div>
              )}

              <button
                onClick={handleModalSubmit}
                disabled={modalCurrency === 'JAM' || isProcessing || !amount || Number(amount) <= 0 || (modalType === 'withdraw' && !walletAddress)}
                className={`w-full py-4 rounded-[5px] font-bold text-[10px] uppercase tracking-widest transition-all mt-4 ${
                  modalCurrency === 'JAM' || isProcessing || !amount || Number(amount) <= 0 || (modalType === 'withdraw' && !walletAddress)
                    ? 'bg-muted/50 text-muted-foreground opacity-50 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-foreground shadow-lg shadow-blue-600/20'
                }`}
              >
                {isProcessing ? 'Processing...' : modalType === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
