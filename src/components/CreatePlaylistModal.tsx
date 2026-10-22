import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Loader2, CheckCircle2, Music, Lock, Globe, Users, Tag } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { Switch } from "@/components/ui/switch";
import { validateFile, ALLOWED_IMAGE_TYPES } from '@/lib/utils';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ isOpen, onClose }) => {
  const { createNewPlaylist, addNotification, trackToAddToPlaylist, setTrackToAddToPlaylist } = useAudio();
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coverUrl: '',
    isPrivate: false,
    isCollaborative: false,
    tags: ''
  });

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file, 'image', 5);
      if (!validation.isValid) {
        addNotification(validation.error || "Invalid file", "error");
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, coverUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      addNotification("Please enter a playlist name", "error");
      return;
    }

    setIsCreating(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

    createNewPlaylist(
      formData.name, 
      formData.description, 
      trackToAddToPlaylist || undefined, 
      formData.coverUrl,
      formData.isPrivate,
      formData.isCollaborative,
      tagsArray
    );

    if (trackToAddToPlaylist) {
      setTrackToAddToPlaylist(null);
    }
    
    setIsCreating(false);
    setStep(2); // Success step
  };

  const resetAndClose = () => {
    setStep(1);
    setFormData({
      name: '',
      description: '',
      coverUrl: '',
      isPrivate: false,
      isCollaborative: false,
      tags: ''
    });
    if (trackToAddToPlaylist) {
      setTrackToAddToPlaylist(null);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[210] flex items-end sm:items-center justify-center p-2 sm:p-2 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-[#07111F]/90 backdrop-blur-xl" onClick={resetAndClose}></div>
      
      <div className="relative w-full max-w-md bg-[#0A1628] text-white rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-500 flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        {/* Handle for mobile */}
        <div className="w-12 h-1 mx-auto my-2 rounded-full bg-white/20 sm:hidden" />

        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-base font-black text-white tracking-tight uppercase leading-none font-['Poppins',sans-serif]">
              {step === 2 ? 'Playlist Created' : 'Create New Playlist'}
            </h2>
            <p className="text-[9px] font-mono font-bold text-[#00B4D8] uppercase tracking-[0.2em] mt-1.5">
              {trackToAddToPlaylist ? `Adding "${trackToAddToPlaylist.title}"` : 'Configure Playlist'}
            </p>
          </div>
          <button 
            onClick={resetAndClose} 
            className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B4D8]"
            aria-label="Close Create Playlist Modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-5 overflow-y-auto custom-scrollbar">
          {step === 1 && (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex flex-col gap-3">
                {/* Top Section: Cover + Basic Info */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Cover Upload */}
                  <div className="w-full sm:w-28 flex-shrink-0">
                    <div 
                      className="aspect-square rounded-xl border border-dashed border-white/20 bg-white/[0.02] flex flex-col items-center justify-center p-2 group hover:border-[#00B4D8] transition-all cursor-pointer relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B4D8]"
                      onClick={() => fileInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      aria-label="Upload Playlist Cover"
                    >
                      {formData.coverUrl ? (
                        <img src={formData.coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-[#00B4D8]/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <ImageIcon className="h-5 w-5 text-[#00B4D8]" />
                          </div>
                          <p className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-widest text-center">Add Cover</p>
                        </>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept={ALLOWED_IMAGE_TYPES.join(',')} 
                      className="hidden" 
                    />
                  </div>

                  {/* Name & Tags */}
                  <div className="flex-1 space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Playlist Name</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-[#00B4D8] transition-all placeholder:text-zinc-600 font-medium"
                        placeholder="e.g. Late Night Vibes"
                        autoFocus
                        required
                        aria-label="Playlist Name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Tag className="h-3 w-3 text-[#00B4D8]" /> Tags
                      </label>
                      <input 
                        type="text" 
                        value={formData.tags}
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-[#00B4D8] transition-all placeholder:text-zinc-600 font-medium"
                        placeholder="chill, workout..."
                        aria-label="Playlist Tags"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Description (Optional)</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-[#00B4D8] transition-all placeholder:text-zinc-600 resize-none h-20 font-medium"
                    placeholder="Describe the vibe..."
                    aria-label="Playlist Description"
                  />
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${formData.isPrivate ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                        {formData.isPrivate ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                      </div>
                      <p className="text-[10px] font-bold text-white uppercase tracking-wider">Private</p>
                    </div>
                    <Switch 
                      checked={formData.isPrivate} 
                      onCheckedChange={(checked) => setFormData({...formData, isPrivate: checked})} 
                      className="scale-90 origin-right"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${formData.isCollaborative ? 'bg-[#00B4D8]/10 text-[#00B4D8]' : 'bg-white/5 text-zinc-400'}`}>
                        <Users className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-[10px] font-bold text-white uppercase tracking-wider">Collab</p>
                    </div>
                    <Switch 
                      checked={formData.isCollaborative} 
                      onCheckedChange={(checked) => setFormData({...formData, isCollaborative: checked})} 
                      className="scale-90 origin-right"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex gap-3 border-t border-white/[0.06] mt-4">
                <button 
                  type="button" 
                  onClick={resetAndClose}
                  className="flex-1 py-3 bg-white/[0.06] hover:bg-white/[0.1] text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isCreating}
                  className="flex-[1.5] py-3 bg-[#00B4D8] hover:bg-[#00B4D8]/90 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#00B4D8]/30 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer border-none"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Music className="h-4 w-4" />
                      Create Playlist
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="py-6 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mb-2 animate-in zoom-in duration-500 border border-green-500/30">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white tracking-tight uppercase">Playlist Ready</h3>
                <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.2em] max-w-xs leading-relaxed">
                  "{formData.name}" has been created successfully in your library.
                </p>
              </div>
              <div className="flex gap-2">
                {formData.isPrivate && <span className="text-[9px] font-mono px-2.5 py-1 bg-white/10 rounded-full text-zinc-300 uppercase tracking-widest">Private</span>}
                {formData.isCollaborative && <span className="text-[9px] font-mono px-2.5 py-1 bg-[#00B4D8]/20 text-[#00B4D8] rounded-full uppercase tracking-widest">Collaborative</span>}
              </div>
              <button 
                onClick={resetAndClose}
                className="mt-4 w-full py-3 bg-[#00B4D8] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#00B4D8]/90 transition-all cursor-pointer border-none shadow-lg shadow-[#00B4D8]/30"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylistModal;
