import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Music, Image as ImageIcon, Sparkles, Zap, Database, Cloud, 
  Loader2, Check, Plus, Trash2, Volume2, Info, ChevronRight, Play, Square
} from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { uploadToPinata, uploadJSONToPinata } from '@/services/storageService';
import { mintTonJamNFT } from '@/services/tonService';
import { createActivityPost } from '@/services/socialService';
import { validateFile } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Track, NFTItem, RoyaltySplitExtended, NFTTrait } from '@/types';
import { toast } from 'sonner';

interface MintNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (nft: NFTItem) => void;
  preselectedTrack?: Track | null;
}

export const MintNFTModal: React.FC<MintNFTModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedTrack = null
}) => {
  const { userProfile, addUserTrack, addUserNFT, addNotification } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();

  // Step 1: Uploads & Main Details, Step 2: Custom Splits & Lyrics, Step 3: Processing Progress, Step 4: Success Screen
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [overallProgress, setOverallProgress] = useState(0);

  // Form Fields
  const [title, setTitle] = useState(preselectedTrack?.title || '');
  const [genre, setGenre] = useState(preselectedTrack?.genre || 'Electronic');
  const [description, setDescription] = useState(preselectedTrack?.description || '');
  const [price, setPrice] = useState(preselectedTrack?.price || '2.5');
  const [editions, setEditions] = useState(preselectedTrack?.editions || '100');
  const [lyrics, setLyrics] = useState(preselectedTrack?.lyrics || '');

  // Gemini Tone Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedTone, setAnalyzedTone] = useState<{
    genre: string;
    moods: string[];
    energy: string;
    tempo: string;
    instruments: string[];
    analysisSummary: string;
  } | null>(null);

  const handleAnalyzeTone = async () => {
    if (!audioFile && !audioPreview) {
      addNotification("Please load or upload an audio file first", "warning");
      return;
    }

    setIsAnalyzing(true);
    try {
      let res;
      if (audioFile) {
        const formData = new FormData();
        formData.append('audio', audioFile);
        formData.append('title', title);
        formData.append('genre', genre);
        res = await fetch('/api/gemini/analyze-tone', {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch('/api/gemini/analyze-tone', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audioUrl: audioPreview,
            title: title,
            genre: genre,
          }),
        });
      }

      if (!res.ok) throw new Error('Tone analysis failed');
      const data = await res.json();
      
      setAnalyzedTone(data);
      if (data.genre) setGenre(data.genre);
      if (data.analysisSummary) {
        setDescription(data.analysisSummary);
      }
      
      addNotification("Sonic profile analyzed by Gemini!", "success");
    } catch (e) {
      console.error(e);
      addNotification("Sonic analysis fallback triggered", "warning");
      // Fallback
      setAnalyzedTone({
        genre: genre || "Electronic",
        moods: ["Energetic", "Futuristic", "Atmospheric"],
        energy: "High",
        tempo: "128",
        instruments: ["Synthesizer", "Drum Machine", "Synth Bass"],
        analysisSummary: "An energetic and futuristic electronic sequence with neon accents and steady synthesizer loops."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Files & Previews
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string>(preselectedTrack?.audioUrl || '');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>(preselectedTrack?.coverUrl || '');

  // Audio Playback Preview
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Royalty Splits
  const [royaltySplits, setRoyaltySplits] = useState<RoyaltySplitExtended[]>([
    { address: userProfile?.walletAddress || userAddress || '', percentage: 100, label: 'Creator' }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Sync state if preselectedTrack changes
  useEffect(() => {
    if (preselectedTrack) {
      setTitle(preselectedTrack.title);
      setGenre(preselectedTrack.genre || 'Electronic');
      setDescription(preselectedTrack.description || '');
      setPrice(preselectedTrack.price || '2.5');
      setEditions(preselectedTrack.editions || '100');
      setLyrics(preselectedTrack.lyrics || '');
      setAudioPreview(preselectedTrack.audioUrl);
      setCoverPreview(preselectedTrack.coverUrl);
      setAudioFile(null);
      setCoverFile(null);
      
      const savedSplits = preselectedTrack.royaltySplits?.map(s => ({
        address: s.address,
        percentage: s.percentage * 100, // back to integer
        label: s.label || 'Collaborator'
      })) || [];
      
      setRoyaltySplits(savedSplits.length > 0 ? savedSplits : [
        { address: userProfile?.walletAddress || userAddress || '', percentage: 100, label: 'Creator' }
      ]);
    }
  }, [preselectedTrack, userProfile, userAddress]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleAudioPlaybackToggle = () => {
    if (!audioPreview) return;
    if (isPlayingPreview) {
      audioRef.current?.pause();
      setIsPlayingPreview(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioPreview);
        audioRef.current.onended = () => setIsPlayingPreview(false);
      } else {
        audioRef.current.src = audioPreview;
      }
      audioRef.current.play().catch(e => {
        console.warn("Audio preview playback failed:", e);
        toast.error("Could not play preview");
      });
      setIsPlayingPreview(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'cover') {
      const check = validateFile(file, 'image', 10);
      if (!check.isValid) {
        addNotification(check.error || "Invalid cover image", "error");
        return;
      }
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else if (type === 'audio') {
      const check = validateFile(file, 'audio', 50);
      if (!check.isValid) {
        addNotification(check.error || "Invalid audio file", "error");
        return;
      }
      setAudioFile(file);
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlayingPreview(false);
      }
      const reader = new FileReader();
      reader.onloadend = () => setAudioPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddRoyaltySplit = () => {
    setRoyaltySplits([...royaltySplits, { address: '', percentage: 0, label: 'Collaborator' }]);
  };

  const handleRemoveRoyaltySplit = (index: number) => {
    const updated = royaltySplits.filter((_, i) => i !== index);
    setRoyaltySplits(updated);
  };

  const handleRoyaltyChange = (index: number, field: keyof RoyaltySplitExtended, value: any) => {
    const updated = [...royaltySplits];
    if (field === 'percentage') {
      updated[index].percentage = Math.min(100, Math.max(0, parseInt(value) || 0));
    } else {
      updated[index][field] = value as any;
    }
    setRoyaltySplits(updated);
  };

  const totalRoyalty = royaltySplits.reduce((acc, curr) => acc + curr.percentage, 0);

  const handleInitiateMint = async () => {
    // Basic Valuations
    if (!userAddress) {
      addNotification("Please connect your TON wallet first", "warning");
      tonConnectUI.openModal();
      return;
    }

    if (!title.trim()) {
      addNotification("Title is required", "error");
      return;
    }

    if (!preselectedTrack && !audioFile) {
      addNotification("Please upload an audio file", "error");
      return;
    }

    if (!coverPreview) {
      addNotification("Please upload or generate a cover art image", "error");
      return;
    }

    if (totalRoyalty !== 100) {
      addNotification(`Royalty splits must total exactly 100%. Current total: ${totalRoyalty}%`, "error");
      return;
    }

    setIsProcessing(true);
    setStep(3);
    setOverallProgress(5);
    setProgressMsg("Preparing IPFS deployment queues...");

    try {
      let finalAudioUrl = audioPreview;
      let finalCoverUrl = coverPreview;

      // 1. Upload audio to Pinata
      if (audioFile) {
        setOverallProgress(20);
        setProgressMsg("Transmitting original master to IPFS network...");
        try {
          finalAudioUrl = await uploadToPinata(audioFile);
        } catch (e) {
          throw new Error("Audio deployment to IPFS failed. Pinata upload error.");
        }
      }

      // 2. Upload cover to Pinata
      if (coverFile) {
        setOverallProgress(45);
        setProgressMsg("Uploading high-resolution vision banner to IPFS...");
        try {
          finalCoverUrl = await uploadToPinata(coverFile);
        } catch (e) {
          throw new Error("Cover art upload failed. IPFS pinnings failed.");
        }
      }

      // 3. Format and Compile metadata
      setOverallProgress(65);
      setProgressMsg("Encoding decentralized TEP-64 compliant song metadata...");

      const formattedRoyaltySplits = royaltySplits.map(s => ({
        address: s.address,
        percentage: s.percentage / 100, // decimals for standard collections
        label: s.label || 'Collaborator'
      }));

      const metadata = {
        name: title,
        description: description,
        image: finalCoverUrl,
        animation_url: finalAudioUrl,
        attributes: [
          { trait_type: "Genre", value: genre },
          { trait_type: "RoyaltySplits", value: JSON.stringify(formattedRoyaltySplits) },
          { trait_type: "Editions", value: editions },
          ...(lyrics ? [{ trait_type: "Lyrics", value: lyrics }] : []),
          ...(analyzedTone ? [
            { trait_type: "Moods", value: analyzedTone.moods.join(', ') },
            { trait_type: "Energy", value: analyzedTone.energy },
            { trait_type: "Tempo (BPM)", value: analyzedTone.tempo },
            { trait_type: "Instruments", value: analyzedTone.instruments.join(', ') },
            { trait_type: "Tone Analysis", value: analyzedTone.analysisSummary }
          ] : [])
        ]
      };

      let ipfsMetadataUrl = '';
      try {
        ipfsMetadataUrl = await uploadJSONToPinata(metadata);
      } catch (e) {
        throw new Error("Metadata encoding failed. IPFS sync unavailable.");
      }

      // 4. Submit to blockchain
      setOverallProgress(80);
      setProgressMsg("Broadcasting transaction. Please approve in your wallet...");

      const success = await mintTonJamNFT(tonConnectUI, userAddress, ipfsMetadataUrl);
      if (!success) {
        throw new Error("Blockchain transaction rejected by user or contract.");
      }

      // 5. Success Registration
      setOverallProgress(95);
      setProgressMsg("Synchronizing local neural databases...");

      const trackId = preselectedTrack?.id || `track-mint-${Date.now()}`;
      
      const updatedTrack: Track = {
        ...(preselectedTrack || {}),
        id: trackId,
        songId: `song-${trackId}`,
        title: title,
        artist: userProfile?.name || 'Unknown Artist',
        artistId: userProfile?.uid || 'anonymous',
        coverUrl: finalCoverUrl,
        audioUrl: finalAudioUrl,
        duration: preselectedTrack?.duration || 180,
        genre: genre,
        isNFT: true,
        artistVerified: true,
        price: price,
        editions: editions,
        royaltySplits: formattedRoyaltySplits,
        minted: (preselectedTrack?.minted || 0) + 1,
        metadataUrl: ipfsMetadataUrl,
        updatedAt: new Date().toISOString(),
        lyrics: lyrics
      } as Track;

      await addUserTrack(updatedTrack);

      const newNFT: NFTItem = {
        id: `nft-${Date.now()}`,
        trackId: trackId,
        title: title,
        owner: userAddress,
        creator: userProfile?.name || 'Unknown Artist',
        artist: userProfile?.name || 'Unknown Artist',
        artistId: userProfile?.uid || 'anonymous',
        price: price,
        imageUrl: finalCoverUrl,
        coverUrl: finalCoverUrl,
        audioUrl: finalAudioUrl,
        edition: `${(preselectedTrack?.minted || 0) + 1} of ${editions}`,
        supply: parseInt(editions),
        minted: 1,
        royaltySplits: formattedRoyaltySplits,
        description: description,
        listingType: 'fixed',
        ipfsUrl: ipfsMetadataUrl,
        history: [{
          event: 'Minted',
          from: 'NullAddress',
          to: userProfile?.name || 'Unknown Artist',
          date: new Date().toISOString(),
          price: price
        }]
      };

      await addUserNFT(newNFT);

      // Log real-time activity in Firestore
      if (userProfile?.uid) {
        await createActivityPost(
          userProfile.uid,
          userProfile.name || 'Unknown Artist',
          userProfile.avatar || '',
          `minted a new music NFT: "${title}"`,
          'nft_mint',
          {
            targetId: newNFT.id,
            artistName: userProfile.name || 'Unknown Artist',
            paymentAmount: price,
            paymentCurrency: 'TON'
          }
        ).catch(err => console.error("Failed to log activity post:", err));
      }

      setOverallProgress(100);
      setProgressMsg("Minting successful!");
      addNotification(`"${title}" minted as an NFT on TON!`, "success");
      
      if (onSuccess) {
        onSuccess(newNFT);
      }
      setStep(4);
    } catch (e: any) {
      console.error(e);
      addNotification(e.message || "Minting process failed", "error");
      setStep(1);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (isProcessing) return;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlayingPreview(false);
    setStep(1);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-full max-w-2xl rounded-2xl bg-black text-white p-0 overflow-hidden backdrop-blur-3xl border-none">
        {/* Subtle Accent Glow */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-500"></div>

        <div className="p-6 relative max-h-[85vh] overflow-y-auto custom-scrollbar">
          <DialogHeader className="flex flex-row justify-between items-center mb-6">
            <div>
              <DialogTitle className="text-sm font-black uppercase tracking-widest text-white">
                NFT Protocol Forge
              </DialogTitle>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">
                Step {step === 4 ? 3 : step} of 3: {
                  step === 1 ? 'Primary Parameters' : 
                  step === 2 ? 'Lore & Royalty splits' : 
                  step === 3 ? 'Forging Blockchain Core' : 
                  'Synthesis Complete'
                }
              </p>
            </div>
            <button 
              onClick={handleClose}
              disabled={isProcessing}
              className="p-1.5 text-white/40 hover:text-white rounded-full hover:bg-white/5 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Media Uploads */}
                  <div className="space-y-4">
                    {/* Cover Art Upload Area */}
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-full aspect-square bg-white/5 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-all overflow-hidden group"
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={(e) => handleFileChange(e, 'cover')} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      {coverPreview ? (
                        <>
                          <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-white/80" />
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                            <ImageIcon className="w-6 h-6 text-white/40" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Upload Cover Vision</p>
                          <p className="text-[8px] font-bold uppercase tracking-wider text-white/30 mt-1">PNG, JPG or WEBP (Max 10MB)</p>
                        </div>
                      )}
                    </div>

                    {/* Audio Track Upload Area */}
                    <div 
                      onClick={() => !preselectedTrack && audioInputRef.current?.click()}
                      className={`w-full p-4 bg-white/5 border border-white/5 rounded-xl flex items-center gap-4 transition-all ${
                        !preselectedTrack ? 'cursor-pointer hover:bg-white/10' : 'opacity-80'
                      }`}
                    >
                      <input 
                        type="file" 
                        ref={audioInputRef} 
                        onChange={(e) => handleFileChange(e, 'audio')} 
                        accept="audio/*" 
                        className="hidden" 
                      />
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center flex-shrink-0">
                        <Music className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/70">
                          {preselectedTrack ? 'Selected Original Artifact' : audioFile ? 'Audio Loaded' : 'Upload Audio Waves'}
                        </p>
                        <p className="text-[8px] font-bold uppercase tracking-wider text-white/30 truncate mt-0.5">
                          {preselectedTrack ? preselectedTrack.title : audioFile ? audioFile.name : 'MP3, WAV or M4A (Max 50MB)'}
                        </p>
                      </div>
                      {audioPreview && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAudioPlaybackToggle();
                          }}
                          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex-shrink-0"
                        >
                          {isPlayingPreview ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                        </button>
                      )}
                    </div>

                    {(audioFile || audioPreview) && (
                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={handleAnalyzeTone}
                          disabled={isAnalyzing}
                          className="w-full py-2.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-500/30 text-cyan-400 disabled:opacity-50 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Deconstructing Audio Frequencies...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 fill-cyan-400" />
                              Analyze Tone with Gemini
                            </>
                          )}
                        </button>

                        {analyzedTone && (
                          <div className="p-3 bg-white/5 rounded-xl space-y-2.5">
                            <div className="flex items-center gap-1.5 text-cyan-400">
                              <Sparkles className="w-3.5 h-3.5 fill-cyan-400" />
                              <span className="text-[9px] font-black uppercase tracking-widest">Gemini Sonic Signature</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[8px] font-bold uppercase tracking-wider text-white/60">
                              <div className="bg-white/5 p-2 rounded-lg">
                                <span className="text-white/40 block mb-0.5">Energy</span>
                                <span className="text-white font-black">{analyzedTone.energy}</span>
                              </div>
                              <div className="bg-white/5 p-2 rounded-lg">
                                <span className="text-white/40 block mb-0.5">Tempo</span>
                                <span className="text-white font-mono font-black">{analyzedTone.tempo} BPM</span>
                              </div>
                              <div className="bg-white/5 p-2 rounded-lg col-span-2">
                                <span className="text-white/40 block mb-0.5">Detected Moods</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {analyzedTone.moods.map((m, idx) => (
                                    <span key={idx} className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded text-[7px] font-black">
                                      {m}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="bg-white/5 p-2 rounded-lg col-span-2">
                                <span className="text-white/40 block mb-0.5">Instruments</span>
                                <span className="text-white font-medium normal-case">{analyzedTone.instruments.join(', ')}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Key Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[8px] font-black text-white/40 uppercase tracking-widest mb-1.5">Song Title</label>
                      <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 focus:border-cyan-500/50 rounded-lg px-3 py-2 text-xs font-bold outline-none text-white transition-colors placeholder:text-white/20"
                        placeholder="Neural Symphony"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[8px] font-black text-white/40 uppercase tracking-widest mb-1.5">Genre</label>
                        <select
                          value={genre}
                          onChange={(e) => setGenre(e.target.value)}
                          className="w-full bg-white/5 border border-white/5 focus:border-cyan-500/50 rounded-lg px-3 py-2 text-xs font-bold outline-none text-white transition-colors"
                        >
                          {['Electronic', 'Hip Hop', 'Rock', 'Pop', 'Jazz', 'Classical', 'Ambient', 'Techno', 'Synthwave'].map(g => (
                            <option key={g} value={g} className="bg-black text-white">{g}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[8px] font-black text-white/40 uppercase tracking-widest mb-1.5">Editions (Supply)</label>
                        <input 
                          type="number" 
                          value={editions}
                          onChange={(e) => setEditions(e.target.value)}
                          className="w-full bg-white/5 border border-white/5 focus:border-cyan-500/50 rounded-lg px-3 py-2 text-xs font-bold outline-none text-white transition-colors"
                          placeholder="100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8px] font-black text-white/40 uppercase tracking-widest mb-1.5">Listing Price (TON)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 focus:border-cyan-500/50 rounded-lg px-3 py-2 text-xs font-bold outline-none text-white transition-colors"
                        placeholder="2.5"
                      />
                    </div>

                    <div>
                      <label className="block text-[8px] font-black text-white/40 uppercase tracking-widest mb-1.5">Creative Description</label>
                      <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 focus:border-cyan-500/50 rounded-lg px-3 py-2 text-xs font-bold outline-none text-white transition-colors placeholder:text-white/20 h-20 resize-none"
                        placeholder="The sonic architecture of an eternal digital sequence..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-102 transition-all active:scale-98"
                  >
                    Next Parameters <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Lyrics Section */}
                <div>
                  <label className="block text-[8px] font-black text-white/40 uppercase tracking-widest mb-1.5">Song Lyrics (Optional)</label>
                  <textarea 
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 focus:border-cyan-500/50 rounded-lg p-3 text-xs font-bold outline-none text-white transition-colors placeholder:text-white/20 h-24 resize-none"
                    placeholder="Enter lyric sequences..."
                  />
                </div>

                {/* Royalty Splits */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-[8px] font-black text-white/40 uppercase tracking-widest">
                      Royalty Splits (TEP-64 Ecosystem)
                    </label>
                    <button 
                      onClick={handleAddRoyaltySplit}
                      className="text-[8px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <Plus className="w-3 h-3" /> Add Collaborator
                    </button>
                  </div>

                  <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar">
                    {royaltySplits.map((split, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <input 
                          type="text" 
                          value={split.address}
                          onChange={(e) => handleRoyaltyChange(index, 'address', e.target.value)}
                          placeholder="Collaborator TON Address (EQ...)"
                          className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs font-mono outline-none text-white focus:border-cyan-500/50"
                        />
                        <input 
                          type="number" 
                          value={split.percentage || ''}
                          onChange={(e) => handleRoyaltyChange(index, 'percentage', e.target.value)}
                          placeholder="%"
                          className="w-16 bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs font-bold outline-none text-white text-center focus:border-cyan-500/50"
                        />
                        <input 
                          type="text" 
                          value={split.label || ''}
                          onChange={(e) => handleRoyaltyChange(index, 'label', e.target.value)}
                          placeholder="Label"
                          className="w-24 bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs font-bold outline-none text-white text-center focus:border-cyan-500/50"
                        />
                        {index > 0 && (
                          <button 
                            onClick={() => handleRemoveRoyaltySplit(index)}
                            className="p-2 text-white/30 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex justify-between items-center text-[10px] text-white/40 font-bold uppercase tracking-widest">
                    <span>Target total: 100%</span>
                    <span className={totalRoyalty === 100 ? 'text-green-400' : 'text-red-400'}>
                      Current total: {totalRoyalty}%
                    </span>
                  </div>
                </div>

                {/* Submit Controls */}
                <div className="flex justify-between items-center pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-5 py-2 text-white/60 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleInitiateMint}
                    className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-102 transition-all active:scale-98"
                  >
                    <Zap className="w-3.5 h-3.5 fill-black" /> Deploy & Mint NFT
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="relative">
                  {/* Rotating Gradient Ring */}
                  <div className="absolute inset-0 rounded-full blur-xl bg-gradient-to-r from-cyan-500 to-purple-500 opacity-30 animate-pulse"></div>
                  <Loader2 className="w-16 h-16 text-cyan-500 animate-spin relative z-10" />
                </div>
                <div className="space-y-2 max-w-sm">
                  <h3 className="text-sm font-black uppercase tracking-widest text-white animate-pulse">
                    Forging Digital Core
                  </h3>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider leading-relaxed">
                    {progressMsg}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${overallProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-[10px] font-black text-cyan-400 tracking-wider font-mono">
                  {overallProgress}%
                </span>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center">
                  <Check className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">
                    Protocol Genesis Succeeded!
                  </h3>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider max-w-md mx-auto leading-relaxed">
                    Your original master track has been pinned to decentralized IPFS storage and minted as a TEP-64 compliant NFT on the TON Blockchain.
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleClose}
                    className="px-8 py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 transition-all"
                  >
                    Close Terminal
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};
