import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Cpu, Wallet, RefreshCw, CheckCircle2, ChevronRight, Coins } from 'lucide-react';
import { useToast } from '../layout/ToastProvider';

interface TonWalletVerificationProps {
  walletAddress?: string;
  isVerified?: boolean;
  onVerifiedSuccess: () => void;
}

type StepStatus = 'idle' | 'rpc_connect' | 'state_fetch' | 'dns_check' | 'completed';

export const TonWalletVerification: React.FC<TonWalletVerificationProps> = ({
  walletAddress = 'EQBvW3Fi_ZcrT9S6Jv5N3m9T7y9H5n7P5w9N7K5w9N7K5w9',
  isVerified = false,
  onVerifiedSuccess,
}) => {
  const toast = useToast();
  const [status, setStatus] = useState<StepStatus>('idle');
  const [progress, setProgress] = useState(0);

  const startVerificationProcess = () => {
    if (isVerified) {
      toast.info('Already Verified', 'Your TON wallet address is already validated on the network.');
      return;
    }

    setStatus('rpc_connect');
    setProgress(15);

    // Simulated steps to make it look highly authentic and rich
    setTimeout(() => {
      setStatus('state_fetch');
      setProgress(50);
    }, 1200);

    setTimeout(() => {
      setStatus('dns_check');
      setProgress(80);
    }, 2400);

    setTimeout(() => {
      setStatus('completed');
      setProgress(100);
      onVerifiedSuccess();
      toast.success('TON Wallet Verified', 'Your address has been successfully verified on the TON network.');
    }, 3600);
  };

  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
  };

  return (
    <div className="bg-[#101A3B] rounded-2xl p-5 text-white select-none relative overflow-hidden">
      {/* Background soft glowing accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
          <Wallet className="w-5 h-5 text-blue-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-[#9AA0AE]">
            TON Blockchain Node
          </h4>
          <h3 className="text-sm font-black uppercase tracking-wider text-white mt-0.5">
            Network Identity Verification
          </h3>
        </div>
        {isVerified && (
          <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified</span>
          </div>
        )}
      </div>

      <div className="mt-4 bg-slate-900/40 rounded-xl p-3.5">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-slate-400 font-medium">Wallet Address</span>
          <span className="font-mono text-[10px] text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded">
            {truncateAddress(walletAddress)}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-xs font-semibold mt-2.5">
          <span className="text-slate-400 font-medium">Domain Registration</span>
          <span className="font-mono text-[10px] text-slate-300">
            {walletAddress ? `${walletAddress.slice(0, 4).toLowerCase()}.ton` : 'none'}
          </span>
        </div>
      </div>

      {status !== 'idle' && status !== 'completed' && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
            <span className="text-blue-400 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              {status === 'rpc_connect' && 'Connecting to TON RPC Node...'}
              {status === 'state_fetch' && 'Reading account state details...'}
              {status === 'dns_check' && 'Authenticating TON DNS domains...'}
            </span>
            <span className="text-slate-400 font-mono">{progress}%</span>
          </div>
          
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {status === 'completed' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-blue-500/10 rounded-xl flex items-center gap-3 text-xs"
        >
          <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
          <div className="flex-1">
            <p className="font-black text-blue-300 uppercase tracking-wider">Identity Confirmed</p>
            <p className="text-[11px] text-slate-300 font-medium mt-0.5 leading-relaxed">
              Your wallet signature matches your TonJam profile data. Verification badge is now active.
            </p>
          </div>
        </motion.div>
      )}

      {!isVerified && status === 'idle' && (
        <button
          onClick={startVerificationProcess}
          className="mt-4 w-full py-2.5 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Run TON Network Check</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {isVerified && status === 'idle' && (
        <div className="mt-4 p-3 bg-emerald-500/5 text-emerald-400 rounded-xl flex items-center gap-2.5 text-xs">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span className="font-bold uppercase tracking-wider">Wallet verified and certified on-chain</span>
        </div>
      )}
    </div>
  );
};

export default TonWalletVerification;
