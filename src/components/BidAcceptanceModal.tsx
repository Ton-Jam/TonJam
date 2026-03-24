import React, { useState } from 'react';
import { X, Info, Loader2 } from 'lucide-react';
import { NFTItem, NFTOffer } from '@/types';
import { TON_LOGO, APP_LOGO } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { acceptBid } from '@/services/tonService';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-2 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative w-full max-w-md glass border border-border rounded-[10px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-3xl rounded-full"></div>
        <div className="p-2 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold uppercase tracking-tighter text-foreground">Accept Offer</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 p-2 bg-muted/50 border border-border/50 rounded-[10px] mb-2">
            <img src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)} className="w-16 h-16 rounded-[10px] object-cover" alt="" />
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">{nft.title}</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">@{nft.creator}</p>
            </div>
          </div>

          <div className="space-y-2 mb-2">
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
            <div className="p-2 bg-blue-500/5 rounded-[10px]">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-3" />
                <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest leading-relaxed">
                  Accepting this offer will immediately transfer ownership of the asset to the offerer and release the funds to your wallet.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button onClick={handleConfirm} disabled={isProcessing} className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-foreground rounded-[10px] font-bold text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed" >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <img src={APP_LOGO} className="w-4 h-4 object-contain animate-[spin_3s_linear_infinite] opacity-80" alt="Loading..." /> PROCESSING...
                </span>
              ) : 'CONFIRM ACCEPTANCE'}
            </button>
            <button onClick={onClose} disabled={isProcessing} className="w-full py-2 bg-muted/50 text-muted-foreground hover:text-foreground rounded-[10px] font-bold text-[10px] uppercase tracking-widest transition-all" >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidAcceptanceModal;
