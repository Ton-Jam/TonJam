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
    
    const durationDays = parseInt(duration) || 7;
    updateNFT(nft.id, {
      listingType: listingType,
      isAuction: listingType === 'auction',
      price: price,
      auctionEndTime: listingType === 'auction' ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString() : undefined
    });
    addNotification(`Asset listed for ${listingType === 'auction' ? 'auction' : 'fixed price'}.`, "success");
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-sm glass border border-white/10 rounded-[10px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-3xl rounded-full"></div>
        <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-tight">List Asset</h2>
              <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Initiate Market Protocol</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 relative z-10">
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={() => setListingType('fixed')}
              className={`flex-1 p-4 rounded-[10px] border transition-all text-center space-y-2 ${listingType === 'fixed' ? 'bg-blue-600/10 border-blue-500 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
            >
              <Tag className="h-5 w-5 mx-auto" />
              <p className="text-[9px] font-bold uppercase tracking-widest">Fixed Price</p>
            </button>
            <button 
              type="button"
              onClick={() => setListingType('auction')}
              className={`flex-1 p-4 rounded-[10px] border transition-all text-center space-y-2 ${listingType === 'auction' ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
            >
              <Gavel className="h-5 w-5 mx-auto" />
              <p className="text-[9px] font-bold uppercase tracking-widest">Auction</p>
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">
                {listingType === 'fixed' ? 'Listing Price' : 'Starting Bid'}
              </label>
              <div className="relative">
                <img src={TON_LOGO} className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" alt="TON" />
                <input 
                  type="number" 
                  step="0.1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-[10px] py-3 pl-10 pr-4 text-white font-bold outline-none focus:border-blue-500/50 transition-all text-sm"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {listingType === 'auction' && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Duration (Days)</label>
                <div className="flex gap-2 mb-2">
                  {['1', '3', '7', '14'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`flex-1 py-1.5 rounded-[5px] text-[9px] font-bold transition-all ${duration === d ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                    >
                      {d}D
                    </button>
                  ))}
                </div>
                <input 
                  type="number"
                  min="1"
                  max="30"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-[10px] py-3 px-4 text-white font-bold outline-none focus:border-amber-500/50 transition-all text-sm"
                  placeholder="Enter custom days..."
                />
                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest px-1 mt-1">Protocol will automatically finalize after {duration} days.</p>
              </div>
            )}
          </div>

          <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-[10px] flex gap-3">
            <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-[9px] text-white/60 leading-relaxed uppercase tracking-widest">
              TonJam takes a <span className="text-white">2.5%</span> marketplace fee. Artist royalties of <span className="text-white">{nft.royalty}%</span> will be deducted from the final sale.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full py-4 rounded-[10px] font-bold text-[10px] uppercase tracking-[0.2em] text-white transition-all active:scale-95 shadow-xl
              ${listingType === 'auction' ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20 text-black' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'}
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
