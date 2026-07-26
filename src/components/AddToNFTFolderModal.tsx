import React, { useState } from 'react';
import { X, List, Check } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { NFTItem } from '@/types';
import { cn, getPlaceholderImage } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AddToNFTFolderModalProps {
  nft: NFTItem;
  isOpen: boolean;
  onClose: () => void;
  onCreateNew: () => void;
}

const AddToNFTFolderModal: React.FC<AddToNFTFolderModalProps> = ({ nft, isOpen, onClose, onCreateNew }) => {
  const { nftFolders, addNFTToFolder, removeNFTFromFolder } = useAudio();
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleFolder = async (folderId: string, isSaved: boolean) => {
    setIsProcessing(true);
    try {
      if (isSaved) {
        await removeNFTFromFolder(folderId, nft.id);
      } else {
        await addNFTToFolder(folderId, nft.id);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-sm rounded-2xl bg-black/95 text-white shadow-[0_0_50px_rgba(37,99,235,0.15)] p-0 overflow-hidden backdrop-blur-3xl border border-white/10">
        <div className="p-6">
          <DialogHeader className="flex flex-row justify-between items-center mb-6">
            <DialogTitle className="text-sm font-black uppercase tracking-widest text-foreground">Save to Collection</DialogTitle>
            <button 
              onClick={onClose}
              className="p-1 text-muted-foreground hover:text-white rounded-full hover:bg-white/5 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <div className="mb-6 p-3 bg-white/5 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-900">
              <img src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)} alt={nft.title} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-white truncate m-0">{nft.title}</h4>
              <p className="text-[9px] font-bold text-muted-foreground tracking-tight m-0 truncate">By {nft.creator}</p>
            </div>
          </div>

          <div className="space-y-2 mb-6 max-h-[300px] overflow-y-auto no-scrollbar">
            {nftFolders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">You don't have any collections yet.</p>
              </div>
            ) : (
              nftFolders.map(folder => {
                const isSaved = folder.nftIds.includes(nft.id);
                return (
                  <button
                    key={folder.id}
                    disabled={isProcessing}
                    onClick={() => toggleFolder(folder.id, isSaved)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors border border-transparent hover:border-white/10 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center">
                        <List className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-white block">{folder.name}</span>
                        <span className="text-[10px] text-muted-foreground">{folder.nftIds.length} items</span>
                      </div>
                    </div>
                    {isSaved ? (
                      <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-white/20 group-hover:border-white/40" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          <button
            onClick={() => {
              onClose();
              onCreateNew();
            }}
            className="w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-white border border-white/20 hover:bg-white/10 transition-all"
          >
            + New Collection
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToNFTFolderModal;
