import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Music, Image as ImageIcon, Box, Loader2, Upload, Info, Check, ChevronRight, Plus, 
  Percent, Cloud, Zap, Sparkles, Database, Flame, Disc, Crown, Tag, Sliders, Trash2,
  Play, Square, ShieldCheck, ArrowLeft, Globe, FileAudio, ExternalLink, Layers, Radio,
  Lock, ArrowRight, HelpCircle
} from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { validateFile, ALLOWED_IMAGE_TYPES, ALLOWED_AUDIO_TYPES } from '@/lib/utils';
import { uploadToPinata, uploadJSONToPinata } from '@/services/storageService';
import { Track, NFTItem, RoyaltySplitExtended, NFTTrait } from '@/types';
import { BackButton } from '@/components/BackButton';
import MintingProgressOverlay, { MintingStep } from '@/components/MintingProgressOverlay';
import { HowToMintTutorial } from '@/components/HowToMintTutorial';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { mintTonJamNFT } from '@/services/tonService';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export const ArtistMinting: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, addUserTrack, addUserNFT, addNotification, allTracks } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  const connectedAddress = useTonAddress() || userProfile?.walletAddress || '';
  
  // 4-Step Flow: 1. Upload Media | 2. Track Metadata | 3. Royalties & Network | 4. Review & Confirm
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'default' | 'transaction' | 'upload' | 'mint'>('default');
  const [loadingMessage, setLoadingMessage] = useState('Processing...');
  
  const [mintingSteps, setMintingSteps] = useState<MintingStep[]>([
    { id: 'upload_audio', label: 'Audio Master IPFS Pin', status: 'pending', description: 'Pinata Gateway lossless audio upload', icon: FileAudio },
    { id: 'upload_cover', label: 'Cover Art IPFS Pin', status: 'pending', description: 'Pinata Gateway artwork deployment', icon: ImageIcon },
    { id: 'metadata', label: 'Decentralized Metadata', status: 'pending', description: 'TEP-64 standard encoding & JSON pin', icon: Sparkles },
    { id: 'transaction', label: 'Blockchain Transaction', status: 'pending', description: 'TON Smart Contract deployment', icon: Zap },
    { id: 'registry', label: 'Platform Synchronization', status: 'pending', description: 'Registry indexing & database sync', icon: Database },
  ]);
  const [overallProgress, setOverallProgress] = useState(0);

  const artistTracks = allTracks.filter(t => t.artistId === userProfile.uid && !t.isNFT);

  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  
  // Form State
  const [trackData, setTrackData] = useState({
    title: '',
    artistName: userProfile?.name || 'Artist',
    album: '',
    genre: 'Electronic',
    description: '',
    coverFile: null as File | null,
    audioFile: null as File | null,
    coverPreview: '',
    audioPreview: '',
    price: '2.5',
    editions: '100',
    lyrics: '',
    secondaryRoyalty: '5', // Secondary marketplace royalty percentage (0-15%)
    blockchain: 'ton-mainnet' as 'ton-mainnet' | 'ton-testnet' | 'ton-miniapp',
    hasExclusive: false,
    exclusiveTitle: '',
    exclusiveType: 'document' as 'video' | 'track' | 'image' | 'document',
    exclusiveUrl: '',
    exclusiveDescription: '',
    listingType: 'fixed' as 'fixed' | 'auction',
    startingBid: '1.0',
    auctionDuration: '3'
  });

  const [termsConfirmed, setTermsConfirmed] = useState(false);

  // Royalty Collaborator Splits (Primary sale distribution)
  const [royaltySplits, setRoyaltySplits] = useState<RoyaltySplitExtended[]>([
    { address: connectedAddress || userProfile?.walletAddress || '', percentage: 100, label: 'Creator' }
  ]);

  // Rarity Tags & Custom Metadata Attributes
  const [rarityTier, setRarityTier] = useState<'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic'>('Common');
  const [customTraits, setCustomTraits] = useState<NFTTrait[]>([
    { trait_type: 'Edition Type', value: 'Genesis First Drop' },
    { trait_type: 'Audio Master', value: '24-bit Lossless Studio' },
    { trait_type: 'Perk', value: 'Master Stems Access' }
  ]);
  const [newTraitKey, setNewTraitKey] = useState('');
  const [newTraitValue, setNewTraitValue] = useState('');

  // Generative AI Cover Art State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAiCover, setIsGeneratingAiCover] = useState(false);

  // Drag and Drop States
  const [isDraggingAudio, setIsDraggingAudio] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);

  // Audio Player Preview
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Interactive 'How to Mint' tutorial overlay state
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('tonjam_mint_tutorial_dismissed');
    if (isDismissed !== 'true') {
      setShowTutorial(true);
    }
  }, []);

  // Clean up audio player on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Sync selected track if user selects from existing catalog
  useEffect(() => {
    if (selectedTrack) {
      setTrackData(prev => ({
        ...prev,
        title: selectedTrack.title,
        album: (selectedTrack as any).albumName || (selectedTrack as any).album || '',
        genre: selectedTrack.genre || 'Electronic',
        description: selectedTrack.description || '',
        coverPreview: selectedTrack.coverUrl,
        audioPreview: selectedTrack.audioUrl,
        price: selectedTrack.price || '2.5',
        editions: selectedTrack.editions || '100',
        lyrics: selectedTrack.lyrics || '',
        hasExclusive: selectedTrack.isExclusive || false,
      }));
      
      const extendedSplits: RoyaltySplitExtended[] = (selectedTrack.royaltySplits || []).map(s => ({
        address: s.address,
        percentage: s.percentage,
        label: s.label || 'Collaborator'
      }));
      
      setRoyaltySplits(extendedSplits.length > 0 ? extendedSplits : [{ address: connectedAddress || userProfile?.walletAddress || '', percentage: 100, label: 'Creator' }]);
      setStep(2);
    }
  }, [selectedTrack, userProfile, connectedAddress]);

  const handleAudioPlaybackToggle = () => {
    const srcToPlay = trackData.audioPreview || (trackData.audioFile ? URL.createObjectURL(trackData.audioFile) : '');
    if (!srcToPlay) {
      addNotification("No audio file loaded to play", "warning");
      return;
    }

    if (isPlayingPreview) {
      audioRef.current?.pause();
      setIsPlayingPreview(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(srcToPlay);
        audioRef.current.onended = () => setIsPlayingPreview(false);
      } else {
        audioRef.current.src = srcToPlay;
      }
      audioRef.current.play().catch(e => {
        console.warn("Audio preview error:", e);
        toast.error("Could not play audio preview");
      });
      setIsPlayingPreview(true);
    }
  };

  const processAudioFile = (file: File) => {
    const validation = validateFile(file, 'audio', 50);
    if (!validation.isValid) {
      addNotification(validation.error || "Invalid audio file", "error");
      return;
    }
    const audioUrl = URL.createObjectURL(file);
    setTrackData(prev => ({
      ...prev,
      audioFile: file,
      audioPreview: audioUrl,
      title: prev.title || file.name.replace(/\.[^/.]+$/, "")
    }));
    addNotification(`Audio track "${file.name}" loaded successfully!`, "success");
  };

  const processCoverFile = (file: File) => {
    const validation = validateFile(file, 'image', 10);
    if (!validation.isValid) {
      addNotification(validation.error || "Invalid cover image", "error");
      return;
    }
    const coverUrl = URL.createObjectURL(file);
    setTrackData(prev => ({
      ...prev,
      coverFile: file,
      coverPreview: coverUrl
    }));
    addNotification("Cover art uploaded successfully!", "success");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === 'cover') processCoverFile(file);
    else processAudioFile(file);
  };

  const totalSplitsPercentage = royaltySplits.reduce((acc, curr) => acc + (Number(curr.percentage) || 0), 0);

  const handleFinalMintSubmit = async () => {
    if (!trackData.title.trim()) {
      addNotification("Please enter a song title", "error");
      setStep(2);
      return;
    }

    if (!selectedTrack && !trackData.audioFile && !trackData.audioPreview) {
      addNotification("Please upload an audio file first", "error");
      setStep(1);
      return;
    }

    if (!trackData.coverPreview && !trackData.coverFile) {
      addNotification("Please upload or generate cover art", "error");
      setStep(1);
      return;
    }

    if (totalSplitsPercentage !== 100) {
      addNotification(`Royalty splits must sum to 100%. Current sum: ${totalSplitsPercentage}%`, "error");
      setStep(3);
      return;
    }

    if (!termsConfirmed) {
      addNotification("Please confirm ownership and copyright attestation to proceed", "warning");
      return;
    }

    const wallet = tonConnectUI.wallet?.account.address || connectedAddress;
    if (!wallet) {
      addNotification("Please connect your TON wallet to mint", "warning");
      tonConnectUI.openModal();
      return;
    }
    
    setIsLoading(true);
    setLoadingType('upload');
    setLoadingMessage('Deploying audio & visual media to IPFS via Pinata...');
    
    setMintingSteps(steps => steps.map(s => ({ ...s, status: 'pending' })));
    setOverallProgress(5);

    const updateStepStatus = (id: string, status: 'pending' | 'processing' | 'completed' | 'error', progress: number) => {
      setMintingSteps(steps => steps.map(s => s.id === id ? { ...s, status } : s));
      setOverallProgress(progress);
    };

    try {
      updateStepStatus('upload_audio', 'processing', 10);
      let finalAudioUrl = selectedTrack?.audioUrl || trackData.audioPreview;
      let finalCoverUrl = selectedTrack?.coverUrl || trackData.coverPreview;

      // 1. Upload audio to Pinata IPFS
      if (trackData.audioFile) {
        setLoadingMessage('Broadcasting lossless audio master to IPFS network...');
        finalAudioUrl = await uploadToPinata(trackData.audioFile);
      }
      updateStepStatus('upload_audio', 'completed', 25);
      
      // 2. Upload cover art to Pinata IPFS
      updateStepStatus('upload_cover', 'processing', 30);
      if (trackData.coverFile) {
        setLoadingMessage('Transmitting artwork image to IPFS Pinata cluster...');
        finalCoverUrl = await uploadToPinata(trackData.coverFile);
      }
      updateStepStatus('upload_cover', 'completed', 45);
      
      // 3. Metadata
      updateStepStatus('metadata', 'processing', 50);
      setLoadingType('mint');
      setLoadingMessage('Encoding TEP-64 compliant JSON NFT metadata...');

      const royaltySplitsDecimals = royaltySplits.map(s => ({
        ...s,
        percentage: (Number(s.percentage) || 0) / 100
      }));

      const attributesList: NFTTrait[] = [
        { trait_type: "Artist Name", value: trackData.artistName || userProfile?.name || 'Artist' },
        { trait_type: "Album", value: trackData.album || 'Single Release' },
        { trait_type: "Rarity", value: rarityTier },
        { trait_type: "Genre", value: trackData.genre },
        { trait_type: "Secondary Royalty %", value: `${trackData.secondaryRoyalty}%` },
        { trait_type: "Blockchain Network", value: trackData.blockchain },
        { trait_type: "RoyaltySplits", value: JSON.stringify(royaltySplitsDecimals) },
        { trait_type: "Editions", value: trackData.editions },
        ...customTraits,
        ...(trackData.lyrics ? [{ trait_type: "Lyrics", value: trackData.lyrics }] : []),
        ...(trackData.hasExclusive ? [
          { trait_type: "ExclusiveTitle", value: trackData.exclusiveTitle },
          { trait_type: "ExclusiveType", value: trackData.exclusiveType },
          { trait_type: "ExclusiveUrl", value: trackData.exclusiveUrl },
          { trait_type: "ExclusiveDescription", value: trackData.exclusiveDescription }
        ] : [])
      ];

      // Compile TEP-64 metadata
      const metadata = {
        name: trackData.title,
        description: trackData.description,
        image: finalCoverUrl,
        animation_url: finalAudioUrl,
        attributes: attributesList,
        traits: attributesList
      };
      
      const ipfsMetadataUrl = await uploadJSONToPinata(metadata);
      
      updateStepStatus('metadata', 'completed', 65);
      updateStepStatus('transaction', 'processing', 75);

      setLoadingType('transaction');
      setLoadingMessage('Minting NFT on TON Blockchain. Please confirm in your wallet...');

      await mintTonJamNFT(tonConnectUI, wallet, ipfsMetadataUrl);
      
      updateStepStatus('transaction', 'completed', 90);
      updateStepStatus('registry', 'processing', 95);

      // Save to local & Firestore database
      const finalTrackId = selectedTrack?.id || `track-nft-${Date.now()}`;
      const finalPrice = trackData.listingType === 'auction' ? trackData.startingBid : trackData.price;
      
      const newTrack: Track = {
        ...(selectedTrack || {}),
        id: finalTrackId,
        songId: `song-${finalTrackId}`,
        title: trackData.title,
        artist: trackData.artistName || userProfile.name || 'Unknown Artist',
        artistId: userProfile.uid,
        coverUrl: finalCoverUrl,
        audioUrl: finalAudioUrl,
        duration: selectedTrack?.duration || 180,
        genre: trackData.genre,
        isNFT: true,
        artistVerified: true,
        price: finalPrice,
        editions: trackData.editions,
        royaltySplits: royaltySplitsDecimals,
        minted: (selectedTrack?.minted || 0) + 1,
        metadataUrl: ipfsMetadataUrl,
        updatedAt: new Date().toISOString(),
        lyrics: trackData.lyrics,
        isExclusive: trackData.hasExclusive,
        listingType: trackData.listingType,
        auctionDuration: trackData.listingType === 'auction' ? trackData.auctionDuration : undefined
      } as Track;

      await addUserTrack(newTrack);

      const getAuctionEndTime = (daysStr: string) => {
        const days = parseInt(daysStr) || 3;
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + days);
        return targetDate.toISOString();
      };

      const newNFT: NFTItem = {
        id: `nft-${Date.now()}`,
        trackId: finalTrackId,
        title: trackData.title,
        owner: wallet,
        creator: trackData.artistName || userProfile.name || 'Unknown Artist',
        artist: trackData.artistName || userProfile.name || 'Unknown Artist',
        artistId: userProfile.uid,
        price: finalPrice,
        imageUrl: finalCoverUrl,
        coverUrl: finalCoverUrl,
        audioUrl: finalAudioUrl,
        edition: `1 of ${trackData.editions}`,
        supply: parseInt(trackData.editions),
        minted: 1,
        royaltySplits: royaltySplitsDecimals,
        description: trackData.description,
        traits: attributesList,
        attributes: attributesList,
        listingType: trackData.listingType,
        isAuction: trackData.listingType === 'auction',
        startingBid: trackData.listingType === 'auction' ? trackData.startingBid : undefined,
        auctionStartTime: trackData.listingType === 'auction' ? new Date().toISOString() : undefined,
        auctionEndTime: trackData.listingType === 'auction' ? getAuctionEndTime(trackData.auctionDuration) : undefined,
        exclusiveContent: trackData.hasExclusive ? [{
          id: `ex-${Date.now()}`,
          title: trackData.exclusiveTitle,
          type: trackData.exclusiveType,
          url: trackData.exclusiveUrl,
          description: trackData.exclusiveDescription
        }] : [],
        ipfsUrl: ipfsMetadataUrl,
        history: [{ event: 'Minted', from: 'NullAddress', to: trackData.artistName || userProfile.name || 'Unknown', date: new Date().toISOString(), price: finalPrice }]
      };
      
      await addUserNFT(newNFT);

      updateStepStatus('registry', 'completed', 100);
      
      await new Promise(resolve => setTimeout(resolve, 800));

      setIsLoading(false);
      addNotification(`"${trackData.title}" successfully minted as an NFT on TON!`, "success");
      navigate('/artist-dashboard');
    } catch (error: any) {
      console.error("Minting failed:", error);
      setMintingSteps(steps => steps.map(s => s.status === 'processing' ? { ...s, status: 'error' } : s));
      setIsLoading(false);
      addNotification(error.message || "Minting process failed. Check wallet connection.", "error");
    }
  };

  const getBlockchainLabel = (code: string) => {
    switch (code) {
      case 'ton-testnet': return 'TON Testnet (Sandbox)';
      case 'ton-miniapp': return 'TON Mini App Storage';
      default: return 'TON Mainnet (Recommended)';
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-white p-4 sm:p-6 pb-28 relative overflow-x-hidden">
      <MintingProgressOverlay 
        isVisible={isLoading} 
        steps={mintingSteps} 
        overallProgress={overallProgress} 
        currentMessage={loadingMessage} 
      />

      <HowToMintTutorial 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)} 
      />
      
      {/* Background Ambience Glow */}
      <div className="fixed inset-0 opacity-15 blur-[140px] pointer-events-none z-0">
        <div className="absolute top-10 right-10 w-96 h-96 bg-[#0052FF] rounded-full" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-600 rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        {/* Header Navigation & Step Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1527]/90 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <BackButton className="bg-white/5 hover:bg-white/10 text-white" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                  <Box className="w-5 h-5 text-[#0052FF]" /> TonJam Music NFT Minting Studio
                </h1>
                <button
                  type="button"
                  onClick={() => setShowTutorial(true)}
                  className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Open How to Mint Tutorial"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>How to Mint Guide</span>
                </button>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Step {step} of 4: {
                  step === 1 ? 'Media & Audio Upload' :
                  step === 2 ? 'Track Metadata & Lore' :
                  step === 3 ? 'Royalties & Blockchain Setup' :
                  'Final Review & Mint Confirmation'
                }
              </p>
            </div>
          </div>

          {/* Stepper Progress Badges */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            {[
              { num: 1, label: 'Media' },
              { num: 2, label: 'Metadata' },
              { num: 3, label: 'Royalties' },
              { num: 4, label: 'Confirm' }
            ].map(s => (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (s.num < step) setStep(s.num as any);
                }}
                disabled={s.num > step}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  step === s.num
                    ? 'bg-[#0052FF] text-white shadow-lg shadow-blue-500/30'
                    : s.num < step
                    ? 'bg-blue-900/40 text-blue-300 hover:bg-blue-800/50 cursor-pointer'
                    : 'bg-white/5 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>{s.num}.</span>
                <span className="hidden md:inline">{s.label}</span>
                {s.num < step && <Check className="w-3 h-3 text-blue-300" />}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Track Shortcut Selector */}
        {step === 1 && artistTracks.length > 0 && (
          <div className="bg-[#0D1527] border border-white/10 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Disc className="w-3.5 h-3.5 text-[#0052FF]" /> Select existing unminted release from catalog
              </span>
              {selectedTrack && (
                <button
                  type="button"
                  onClick={() => setSelectedTrack(null)}
                  className="text-[10px] font-bold text-rose-400 hover:text-rose-300 uppercase tracking-wider"
                >
                  Clear Selection
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {artistTracks.map(track => {
                const isSelected = selectedTrack?.id === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => setSelectedTrack(track)}
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#0052FF]/20 border-[#0052FF] text-white'
                        : 'bg-white/5 border-white/5 hover:border-white/20 text-slate-300'
                    }`}
                  >
                    <img src={track.coverUrl} className="w-10 h-10 rounded-lg object-cover shrink-0" alt="" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{track.title}</p>
                      <p className="text-[9px] text-slate-400 uppercase font-bold truncate">{track.genre}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#0052FF] shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MAIN STEP PANELS */}
        <div className="bg-[#0D1527] border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-md relative overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: MEDIA & AUDIO UPLOAD */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <Music className="w-5 h-5 text-[#0052FF]" /> Step 1: Upload Music & Cover Vision
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Upload your high-definition audio master file and artwork, or use Gemini AI to synthesize cover art.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left: Audio Upload & Interactive Audio Preview */}
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Audio Track Master File (MP3, WAV, FLAC, M4A)
                    </label>

                    {/* Drag & Drop Zone for Audio */}
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingAudio(true); }}
                      onDragLeave={() => setIsDraggingAudio(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingAudio(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) processAudioFile(file);
                      }}
                      onClick={() => !selectedTrack && audioInputRef.current?.click()} 
                      className={`w-full p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                        isDraggingAudio
                          ? 'bg-[#0052FF]/20 border-[#0052FF] scale-[1.01]'
                          : trackData.audioPreview || trackData.audioFile
                          ? 'bg-blue-950/20 border-blue-500/40'
                          : 'bg-white/5 border-white/10 hover:border-[#0052FF]/50'
                      }`} 
                    >
                      <input 
                        type="file" 
                        ref={audioInputRef} 
                        onChange={(e) => handleFileChange(e, 'audio')} 
                        accept={ALLOWED_AUDIO_TYPES.join(',')} 
                        className="hidden" 
                      />
                      
                      <div className="w-14 h-14 rounded-2xl bg-[#0052FF]/10 text-[#0052FF] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <FileAudio className="w-7 h-7" />
                      </div>

                      <p className="text-xs font-black uppercase tracking-wider text-white text-center">
                        {trackData.audioFile ? trackData.audioFile.name : selectedTrack ? selectedTrack.title : 'Drag & Drop Audio Master File'}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 text-center">
                        {trackData.audioFile ? `${(trackData.audioFile.size / (1024 * 1024)).toFixed(2)} MB` : 'or click to browse files (Up to 50MB)'}
                      </p>
                    </div>

                    {/* Interactive Audio Player Preview */}
                    {(trackData.audioPreview || trackData.audioFile) && (
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between gap-4">
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
                              {trackData.title || (trackData.audioFile ? trackData.audioFile.name : 'Audio Preview')}
                            </p>
                            <p className="text-[10px] text-blue-400 font-mono font-semibold uppercase tracking-wider">
                              {isPlayingPreview ? 'Now Playing Preview...' : 'Ready for Minting'}
                            </p>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 bg-blue-500/10 text-blue-300 text-[10px] font-bold rounded-lg border border-blue-500/20 shrink-0">
                          Decentralized Audio
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: Cover Art Upload & Gemini AI Generator */}
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Cover Art Visual Vision (PNG, JPG, WEBP)
                    </label>

                    {/* Drag & Drop Cover Art Preview */}
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingCover(true); }}
                      onDragLeave={() => setIsDraggingCover(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingCover(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) processCoverFile(file);
                      }}
                      onClick={() => !isGeneratingAiCover && fileInputRef.current?.click()} 
                      className={`w-full aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group ${
                        isDraggingCover
                          ? 'bg-[#0052FF]/20 border-[#0052FF]'
                          : trackData.coverPreview
                          ? 'border-blue-500/40'
                          : 'bg-white/5 border-white/10 hover:border-[#0052FF]/50'
                      }`} 
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={(e) => handleFileChange(e, 'cover')} 
                        accept={ALLOWED_IMAGE_TYPES.join(',')} 
                        className="hidden" 
                      />

                      {isGeneratingAiCover ? (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-3">
                          <Loader2 className="w-8 h-8 text-[#0052FF] animate-spin" />
                          <span className="text-xs font-black text-[#0052FF] uppercase tracking-widest animate-pulse">
                            Synthesizing Art with Gemini...
                          </span>
                        </div>
                      ) : trackData.coverPreview ? (
                        <>
                          <img src={trackData.coverPreview} alt="Cover Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="w-8 h-8 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-6">
                          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                            <ImageIcon className="w-7 h-7 text-slate-400" />
                          </div>
                          <p className="text-xs font-black uppercase tracking-wider text-white">Upload Cover Art</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Drag & drop image or click to upload</p>
                        </div>
                      )}
                    </div>

                    {/* AI Art Synthesizer Box */}
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-blue-400" /> Gemini AI Cover Generator
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="Describe visual concept (e.g., Cyberpunk neon synthwave city...)"
                          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#0052FF]"
                        />
                        <button
                          type="button"
                          disabled={isGeneratingAiCover}
                          onClick={async () => {
                            const promptToUse = aiPrompt.trim() || (trackData.title ? `Album cover for ${trackData.title} in genre ${trackData.genre}, vibrant futuristic music artwork, digital render` : 'Futuristic music album cover art, neon glows, high resolution 3D render');
                            setIsGeneratingAiCover(true);
                            try {
                              addNotification("Synthesizing AI cover image...", "info");
                              const response = await fetch('/api/gemini/generate-image', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  title: trackData.title || "Music Track",
                                  trackInfo: trackData.genre || "Electronic",
                                  prompt: promptToUse
                                })
                              });
                              if (!response.ok) throw new Error("AI generation failed");
                              const data = await response.json();
                              if (data.imageUrl) {
                                setTrackData(prev => ({ ...prev, coverPreview: data.imageUrl, coverFile: null }));
                                addNotification("AI Art generated successfully!", "success");
                              } else throw new Error("No image returned");
                            } catch (err) {
                              console.error(err);
                              addNotification("AI Art generation failed. Please upload an image manually.", "error");
                            } finally {
                              setIsGeneratingAiCover(false);
                            }
                          }}
                          className="px-4 py-2 bg-[#0052FF] hover:bg-[#1a66ff] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shrink-0 cursor-pointer"
                        >
                          {isGeneratingAiCover ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      if (!trackData.audioPreview && !trackData.audioFile && !selectedTrack) {
                        addNotification("Please load or upload an audio track to proceed", "warning");
                        return;
                      }
                      if (!trackData.coverPreview) {
                        addNotification("Please upload or generate cover art to proceed", "warning");
                        return;
                      }
                      setStep(2);
                    }}
                    className="px-6 py-3 bg-[#0052FF] hover:bg-[#1a66ff] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Next: Track Metadata</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: TRACK METADATA & LORE */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <Tag className="w-5 h-5 text-[#0052FF]" /> Step 2: Track Metadata & Lore
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Provide the title, artist stage name, genre, and track description for the NFT metadata.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Song Title <span className="text-rose-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={trackData.title} 
                      onChange={e => setTrackData({...trackData, title: e.target.value})} 
                      required
                      placeholder="e.g., Cybernetic Waves" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-[#0052FF]" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Artist Name
                    </label>
                    <input 
                      type="text" 
                      value={trackData.artistName} 
                      onChange={e => setTrackData({...trackData, artistName: e.target.value})} 
                      placeholder="Artist or Stage Name" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-[#0052FF]" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Album / Collection Name
                    </label>
                    <input 
                      type="text" 
                      value={trackData.album} 
                      onChange={e => setTrackData({...trackData, album: e.target.value})} 
                      placeholder="e.g. Genesis LP or Single" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-[#0052FF]" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Genre
                    </label>
                    <select 
                      value={trackData.genre} 
                      onChange={e => setTrackData({...trackData, genre: e.target.value})} 
                      className="w-full bg-[#0A1021] border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-[#0052FF]"
                    >
                      {['Electronic', 'Hip-hop', 'Pop', 'Rock', 'Synthwave', 'Phonk', 'Techno', 'Jazz', 'Ambient', 'R&B', 'House', 'Classical'].map(g => (
                        <option key={g} value={g} className="bg-[#0A1021]">{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Rarity Tier
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'].map((tier) => (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => setRarityTier(tier as any)}
                          className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${
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
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Track Description / Lore
                  </label>
                  <textarea 
                    value={trackData.description} 
                    onChange={e => setTrackData({...trackData, description: e.target.value})} 
                    rows={3} 
                    placeholder="Describe the sonic inspiration, creation history, or backstory..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-semibold text-white outline-none focus:border-[#0052FF] resize-none" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Lyrics (Optional)
                  </label>
                  <textarea 
                    value={trackData.lyrics} 
                    onChange={e => setTrackData({...trackData, lyrics: e.target.value})} 
                    rows={2} 
                    placeholder="Song lyrics..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-semibold text-white outline-none focus:border-[#0052FF] resize-none" 
                  />
                </div>

                <div className="flex justify-between pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!trackData.title.trim()) {
                        addNotification("Please enter a song title", "warning");
                        return;
                      }
                      setStep(3);
                    }}
                    className="px-6 py-3 bg-[#0052FF] hover:bg-[#1a66ff] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Next: Royalties & Network</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: ROYALTIES & BLOCKCHAIN SELECTION */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <Percent className="w-5 h-5 text-[#0052FF]" /> Step 3: Royalties & Blockchain Selection
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Set secondary marketplace royalties, define collaborator revenue splits, and select your target TON blockchain network.
                  </p>
                </div>

                {/* Blockchain Network Selector */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Choose Blockchain Network
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: 'ton-mainnet',
                        title: 'TON Mainnet',
                        desc: 'Primary TON Blockchain with Telegram Mini App support',
                        badge: 'Recommended',
                        fee: '~0.05 TON'
                      },
                      {
                        id: 'ton-testnet',
                        title: 'TON Testnet',
                        desc: 'Developer sandbox for testing minting smart contracts',
                        badge: 'Sandbox',
                        fee: '0 TON (Testnet)'
                      },
                      {
                        id: 'ton-miniapp',
                        title: 'TON Mini App Storage',
                        desc: 'Optimized Telegram wallet micro-minting protocol',
                        badge: 'Instant',
                        fee: '~0.02 TON'
                      }
                    ].map(net => {
                      const isSelected = trackData.blockchain === net.id;
                      return (
                        <div
                          key={net.id}
                          onClick={() => setTrackData({ ...trackData, blockchain: net.id as any })}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                            isSelected
                              ? 'bg-[#0052FF]/20 border-[#0052FF] text-white'
                              : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                              <Radio className={`w-3.5 h-3.5 ${isSelected ? 'text-[#0052FF]' : 'text-slate-500'}`} />
                              {net.title}
                            </span>
                            <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              isSelected ? 'bg-[#0052FF] text-white' : 'bg-white/10 text-slate-400'
                            }`}>
                              {net.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed mt-1">{net.desc}</p>
                          <p className="text-[9px] font-mono text-blue-400 mt-2 font-bold">Gas Fee: {net.fee}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Secondary Marketplace Royalty Slider */}
                <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-white">
                        Secondary Sales Royalty Percentage
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Percentage earned on every future peer-to-peer resale on TonJam marketplace.
                      </p>
                    </div>
                    <span className="text-lg font-black text-[#0052FF] font-mono">
                      {trackData.secondaryRoyalty}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="0.5"
                    value={trackData.secondaryRoyalty}
                    onChange={(e) => setTrackData({ ...trackData, secondaryRoyalty: e.target.value })}
                    className="w-full accent-[#0052FF] cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>0% (No royalty)</span>
                    <span>5% (Standard)</span>
                    <span>10% (High)</span>
                    <span>15% (Max)</span>
                  </div>
                </div>

                {/* Primary Sale Revenue Splits */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Primary Sale Revenue Splits (Total = 100%)
                    </label>
                    <button
                      type="button"
                      onClick={() => setRoyaltySplits([...royaltySplits, { address: '', percentage: 0, label: 'Collaborator' }])}
                      className="text-[10px] font-bold text-[#0052FF] hover:underline uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Collaborator
                    </button>
                  </div>

                  <div className="space-y-2">
                    {royaltySplits.map((split, index) => (
                      <div key={index} className="flex gap-2 items-center bg-white/5 p-3 rounded-xl border border-white/5">
                        <input
                          type="text"
                          value={split.label}
                          onChange={(e) => {
                            const updated = [...royaltySplits];
                            updated[index].label = e.target.value;
                            setRoyaltySplits(updated);
                          }}
                          placeholder="Role (e.g., Producer)"
                          className="w-28 bg-black/30 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                        />
                        <input
                          type="text"
                          value={split.address}
                          onChange={(e) => {
                            const updated = [...royaltySplits];
                            updated[index].address = e.target.value;
                            setRoyaltySplits(updated);
                          }}
                          placeholder="TON Wallet Address (EQ...)"
                          className="flex-1 bg-black/30 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none"
                        />
                        <div className="flex items-center gap-1 w-20">
                          <input
                            type="number"
                            value={split.percentage}
                            onChange={(e) => {
                              const updated = [...royaltySplits];
                              updated[index].percentage = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                              setRoyaltySplits(updated);
                            }}
                            className="w-14 bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono text-center text-white outline-none"
                          />
                          <span className="text-xs text-slate-400">%</span>
                        </div>
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => setRoyaltySplits(royaltySplits.filter((_, i) => i !== index))}
                            className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold pt-1">
                    <span className="text-slate-400">Total Primary Split:</span>
                    <span className={totalSplitsPercentage === 100 ? 'text-green-400' : 'text-rose-400'}>
                      {totalSplitsPercentage}% / 100%
                    </span>
                  </div>
                </div>

                {/* Price & Editions Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Minting Price (GRAM/TON)
                    </label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={trackData.price} 
                      onChange={e => setTrackData({...trackData, price: e.target.value})} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-[#0052FF]" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Max Supply (Editions)
                    </label>
                    <input 
                      type="number" 
                      value={trackData.editions} 
                      onChange={e => setTrackData({...trackData, editions: e.target.value})} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-[#0052FF]" 
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (totalSplitsPercentage !== 100) {
                        addNotification(`Royalty splits must equal 100% (currently ${totalSplitsPercentage}%)`, "warning");
                        return;
                      }
                      setStep(4);
                    }}
                    className="px-6 py-3 bg-[#0052FF] hover:bg-[#1a66ff] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Proceed to Final Review</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: REVIEW & CONFIRMATION STEP */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-400" /> Step 4: Final Review & Confirmation
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Review all media, metadata, royalties, and blockchain deployment parameters before issuing the mint transaction.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="bg-[#050A18] border border-white/10 rounded-2xl p-5 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Cover Art & Audio Player Preview */}
                    <div className="space-y-3">
                      <img
                        src={trackData.coverPreview}
                        alt="Cover Preview"
                        className="w-full aspect-square object-cover rounded-xl border border-white/10 shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={handleAudioPlaybackToggle}
                        className="w-full py-2.5 bg-[#0052FF] hover:bg-[#1a66ff] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                      >
                        {isPlayingPreview ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                        <span>{isPlayingPreview ? 'Pause Audio Preview' : 'Play Audio Preview'}</span>
                      </button>
                    </div>

                    {/* Metadata Overview */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="border-b border-white/10 pb-3">
                        <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">{rarityTier} • {trackData.genre}</span>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">{trackData.title}</h3>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">by {trackData.artistName || userProfile?.name}</p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-white/5 p-2.5 rounded-xl">
                          <span className="text-[9px] text-slate-400 block uppercase font-bold">Listing Price</span>
                          <span className="font-mono font-black text-blue-400 text-sm">{trackData.price} TON</span>
                        </div>
                        <div className="bg-white/5 p-2.5 rounded-xl">
                          <span className="text-[9px] text-slate-400 block uppercase font-bold">Max Supply</span>
                          <span className="font-mono font-black text-white text-sm">{trackData.editions} Editions</span>
                        </div>
                        <div className="bg-white/5 p-2.5 rounded-xl">
                          <span className="text-[9px] text-slate-400 block uppercase font-bold">Secondary Royalty</span>
                          <span className="font-mono font-black text-green-400 text-sm">{trackData.secondaryRoyalty}%</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Blockchain Network & Storage</span>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                          <span className="px-2.5 py-1 bg-blue-500/10 text-blue-300 rounded-lg border border-blue-500/20 font-bold">
                            {getBlockchainLabel(trackData.blockchain)}
                          </span>
                          <span className="px-2.5 py-1 bg-purple-500/10 text-purple-300 rounded-lg border border-purple-500/20 font-bold">
                            IPFS via Pinata Gateway
                          </span>
                        </div>
                      </div>

                      {trackData.description && (
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 uppercase font-bold block">Lore Description</span>
                          <p className="text-xs text-slate-300 line-clamp-2 italic">"{trackData.description}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Royalty Split Breakdown */}
                  <div className="border-t border-white/10 pt-4 space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      Revenue Distribution Breakdown
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {royaltySplits.map((split, i) => (
                        <div key={i} className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-xl text-xs font-mono">
                          <span className="text-slate-300 font-bold">{split.label || 'Collaborator'}:</span>
                          <span className="text-blue-400 font-bold">{split.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Terms & Copyright Attestation Checkbox */}
                <div className="p-4 bg-blue-950/20 border border-blue-500/30 rounded-2xl flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms-check"
                    checked={termsConfirmed}
                    onChange={(e) => setTermsConfirmed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded accent-[#0052FF] cursor-pointer"
                  />
                  <label htmlFor="terms-check" className="text-xs text-slate-300 leading-relaxed cursor-pointer select-none">
                    <strong className="text-white">Copyright & Ownership Attestation:</strong> I confirm that I hold all intellectual property rights to this audio master and artwork, and agree to mint it as an immutable NFT on the TON blockchain under the TonJam Protocol terms.
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Back to Edit
                  </button>

                  <button
                    type="button"
                    onClick={handleFinalMintSubmit}
                    disabled={isLoading || !termsConfirmed}
                    className="px-8 py-3.5 bg-gradient-to-r from-[#0052FF] to-blue-600 hover:from-[#1a66ff] hover:to-blue-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-xl shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Minting in Progress...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-white" />
                        <span>Confirm & Mint Music NFT</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ArtistMinting;
