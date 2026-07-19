import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Handshake, Zap, Music } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { Artist } from '@/types';
import { toast } from 'sonner';

interface CollabRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetArtist: Artist;
}

export const CollabRequestModal: React.FC<CollabRequestModalProps> = ({ isOpen, onClose, targetArtist }) => {
  const { userProfile, addCollabRequest } = useAudio();
  const [trackTitle, setTrackTitle] = useState('');
  const [description, setDescription] = useState('');
  const [proposedSplit, setProposedSplit] = useState(50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackTitle.trim() || !description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!userProfile) {
      toast.error('You must be logged in to send a collab request');
      return;
    }

    const newRequest = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: userProfile.uid,
      senderName: userProfile.name || userProfile.username || 'Unknown Artist',
      receiverId: targetArtist.uid,
      receiverName: targetArtist.name,
      status: 'pending' as const,
      proposedSplit,
      trackTitle,
      description,
      messages: [{
        id: Math.random().toString(36).substr(2, 9),
        senderId: userProfile.uid,
        senderName: userProfile.name || userProfile.username || 'Unknown Artist',
        text: description,
        timestamp: new Date().toISOString()
      }],
      createdAt: new Date().toISOString()
    };

    addCollabRequest(newRequest);
    toast.success('Collaboration request sent!');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-neutral-900 border-neutral-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-black uppercase tracking-widest text-cyan-400">
            <Handshake className="w-5 h-5" />
            Propose Collaboration
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Project / Track Title</label>
              <Input
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                placeholder="e.g. Neon Nights (Remix)"
                className="bg-neutral-800 border-neutral-700 text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Proposal & Vision</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the track, your vision, and why you want to collaborate..."
                className="bg-neutral-800 border-neutral-700 text-white h-24 resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                <span>Proposed Revenue Split</span>
                <span className="text-cyan-400">{proposedSplit}% for You / {100 - proposedSplit}% for {targetArtist.name}</span>
              </label>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={proposedSplit}
                onChange={(e) => setProposedSplit(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <p className="text-[10px] text-neutral-500">
                This will define the automated NFT revenue split if the track is minted.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="hover:bg-neutral-800 text-neutral-400">
              Cancel
            </Button>
            <Button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold">
              Send Request <Zap className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
