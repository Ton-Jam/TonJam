import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HowToMintTutorial } from '@/components/HowToMintTutorial';
import { 
  X, Music, Image as ImageIcon, Sparkles, Zap, Database, Cloud, 
  Loader2, Check, Plus, Trash2, Volume2, Info, ChevronRight, Play, Square,
  Flame, Disc, Crown, Tag, Sliders, Radio, Percent, ShieldCheck, FileAudio, HelpCircle,
  Code, Eye, ExternalLink, ArrowRight, Wallet, CheckCircle2, Copy
} from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { useNFT } from '@/contexts/NFTContext';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { uploadToPinata, uploadJSONToPinata } from '@/services/storageService';
import { mintTonJamNFT, TONJAM_COLLECTION_ADDRESS } from '@/services/tonService';
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
  const { addNFT, updateMintingStatus, setIsMinting } = useNFT();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress() || userProfile?.walletAddress || '';

  // 5-Step Wizard Flow:
  // Step 1: Upload Audio & Cover
  // Step 2: Metadata & TEP-64 Inspection
  // Step 3: Royalties & Blockchain Contract
  // Step 4: Minting Execution
  // Step 5: Success & Receipt
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [overallProgress, setOverallProgress] = useState(0);

  // Form Fields - Track & Metadata
  const [title, setTitle] = useState(preselectedTrack?.title || '');
  const [artistName, setArtistName] = useState(preselectedTrack?.artist || userProfile?.name || 'Artist');
  const [album, setAlbum] = useState((preselectedTrack as any)?.albumName || (preselectedTrack as any)?.album || '');
  const [genre, setGenre] = useState(preselectedTrack?.genre || 'Electronic');
  const [bpm, setBpm] = useState('128');
  const [keySig, setKeySig] = useState('A minor');
  const [audioQuality, setAudioQuality] = useState('24-bit Lossless Studio WAV');
  const [description, setDescription] = useState(preselectedTrack?.description || '');
  const [price, setPrice] = useState(preselectedTrack?.price || '2.5');
  const [editions, setEditions] = useState(preselectedTrack?.editions || '100');
  const [lyrics, setLyrics] = useState(preselectedTrack?.lyrics || '');
  const [secondaryRoyalty, setSecondaryRoyalty] = useState('5'); // 0 - 15%
  const [blockchain, setBlockchain] = useState<'ton-mainnet' | 'ton-testnet' | 'ton-miniapp'>('ton-mainnet');
  const [termsConfirmed, setTermsConfirmed] = useState(false);

  // Inspector mode in Step 2: Form vs JSON Metadata
  const [metadataViewMode, setMetadataViewMode] = useState<'form' | 'json'>('form');

  // AI Generators State
  const [isGeneratingAiCover, setIsGeneratingAiCover] = useState(false);
  const [isGeneratingAiLore, setIsGeneratingAiLore] = useState(false);
  const [aiCoverPrompt, setAiCoverPrompt] = useState('');

  // Rarity Tags & Custom Attributes
  const [rarityTier, setRarityTier] = useState<'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic'>('Common');
  const [customTraits, setCustomTraits] = useState<NFTTrait[]>([
    { trait_type: 'Edition Type', value: 'Genesis First Drop' },
    { trait_type: 'Audio Master', value: '24-bit Studio Quality' },
    { trait_type: 'Stems Included', value: 'Master WAV & Stems' }
  ]);
  const [newTraitKey, setNewTraitKey] = useState('');
  const [newTraitValue, setNewTraitValue] = useState('');

  // Drag and Drop States
  const [isDraggingAudio, setIsDraggingAudio] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);

  // Files & Previews
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string>(preselectedTrack?.audioUrl || '');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>(preselectedTrack?.coverUrl || '');
  const [mintedNFTResult, setMintedNFTResult] = useState<NFTItem | null>(null);

  // Audio Playback Preview
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Royalty Splits
  const [royaltySplits, setRoyaltySplits] = useState<RoyaltySplitExtended[]>([
    { address: userAddress || userProfile?.walletAddress || '', percentage: 100, label: 'Creator' }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Sync state if preselectedTrack changes
  useEffect(() => {
    if (preselectedTrack) {
      setTitle(preselectedTrack.title);
      setArtistName(preselectedTrack.artist || userProfile?.name || 'Artist');
      setAlbum((preselectedTrack as any)?.albumName || (preselectedTrack as any)?.album || '');
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
        percentage: s.percentage * 100,
        label: s.label || 'Collaborator'
      })) || [];
      
      setRoyaltySplits(savedSplits.length > 0 ? savedSplits : [
        { address: userAddress || userProfile?.walletAddress || '', percentage: 100, label: 'Creator' }
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
        toast.error("Could not play audio preview");
      });
      setIsPlayingPreview(true);
    }
  };

  const processAudioFile = (file: File) => {
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

    // Auto extract title if missing
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setTitle(cleanName);
    }
    addNotification(`Audio track "${file.name}" loaded successfully!`, "success");
  };

  const processCoverFile = (file: File) => {
    const check = validateFile(file, 'image', 10);
    if (!check.isValid) {
      addNotification(check.error || "Invalid cover image", "error");
      return;
    }
    setCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
    addNotification("Cover art uploaded successfully!", "success");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === 'cover') processCoverFile(file);
    else if (type === 'audio') processAudioFile(file);
  };

  const totalRoyalty = royaltySplits.reduce((acc, curr) => acc + (Number(curr.percentage) || 0), 0);

  // Construct TEP-64 compliant JSON object for preview & IPFS upload
  const formattedRoyaltySplits = royaltySplits.map(s => ({
    address: s.address,
    percentage: (Number(s.percentage) || 0) / 100,
    label: s.label || 'Collaborator'
  }));

  const compiledAttributes: NFTTrait[] = [
    { trait_type: "Artist Name", value: artistName || userProfile?.name || 'Artist' },
    { trait_type: "Album", value: album || 'Single Release' },
    { trait_type: "Genre", value: genre },
    { trait_type: "BPM", value: bpm },
    { trait_type: "Key", value: keySig },
    { trait_type: "Audio Quality", value: audioQuality },
    { trait_type: "Rarity", value: rarityTier },
    { trait_type: "Secondary Royalty %", value: `${secondaryRoyalty}%` },
    { trait_type: "Blockchain Network", value: blockchain },
    { trait_type: "RoyaltySplits", value: JSON.stringify(formattedRoyaltySplits) },
    { trait_type: "Editions", value: editions },
    ...customTraits,
    ...(lyrics ? [{ trait_type: "Lyrics", value: lyrics }] : [])
  ];

  const constructedTep64Metadata = {
    name: title || 'Untitled Track',
    description: description || 'Exclusive music NFT minted on TonJam platform.',
    image: coverPreview || 'ipfs://placeholder-cover-cid',
    animation_url: audioPreview || 'ipfs://placeholder-audio-cid',
    attributes: compiledAttributes
  };

  const handleAddCustomTrait = () => {
    if (!newTraitKey.trim() || !newTraitValue.trim()) return;
    setCustomTraits([...customTraits, { trait_type: newTraitKey.trim(), value: newTraitValue.trim() }]);
    setNewTraitKey('');
    setNewTraitValue('');
  };

  const handleRemoveCustomTrait = (index: number) => {
    setCustomTraits(customTraits.filter((_, i) => i !== index));
  };

  const handleInitiateMint = async () => {
    if (!userAddress) {
      addNotification("Please connect your TON wallet first", "warning");
      tonConnectUI.openModal();
      return;
    }

    if (!title.trim()) {
      addNotification("Title is required", "error");
      setStep(1);
      return;
    }

    if (!preselectedTrack && !audioFile && !audioPreview) {
      addNotification("Please upload an audio file", "error");
      setStep(1);
      return;
    }

    if (!coverPreview) {
      addNotification("Please upload or generate cover art", "error");
      setStep(1);
      return;
    }

    if (totalRoyalty !== 100) {
      addNotification(`Royalty splits must total exactly 100%. Current total: ${totalRoyalty}%`, "error");
      setStep(3);
      return;
    }

    if (!termsConfirmed) {
      addNotification("Please confirm copyright ownership attestation to proceed", "warning");
      return;
    }

    const activeTrackId = preselectedTrack?.id || `track-mint-${Date.now()}`;
    setIsProcessing(true);
    setIsMinting(true);
    setStep(4);
    setOverallProgress(5);
    setProgressMsg("Preparing Pinata IPFS deployment queues...");
    updateMintingStatus(activeTrackId, {
      step: 'uploading',
      progress: 5,
      message: 'Preparing Pinata IPFS deployment queues...'
    });

    try {
      let finalAudioUrl = audioPreview;
      let finalCoverUrl = coverPreview;

      // 1. Upload audio to Pinata
      if (audioFile) {
        setOverallProgress(20);
        setProgressMsg("Transmitting original audio master to IPFS network...");
        updateMintingStatus(activeTrackId, {
          progress: 20,
          message: 'Transmitting original audio master to IPFS network...'
        });
        finalAudioUrl = await uploadToPinata(audioFile);
      }

      // 2. Upload cover to Pinata
      if (coverFile) {
        setOverallProgress(45);
        setProgressMsg("Uploading cover art image to IPFS...");
        updateMintingStatus(activeTrackId, {
          progress: 45,
          message: 'Uploading cover art image to IPFS...'
        });
        finalCoverUrl = await uploadToPinata(coverFile);
      }

      // 3. Format and Compile metadata
      setOverallProgress(65);
      setProgressMsg("Encoding decentralized TEP-64 compliant song metadata...");
      updateMintingStatus(activeTrackId, {
        step: 'metadata',
        progress: 65,
        message: 'Encoding decentralized TEP-64 compliant song metadata...'
      });

      const finalMetadata = {
        name: title,
        description: description,
        image: finalCoverUrl,
        animation_url: finalAudioUrl,
        attributes: compiledAttributes,
        traits: compiledAttributes
      };

      const ipfsMetadataUrl = await uploadJSONToPinata(finalMetadata);

      // 4. Submit to TON smart contract
      setOverallProgress(80);
      setProgressMsg("Broadcasting transaction to TON smart contract. Confirm in wallet...");
      updateMintingStatus(activeTrackId, {
        step: 'blockchain',
        progress: 80,
        message: 'Broadcasting transaction to TON smart contract. Confirm in wallet...'
      });

      const success = await mintTonJamNFT(tonConnectUI, userAddress, ipfsMetadataUrl);
      if (!success) {
        throw new Error("Blockchain transaction cancelled by user or contract error.");
      }

      // 5. Success Registration
      setOverallProgress(95);
      setProgressMsg("Synchronizing local & cloud databases...");
      updateMintingStatus(activeTrackId, {
        step: 'registering',
        progress: 95,
        message: 'Synchronizing local & cloud databases...'
      });

      const trackId = preselectedTrack?.id || `track-mint-${Date.now()}`;
      
      const updatedTrack: Track = {
        ...(preselectedTrack || {}),
        id: trackId,
        songId: `song-${trackId}`,
        title: title,
        artist: artistName || userProfile?.name || 'Unknown Artist',
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
        creator: artistName || userProfile?.name || 'Unknown Artist',
        artist: artistName || userProfile?.name || 'Unknown Artist',
        artistId: userProfile?.uid || 'anonymous',
        price: price,
        imageUrl: finalCoverUrl,
        coverUrl: finalCoverUrl,
        audioUrl: finalAudioUrl,
        edition: `1 of ${editions}`,
        supply: parseInt(editions),
        minted: 1,
        royaltySplits: formattedRoyaltySplits,
        description: description,
        traits: compiledAttributes,
        attributes: compiledAttributes,
        listingType: 'fixed',
        ipfsUrl: ipfsMetadataUrl,
        history: [{
          event: 'Minted',
          from: 'NullAddress',
          to: artistName || userProfile?.name || 'Unknown Artist',
          date: new Date().toISOString(),
          price: price
        }]
      };

      await addUserNFT(newNFT);
      addNFT(newNFT);
      setMintedNFTResult(newNFT);

      updateMintingStatus(activeTrackId, {
        step: 'completed',
        progress: 100,
        message: 'Minting successful!'
      });

      if (userProfile?.uid) {
        await createActivityPost(
          userProfile.uid,
          artistName || userProfile.name || 'Unknown Artist',
          userProfile.avatar || '',
          `minted a new music NFT: "${title}"`,
          'nft_mint',
          {
            targetId: newNFT.id,
            artistName: artistName || userProfile.name || 'Unknown Artist',
            paymentAmount: price,
            paymentCurrency: 'TON'
          }
        ).catch(err => console.error("Failed to log activity post:", err));
      }

      setOverallProgress(100);
      setProgressMsg("Minting successful!");
      addNotification(`"${title}" minted as an NFT on TonJam!`, "success");
      
      if (onSuccess) {
        onSuccess(newNFT);
      }
      setStep(5);
    } catch (e: any) {
      console.error(e);
      updateMintingStatus(activeTrackId, {
        step: 'error',
        message: e.message || "Minting process failed",
        error: e.message || String(e)
      });
      addNotification(e.message || "Minting process failed", "error");
      setStep(1);
    } finally {
      setIsProcessing(false);
      setIsMinting(false);
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
    <>
      <HowToMintTutorial 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)} 
      />
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="w-full max-w-3xl rounded-3xl bg-[#090E1A] text-white p-0 overflow-hidden backdrop-blur-3xl border border-white/10 shadow-2xl">
          <div className="h-1 bg-gradient-to-r from-[#0052FF] via-purple-500 to-emerald-400"></div>

          <div className="p-6 relative max-h-[85vh] overflow-y-auto custom-scrollbar">
            {/* Modal Header */}
            <DialogHeader className="flex flex-row justify-between items-center mb-5 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#0052FF]" /> TonJam Music NFT Minting Studio
                  </DialogTitle>
                  <button
                    type="button"
                    onClick={() => setShowTutorial(true)}
                    className="px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                    title="Open How to Mint Tutorial"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Guide</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">
                  {step <= 3 ? `Step ${step} of 3: ` : ''}{
                    step === 1 ? 'Media Upload & Audio Preview' : 
                    step === 2 ? 'Metadata & TEP-64 Inspection' : 
                    step === 3 ? 'Royalties & Blockchain Contract' : 
                    step === 4 ? 'Processing Blockchain Mint' :
                    'Minting Succeeded!'
                  }
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </DialogHeader>

            {/* Wizard Stepper Progress Bar */}
            <div className="flex items-center justify-between mb-6 bg-white/5 p-2 rounded-2xl border border-white/5">
              {[
                { num: 1, label: '1. Media Upload' },
                { num: 2, label: '2. Metadata' },
                { num: 3, label: '3. Royalties' },
                { num: 4, label: '4. Minting' },
                { num: 5, label: '5. Success' },
              ].map((s) => (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    if (s.num < step && !isProcessing) setStep(s.num as any);
                  }}
                  disabled={s.num > step || isProcessing}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                    step === s.num
                      ? 'bg-[#0052FF] text-white shadow-lg shadow-blue-500/30'
                      : s.num < step
                      ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-800/40 cursor-pointer'
                      : 'text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>{s.label}</span>
                  {s.num < step && <Check className="w-3 h-3 text-blue-300" />}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* STEP 1: MEDIA UPLOAD & AUDIO PREVIEW */}
              {step === 1 && (
                <motion.div
                  key="modal-step-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cover Art Area */}
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Cover Artwork (PNG, JPG, WEBP - Max 10MB)
                      </label>

                      <div 
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingCover(true); }}
                        onDragLeave={() => setIsDraggingCover(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingCover(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) processCoverFile(file);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative w-full aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group ${
                          isDraggingCover
                            ? 'bg-[#0052FF]/20 border-[#0052FF]'
                            : coverPreview
                            ? 'border-blue-500/40'
                            : 'bg-white/5 border-white/10 hover:border-[#0052FF]/50'
                        }`}
                      >
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={(e) => handleFileChange(e, 'cover')} 
                          accept="image/*" 
                          className="hidden" 
                        />
                        {isGeneratingAiCover ? (
                          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-3 p-4 text-center">
                            <Loader2 className="w-8 h-8 text-[#0052FF] animate-spin" />
                            <span className="text-xs font-black text-[#0052FF] uppercase tracking-widest animate-pulse">
                              Synthesizing Cover Art with Gemini AI...
                            </span>
                          </div>
                        ) : coverPreview ? (
                          <>
                            <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                              <ImageIcon className="w-6 h-6 text-slate-400" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white">Upload Artwork</p>
                            <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-1">Drag & drop or click to browse</p>
                          </div>
                        )}
                      </div>

                      {/* AI Cover Art Synthesizer Button */}
                      <div className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> Gemini AI Cover Synthesizer
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={aiCoverPrompt}
                            onChange={(e) => setAiCoverPrompt(e.target.value)}
                            placeholder="Visual prompt (e.g., Cyberpunk neon synthwave city...)"
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#0052FF]"
                          />
                          <button
                            type="button"
                            disabled={isGeneratingAiCover}
                            onClick={async () => {
                              const promptToUse = aiCoverPrompt.trim() || `Album cover for ${title || 'Music Track'} in genre ${genre}, futuristic high resolution 3D render`;
                              setIsGeneratingAiCover(true);
                              try {
                                addNotification("Synthesizing AI cover image...", "info");
                                const response = await fetch('/api/gemini/generate-image', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    title: title || "Music Track",
                                    trackInfo: genre || "Electronic",
                                    prompt: promptToUse
                                  })
                                });
                                if (!response.ok) throw new Error("AI generation failed");
                                const data = await response.json();
                                if (data.imageUrl) {
                                  setCoverPreview(data.imageUrl);
                                  setCoverFile(null);
                                  addNotification("AI Cover Art generated successfully!", "success");
                                } else throw new Error("No image returned");
                              } catch (err) {
                                console.error(err);
                                addNotification("AI Art generation failed. Please upload artwork manually.", "error");
                              } finally {
                                setIsGeneratingAiCover(false);
                              }
                            }}
                            className="px-3 py-1.5 bg-[#0052FF] hover:bg-[#1a66ff] disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                          >
                            Generate
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Audio File Area */}
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Audio Master File (MP3, WAV, FLAC, M4A - Max 50MB)
                      </label>

                      <div 
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingAudio(true); }}
                        onDragLeave={() => setIsDraggingAudio(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingAudio(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) processAudioFile(file);
                        }}
                        onClick={() => !preselectedTrack && audioInputRef.current?.click()}
                        className={`w-full p-5 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${
                          !preselectedTrack ? 'cursor-pointer' : 'opacity-90'
                        } ${
                          isDraggingAudio
                            ? 'bg-[#0052FF]/20 border-[#0052FF]'
                            : audioPreview || audioFile
                            ? 'bg-blue-950/20 border-blue-500/40'
                            : 'bg-white/5 border-white/10 hover:border-[#0052FF]/50'
                        }`}
                      >
                        <input 
                          type="file" 
                          ref={audioInputRef} 
                          onChange={(e) => handleFileChange(e, 'audio')} 
                          accept="audio/*" 
                          className="hidden" 
                        />
                        <div className="w-12 h-12 rounded-2xl bg-[#0052FF]/10 text-[#0052FF] flex items-center justify-center mb-2">
                          <FileAudio className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-wider text-white text-center">
                          {audioFile ? audioFile.name : preselectedTrack ? preselectedTrack.title : 'Drag & Drop Audio Master'}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 text-center">
                          {audioFile ? `${(audioFile.size / (1024 * 1024)).toFixed(2)} MB` : 'or click to browse local files'}
                        </p>
                      </div>

                      {/* Interactive Player Box */}
                      {audioPreview && (
                        <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              type="button"
                              onClick={handleAudioPlaybackToggle}
                              className="w-10 h-10 rounded-full bg-[#0052FF] hover:bg-[#1a66ff] text-white flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-md"
                            >
                              {isPlayingPreview ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                            </button>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">
                                {title || 'Audio Preview'}
                              </p>
                              <p className="text-[10px] text-blue-400 font-mono font-semibold uppercase tracking-wider">
                                {isPlayingPreview ? 'Now Playing Preview...' : 'Ready for IPFS Pinning'}
                              </p>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 bg-blue-500/10 text-blue-300 text-[9px] font-bold rounded-lg border border-blue-500/20 shrink-0">
                            Lossless Master
                          </span>
                        </div>
                      )}

                      {/* Quick Song Title Entry in Step 1 */}
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Song Title <span className="text-rose-400">*</span>
                        </label>
                        <input 
                          type="text" 
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 focus:border-[#0052FF] rounded-xl px-3 py-2 text-xs font-bold outline-none text-white transition-colors"
                          placeholder="Enter song title..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        if (!title.trim()) {
                          addNotification("Please enter a song title", "warning");
                          return;
                        }
                        if (!audioPreview && !audioFile) {
                          addNotification("Please upload an audio file", "warning");
                          return;
                        }
                        if (!coverPreview) {
                          addNotification("Please upload or generate cover art", "warning");
                          return;
                        }
                        setStep(2);
                      }}
                      className="px-6 py-2.5 bg-[#0052FF] hover:bg-[#1a66ff] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <span>Next: Metadata & TEP-64</span> <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: METADATA GENERATION & TEP-64 INSPECTOR */}
              {step === 2 && (
                <motion.div
                  key="modal-step-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5"
                >
                  {/* Mode Switcher: Form vs TEP-64 JSON Inspector */}
                  <div className="flex items-center justify-between bg-white/5 p-1.5 rounded-xl border border-white/10">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-300 px-2 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-[#0052FF]" /> TEP-64 NFT Metadata Studio
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setMetadataViewMode('form')}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                          metadataViewMode === 'form' ? 'bg-[#0052FF] text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" /> Form Fields
                      </button>
                      <button
                        type="button"
                        onClick={() => setMetadataViewMode('json')}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                          metadataViewMode === 'json' ? 'bg-[#0052FF] text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Code className="w-3.5 h-3.5" /> TEP-64 JSON Cell
                      </button>
                    </div>
                  </div>

                  {metadataViewMode === 'form' ? (
                    <div className="space-y-4">
                      {/* AI Lore Generator Callout */}
                      <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-2xl flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Lore & Attribute Generator
                          </p>
                          <p className="text-[10px] text-slate-400">Generate creative lore & metadata tags with Gemini AI</p>
                        </div>
                        <button
                          type="button"
                          disabled={isGeneratingAiLore}
                          onClick={async () => {
                            setIsGeneratingAiLore(true);
                            try {
                              addNotification("Generating track lore with Gemini...", "info");
                              const response = await fetch('/api/gemini/generate-lore', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ title, artistName, genre })
                              }).catch(() => null);

                              if (response && response.ok) {
                                const data = await response.json();
                                if (data.lore) setDescription(data.lore);
                              } else {
                                // Fallback generated lore
                                setDescription(`"${title}" is a groundbreaking ${genre} master composition by ${artistName}. Encoded as a TEP-64 compliant digital collectible on TON with lossless audio stems.`);
                              }
                              addNotification("Track lore generated!", "success");
                            } catch (e) {
                              addNotification("Generated fallback lore for track", "info");
                            } finally {
                              setIsGeneratingAiLore(false);
                            }
                          }}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all shrink-0 cursor-pointer"
                        >
                          {isGeneratingAiLore ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Auto-Generate'}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Artist Name</label>
                          <input 
                            type="text" 
                            value={artistName}
                            onChange={(e) => setArtistName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-[#0052FF]"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Album / Collection</label>
                          <input 
                            type="text" 
                            value={album}
                            onChange={(e) => setAlbum(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-[#0052FF]"
                            placeholder="Genesis Single"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Genre</label>
                          <select
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            className="w-full bg-[#0A1021] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-[#0052FF]"
                          >
                            {['Electronic', 'Hip Hop', 'Rock', 'Pop', 'Jazz', 'Classical', 'Ambient', 'Techno', 'Synthwave', 'Phonk'].map(g => (
                              <option key={g} value={g} className="bg-[#0A1021]">{g}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">BPM & Key Signature</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={bpm}
                              onChange={(e) => setBpm(e.target.value)}
                              placeholder="128 BPM"
                              className="w-1/2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-[#0052FF]"
                            />
                            <input 
                              type="text" 
                              value={keySig}
                              onChange={(e) => setKeySig(e.target.value)}
                              placeholder="Key (A minor)"
                              className="w-1/2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-[#0052FF]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Editions Supply</label>
                          <input 
                            type="number" 
                            value={editions}
                            onChange={(e) => setEditions(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-[#0052FF]"
                            placeholder="100"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Minting Price (TON)</label>
                          <input 
                            type="number" 
                            step="0.1"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-[#0052FF]"
                            placeholder="2.5"
                          />
                        </div>
                      </div>

                      {/* Rarity Tier */}
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Rarity Tier</label>
                        <div className="grid grid-cols-5 gap-1.5">
                          {['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'].map((tier) => (
                            <button
                              key={tier}
                              type="button"
                              onClick={() => setRarityTier(tier as any)}
                              className={`py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${
                                rarityTier === tier
                                  ? 'bg-[#0052FF] text-white border-[#0052FF]'
                                  : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                              }`}
                            >
                              {tier}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Description / Lore</label>
                        <textarea 
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:border-[#0052FF] h-16 resize-none"
                          placeholder="Song backstory or creative concept..."
                        />
                      </div>

                      {/* Custom Attributes / Traits Editor */}
                      <div className="space-y-2">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Custom NFT Attributes & Traits
                        </label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={newTraitKey}
                            onChange={(e) => setNewTraitKey(e.target.value)}
                            placeholder="Trait Name (e.g., Vocal Type)"
                            className="w-1/2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                          />
                          <input 
                            type="text" 
                            value={newTraitValue}
                            onChange={(e) => setNewTraitValue(e.target.value)}
                            placeholder="Trait Value (e.g., Studio Solo)"
                            className="w-1/2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomTrait}
                            className="px-3 py-1.5 bg-[#0052FF] text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                          >
                            Add
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                          {customTraits.map((trait, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-mono text-slate-300 flex items-center gap-1.5">
                              <strong>{trait.trait_type}:</strong> {trait.value}
                              <button onClick={() => handleRemoveCustomTrait(idx)} className="text-rose-400 hover:text-rose-300">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Live TEP-64 JSON Metadata Inspector */
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-blue-400 uppercase font-bold">
                          TEP-64 IPFS JSON Metadata Payload Preview
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(constructedTep64Metadata, null, 2));
                            toast.success("JSON copied to clipboard!");
                          }}
                          className="text-[9px] font-black text-blue-400 uppercase tracking-wider flex items-center gap-1 hover:text-blue-300"
                        >
                          <Copy className="w-3 h-3" /> Copy JSON
                        </button>
                      </div>

                      <pre className="p-4 bg-black/80 border border-white/10 rounded-2xl text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-64 custom-scrollbar">
                        {JSON.stringify(constructedTep64Metadata, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-5 py-2.5 bg-[#0052FF] hover:bg-[#1a66ff] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <span>Next: Royalties & Contract</span> <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: ROYALTIES & BLOCKCHAIN SMART CONTRACT */}
              {step === 3 && (
                <motion.div
                  key="modal-step-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5"
                >
                  {/* TON Wallet Status Callout */}
                  <div className="p-3.5 bg-blue-950/20 border border-blue-500/30 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#0052FF]/20 text-[#0052FF] flex items-center justify-center shrink-0">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">
                          {userAddress ? 'TON Wallet Connected' : 'Wallet Connection Required'}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 truncate max-w-xs">
                          {userAddress ? userAddress : 'Connect Tonkeeper / OpenMask to sign mint message'}
                        </p>
                      </div>
                    </div>
                    {!userAddress && (
                      <button
                        type="button"
                        onClick={() => tonConnectUI.openModal()}
                        className="px-3 py-1.5 bg-[#0052FF] text-white font-bold text-[10px] uppercase rounded-xl shrink-0"
                      >
                        Connect TON
                      </button>
                    )}
                  </div>

                  {/* Blockchain Network Selector */}
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Select Target Network
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'ton-mainnet', title: 'TON Mainnet', label: 'Production', fee: '~0.05 TON' },
                        { id: 'ton-testnet', title: 'TON Testnet', label: 'Sandbox', fee: 'Free Testnet' },
                        { id: 'ton-miniapp', title: 'Mini App Node', label: 'Instant', fee: '~0.02 TON' },
                      ].map((net) => (
                        <div
                          key={net.id}
                          onClick={() => setBlockchain(net.id as any)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                            blockchain === net.id
                              ? 'bg-[#0052FF]/20 border-[#0052FF] text-white'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold">{net.title}</span>
                          </div>
                          <span className="text-[8px] font-mono text-blue-400 block mt-0.5">Est. Gas: {net.fee}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Secondary Royalty % */}
                  <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">Secondary Marketplace Royalty %</span>
                      <span className="text-sm font-black text-[#0052FF] font-mono">{secondaryRoyalty}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      step="0.5"
                      value={secondaryRoyalty}
                      onChange={(e) => setSecondaryRoyalty(e.target.value)}
                      className="w-full accent-[#0052FF] cursor-pointer"
                    />
                  </div>

                  {/* Primary Revenue Splits */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Primary Sale Splits (Total = 100%)
                      </label>
                      <button 
                        type="button"
                        onClick={() => setRoyaltySplits([...royaltySplits, { address: '', percentage: 0, label: 'Collaborator' }])}
                        className="text-[9px] font-black text-[#0052FF] uppercase tracking-wider flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Collaborator
                      </button>
                    </div>

                    <div className="space-y-2 max-h-28 overflow-y-auto custom-scrollbar">
                      {royaltySplits.map((split, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input 
                            type="text" 
                            value={split.address}
                            onChange={(e) => {
                              const updated = [...royaltySplits];
                              updated[index].address = e.target.value;
                              setRoyaltySplits(updated);
                            }}
                            placeholder="Collaborator TON Address (EQ...)"
                            className="flex-1 bg-white/5 rounded-lg px-3 py-1.5 text-xs font-mono outline-none text-white border border-white/10"
                          />
                          <input 
                            type="number" 
                            value={split.percentage || ''}
                            onChange={(e) => {
                              const updated = [...royaltySplits];
                              updated[index].percentage = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                              setRoyaltySplits(updated);
                            }}
                            placeholder="%"
                            className="w-14 bg-white/5 rounded-lg px-2 py-1.5 text-xs font-bold outline-none text-white text-center border border-white/10"
                          />
                          {index > 0 && (
                            <button 
                              type="button"
                              onClick={() => setRoyaltySplits(royaltySplits.filter((_, i) => i !== index))}
                              className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                      <span>Target total: 100%</span>
                      <span className={totalRoyalty === 100 ? 'text-green-400' : 'text-rose-400'}>
                        Current total: {totalRoyalty}%
                      </span>
                    </div>
                  </div>

                  {/* Copyright Attestation */}
                  <div className="p-3 bg-blue-950/20 border border-blue-500/30 rounded-xl flex items-start gap-2 text-xs text-slate-300">
                    <input
                      type="checkbox"
                      id="modal-terms-check"
                      checked={termsConfirmed}
                      onChange={(e) => setTermsConfirmed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[#0052FF] cursor-pointer"
                    />
                    <label htmlFor="modal-terms-check" className="cursor-pointer select-none text-[10px] leading-tight">
                      <strong>Rights Attestation:</strong> I confirm that I hold all intellectual property rights to this song and artwork and authorise its minting on TON.
                    </label>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-2 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={handleInitiateMint}
                      disabled={!termsConfirmed || totalRoyalty !== 100}
                      className="px-6 py-2.5 bg-[#0052FF] hover:bg-[#1a66ff] disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Zap className="w-4 h-4 fill-white" />
                      <span>Confirm & Mint NFT</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: MINTING EXECUTION IN PROGRESS */}
              {step === 4 && (
                <motion.div
                  key="modal-step-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-8 flex flex-col items-center justify-center text-center space-y-5"
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full blur-xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-40 animate-pulse"></div>
                    <Loader2 className="w-12 h-12 text-[#0052FF] animate-spin relative z-10" />
                  </div>

                  <div className="space-y-1 max-w-sm">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white animate-pulse">
                      Minting Music NFT on TON
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {progressMsg}
                    </p>
                  </div>

                  {/* Progress Checklist */}
                  <div className="w-full max-w-sm bg-black/40 border border-white/10 p-3.5 rounded-2xl text-left space-y-2">
                    {[
                      { step: 20, label: 'Audio Master IPFS Pin' },
                      { step: 45, label: 'Cover Art Artwork IPFS Pin' },
                      { step: 65, label: 'TEP-64 JSON Metadata Cell Creation' },
                      { step: 80, label: 'TON Smart Contract Execution' },
                      { step: 95, label: 'Database Registry Synchronization' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-[10px] font-mono">
                        <span className={overallProgress >= item.step ? 'text-green-400 font-bold' : 'text-slate-500'}>
                          {item.label}
                        </span>
                        {overallProgress >= item.step ? (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Loader2 className="w-3.5 h-3.5 text-slate-600 animate-spin" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-[#0052FF] to-emerald-400"
                      initial={{ width: '0%' }}
                      animate={{ width: `${overallProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-blue-400">
                    {overallProgress}% Complete
                  </span>
                </motion.div>
              )}

              {/* STEP 5: SUCCESS & RECEIPT */}
              {step === 5 && (
                <motion.div
                  key="modal-step-5"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 flex flex-col items-center justify-center text-center space-y-5"
                >
                  <div className="w-14 h-14 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center border border-green-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">
                      Music NFT Minted Succeeded!
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider max-w-sm mx-auto">
                      Your track "{title}" is pinned to IPFS and minted on the TON Blockchain.
                    </p>
                  </div>

                  {/* Minted NFT Card Summary */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 text-left max-w-sm w-full">
                    <img src={coverPreview} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/10" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{title}</p>
                      <p className="text-[10px] text-slate-400 truncate">by {artistName}</p>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold block mt-1">
                        Editions: {editions} • Price: {price} TON
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <a
                      href={`https://tonviewer.com/${TONJAM_COLLECTION_ADDRESS}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-blue-400" /> TonViewer
                    </a>

                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-6 py-2 bg-[#0052FF] hover:bg-[#1a66ff] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      Close Studio
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MintNFTModal;
