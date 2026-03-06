import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Loader2, CheckCircle2, Music } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';

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
    
    createNewPlaylist(formData.name, formData.description, undefined, formData.coverUrl);
    
    setIsCreating(false);
    setStep(2); // Success step
  };

  const resetAndClose = () => {
    setStep(1);
    setFormData({
      name: '',
      description: '',
      coverUrl: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={resetAndClose}></div>
      
      <div className="relative w-full max-w-lg glass border border-white/10 bg-[#0a0a0a] rounded-[10px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tighter uppercase">
              {step === 2 ? 'Sync Complete' : 'Initialize New Sync'}
            </h2>
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">
              {step === 1 ? 'Configure Playlist Parameters' : 'Sequence Established'}
            </p>
          </div>
          <button onClick={resetAndClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8">
          {step === 1 && (
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Left: Cover Upload */}
                <div className="w-full md:w-1/3 space-y-4">
                  <div 
                    className="aspect-square rounded-[10px] border-2 border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center p-4 group hover:border-blue-500/50 transition-all cursor-pointer relative overflow-hidden"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {formData.coverUrl ? (
                      <img src={formData.coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <ImageIcon className="h-6 w-6 text-blue-500" />
                        </div>
                        <p className="text-[8px] font-bold text-white/60 uppercase tracking-widest text-center">Upload Cover</p>
                      </>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <p className="text-[8px] text-white/30 uppercase tracking-widest text-center leading-relaxed">
                    Leave empty for dynamic collage generation
                  </p>
                </div>

                {/* Right: Details */}
                <div className="flex-1 space-y-5">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Playlist Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-[5px] p-3 text-xs text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
                      placeholder="e.g. Late Night Vibes"
                      autoFocus
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Description (Optional)</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-[5px] p-3 text-xs text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20 resize-none h-24"
                      placeholder="Describe the vibe..."
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-4">
                <button 
                  type="button" 
                  onClick={resetAndClose}
                  className="flex-1 py-4 bg-white/5 text-white rounded-[5px] font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[5px] font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
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
            <div className="py-8 flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-2 animate-in zoom-in duration-500">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tighter uppercase">Playlist Created</h3>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] max-w-xs leading-relaxed">
                "{formData.name}" has been added to your library.
              </p>
              <button 
                onClick={resetAndClose}
                className="mt-4 px-8 py-3 bg-white text-black rounded-[5px] font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
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
