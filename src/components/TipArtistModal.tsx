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
        className="bg-white border border-gray-200 rounded-[24px] w-full max-w-sm overflow-hidden shadow-2xl"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Support</h2>
              <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Transmission Protocol</p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>

          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-100 mb-3">
            <img 
              src={artist.avatarUrl} 
              className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20" 
              alt="" 
            />
            <div>
              <p className="text-xs font-black text-gray-900 uppercase">{artist.name}</p>
              <p className="text-[8px] text-gray-400 uppercase tracking-widest">{artist.location || 'Distributed'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 block">Amount (TON)</label>
              <div className="grid grid-cols-5 gap-1">
                {tipPresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset)}
                    className={`py-1.5 rounded-lg text-[9px] font-black transition-all ${
                      amount === preset 
                        ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-gray-900 font-black text-sm placeholder:text-gray-300 focus:outline-none focus:border-blue-500/50 transition-all"
                placeholder="0.00"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <Zap className="w-2 h-2 text-white fill-current" />
                </div>
                <span className="text-[9px] font-black text-gray-400 uppercase">TON</span>
              </div>
            </div>

            <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg flex gap-2">
              <Info className="w-3 h-3 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[8px] text-blue-900/60 leading-tight">
                90% goes to {artist.name}. 10% supports TonJam infrastructure.
              </p>
            </div>

            <button 
              onClick={handleTip}
              disabled={isProcessing || !amount}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-white font-black text-[9px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
            >
              {isProcessing ? (
                <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-3 h-3" />
              )}
              {isProcessing ? 'SYNCING...' : 'AUTHORIZE TIP'}
            </button>
          </div>
        </div>

        <div className="bg-gray-50 p-3 flex items-center justify-center gap-1.5 border-t border-gray-100">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Secured by TON Blockchain</span>
        </div>
      </motion.div>
    </div>
  );
};

export default TipArtistModal;
