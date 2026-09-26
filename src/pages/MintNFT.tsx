import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Music, Image as ImageIcon, Sparkles, Zap, Database, 
  Loader2, Check, Plus, Trash2, Volume2, Info, ChevronRight, Play, Pause,
  Flame, Disc, Crown, Tag, Sliders, Radio, Percent, ShieldCheck, FileAudio,
  Code, Eye, ExternalLink, ArrowRight, ArrowLeft, Wallet, CheckCircle2, Copy,
  Share2, RefreshCw, Upload, Lock, Layers
} from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { useNFT } from '@/contexts/NFTContext';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { uploadToPinata, uploadJSONToPinata } from '@/services/storageService';
import { mintTonJamNFT, TONJAM_COLLECTION_ADDRESS } from '@/services/tonService';
import { createActivityPost } from '@/services/socialService';
import { validateFile, ALLOWED_AUDIO_TYPES, ALLOWED_IMAGE_TYPES } from '@/lib/utils';
import { Track, NFTItem, RoyaltySplitExtended, NFTTrait } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export const MintNFT: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedTrack = location.state?.track as Track | undefined;

  const { userProfile, addUserTrack, addUserNFT, addNotification, allTracks } = useAudio();
  const { addNFT, updateMintingStatus } = useNFT();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress() || userProfile?.walletAddress || '';

  // 5-Step Minting Studio Flow:
  // 1: Upload Audio & Visual Assets
  // 2: Song Details & TEP-64 Metadata
  // 3: Royalties & Collaborator Splits
  // 4: Review & IPFS Pinata Verification
  // 5: Minting Execution & Success Receipt
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Loading & Progress States
  const [isMinting, setIsMinting] = useState(false);
  const [mintProgress, setMintProgress] = useState(0);
  const [mintStatusText, setMintStatusText] = useState('');
  const [mintingMilestones, setMintingMilestones] = useState<Array<{ id: string; label: string; done: boolean; inProgress: boolean }>>([
    { id: 'audio_pin', label: 'Lossless Audio Master Pin to Pinata IPFS', done: false, inProgress: false },
    { id: 'cover_pin', label: 'Artwork Cover Image Pin to Pinata IPFS', done: false, inProgress: false },
    { id: 'metadata_pin', label: 'TEP-64 JSON Metadata Compilation & IPFS Pin', done: false, inProgress: false },
    { id: 'ton_tx', label: 'TON Smart Contract Minting Transaction', done: false, inProgress: false },
    { id: 'db_sync', label: 'TonJam Marketplace Registry Synchronization', done: false, inProgress: false },
  ]);

  // Audio & Cover States
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string>(preselectedTrack?.audioUrl || '');
  const [audioDuration, setAudioDuration] = useState<number>(preselectedTrack?.duration || 180);
  const [audioFormat, setAudioFormat] = useState<string>(preselectedTrack?.bitrate || 'WAV Lossless');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>(preselectedTrack?.coverUrl || '');

  // Form Fields
  const [title, setTitle] = useState(preselectedTrack?.title || '');
  const [artistName, setArtistName] = useState(preselectedTrack?.artist || userProfile?.name || 'Artist');
  const [album, setAlbum] = useState((preselectedTrack as any)?.albumName || (preselectedTrack as any)?.album || '');
  const [genre, setGenre] = useState(preselectedTrack?.genre || 'Electronic');
  const [bpm, setBpm] = useState(preselectedTrack?.bpm ? String(preselectedTrack.bpm) : '128');
  const [keySig, setKeySig] = useState(preselectedTrack?.key || 'A minor');
  const [audioQuality, setAudioQuality] = useState('24-bit Lossless Studio WAV');
  const [description, setDescription] = useState(preselectedTrack?.description || '');
  const [price, setPrice] = useState(preselectedTrack?.price || '2.5');
  const [editions, setEditions] = useState(preselectedTrack?.editions || '100');
  const [lyrics, setLyrics] = useState(preselectedTrack?.lyrics || '');
  const [secondaryRoyalty, setSecondaryRoyalty] = useState('5'); // 0 - 15%
  const [blockchain, setBlockchain] = useState<'ton-mainnet' | 'ton-testnet'>('ton-mainnet');
  const [termsConfirmed, setTermsConfirmed] = useState(false);
  const [metadataViewMode, setMetadataViewMode] = useState<'preview' | 'json'>('preview');

  // Exclusive Perk State
  const [hasExclusive, setHasExclusive] = useState(preselectedTrack?.isExclusive || false);
  const [exclusiveTitle, setExclusiveTitle] = useState('High-Res Studio Stems & FLAC Package');
  const [exclusiveDescription, setExclusiveDescription] = useState('Direct access to individual stems (drums, bass, vocals, synths) for remixing.');

  // Rarity Tier & Custom Attributes
  const [rarityTier, setRarityTier] = useState<'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic'>('Common');
  const [customTraits, setCustomTraits] = useState<NFTTrait[]>([
    { trait_type: 'Edition Type', value: 'Genesis First Drop' },
    { trait_type: 'Audio Master', value: '24-bit Studio Lossless' },
    { trait_type: 'Perk', value: 'Perpetual Streaming Rights' }
  ]);
  const [newTraitKey, setNewTraitKey] = useState('');
  const [newTraitValue, setNewTraitValue] = useState('');

  // Primary Collaborator Royalty Splits
  const [royaltySplits, setRoyaltySplits] = useState<RoyaltySplitExtended[]>([
    { address: userAddress || userProfile?.walletAddress || '', percentage: 100, label: 'Creator' }
  ]);

  // Player Preview in studio
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playerCurrentTime, setPlayerCurrentTime] = useState(0);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Result state after minting
  const [mintedNFT, setMintedNFT] = useState<NFTItem | null>(null);
  const [mintTxHash, setMintTxHash] = useState('');
  const [ipfsMetadataHash, setIpfsMetadataHash] = useState('');

  // Drag and Drop States
  const [isDraggingAudio, setIsDraggingAudio] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Genre Options
  const GENRES = [
    'Electronic', 'Hip Hop', 'Synthwave', 'Lo-Fi', 'Rock', 
    'Pop', 'Ambient', 'Techno', 'House', 'Jazz', 'R&B'
  ];

  // Sync wallet address to royalty split when wallet connects
  useEffect(() => {
    if (userAddress && royaltySplits.length === 1 && !royaltySplits[0].address) {
      setRoyaltySplits([{ ...royaltySplits[0], address: userAddress }]);
    }
  }, [userAddress]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
    };
  }, []);

  // Process Audio File
  const handleAudioFile = (file: File) => {
    const validation = validateFile(file, 'audio', 100);
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid audio file');
      return;
    }

    setAudioFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAudioPreview(objectUrl);

    // Auto title if empty
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName);
    }

    // Inspect format
    const ext = file.name.split('.').pop()?.toUpperCase() || 'AUDIO';
    setAudioFormat(`${ext} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);

    // Detect duration
    const tempAudio = new Audio(objectUrl);
    tempAudio.onloadedmetadata = () => {
      if (tempAudio.duration && !isNaN(tempAudio.duration)) {
        setAudioDuration(Math.round(tempAudio.duration));
      }
    };

    toast.success(`Loaded audio master: ${file.name}`);
  };

  // Process Cover Image File
  const handleCoverFile = (file: File) => {
    const validation = validateFile(file, 'image', 15);
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid image file');
      return;
    }

    setCoverFile(file);
    const objectUrl = URL.createObjectURL(file);
    setCoverPreview(objectUrl);
    toast.success('Cover artwork loaded');
  };

  // Playback preview toggle
  const togglePlayAudio = () => {
    if (!audioPreview) {
      toast.warning('No audio loaded to play');
      return;
    }

    if (isPlayingAudio) {
      audioPlayerRef.current?.pause();
      setIsPlayingAudio(false);
    } else {
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio(audioPreview);
        audioPlayerRef.current.ontimeupdate = () => {
          if (audioPlayerRef.current) {
            setPlayerCurrentTime(audioPlayerRef.current.currentTime);
          }
        };
        audioPlayerRef.current.onended = () => {
          setIsPlayingAudio(false);
          setPlayerCurrentTime(0);
        };
      } else if (audioPlayerRef.current.src !== audioPreview) {
        audioPlayerRef.current.src = audioPreview;
      }
      audioPlayerRef.current.play().then(() => {
        setIsPlayingAudio(true);
      }).catch((e) => {
        console.warn('Playback error:', e);
        toast.error('Unable to play audio preview');
      });
    }
  };

  // Royalty Calculations
  const totalRoyaltyPercentage = royaltySplits.reduce((acc, curr) => acc + (Number(curr.percentage) || 0), 0);

  const handleAddCollaborator = () => {
    if (royaltySplits.length >= 6) {
      toast.warning('Maximum 6 collaborators supported');
      return;
    }
    setRoyaltySplits([...royaltySplits, { address: '', percentage: 0, label: 'Collaborator' }]);
  };

  const handleRemoveCollaborator = (index: number) => {
    if (royaltySplits.length <= 1) return;
    setRoyaltySplits(royaltySplits.filter((_, i) => i !== index));
  };

  const handleSplitEvenly = () => {
    const count = royaltySplits.length;
    if (count === 0) return;
    const base = Math.floor(100 / count);
    const remainder = 100 - base * count;
    const updated = royaltySplits.map((s, i) => ({
      ...s,
      percentage: i === 0 ? base + remainder : base
    }));
    setRoyaltySplits(updated);
    toast.success(`Split evenly (${base}% each)`);
  };

  // Custom Traits Handling
  const handleAddTrait = () => {
    if (!newTraitKey.trim() || !newTraitValue.trim()) return;
    setCustomTraits([...customTraits, { trait_type: newTraitKey.trim(), value: newTraitValue.trim() }]);
    setNewTraitKey('');
    setNewTraitValue('');
  };

  const handleRemoveTrait = (idx: number) => {
    setCustomTraits(customTraits.filter((_, i) => i !== idx));
  };

  // Compiled TEP-64 Metadata Object
  const compiledAttributes: NFTTrait[] = [
    { trait_type: 'Artist Name', value: artistName || 'Unknown Artist' },
    { trait_type: 'Album', value: album || 'Single' },
    { trait_type: 'Genre', value: genre },
    { trait_type: 'BPM', value: bpm },
    { trait_type: 'Musical Key', value: keySig },
    { trait_type: 'Audio Master Quality', value: audioQuality },
    { trait_type: 'Rarity Tier', value: rarityTier },
    { trait_type: 'Secondary Royalty', value: `${secondaryRoyalty}%` },
    { trait_type: 'Network', value: blockchain === 'ton-mainnet' ? 'TON Mainnet' : 'TON Testnet' },
    ...customTraits,
    ...(lyrics ? [{ trait_type: 'Lyrics Included', value: 'Yes' }] : []),
    ...(hasExclusive ? [{ trait_type: 'Exclusive Perk', value: exclusiveTitle }] : [])
  ];

  const metadataJSONPreview = {
    name: title || 'Untitled Audio NFT',
    description: description || 'Music NFT minted on TonJam decentralized protocol.',
    image: coverPreview || 'ipfs://placeholder-cover',
    animation_url: audioPreview || 'ipfs://placeholder-audio',
    attributes: compiledAttributes,
    properties: {
      category: 'audio',
      audio_format: audioFormat,
      duration_seconds: audioDuration,
      royalty_percentage: Number(secondaryRoyalty),
      collaborators: royaltySplits.map(s => ({
        address: s.address,
        share: s.percentage,
        role: s.label
      }))
    }
  };

  // Step Nav Validations
  const validateStep1 = () => {
    if (!audioPreview && !audioFile) {
      toast.error('Please upload an audio master file');
      return false;
    }
    if (!coverPreview && !coverFile) {
      toast.error('Please upload cover artwork');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!title.trim()) {
      toast.error('Please enter a track title');
      return false;
    }
    if (!artistName.trim()) {
      toast.error('Please enter the artist name');
      return false;
    }
    if (!price || parseFloat(price) <= 0) {
      toast.error('Please specify a valid mint price in TON');
      return false;
    }
    if (!editions || parseInt(editions) < 1) {
      toast.error('Please specify the number of editions (min 1)');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (totalRoyaltyPercentage !== 100) {
      toast.error(`Collaborator splits must sum to exactly 100% (currently ${totalRoyaltyPercentage}%)`);
      return false;
    }
    for (const split of royaltySplits) {
      if (!split.address.trim()) {
        toast.error('All collaborator splits require a valid TON wallet address');
        return false;
      }
    }
    return true;
  };

  const goToNextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    setStep((prev) => Math.min(prev + 1, 5) as any);
  };

  // Execute Minting Workflow
  const handleExecuteMint = async () => {
    if (!termsConfirmed) {
      toast.warning('Please confirm intellectual property ownership and rights attestation');
      return;
    }

    const activeWallet = tonConnectUI.wallet?.account.address || userAddress;
    if (!activeWallet) {
      toast.warning('Please connect your TON wallet to sign the minting transaction');
      tonConnectUI.openModal();
      return;
    }

    setIsMinting(true);
    setStep(5);
    setMintProgress(5);
    setMintStatusText('Preparing decentralized Pinata IPFS channels...');

    const updateMilestone = (id: string, done: boolean, inProgress: boolean, progressVal: number, statusMsg: string) => {
      setMintingMilestones(prev => prev.map(m => m.id === id ? { ...m, done, inProgress } : m));
      setMintProgress(progressVal);
      setMintStatusText(statusMsg);
    };

    try {
      let finalAudioUrl = audioPreview;
      let finalCoverUrl = coverPreview;

      // 1. Upload Lossless Audio Master to Pinata IPFS
      updateMilestone('audio_pin', false, true, 15, 'Pinning lossless audio file to Pinata IPFS nodes...');
      if (audioFile) {
        finalAudioUrl = await uploadToPinata(audioFile);
      }
      updateMilestone('audio_pin', true, false, 35, 'Lossless audio pinned to Pinata IPFS gateway.');

      // 2. Upload Cover Artwork to Pinata IPFS
      updateMilestone('cover_pin', false, true, 40, 'Pinning artwork image to Pinata IPFS cluster...');
      if (coverFile) {
        finalCoverUrl = await uploadToPinata(coverFile);
      }
      updateMilestone('cover_pin', true, false, 55, 'Artwork pinned to Pinata IPFS gateway.');

      // 3. Compile TEP-64 Standard JSON Metadata and Pin to Pinata IPFS
      updateMilestone('metadata_pin', false, true, 60, 'Compiling TEP-64 standard metadata and pinning JSON to Pinata...');
      const finalMetadata = {
        name: title,
        description: description || `${title} by ${artistName} on TonJam`,
        image: finalCoverUrl,
        animation_url: finalAudioUrl,
        attributes: compiledAttributes,
        traits: compiledAttributes,
        properties: {
          category: 'audio',
          audio_format: audioFormat,
          duration_seconds: audioDuration,
          royalty_percentage: Number(secondaryRoyalty),
          collaborators: royaltySplits.map(s => ({
            address: s.address,
            share: s.percentage,
            role: s.label
          }))
        }
      };

      const ipfsMetadataUrl = await uploadJSONToPinata(finalMetadata);
      setIpfsMetadataHash(ipfsMetadataUrl);
      updateMilestone('metadata_pin', true, false, 75, 'TEP-64 metadata pinned to Pinata IPFS.');

      // 4. TON Blockchain Smart Contract Minting
      updateMilestone('ton_tx', false, true, 80, 'Broadcasting transaction to TON Blockchain. Please confirm in your wallet...');
      const mintSuccess = await mintTonJamNFT(tonConnectUI, activeWallet, ipfsMetadataUrl);
      if (!mintSuccess) {
        throw new Error('Transaction declined or not completed on TON Blockchain.');
      }
      const pseudoTxHash = `ton_${Date.now().toString(16)}`;
      setMintTxHash(pseudoTxHash);
      updateMilestone('ton_tx', true, false, 90, 'TON Smart Contract transaction confirmed.');

      // 5. TonJam Platform Synchronization (Firestore + Context)
      updateMilestone('db_sync', false, true, 92, 'Syncing metadata with TonJam registry & Firestore...');

      const trackId = preselectedTrack?.id || `track-mint-${Date.now()}`;
      const updatedTrack: Track = {
        ...(preselectedTrack || {}),
        id: trackId,
        songId: `song-${trackId}`,
        title: title,
        artist: artistName,
        artistId: userProfile?.uid || 'anonymous',
        coverUrl: finalCoverUrl,
        audioUrl: finalAudioUrl,
        duration: audioDuration,
        genre: genre,
        isNFT: true,
        artistVerified: true,
        price: price,
        editions: editions,
        royaltySplits: royaltySplits.map(s => ({ ...s, percentage: s.percentage / 100 })),
        minted: (preselectedTrack?.minted || 0) + 1,
        metadataUrl: ipfsMetadataUrl,
        updatedAt: new Date().toISOString(),
        lyrics: lyrics,
        isExclusive: hasExclusive
      } as Track;

      await addUserTrack(updatedTrack);

      const newNFT: NFTItem = {
        id: `nft-${Date.now()}`,
        trackId: trackId,
        title: title,
        owner: activeWallet,
        creator: artistName,
        artist: artistName,
        artistId: userProfile?.uid || 'anonymous',
        price: price,
        imageUrl: finalCoverUrl,
        coverUrl: finalCoverUrl,
        audioUrl: finalAudioUrl,
        edition: `1 of ${editions}`,
        supply: parseInt(editions),
        minted: 1,
        royaltySplits: royaltySplits.map(s => ({ ...s, percentage: s.percentage / 100 })),
        description: description,
        traits: compiledAttributes,
        attributes: compiledAttributes,
        listingType: 'fixed',
        ipfsUrl: ipfsMetadataUrl,
        contractAddress: TONJAM_COLLECTION_ADDRESS,
        history: [{
          event: 'Minted',
          from: '0x0000000000000000000000000000000000000000',
          to: artistName,
          date: new Date().toISOString(),
          price: price
        }]
      };

      await addUserNFT(newNFT);
      addNFT(newNFT);
      setMintedNFT(newNFT);

      updateMilestone('db_sync', true, false, 100, 'NFT successfully registered on TonJam protocol.');

      // Social feed broadcast
      if (userProfile?.uid) {
        await createActivityPost(
          userProfile.uid,
          artistName,
          userProfile.avatar || '',
          `minted a new music NFT on TON: "${title}"`,
          'nft_mint',
          {
            targetId: newNFT.id,
            artistName: artistName,
            trackTitle: title,
            paymentAmount: price,
            paymentCurrency: 'TON'
          }
        ).catch(() => {});
      }

      setIsMinting(false);

      // Trigger celebratory confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      toast.success(`"${title}" successfully minted as an NFT on TON!`);
    } catch (err: any) {
      console.error('Minting error:', err);
      setIsMinting(false);
      toast.error(err.message || 'Minting transaction failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#070B18] text-white selection:bg-blue-600/30 pb-32">
      {/* Top Navigation & Status Bar */}
      <div className="bg-[#090E20]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 transition-all flex items-center justify-center text-slate-300 hover:text-white border-none cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                TON Blockchain Studio
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Pinata IPFS Live
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
              Music NFT Minting Engine
            </h1>
          </div>
        </div>

        {/* TON Wallet Connect Status */}
        <div className="flex items-center gap-2">
          {userAddress ? (
            <div className="bg-white/[0.04] px-3 py-1.5 rounded-xl flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-mono font-bold text-slate-300">
                {userAddress.slice(0, 4)}...{userAddress.slice(-4)}
              </span>
            </div>
          ) : (
            <button
              onClick={() => tonConnectUI.openModal()}
              className="min-h-[44px] min-w-[44px] px-4 py-2 bg-[#0052FF] hover:bg-[#1a66ff] active:scale-95 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 border-none cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* Stepper Navigation Indicator */}
        <div className="bg-[#0B112C] rounded-2xl p-4 sm:p-5 mb-8 shadow-xl shadow-black/30">
          <div className="grid grid-cols-5 gap-2 sm:gap-4 relative">
            {[
              { num: 1, label: 'Media', sub: 'Audio & Art' },
              { num: 2, label: 'Metadata', sub: 'Song Specs' },
              { num: 3, label: 'Royalties', sub: 'Splits & %' },
              { num: 4, label: 'Review', sub: 'IPFS & TON' },
              { num: 5, label: 'Mint', sub: 'Execute' }
            ].map((s) => {
              const isActive = step === s.num;
              const isPast = step > s.num;
              return (
                <button
                  key={s.num}
                  onClick={() => {
                    if (s.num < step) setStep(s.num as any);
                    else if (s.num === 2 && validateStep1()) setStep(2);
                    else if (s.num === 3 && validateStep1() && validateStep2()) setStep(3);
                    else if (s.num === 4 && validateStep1() && validateStep2() && validateStep3()) setStep(4);
                  }}
                  className={`flex flex-col items-center text-center p-2 rounded-xl transition-all border-none bg-transparent cursor-pointer ${
                    isActive ? 'scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black mb-1 transition-all ${
                    isPast
                      ? 'bg-emerald-500 text-white'
                      : isActive
                      ? 'bg-[#0052FF] text-white shadow-lg shadow-blue-500/40 ring-4 ring-blue-500/20'
                      : 'bg-white/[0.08] text-slate-400'
                  }`}>
                    {isPast ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-wider ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                  <span className="text-[9px] text-slate-500 hidden sm:block">
                    {s.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 1: MEDIA ASSETS UPLOAD */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            {/* Header info card */}
            <div className="bg-gradient-to-r from-blue-900/20 via-indigo-900/10 to-transparent p-5 rounded-2xl">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <FileAudio className="w-5 h-5 text-blue-400" />
                Upload Lossless Audio & Artwork
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Your audio master will be stored directly on Pinata IPFS decentralized nodes, referenced by an immutable CID on the TON Blockchain smart contract.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Audio Upload Card */}
              <div className="bg-[#0B112C] rounded-2xl p-5 space-y-4 shadow-xl shadow-black/20">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Music className="w-4 h-4 text-blue-400" />
                    Audio Master (WAV / MP3 / FLAC)
                  </label>
                  {audioFormat && (
                    <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg">
                      {audioFormat}
                    </span>
                  )}
                </div>

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingAudio(true); }}
                  onDragLeave={() => setIsDraggingAudio(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingAudio(false);
                    const dropped = e.dataTransfer.files[0];
                    if (dropped) handleAudioFile(dropped);
                  }}
                  onClick={() => audioInputRef.current?.click()}
                  className={`p-6 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDraggingAudio 
                      ? 'bg-blue-600/20 scale-[1.01]' 
                      : 'bg-white/[0.03] hover:bg-white/[0.06]'
                  }`}
                >
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*,.wav,.mp3,.flac,.aac,.ogg"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleAudioFile(f);
                    }}
                    className="hidden"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                    <Upload className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-bold text-white mb-1">
                    {audioFile ? audioFile.name : 'Drop audio master here or click to browse'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Supports WAV (24-bit recommended), FLAC, MP3, AAC up to 100MB
                  </p>
                </div>

                {/* Audio Player Preview */}
                {audioPreview && (
                  <div className="bg-white/[0.03] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={togglePlayAudio}
                          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[#0052FF] hover:bg-[#1a66ff] active:scale-95 text-white flex items-center justify-center transition-all border-none cursor-pointer shadow-md shadow-blue-600/30"
                          aria-label={isPlayingAudio ? 'Pause preview' : 'Play preview'}
                        >
                          {isPlayingAudio ? (
                            <Pause className="w-5 h-5 fill-white" />
                          ) : (
                            <Play className="w-5 h-5 fill-white ml-0.5" />
                          )}
                        </button>
                        <div>
                          <p className="text-xs font-bold text-white truncate max-w-[180px]">
                            {title || 'Audio Master Preview'}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400">
                            Duration: {Math.floor(audioDuration / 60)}:{String(audioDuration % 60).padStart(2, '0')} min
                          </p>
                        </div>
                      </div>

                      {/* Animated Sound Waveform Indicator */}
                      <div className="flex items-center gap-1 h-5">
                        {[40, 70, 95, 60, 85, 45, 90, 65].map((h, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full bg-blue-500 transition-all duration-200 ${
                              isPlayingAudio ? 'animate-pulse' : 'opacity-40'
                            }`}
                            style={{ height: isPlayingAudio ? `${h}%` : '30%' }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Cover Artwork Card */}
              <div className="bg-[#0B112C] rounded-2xl p-5 space-y-4 shadow-xl shadow-black/20">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-purple-400" />
                    Cover Artwork (1:1 Ratio)
                  </label>
                  <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-lg">
                    3000 x 3000px Ideal
                  </span>
                </div>

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingCover(true); }}
                  onDragLeave={() => setIsDraggingCover(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingCover(false);
                    const dropped = e.dataTransfer.files[0];
                    if (dropped) handleCoverFile(dropped);
                  }}
                  onClick={() => coverInputRef.current?.click()}
                  className={`p-6 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDraggingCover 
                      ? 'bg-purple-600/20 scale-[1.01]' 
                      : 'bg-white/[0.03] hover:bg-white/[0.06]'
                  }`}
                >
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*,.png,.jpg,.jpeg,.webp"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleCoverFile(f);
                    }}
                    className="hidden"
                  />
                  {coverPreview ? (
                    <div className="relative group">
                      <img 
                        src={coverPreview} 
                        alt="Cover preview" 
                        className="w-32 h-32 rounded-xl object-cover shadow-lg"
                      />
                      <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-white transition-opacity">
                        Change Image
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                        <ImageIcon className="w-7 h-7" />
                      </div>
                      <p className="text-sm font-bold text-white mb-1">
                        Drop high-res artwork or click to browse
                      </p>
                      <p className="text-[11px] text-slate-400">
                        PNG, JPG, WEBP up to 15MB
                      </p>
                    </>
                  )}
                </div>

                {/* Rarity Tier Selector */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-bold text-slate-300">
                    NFT Rarity Designation
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'] as const).map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setRarityTier(tier)}
                        className={`min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-none cursor-pointer ${
                          rarityTier === tier
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                            : 'bg-white/[0.04] text-slate-400 hover:text-white'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 1 Actions */}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={goToNextStep}
                className="min-h-[44px] px-8 py-3 bg-[#0052FF] hover:bg-[#1a66ff] active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 border-none cursor-pointer shadow-lg shadow-blue-600/30"
              >
                <span>Continue to Metadata</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: TRACK METADATA & SPECS */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-indigo-900/20 via-blue-900/10 to-transparent p-5 rounded-2xl">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                Track Information & TEP-64 Metadata
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Provide official musical metadata according to the TEP-64 standard on TON. This data is indexed across Web3 streaming aggregators and marketplaces.
              </p>
            </div>

            <div className="bg-[#0B112C] rounded-2xl p-6 space-y-6 shadow-xl shadow-black/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Track Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Cyberpunk Overdrive"
                    className="w-full min-h-[44px] bg-white/[0.04] text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 border-none"
                  />
                </div>

                {/* Artist Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Artist / Creator Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="e.g. DJ Krupy"
                    className="w-full min-h-[44px] bg-white/[0.04] text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 border-none"
                  />
                </div>

                {/* Album */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Album / Collection Title
                  </label>
                  <input
                    type="text"
                    value={album}
                    onChange={(e) => setAlbum(e.target.value)}
                    placeholder="e.g. Genesis LP (Optional)"
                    className="w-full min-h-[44px] bg-white/[0.04] text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 border-none"
                  />
                </div>

                {/* Audio Master Quality */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Audio Quality Tier
                  </label>
                  <select
                    value={audioQuality}
                    onChange={(e) => setAudioQuality(e.target.value)}
                    className="w-full min-h-[44px] bg-[#0E1638] text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 border-none cursor-pointer"
                  >
                    <option value="24-bit Lossless Studio WAV">24-bit Lossless Studio WAV</option>
                    <option value="320kbps High-Definition MP3">320kbps High-Definition MP3</option>
                    <option value="FLAC Master Uncompressed">FLAC Master Uncompressed</option>
                    <option value="Spatial Dolby Atmos Audio">Spatial Dolby Atmos Audio</option>
                  </select>
                </div>

                {/* BPM & Key */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Tempo (BPM)
                  </label>
                  <input
                    type="number"
                    value={bpm}
                    onChange={(e) => setBpm(e.target.value)}
                    placeholder="128"
                    className="w-full min-h-[44px] bg-white/[0.04] text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 border-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Musical Key
                  </label>
                  <input
                    type="text"
                    value={keySig}
                    onChange={(e) => setKeySig(e.target.value)}
                    placeholder="e.g. F# Minor"
                    className="w-full min-h-[44px] bg-white/[0.04] text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 border-none"
                  />
                </div>

                {/* Mint Price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Initial Mint Price (TON) <span className="text-rose-400">*</span></span>
                    <span className="text-[10px] text-blue-400 font-mono">
                      ≈ ${(parseFloat(price || '0') * 5.4).toFixed(2)} USD
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="2.5"
                      className="w-full min-h-[44px] bg-white/[0.04] text-white pl-4 pr-16 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 border-none"
                    />
                    <span className="absolute right-4 top-3 text-xs font-mono font-black text-blue-400">
                      TON
                    </span>
                  </div>
                </div>

                {/* Total Editions / Supply */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Supply / Editions <span className="text-rose-400">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={editions}
                      onChange={(e) => setEditions(e.target.value)}
                      className="w-full min-h-[44px] bg-white/[0.04] text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 border-none"
                    />
                    <div className="flex gap-1">
                      {['1', '10', '50', '100'].map((qty) => (
                        <button
                          key={qty}
                          type="button"
                          onClick={() => setEditions(qty)}
                          className="min-h-[44px] min-w-[44px] px-3 py-1 bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 rounded-xl text-xs font-bold text-slate-300 transition-all border-none cursor-pointer"
                        >
                          {qty}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Genre Chips */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">
                  Select Genre Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGenre(g)}
                      className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer ${
                        genre === g
                          ? 'bg-[#0052FF] text-white shadow-md shadow-blue-500/30'
                          : 'bg-white/[0.04] text-slate-400 hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Track Description & Liner Notes
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share the inspiration, production stories, and technical details of this track..."
                  rows={3}
                  className="w-full bg-white/[0.04] text-white p-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 border-none resize-none"
                />
              </div>

              {/* Custom Attributes / Traits */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Custom Metadata Traits (On-Chain Attributes)</span>
                  <span className="text-[10px] text-slate-400">Total: {customTraits.length}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {customTraits.map((trait, idx) => (
                    <div 
                      key={idx}
                      className="bg-white/[0.04] px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs"
                    >
                      <span className="text-slate-400 font-bold">{trait.trait_type}:</span>
                      <span className="text-white font-black">{String(trait.value)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTrait(idx)}
                        className="text-slate-500 hover:text-rose-400 ml-1 transition-colors border-none bg-transparent cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newTraitKey}
                    onChange={(e) => setNewTraitKey(e.target.value)}
                    placeholder="Trait Type (e.g. Master Tape)"
                    className="flex-1 min-h-[44px] bg-white/[0.04] text-white px-4 py-2 rounded-xl text-xs focus:outline-none border-none"
                  />
                  <input
                    type="text"
                    value={newTraitValue}
                    onChange={(e) => setNewTraitValue(e.target.value)}
                    placeholder="Value (e.g. 1/2-Inch Reel)"
                    className="flex-1 min-h-[44px] bg-white/[0.04] text-white px-4 py-2 rounded-xl text-xs focus:outline-none border-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTrait}
                    className="min-h-[44px] min-w-[44px] px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] active:scale-95 text-white text-xs font-bold rounded-xl transition-all border-none cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 Actions */}
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="min-h-[44px] px-6 py-2.5 text-slate-400 hover:text-white text-xs font-black uppercase tracking-wider transition-colors border-none bg-transparent cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={goToNextStep}
                className="min-h-[44px] px-8 py-3 bg-[#0052FF] hover:bg-[#1a66ff] active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 border-none cursor-pointer shadow-lg shadow-blue-600/30"
              >
                <span>Continue to Royalties</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: ROYALTIES & COLLABORATOR SPLITS */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-purple-900/20 via-blue-900/10 to-transparent p-5 rounded-2xl">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Percent className="w-5 h-5 text-purple-400" />
                Collaborator Royalty Splits & Secondary Fees
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Automate perpetual payouts on TON. Primary splits are settled at point-of-sale, and secondary royalties (up to 15%) are enforced by smart contracts on every subsequent marketplace trade.
              </p>
            </div>

            {/* Primary Splits Section */}
            <div className="bg-[#0B112C] rounded-2xl p-6 space-y-5 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Primary Sale Distribution (100% Total)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Distribute mint revenue automatically to collaborators' TON wallets.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSplitEvenly}
                    className="min-h-[44px] px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 text-blue-400 text-xs font-bold rounded-xl transition-all border-none cursor-pointer"
                  >
                    Split Evenly
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCollaborator}
                    className="min-h-[44px] px-3 py-1.5 bg-[#0052FF] hover:bg-[#1a66ff] active:scale-95 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 border-none cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Collaborator</span>
                  </button>
                </div>
              </div>

              {/* Total percentage status bar */}
              <div className="bg-white/[0.03] p-3 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Distribution Total:</span>
                <span className={`text-xs font-mono font-black ${
                  totalRoyaltyPercentage === 100 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {totalRoyaltyPercentage}% / 100% {totalRoyaltyPercentage === 100 ? '✓ Ready' : '(Must equal 100%)'}
                </span>
              </div>

              {/* Collaborators List */}
              <div className="space-y-3">
                {royaltySplits.map((split, index) => (
                  <div 
                    key={index}
                    className="bg-white/[0.03] p-4 rounded-xl space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3"
                  >
                    <div className="w-full sm:w-1/4">
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Role / Label</label>
                      <input
                        type="text"
                        value={split.label}
                        onChange={(e) => {
                          const updated = [...royaltySplits];
                          updated[index].label = e.target.value;
                          setRoyaltySplits(updated);
                        }}
                        placeholder="e.g. Lead Producer"
                        className="w-full min-h-[44px] bg-black/40 text-white px-3 py-2 rounded-xl text-xs focus:outline-none border-none"
                      />
                    </div>

                    <div className="w-full sm:flex-1">
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">TON Wallet Address</label>
                      <input
                        type="text"
                        value={split.address}
                        onChange={(e) => {
                          const updated = [...royaltySplits];
                          updated[index].address = e.target.value;
                          setRoyaltySplits(updated);
                        }}
                        placeholder="EQ... or ton.dns"
                        className="w-full min-h-[44px] bg-black/40 text-white px-3 py-2 rounded-xl text-xs font-mono focus:outline-none border-none"
                      />
                    </div>

                    <div className="w-full sm:w-28 flex items-center gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Share %</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={split.percentage}
                            onChange={(e) => {
                              const updated = [...royaltySplits];
                              updated[index].percentage = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                              setRoyaltySplits(updated);
                            }}
                            className="w-full min-h-[44px] bg-black/40 text-white px-3 py-2 rounded-xl text-xs font-mono focus:outline-none border-none pr-7"
                          />
                          <span className="absolute right-2.5 top-3 text-xs text-slate-400 font-bold">%</span>
                        </div>
                      </div>

                      {royaltySplits.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCollaborator(index)}
                          className="w-11 h-11 min-w-[44px] min-h-[44px] mt-4 flex items-center justify-center text-slate-500 hover:text-rose-400 transition-colors border-none bg-transparent cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Secondary Market Perpetual Royalty */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                      Secondary Marketplace Resale Royalty
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Royalty % received by the creator every time this NFT trades on secondary markets.
                    </p>
                  </div>
                  <span className="text-sm font-mono font-black text-purple-400 bg-purple-500/10 px-3 py-1 rounded-xl">
                    {secondaryRoyalty}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.5"
                  value={secondaryRoyalty}
                  onChange={(e) => setSecondaryRoyalty(e.target.value)}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0% (No Royalty)</span>
                  <span>5% (Recommended)</span>
                  <span>10% (High Support)</span>
                  <span>15% (Max)</span>
                </div>
              </div>

              {/* Unlockable Perks Option */}
              <div className="pt-2">
                <div 
                  onClick={() => setHasExclusive(!hasExclusive)}
                  className="bg-white/[0.02] hover:bg-white/[0.04] p-4 rounded-xl flex items-start gap-3 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={hasExclusive}
                    onChange={(e) => setHasExclusive(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[#0052FF] cursor-pointer"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-400" />
                      Attach Exclusive Unlockable Content
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Gated material (stems, backstage pass, demo tracks) accessible only to verifiable NFT holders.
                    </p>
                  </div>
                </div>

                {hasExclusive && (
                  <div className="mt-3 p-4 bg-white/[0.03] rounded-xl space-y-3">
                    <input
                      type="text"
                      value={exclusiveTitle}
                      onChange={(e) => setExclusiveTitle(e.target.value)}
                      placeholder="Perk Title (e.g. Lossless Stems Zip)"
                      className="w-full min-h-[44px] bg-black/40 text-white px-3 py-2 rounded-xl text-xs focus:outline-none border-none"
                    />
                    <textarea
                      value={exclusiveDescription}
                      onChange={(e) => setExclusiveDescription(e.target.value)}
                      placeholder="Access instructions or redemption link..."
                      rows={2}
                      className="w-full bg-black/40 text-white p-3 rounded-xl text-xs focus:outline-none border-none resize-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Step 3 Actions */}
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="min-h-[44px] px-6 py-2.5 text-slate-400 hover:text-white text-xs font-black uppercase tracking-wider transition-colors border-none bg-transparent cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={goToNextStep}
                className="min-h-[44px] px-8 py-3 bg-[#0052FF] hover:bg-[#1a66ff] active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 border-none cursor-pointer shadow-lg shadow-blue-600/30"
              >
                <span>Review & Pinata IPFS</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: REVIEW & PINATA IPFS VERIFICATION */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-emerald-900/20 via-blue-900/10 to-transparent p-5 rounded-2xl">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Review & IPFS Pinata Verification
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Verify your final asset compilation and TEP-64 metadata schema before broadcasting the mint transaction to the TON Blockchain smart contract.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Marketplace Card Preview */}
              <div className="bg-[#0B112C] rounded-2xl p-5 space-y-4 shadow-xl shadow-black/20">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-400" />
                  Live Marketplace Card Preview
                </h3>

                <div className="bg-[#070B18] rounded-2xl overflow-hidden p-4 space-y-3">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900">
                    <img 
                      src={coverPreview} 
                      alt="NFT preview" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-white flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-400" />
                      <span>{rarityTier}</span>
                    </div>
                    <div className="absolute top-2.5 right-2.5 bg-[#0052FF] text-white px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold">
                      {price} TON
                    </div>
                    
                    {/* Audio Play Trigger */}
                    <button
                      type="button"
                      onClick={togglePlayAudio}
                      className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/60 hover:bg-[#0052FF] text-white flex items-center justify-center transition-all active:scale-95 border-none cursor-pointer"
                      aria-label="Play sample"
                    >
                      {isPlayingAudio ? (
                        <Pause className="w-5 h-5 fill-white" />
                      ) : (
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      )}
                    </button>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-white truncate">{title || 'Untitled Track'}</h4>
                    <p className="text-xs text-slate-400 truncate">by {artistName}</p>
                    <div className="flex items-center justify-between pt-2 text-[10px] font-mono text-slate-400">
                      <span>Supply: {editions} Editions</span>
                      <span className="text-emerald-400 font-bold">{genre}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* TEP-64 Metadata & Pinata Specs */}
              <div className="bg-[#0B112C] rounded-2xl p-5 space-y-4 shadow-xl shadow-black/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-emerald-400" />
                    TEP-64 IPFS Metadata Schema
                  </h3>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setMetadataViewMode('preview')}
                      className={`min-h-[44px] px-3 py-1 text-[10px] font-bold rounded-xl transition-all border-none cursor-pointer ${
                        metadataViewMode === 'preview' ? 'bg-[#0052FF] text-white' : 'bg-white/[0.04] text-slate-400'
                      }`}
                    >
                      Summary
                    </button>
                    <button
                      type="button"
                      onClick={() => setMetadataViewMode('json')}
                      className={`min-h-[44px] px-3 py-1 text-[10px] font-bold rounded-xl transition-all border-none cursor-pointer ${
                        metadataViewMode === 'json' ? 'bg-[#0052FF] text-white' : 'bg-white/[0.04] text-slate-400'
                      }`}
                    >
                      JSON
                    </button>
                  </div>
                </div>

                {metadataViewMode === 'json' ? (
                  <pre className="bg-[#070B18] p-3 rounded-xl text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-64 leading-tight">
                    {JSON.stringify(metadataJSONPreview, null, 2)}
                  </pre>
                ) : (
                  <div className="bg-[#070B18] p-3.5 rounded-xl space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">IPFS Pinning Service:</span>
                      <span className="font-bold text-white">Pinata Dedicated Gateway</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Metadata Standard:</span>
                      <span className="font-bold text-blue-400">TEP-64 NFT Format</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Secondary Royalty:</span>
                      <span className="font-bold text-purple-400">{secondaryRoyalty}% perpetual</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Smart Contract:</span>
                      <span className="font-mono text-slate-300 text-[10px] truncate max-w-[150px]">
                        {TONJAM_COLLECTION_ADDRESS}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estimated Gas Fee:</span>
                      <span className="font-mono text-emerald-400 font-bold">~0.08 TON</span>
                    </div>
                  </div>
                )}

                {/* Target Blockchain */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-bold text-slate-300">Target Blockchain Network</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBlockchain('ton-mainnet')}
                      className={`min-h-[44px] p-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                        blockchain === 'ton-mainnet' ? 'bg-[#0052FF] text-white' : 'bg-white/[0.04] text-slate-400'
                      }`}
                    >
                      TON Mainnet (Live)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBlockchain('ton-testnet')}
                      className={`min-h-[44px] p-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                        blockchain === 'ton-testnet' ? 'bg-[#0052FF] text-white' : 'bg-white/[0.04] text-slate-400'
                      }`}
                    >
                      TON Testnet (Sandbox)
                    </button>
                  </div>
                </div>

                {/* Rights Attestation Checkbox */}
                <div 
                  onClick={() => setTermsConfirmed(!termsConfirmed)}
                  className="bg-blue-950/20 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    id="terms-checkbox"
                    checked={termsConfirmed}
                    onChange={(e) => setTermsConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#0052FF] cursor-pointer"
                  />
                  <label htmlFor="terms-checkbox" className="cursor-pointer text-[11px] leading-tight text-slate-300">
                    <strong className="text-white">Copyright & Minting Attestation:</strong> I verify that I own or hold all exclusive rights to this sound recording and artwork, and authorize minting to the TON Blockchain with immutable IPFS storage.
                  </label>
                </div>
              </div>
            </div>

            {/* Step 4 Actions */}
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="min-h-[44px] px-6 py-2.5 text-slate-400 hover:text-white text-xs font-black uppercase tracking-wider transition-colors border-none bg-transparent cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleExecuteMint}
                disabled={!termsConfirmed}
                className="min-h-[44px] px-8 py-3 bg-[#0052FF] hover:bg-[#1a66ff] disabled:opacity-50 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 border-none cursor-pointer shadow-lg shadow-blue-600/30"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Confirm & Mint on TON</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 5: MINTING EXECUTION OR SUCCESS RECEIPT */}
        {step === 5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {isMinting ? (
              /* Minting Progress in Execution */
              <div className="bg-[#0B112C] rounded-2xl p-8 text-center space-y-6 shadow-2xl shadow-black/40 max-w-xl mx-auto">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-full blur-xl bg-gradient-to-r from-blue-600 to-indigo-600 opacity-50 animate-pulse" />
                  <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center relative z-10">
                    <Loader2 className="w-10 h-10 text-[#0052FF] animate-spin" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-black uppercase tracking-wider text-white">
                    Minting Music NFT on TON Blockchain
                  </h3>
                  <p className="text-xs text-blue-400 font-mono">
                    {mintStatusText}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white/[0.04] h-2 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#0052FF] to-emerald-400"
                    initial={{ width: '0%' }}
                    animate={{ width: `${mintProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  {mintProgress}% complete
                </div>

                {/* Milestones list */}
                <div className="space-y-2.5 text-left bg-[#070B18] p-4 rounded-xl">
                  {mintingMilestones.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-xs">
                      <span className={`font-mono ${
                        m.done ? 'text-emerald-400 font-bold' : m.inProgress ? 'text-blue-400 font-bold animate-pulse' : 'text-slate-500'
                      }`}>
                        {m.label}
                      </span>
                      {m.done ? (
                        <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                      ) : m.inProgress ? (
                        <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-700" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : mintedNFT ? (
              /* Minting Succeeded Receipt Card */
              <div className="bg-[#0B112C] rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-2xl shadow-black/40 max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    Mint Completed Successfully
                  </span>
                  <h3 className="text-xl font-black text-white pt-2">
                    "{mintedNFT.title}" is Live on TON!
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Your music NFT has been pinned to Pinata IPFS and minted directly to the TON Blockchain smart contract.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="bg-[#070B18] p-4 rounded-2xl flex items-center gap-4 text-left">
                  <img
                    src={mintedNFT.imageUrl || coverPreview}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-black text-white truncate">{mintedNFT.title}</h4>
                    <p className="text-xs text-slate-400 truncate">by {mintedNFT.creator}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-emerald-400 font-bold">
                      <span>Supply: {mintedNFT.supply}</span>
                      <span>•</span>
                      <span>Price: {mintedNFT.price} TON</span>
                    </div>
                  </div>
                </div>

                {/* Direct Explorer & IPFS Links */}
                <div className="grid grid-cols-2 gap-3 text-left">
                  <a
                    href={`https://tonviewer.com/${TONJAM_COLLECTION_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] bg-white/[0.04] hover:bg-white/[0.08] p-3 rounded-xl flex items-center justify-between text-xs text-slate-200 transition-colors cursor-pointer"
                  >
                    <span className="font-bold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-blue-400" />
                      TonViewer
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>

                  <a
                    href={ipfsMetadataHash || 'https://gateway.pinata.cloud'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] bg-white/[0.04] hover:bg-white/[0.08] p-3 rounded-xl flex items-center justify-between text-xs text-slate-200 transition-colors cursor-pointer"
                  >
                    <span className="font-bold flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-emerald-400" />
                      Pinata IPFS
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/marketplace')}
                    className="flex-1 min-h-[44px] py-3 bg-[#0052FF] hover:bg-[#1a66ff] active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all border-none cursor-pointer shadow-lg shadow-blue-600/30"
                  >
                    View on Marketplace
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setAudioFile(null);
                      setAudioPreview('');
                      setCoverFile(null);
                      setCoverPreview('');
                      setTitle('');
                      setMintedNFT(null);
                    }}
                    className="min-h-[44px] px-6 py-3 bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border-none cursor-pointer"
                  >
                    Mint Another Track
                  </button>
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MintNFT;
