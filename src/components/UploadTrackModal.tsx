import React, { useState, useRef } from 'react';
import { X, Upload, Loader2, CheckCircle2, Music, FileAudio } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { Track } from '@/types';

interface UploadTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadTrackModal: React.FC<UploadTrackModalProps> = ({ isOpen, onClose }) => {
  const { addUserTrack, addNotification } = useAudio();
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    coverUrl: '',
    audioUrl: '',
  });

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'image') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'audio') {
          setFormData(prev => ({ ...prev, audioUrl: reader.result as string }));
        } else {
          setFormData(prev => ({ ...prev, coverUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.audioUrl) {
      addNotification("Please provide a title and audio file", "error");
      return;
    }

    setIsUploading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newTrack: Track = {
      id: `track-${Date.now()}`,
      title: formData.title,
      artist: formData.artist || 'Unknown Artist',
      artistId: 'user-artist',
      coverUrl: formData.coverUrl || 'https://picsum.photos/400/400?seed=default',
      audioUrl: formData.audioUrl,
      duration: 180, // Mock duration
      genre: 'Electronic',
      isNFT: false,
    };
    
    addUserTrack(newTrack);
    
    setIsUploading(false);
    setStep(2);
  };

  const resetAndClose = () => {
    setStep(1);
    setFormData({ title: '', artist: '', coverUrl: '', audioUrl: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={resetAndClose}></div>
      
      <div className="relative w-full max-w-lg glass border border-white/10 bg-[#0a0a0a] rounded-[10px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tighter uppercase">
              {step === 2 ? 'Upload Complete' : 'Forge New Protocol'}
            </h2>
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">
              {step === 1 ? 'Upload Audio Artifact' : 'Sequence Established'}
            </p>
          </div>
          <button onClick={resetAndClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8">
          {step === 1 && (
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="flex flex-col gap-6">
                <div className="flex gap-4">
                  <div 
                    className="w-24 h-24 rounded-[10px] border-2 border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center p-2 cursor-pointer hover:border-blue-500/50 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {formData.coverUrl ? (
                      <img src={formData.coverUrl} className="w-full h-full object-cover rounded-[8px]" alt="Cover" />
                    ) : (
                      <Upload className="h-6 w-6 text-white/20" />
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e, 'image')} accept="image/*" className="hidden" />
                  
                  <div className="flex-1 space-y-3">
                    <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-[5px] p-3 text-xs text-white outline-none focus:border-blue-500/50" placeholder="Track Title" required />
                    <input type="text" value={formData.artist} onChange={(e) => setFormData({...formData, artist: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-[5px] p-3 text-xs text-white outline-none focus:border-blue-500/50" placeholder="Artist Name" />
                  </div>
                </div>

                <div 
                  className="w-full py-8 border-2 border-dashed border-white/10 bg-white/[0.02] rounded-[10px] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all"
                  onClick={() => document.getElementById('audio-upload')?.click()}
                >
                  <FileAudio className={`h-8 w-8 mb-2 ${formData.audioUrl ? 'text-blue-500' : 'text-white/20'}`} />
                  <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest">
                    {formData.audioUrl ? 'Audio Loaded' : 'Upload Audio File'}
                  </p>
                  <input id="audio-upload" type="file" onChange={(e) => handleFileChange(e, 'audio')} accept="audio/*" className="hidden" />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isUploading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[5px] font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Forge Track
                  </>
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="py-8 flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-2">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tighter uppercase">Upload Complete</h3>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] max-w-xs leading-relaxed">
                "{formData.title}" is now part of your collection.
              </p>
              <button onClick={resetAndClose} className="mt-4 px-8 py-3 bg-white text-black rounded-[5px] font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadTrackModal;
