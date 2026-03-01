import React, { useState } from 'react';
import { X, Info, Loader2 } from 'lucide-react';
import { NFTItem, NFTOffer } from '@/types';
import { TON_LOGO, APP_LOGO } from '@/constants';
import { useAudio } from '@/context/AudioContext';

interface BidAcceptanceModalProps {
  nft: NFTItem;
  offer: NFTOffer;
  onClose: () => void;
  onAccept: () => void;
}

const BidAcceptanceModal: React.FC<BidAcceptanceModalProps> = ({ nft, offer, onClose, onAccept }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { addNotification } = useAudio();

  const handleConfirm = async () => {
    setIsProcessing(true);
    addNotification("Initiating ownership transfer protocol...", "info");
    /* Simulate blockchain transaction */
    setTimeout(() => {
      setIsProcessing(false);
      onAccept();
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative w-full max-w-md glass border border-blue-500/10 rounded-[10px] overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.1)] animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold uppercase tracking-tighter text-white">Accept Offer</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-[10px] mb-8">
            <img src={nft.imageUrl} className="w-16 h-16 rounded-[10px] object-cover" alt="" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">{nft.title}</h3>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">@{nft.creator}</p>
            </div>
          </div>

          <div className="space-y-6 mb-10">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Offered By</span>
              <span className="text-xs font-bold text-blue-500 uppercase tracking-tight">@{offer.offerer}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Offer Amount</span>
              <div className="flex items-center gap-2">
                <img src={TON_LOGO} className="w-4 h-4" alt="" />
                <span className="text-xl font-bold text-white tracking-tighter">{offer.price} TON</span>
              </div>
            </div>
            <div className="p-4 bg-blue-500/5 rounded-[10px]">
              <div className="flex items-start gap-3">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest leading-relaxed">
                  Accepting this offer will immediately transfer ownership of the asset to the offerer and release the funds to your wallet.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={handleConfirm} disabled={isProcessing} className="w-full py-5 electric-blue-bg text-white rounded-[10px] font-bold text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none" >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <img src={APP_LOGO} className="w-4 h-4 object-contain animate-[spin_3s_linear_infinite] opacity-80" alt="Loading..." /> PROCESSING...
                </span>
              ) : 'CONFIRM ACCEPTANCE'}
            </button>
            <button onClick={onClose} disabled={isProcessing} className="w-full py-4 bg-white/5 text-white/40 hover:text-white rounded-[10px] font-bold text-[10px] uppercase tracking-widest transition-all" >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidAcceptanceModal;
