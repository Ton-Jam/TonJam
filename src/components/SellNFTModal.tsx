import React, { useState } from 'react';
import { X, Tag, Gavel, Info, AlertTriangle } from 'lucide-react';
import { NFTItem } from '@/types';
import { TON_LOGO } from '@/constants';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { useAudio } from '@/context/AudioContext';
import LoadingOverlay from './LoadingOverlay';
import { listNFT } from '@/services/marketplaceService';

interface SellNFTModalProps {
  nft: NFTItem;
  onClose: () => void;
}

const SellNFTModal: React.FC<SellNFTModalProps> = ({ nft, onClose }) => {
  const { updateNFT, addNotification } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const [listingType, setListingType] = useState<'fixed' | 'auction'>('fixed');
  const [price, setPrice] = useState(nft.price || '5');
  const [duration, setDuration] = useState('7');
  const [newEndDate, setNewEndDate] = useState(() => {
    const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return date.toISOString().slice(0, 16);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAddress) {
      addNotification("Please connect your wallet to list this asset", "warning");
      tonConnectUI.openModal();
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (listingType === 'fixed') {
        await listNFT(tonConnectUI, nft, price);
        addNotification(`Asset listed for fixed price of ${price} TON.`, "success");
      } else {
        // Auction logic - simplified for now as marketplace contract handles it differently 
        // or we'd need another message type. Using mock for auction if not supported by contract
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const auctionEnd = newEndDate 
          ? new Date(newEndDate).toISOString() 
          : new Date(Date.now() + parseInt(duration || '7') * 24 * 60 * 60 * 1000).toISOString();

        updateNFT(nft.id, {
          listingType: listingType,
          isAuction: listingType === 'auction',
          price: price,
          auctionEndTime: listingType === 'auction' ? auctionEnd : undefined,
          auctionEndDate: listingType === 'auction' ? auctionEnd : undefined
        });
        addNotification(`Asset listed for auction.`, "success");
      }
      onClose();
    } catch (e) {
      console.error(e);
      addNotification("Failed to list asset on the marketplace.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 animate-in fade-in duration-300">
      <LoadingOverlay isVisible={isSubmitting} type="transaction" message="Listing on TON Blockchain..." />
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="relative w-full max-sm bg-black/90 backdrop-blur-md rounded-[2px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-white/10">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-3xl rounded-full"></div>
        <div className="p-3 flex items-center justify-between relative z-10 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[2px] bg-blue-600/20 flex items-center justify-center text-blue-400">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-tight">Initiate_listing</h2>
              <p className="text-[7px] font-bold text-white/20 uppercase tracking-widest">Asset Market Protocol</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/40 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded-[2px] bg-white/5" aria-label="Close Sell NFT Modal">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 space-y-3 relative z-10">
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={() => setListingType('fixed')}
              className={`flex-1 p-2.5 rounded-[2px] transition-all text-center space-y-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 border border-transparent ${listingType === 'fixed' ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
              aria-pressed={listingType === 'fixed'}
            >
              <Tag className="h-4 w-4 mx-auto" />
              <p className="text-[8px] font-bold uppercase tracking-widest">Fixed_Sale</p>
            </button>
            <button 
              type="button"
              onClick={() => setListingType('auction')}
              className={`flex-1 p-2.5 rounded-[2px] transition-all text-center space-y-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 border border-transparent ${listingType === 'auction' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
              aria-pressed={listingType === 'auction'}
            >
              <Gavel className="h-4 w-4 mx-auto" />
              <p className="text-[8px] font-bold uppercase tracking-widest">Auction_Sync</p>
            </button>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[7px] font-bold text-white/20 uppercase tracking-widest ml-1">
                {listingType === 'fixed' ? 'Target_Value' : 'Opening_Bid'}
              </label>
              <div className="relative">
                <img src={TON_LOGO} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" alt="TON" />
                <input 
                  type="number" 
                  step="0.1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-[2px] py-1.5 pl-9 pr-3 text-white font-bold outline-none focus-visible:ring-1 focus-visible:ring-blue-500 transition-all text-xs"
                  placeholder="0.00"
                  required
                  aria-label={listingType === 'fixed' ? 'Listing Price' : 'Starting Bid'}
                />
              </div>
            </div>

            {listingType === 'auction' && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[7px] font-bold text-white/20 uppercase tracking-widest ml-1">Protocol_Deadline</label>
                <input 
                  type="datetime-local" 
                  value={newEndDate} 
                  onChange={(e) => {
                    setNewEndDate(e.target.value);
                    setDuration(''); // Clear duration buttons when custom date is picked
                  }}
                  className="w-full bg-white/5 border border-white/5 rounded-[2px] py-1.5 px-2 text-white font-bold outline-none focus-visible:ring-1 focus-visible:ring-amber-500 transition-all text-[10px] mb-2"
                  aria-label="Auction End Date"
                />
                <div className="flex gap-1.5 mb-2">
                  {['1', '3', '7', '14'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setDuration(d);
                        const date = new Date(Date.now() + parseInt(d) * 24 * 60 * 60 * 1000);
                        setNewEndDate(date.toISOString().slice(0, 16));
                      }}
                      className={`flex-1 py-1.5 rounded-[2px] text-[8px] font-bold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 ${duration === d ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                      aria-pressed={duration === d}
                    >
                      {d}D
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-2 bg-blue-500/5 border border-blue-500/10 rounded-[2px] flex gap-2">
            <Info className="h-3.5 w-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-[7px] text-white/30 leading-relaxed uppercase tracking-widest">
              Network takes <span className="text-blue-400">2.5%</span> protocol fee. Royalties of <span className="text-white">{nft.royalty}%</span> applied on settlement.
            </p>
          </div>

          <div className="flex gap-2">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-1.5 rounded-[2px] font-bold text-[8px] uppercase tracking-[0.15em] text-white/40 bg-white/5 hover:bg-white/10 transition-all active:scale-95 border border-white/5"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`flex-[1.5] py-1.5 rounded-[2px] font-bold text-[8px] uppercase tracking-[0.15em] text-white transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500
                ${listingType === 'auction' ? 'bg-amber-500 hover:bg-amber-400 text-black focus-visible:ring-amber-500' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/10'}
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isSubmitting ? 'Processing...' : 'List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellNFTModal;
