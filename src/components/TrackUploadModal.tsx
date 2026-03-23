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
      description: formData.description,
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-2 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" onClick={resetAndClose}></div>
      
      <div className="relative w-full max-w-xl glass border border-border bg-background rounded-[10px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-2 border-b border-blue-500/30 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tighter uppercase">
              {step === 3 ? 'Upload Complete' : 'Forge New Frequency'}
            </h2>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-2">
              {step === 1 && 'Step 1: Audio & Metadata'}
              {step === 2 && 'Step 2: Review & Broadcast'}
              {step === 3 && 'Frequency synchronized with network'}
            </p>
          </div>
          <button onClick={resetAndClose} className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Close modal">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-2">
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Left: Upload Area */}
                <div className="space-y-2">
                  <div 
                    className="aspect-square rounded-[10px] border border-dashed border-blue-500/40 bg-foreground/[0.02] flex flex-col items-center justify-center p-2 group hover:border-neutral-500/50 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    role="button"
                    tabIndex={0}
                    aria-label="Select Audio File"
                  >
                    <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Music className="h-8 w-8 text-blue-500" />
                    </div>
                    <p className="text-[10px] font-bold text-foreground uppercase tracking-widest text-center">Select Audio File</p>
                    <p className="text-[8px] text-muted-foreground/50 uppercase tracking-widest mt-2">MP3, WAV, FLAC (Max 50MB)</p>
                  </div>
                  
                  <div 
                    className="aspect-video rounded-[10px] border border-blue-500/40 bg-foreground/[0.02] flex flex-col items-center justify-center p-2 group hover:border-neutral-500/50 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    role="button"
                    tabIndex={0}
                    aria-label="Add Cover Art"
                  >
                    <ImageIcon className="h-6 w-6 text-muted-foreground/50 mb-2 group-hover:text-blue-500 transition-colors" />
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Add Cover Art</p>
                  </div>
                </div>

                {/* Right: Metadata */}
                <div className="space-y-2">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Track Title</label>
                    <input 
                      type="text" 
                      id="track-title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-foreground/[0.03] border border-border/50 rounded-[5px] p-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
                      placeholder="Enter title..."
                      required
                      aria-required="true"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Description</label>
                    <textarea 
                      id="track-description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-foreground/[0.03] border border-border/50 rounded-[5px] p-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all min-h-[100px]"
                      placeholder="Tell us about your track..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Genre</label>
                    <select 
                      id="track-genre"
                      value={formData.genre}
                      onChange={(e) => setFormData({...formData, genre: e.target.value})}
                      className="w-full bg-foreground/[0.03] border border-blue-500/30 rounded-[5px] p-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all appearance-none"
                    >
                      <option value="Electronic">Electronic</option>
                      <option value="Techno">Techno</option>
                      <option value="Ambient">Ambient</option>
                      <option value="Synthwave">Synthwave</option>
                      <option value="Pop">Pop</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Release Type</label>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, isNFT: false})}
                        className={`flex-1 py-2 rounded-[5px] text-[8px] font-bold uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${!formData.isNFT ? 'bg-blue-600 text-foreground' : 'bg-muted/50 text-muted-foreground'}`}
                      >
                        Streaming
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, isNFT: true})}
                        className={`flex-1 py-2 rounded-[5px] text-[8px] font-bold uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${formData.isNFT ? 'bg-amber-500 text-background' : 'bg-muted/50 text-muted-foreground'}`}
                      >
                        NFT Asset
                      </button>
                    </div>
                  </div>

                  {formData.isNFT && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                      <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Mint Price (TON)</label>
                      <input 
                        type="number" 
                        id="mint-price"
                        step="0.1"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full bg-foreground/[0.03] border border-border/50 rounded-[5px] p-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button 
                  type="button" 
                  onClick={resetAndClose}
                  className="flex-1 py-2 bg-muted/50 text-foreground rounded-[5px] font-bold text-[10px] uppercase tracking-widest hover:bg-muted transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-foreground rounded-[5px] font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Next Step
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <div className="p-2 bg-foreground/[0.02] border border-blue-500/30 rounded-[10px] space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-24 h-24 rounded-[5px] bg-neutral-900 overflow-hidden border border-blue-500/40">
                    <img src={`https://picsum.photos/400/400?seed=${formData.title}`} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground uppercase tracking-tight">{formData.title || 'Untitled Frequency'}</h3>
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em] mt-2">{formData.genre}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Audio Ready</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Metadata Valid</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-background/40 rounded-[5px] border border-blue-500/30">
                    <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2">Release Type</p>
                    <p className="text-xs font-bold text-foreground uppercase">{formData.isNFT ? 'NFT Asset' : 'Standard Streaming'}</p>
                  </div>
                  <div className="p-2 bg-background/40 rounded-[5px] border border-blue-500/30">
                    <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2">Network Fee</p>
                    <p className="text-xs font-bold text-foreground uppercase">~0.02 TON</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setStep(1)}
                  disabled={isUploading}
                  className="flex-1 py-2 bg-muted/50 text-foreground rounded-[5px] font-bold text-[10px] uppercase tracking-widest hover:bg-muted transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Back
                </button>
                <button 
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-foreground rounded-[5px] font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
            <div className="py-2 flex flex-col items-center text-center space-y-2">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-2 animate-in zoom-in duration-500">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-[20px] font-bold text-foreground tracking-tighter uppercase">Broadcast Successful</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] max-w-xs leading-relaxed">
                Your frequency has been synchronized with the TON network and is now available for streaming.
              </p>
              <button 
                onClick={resetAndClose}
                className="mt-2 px-2 py-2 bg-foreground text-background rounded-[5px] font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
