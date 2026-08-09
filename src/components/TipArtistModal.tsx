import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Coins, Zap, ShieldCheck, Info, CheckCircle2, Wallet, Music, Sparkles } from 'lucide-react';
import { Artist, Track } from '@/types';
import { useAudio } from '@/contexts/AudioContext';
import { distributeRoyalties } from '@/services/royaltyService';
import { createActivityPost } from '@/services/socialService';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { toNano } from '@ton/ton';
import { getPlaceholderImage } from '@/lib/utils';

interface TipArtistModalProps {
  artist?: Artist | { name: string; avatarUrl?: string; walletAddress?: string; uid?: string; location?: string };
  track?: Track | null;
  onClose: () => void;
}

const TipArtistModal: React.FC<TipArtistModalProps> = ({ artist, track, onClose }) => {
  const [amount, setAmount] = useState('0.5');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { addNotification, userProfile } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();

  const artistName = track?.artist || artist?.name || 'Artist';
  const artistUid = track?.artistId || artist?.uid || 'artist-1';
  const avatarUrl = track?.artistAvatar || artist?.avatarUrl || getPlaceholderImage('avatar');
  const trackTitle = track?.title;
  const coverUrl = track?.coverUrl;
  const walletAddress = artist?.walletAddress || 'EQAA_PLATFORM_WALLET_ADDRESS_8888888888888888';

  const tipPresets = ['0.1', '0.5', '1', '2', '5', '10'];

  const handleConnectWallet = () => {
    try {
      tonConnectUI.openModal();
    } catch (err) {
      console.error('Failed to open wallet modal:', err);
      addNotification('Connecting to wallet...', 'info');
    }
  };

  const handleTip = async () => {
    const tipAmount = parseFloat(amount);
    if (isNaN(tipAmount) || tipAmount <= 0) {
      addNotification('Please enter a valid tip amount', 'error');
      return;
    }

    if (!tonConnectUI.connected) {
      addNotification("Please connect your TON wallet first to send tips.", "error");
      handleConnectWallet();
      return;
    }

    setIsProcessing(true);
    try {
      let nanoValue;
      try {
        nanoValue = toNano(tipAmount.toString()).toString();
      } catch (e) {
        nanoValue = (tipAmount * 1e9).toFixed(0);
      }

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 120,
        messages: [
          {
            address: walletAddress,
            amount: nanoValue,
          },
        ],
      };

      const result = await tonConnectUI.sendTransaction(transaction);

      if (result) {
        setIsSuccess(true);
        // Distribute royalties (record the tip in database)
        await distributeRoyalties(
          tipAmount,
          artistUid,
          [],
          'tip',
          { trackTitle: trackTitle ? `Tip for "${trackTitle}"` : `Tip for ${artistName}` }
        );

        addNotification(`Successfully sent ${tipAmount} TON tip to ${artistName}! 💎`, 'success');

        // Create social activity post
        try {
          await createActivityPost(
            userProfile?.uid || 'user-1',
            userProfile?.name || 'Fan',
            userProfile?.avatar || getPlaceholderImage('avatar'),
            `sent a ${tipAmount} TON micro-transaction tip to`,
            'tip',
            {
              targetId: artistUid,
              artistName: artistName,
              trackTitle: trackTitle,
              paymentAmount: tipAmount.toString(),
              paymentCurrency: 'TON'
            }
          );
        } catch (postErr) {
          console.warn('Could not create activity post:', postErr);
        }

        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } catch (error) {
      console.error('Tip transaction failed:', error);
      addNotification('Transaction cancelled or failed. Please check your TON wallet balance.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#0A113A] border border-[#16244F] rounded-2xl w-full max-w-sm overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)] text-[#F2F4F8]"
      >
        <div className="p-5">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                <Coins className="w-4 h-4 text-white fill-white/20" />
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight">Tip Artist</h3>
                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">TON Micro-Transaction</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 hover:bg-[#16244F] rounded-full text-[#9AA0AE] hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Target Track / Artist Preview */}
          <div className="p-3 bg-[#050A24] rounded-xl border border-[#16244F] mb-4 flex items-center gap-3">
            {coverUrl ? (
              <img 
                src={coverUrl} 
                className="w-12 h-12 rounded-lg object-cover border border-[#16244F]" 
                alt={trackTitle || artistName} 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getPlaceholderImage('cover');
                }}
              />
            ) : (
              <img 
                src={avatarUrl} 
                className="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-500/30" 
                alt={artistName} 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getPlaceholderImage('avatar');
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-xs font-black text-white truncate">{artistName}</p>
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20 shrink-0" />
              </div>
              {trackTitle ? (
                <p className="text-[11px] font-medium text-[#9AA0AE] truncate flex items-center gap-1">
                  <Music className="w-3 h-3 text-[#5B6BFF]" />
                  {trackTitle}
                </p>
              ) : (
                <p className="text-[10px] font-medium text-[#9AA0AE] uppercase tracking-wider">Verified Artist</p>
              )}
            </div>
          </div>

          {isSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-6 flex flex-col items-center text-center space-y-2"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Sparkles className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-tight">Tip Sent Successfully!</h4>
              <p className="text-xs text-[#9AA0AE]">
                Your appreciation of <span className="text-cyan-400 font-bold">{amount} TON</span> was transmitted on-chain to {artistName}.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {/* Presets Grid */}
              <div>
                <label className="text-[10px] font-bold text-[#9AA0AE] uppercase tracking-wider mb-2 block">
                  Select Preset Micro-Amount (TON)
                </label>
                <div className="grid grid-cols-6 gap-1.5">
                  {tipPresets.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset)}
                      className={`py-2 rounded-lg text-xs font-black transition-all active:scale-95 ${
                        amount === preset 
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)] border border-cyan-300' 
                          : 'bg-[#050A24] text-[#9AA0AE] hover:text-white hover:bg-[#16244F] border border-[#16244F]'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div className="relative">
                <input 
                  type="number" 
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#050A24] border border-[#16244F] focus:border-cyan-500 rounded-xl px-4 py-2.5 text-white font-black text-sm placeholder:text-[#9AA0AE]/50 focus:outline-none transition-all"
                  placeholder="0.00"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                  <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                  <span className="text-xs font-black text-cyan-300">TON</span>
                </div>
              </div>

              {/* Fee Notice */}
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-2 items-center">
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                <p className="text-[10px] text-cyan-200/80 leading-snug">
                  Direct peer-to-peer micro-transaction to artist wallet on TON blockchain.
                </p>
              </div>

              {/* Action Buttons */}
              {!userAddress ? (
                <button
                  onClick={handleConnectWallet}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-full text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                >
                  <Wallet className="w-4 h-4" />
                  Connect TON Wallet
                </button>
              ) : (
                <button 
                  onClick={handleTip}
                  disabled={isProcessing || !amount}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isProcessing ? 'PROCESSING TON TX...' : `SEND ${amount || '0'} TON TIP`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#050A24] p-3 flex items-center justify-center gap-1.5 border-t border-[#16244F]">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] font-bold text-[#9AA0AE] uppercase tracking-widest">
            {userAddress ? `Connected: ${userAddress.slice(0, 4)}...${userAddress.slice(-4)}` : 'Secured by TON Blockchain'}
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default TipArtistModal;
