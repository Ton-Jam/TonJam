import React, { useState } from 'react';
import { X, Loader2, Gavel } from 'lucide-react';
import { TON_LOGO, APP_LOGO } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import { NFTItem } from '@/types';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { placeBid } from '@/services/tonService';
import ConfirmationModal from './ConfirmationModal';

interface BidModalProps {
  nft: NFTItem;
  onClose: () => void;
}

const BidModal: React.FC<BidModalProps> = ({ nft, onClose }) => {
  const { addNotification, updateNFT } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const [isProcessing, setIsProcessing] = useState(false);
  const currentBid = parseFloat(nft.price) || 0;
  const minBid = (currentBid * 1.05).toFixed(2); /* 5% minimum increase */
  const [bidAmount, setBidAmount] = useState(minBid);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handlePlaceBid = async () => {
    if (!userAddress) {
      addNotification("Connect wallet to place bid.", "warning");
      return;
    }
    if (parseFloat(bidAmount) < parseFloat(minBid)) {
      addNotification(`Minimum bid is ${minBid} TON`, "warning");
      return;
    }
    setIsConfirmOpen(true);
  };

  const confirmBid = async () => {
    setIsConfirmOpen(false);
    setIsProcessing(true);
    addNotification("Broadcasting bid to neural relay...", "info");
    
    try {
      await placeBid(tonConnectUI, nft.owner, bidAmount);
      
      const newOffer = {
        id: `offer-${Date.now()}`,
        offerer: userAddress,
        price: bidAmount,
        timestamp: 'Just now',
        duration: '24h'
      };
      /* Update NFT with new offer and update current price to reflect highest bid */
      updateNFT(nft.id, { price: bidAmount, offers: [newOffer, ...(nft.offers || [])] });
      addNotification(`Bid of ${bidAmount} TON placed!`, "success");
      onClose();
    } catch (e) {
      console.error(e);
      addNotification("Bid broadcast failed.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-sm rounded-[16px] bg-card border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6">
          <header className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-foreground">Place a Bid</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </header>
          
          <div className="mb-6 space-y-4">
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>Current Highest</span>
              <span>Min Next Bid</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 p-4 rounded-[12px] text-center">
                <p className="text-xl font-bold text-foreground">{currentBid} <span className="text-xs text-muted-foreground">TON</span></p>
              </div>
              <div className="bg-primary/10 p-4 rounded-[12px] text-center">
                <p className="text-xl font-bold text-primary">{minBid} <span className="text-xs text-primary/70">TON</span></p>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <label className="text-xs font-medium text-muted-foreground">Your Bid Amount</label>
            <div className="relative">
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                step="0.1"
                className="w-full bg-muted/50 border border-border py-3 px-4 rounded-[12px] text-lg font-bold text-foreground outline-none focus:border-primary transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">TON</span>
            </div>
          </div>

          <button
            onClick={handlePlaceBid}
            disabled={isProcessing}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 rounded-[2px] text-sm font-bold text-white shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gavel className="h-4 w-4" />}
            {isProcessing ? 'PLACING BID...' : 'PLACE BID'}
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmBid}
        title="Place Bid?"
        description={`Are you sure you want to place a bid of ${bidAmount} TON for "${nft.title}"? This action will broadcast your bid to the network.`}
        confirmText="Place Bid"
      />
    </div>
  );
};

export default BidModal;