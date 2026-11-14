import React, { useState } from 'react';
import { X, Info, Loader2 } from 'lucide-react';
import { NFTItem, NFTOffer } from '@/types';
import { TON_LOGO, APP_LOGO } from '@/constants';
import { useAudio } from '@/contexts/AudioContext';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { acceptBid, validateTonAddress, TONJAM_MARKETPLACE_ADDRESS, waitForTransactionConfirmation } from '@/services/tonService';
import ConfirmationModal from './ConfirmationModal';
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
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { addNotification, updateNFT } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();

  const handleOpenConfirm = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setIsConfirmOpen(false);
    setIsProcessing(true);

    // 1. Validate Offer and Listing
    if (!offer || !offer.price || !offer.offerer) {
      addNotification("Invalid offer details.", "error");
      setIsProcessing(false);
      return;
    }

    const offerPrice = parseFloat(offer.price);
    if (isNaN(offerPrice) || offerPrice <= 0) {
      addNotification("Invalid offer amount. Must be greater than 0 TON.", "error");
      setIsProcessing(false);
      return;
    }

    if (!validateTonAddress(offer.offerer)) {
      addNotification("Offerer address is not a valid TON address format.", "error");
      setIsProcessing(false);
      return;
    }

    // 2. Validate Connected Wallet matches NFT Seller/Owner
    if (!userAddress) {
      addNotification("Please connect your TON wallet.", "warning");
      tonConnectUI.openModal();
      setIsProcessing(false);
      return;
    }

    const currentOwner = nft.owner || nft.ownerId || '';
    if (currentOwner && currentOwner !== userAddress && !currentOwner.toLowerCase().includes(userAddress.toLowerCase())) {
      addNotification("Unauthorized: Connected wallet does not match the current verified owner of this NFT.", "error");
      setIsProcessing(false);
      return;
    }

    // 3. Verify Contract Destination / Settlement Support
    const settlementContract = nft.contractAddress || TONJAM_MARKETPLACE_ADDRESS;
    if (!settlementContract || !validateTonAddress(settlementContract)) {
      addNotification(
        "On-chain escrow contract is not configured on this network. Direct offer acceptance is paused until contract settlement is active.",
        "warning"
      );
      setIsProcessing(false);
      return;
    }

    addNotification("Initiating on-chain offer settlement protocol...", "info");

    try {
      // 4. Submit genuine contract transaction to the settlement contract
      const result = await acceptBid(tonConnectUI, settlementContract);

      addNotification("Transaction broadcast. Waiting for on-chain settlement confirmation...", "info");

      // 5. Wait for on-chain block confirmation before synchronizing Firestore
      const isConfirmed = await waitForTransactionConfirmation(settlementContract, 30000, 3000);

      if (!isConfirmed) {
        addNotification(
          `Transaction submitted (Hash: ${result.txHash.slice(0, 10)}...), but pending block inclusion. Ownership will update upon confirmation.`,
          "info"
        );
      } else {
        // 6. Synchronize Firestore ONLY after verified blockchain settlement
        await updateNFT(nft.id, { owner: offer.offerer, ownerId: offer.offerer });
        addNotification("Offer successfully accepted and settled on TON blockchain!", "success");
      }

      setIsProcessing(false);
      onAccept();
      onClose();
    } catch (e: any) {
      console.error("[BidAcceptanceModal] Acceptance failed:", e);
      addNotification(e.message || "Acceptance protocol failed or was rejected by wallet.", "error");
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-full max-w-md p-0 overflow-hidden bg-card border-none rounded-[16px] shadow-2xl">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-3xl rounded-full"></div>
          <div className="p-6 relative z-10">
            <DialogHeader className="flex flex-row items-center justify-between mb-6">
              <DialogTitle className="text-xl font-bold uppercase tracking-tighter text-foreground">Accept Offer</DialogTitle>
            </DialogHeader>

            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-[12px] mb-6">
              <img src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)} className="w-20 h-20 rounded-[8px] object-cover" alt="" />
              <div>
                <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">{nft.title}</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">@{nft.creator}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Offered By</span>
                <span className="text-xs font-bold text-blue-500 uppercase tracking-tight">@{offer.offerer}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Offer Amount</span>
                <div className="flex items-center gap-2">
                  <img src={TON_LOGO} className="w-4 h-4" alt="" />
                  <span className="text-xl font-bold text-foreground tracking-tighter">{offer.price} TON</span>
                </div>
              </div>
              <div className="p-4 bg-blue-500/5 rounded-[12px]">
                <div className="flex items-start gap-3">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-relaxed">
                    Accepting this offer will transfer ownership of "{nft.title}" to the offerer and release the funds to your wallet.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleOpenConfirm} 
                disabled={isProcessing} 
                className="w-full py-4 bg-[linear-gradient(90deg,#007AFF_0%,#00C6FF_100%)] hover:opacity-90 text-white rounded-[12px] font-bold text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> PROCESSING...
                  </span>
                ) : 'REVIEW & ACCEPT OFFER'}
              </button>
              <button 
                onClick={onClose} 
                disabled={isProcessing} 
                className="w-full py-4 bg-muted/50 text-muted-foreground hover:text-foreground rounded-[12px] font-bold text-[10px] uppercase tracking-widest transition-all"
              >
                CANCEL
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
        title="Confirm Offer Acceptance"
        description={`Are you sure you want to sell "${nft.title}" to @${offer.offerer} for ${offer.price} TON? This will initiate the blockchain ownership transfer.`}
        confirmText="Confirm & Sell NFT"
        assetName={nft.title}
        assetImage={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)}
        tonAmount={offer.price}
        networkFee="0.05"
        totalAmount={(parseFloat(offer.price || "0") + 0.05).toFixed(2)}
        fromAddress={userAddress}
        recipient={offer.offerer}
        transactionType="NFT Offer Acceptance / Sale"
      />
    </>
  );
};

export default BidAcceptanceModal;
