import React, { useState, useEffect } from 'react';
import { X, Folder, Loader2, CheckCircle2 } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { PlaylistFolder } from '@/types';
import { Button } from "@/components/ui/button";

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder?: PlaylistFolder; // If provided, we are in "Rename" mode
}

const FolderModal: React.FC<FolderModalProps> = ({ isOpen, onClose, folder }) => {
  const { createFolder, renameFolder, addNotification } = useAudio();
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (folder) {
      setTitle(folder.title);
    } else {
      setTitle('');
    }
  }, [folder, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addNotification("Please enter a folder title", "error");
      return;
    }

    setIsSaving(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (folder) {
      await renameFolder(folder.id, title);
    } else {
      await createFolder(title);
    }
    
    setIsSaving(false);
    setStep(2); // Success step
  };

  const resetAndClose = () => {
    setStep(1);
    setTitle('');
    onClose();
  };

  const isRenaming = !!folder;

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" onClick={resetAndClose}></div>
      
      <div className="relative w-full max-w-sm glass border-t sm:border border-white/10 bg-black rounded-t-[20px] sm:rounded-[10px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-500 flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        {/* Handle for mobile */}
        <div className="w-12 h-1 mx-auto my-2 rounded-full bg-white/10 sm:hidden" />

        {/* Header */}
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-black text-white tracking-tighter uppercase leading-none">
              {step === 2 ? (isRenaming ? 'Update Successful' : 'Folder Created') : (isRenaming ? 'Rename Vault' : 'New Library Vault')}
            </h2>
            <p className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mt-1.5">
              {step === 1 ? 'Configure Retrieval Parameters' : 'Protocol Established'}
            </p>
          </div>
          <button onClick={resetAndClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-6 overflow-y-auto custom-scrollbar">
          {step === 1 && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-3">
                <label className="text-[8px] font-black text-blue-500/50 uppercase tracking-[0.3em]">Vault Title // ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Folder className="h-4 w-4 text-blue-500/40" />
                  </div>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-[4px] p-4 pl-10 text-sm text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-white/10"
                    placeholder="Enter vault name..."
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <Button 
                  type="button" 
                  variant="ghost"
                  onClick={resetAndClose}
                  className="flex-1 rounded-[4px] border border-white/5 text-[10px] uppercase font-black tracking-widest"
                >
                  Terminate
                </Button>
                <Button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-[1.5] bg-blue-600 hover:bg-blue-500 text-white rounded-[4px] font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      {isRenaming ? 'Commit Updates' : 'Initialize Vault'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="py-4 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2 animate-in zoom-in duration-500 shadow-[0_0_30px_rgba(37,99,235,0.1)] border border-blue-500/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white tracking-tighter uppercase">Protocol established</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] max-w-xs leading-relaxed opacity-60">
                  Vault "{title}" has been synchronized with your library.
                </p>
              </div>
              <Button 
                onClick={resetAndClose}
                className="mt-4 w-full bg-blue-600 text-white rounded-[4px] font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all"
              >
                Close interface
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FolderModal;
