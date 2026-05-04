import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Coins, Zap, ShieldCheck, Info } from 'lucide-react';
import { Artist } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { distributeRoyalties } from '@/services/royaltyService';
import { createActivityPost } from '@/services/socialService';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { toNano } from '@ton/ton';

interface TipArtistModalProps {
  artist: Artist;
  onClose: () => void;
}

const TipArtistModal: React.FC<TipArtistModalProps> = ({ artist, onClose }) => {
  const [amount, setAmount] = useState('1');
  const [isProcessing, setIsProcessing] = useState(false);
  const { addNotification, userProfile } = useAudio();
  const [tonConnectUI] = useTonConnectUI();

  const handleTip = async () => {
    const tipAmount = parseFloat(amount);
    if (isNaN(tipAmount) || tipAmount <= 0) {
      addNotification('Please enter a valid amount', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Process TON transaction
      if (!tonConnectUI.connected) {
        addNotification("Please connect your wallet first", "error");
        setIsProcessing(false);
        return;
      }

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60, // 60 seconds
        messages: [
          {
            address: artist.walletAddress || '',
            amount: toNano(amount).toString(), // convert TON to nanoton
          },
        ],
      };

      const result = await tonConnectUI.sendTransaction(transaction);

      if (result) {
        // 2. Distribute royalties (record the tip in database)
        await distributeRoyalties(
          tipAmount,
          artist.uid,
          [], // Splits - standard tip usually goes mostly to artist
          'tip',
          { trackTitle: `Tip for ${artist.name}` } // Metadata
        );

        addNotification(`Successfully tipped ${tipAmount} TON to ${artist.name}!`, 'success');

        // 3. Create social activity post
        await createActivityPost(
          userProfile.uid,
          userProfile.name,
          userProfile.avatar,
          `just transmitted a sonic appreciation tip to`,
          'tip',
          {
            targetId: artist.uid,
            artistName: artist.name,
            paymentAmount: tipAmount.toString(),
            paymentCurrency: 'TON'
          }
        );

        onClose();
      }
    } catch (error) {
      console.error('Tip failed:', error);
      addNotification('Transaction failed. Please check your wallet.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const tipPresets = ['0.5', '1', '5', '10', '50'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#0A0A0A] border border-white/10 rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Support Artist</h2>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">Direct Transmission Protocol</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X className="w-5 h-5 text-white/50" />
            </button>
          </div>

          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 mb-8">
            <img 
              src={artist.avatarUrl} 
              className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20" 
              alt="" 
            />
            <div>
              <p className="text-sm font-black text-white uppercase italic">{artist.name}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">{artist.location || 'Distributed Network'}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 block">Select Amount (TON)</label>
              <div className="grid grid-cols-5 gap-2">
                {tipPresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset)}
                    className={`py-2 rounded-xl text-[10px] font-black transition-all ${
                      amount === preset 
                        ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-black text-xl placeholder:text-white/10 focus:outline-none focus:border-blue-500/50 transition-all"
                placeholder="0.00"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white fill-current" />
                </div>
                <span className="text-xs font-black text-white/40 uppercase italic">TON</span>
              </div>
            </div>

            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex gap-3">
              <Info className="w-4 h-4 text-blue-500 shrink-0" />
              <p className="text-[10px] text-blue-100/60 leading-relaxed italic">
                90% of your tip goes directly to {artist.name}. The remaining 10% supports the TonJam network infrastructure and governance treasury.
              </p>
            </div>

            <button 
              onClick={handleTip}
              disabled={isProcessing || !amount}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-white font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isProcessing ? 'SYNCHRONIZING...' : 'AUTHORIZE TIP'}
            </button>
          </div>
        </div>

        <div className="bg-white/5 p-4 flex items-center justify-center gap-2 border-t border-white/5">
          <ShieldCheck className="w-4 h-4 text-blue-500" />
          <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Secured by TON Blockchain</span>
        </div>
      </motion.div>
    </div>
  );
};

export default TipArtistModal;
