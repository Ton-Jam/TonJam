import React, { useState } from 'react';
import { X, Loader2, Gavel } from 'lucide-react';
import { TON_LOGO } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import { NFTItem } from '@/types';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';

interface BidModalProps {
  nft: NFTItem;
  onClose: () => void;
}

const BidModal: React.FC<BidModalProps> = ({ nft, onClose }) => {
  const { addNotification, updateNFT } = useAudio();
  const userAddress = useTonAddress();
  const [isProcessing, setIsProcessing] = useState(false);
  const currentBid = parseFloat(nft.price);
  const minBid = (currentBid * 1.05).toFixed(2); /* 5% minimum increase */
  const [bidAmount, setBidAmount] = useState(minBid);

  const handlePlaceBid = async () => {
    if (!userAddress) {
      addNotification("Connect wallet to place bid.", "warning");
      return;
    }
    if (parseFloat(bidAmount) < parseFloat(minBid)) {
      addNotification(`Minimum bid is ${minBid} TON`, "warning");
      return;
    }
    setIsProcessing(true);
    addNotification("Broadcasting bid to neural relay...", "info");
    setTimeout(() => {
      const newOffer = {
        offerer: userAddress,
        price: bidAmount,
        timestamp: 'Just now',
        duration: '24h'
      };
      /* Update NFT with new offer and update current price to reflect highest bid */
      updateNFT(nft.id, { price: bidAmount, offers: [newOffer, ...(nft.offers || [])] });
      setIsProcessing(false);
      addNotification(`Bid of ${bidAmount} TON placed!`, "success");
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={onClose}></div>
      <div className="relative glass w-full max-w-sm rounded-[10px] -amber-500/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tighter text-white">Neural Auction</h2>
              <p className="text-[7px] font-bold text-amber-500 uppercase tracking-[0.4em] mt-1">Live Bidding Relay</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40">
              <X className="h-4 w-4" />
            </button>
          </header>
          <div className="mb-8">
            <div className="flex justify-between text-[8px] font-bold text-white/30 uppercase tracking-widest mb-3 px-2">
              <span>Current Highest</span>
              <span>Min Next Bid</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-4 rounded-[10px] text-center">
                <p className="text-lg font-bold text-white">{currentBid} <span className="text-[8px] text-blue-500">TON</span></p>
              </div>
              <div className="bg-amber-500/10 -amber-500/30 p-4 rounded-[10px] text-center">
                <p className="text-lg font-bold text-amber-500">{minBid} <span className="text-[8px]">TON</span></p>
              </div>
            </div>
          </div>
          <div className="space-y-4 mb-8">
            <label className="text-[8px] font-bold text-white/30 uppercase tracking-widest px-2">Your Bid Amount</label>
            <div className="relative">
              <img src={TON_LOGO} className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6" alt="" />
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                step="0.1"
                className="w-full bg-black py-5 pl-14 pr-6 rounded-[10px] text-2xl font-bold text-white outline-none focus:-amber-500 transition-all"
              />
            </div>
          </div>
          <button
            onClick={handlePlaceBid}
            disabled={isProcessing}
            className="w-full py-5 bg-amber-500 rounded-[10px] text-[10px] font-bold uppercase tracking-widest text-black shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gavel className="h-4 w-4" />}
            {isProcessing ? 'BROADCASTING...' : 'PLACE BID NOW'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BidModal;