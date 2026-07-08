import React, { useState } from 'react';
import { Gift, Sparkles, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '@/components/layout/ToastProvider';

interface SupportArtistProps {
  artistName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SupportArtist: React.FC<SupportArtistProps> = ({
  artistName,
  isOpen,
  onClose
}) => {
  const toast = useToast();
  const [tipAmount, setTipAmount] = useState<number>(5);
  const [isSending, setIsSending] = useState<boolean>(false);

  const presets = [1, 5, 10, 25, 50];

  const handleSendTip = () => {
    setIsSending(true);
    // Simulate smart contract interactions
    setTimeout(() => {
      setIsSending(false);
      onClose();
      toast.success(
        'Transaction Executed',
        `Successfully transferred ${tipAmount} TON to support ${artistName}!`
      );
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="bg-[#050A24] border border-white/5 rounded-[24px] p-6 max-w-sm w-full text-white relative shadow-2xl"
          >
            {/* Header */}
            <div className="text-center space-y-2 mb-6">
              <div className="w-12 h-12 bg-[#0052FF]/10 text-[#0052FF] rounded-full mx-auto flex items-center justify-center">
                <Heart className="w-6 h-6 fill-current text-[#0052FF]" />
              </div>
              <h3 className="text-lg font-bold tracking-tight">Support {artistName}</h3>
              <p className="text-xs text-slate-400">
                Send a direct Web3 contribution in TON to support their audio creations.
              </p>
            </div>

            {/* Input Slider / Box */}
            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</span>
                <span className="text-lg font-bold font-mono text-[#0052FF]">{tipAmount} TON</span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="1"
                max="100"
                value={tipAmount}
                onChange={(e) => setTipAmount(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#0052FF]"
              />

              {/* Preset Buttons */}
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setTipAmount(preset)}
                    className={`py-1.5 px-1 text-xs font-bold font-mono rounded-lg transition-all ${
                      tipAmount === preset
                        ? 'bg-[#0052FF] text-white'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    {preset}T
                  </button>
                ))}
              </div>
            </div>

            {/* Subtext warning */}
            <p className="text-[10px] text-slate-500 font-medium text-center mt-3">
              100% of these funds are routed through the TON network directly to the artist's certified smart contract address.
            </p>

            {/* Action Row */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                disabled={isSending}
                onClick={onClose}
                className="py-3 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-xs font-bold uppercase tracking-widest rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isSending}
                onClick={handleSendTip}
                className="py-3 bg-[#0052FF] hover:bg-[#0040D9] active:scale-95 transition-all text-xs font-bold uppercase tracking-widest rounded-xl cursor-pointer text-white flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Gift className="w-4 h-4" />
                    <span>Send TON</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SupportArtist;
