import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Zap, 
  Bot, 
  HelpCircle, 
  Sparkles, 
  Coins, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Globe
} from 'lucide-react';
import { useTonAddress, useTonWallet } from '@tonconnect/ui-react';
import { useAudio } from '@/contexts/AudioContext';
import { TON_TESTNET_CONFIG, getTonViewerUrl } from '@/services/tonService';
import { toast } from 'sonner';

interface TestnetHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestnetHubModal: React.FC<TestnetHubModalProps> = ({ isOpen, onClose }) => {
  const userAddress = useTonAddress();
  const wallet = useTonWallet();
  const { depositTON } = useAudio();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isRecharging, setIsRecharging] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async (text: string, key: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleInstantFaucet = async () => {
    setIsRecharging(true);
    try {
      await depositTON('2.0');
      toast.success('Testnet Sandbox Recharged', {
        description: '+2.00 Testnet TON credited to your profile for testing!'
      });
    } catch (e: any) {
      toast.error('Faucet recharge failed', { description: e?.message });
    } finally {
      setIsRecharging(false);
    }
  };

  const isChainTestnet = wallet?.account?.chain === '-3';

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-[#090E20] border border-blue-500/20 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="testnet-hub-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-900/30 via-transparent to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Zap className="w-4 h-4 fill-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="testnet-hub-title" className="text-base font-black text-white tracking-tight">
                  TON Testnet Hub
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                  Active Sandbox
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Decentralized testing environment & smart contracts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Active Network Status */}
          <div className="bg-white/[0.03] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Network Configuration
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live on Testnet
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-black/30 p-2.5 rounded-lg">
                <span className="text-slate-500 block text-[9px] uppercase">Chain ID</span>
                <span className="text-white font-bold">-3 (TON Testnet)</span>
              </div>
              <div className="bg-black/30 p-2.5 rounded-lg">
                <span className="text-slate-500 block text-[9px] uppercase">RPC Endpoint</span>
                <span className="text-white truncate block">testnet.toncenter.com</span>
              </div>
            </div>
            {wallet && (
              <div className="text-[11px] p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                <span>Connected Wallet:</span>
                <span className={`font-mono font-bold ${isChainTestnet ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {isChainTestnet ? '✓ Tonkeeper Testnet' : 'TonConnect Connected'}
                </span>
              </div>
            )}
          </div>

          {/* Testnet Faucets */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              Get Free Testnet TON
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Official Telegram Bot */}
              <a
                href={TON_TESTNET_CONFIG.faucetBotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0088CC]/10 hover:bg-[#0088CC]/20 border border-[#0088CC]/30 p-3.5 rounded-xl flex flex-col justify-between group transition-all cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-[#0088CC]" />
                      @testgiver_ton_bot
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#0088CC] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Official Telegram faucet bot gives 2-5 Testnet TON per request.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#0088CC] font-bold mt-2">
                  Open Telegram Bot →
                </span>
              </a>

              {/* Instant Sandbox Balance Booster */}
              <button
                type="button"
                onClick={handleInstantFaucet}
                disabled={isRecharging}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 p-3.5 rounded-xl flex flex-col justify-between text-left group transition-all cursor-pointer disabled:opacity-50"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      Instant Sandbox Recharge
                    </span>
                    {isRecharging ? (
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Credits +2.00 Testnet TON directly to your TonJam test profile.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold mt-2">
                  {isRecharging ? 'Recharging...' : 'Recharge Sandbox Balance →'}
                </span>
              </button>
            </div>

            {userAddress && (
              <div className="bg-black/30 p-3 rounded-xl flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Your Address to Paste in Faucet:</span>
                  <span className="font-mono text-[11px] text-white truncate block">
                    {userAddress}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(userAddress, 'wallet', 'Wallet address')}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedKey === 'wallet' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'wallet' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Tonkeeper Testnet Guide */}
          <div className="bg-white/[0.03] rounded-xl p-4 space-y-2.5">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              How to Switch Tonkeeper to Testnet
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300">
              <li>Open Tonkeeper (mobile app or browser extension).</li>
              <li>Go to <strong>Settings</strong>, scroll down to the app version number.</li>
              <li><strong>Tap the version number 5 times rapidly</strong> until the developer menu appears.</li>
              <li>Toggle the network to <strong>Testnet</strong> and connect via TonConnect in TonJam.</li>
            </ol>
          </div>

          {/* Deployed Testnet Smart Contracts */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              Testnet Smart Contracts
            </h3>

            {/* Collection */}
            <div className="bg-black/30 p-3 rounded-xl flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] text-slate-500 uppercase block font-mono">TonJam NFT Collection (TEP-62/64):</span>
                <span className="font-mono text-[11px] text-purple-300 truncate block">
                  {TON_TESTNET_CONFIG.collectionAddress}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(TON_TESTNET_CONFIG.collectionAddress, 'coll', 'Collection contract')}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
                  title="Copy address"
                >
                  {copiedKey === 'coll' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={getTonViewerUrl(TON_TESTNET_CONFIG.collectionAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
                  title="View on Testnet TonViewer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Marketplace */}
            <div className="bg-black/30 p-3 rounded-xl flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] text-slate-500 uppercase block font-mono">TonJam Marketplace (TEP-66):</span>
                <span className="font-mono text-[11px] text-blue-300 truncate block">
                  {TON_TESTNET_CONFIG.marketplaceAddress}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(TON_TESTNET_CONFIG.marketplaceAddress, 'mkt', 'Marketplace contract')}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
                  title="Copy address"
                >
                  {copiedKey === 'mkt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={getTonViewerUrl(TON_TESTNET_CONFIG.marketplaceAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
                  title="View on Testnet TonViewer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/5 bg-black/40 flex items-center justify-between">
          <a
            href="https://testnet.tonviewer.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>testnet.tonviewer.com</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestnetHubModal;
