import React, { useState } from 'react';
import { NFTItem } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { X, Tag, Gavel, Loader2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ConfirmationModal from './ConfirmationModal';

interface ManageNFTModalProps {
  nft: NFTItem;
  isOpen: boolean;
  onClose: () => void;
}

const ManageNFTModal: React.FC<ManageNFTModalProps> = ({ nft, isOpen, onClose }) => {
  const { updateNFT, addNotification } = useAudio();
  const [isUpdating, setIsUpdating] = useState(false);
  const [listingType, setListingType] = useState<'fixed' | 'auction'>(nft.listingType || 'fixed');
  const [newPrice, setNewPrice] = useState(nft.price);
  const [newEndDate, setNewEndDate] = useState(nft.auctionEndDate ? new Date(nft.auctionEndDate).toISOString().slice(0, 16) : '');
  const [duration, setDuration] = useState('7');
  const [isDelistConfirmOpen, setIsDelistConfirmOpen] = useState(false);

  const handleDelist = () => {
    setIsDelistConfirmOpen(true);
  };

  const confirmDelist = async () => {
    setIsUpdating(true);
    await updateNFT(nft.id, { listingType: undefined, price: '0', auctionEndDate: undefined });
    addNotification("Asset delisted successfully.", "success");
    setIsUpdating(false);
    onClose();
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    const updateData: any = {
      listingType: listingType,
      isAuction: listingType === 'auction',
      price: newPrice
    };

    if (listingType === 'auction') {
      const auctionEnd = newEndDate 
        ? new Date(newEndDate).toISOString() 
        : new Date(Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000).toISOString();
      updateData.auctionEndTime = auctionEnd;
      updateData.auctionEndDate = auctionEnd;
      addNotification("Auction updated successfully.", "success");
    } else {
      updateData.auctionEndTime = undefined;
      updateData.auctionEndDate = undefined;
      addNotification("Price updated successfully.", "success");
    }

    await updateNFT(nft.id, updateData);
    setIsUpdating(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-md bg-[#0A0A0B]/95 backdrop-blur-xl border border-white/5 rounded-[2px] p-4 shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white bg-white/5 p-1 rounded-[2px] transition-colors">
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-sm font-bold text-white uppercase tracking-tight mb-4">Manage_Protocol</h2>
            
            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setListingType('fixed')}
                  className={`flex-1 py-2.5 rounded-[2px] border transition-all flex flex-col items-center justify-center gap-1.5 ${listingType === 'fixed' ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10'}`}
                >
                  <Tag className="h-3.5 w-3.5" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Fixed_Sale</span>
                </button>
                <button
                  type="button"
                  onClick={() => setListingType('auction')}
                  className={`flex-1 py-2.5 rounded-[2px] border transition-all flex flex-col items-center justify-center gap-1.5 ${listingType === 'auction' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10'}`}
                >
                  <Gavel className="h-3.5 w-3.5" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Auction_Sync</span>
                </button>
              </div>

              {listingType === 'auction' ? (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="text-[7px] font-bold text-white/20 uppercase tracking-widest mb-1.5 block flex items-center gap-2">
                      Opening_Bid (TON)
                    </label>
                    <input 
                      type="number" 
                      value={newPrice} 
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-[2px] p-2 text-white text-xs outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[7px] font-bold text-white/20 uppercase tracking-widest mb-1.5 block flex items-center gap-2">
                      Protocol_Deadline
                    </label>
                    <input 
                      type="datetime-local" 
                      value={newEndDate} 
                      onChange={(e) => setNewEndDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-[2px] p-2 text-white text-[10px] outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <div className="flex gap-1.5 mt-2">
                      {['1', '3', '7', '14'].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            setDuration(d);
                            const date = new Date(Date.now() + parseInt(d) * 24 * 60 * 60 * 1000);
                            setNewEndDate(date.toISOString().slice(0, 16));
                          }}
                          className={`flex-1 py-1.5 rounded-[2px] text-[8px] font-bold transition-all ${duration === d ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                        >
                          {d}D
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[7px] font-bold text-white/20 uppercase tracking-widest mb-1.5 block flex items-center gap-2">
                    Target_Value (TON)
                  </label>
                  <input 
                    type="number" 
                    value={newPrice} 
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-[2px] p-2 text-white text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}
              
              <div className="flex gap-2 mt-6">
                <button 
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="flex-[2] py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[2px] font-bold text-[8px] uppercase tracking-widest transition-all"
                >
                  {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : 'Apply_Changes'}
                </button>
                <button 
                  onClick={handleDelist}
                  disabled={isUpdating}
                  className="flex-1 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-[2px] border border-red-500/20 font-bold text-[8px] uppercase tracking-widest transition-all"
                >
                  {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : 'Delist'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isDelistConfirmOpen}
        onClose={() => setIsDelistConfirmOpen(false)}
        onConfirm={confirmDelist}
        title="Delist NFT?"
        description="Are you sure you want to remove this NFT from the marketplace? It will be returned to your vault."
        confirmText="Delist NFT"
        variant="destructive"
      />
    </AnimatePresence>
  );
};

export default ManageNFTModal;
