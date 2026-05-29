import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Track } from '@/types';
import { GENRES } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import { Settings, Info, Music, Activity, HelpCircle } from 'lucide-react';

interface EditMetadataModalProps {
  track: Track;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const EditMetadataModal: React.FC<EditMetadataModalProps> = ({ track, isOpen, onClose, onUpdate }) => {
  const { updateTrack, addNotification } = useAudio();
  const [title, setTitle] = useState(track.title || '');
  const [genre, setGenre] = useState(track.genre || 'Electronic');
  const [bpm, setBpm] = useState(track.bpm ? track.bpm.toString() : '120');
  const [key, setKey] = useState(track.key || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(track.title || '');
      setGenre(track.genre || 'Electronic');
      setBpm(track.bpm ? track.bpm.toString() : '120');
      setKey(track.key || '');
    }
  }, [isOpen, track]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addNotification("Track title is required", "error");
      return;
    }

    const parsedBpm = parseInt(bpm, 10);
    if (isNaN(parsedBpm) || parsedBpm < 0) {
      addNotification("Please enter a valid positive number for BPM", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateTrack(track.id, {
        title: title.trim(),
        genre,
        bpm: parsedBpm,
        key: key.trim(),
      });
      if (onUpdate) {
        onUpdate();
      }
      onClose();
    } catch (error) {
      console.error("Failed to update track metadata:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent id="edit-metadata-dialog-content" className="max-w-md bg-[#0B0F14] border-none text-white p-0 overflow-hidden rounded-[4px] gap-0">
        <DialogHeader className="p-8 pb-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
              <Settings className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <DialogTitle id="edit-metadata-dialog-title" className="text-xl font-black uppercase tracking-tight">Edit Sonic Metadata</DialogTitle>
              <DialogDescription id="edit-metadata-dialog-desc" className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1">
                Refine technical and display attributes for "{track.title}"
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="edit-metadata-form" className="p-8 pt-4 space-y-6">
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="metadata-form-title" className="text-[10px] font-black text-white/60 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-cyan-500/60" /> Track Title
              </Label>
              <Input 
                id="metadata-form-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white/5 border-none h-12 rounded-2xl focus-visible:ring-1 focus-visible:ring-cyan-500/50 font-bold text-sm"
                placeholder="Enter track title"
                disabled={isSubmitting}
              />
            </div>

            {/* Genre & Key row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Genre Selection */}
              <div className="space-y-2">
                <Label htmlFor="metadata-form-genre" className="text-[10px] font-black text-white/60 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-500/60" /> Genre
                </Label>
                <Select value={genre} onValueChange={setGenre} disabled={isSubmitting}>
                  <SelectTrigger id="metadata-form-genre" className="bg-white/5 border-none h-12 rounded-2xl focus:ring-1 focus:ring-cyan-500/50 text-left font-bold text-white text-sm">
                    <SelectValue placeholder="Electronic" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0B0F14] border-white/5 text-white rounded-2xl">
                    {GENRES.map((g) => (
                      <SelectItem key={g.id} value={g.name} className="focus:bg-cyan-500 focus:text-black">
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Key Input */}
              <div className="space-y-2">
                <Label htmlFor="metadata-form-key" className="text-[10px] font-black text-white/60 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-cyan-500/60" /> Key
                </Label>
                <Input 
                  id="metadata-form-key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="bg-white/5 border-none h-12 rounded-2xl focus-visible:ring-1 focus-visible:ring-cyan-500/50 font-bold text-sm"
                  placeholder="e.g. 4A / C# Min"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* BPM Input */}
            <div className="space-y-2">
              <Label htmlFor="metadata-form-bpm" className="text-[10px] font-black text-white/60 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-500/60" /> Beats Per Minute (BPM)
              </Label>
              <Input 
                id="metadata-form-bpm"
                type="number"
                min="0"
                max="300"
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
                className="bg-white/5 border-none h-12 rounded-2xl focus-visible:ring-1 focus-visible:ring-cyan-500/50 font-bold text-sm"
                placeholder="120"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
            <Button
              id="metadata-form-cancel-btn"
              type="button"
              onClick={onClose}
              variant="ghost"
              className="h-12 rounded-2xl hover:bg-white/5 text-xs font-black uppercase tracking-widest text-white/60 hover:text-white"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              id="metadata-form-submit-btn"
              type="submit"
              className="h-12 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black uppercase tracking-widest transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Modifications"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMetadataModal;
