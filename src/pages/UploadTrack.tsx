import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { 
  Upload, 
  Music, 
  Image as ImageIcon, 
  Type, 
  FileText, 
  Coins, 
  Layers, 
  Percent,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAudio } from "@/context/AudioContext";
import { uploadAudio, uploadCover, uploadMetadata } from "@/services/storageService";
import { mintTonJamNFT } from "@/services/tonService";
import { validateFile, ALLOWED_IMAGE_TYPES, ALLOWED_AUDIO_TYPES } from "@/lib/utils";
import { BackButton } from "@/components/BackButton";

export default function UploadTrackScreen() {
  const navigate = useNavigate();
  const { addNotification, addUserTrack, userProfile } = useAudio();

  const [mode, setMode] = useState<'single' | 'batch'>('single');
  
  // Single Mode State
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [price, setPrice] = useState("5");
  const [royalty, setRoyalty] = useState("10");
  const [editions, setEditions] = useState("100");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Batch Mode State
  const [batchTracks, setBatchTracks] = useState<Array<{
    id: string;
    title: string;
    genre: string;
    audioFile: File;
    coverFile: File | null;
    coverPreview: string | null;
  }>>([]);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const batchAudioInputRef = useRef<HTMLInputElement>(null);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file, 'audio', 50);
      if (!validation.isValid) {
        addNotification(validation.error || "Invalid audio file", "error");
        return;
      }
      setAudioFile(file);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
      addNotification("Audio file added successfully", "success");
    }
  };

  const handleBatchAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const validFiles = files.filter(file => {
        const validation = validateFile(file, 'audio', 50);
        return validation.isValid;
      });

      if (validFiles.length < files.length) {
        addNotification(`${files.length - validFiles.length} files were invalid and skipped`, "warning");
      }

      const newTracks = validFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        title: file.name.replace(/\.[^/.]+$/, ""),
        genre: genre || "Electronic",
        audioFile: file,
        coverFile: coverFile, // Default to current cover if exists
        coverPreview: coverPreview
      }));

      setBatchTracks(prev => [...prev, ...newTracks]);
      addNotification(`${validFiles.length} tracks added to batch`, "success");
    }
  };

  const removeBatchTrack = (id: string) => {
    setBatchTracks(prev => prev.filter(t => t.id !== id));
  };

  const updateBatchTrack = (id: string, updates: Partial<typeof batchTracks[0]>) => {
    setBatchTracks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file, 'image', 10);
      if (!validation.isValid) {
        addNotification(validation.error || "Invalid image file", "error");
        return;
      }
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        setCoverPreview(preview);
        // If in batch mode and no individual covers set, maybe suggest applying to all?
        // For now just update the state
      };
      reader.readAsDataURL(file);
      addNotification("Cover image added successfully", "success");
    }
  };

  const handleUpload = async () => {
    if (mode === 'single') {
      if (!audioFile || !coverFile) {
        addNotification("Please upload both audio and cover image", "warning");
        return;
      }
      if (!title.trim()) {
        addNotification("Track title is required", "warning");
        return;
      }
    } else {
      if (batchTracks.length === 0) {
        addNotification("Please add at least one track to the batch", "warning");
        return;
      }
      const missingCover = batchTracks.find(t => !t.coverFile && !coverFile);
      if (missingCover) {
        addNotification("All tracks must have a cover image", "warning");
        return;
      }
    }

    setIsUploading(true);
    setUploadStep('uploading');
    setUploadProgress(0);

    try {
      if (mode === 'single') {
        let audioProg = 0;
        let coverProg = 0;
        const updateOverallProgress = () => {
          setUploadProgress(Math.round((audioProg + coverProg) / 2));
        };

        const [audioRes, coverRes] = await Promise.all([
          uploadAudio(audioFile!, (p) => { audioProg = p; updateOverallProgress(); }),
          uploadCover(coverFile!, (p) => { coverProg = p; updateOverallProgress(); })
        ]);

        const trackId = `track-${Date.now()}`;
        const newTrack = {
          id: trackId,
          songId: `song-${trackId}`,
          title,
          artist: userProfile.name || "Unknown Artist",
          artistId: userProfile.uid,
          coverUrl: coverRes.downloadUrl,
          audioUrl: audioRes.downloadUrl,
          duration: 180,
          playCount: 0,
          streams: 0,
          likes: 0,
          genre,
          description,
          lyrics,
          price,
          editions,
          minted: 0,
          isNFT: false,
          createdAt: Date.now()
        };

        await addUserTrack(newTrack);
      } else {
        // Batch Upload
        for (let i = 0; i < batchTracks.length; i++) {
          const track = batchTracks[i];
          setUploadProgress(Math.round((i / batchTracks.length) * 100));
          
          const trackCover = track.coverFile || coverFile;
          if (!trackCover) continue;

          const [audioRes, coverRes] = await Promise.all([
            uploadAudio(track.audioFile),
            uploadCover(trackCover)
          ]);

          const trackId = `track-${Date.now()}-${i}`;
          const newTrack = {
            id: trackId,
            songId: `song-${trackId}`,
            title: track.title,
            artist: userProfile.name || "Unknown Artist",
            artistId: userProfile.uid,
            coverUrl: coverRes.downloadUrl,
            audioUrl: audioRes.downloadUrl,
            duration: 180,
            playCount: 0,
            streams: 0,
            likes: 0,
            genre: track.genre,
            description: description,
            price: price,
            editions: editions,
            minted: 0,
            isNFT: false,
            createdAt: Date.now()
          };

          await addUserTrack(newTrack);
        }
      }

      setUploadStep('success');
      addNotification(mode === 'single' ? "Track added successfully" : "Batch upload complete", "success");
      
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      console.error("Upload failed:", error);
      addNotification("Upload failed. Please try again.", "error");
      setUploadStep('idle');
    } finally {
      setIsUploading(false);
    }
  };

  const [tonConnectUI] = useTonConnectUI();
  // ... (existing state)

  const handleMint = async () => {
    if (!audioFile || !coverFile || !title) {
      addNotification("Please fill in basic track info first", "warning");
      return;
    }

    setIsUploading(true);
    setUploadStep('uploading');

    try {
      // 1. Upload files (Using Firebase Storage as a proxy for IPFS for now)
      const [audioRes, coverRes] = await Promise.all([
        uploadAudio(audioFile),
        uploadCover(coverFile)
      ]);

      // 2. Create and upload metadata
      const metadata = {
        name: title,
        description: description,
        image: coverRes.downloadUrl,
        animation_url: audioRes.downloadUrl,
        attributes: [
          { trait_type: "Genre", value: genre },
          { trait_type: "Royalty", value: royalty },
          { trait_type: "Editions", value: editions }
        ]
      };
      const metadataRes = await uploadMetadata(metadata);

      // 3. Mint NFT on TON
      const wallet = tonConnectUI.wallet?.account.address;
      if (!wallet) {
        addNotification("Please connect your TON wallet first", "warning");
        setIsUploading(false);
        return;
      }

      await mintTonJamNFT(tonConnectUI, wallet, metadataRes.downloadUrl);

      setUploadStep('success');
      addNotification("NFT minted successfully!", "success");
      
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      console.error("Minting failed:", error);
      addNotification("Minting failed. Please try again.", "error");
      setUploadStep('idle');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white pb-24 relative overflow-x-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 opacity-10 blur-[120px] pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0">
        <BackButton className="p-2 text-white/70 hover:text-white transition-colors" />
        <h1 className="text-sm font-black uppercase tracking-[0.3em]">Forge Protocol</h1>
        <div className="w-10" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto p-6 space-y-8">
        
        {/* Mode Toggle */}
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          <button 
            onClick={() => setMode('single')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'single' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-white/40 hover:text-white'}`}
          >
            Single Track
          </button>
          <button 
            onClick={() => setMode('batch')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'batch' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-white/40 hover:text-white'}`}
          >
            Batch Upload
          </button>
        </div>

        {/* Global Cover Upload (Used for Single or as Default for Batch) */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
            <ImageIcon className="w-3 h-3" /> {mode === 'single' ? 'Cover Image' : 'Default Cover (for all tracks)'}
          </label>
          <div 
            onClick={() => coverInputRef.current?.click()}
            className="aspect-video sm:aspect-[21/9] rounded-3xl bg-white/5 border-2 border-dashed border-white/10 hover:border-cyan-500/50 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center group relative"
          >
            {coverPreview ? (
              <img src={coverPreview} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-white/20" />
                </div>
                <p className="mt-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">Select Artwork</p>
              </>
            )}
            <input 
              type="file" 
              ref={coverInputRef} 
              onChange={handleCoverChange} 
              accept={ALLOWED_IMAGE_TYPES.join(',')} 
              className="hidden" 
            />
          </div>
        </div>

        {mode === 'single' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Audio Upload */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                <Music className="w-3 h-3" /> Audio Artifact
              </label>
              <div 
                onClick={() => audioInputRef.current?.click()}
                className="w-full rounded-3xl bg-white/5 border-2 border-dashed border-white/10 hover:border-purple-500/50 transition-all cursor-pointer flex flex-col items-center justify-center p-8 group relative"
              >
                {audioFile ? (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <Music className="w-8 h-8 text-purple-400" />
                    </div>
                    <p className="text-[11px] font-bold text-white truncate max-w-[250px]">{audioFile.name}</p>
                    <p className="text-[9px] text-white/40 mt-1 uppercase font-black">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-white/20" />
                    </div>
                    <p className="mt-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">Select Audio</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={audioInputRef} 
                  onChange={handleAudioChange} 
                  accept={ALLOWED_AUDIO_TYPES.join(',')} 
                  className="hidden" 
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <Type className="w-3 h-3" /> Track Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-cyan-500/50 transition-all text-sm font-bold placeholder:text-white/10"
                  placeholder="Enter track title..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> Genre
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-cyan-500/50 transition-all text-sm font-bold text-white"
                >
                  <option value="" disabled>Select a genre</option>
                  {['Electronic', 'Hip-hop', 'Ambient', 'Synthwave', 'Pop', 'Techno'].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-3 h-3" /> Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-cyan-500/50 transition-all text-sm font-bold placeholder:text-white/10 h-32 resize-none"
                  placeholder="Describe your sonic artifact..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-3 h-3" /> Lyrics
                </label>
                <textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-cyan-500/50 transition-all text-sm font-bold placeholder:text-white/10 h-48 resize-none"
                  placeholder="Add your lyrics here..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <Coins className="w-3 h-3" /> Mint Price (TON)
                  </label>
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-cyan-500/50 transition-all text-sm font-bold placeholder:text-white/10"
                    placeholder="5"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <Layers className="w-3 h-3" /> Edition Supply
                  </label>
                  <input
                    value={editions}
                    onChange={(e) => setEditions(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-cyan-500/50 transition-all text-sm font-bold placeholder:text-white/10"
                    placeholder="100"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <Percent className="w-3 h-3" /> Royalty %
                  </label>
                  <input
                    value={royalty}
                    onChange={(e) => setRoyalty(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-cyan-500/50 transition-all text-sm font-bold placeholder:text-white/10"
                    placeholder="10"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Batch Audio Upload */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                <Music className="w-3 h-3" /> Batch Audio Artifacts
              </label>
              <div 
                onClick={() => batchAudioInputRef.current?.click()}
                className="w-full rounded-3xl bg-white/5 border-2 border-dashed border-white/10 hover:border-purple-500/50 transition-all cursor-pointer flex flex-col items-center justify-center p-8 group relative"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-white/20" />
                </div>
                <p className="mt-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">Select Multiple Audio Files</p>
                <input 
                  type="file" 
                  ref={batchAudioInputRef} 
                  onChange={handleBatchAudioChange} 
                  accept={ALLOWED_AUDIO_TYPES.join(',')} 
                  multiple
                  className="hidden" 
                />
              </div>
            </div>

            {/* Batch Track List */}
            {batchTracks.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Queue ({batchTracks.length})</h3>
                  <button 
                    onClick={() => setBatchTracks([])}
                    className="text-[9px] font-bold text-red-400 uppercase tracking-widest hover:text-red-300"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-3">
                  {batchTracks.map((track, index) => (
                    <motion.div 
                      key={track.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <Music className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <input 
                          value={track.title}
                          onChange={(e) => updateBatchTrack(track.id, { title: e.target.value })}
                          className="w-full bg-transparent border-none outline-none text-xs font-bold text-white placeholder:text-white/20 p-0"
                          placeholder="Track Title"
                        />
                        <input 
                          value={track.genre}
                          onChange={(e) => updateBatchTrack(track.id, { genre: e.target.value })}
                          className="w-full bg-transparent border-none outline-none text-[10px] font-bold text-white/40 placeholder:text-white/10 p-0"
                          placeholder="Genre"
                        />
                      </div>
                      <button 
                        onClick={() => removeBatchTrack(track.id)}
                        className="p-2 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <CheckCircle2 className="w-4 h-4 rotate-45" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Common Description */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3 h-3" /> Common Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-cyan-500/50 transition-all text-sm font-bold placeholder:text-white/10 h-24 resize-none"
                placeholder="Description for all tracks in this batch..."
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-8 space-y-4">
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-white/40">Transmission Progress</span>
                <span className="text-cyan-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-cyan-500 h-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(8,145,178,0.5)]" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
          <button
            onClick={handleUpload}
            disabled={isUploading || (mode === 'batch' && batchTracks.length === 0)}
            className="w-full bg-[#0891b2] text-black font-black text-[12px] uppercase tracking-[0.3em] py-5 rounded-2xl shadow-[0_10px_30px_rgba(8,145,178,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Transmitting {uploadProgress}%
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                {mode === 'single' ? 'Upload Track' : `Upload ${batchTracks.length} Tracks`}
              </>
            )}
          </button>

          {mode === 'single' && (
            <button
              onClick={handleMint}
              className="w-full bg-purple-600 text-white font-black text-[12px] uppercase tracking-[0.3em] py-5 rounded-2xl shadow-[0_10px_30px_rgba(147,51,234,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Sparkles className="w-5 h-5 fill-current" />
              Mint NFT Protocol
            </button>
          )}
        </div>
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {uploadStep === 'success' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div className="w-24 h-24 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-12 h-12 text-cyan-400" />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tighter italic">Transmission Complete</h2>
              <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
                {mode === 'single' ? 'Your sonic artifact is now live.' : `${batchTracks.length} artifacts synchronized successfully.`}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
