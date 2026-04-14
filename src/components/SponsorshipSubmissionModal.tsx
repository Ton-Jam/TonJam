import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Rocket, Image as ImageIcon, Link as LinkIcon, Music, Gem, Coins } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { SponsoredContent } from '@/types';
import { toast } from 'sonner';

interface SponsorshipSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SponsorshipSubmissionModal: React.FC<SponsorshipSubmissionModalProps> = ({ isOpen, onClose }) => {
  const { submitSponsorship, allTracks, allNFTs } = useAudio();
  const [formData, setFormData] = useState<Partial<SponsoredContent>>({
    type: 'track',
    title: '',
    description: '',
    imageUrl: '',
    targetId: '',
    paymentAmount: '10',
    paymentCurrency: 'TON',
    durationDays: 7
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      toast.error("Please fill in all required fields");
      return;
    }
    await submitSponsorship(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#0a0a0a] border-none shadow-2xl rounded-[32px] p-0 overflow-hidden">
        <div className="relative p-6 space-y-6">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black uppercase tracking-tight text-white">Sponsorship Protocol</DialogTitle>
                <DialogDescription className="text-xs text-white/40">Promote your sonic artifacts to the global network.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Content Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'track', label: 'Track', icon: Music },
                  { id: 'nft', label: 'NFT', icon: Gem },
                  { id: 'announcement', label: 'News', icon: Rocket }
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.id as any })}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                      formData.type === type.id 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                        : 'bg-white/5 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    <type.icon className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Title</label>
              <input 
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Catchy headline for your promotion"
                className="w-full bg-white/5 border-none rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Banner Image URL</label>
              <div className="relative">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input 
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-white/5 border-none rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Budget (TON)</label>
                <div className="relative">
                  <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input 
                    type="number"
                    value={formData.paymentAmount}
                    onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
                    className="w-full bg-white/5 border-none rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Duration (Days)</label>
                <select 
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) })}
                  className="w-full bg-white/5 border-none rounded-2xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                >
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-blue-600/20 transition-all"
              >
                Submit for Consideration
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SponsorshipSubmissionModal;
