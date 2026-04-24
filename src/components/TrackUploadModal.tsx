import React, { useState } from 'react';
import { X, Upload, Music, Image as ImageIcon, CheckCircle2, Loader2, FileAudio } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { getPlaceholderImage, validateFile, ALLOWED_IMAGE_TYPES, ALLOWED_AUDIO_TYPES } from '@/lib/utils';
import { Track } from '@/types';
import { MOCK_USER } from '@/constants';
import { uploadAudio, uploadCover } from '@/services/storageService';

interface TrackUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TrackUploadModal: React.FC<TrackUploadModalProps> = ({ isOpen, onClose }) => {
  const { addUserTrack, addNotification, userProfile } = useAudio();
  const [isUploading, setIsUploading] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    title: '',
    genre: 'Electronic',
    description: '',
    isNFT: false,
    price: '1.0',
    streamingPrice: '0.01',
    listingType: 'fixed' as 'fixed' | 'auction',
    auctionDuration: '7',
    editions: '1',
    rarity: 'Common',
    royaltySplits: [{ address: userProfile?.walletAddress || '', percentage: 100 }] as { address: string; percentage: number }[],
  });

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string>('');
  const [coverPreview, setCoverPreview] = useState<string>('');

  if (!isOpen) return null;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !audioFile || !coverFile) {
      addNotification("Please provide title, audio file and cover art.", "warning");
      return;
    }

    setIsUploading(true);
    setAudioProgress(0);
    setCoverProgress(0);
    
    try {
      // 0. Double check validation
      const audioValidation = validateFile(audioFile, 'audio', 50);
      if (!audioValidation.isValid) {
        throw new Error(audioValidation.error);
      }
      const coverValidation = validateFile(coverFile, 'image', 10);
      if (!coverValidation.isValid) {
        throw new Error(coverValidation.error);
      }

      // 1. Upload to Firebase Storage
      addNotification("Adding track files...", "info");
      
      const [audioRes, coverRes] = await Promise.all([
        uploadAudio(audioFile, setAudioProgress),
        uploadCover(coverFile, setCoverProgress)
      ]);

      if (!audioRes?.downloadUrl || !coverRes?.downloadUrl) {
        throw new Error("Upload failed: Download URLs missing from response");
      }

      const audioUrl = audioRes.downloadUrl;
      const coverUrl = coverRes.downloadUrl;
      
      const trackId = `u-${Date.now()}`;
      const newTrack: Track = {
        id: trackId,
        songId: `song-${trackId}`,
        title: formData.title,
        artist: userProfile?.name || MOCK_USER.name,
        artistId: userProfile?.uid || MOCK_USER.uid,
        coverUrl: coverUrl,
        audioUrl: audioUrl,
        audioIpfsUrl: audioUrl,
        coverIpfsUrl: coverUrl,
        duration: 180,
        genre: formData.genre,
        description: formData.description,
        isNFT: formData.isNFT,
        price: formData.isNFT ? formData.price : undefined,
        streamingPrice: formData.streamingPrice,
        royaltySplits: formData.isNFT ? formData.royaltySplits : undefined,
        rarity: formData.isNFT ? formData.rarity : undefined,
        playCount: 0,
        likes: 0,
        releaseDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        artistVerified: true
      };

      addUserTrack(newTrack);
      addNotification("Track added successfully", "success");
      setStep(3); // Success step
    } catch (error) {
      console.error("Upload failed:", error);
      addNotification(error instanceof Error ? error.message : "Failed to upload track", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'audio') {
        const validation = validateFile(file, 'audio', 50);
        if (!validation.isValid) {
          addNotification(validation.error || "Invalid file", "error");
          e.target.value = '';
          return;
        }
      } else {
        const validation = validateFile(file, 'image', 10);
        if (!validation.isValid) {
          addNotification(validation.error || "Invalid file", "error");
          e.target.value = '';
          return;
        }
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'audio') {
          setAudioFile(file);
          setAudioPreview(reader.result as string);
        } else {
          setCoverFile(file);
          setCoverPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setFormData({
      title: '',
      genre: 'Electronic',
      description: '',
      isNFT: false,
      price: '1.0',
      streamingPrice: '0.01',
      listingType: 'fixed',
      auctionDuration: '7',
      editions: '1',
      rarity: 'Common',
      royaltySplits: [{ address: userProfile?.walletAddress || '', percentage: 100 }],
    });
    setAudioFile(null);
    setCoverFile(null);
    setAudioPreview('');
    setCoverPreview('');
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
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept={ALLOWED_AUDIO_TYPES.join(',')} 
                      onChange={(e) => handleFileChange(e, 'audio')} 
                      className="hidden" 
                      id="audio-upload-modal" 
                    />
                    <label 
                      htmlFor="audio-upload-modal"
                      className="aspect-square rounded-[10px] border border-dashed border-blue-500/40 bg-foreground/[0.02] flex flex-col items-center justify-center p-2 group hover:border-neutral-500/50 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { document.getElementById('audio-upload-modal')?.click(); e.preventDefault(); } }}
                      aria-label="Select Audio File"
                    >
                      {audioPreview ? (
                        <div className="text-center">
                          <FileAudio className="h-8 w-8 text-blue-500 mb-2 mx-auto" />
                          <p className="text-[10px] font-bold text-foreground uppercase truncate px-2">Audio Loaded</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <Music className="h-8 w-8 text-blue-500" />
                          </div>
                          <p className="text-[10px] font-bold text-foreground uppercase tracking-widest text-center">Select Audio File</p>
                          <p className="text-[8px] text-muted-foreground/50 uppercase tracking-widest mt-2">MP3, WAV, FLAC (Max 50MB)</p>
                        </>
                      )}
                    </label>
                  </div>
                  
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept={ALLOWED_IMAGE_TYPES.join(',')} 
                      onChange={(e) => handleFileChange(e, 'cover')} 
                      className="hidden" 
                      id="cover-upload-modal" 
                    />
                    <label 
                      htmlFor="cover-upload-modal"
                      className="aspect-video rounded-[10px] border border-blue-500/40 bg-foreground/[0.02] flex flex-col items-center justify-center p-2 group hover:border-neutral-500/50 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 overflow-hidden"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { document.getElementById('cover-upload-modal')?.click(); e.preventDefault(); } }}
                      aria-label="Add Cover Art"
                    >
                      {coverPreview ? (
                        <img src={coverPreview} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                      ) : (
                        <>
                          <ImageIcon className="h-6 w-6 text-muted-foreground/50 mb-2 group-hover:text-blue-500 transition-colors" />
                          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Add Cover Art</p>
                        </>
                      )}
                    </label>
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
                    <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Streaming Price (TON)</label>
                    <input 
                      type="number" 
                      id="streaming-price"
                      step="0.01"
                      value={formData.streamingPrice}
                      onChange={(e) => setFormData({...formData, streamingPrice: e.target.value})}
                      className="w-full bg-foreground/[0.03] border border-border/50 rounded-[5px] p-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
                    />
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
                    <div className="space-y-4 animate-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Listing Type</label>
                        <div className="grid grid-cols-2 gap-2 bg-foreground/[0.03] p-1 rounded-[5px]">
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, listingType: 'fixed'})}
                            className={`py-1.5 text-[10px] font-bold rounded-[4px] transition-all ${formData.listingType === 'fixed' ? 'bg-blue-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                          >
                            Fixed Price
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, listingType: 'auction'})}
                            className={`py-1.5 text-[10px] font-bold rounded-[4px] transition-all ${formData.listingType === 'auction' ? 'bg-amber-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                          >
                            Auction
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                            {formData.listingType === 'auction' ? 'Starting Bid (TON)' : 'Mint Price (TON)'}
                          </label>
                          <input 
                            type="number" 
                            step="0.1"
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                            className="w-full bg-foreground/[0.03] border border-border/50 rounded-[5px] p-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
                          />
                        </div>

                        {formData.listingType === 'auction' ? (
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Duration (Days)</label>
                            <select 
                              value={formData.auctionDuration || '7'}
                              onChange={(e) => setFormData({...formData, auctionDuration: e.target.value})}
                              className="w-full bg-foreground/[0.03] border border-border/50 rounded-[5px] p-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
                            >
                              <option value="1">1 Day</option>
                              <option value="3">3 Days</option>
                              <option value="7">7 Days</option>
                              <option value="14">14 Days</option>
                            </select>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Editions</label>
                            <input 
                              type="number" 
                              value={formData.editions}
                              onChange={(e) => setFormData({...formData, editions: e.target.value})}
                              className="w-full bg-foreground/[0.03] border border-border/50 rounded-[5px] p-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Rarity Gradient</label>
                        <select 
                          value={formData.rarity}
                          onChange={(e) => setFormData({...formData, rarity: e.target.value})}
                          className="w-full bg-foreground/[0.03] border border-border/50 rounded-[5px] p-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
                        >
                          <option value="Common">Common</option>
                          <option value="Uncommon">Uncommon</option>
                          <option value="Rare">Rare</option>
                          <option value="Legendary">Legendary</option>
                          <option value="Mythic">Mythic</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Royalty Configuration (%)</label>
                          <button 
                            type="button"
                            onClick={() => {
                              const newSplits = [...formData.royaltySplits, { address: '', percentage: 0 }];
                              setFormData({...formData, royaltySplits: newSplits});
                            }}
                            className="text-[9px] font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-[0.2em]"
                          >
                            + Add Node
                          </button>
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto pr-2 no-scrollbar">
                          {formData.royaltySplits.map((split, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <input 
                                type="text"
                                placeholder="TON Wallet Address"
                                value={split.address}
                                onChange={(e) => {
                                  const newSplits = [...formData.royaltySplits];
                                  newSplits[idx].address = e.target.value;
                                  setFormData({...formData, royaltySplits: newSplits});
                                }}
                                className="flex-1 bg-foreground/[0.02] border border-border/50 rounded-[4px] p-1.5 text-[10px] text-foreground outline-none"
                              />
                              <input 
                                type="number"
                                placeholder="%"
                                value={split.percentage}
                                onChange={(e) => {
                                  const newSplits = [...formData.royaltySplits];
                                  newSplits[idx].percentage = parseInt(e.target.value || '0');
                                  setFormData({...formData, royaltySplits: newSplits});
                                }}
                                className="w-16 bg-foreground/[0.02] border border-border/50 rounded-[4px] p-1.5 text-[10px] text-foreground outline-none"
                              />
                              <button 
                                type="button"
                                onClick={() => {
                                  const newSplits = formData.royaltySplits.filter((_, i) => i !== idx);
                                  setFormData({...formData, royaltySplits: newSplits});
                                }}
                                className="text-muted-foreground/40 hover:text-red-500 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                          <div className="text-[8px] font-bold text-right text-muted-foreground/40 mt-1">
                            Total Split: {formData.royaltySplits.reduce((s, c) => s + c.percentage, 0)}%
                          </div>
                        </div>
                      </div>
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
                    <img src={coverPreview || getPlaceholderImage(formData.title || 'track-preview')} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground uppercase tracking-tight">{formData.title || 'Untitled Frequency'}</h3>
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em] mt-2">{formData.genre}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${audioFile ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{audioFile ? 'Audio Ready' : 'Audio Missing'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${coverFile ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{coverFile ? 'Cover Ready' : 'Cover Missing'}</span>
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
                {isUploading ? (
                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-muted-foreground">Uploading Audio</span>
                      <span className="text-blue-500">{Math.round(audioProgress)}%</span>
                    </div>
                    <div className="w-full h-1 bg-muted/50 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${audioProgress}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mt-2">
                      <span className="text-muted-foreground">Uploading Cover</span>
                      <span className="text-blue-500">{Math.round(coverProgress)}%</span>
                    </div>
                    <div className="w-full h-1 bg-muted/50 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${coverProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <>
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
                      <Upload className="h-4 w-4" />
                      Confirm & Broadcast
                    </button>
                  </>
                )}
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
