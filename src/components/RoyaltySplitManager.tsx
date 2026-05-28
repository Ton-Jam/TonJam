import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, Wallet, UserPlus } from 'lucide-react';
import { RoyaltySplit, Collaborator } from '@/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { motion } from 'motion/react';

interface RoyaltySplitManagerProps {
  splits: RoyaltySplit[];
  onChange: (splits: RoyaltySplit[]) => void;
  collaborators?: Collaborator[];
}

const RoyaltySplitManager: React.FC<RoyaltySplitManagerProps> = ({ splits, onChange, collaborators }) => {
  const [localSplits, setLocalSplits] = useState<RoyaltySplit[]>(splits && splits.length > 0 ? splits : []);
  const [totalPercentage, setTotalPercentage] = useState(0);

  const colors = [
    'bg-cyan-500', 
    'bg-purple-500', 
    'bg-pink-500', 
    'bg-amber-500', 
    'bg-emerald-500', 
    'bg-indigo-500', 
    'bg-rose-500', 
    'bg-blue-500'
  ];

  const maxCap = Math.max(100, totalPercentage);

  useEffect(() => {
    if (splits && JSON.stringify(splits) !== JSON.stringify(localSplits)) {
      setLocalSplits(splits);
    }
  }, [splits]);

  useEffect(() => {
    const total = localSplits.reduce((acc, split) => acc + (split.percentage * 100), 0);
    setTotalPercentage(total);
  }, [localSplits]);

  const addSplit = () => {
    if (totalPercentage >= 100) return;
    const newSplits = [...localSplits, { address: '', percentage: 0, label: '' }];
    setLocalSplits(newSplits);
    onChange(newSplits);
  };

  const addFromCollaborator = (collaborator: Collaborator) => {
    if (totalPercentage >= 100) return;
    // Check if already added
    if (localSplits.some(s => s.address === collaborator.address)) return;

    const newSplits = [...localSplits, { 
      address: collaborator.address, 
      percentage: 0, 
      label: `${collaborator.name} (${collaborator.role})` 
    }];
    setLocalSplits(newSplits);
    onChange(newSplits);
  };

  const removeSplit = (index: number) => {
    const newSplits = localSplits.filter((_, i) => i !== index);
    setLocalSplits(newSplits);
    onChange(newSplits);
  };

  const updateSplit = (index: number, field: keyof RoyaltySplit, value: string | number) => {
    const newSplits = localSplits.map((split, i) => {
      if (i === index) {
        if (field === 'percentage') {
          // Convert 0-100 input to 0-1 for storage if needed, but let's keep it consistent with types.ts comment
          // types.ts says: percentage: number; // e.g. 0.05 for 5%
          // So we convert from 0-100 to 0-1
          const numValue = parseFloat(value as string) || 0;
          return { ...split, [field]: numValue / 100 };
        }
        return { ...split, [field]: value };
      }
      return split;
    });
    setLocalSplits(newSplits);
    onChange(newSplits);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-black text-white/45 uppercase tracking-[0.2em]">Royalty Splits</Label>
          <div className={`text-[10px] font-black uppercase tracking-widest ${totalPercentage > 100 ? 'text-red-500' : 'text-cyan-500'}`}>
            Total: {totalPercentage.toFixed(1)}%
          </div>
        </div>

        {/* Dynamic Percentage Distribution Bar */}
        {localSplits.length > 0 && (
          <div className="space-y-2 p-3 bg-white/[0.02] rounded-2xl">
            <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden flex gap-[2px]">
              {localSplits.map((split, index) => {
                const pct = split.percentage * 100;
                if (pct <= 0) return null;
                const widthPercentage = (pct / maxCap) * 100;
                const colorClass = colors[index % colors.length];

                return (
                  <motion.div
                    key={`segment-${index}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPercentage}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                    className={`h-full ${colorClass} first:rounded-l-full last:rounded-r-full flex items-center justify-center text-[8px] font-black text-black select-none overflow-hidden`}
                    title={`${split.label || `Recipient ${index + 1}`}: ${pct.toFixed(1)}%`}
                  >
                    {widthPercentage >= 8 && (
                      <span className="truncate px-1 opacity-90 font-black">
                        {Math.round(pct)}%
                      </span>
                    )}
                  </motion.div>
                );
              })}
              {totalPercentage < 100 && (
                <motion.div
                  key="unallocated-segment"
                  initial={{ width: '100%' }}
                  animate={{ width: `${((100 - totalPercentage) / maxCap) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                  className="h-full bg-white/5 first:rounded-l-full last:rounded-r-full"
                  title={`Unallocated: ${(100 - totalPercentage).toFixed(1)}%`}
                />
              )}
            </div>

            {/* Dynamic Legend */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 pl-1">
              {localSplits.map((split, index) => {
                const pct = split.percentage * 100;
                const bulletColor = colors[index % colors.length];
                return (
                  <div key={`legend-${index}`} className="flex items-center gap-1 text-[8.5px] font-bold text-white/50">
                    <span className={`w-1.5 h-1.5 rounded-full ${bulletColor}`} />
                    <span className="truncate max-w-[80px]">{split.label || `Recipient ${index + 1}`}</span>
                    <span className="text-white/30 font-mono">({pct.toFixed(0)}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {collaborators && collaborators.length > 0 && (
        <div className="space-y-2">
          <Label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Quick Add Collaborators</Label>
          <div className="flex flex-wrap gap-2">
            {collaborators.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => addFromCollaborator(c)}
                disabled={localSplits.some(s => s.address === c.address) || totalPercentage >= 100}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-[10px] font-bold text-white/60 transition-all disabled:opacity-30"
              >
                <UserPlus className="w-3 h-3" />
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {localSplits.map((split, index) => (
          <div key={index} className="flex flex-col gap-3 p-4 bg-white/5 rounded-[3px] border border-white/5 relative group">
            <button 
              onClick={() => removeSplit(index)}
              className="absolute top-2 right-2 p-2 text-white/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Recipient Label</Label>
                <Input 
                  placeholder="e.g. Producer"
                  value={split.label || ''}
                  onChange={(e) => updateSplit(index, 'label', e.target.value)}
                  className="bg-white/5 border-white/10 text-xs h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Percentage (%)</Label>
                <Input 
                  type="number"
                  placeholder="0"
                  value={Math.round(split.percentage * 100)}
                  onChange={(e) => updateSplit(index, 'percentage', e.target.value)}
                  className="bg-white/5 border-white/10 text-xs h-10"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Wallet Address</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Wallet className="w-3.5 h-3.5 text-white/20" />
                </div>
                <Input 
                  placeholder="TON Wallet Address"
                  value={split.address}
                  onChange={(e) => updateSplit(index, 'address', e.target.value)}
                  className="bg-white/5 border-white/10 text-xs h-10 pl-10"
                />
              </div>
            </div>
          </div>
        ))}

        {totalPercentage > 100 && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold uppercase tracking-widest">
            <AlertCircle className="w-4 h-4" />
            Total percentage cannot exceed 100%
          </div>
        )}

        <Button 
          type="button"
          onClick={addSplit}
          disabled={totalPercentage >= 100}
          variant="outline"
          className="w-full border-dashed border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest h-12 rounded-2xl gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Recipient
        </Button>
      </div>
    </div>
  );
};

export default RoyaltySplitManager;
