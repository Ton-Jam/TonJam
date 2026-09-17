import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Coins, 
  Flame, 
  Sparkles, 
  Send, 
  Wallet, 
  CheckCircle2, 
  AlertCircle,
  Award,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { LiveStreamSession, UserHeldNFT, ViewerPrivileges } from '@/types/livestream';
import { sendCryptoTipToStreamer } from '@/services/livestreamService';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

interface LiveTipModalProps {
  isOpen: boolean;
  onClose: () => void;
  stream: LiveStreamSession;
  viewerPrivileges: ViewerPrivileges;
  onTipSent?: (amount: number, currency: string) => void;
}

export const LiveTipModal: React.FC<LiveTipModalProps> = ({
  isOpen,
  onClose,
  stream,
  viewerPrivileges,
  onTipSent
}) => {
  const { user, userProfile } = useAuth();
  const { isConnected, address, connectWallet } = useWallet();

  const [selectedCurrency, setSelectedCurrency] = useState<'TON' | 'GRAM' | 'JAM'>('TON');
  const [selectedAmount, setSelectedAmount] = useState<number>(5);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [tipMessage, setTipMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const tonPresets = [1, 5, 20, 50, 100];
  const gramPresets = [100, 500, 2000, 5000, 10000];
  const jamPresets = [500, 2500, 10000, 25000, 50000];

  const currentPresets = 
    selectedCurrency === 'TON' ? tonPresets :
    selectedCurrency === 'GRAM' ? gramPresets : jamPresets;

  const currentAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleSendTip = async () => {
    if (currentAmount <= 0) {
      toast.error('Please specify a tip amount');
      return;
    }

    setIsSubmitting(true);
    try {
      // Trigger festive confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      const senderName = userProfile?.name || userProfile?.username || user?.displayName || 'TonJam Fan';
      const senderAvatar = userProfile?.avatar || user?.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=Fan';
      const senderAddress = address || userProfile?.walletAddress || 'EQ...viewer';

      await sendCryptoTipToStreamer(stream.id, {
        senderId: user?.uid || 'guest_fan',
        senderName,
        senderAvatar,
        senderAddress,
        amount: currentAmount,
        currency: selectedCurrency,
        message: tipMessage.trim() || undefined,
        senderNfts: viewerPrivileges.heldNFTs,
        senderTier: viewerPrivileges.tier
      });

      toast.success(`🎉 Tipped ${currentAmount} ${selectedCurrency} to ${stream.artistName}!`);
      onTipSent?.(currentAmount, selectedCurrency);
      onClose();
    } catch (err) {
      console.error('Failed to send tip:', err);
      toast.error('Could not process crypto tip. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="w-full max-w-md bg-[#0e1628] rounded-2xl p-6 shadow-2xl relative overflow-hidden"
      >
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-[#00B4D8] to-purple-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <Coins className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Tip {stream.artistName}
              <Zap className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-zinc-400">Support the artist directly on-chain</p>
          </div>
        </div>

        {/* NFT Privileges Callout */}
        {viewerPrivileges.heldNFTs.length > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-purple-500/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-300">
                  {viewerPrivileges.badgeLabel} Privilege Active
                </p>
                <p className="text-[10px] text-zinc-400">
                  Your tip will be highlighted with VIP glow & audio chime
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-amber-300 font-bold">
              {viewerPrivileges.heldNFTs.length} NFT{viewerPrivileges.heldNFTs.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Currency Tabs */}
        <div className="mb-4">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
            Select Cryptocurrency
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['TON', 'GRAM', 'JAM'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => {
                  setSelectedCurrency(curr);
                  setCustomAmount('');
                  if (curr === 'TON') setSelectedAmount(5);
                  else if (curr === 'GRAM') setSelectedAmount(500);
                  else setSelectedAmount(2500);
                }}
                className={`py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  selectedCurrency === curr
                    ? 'bg-[#00B4D8] text-black font-black shadow-md shadow-[#00B4D8]/20'
                    : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{curr === 'TON' ? '💎' : curr === 'GRAM' ? '⚡' : '🎵'}</span>
                <span>{curr}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Presets */}
        <div className="mb-4">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
            Tip Amount ({selectedCurrency})
          </label>
          <div className="grid grid-cols-5 gap-1.5 mb-2">
            {currentPresets.map((amt) => {
              const isSelected = !customAmount && selectedAmount === amt;
              return (
                <button
                  key={amt}
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount('');
                  }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-black font-black'
                      : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              );
            })}
          </div>

          {/* Custom Amount Input */}
          <div className="relative">
            <input
              type="number"
              placeholder={`Or enter custom ${selectedCurrency} amount...`}
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full bg-black/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#00B4D8]"
            />
            <span className="absolute right-3 top-2.5 text-xs font-bold text-zinc-400">
              {selectedCurrency}
            </span>
          </div>
        </div>

        {/* Message Input */}
        <div className="mb-5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
            Shoutout / Superchat Note (Optional)
          </label>
          <textarea
            rows={2}
            maxLength={180}
            placeholder="Say something to the artist and chat..."
            value={tipMessage}
            onChange={(e) => setTipMessage(e.target.value)}
            className="w-full bg-black/40 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#00B4D8] resize-none"
          />
          <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-1">
            <span>Broadcasts in real-time chat</span>
            <span>{tipMessage.length}/180</span>
          </div>
        </div>

        {/* Send Action */}
        <div className="space-y-2">
          <button
            onClick={handleSendTip}
            disabled={isSubmitting || currentAmount <= 0}
            className="w-full py-3 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:opacity-95 text-black font-black text-sm uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send {currentAmount} {selectedCurrency} Tip</span>
              </>
            )}
          </button>

          {!isConnected && (
            <p className="text-[10px] text-center text-zinc-400 flex items-center justify-center gap-1">
              <Wallet className="w-3 h-3 text-amber-400" />
              <span>Simulated demo mode enabled for instant testing</span>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};
