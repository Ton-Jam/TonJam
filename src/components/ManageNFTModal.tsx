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
            className="relative w-full max-w-md bg-card border border-border rounded-[24px] p-4 shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-foreground uppercase tracking-tighter mb-4">Manage Listing</h2>
            
            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setListingType('fixed')}
                  className={`flex-1 py-3 rounded-[12px] border transition-all flex flex-col items-center justify-center gap-2 ${listingType === 'fixed' ? 'bg-blue-600/10 border-blue-500 text-blue-500' : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-muted'}`}
                >
                  <Tag className="h-4 w-4" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Fixed Price</span>
                </button>
                <button
                  type="button"
                  onClick={() => setListingType('auction')}
                  className={`flex-1 py-3 rounded-[12px] border transition-all flex flex-col items-center justify-center gap-2 ${listingType === 'auction' ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-muted'}`}
                >
                  <Gavel className="h-4 w-4" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Auction</span>
                </button>
              </div>

              {listingType === 'auction' ? (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block flex items-center gap-2">
                      <Tag className="w-3 h-3" /> Starting Bid (TON)
                    </label>
                    <input 
                      type="number" 
                      value={newPrice} 
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full bg-muted/50 border border-border rounded-[8px] p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Auction End Date
                    </label>
                    <input 
                      type="datetime-local" 
                      value={newEndDate} 
                      onChange={(e) => setNewEndDate(e.target.value)}
                      className="w-full bg-muted/50 border border-border rounded-[8px] p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <div className="flex gap-2 mt-2">
                      {['1', '3', '7', '14'].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            setDuration(d);
                            const date = new Date(Date.now() + parseInt(d) * 24 * 60 * 60 * 1000);
                            setNewEndDate(date.toISOString().slice(0, 16));
                          }}
                          className={`flex-1 py-2 rounded-[6px] text-[9px] font-bold transition-all ${duration === d ? 'bg-amber-500 text-black' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
                        >
                          {d}D
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block flex items-center gap-2">
                    <Tag className="w-3 h-3" /> New Price (TON)
                  </label>
                  <input 
                    type="number" 
                    value={newPrice} 
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-[8px] p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              
              <div className="flex gap-2 mt-6">
                <button 
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-[8px] font-bold text-[10px] uppercase tracking-widest transition-all"
                >
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Update Listing'}
                </button>
                <button 
                  onClick={handleDelist}
                  disabled={isUpdating}
                  className="flex-1 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-[8px] font-bold text-[10px] uppercase tracking-widest transition-all"
                >
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Delist'}
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
