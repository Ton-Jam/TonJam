import React, { useState, useEffect } from 'react';
import { X, Loader2, Gavel } from 'lucide-react';
import { TON_LOGO, APP_LOGO } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import { NFTItem } from '@/types';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { placeBid, getTonPrice, getTonBalance } from '@/services/tonService';
import { getPlaceholderImage, cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ConfirmationModal from './ConfirmationModal';
import { AlertCircle } from 'lucide-react';

interface BidModalProps {
  nft: NFTItem;
  onClose: () => void;
}

const BidModal: React.FC<BidModalProps> = ({ nft, onClose }) => {
  const { addNotification, updateNFT, userProfile } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const [isProcessing, setIsProcessing] = useState(false);
  const currentBid = parseFloat(nft.price) || 0;
  const minBid = (currentBid * 1.05).toFixed(2); /* 5% minimum increase */
  const [bidAmount, setBidAmount] = useState(minBid);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [tonPrice, setTonPrice] = useState<number | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(userProfile.tonBalance || 0);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const price = await getTonPrice();
      setTonPrice(price);
      
      if (userAddress) {
        const balance = await getTonBalance(userAddress);
        setWalletBalance(balance);
      }
    };
    fetchData();
  }, [userAddress]);

  useEffect(() => {
    const amount = parseFloat(bidAmount);
    if (isNaN(amount)) {
      setValidationError("Please enter a valid numeric magnitude.");
    } else if (amount < parseFloat(minBid)) {
      setValidationError(`Minimum allowable bid is ${minBid} TON.`);
    } else if (amount > walletBalance) {
      setValidationError("Magnitude exceeds available wallet liquidity.");
    } else {
      setValidationError(null);
    }
  }, [bidAmount, minBid, walletBalance]);

  const bidInUsd = tonPrice ? (parseFloat(bidAmount) * tonPrice).toFixed(2) : '---';

  const handlePlaceBid = async () => {
    if (!userAddress) {
      addNotification("Connect wallet to place bid.", "warning");
      return;
    }

    if (validationError) {
      addNotification(validationError, "error");
      return;
    }

    /* Verify auction is still active */
    if (nft.auctionEndTime) {
      const isEnded = new Date(nft.auctionEndTime).getTime() <= Date.now();
      if (isEnded) {
        addNotification("This auction has expired. Bids are no longer being accepted.", "error");
        onClose();
        return;
      }
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
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-sm rounded-2xl bg-black/95 text-white shadow-[0_0_50px_rgba(37,99,235,0.15)] p-0 overflow-hidden backdrop-blur-3xl border-none">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-600"></div>
        <div className="p-6 relative">
          <DialogHeader className="flex flex-row justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                <Gavel className="h-4 w-4" />
              </div>
              <DialogTitle className="text-sm font-black uppercase tracking-widest text-foreground">Auction Bid Terminal</DialogTitle>
            </div>
            <button 
              onClick={onClose}
              className="p-1 text-muted-foreground hover:text-white rounded-full hover:bg-white/5 transition-colors absolute top-5 right-5"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          {/* Asset Preview Mini Banner */}
          <div className="mb-6 p-3 bg-white/5 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-900">
              <img src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)} alt={nft.title} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[7.5px] font-black uppercase tracking-[0.3em] text-blue-400 block mb-0.5">TARGET FREQUENCY</span>
              <h4 className="text-[11px] font-black uppercase tracking-wider text-white truncate m-0">{nft.title}</h4>
              <p className="text-[9px] font-bold text-muted-foreground tracking-tight m-0 truncate">By {nft.creator}</p>
            </div>
          </div>
          
          <div className="mb-6 space-y-3">
            <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">
              <span>CURRENT WATERMARK</span>
              <span>MINIMUM INCREMENT</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900/80 p-3 rounded-xl text-center">
                <p className="text-[14px] font-black text-foreground font-mono tracking-tight">{currentBid} <span className="text-[9px] font-bold text-muted-foreground">TON</span></p>
                <span className="text-[7px] font-bold text-muted-foreground/45 uppercase tracking-widest">High Offer</span>
              </div>
              <div className="bg-blue-500/5 p-3 rounded-xl text-center">
                <p className="text-[14px] font-black text-blue-400 font-mono tracking-tight">{minBid} <span className="text-[9px] font-bold text-blue-400/70">TON</span></p>
                <span className="text-[7px] font-bold text-blue-400/50 uppercase tracking-widest">Required</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex justify-between items-center px-1">
              <label className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 block">SPECIFY BID MAGNITUDE</label>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">Available:</span>
                <span className="text-[8px] font-black text-foreground font-mono">{walletBalance.toFixed(2)} TON</span>
              </div>
            </div>
            <div className="relative group">
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                step="0.1"
                className={cn(
                  "w-full bg-zinc-900/90 py-3.5 pl-4 pr-16 rounded-xl text-lg font-mono font-black text-white outline-none ring-offset-black transition-all text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                  validationError 
                    ? "ring-1 ring-red-500/50 bg-red-500/5 text-red-100" 
                    : "focus:ring-1 focus:ring-blue-500/20"
                )}
              />
              <span className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-wide",
                validationError ? "text-red-400" : "text-blue-400"
              )}>TON</span>
            </div>
            
            {validationError && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 rounded-lg border border-red-500/20 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-2.5 w-2.5 text-red-500" />
                <span className="text-[8px] font-bold text-red-500 uppercase tracking-wider">{validationError}</span>
              </div>
            )}
          </div>

          <button
            onClick={handlePlaceBid}
            disabled={isProcessing || (!!validationError && !!userAddress)}
            className={cn(
              "w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer",
              validationError && userAddress
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed grayscale"
                : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/10"
            )}>
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gavel className="h-4 w-4" />}
            {isProcessing ? 'BROADCASTING...' : 'PLACE BID VIA TON CONNECT'}
          </button>
        </div>
      </DialogContent>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmBid}
        title="Execute Bid Protocol?"
        description="Verify signal parameters before broadcasting to the TON blockchain relay."
        confirmText="Confirm & Broadcast"
        assetName={nft.title}
        assetImage={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)}
        tonAmount={bidAmount}
        networkFee="0.05"
        totalAmount={(parseFloat(bidAmount) + 0.05).toFixed(2)}
        fromAddress={userAddress}
        recipient={nft.owner}
        transactionType="Bid Execution"
      />
    </Dialog>
  );
};

export default BidModal;