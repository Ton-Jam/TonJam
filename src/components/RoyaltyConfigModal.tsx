import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Info, Percent, Wallet, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Artist, RoyaltySplit } from '@/types';
import { useAudio } from '@/context/AudioContext';

interface RoyaltyConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  artist: Artist;
}

const RoyaltyConfigModal: React.FC<RoyaltyConfigModalProps> = ({ isOpen, onClose, artist }) => {
  const { updateRoyaltyConfig } = useAudio();
  const [streamingSplits, setStreamingSplits] = useState<RoyaltySplit[]>([]);
  const [nftSaleSplits, setNftSaleSplits] = useState<RoyaltySplit[]>([]);

  useEffect(() => {
    if (artist.royaltyConfig) {
      setStreamingSplits([...artist.royaltyConfig.streamingSplits]);
      setNftSaleSplits([...artist.royaltyConfig.nftSaleSplits]);
    } else {
      // Default splits if none exist
      const defaultSplit = { address: artist.walletAddress || '', percentage: 0.05, label: 'Main Artist' };
      setStreamingSplits([defaultSplit]);
      setNftSaleSplits([{ ...defaultSplit, percentage: 0.10 }]);
    }
  }, [artist, isOpen]);

  const handleAddSplit = (type: 'streaming' | 'nft') => {
    const newSplit: RoyaltySplit = { address: '', percentage: 0, label: '' };
    if (type === 'streaming') {
      setStreamingSplits([...streamingSplits, newSplit]);
    } else {
      setNftSaleSplits([...nftSaleSplits, newSplit]);
    }
  };

  const handleRemoveSplit = (type: 'streaming' | 'nft', index: number) => {
    if (type === 'streaming') {
      setStreamingSplits(streamingSplits.filter((_, i) => i !== index));
    } else {
      setNftSaleSplits(nftSaleSplits.filter((_, i) => i !== index));
    }
  };

  const handleUpdateSplit = (type: 'streaming' | 'nft', index: number, updates: Partial<RoyaltySplit>) => {
    if (type === 'streaming') {
      const newSplits = [...streamingSplits];
      newSplits[index] = { ...newSplits[index], ...updates };
      setStreamingSplits(newSplits);
    } else {
      const newSplits = [...nftSaleSplits];
      newSplits[index] = { ...newSplits[index], ...updates };
      setNftSaleSplits(newSplits);
    }
  };

  const handleSave = () => {
    // Basic validation: total percentage should not exceed 100% (1.0)
    const totalStreaming = streamingSplits.reduce((acc, s) => acc + s.percentage, 0);
    const totalNft = nftSaleSplits.reduce((acc, s) => acc + s.percentage, 0);

    if (totalStreaming > 1 || totalNft > 1) {
      alert("Total percentage cannot exceed 100%");
      return;
    }

    updateRoyaltyConfig(artist.id, {
      streamingSplits,
      nftSaleSplits
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-xl"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[#0A0A0A] border border-border rounded-[12px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-foreground/[0.02] border-b border-border/50 p-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              <h2 className="text-[10px] font-bold text-foreground uppercase tracking-[0.4em]">
                Protocol_Config: Royalty_Splits
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Close Royalty Config Modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-8 overflow-y-auto no-scrollbar">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground tracking-tighter uppercase mb-2">
                Revenue Architecture
              </h1>
              <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                Configure automated distribution protocols for streaming and secondary sales.
              </p>
            </div>

            {/* Streaming Splits */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Percent className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Streaming Royalties</h3>
                </div>
                <button 
                  onClick={() => handleAddSplit('streaming')}
                  className="flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted border border-border rounded-[6px] transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Add Streaming Recipient"
                >
                  <Plus className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
                  <span className="text-[9px] font-bold text-muted-foreground group-hover:text-foreground uppercase tracking-widest">Add Recipient</span>
                </button>
              </div>

              <div className="space-y-4">
                {streamingSplits.map((split, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_100px_40px] gap-4 items-end bg-foreground/[0.02] border border-border/50 p-4 rounded-[8px]">
                    <div className="space-y-2">
                      <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest ml-1">Label / Role</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50" />
                        <input
                          type="text"
                          value={split.label}
                          onChange={(e) => handleUpdateSplit('streaming', index, { label: e.target.value })}
                          placeholder="e.g. Producer"
                          className="w-full bg-muted/50 border border-border rounded-[6px] py-2 pl-10 pr-4 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
                          aria-label={`Streaming Split Label ${index + 1}`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest ml-1">Wallet Address</label>
                      <div className="relative">
                        <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50" />
                        <input
                          type="text"
                          value={split.address}
                          onChange={(e) => handleUpdateSplit('streaming', index, { address: e.target.value })}
                          placeholder="UQ..."
                          className="w-full bg-muted/50 border border-border rounded-[6px] py-2 pl-10 pr-4 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all font-mono"
                          aria-label={`Streaming Split Wallet Address ${index + 1}`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest ml-1">Share (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={split.percentage * 100}
                          onChange={(e) => handleUpdateSplit('streaming', index, { percentage: parseFloat(e.target.value) / 100 })}
                          className="w-full bg-muted/50 border border-border rounded-[6px] py-2 px-4 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
                          aria-label={`Streaming Split Percentage ${index + 1}`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/50">%</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveSplit('streaming', index)}
                      className="p-2.5 rounded-[6px] bg-neutral-500/5 hover:bg-neutral-500/10 text-neutral-500/40 hover:text-neutral-500 transition-all border border-neutral-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
                      aria-label={`Remove Streaming Split ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* NFT Sale Splits */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Info className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">NFT Secondary Sales</h3>
                </div>
                <button 
                  onClick={() => handleAddSplit('nft')}
                  className="flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted border border-border rounded-[6px] transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Add NFT Recipient"
                >
                  <Plus className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
                  <span className="text-[9px] font-bold text-muted-foreground group-hover:text-foreground uppercase tracking-widest">Add Recipient</span>
                </button>
              </div>

              <div className="space-y-4">
                {nftSaleSplits.map((split, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_100px_40px] gap-4 items-end bg-foreground/[0.02] border border-border/50 p-4 rounded-[8px]">
                    <div className="space-y-2">
                      <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest ml-1">Label / Role</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50" />
                        <input
                          type="text"
                          value={split.label}
                          onChange={(e) => handleUpdateSplit('nft', index, { label: e.target.value })}
                          placeholder="e.g. Manager"
                          className="w-full bg-muted/50 border border-border rounded-[6px] py-2 pl-10 pr-4 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
                          aria-label={`NFT Split Label ${index + 1}`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest ml-1">Wallet Address</label>
                      <div className="relative">
                        <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50" />
                        <input
                          type="text"
                          value={split.address}
                          onChange={(e) => handleUpdateSplit('nft', index, { address: e.target.value })}
                          placeholder="UQ..."
                          className="w-full bg-muted/50 border border-border rounded-[6px] py-2 pl-10 pr-4 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all font-mono"
                          aria-label={`NFT Split Wallet Address ${index + 1}`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest ml-1">Share (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={split.percentage * 100}
                          onChange={(e) => handleUpdateSplit('nft', index, { percentage: parseFloat(e.target.value) / 100 })}
                          className="w-full bg-muted/50 border border-border rounded-[6px] py-2 px-4 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
                          aria-label={`NFT Split Percentage ${index + 1}`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/50">%</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveSplit('nft', index)}
                      className="p-2.5 rounded-[6px] bg-neutral-500/5 hover:bg-neutral-500/10 text-neutral-500/40 hover:text-neutral-500 transition-all border border-neutral-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
                      aria-label={`Remove NFT Split ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="bg-foreground/[0.02] border-t border-border/50 p-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Total Streaming</span>
                <span className={`text-[10px] font-mono font-bold ${streamingSplits.reduce((acc, s) => acc + s.percentage, 0) > 1 ? 'text-red-500' : 'text-blue-500'}`}>
                  {(streamingSplits.reduce((acc, s) => acc + s.percentage, 0) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-px h-8 bg-muted/50"></div>
              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Total NFT Share</span>
                <span className={`text-[10px] font-mono font-bold ${nftSaleSplits.reduce((acc, s) => acc + s.percentage, 0) > 1 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {(nftSaleSplits.reduce((acc, s) => acc + s.percentage, 0) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={onClose}
                className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-3 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-foreground rounded-[6px] font-bold text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Save className="h-3 w-3" />
                Commit Changes
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RoyaltyConfigModal;
