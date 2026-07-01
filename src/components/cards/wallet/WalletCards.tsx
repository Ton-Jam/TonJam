import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, Copy, Check, TrendingUp, 
  Sparkles, List, ShieldAlert, CheckCircle, Clock, Gift, Award, Send 
} from 'lucide-react';

// --- TS INTERFACES ---

export interface TransactionData {
  id: string;
  type: 'send' | 'receive' | 'mint' | 'buy';
  status: 'completed' | 'pending' | 'failed';
  amount: string; // e.g. "+12.5 TON"
  usdAmount: string; // e.g. "+$45.00"
  address: string; // truncated address
  timestamp: string;
  txHash: string;
}

export interface TokenData {
  id: string;
  name: string;
  symbol: string;
  logoUrl?: string;
  balance: string;
  priceUsd: string;
  change24h: number;
}

// --- 1. WALLET BALANCE CARD ---
export const WalletBalanceCard: React.FC<{
  address: string;
  tonBalance: string;
  usdBalance: string;
  onSend?: () => void;
  onReceive?: () => void;
  className?: string;
}> = ({ address, tonBalance, usdBalance, onSend, onReceive, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncatedAddress = address.length > 12 ? `${address.slice(0, 6)}...${address.slice(-6)}` : address;

  return (
    <div className={`p-5 rounded-[10px] bg-[#0A113A] select-none text-white w-full max-w-[340px] ${className}`}>
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-black uppercase tracking-widest text-[#9AA0AE]">TON Active Wallet</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 font-mono text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded-[4px] text-white/70 transition-colors"
        >
          <span>{truncatedAddress}</span>
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>

      <div className="space-y-1">
        <span className="text-[10px] uppercase font-bold text-[#9AA0AE] tracking-wider block">My Balance</span>
        <h2 className="text-2xl font-black font-mono leading-none">{tonBalance} TON</h2>
        <span className="text-sm font-mono text-[#9AA0AE] block">{usdBalance} USD</span>
      </div>

      <div className="mt-5 flex gap-2 w-full">
        <button onClick={onSend} className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-[6px] transition-all flex items-center justify-center gap-1.5">
          <Send className="w-3.5 h-3.5" /> Send TON
        </button>
        <button onClick={onReceive} className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-wider rounded-[6px] transition-all flex items-center justify-center gap-1.5">
          <ArrowDownLeft className="w-3.5 h-3.5" /> Receive
        </button>
      </div>
    </div>
  );
};

// --- 2. PORTFOLIO CARD (Aggregated Net Worth & Tokens list) ---
export const PortfolioCard: React.FC<{
  netWorthUsd: string;
  change24h: number;
  tokens: TokenData[];
  className?: string;
}> = ({ netWorthUsd, change24h, tokens, className = '' }) => {
  const isUp = change24h >= 0;
  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white w-full max-w-[340px] ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest text-[#9AA0AE]">Net Worth</span>
          <h2 className="text-xl font-black font-mono mt-1">{netWorthUsd} USD</h2>
        </div>
        <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full ${isUp ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
          {isUp ? '+' : ''}{change24h.toFixed(2)}%
        </span>
      </div>

      <div className="space-y-2.5">
        <span className="text-[9px] uppercase tracking-wider text-[#9AA0AE] font-black block">Balances</span>
        {tokens.map((token) => {
          const up = token.change24h >= 0;
          return (
            <div key={token.id} className="flex items-center justify-between p-2 bg-white/[0.02] rounded-[6px]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-400 font-bold flex items-center justify-center text-xs shrink-0">
                  {token.symbol[0]}
                </div>
                <div className="min-w-0">
                  <h4 className="text-[12px] font-black leading-tight uppercase">{token.name}</h4>
                  <span className="text-[9px] text-[#9AA0AE] font-mono">{token.balance} {token.symbol}</span>
                </div>
              </div>
              <div className="text-right font-mono text-[11px]">
                <p className="font-bold text-white">${token.priceUsd}</p>
                <span className={`text-[9px] ${up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {up ? '+' : ''}{token.change24h.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- 3. TOKEN CARD ---
export const TokenCard: React.FC<{
  token: TokenData;
  onTrade?: () => void;
  className?: string;
}> = ({ token, onTrade, className = '' }) => {
  const isUp = token.change24h >= 0;
  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white w-full max-w-[160px] shrink-0 snap-start flex flex-col justify-between h-40 ${className}`}>
      <div>
        <div className="flex items-center justify-between gap-1 mb-2.5">
          <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-400 font-bold flex items-center justify-center text-xs">
            {token.symbol[0]}
          </div>
          <span className={`text-[9px] font-mono font-black ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {isUp ? '+' : ''}{token.change24h.toFixed(1)}%
          </span>
        </div>
        <h4 className="text-[13px] font-black uppercase truncate">{token.name}</h4>
        <p className="text-[11px] text-[#9AA0AE] font-mono leading-none mt-0.5">{token.balance} {token.symbol}</p>
      </div>

      <div className="mt-3">
        <span className="text-sm font-black font-mono block">${token.priceUsd}</span>
        {onTrade && (
          <button onClick={onTrade} className="mt-2 w-full py-1 bg-white/5 hover:bg-white/10 text-white font-black text-[9px] uppercase tracking-wider rounded-[4px] transition-colors">
            Trade Now
          </button>
        )}
      </div>
    </div>
  );
};

// --- 4. TRANSACTION CARD ---
export const TransactionCard: React.FC<{
  tx: TransactionData;
  className?: string;
}> = ({ tx, className = '' }) => {
  const isSend = tx.type === 'send';
  const isMint = tx.type === 'mint';
  const statusColors = {
    completed: 'text-emerald-400 bg-emerald-500/10',
    pending: 'text-amber-400 bg-amber-500/10',
    failed: 'text-red-400 bg-red-500/10',
  };

  return (
    <div className={`p-3 rounded-[10px] bg-[#0A113A] select-none text-white flex items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`p-2.5 rounded-lg shrink-0 ${isSend ? 'bg-red-500/10 text-red-400' : isMint ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
          {isSend ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : (
            <ArrowDownLeft className="w-4 h-4" />
          )}
        </div>
        <div className="min-w-0">
          <h4 className="text-[13px] font-bold capitalize leading-none">{tx.type} TON</h4>
          <span className="text-[10px] text-[#9AA0AE] font-mono block mt-1">To: {tx.address}</span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <span className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded uppercase block w-max ml-auto ${statusColors[tx.status]}`}>
          {tx.status}
        </span>
        <span className="block text-xs font-black font-mono mt-1">{tx.amount}</span>
        <span className="text-[10px] text-[#9AA0AE] font-mono">{tx.timestamp}</span>
      </div>
    </div>
  );
};

// --- 5. ACTIVITY CARD (Platform logs) ---
export const ActivityCard: React.FC<{
  title: string;
  description: string;
  timeString: string;
  gasFeePaid?: string;
  className?: string;
}> = ({ title, description, timeString, gasFeePaid, className = '' }) => {
  return (
    <div className={`p-3 rounded-[10px] bg-[#0A113A] select-none text-white flex items-center justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        <h4 className="text-[12px] font-bold leading-snug">{title}</h4>
        <p className="text-[10px] text-[#9AA0AE] mt-0.5 leading-snug">{description}</p>
        <span className="text-[9px] text-[#9AA0AE]/65 font-mono mt-1 block">{timeString}</span>
      </div>
      {gasFeePaid && (
        <div className="text-right font-mono text-[10px] text-[#9AA0AE] shrink-0">
          <span>Fee paid</span>
          <span className="block font-black text-white mt-0.5">{gasFeePaid} TON</span>
        </div>
      )}
    </div>
  );
};

// --- 6. REWARD CARD (Claiming engine) ---
export const RewardCard: React.FC<{
  title: string;
  availableAmount: string;
  onClaim?: () => void;
  className?: string;
}> = ({ title, availableAmount, onClaim, className = '' }) => {
  const [claimed, setClaimed] = useState(false);
  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white w-full max-w-[340px] flex items-center justify-between ${className}`}>
      <div className="min-w-0 pr-2">
        <div className="flex items-center gap-1">
          <Award className="w-4 h-4 text-emerald-400" />
          <span className="text-[9px] font-black uppercase tracking-widest text-[#9AA0AE]">Claim Rewards</span>
        </div>
        <h4 className="text-[13px] font-bold text-white mt-1.5 truncate">{title}</h4>
        <span className="text-sm font-black text-emerald-400 font-mono block mt-0.5">{availableAmount}</span>
      </div>
      <button
        onClick={() => { setClaimed(true); onClaim?.(); }}
        disabled={claimed}
        className={`py-1.5 px-4 rounded-[6px] text-[10px] font-black uppercase tracking-wider shrink-0 ml-2 transition-all ${
          claimed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
        }`}
      >
        {claimed ? 'Claimed' : 'Claim Now'}
      </button>
    </div>
  );
};
