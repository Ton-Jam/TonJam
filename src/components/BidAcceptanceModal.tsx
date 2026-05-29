import React, { useState } from 'react';
import { X, Info, Loader2 } from 'lucide-react';
import { NFTItem, NFTOffer } from '@/types';
import { TON_LOGO, APP_LOGO } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { acceptBid } from '@/services/tonService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getPlaceholderImage } from '@/lib/utils';

interface BidAcceptanceModalProps {
  nft: NFTItem;
  offer: NFTOffer;
  onClose: () => void;
  onAccept: () => void;
}

const BidAcceptanceModal: React.FC<BidAcceptanceModalProps> = ({ nft, offer, onClose, onAccept }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { addNotification, updateNFT } = useAudio();
  const [tonConnectUI] = useTonConnectUI();

  const handleConfirm = async () => {
    setIsProcessing(true);
    addNotification("Initiating ownership transfer protocol...", "info");
    
    try {
      await acceptBid(tonConnectUI, offer.offerer);
      
      // Update NFT owner in Firestore
      await updateNFT(nft.id, { owner: offer.offerer });
      
      setIsProcessing(false);
      onAccept();
      onClose();
    } catch (e) {
      console.error(e);
      addNotification("Acceptance protocol aborted.", "error");
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-md p-0 overflow-hidden bg-card border border-border rounded-[4px] shadow-2xl">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-3xl rounded-full"></div>
        <div className="p-6 relative z-10">
          <DialogHeader className="flex flex-row items-center justify-between mb-6">
            <DialogTitle className="text-xl font-bold uppercase tracking-tighter text-foreground">Accept Offer</DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-4 p-4 bg-muted/50 border border-border/50 rounded-[4px] mb-6">
            <img src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)} className="w-20 h-20 rounded-[4px] object-cover" alt="" />
            <div>
              <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">{nft.title}</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">@{nft.creator}</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Offered By</span>
              <span className="text-xs font-bold text-blue-500 uppercase tracking-tight">@{offer.offerer}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Offer Amount</span>
              <div className="flex items-center gap-2">
                <img src={TON_LOGO} className="w-4 h-4" alt="" />
                <span className="text-xl font-bold text-foreground tracking-tighter">{offer.price} TON</span>
              </div>
            </div>
            <div className="p-4 bg-blue-500/5 rounded-[4px]">
              <div className="flex items-start gap-3">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-relaxed">
                  Accepting this offer will immediately transfer ownership of the asset to the offerer and release the funds to your wallet.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={handleConfirm} disabled={isProcessing} className="w-full py-4 bg-[linear-gradient(90deg,#007AFF_0%,#00C6FF_100%)] hover:opacity-90 text-white rounded-[4px] font-bold text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed" >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> PROCESSING...
                </span>
              ) : 'CONFIRM ACCEPTANCE'}
            </button>
            <button onClick={onClose} disabled={isProcessing} className="w-full py-4 bg-muted/50 text-muted-foreground hover:text-foreground rounded-[4px] font-bold text-[10px] uppercase tracking-widest transition-all" >
              CANCEL
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BidAcceptanceModal;
