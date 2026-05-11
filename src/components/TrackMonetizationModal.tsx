import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Track, RoyaltySplit } from '@/types';
import { GENRES } from '@/constants';
import RoyaltySplitManager from './RoyaltySplitManager';
import { useAudio } from '@/context/AudioContext';
import { Gem, Coins, Layers, Info } from 'lucide-react';

const metadataSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  genre: z.string().min(1, 'Genre is required'),
  price: z.string().min(1, 'Price is required'),
  supply: z.string().min(1, 'Supply is required'),
  royaltySplits: z.array(z.object({
    address: z.string().min(1, 'Address is required'),
    percentage: z.number().min(0).max(1),
    label: z.string().optional(),
  })),
});

type MetadataFormData = z.infer<typeof metadataSchema>;

interface TrackMonetizationModalProps {
  track: Track;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const TrackMonetizationModal: React.FC<TrackMonetizationModalProps> = ({ track, isOpen, onClose, onUpdate }) => {
  const { updateTrack, addNotification, userProfile } = useAudio();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MetadataFormData>({
    resolver: zodResolver(metadataSchema),
    defaultValues: {
      title: track.title,
      description: track.description || '',
      genre: track.genre || 'Electronic',
      price: track.price || '2.5',
      supply: track.editions || '100',
      royaltySplits: track.royaltySplits || [],
    },
  });

  const royaltySplits = watch('royaltySplits');

  useEffect(() => {
    if (isOpen) {
      reset({
        title: track.title,
        description: track.description || '',
        genre: track.genre || 'Electronic',
        price: track.price || '2.5',
        supply: track.editions || '100',
        royaltySplits: track.royaltySplits || [],
      });
    }
  }, [isOpen, track, reset]);

  const onSubmit = async (data: MetadataFormData) => {
    // Validation for total percentage
    const totalPercentage = data.royaltySplits.reduce((acc, split) => acc + (split.percentage * 100), 0);
    if (totalPercentage > 100) {
      addNotification("Total royalty percentage cannot exceed 100%", "error");
      return;
    }

    try {
      await updateTrack(track.id, {
        title: data.title,
        description: data.description,
        genre: data.genre,
        price: data.price,
        editions: data.supply,
        royaltySplits: data.royaltySplits,
      });
      addNotification("Metadata updated successfully", "success");
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating track metadata:", error);
      addNotification("Failed to update metadata", "error");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#0B0F14] border-none text-white p-0 overflow-hidden rounded-[32px] gap-0">
        <DialogHeader className="p-8 pb-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
              <Gem className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">Asset Monetization Configuration</DialogTitle>
              <DialogDescription className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1">
                Configure protocol parameters for "{track.title}"
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea className="max-h-[60vh] px-8 py-4">
            <div className="space-y-8 pb-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-cyan-500/50" />
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Base Identity</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-white/60 uppercase tracking-widest ml-1">Asset Title</Label>
                    <Input 
                      {...register('title')}
                      className="bg-white/5 border-none h-12 rounded-2xl focus-visible:ring-1 focus-visible:ring-cyan-500/50 font-bold"
                      placeholder="Enter track title"
                    />
                    {errors.title && <p className="text-red-500 text-[10px] font-bold uppercase mt-1">{errors.title.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-white/60 uppercase tracking-widest ml-1">Sonic Genre</Label>
                    <Select 
                      onValueChange={(value) => setValue('genre', value)} 
                      defaultValue={track.genre || 'Electronic'}
                    >
                      <SelectTrigger className="bg-white/5 border-none h-12 rounded-2xl focus:ring-1 focus:ring-cyan-500/50 font-bold">
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#15191C] border-none text-white rounded-2xl overflow-hidden">
                        {GENRES.map((g) => (
                          <SelectItem 
                            key={g.id} 
                            value={g.name}
                            className="focus:bg-cyan-500 focus:text-black font-bold text-xs uppercase tracking-widest py-3"
                          >
                            {g.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-white/60 uppercase tracking-widest ml-1">Protocol Description</Label>
                  <Textarea 
                    {...register('description')}
                    className="bg-white/5 border-none min-h-[100px] rounded-2xl focus-visible:ring-1 focus-visible:ring-cyan-500/50 font-medium resize-none"
                    placeholder="Describe the artifact and its exclusive benefits..."
                  />
                </div>
              </div>

              <Separator className="bg-white/5" />

              {/* Economy & Supply */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-4 h-4 text-amber-500/50" />
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Economic Parameters</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-white/60 uppercase tracking-widest ml-1">Mint Price (TON)</Label>
                    <div className="relative">
                      <Input 
                        {...register('price')}
                        className="bg-white/5 border-none h-12 rounded-2xl pl-4 focus-visible:ring-1 focus-visible:ring-amber-500/50 font-black text-amber-500"
                        placeholder="2.5"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-white/60 uppercase tracking-widest ml-1">Max Supply (Editions)</Label>
                    <div className="relative">
                      <Input 
                        {...register('supply')}
                        className="bg-white/5 border-none h-12 rounded-2xl pl-4 focus-visible:ring-1 focus-visible:ring-purple-500/50 font-black text-purple-400"
                        placeholder="100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-white/5" />

              {/* Royalty Distributions */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-pink-500/50" />
                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Revenue Distribution</h3>
                  </div>
                </div>
                
                <RoyaltySplitManager 
                  splits={royaltySplits}
                  onChange={(splits) => setValue('royaltySplits', splits)}
                  collaborators={userProfile?.collaborators}
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-8 pt-4 bg-white/[0.02]">
            <div className="flex items-center gap-3 w-full">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose}
                className="flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/5 hover:text-white"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-[2] h-14 rounded-2xl bg-cyan-500 text-black hover:bg-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(6,182,212,0.2)]"
              >
                {isSubmitting ? "Synchronizing..." : "Initialize Protocol"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TrackMonetizationModal;
