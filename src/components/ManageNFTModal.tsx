import React, { useState } from 'react';
import { NFTItem } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { X, Tag, Gavel, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ManageNFTModalProps {
  nft: NFTItem;
  isOpen: boolean;
  onClose: () => void;
}

const ManageNFTModal: React.FC<ManageNFTModalProps> = ({ nft, isOpen, onClose }) => {
  const { updateNFT, addNotification } = useAudio();
  const [isUpdating, setIsUpdating] = useState(false);
  const [newPrice, setNewPrice] = useState(nft.price);

  const handleDelist = async () => {
    setIsUpdating(true);
    await updateNFT(nft.id, { listingType: undefined, price: '0' });
    addNotification("Asset delisted successfully.", "success");
    setIsUpdating(false);
    onClose();
  };

  const handleUpdatePrice = async () => {
    setIsUpdating(true);
    await updateNFT(nft.id, { price: newPrice });
    addNotification("Price updated successfully.", "success");
    setIsUpdating(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
            className="relative w-full max-w-md bg-card border border-border rounded-[24px] p-8"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-foreground uppercase tracking-tighter mb-6">Manage Listing</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">New Price (TON)</label>
                <input 
                  type="number" 
                  value={newPrice} 
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-[8px] p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={handleUpdatePrice}
                  disabled={isUpdating}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-[8px] font-bold text-[10px] uppercase tracking-widest transition-all"
                >
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Update Price'}
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
    </AnimatePresence>
  );
};

export default ManageNFTModal;
