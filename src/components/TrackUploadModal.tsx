import React, { useState } from 'react';
import { X, Upload, Music, Image as ImageIcon, CheckCircle2, Loader2 } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { Track } from '@/types';
import { MOCK_USER } from '@/constants';

interface TrackUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TrackUploadModal: React.FC<TrackUploadModalProps> = ({ isOpen, onClose }) => {
  const { addUserTrack, addNotification } = useAudio();
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    title: '',
    genre: 'Electronic',
    description: '',
    isNFT: false,
    price: '1.0',
  });

  if (!isOpen) return null;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      addNotification("Please enter a track title", "error");
      return;
    }

    setIsUploading(true);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newTrack: Track = {
      id: `u-${Date.now()}`,
      title: formData.title,
      artist: MOCK_USER.name,
      artistId: 'u-1', // Mock user ID
      coverUrl: `https://picsum.photos/400/400?seed=${formData.title}`,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 180,
      genre: formData.genre,
      isNFT: formData.isNFT,
      price: formData.isNFT ? formData.price : undefined,
      playCount: 0,
      likes: 0,
      releaseDate: new Date().toISOString().split('T')[0],
      artistVerified: true
    };

    addUserTrack(newTrack);
    setIsUploading(false);
    setStep(3); // Success step
  };

  const resetAndClose = () => {
    setStep(1);
    setFormData({
      title: '',
      genre: 'Electronic',
      description: '',
      isNFT: false,
      price: '1.0',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={resetAndClose}></div>
      
      <div className="relative w-full max-w-xl glass border border-white/10 bg-[#0a0a0a] rounded-[10px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tighter uppercase">
              {step === 3 ? 'Upload Complete' : 'Forge New Frequency'}
            </h2>
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">
              {step === 1 && 'Step 1: Audio & Metadata'}
              {step === 2 && 'Step 2: Review & Broadcast'}
              {step === 3 && 'Frequency synchronized with network'}
            </p>
          </div>
          <button onClick={resetAndClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8">
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Upload Area */}
                <div className="space-y-6">
                  <div className="aspect-square rounded-[10px] border-2 border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center p-6 group hover:border-blue-500/50 transition-all cursor-pointer">
                    <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Music className="h-8 w-8 text-blue-500" />
                    </div>
                    <p className="text-[10px] font-bold text-white uppercase tracking-widest text-center">Select Audio File</p>
                    <p className="text-[8px] text-white/20 uppercase tracking-widest mt-2">MP3, WAV, FLAC (Max 50MB)</p>
                  </div>
                  
                  <div className="aspect-video rounded-[10px] border border-white/10 bg-white/[0.02] flex flex-col items-center justify-center p-4 group hover:border-blue-500/50 transition-all cursor-pointer">
                    <ImageIcon className="h-6 w-6 text-white/20 mb-2 group-hover:text-blue-500 transition-colors" />
                    <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Add Cover Art</p>
                  </div>
                </div>

                {/* Right: Metadata */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Track Title</label>
                    <input 
                      type="text" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-[5px] p-3 text-xs text-white outline-none focus:border-blue-500/50 transition-all"
                      placeholder="Enter title..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Genre</label>
                    <select 
                      value={formData.genre}
                      onChange={(e) => setFormData({...formData, genre: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-[5px] p-3 text-xs text-white outline-none focus:border-blue-500/50 transition-all appearance-none"
                    >
                      <option value="Electronic">Electronic</option>
                      <option value="Techno">Techno</option>
                      <option value="Ambient">Ambient</option>
                      <option value="Synthwave">Synthwave</option>
                      <option value="Pop">Pop</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Release Type</label>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, isNFT: false})}
                        className={`flex-1 py-3 rounded-[5px] text-[8px] font-bold uppercase tracking-widest transition-all ${!formData.isNFT ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/40'}`}
                      >
                        Streaming
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, isNFT: true})}
                        className={`flex-1 py-3 rounded-[5px] text-[8px] font-bold uppercase tracking-widest transition-all ${formData.isNFT ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/40'}`}
                      >
                        NFT Asset
                      </button>
                    </div>
                  </div>

                  {formData.isNFT && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                      <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Mint Price (TON)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-[5px] p-3 text-xs text-white outline-none focus:border-blue-500/50 transition-all"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button" 
                  onClick={resetAndClose}
                  className="flex-1 py-4 bg-white/5 text-white rounded-[5px] font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[5px] font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                >
                  Next Step
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[10px] space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-[5px] bg-neutral-900 overflow-hidden border border-white/10">
                    <img src={`https://picsum.photos/400/400?seed=${formData.title}`} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">{formData.title || 'Untitled Frequency'}</h3>
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em] mt-1">{formData.genre}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Audio Ready</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Metadata Valid</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-black/40 rounded-[5px] border border-white/5">
                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-1">Release Type</p>
                    <p className="text-xs font-bold text-white uppercase">{formData.isNFT ? 'NFT Asset' : 'Standard Streaming'}</p>
                  </div>
                  <div className="p-4 bg-black/40 rounded-[5px] border border-white/5">
                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-1">Network Fee</p>
                    <p className="text-xs font-bold text-white uppercase">~0.02 TON</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)}
                  disabled={isUploading}
                  className="flex-1 py-4 bg-white/5 text-white rounded-[5px] font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  Back
                </button>
                <button 
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[5px] font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Broadcasting...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Confirm & Broadcast
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-12 flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-4 animate-in zoom-in duration-500">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tighter uppercase">Broadcast Successful</h3>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] max-w-xs leading-relaxed">
                Your frequency has been synchronized with the TON network and is now available for streaming.
              </p>
              <button 
                onClick={resetAndClose}
                className="mt-8 px-10 py-4 bg-white text-black rounded-[5px] font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
              >
                Return to Library
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackUploadModal;
