import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ArrowRight, 
  Wallet, 
  CheckCircle2, 
  ShieldCheck,
  TrendingUp,
  Zap,
  Info
} from 'lucide-react';
import { TON_LOGO, TJ_COIN_ICON, JAM_PRICE_USD } from '@/constants';

interface BuyTJModalProps {
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

const BuyTJModal: React.FC<BuyTJModalProps> = ({ onClose, onSuccess }) => {
  const [tonAmount, setTonAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'input' | 'success'>('input');

  const tonToJamRate = 100; // 1 TON = 100 JAM (Example)
  const jamAmount = tonAmount ? parseFloat(tonAmount) * tonToJamRate : 0;

  const handleBuy = async () => {
    if (!tonAmount || parseFloat(tonAmount) <= 0) return;
    
    setIsProcessing(true);
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setStep('success');
    onSuccess(jamAmount);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-xl"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-background border border-blue-500/40 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-600/10 text-blue-500">
                <Wallet className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Forge Protocol</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-muted/50 rounded-full transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {step === 'input' ? (
              <motion.div 
                key="input"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-2"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pay with TON</label>
                    <span className="text-[10px] font-bold text-muted-foreground/50">Balance: 12.5 TON</span>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={tonAmount}
                      onChange={(e) => setTonAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-foreground/[0.02] border border-blue-500/40 rounded-2xl p-2 text-[20px] font-black text-foreground outline-none focus:border-neutral-500/50 transition-all"
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <img src={TON_LOGO} className="w-6 h-6 object-contain" alt="" />
                      <span className="text-sm font-black text-foreground">TON</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-muted-foreground/50 rotate-90" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Receive JAM</label>
                    <span className="text-[10px] font-bold text-blue-500">Rate: 1 TON = 100 JAM</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-neutral-600/5 border border-blue-500/30 rounded-2xl p-2 text-[20px] font-black text-neutral-400">
                      {jamAmount.toLocaleString()}
                    </div>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <img src={TJ_COIN_ICON} className="w-6 h-6 object-contain" alt="" />
                      <span className="text-sm font-black text-blue-400">JAM</span>
                    </div>
                  </div>
                </div>

                <div className="p-2 bg-muted/50 rounded-2xl flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <Info className="w-4 h-4" />
                  </div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                    Transaction includes a 0.5% network fee. JAM will be credited to your neural wallet instantly.
                  </p>
                </div>

                <button 
                  onClick={handleBuy}
                  disabled={isProcessing || !tonAmount || parseFloat(tonAmount) <= 0}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2 border border-[#C0C0C0]/50"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Confirm Protocol
                    </>
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-2 py-2"
              >
                <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto relative">
                  <div className="absolute inset-0 bg-green-500/10 rounded-full animate-ping" />
                  <CheckCircle2 className="w-12 h-12 text-green-500 relative z-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-[20px] font-black text-foreground uppercase tracking-tighter">Protocol Success</h3>
                  <p className="text-sm font-medium text-muted-foreground">
                    You have successfully forged <span className="text-foreground font-black">{jamAmount.toLocaleString()} JAM</span>.
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="w-full py-2 rounded-xl bg-foreground text-background text-xs font-black uppercase tracking-widest hover:bg-neutral-200 transition-all"
                >
                  Return to Center
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-2 flex items-center justify-center gap-2 opacity-20">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase tracking-widest">TON Blockchain Verified</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BuyTJModal;
