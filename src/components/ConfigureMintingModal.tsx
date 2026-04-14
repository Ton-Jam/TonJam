import React, { useState } from 'react';
import { X, Gem, Coins, Layers, Zap } from 'lucide-react';
import { Track, RoyaltySplit } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { motion, AnimatePresence } from 'motion/react';
import RoyaltySplitManager from './RoyaltySplitManager';

interface ConfigureMintingModalProps {
  track: Track;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const ConfigureMintingModal: React.FC<ConfigureMintingModalProps> = ({ track, isOpen, onClose, onUpdate }) => {
  const { updateTrack, addNotification, userProfile } = useAudio();
  const [price, setPrice] = useState(track.price || '2.5');
  const [editions, setEditions] = useState(track.editions || '100');
  const [editionType, setEditionType] = useState(track.editionType || 'Limited');
  const [rarity, setRarity] = useState(track.rarity || 'Rare');
  const [royaltySplits, setRoyaltySplits] = useState<RoyaltySplit[]>(track.royaltySplits || []);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    // Validation
    const totalPercentage = royaltySplits.reduce((acc, split) => acc + (split.percentage * 100), 0);
    if (totalPercentage > 100) {
      addNotification("Total royalty percentage cannot exceed 100%", "error");
      return;
    }

    setIsSaving(true);
    try {
      await updateTrack(track.id, {
        price,
        editions,
        editionType,
        rarity,
        royaltySplits
      });
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating track minting options:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-[#0B0F14] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                <Gem className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest">Minting Protocol</h3>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Configure Artifact Options</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X className="w-5 h-5 text-white/40" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Track Info Preview */}
            <div className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5">
              <img src={track.coverUrl} className="w-12 h-12 rounded-xl object-cover" alt="" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-tight">{track.title}</h4>
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{track.genre}</p>
              </div>
            </div>

            {/* Price Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Protocol Price (TON)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Coins className="w-4 h-4 text-amber-500" />
                </div>
                <input 
                  type="text" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-amber-500/50 transition-colors"
                  placeholder="e.g. 2.5"
                />
              </div>
            </div>

            {/* Editions & Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Supply</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Layers className="w-4 h-4 text-cyan-500" />
                  </div>
                  <input 
                    type="text" 
                    value={editions}
                    onChange={(e) => setEditions(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-cyan-500/50 transition-colors"
                    placeholder="e.g. 100"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Edition Type</label>
                <select 
                  value={editionType}
                  onChange={(e) => setEditionType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold focus:outline-none focus:border-purple-500/50 transition-colors appearance-none"
                >
                  <option value="Standard">Standard</option>
                  <option value="Limited">Limited</option>
                  <option value="Unique">Unique</option>
                </select>
              </div>
            </div>

            {/* Rarity Tier */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Rarity Tier</label>
              <div className="grid grid-cols-4 gap-2">
                {['Common', 'Rare', 'Epic', 'Legendary'].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setRarity(tier)}
                    className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                      rarity === tier 
                        ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20' 
                        : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Royalty Splits */}
            <div className="pt-4 border-t border-white/5">
              <RoyaltySplitManager 
                splits={royaltySplits}
                onChange={setRoyaltySplits}
                collaborators={userProfile?.collaborators}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-white/[0.02] border-t border-white/5">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-4 bg-foreground text-background rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  Update Protocol
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfigureMintingModal;
