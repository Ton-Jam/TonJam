import React, { useState } from 'react';
import { X, Loader2, Handshake } from 'lucide-react';
import { TON_LOGO } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import { NFTItem } from '@/types';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { db, auth, handleFirestoreError, OperationType } from "@/lib/firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import ConfirmationModal from './ConfirmationModal';

interface PlaceOfferModalProps {
  nft: NFTItem;
  onClose: () => void;
}

const PlaceOfferModal: React.FC<PlaceOfferModalProps> = ({ nft, onClose }) => {
  const { addNotification, updateNFT } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const [isProcessing, setIsProcessing] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handlePlaceOffer = async () => {
    if (!userAddress) {
      addNotification("Connect wallet to place offer.", "warning");
      return;
    }

    if (parseFloat(offerAmount) <= 0) {
      addNotification(`Offer must be greater than 0 TON`, "warning");
      return;
    }
    setIsConfirmOpen(true);
  };

  const confirmOffer = async () => {
    setIsConfirmOpen(false);
    setIsProcessing(true);
    addNotification("Broadcasting offer to neural relay...", "info");
    
    try {
      const offerId = `offer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const offerData = {
        id: offerId,
        nftId: nft.id,
        offerer: userAddress, // TON Address
        price: offerAmount,
        status: 'pending',
        createdAt: new Date().toISOString(),
        timestamp: serverTimestamp()
      };
      
      // Save to Firestore
      await setDoc(doc(db, "offers", offerId), offerData);
      
      const localOffer = {
        id: offerId,
        offerer: userAddress,
        price: offerAmount,
        timestamp: 'Just now',
        duration: 'Indefinite'
      };
      
      updateNFT(nft.id, { offers: [localOffer, ...(nft.offers || [])] });
      addNotification(`Offer of ${offerAmount} TON placed!`, "success");
      onClose();
    } catch (e) {
      console.error(e);
      handleFirestoreError(e, OperationType.CREATE, "offers");
      addNotification("Offer broadcast failed.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-sm rounded-[4px] bg-card shadow-2xl p-0 overflow-hidden border-none text-white">
        <div className="p-6">
          <DialogHeader className="flex flex-row justify-between items-center mb-6">
            <DialogTitle className="text-lg font-bold text-foreground">Make an Offer</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mb-6">
              <label className="text-xs font-medium text-muted-foreground">Offer Amount</label>
              <div className="relative">
                <input
                  type="number"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  step="0.1"
                  placeholder="0.0"
                  className="w-full bg-muted/50 py-3 px-4 rounded-[4px] text-lg font-bold text-foreground outline-none transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">TON</span>
              </div>
          </div>

          <button
            onClick={handlePlaceOffer}
            disabled={isProcessing}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-[4px] text-sm font-bold text-white shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Handshake className="h-4 w-4" />}
            {isProcessing ? 'PLACING OFFER...' : 'PLACE OFFER'}
          </button>
        </div>
      </DialogContent>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmOffer}
        title="Execute Offer Protocol?"
        description="Verify signal parameters before broadcasting to the TON blockchain relay."
        confirmText="Confirm & Broadcast"
        assetName={nft.title}
        assetImage={nft.imageUrl}
        tonAmount={offerAmount}
        networkFee="0.05"
        totalAmount={offerAmount ? (parseFloat(offerAmount) + 0.05).toFixed(2) : undefined}
        fromAddress={userAddress}
        recipient={nft.owner}
        transactionType="Offer Execution"
      />
    </Dialog>
  );
};

export default PlaceOfferModal;
