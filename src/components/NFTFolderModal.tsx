import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NFTFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NFTFolderModal: React.FC<NFTFolderModalProps> = ({ isOpen, onClose }) => {
  const { createNFTFolder } = useAudio();
  const [folderName, setFolderName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    setIsSubmitting(true);
    try {
      await createNFTFolder(folderName.trim(), description.trim());
      setFolderName('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-sm rounded-2xl bg-black/95 text-white shadow-[0_0_50px_rgba(37,99,235,0.15)] p-0 overflow-hidden backdrop-blur-3xl border border-white/10">
        <div className="p-6">
          <DialogHeader className="flex flex-row justify-between items-center mb-6">
            <DialogTitle className="text-sm font-black uppercase tracking-widest text-foreground">Create Folder</DialogTitle>
            <button 
              onClick={onClose}
              className="p-1 text-muted-foreground hover:text-white rounded-full hover:bg-white/5 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Folder Name</label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="e.g., Rare Gems"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                required
                maxLength={30}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's in this folder?"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all min-h-[80px] resize-none"
                maxLength={100}
              />
            </div>

            <button
              type="submit"
              disabled={!folderName.trim() || isSubmitting}
              className={cn(
                "w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all mt-4",
                !folderName.trim() || isSubmitting
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 active:scale-[0.98]"
              )}
            >
              {isSubmitting ? 'Creating...' : 'Create Folder'}
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NFTFolderModal;
