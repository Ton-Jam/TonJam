import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HowToMintTutorial } from '@/components/HowToMintTutorial';
import { 
  X, Music, Image as ImageIcon, Sparkles, Zap, Database, Cloud, 
  Loader2, Check, Plus, Trash2, Volume2, Info, ChevronRight, Play, Square,
  Flame, Disc, Crown, Tag, Sliders, Radio, Percent, ShieldCheck, FileAudio, HelpCircle
} from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { useNFT } from '@/contexts/NFTContext';
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
  const { addNFT, updateMintingStatus, setIsMinting } = useNFT();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress() || userProfile?.walletAddress || '';

  // 1. Media & Basic Info | 2. Royalties & Blockchain | 3. Review & Confirm | 4. Processing | 5. Success
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [overallProgress, setOverallProgress] = useState(0);

  // Form Fields
  const [title, setTitle] = useState(preselectedTrack?.title || '');
  const [artistName, setArtistName] = useState(preselectedTrack?.artist || userProfile?.name || 'Artist');
  const [album, setAlbum] = useState((preselectedTrack as any)?.albumName || (preselectedTrack as any)?.album || '');
  const [genre, setGenre] = useState(preselectedTrack?.genre || 'Electronic');
  const [description, setDescription] = useState(preselectedTrack?.description || '');
  const [price, setPrice] = useState(preselectedTrack?.price || '2.5');
  const [editions, setEditions] = useState(preselectedTrack?.editions || '100');
  const [lyrics, setLyrics] = useState(preselectedTrack?.lyrics || '');
  const [secondaryRoyalty, setSecondaryRoyalty] = useState('5'); // 0 - 15%
  const [blockchain, setBlockchain] = useState<'ton-mainnet' | 'ton-testnet' | 'ton-miniapp'>('ton-mainnet');
  const [termsConfirmed, setTermsConfirmed] = useState(false);

  // Rarity Tags & Custom Attributes
  const [rarityTier, setRarityTier] = useState<'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic'>('Common');
  const [customTraits, setCustomTraits] = useState<NFTTrait[]>([
    { trait_type: 'Edition Type', value: 'Genesis First Drop' },
    { trait_type: 'Audio Master', value: '24-bit Lossless Studio' },
    { trait_type: 'Perk', value: 'Master Stems Access' }
  ]);
  const [newTraitKey, setNewTraitKey] = useState('');
  const [newTraitValue, setNewTraitValue] = useState('');

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
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const totalRoyalty = royaltySplits.reduce((acc, curr) => acc + (Number(curr.percentage) || 0), 0);

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
      setStep(2);
      return;
    }

    if (!termsConfirmed) {
      addNotification("Please confirm ownership attestation to proceed", "warning");
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

      const formattedRoyaltySplits = royaltySplits.map(s => ({
        address: s.address,
        percentage: (Number(s.percentage) || 0) / 100,
        label: s.label || 'Collaborator'
      }));

      const attributesList: NFTTrait[] = [
        { trait_type: "Artist Name", value: artistName || userProfile?.name || 'Artist' },
        { trait_type: "Album", value: album || 'Single Release' },
        { trait_type: "Rarity", value: rarityTier },
        { trait_type: "Genre", value: genre },
        { trait_type: "Secondary Royalty %", value: `${secondaryRoyalty}%` },
        { trait_type: "Blockchain Network", value: blockchain },
        { trait_type: "RoyaltySplits", value: JSON.stringify(formattedRoyaltySplits) },
        { trait_type: "Editions", value: editions },
        ...customTraits,
        ...(lyrics ? [{ trait_type: "Lyrics", value: lyrics }] : [])
      ];

      const metadata = {
        name: title,
        description: description,
        image: finalCoverUrl,
        animation_url: finalAudioUrl,
        attributes: attributesList,
        traits: attributesList
      };

      const ipfsMetadataUrl = await uploadJSONToPinata(metadata);

      // 4. Submit to blockchain
      setOverallProgress(80);
      setProgressMsg("Broadcasting transaction. Please approve in your wallet...");
      updateMintingStatus(activeTrackId, {
        step: 'blockchain',
        progress: 80,
        message: 'Broadcasting transaction. Please approve in your wallet...'
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
        traits: attributesList,
        attributes: attributesList,
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
        <DialogContent className="w-full max-w-2xl rounded-2xl bg-[#090E1A] text-white p-0 overflow-hidden backdrop-blur-3xl border border-white/10">
          <div className="h-1 bg-gradient-to-r from-[#0052FF] via-purple-500 to-blue-400"></div>

          <div className="p-6 relative max-h-[85vh] overflow-y-auto custom-scrollbar">
            <DialogHeader className="flex flex-row justify-between items-center mb-6 border-b border-white/10 pb-4">
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
                    step === 1 ? 'Media & Basic Track Details' : 
                    step === 2 ? 'Royalties & Blockchain Selection' : 
                    step === 3 ? 'Review & Confirmation' : 
                    step === 4 ? 'Processing Blockchain Mint' :
                    'Minting Completed!'
                  }
                </p>
              </div>
              <button 
                onClick={handleClose}
                disabled={isProcessing}
                className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogHeader>

          <AnimatePresence mode="wait">
            {/* STEP 1: MEDIA & BASIC METADATA */}
            {step === 1 && (
              <motion.div
                key="modal-step-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Media Uploads */}
                  <div className="space-y-4">
                    {/* Cover Art Upload Area */}
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-full aspect-square bg-white/5 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#0052FF]/50 transition-all overflow-hidden group"
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
                            <ImageIcon className="w-8 h-8 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                            <ImageIcon className="w-6 h-6 text-slate-400" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white">Upload Cover Art</p>
                          <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-1">PNG, JPG or WEBP (Max 10MB)</p>
                        </div>
                      )}
                    </div>

                    {/* Audio File Upload Area */}
                    <div 
                      onClick={() => !preselectedTrack && audioInputRef.current?.click()}
                      className={`w-full p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 transition-all ${
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
                      <div className="w-9 h-9 rounded-lg bg-[#0052FF]/10 text-[#0052FF] flex items-center justify-center shrink-0">
                        <Music className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white">
                          {preselectedTrack ? 'Track Selected' : audioFile ? 'Audio File Loaded' : 'Upload Audio Master'}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 truncate mt-0.5">
                          {preselectedTrack ? preselectedTrack.title : audioFile ? audioFile.name : 'MP3, WAV or M4A'}
                        </p>
                      </div>
                      {audioPreview && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAudioPlaybackToggle();
                          }}
                          className="p-2 bg-[#0052FF] hover:bg-[#1a66ff] text-white rounded-lg transition-colors shrink-0 cursor-pointer"
                        >
                          {isPlayingPreview ? <Square className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Metadata Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Song Title *</label>
                      <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-[#0052FF] rounded-xl px-3 py-2 text-xs font-bold outline-none text-white transition-colors"
                        placeholder="Song Title"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Artist Name</label>
                      <input 
                        type="text" 
                        value={artistName}
                        onChange={(e) => setArtistName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-[#0052FF] rounded-xl px-3 py-2 text-xs font-bold outline-none text-white transition-colors"
                        placeholder="Artist / Stage Name"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Album / Collection</label>
                      <input 
                        type="text" 
                        value={album}
                        onChange={(e) => setAlbum(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-[#0052FF] rounded-xl px-3 py-2 text-xs font-bold outline-none text-white transition-colors"
                        placeholder="e.g., Genesis Album or Single"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Genre</label>
                        <select
                          value={genre}
                          onChange={(e) => setGenre(e.target.value)}
                          className="w-full bg-[#0A1021] border border-white/10 focus:border-[#0052FF] rounded-xl px-3 py-2 text-xs font-bold outline-none text-white transition-colors"
                        >
                          {['Electronic', 'Hip Hop', 'Rock', 'Pop', 'Jazz', 'Classical', 'Ambient', 'Techno', 'Synthwave', 'Phonk'].map(g => (
                            <option key={g} value={g} className="bg-[#0A1021]">{g}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Editions Supply</label>
                        <input 
                          type="number" 
                          value={editions}
                          onChange={(e) => setEditions(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 focus:border-[#0052FF] rounded-xl px-3 py-2 text-xs font-bold outline-none text-white transition-colors"
                          placeholder="100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Minting Price (TON)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-[#0052FF] rounded-xl px-3 py-2 text-xs font-bold outline-none text-white transition-colors"
                        placeholder="2.5"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Description / Lore</label>
                      <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-[#0052FF] rounded-xl px-3 py-2 text-xs font-semibold outline-none text-white transition-colors h-16 resize-none"
                        placeholder="Song backstory or creative concept..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-white/10">
                  <button
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
                        addNotification("Please upload cover art", "warning");
                        return;
                      }
                      setStep(2);
                    }}
                    className="px-5 py-2.5 bg-[#0052FF] hover:bg-[#1a66ff] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    Next: Royalties & Blockchain <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: ROYALTIES & BLOCKCHAIN SELECTION */}
            {step === 2 && (
              <motion.div
                key="modal-step-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                {/* Blockchain Network Selector */}
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Select Target Blockchain Network
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'ton-mainnet', title: 'TON Mainnet', label: 'Recommended', fee: '~0.05 TON' },
                      { id: 'ton-testnet', title: 'TON Testnet', label: 'Sandbox', fee: 'Free (Test)' },
                      { id: 'ton-miniapp', title: 'Mini App Storage', label: 'Instant', fee: '~0.02 TON' },
                    ].map((net) => (
                      <div
                        key={net.id}
                        onClick={() => setBlockchain(net.id as any)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          blockchain === net.id
                            ? 'bg-[#0052FF]/20 border-[#0052FF] text-white'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold">{net.title}</span>
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-blue-300">{net.label}</span>
                        </div>
                        <span className="text-[9px] font-mono text-blue-400 block mt-1">Fee: {net.fee}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Secondary Royalty % */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
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
                  <div className="flex justify-between text-[8px] text-slate-400 font-mono">
                    <span>0%</span>
                    <span>5% (Default)</span>
                    <span>15% (Max)</span>
                  </div>
                </div>

                {/* Royalty Splits */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Primary Revenue Splits (Total = 100%)
                    </label>
                    <button 
                      onClick={() => setRoyaltySplits([...royaltySplits, { address: '', percentage: 0, label: 'Collaborator' }])}
                      className="text-[9px] font-black text-[#0052FF] uppercase tracking-wider flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Collaborator
                    </button>
                  </div>

                  <div className="space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
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

                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (totalRoyalty !== 100) {
                        addNotification(`Royalty splits must total 100% (currently ${totalRoyalty}%)`, "warning");
                        return;
                      }
                      setStep(3);
                    }}
                    className="px-5 py-2.5 bg-[#0052FF] hover:bg-[#1a66ff] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Proceed to Final Review</span> <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: REVIEW & CONFIRMATION STEP */}
            {step === 3 && (
              <motion.div
                key="modal-step-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-4">
                  <div className="flex items-center gap-3">
                    <img src={coverPreview} alt="" className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-black text-white truncate">{title}</h4>
                      <p className="text-xs text-slate-400 font-semibold truncate">by {artistName}</p>
                      <span className="text-[9px] font-bold text-blue-400 uppercase font-mono mt-1 block">
                        {genre} • {price} TON • {editions} Editions
                      </span>
                    </div>
                    {audioPreview && (
                      <button
                        onClick={handleAudioPlaybackToggle}
                        className="p-2 bg-[#0052FF] hover:bg-[#1a66ff] text-white rounded-full transition-colors cursor-pointer"
                      >
                        {isPlayingPreview ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-white/10 pt-3">
                    <div className="bg-white/5 p-2 rounded-lg">
                      <span className="text-slate-400 block font-sans">Secondary Royalty</span>
                      <span className="text-green-400 font-bold">{secondaryRoyalty}%</span>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg">
                      <span className="text-slate-400 block font-sans">Blockchain Network</span>
                      <span className="text-blue-300 font-bold">{blockchain}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-950/20 border border-blue-500/30 rounded-xl flex items-start gap-2.5 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    id="modal-terms-check"
                    checked={termsConfirmed}
                    onChange={(e) => setTermsConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#0052FF] cursor-pointer"
                  />
                  <label htmlFor="modal-terms-check" className="cursor-pointer select-none text-[11px] leading-tight">
                    <strong>Copyright Confirmation:</strong> I attest that I own all rights to this song and image, and agree to mint it on TON.
                  </label>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 py-2 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Back
                  </button>

                  <button
                    onClick={handleInitiateMint}
                    disabled={!termsConfirmed}
                    className="px-6 py-3 bg-[#0052FF] hover:bg-[#1a66ff] disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Confirm & Mint NFT</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: MINTING IN PROGRESS */}
            {step === 4 && (
              <motion.div
                key="modal-step-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-10 flex flex-col items-center justify-center text-center space-y-5"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-40 animate-pulse"></div>
                  <Loader2 className="w-14 h-14 text-[#0052FF] animate-spin relative z-10" />
                </div>
                <div className="space-y-1.5 max-w-xs">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white animate-pulse">
                    Minting Music NFT
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {progressMsg}
                  </p>
                </div>

                <div className="w-56 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-[#0052FF] to-purple-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${overallProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-400">
                  {overallProgress}%
                </span>
              </motion.div>
            )}

            {/* STEP 5: SUCCESS */}
            {step === 5 && (
              <motion.div
                key="modal-step-5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 flex flex-col items-center justify-center text-center space-y-5"
              >
                <div className="w-14 h-14 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center">
                  <Check className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">
                    Music NFT Minted Succeeded!
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider max-w-sm mx-auto">
                    Your track "{title}" is now pinned to IPFS and minted as an NFT on the TON Blockchain.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleClose}
                    className="px-6 py-2.5 bg-white text-black font-black text-xs uppercase tracking-wider rounded-xl hover:scale-105 transition-all cursor-pointer"
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
