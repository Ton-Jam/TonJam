import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Loader2, CheckCircle2, Music, Lock, Globe, Users, Tag } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { Switch } from "@/components/ui/switch";

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ isOpen, onClose }) => {
  const { createNewPlaylist, addNotification } = useAudio();
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
      if (file.size > 5 * 1024 * 1024) {
        addNotification("File size too large (max 5MB)", "error");
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

    createNewPlaylist(
      formData.name, 
      formData.description, 
      undefined, 
      formData.coverUrl,
      formData.isPrivate,
      formData.isCollaborative,
      tagsArray
    );
    
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={resetAndClose}></div>
      
      <div className="relative w-full max-w-md glass border-t sm:border border-white/10 bg-[#0a0a0a] rounded-t-[20px] sm:rounded-[10px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-500 flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        {/* Handle for mobile */}
        <div className="w-12 h-1 mx-auto my-3 rounded-full bg-white/10 sm:hidden" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tighter uppercase">
              {step === 2 ? 'Sync Complete' : 'Initialize New Sync'}
            </h2>
            <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-0.5">
              {step === 1 ? 'Configure Playlist Parameters' : 'Sequence Established'}
            </p>
          </div>
          <button onClick={resetAndClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto custom-scrollbar">
          {step === 1 && (
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="flex flex-col gap-5">
                {/* Top Section: Cover + Basic Info */}
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Cover Upload - Compact */}
                  <div className="w-full sm:w-28 flex-shrink-0">
                    <div 
                      className="aspect-square sm:aspect-square rounded-[12px] border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center p-2 group hover:border-blue-500/50 transition-all cursor-pointer relative overflow-hidden"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {formData.coverUrl ? (
                        <img src={formData.coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <ImageIcon className="h-5 w-5 text-blue-500" />
                          </div>
                          <p className="text-[7px] font-bold text-white/60 uppercase tracking-widest text-center">Add Cover</p>
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
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>

                  {/* Name & Tags */}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Playlist Name</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-[8px] p-3 text-sm text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
                        placeholder="e.g. Late Night Vibes"
                        autoFocus
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-2">
                        <Tag className="h-3 w-3" /> Tags
                      </label>
                      <input 
                        type="text" 
                        value={formData.tags}
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-[8px] p-3 text-sm text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
                        placeholder="chill, workout..."
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Description (Optional)</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-[8px] p-3 text-sm text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20 resize-none h-20"
                    placeholder="Describe the vibe..."
                  />
                </div>

                {/* Toggles - Compact Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-[10px] bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-full ${formData.isPrivate ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                        {formData.isPrivate ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                      </div>
                      <p className="text-[9px] font-bold text-white uppercase tracking-wider">Private</p>
                    </div>
                    <Switch 
                      checked={formData.isPrivate} 
                      onCheckedChange={(checked) => setFormData({...formData, isPrivate: checked})} 
                      className="scale-75 origin-right"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-[10px] bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-full ${formData.isCollaborative ? 'bg-blue-500/10 text-blue-500' : 'bg-white/5 text-white/40'}`}>
                        <Users className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-[9px] font-bold text-white uppercase tracking-wider">Collab</p>
                    </div>
                    <Switch 
                      checked={formData.isCollaborative} 
                      onCheckedChange={(checked) => setFormData({...formData, isCollaborative: checked})} 
                      className="scale-75 origin-right"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3 border-t border-white/5 mt-2 pb-6 sm:pb-0">
                <button 
                  type="button" 
                  onClick={resetAndClose}
                  className="flex-1 py-3.5 bg-white/5 text-white rounded-[10px] font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isCreating}
                  className="flex-[1.5] py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-[10px] font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Music className="h-4 w-4" />
                      Create Sync
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="py-10 flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-2 animate-in zoom-in duration-500">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white tracking-tighter uppercase">Playlist Created</h3>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] max-w-xs leading-relaxed">
                  "{formData.name}" has been added to your library.
                </p>
              </div>
              <div className="flex gap-3">
                {formData.isPrivate && <span className="text-[8px] px-3 py-1.5 bg-white/10 rounded-full text-white/60 uppercase tracking-widest">Private</span>}
                {formData.isCollaborative && <span className="text-[8px] px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-full uppercase tracking-widest">Collaborative</span>}
              </div>
              <button 
                onClick={resetAndClose}
                className="mt-4 w-full sm:w-auto px-10 py-3.5 bg-white text-black rounded-[10px] font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylistModal;
