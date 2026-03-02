import React, { useState } from 'react';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { TON_LOGO, APP_LOGO } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import { NFTItem } from '@/types';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { buyNFT } from '@/services/tonService';

interface BuyNFTModalProps {
  nft: NFTItem;
  onClose: () => void;
}

const BuyNFTModal: React.FC<BuyNFTModalProps> = ({ nft, onClose }) => {
  const { addNotification, updateNFT, addUserNFT, recordTransaction } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const [isProcessing, setIsProcessing] = useState(false);
  const price = parseFloat(nft.price) || 0;
  const platformFeeFromBuyer = price * 0.05;
  const platformFeeFromSeller = price * 0.05;
  const totalPlatformFee = platformFeeFromBuyer + platformFeeFromSeller;
  const gasFee = 0.05;
  const total = (price + platformFeeFromBuyer + gasFee).toFixed(2);
  const artistShare = (price - platformFeeFromSeller).toFixed(2);

  const handlePurchase = async () => {
    if (!userAddress) {
      addNotification("Connect wallet to initialize sync.", "warning");
      return;
    }
    setIsProcessing(true);
    addNotification("Requesting wallet signature...", "info");
    try {
      await buyNFT(tonConnectUI, nft.owner, nft.price, nft.title);
      
      const updatedNFT = {
        ...nft,
        owner: userAddress,
        listingType: undefined,
        price: nft.price
      };

      // Record the transaction for royalty distribution
      recordTransaction({
        type: 'nft_sale',
        amount: price.toString(),
        platformFee: totalPlatformFee.toFixed(4),
        artistShare: artistShare,
        recipientAddress: nft.owner, // Current owner gets the share
        senderAddress: userAddress,
        nftId: nft.id,
        trackTitle: nft.title
      });

      // Update global state silently so we can show a custom success message
      updateNFT(nft.id, { 
        owner: userAddress, 
        listingType: undefined 
      }, true);
      
      addUserNFT(updatedNFT, true);
      
      addNotification("Asset successfully synced to vault.", "success");
      onClose();
    } catch (e) {
      console.error(e);
      addNotification("Sync protocol aborted.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative glass w-full max-w-sm rounded-[10px] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-3xl rounded-full"></div>
        <div className="p-8 relative z-10">
          <header className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold uppercase tracking-tighter text-white">Purchase Asset</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40">
              <X className="h-4 w-4" />
            </button>
          </header>
          <div className="flex items-center gap-4 mb-8 p-4 bg-white/5 border border-white/5 rounded-[10px] ">
            <img src={nft.imageUrl} className="w-16 h-16 rounded-[10px] object-cover" alt="" />
            <div>
              <p className="text-[10px] font-bold text-white uppercase truncate w-32">{nft.title}</p>
              <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-1">Creator: {nft.creator}</p>
            </div>
          </div>
          <div className="space-y-4 mb-8 bg-black/50 border border-white/5 p-6 rounded-[10px] ">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
              <span className="text-white/30">Asset Price</span>
              <span className="text-white">{price} TON</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
              <span className="text-white/30">Platform Fee (5% Buyer)</span>
              <span className="text-blue-400">+{platformFeeFromBuyer.toFixed(2)} TON</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
              <span className="text-white/30">Network Gas (est)</span>
              <span className="text-white/60">~{gasFee} TON</span>
            </div>
            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Total Required</span>
              <div className="flex items-center gap-2">
                <img src={TON_LOGO} className="w-4 h-4" alt="" />
                <span className="text-2xl font-bold text-white tracking-tighter">{total}</span>
              </div>
            </div>
            <div className="pt-2 flex justify-between items-center text-[8px] font-bold uppercase tracking-widest text-white/20">
              <span>Artist Receive (Price - 5% Fee)</span>
              <span>{artistShare} TON</span>
            </div>
          </div>
          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-[10px] text-[10px] font-bold uppercase tracking-widest text-white shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
            {isProcessing ? <img src={APP_LOGO} className="w-4 h-4 object-contain animate-[spin_3s_linear_infinite] opacity-80" alt="Loading..." /> : <CheckCircle2 className="h-4 w-4" />}
            {isProcessing ? 'SYNCING...' : 'CONFIRM PURCHASE'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyNFTModal;