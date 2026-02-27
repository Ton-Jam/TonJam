import React, { useState } from 'react';
import { X, Tag, Gavel, Info, AlertTriangle } from 'lucide-react';
import { NFTItem } from '@/types';
import { TON_LOGO } from '@/constants';
import { useAudio } from '@/context/AudioContext';

interface SellNFTModalProps {
  nft: NFTItem;
  onClose: () => void;
}

const SellNFTModal: React.FC<SellNFTModalProps> = ({ nft, onClose }) => {
  const { updateNFT, addNotification } = useAudio();
  const [listingType, setListingType] = useState<'fixed' | 'auction'>('fixed');
  const [price, setPrice] = useState(nft.price || '5');
  const [duration, setDuration] = useState('7');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      updateNFT(nft.id, {
        listingType: listingType,
        price: price,
        auctionEndTime: listingType === 'auction' ? new Date(Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000).toISOString() : undefined
      });
      addNotification(`Asset listed for ${listingType === 'auction' ? 'auction' : 'fixed price'}.`, "success");
      setIsSubmitting(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-lg bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">List Asset</h2>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Initiate Market Protocol</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="flex gap-4">
            <button 
              type="button"
              onClick={() => setListingType('fixed')}
              className={`flex-1 p-6 rounded-2xl border transition-all text-center space-y-2 ${listingType === 'fixed' ? 'bg-blue-600/10 border-blue-500 text-blue-500' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
            >
              <Tag className="h-6 w-6 mx-auto" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Fixed Price</p>
            </button>
            <button 
              type="button"
              onClick={() => setListingType('auction')}
              className={`flex-1 p-6 rounded-2xl border transition-all text-center space-y-2 ${listingType === 'auction' ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
            >
              <Gavel className="h-6 w-6 mx-auto" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Auction</p>
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">
                {listingType === 'fixed' ? 'Listing Price' : 'Starting Bid'}
              </label>
              <div className="relative">
                <img src={TON_LOGO} className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" alt="TON" />
                <input 
                  type="number" 
                  step="0.1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-blue-500/50 transition-all"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {listingType === 'auction' && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">Duration (Days)</label>
                <select 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white font-bold outline-none focus:border-amber-500/50 transition-all appearance-none"
                >
                  <option value="1" className="bg-neutral-900">1 Day</option>
                  <option value="3" className="bg-neutral-900">3 Days</option>
                  <option value="7" className="bg-neutral-900">7 Days</option>
                  <option value="14" className="bg-neutral-900">14 Days</option>
                </select>
              </div>
            )}
          </div>

          <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex gap-4">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-tight">
              TonJam takes a <span className="text-white">2.5%</span> marketplace fee. Artist royalties of <span className="text-white">{nft.royalty}%</span> will be deducted from the final sale.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] text-white transition-all active:scale-95 shadow-xl
              ${listingType === 'auction' ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'}
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
