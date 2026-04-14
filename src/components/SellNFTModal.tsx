import React, { useState } from 'react';
import { X, Tag, Gavel, Info, AlertTriangle } from 'lucide-react';
import { NFTItem } from '@/types';
import { TON_LOGO } from '@/constants';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { useAudio } from '@/context/AudioContext';

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
    
    // Simulate transaction delay for listing
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
    addNotification(`Asset listed for ${listingType === 'auction' ? 'auction' : 'fixed price'}.`, "success");
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="relative w-full max-sm bg-white/5 backdrop-blur-md rounded-[24px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 blur-3xl rounded-full"></div>
        <div className="p-2 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-tight">List Asset</h2>
              <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Initiate Market Protocol</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full bg-white/5" aria-label="Close Sell NFT Modal">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-2 space-y-2 relative z-10">
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={() => setListingType('fixed')}
              className={`flex-1 p-2 rounded-[16px] transition-all text-center space-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${listingType === 'fixed' ? 'bg-blue-600/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
              aria-pressed={listingType === 'fixed'}
            >
              <Tag className="h-5 w-5 mx-auto" />
              <p className="text-[9px] font-bold uppercase tracking-widest">Fixed Price</p>
            </button>
            <button 
              type="button"
              onClick={() => setListingType('auction')}
              className={`flex-1 p-2 rounded-[16px] transition-all text-center space-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${listingType === 'auction' ? 'bg-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
              aria-pressed={listingType === 'auction'}
            >
              <Gavel className="h-5 w-5 mx-auto" />
              <p className="text-[9px] font-bold uppercase tracking-widest">Auction</p>
            </button>
          </div>

          <div className="space-y-2">
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-2">
                {listingType === 'fixed' ? 'Listing Price' : 'Starting Bid'}
              </label>
              <div className="relative">
                <img src={TON_LOGO} className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" alt="TON" />
                <input 
                  type="number" 
                  step="0.1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-white/5 rounded-[12px] py-2 pl-2 pr-2 text-white font-bold outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all text-sm"
                  placeholder="0.00"
                  required
                  aria-label={listingType === 'fixed' ? 'Listing Price' : 'Starting Bid'}
                />
              </div>
            </div>

            {listingType === 'auction' && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-2">Auction End Date</label>
                <input 
                  type="datetime-local" 
                  value={newEndDate} 
                  onChange={(e) => {
                    setNewEndDate(e.target.value);
                    setDuration(''); // Clear duration buttons when custom date is picked
                  }}
                  className="w-full bg-white/5 rounded-[12px] py-2 px-2 text-white font-bold outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-all text-sm mb-2"
                  aria-label="Auction End Date"
                />
                <div className="flex gap-2 mb-2">
                  {['1', '3', '7', '14'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setDuration(d);
                        const date = new Date(Date.now() + parseInt(d) * 24 * 60 * 60 * 1000);
                        setNewEndDate(date.toISOString().slice(0, 16));
                      }}
                      className={`flex-1 py-3 rounded-[8px] text-[9px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${duration === d ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                      aria-pressed={duration === d}
                    >
                      {d}D
                    </button>
                  ))}
                </div>
                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest px-2 mt-2">Protocol will automatically finalize on the selected date.</p>
              </div>
            )}
          </div>

          <div className="p-2 bg-blue-500/10 rounded-[12px] flex gap-2">
            <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-3" />
            <p className="text-[9px] text-white/40 leading-relaxed uppercase tracking-widest">
              TonJam takes a <span className="text-white">2.5%</span> marketplace fee. Artist royalties of <span className="text-white">{nft.royalty}%</span> will be deducted from the final sale.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full py-2 rounded-[12px] font-bold text-[10px] uppercase tracking-[0.2em] text-white transition-all active:scale-95 shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              ${listingType === 'auction' ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20 text-black focus-visible:ring-amber-500' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'}
              ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isSubmitting ? 'Processing...' : `Confirm ${listingType === 'auction' ? 'Auction' : 'Listing'}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellNFTModal;
