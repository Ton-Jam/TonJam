import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingDown, Coins, ExternalLink, Zap, ShoppingBag, Sparkles, BellRing } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TriggeredPriceDrop } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PriceDropNotificationModalProps {
  data: TriggeredPriceDrop | null;
  onClose: () => void;
}

export const PriceDropNotificationModal: React.FC<PriceDropNotificationModalProps> = ({ data, onClose }) => {
  const navigate = useNavigate();

  if (!data || !data.nft) return null;

  const { nft, alert, currentPrice, previousPrice } = data;

  const rarityValue = nft.rarity || nft.traits?.find(t => t.trait_type === 'Rarity')?.value || nft.attributes?.find(a => a.trait_type === 'Rarity')?.value;

  const currentPriceNum = parseFloat(currentPrice || nft.price || '0');
  const targetPriceNum = parseFloat(alert?.targetPrice || '0');
  const prevPriceNum = previousPrice ? parseFloat(previousPrice) : (targetPriceNum > currentPriceNum ? targetPriceNum * 1.2 : currentPriceNum * 1.15);

  const discountPercent = prevPriceNum > 0 && currentPriceNum < prevPriceNum
    ? Math.round(((prevPriceNum - currentPriceNum) / prevPriceNum) * 100)
    : 0;

  const handleBuyNow = () => {
    onClose();
    navigate(`/nft/${nft.id}?buy=true`);
  };

  const handleViewNFT = () => {
    onClose();
    navigate(`/nft/${nft.id}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Dark Backdrop with Blur */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
          onClick={onClose} 
        />
        
        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          className="relative w-full max-w-md bg-[#0A113A] border border-cyan-500/30 rounded-3xl shadow-2xl shadow-cyan-500/10 overflow-hidden"
        >
          {/* Top Glowing Header Banner */}
          <div className="relative bg-gradient-to-r from-emerald-600/30 via-cyan-500/20 to-blue-600/30 p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-pulse">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Signal Threshold Crossed</span>
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                </div>
                <h3 className="text-base font-black uppercase tracking-tight text-white">Price Drop Alert</h3>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-all active:scale-90"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-5">
            {/* NFT Card Preview */}
            <div className="flex items-center gap-4 p-3.5 bg-white/[0.03] border border-white/10 rounded-2xl relative overflow-hidden group">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10">
                <img 
                  src={nft.imageUrl} 
                  alt={nft.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[9px] font-black uppercase tracking-widest border border-cyan-500/30">
                    Music NFT
                  </span>
                  {rarityValue && (
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[9px] font-black uppercase tracking-widest border border-purple-500/30">
                      {rarityValue}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-black text-white truncate uppercase tracking-tight">{nft.title}</h4>
                <p className="text-[11px] font-bold text-white/50 truncate">by {nft.artist || nft.creator || 'TonJam Artist'}</p>
              </div>
            </div>

            {/* Price Drop Metric Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-black/40 to-cyan-950/30 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-white/50 flex items-center gap-1">
                  <BellRing className="w-3.5 h-3.5 text-cyan-400" /> Target Alert Price
                </span>
                <span className="font-mono font-bold text-white">{targetPriceNum.toFixed(2)} TON</span>
              </div>

              <div className="h-px bg-white/10" />

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block mb-0.5">
                    New Current Price
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <Coins className="w-5 h-5 text-emerald-400 self-center" />
                    <span className="text-2xl font-black font-mono text-emerald-300">{currentPriceNum.toFixed(2)}</span>
                    <span className="text-xs font-bold text-emerald-400">TON</span>
                  </div>
                </div>

                {discountPercent > 0 && (
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-right">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 block">Saved</span>
                    <span className="text-sm font-black font-mono text-emerald-300">-{discountPercent}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Helper Message */}
            <p className="text-[11px] text-white/60 text-center font-medium leading-relaxed">
              The floor price for <strong className="text-white">{nft.title}</strong> dropped below your target of <strong className="text-cyan-300">{targetPriceNum} TON</strong>. Grab it before other collectors do!
            </p>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <Button 
                onClick={handleBuyNow}
                className="w-full py-6 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Buy Now for {currentPriceNum.toFixed(2)} TON</span>
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline"
                  onClick={handleViewNFT}
                  className="py-5 bg-white/5 border-white/10 hover:bg-white/10 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5"
                >
                  <span>View Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>

                <Button 
                  variant="ghost"
                  onClick={onClose}
                  className="py-5 bg-transparent hover:bg-white/5 text-white/60 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PriceDropNotificationModal;
