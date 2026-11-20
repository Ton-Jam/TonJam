import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Music,
  Image as ImageIcon,
  Upload,
  Play,
  Pause,
  Sparkles,
  Wallet,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Database,
  Layers,
  Percent,
  Plus,
  Trash2,
  Code,
  Eye,
  ExternalLink,
  Disc,
  Wand2,
  FileAudio,
  Copy,
  Check,
  Loader2,
  Crop,
} from 'lucide-react';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { TonJamBackArrow } from '@/components/icons/TonJamBackArrow';
import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  arrayUnion,
  where,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import { useAudio } from '@/contexts/AudioContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNFT } from '@/contexts/NFTContext';
import {
  getPinataStatus,
  uploadToPinata,
  uploadJSONToPinata,
  validateStorageFile,
  PinataStatus,
} from '@/services/storageService';
import {
  TON_NETWORK_MODE,
  TON_MAINNET_CONFIG,
  TON_TESTNET_CONFIG,
  TonNetwork,
  TonTxConfirmationUpdate,
  confirmTonTransaction,
  getTonBalance,
  getTonViewerUrl,
  mintTonJamNFT,
  validateTonAddress,
} from '@/services/tonService';
import { createActivityPost } from '@/services/socialService';
import { compressImageForNFT } from '@/lib/utils';
import { Track, NFTItem, NFTTrait, RoyaltySplitExtended } from '@/types';
import {
  CollectionContractPanel,
  StudioCollectionContract,
} from '@/components/studio/CollectionContractPanel';
import {
  PinataMintPipeline,
  PipelineStage,
  RealTimeMintTelemetry,
} from '@/components/studio/PinataMintPipeline';
import {
  PinnedAssetRecord,
  toPinataAssetRecord,
  formatAudioTime,
  formatBytes,
  shortAddress,
  generateStudioCoverFile,
} from '@/components/studio/StudioCoverGenerator';
import {
  ProfileBannerCropper,
  BannerSaveResult,
} from '@/components/studio/ProfileBannerCropper';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

const GENRES = [
  'Electronic',
  'Hip Hop',
  'Synthwave',
  'Lo-Fi',
  'House',
  'Techno',
  'Ambient',
  'Pop',
  'R&B',
  'Rock',
  'Jazz',
];

const INITIAL_STAGES: PipelineStage[] = [
  { id: 'audio_pin', label: 'Pin Audio Master to Pinata IPFS', status: 'idle' },
  { id: 'cover_pin', label: 'Compress & Pin Cover Art to Pinata IPFS', status: 'idle' },
  { id: 'metadata_pin', label: 'Compile & Pin TEP-64 Metadata JSON', status: 'idle' },
  { id: 'ton_tx', label: 'Sign & Confirm TON Blockchain TX', status: 'idle' },
  { id: 'db_sync', label: 'Sync Catalog & Ledger to Firestore', status: 'idle' },
];

const INITIAL_TELEMETRY: RealTimeMintTelemetry = {
  ipfsUploadStatus: 'idle',
  ipfsUploadProgress: 0,
  ipfsUploadLabel: 'Waiting for media assets',
  metadataPinStatus: 'idle',
  metadataPinProgress: 0,
  metadataPinLabel: 'Waiting for IPFS URLs',
  tonConfirmStatus: 'idle',
  tonConfirmProgress: 0,
  tonConfirmLabel: 'Awaiting metadata pin',
  liveStatusMessage: 'Upload media and configure your release to mint on TON.',
  elapsedSeconds: 0,
  confirmationUpdate: null,
};

export const ArtistStudio: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { userProfile, setUserProfile, addUserTrack, addUserNFT, playTrack } = useAudio();
  const { addNFT } = useNFT();
  const [tonConnectUI] = useTonConnectUI();
  const connectedAddress = useTonAddress();
  const activeWallet = connectedAddress || userProfile?.walletAddress || '';

  // Navigation View Tab
  const [studioTab, setStudioTab] = useState<'workbench' | 'releases'>('workbench');
  const [previewTab, setPreviewTab] = useState<'card' | 'json'>('card');

  // Artist Profile Banner Upload & Cropper State
  const [artistBannerUrl, setArtistBannerUrl] = useState<string>(
    userProfile?.bannerUrl || userProfile?.coverPhoto || ''
  );
  const [isBannerEditorOpen, setIsBannerEditorOpen] = useState(false);
  const [droppedBannerFile, setDroppedBannerFile] = useState<File | null>(null);
  const [isDraggingBannerZone, setIsDraggingBannerZone] = useState(false);

  // Infrastructure & Network State
  const [selectedNetwork, setSelectedNetwork] = useState<TonNetwork>(TON_NETWORK_MODE);
  const [selectedContractAddress, setSelectedContractAddress] = useState<string>(
    TON_NETWORK_MODE === 'mainnet'
      ? TON_MAINNET_CONFIG.collectionAddress
      : TON_TESTNET_CONFIG.collectionAddress
  );
  const [pinataStatus, setPinataStatus] = useState<PinataStatus | null>(null);
  const [checkingPinata, setCheckingPinata] = useState<boolean>(true);
  const [walletBalanceTon, setWalletBalanceTon] = useState<number | null>(null);

  // Artist Firestore Collections & Releases
  const [artistCollections, setArtistCollections] = useState<StudioCollectionContract[]>([]);
  const [artistNFTs, setArtistNFTs] = useState<NFTItem[]>([]);
  const [artistTracks, setArtistTracks] = useState<Track[]>([]);
  const [loadingReleases, setLoadingReleases] = useState<boolean>(true);

  // Audio & Artwork File State
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string>('');
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string>('');
  const [isDraggingAudio, setIsDraggingAudio] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);

  // Pre-pinned Pinata asset state
  const [pinnedAudio, setPinnedAudio] = useState<PinnedAssetRecord | null>(null);
  const [pinnedCover, setPinnedCover] = useState<PinnedAssetRecord | null>(null);
  const [pinnedMetadata, setPinnedMetadata] = useState<PinnedAssetRecord | null>(null);
  const [pinningAssetType, setPinningAssetType] = useState<'audio' | 'cover' | null>(null);
  const [singlePinProgress, setSinglePinProgress] = useState<number>(0);

  // Inline Audio Player State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Track & TEP-64 NFT Release Metadata
  const [title, setTitle] = useState('');
  const [artistName, setArtistName] = useState(userProfile?.name || 'TonJam Artist');
  const [albumName, setAlbumName] = useState('');
  const [genre, setGenre] = useState('Electronic');
  const [bpm, setBpm] = useState('124');
  const [keySignature, setKeySignature] = useState('A minor');
  const [audioQuality, setAudioQuality] = useState('24-bit Lossless Studio Master');
  const [description, setDescription] = useState('');
  const [lyrics, setLyrics] = useState('');

  // NFT Mint Economics & Splits
  const [mintPrice, setMintPrice] = useState('2.5');
  const [editions, setEditions] = useState('25');
  const [listingType, setListingType] = useState<'fixed' | 'auction'>('fixed');
  const [rarityTier, setRarityTier] = useState<'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic'>('Rare');
  const [secondaryRoyaltyPct, setSecondaryRoyaltyPct] = useState('5');
  const [hasExclusivePerks, setHasExclusivePerks] = useState(false);
  const [exclusivePerksText, setExclusivePerksText] = useState(
    'Unlocks lossless stems download and holder-only listening sessions.'
  );
  const [customTraits, setCustomTraits] = useState<NFTTrait[]>([
    { trait_type: 'Master Edition', value: 'Studio Genesis' },
    { trait_type: 'Storage Layer', value: 'Pinata IPFS' },
  ]);
  const [newTraitType, setNewTraitType] = useState('');
  const [newTraitValue, setNewTraitValue] = useState('');
  const [royaltySplits, setRoyaltySplits] = useState<RoyaltySplitExtended[]>([
    { address: activeWallet, percentage: 100, label: 'Primary Artist' },
  ]);

  // Pipeline Execution State
  const [stages, setStages] = useState<PipelineStage[]>(INITIAL_STAGES);
  const [telemetry, setTelemetry] = useState<RealTimeMintTelemetry>(INITIAL_TELEMETRY);
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [mintTxHash, setMintTxHash] = useState('');
  const [mintedNFT, setMintedNFT] = useState<NFTItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const confirmAbortRef = useRef<AbortController | null>(null);

  // Elapsed timer while minting / publishing pipeline is running
  useEffect(() => {
    if (!isExecuting) return;
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const secs = Math.floor((Date.now() - startedAt) / 1000);
      setTelemetry((prev) => ({ ...prev, elapsedSeconds: secs }));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isExecuting]);

  useEffect(() => {
    return () => {
      confirmAbortRef.current?.abort();
    };
  }, []);

  // Keep artistName, bannerUrl & primary split wallet synced cleanly
  useEffect(() => {
    if (userProfile?.name && artistName === 'TonJam Artist') {
      setArtistName(userProfile.name);
    }
    const nextBanner = userProfile?.bannerUrl || userProfile?.coverPhoto || '';
    if (nextBanner) {
      setArtistBannerUrl(nextBanner);
    }
  }, [userProfile?.name, userProfile?.bannerUrl, userProfile?.coverPhoto]);

  useEffect(() => {
    if (activeWallet) {
      setRoyaltySplits((prev) =>
        prev.length === 1 && !prev[0].address ? [{ ...prev[0], address: activeWallet }] : prev
      );
      getTonBalance(activeWallet, selectedNetwork)
        .then(setWalletBalanceTon)
        .catch(() => setWalletBalanceTon(null));
    } else {
      setWalletBalanceTon(null);
    }
  }, [activeWallet, selectedNetwork]);

  // Switch default protocol contract when toggling Mainnet / Testnet cleanly
  const handleNetworkSwitch = (nextNet: TonNetwork) => {
    setSelectedNetwork(nextNet);
    const defaultAddr =
      nextNet === 'mainnet'
        ? TON_MAINNET_CONFIG.collectionAddress
        : TON_TESTNET_CONFIG.collectionAddress;
    setSelectedContractAddress(defaultAddr);
  };

  // Load Pinata configuration status
  const refreshPinataStatus = async (verifyAuth = false) => {
    setCheckingPinata(true);
    try {
      const status = await getPinataStatus(verifyAuth);
      setPinataStatus(status);
      if (verifyAuth) {
        if (status.authenticated) {
          toast.success('Pinata IPFS API credentials verified');
        } else if (!status.configured) {
          toast.warning('Pinata environment variables are not configured on server');
        } else {
          toast.error(status.verifyError || 'Pinata credential check failed');
        }
      }
    } catch (err: any) {
      setPinataStatus({
        configured: false,
        authMode: 'none',
        hasJwt: false,
        hasApiKeyPair: false,
        authenticated: false,
        verifyError: err?.message || 'Unable to query Pinata status endpoint',
        maxFileSizeBytes: 50 * 1024 * 1024,
        gatewayBaseUrl: 'https://gateway.pinata.cloud/ipfs',
      });
    } finally {
      setCheckingPinata(false);
    }
  };

  useEffect(() => {
    refreshPinataStatus(false);
  }, []);

  // Subscribe to artist's Firestore collections, NFTs, and tracks
  useEffect(() => {
    const uid = userProfile?.uid || user?.uid;
    if (!uid) {
      setLoadingReleases(false);
      return;
    }

    setLoadingReleases(true);

    const colQ = query(collection(db, 'collections'), where('creatorId', '==', uid));
    const unsubCols = onSnapshot(
      colQ,
      (snap) => {
        const list: StudioCollectionContract[] = snap.docs
          .map((d) => {
            const data = d.data() as any;
            return {
              id: d.id,
              name: data.name || 'Artist Collection',
              contractAddress: data.contractAddress || '',
              network: (data.network === 'mainnet' || data.network === 'testnet' || data.network === 'all' ? data.network : 'all') as TonNetwork | 'all',
              description: data.description,
              royaltyBps: data.royaltyBps,
              metadataUrl: data.metadataUrl,
            };
          })
          .filter((c) => Boolean(c.contractAddress));
        setArtistCollections(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'collections');
      }
    );

    const nftQ = query(collection(db, 'nfts'), where('creatorId', '==', uid));
    const unsubNfts = onSnapshot(
      nftQ,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as NFTItem));
        list.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setArtistNFTs(list);
        setLoadingReleases(false);
      },
      (error) => {
        setLoadingReleases(false);
        handleFirestoreError(error, OperationType.LIST, 'nfts');
      }
    );

    const trackQ = query(collection(db, 'tracks'), where('artistId', '==', uid));
    const unsubTracks = onSnapshot(
      trackQ,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Track));
        list.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setArtistTracks(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'tracks');
      }
    );

    return () => {
      unsubCols();
      unsubNfts();
      unsubTracks();
    };
  }, [userProfile?.uid, user?.uid]);

  // Clean up audio object & blob URLs on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const totalSplitPercentage = royaltySplits.reduce(
    (sum, s) => sum + (Number(s.percentage) || 0),
    0
  );

  // Audio Selection
  const handleSelectAudio = (file: File) => {
    const check = validateStorageFile(file, 'audio');
    if (!check.isValid) {
      toast.error(check.error || 'Unsupported audio file');
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentTime(0);
    }

    const objectUrl = URL.createObjectURL(file);
    setAudioFile(file);
    setAudioPreviewUrl(objectUrl);
    setPinnedAudio(null);
    setPinnedMetadata(null);

    if (!title.trim()) {
      const derived = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');
      setTitle(derived);
    }

    const probe = new Audio(objectUrl);
    probe.onloadedmetadata = () => {
      if (probe.duration && Number.isFinite(probe.duration)) {
        setAudioDuration(Math.round(probe.duration));
      }
    };

    toast.success(`Loaded audio file (${formatBytes(file.size)})`);
  };

  // Artwork Selection
  const handleSelectCover = (file: File) => {
    const check = validateStorageFile(file, 'image');
    if (!check.isValid) {
      toast.error(check.error || 'Unsupported image file');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setCoverFile(file);
    setCoverPreviewUrl(objectUrl);
    setPinnedCover(null);
    setPinnedMetadata(null);
    toast.success(`Loaded cover artwork (${formatBytes(file.size)})`);
  };

  // Deterministic Local Canvas Artwork Generator
  const handleGenerateStudioCover = async () => {
    setIsGeneratingCover(true);
    try {
      const generatedFile = await generateStudioCoverFile(
        title || 'TonJam Master',
        artistName || 'Artist',
        genre
      );
      const url = URL.createObjectURL(generatedFile);
      setCoverFile(generatedFile);
      setCoverPreviewUrl(url);
      setPinnedCover(null);
      setPinnedMetadata(null);
      toast.success('Generated custom studio cover artwork');
    } catch (err: any) {
      toast.error(err?.message || 'Unable to generate cover artwork');
    } finally {
      setIsGeneratingCover(false);
    }
  };

  // Pin individual asset to Pinata immediately
  const handlePinSingleAsset = async (kind: 'audio' | 'cover') => {
    if (kind === 'audio' && !audioFile) {
      toast.error('Select an audio file first');
      return;
    }
    if (kind === 'cover' && !coverFile) {
      toast.error('Select or generate a cover image first');
      return;
    }

    setPinningAssetType(kind);
    setSinglePinProgress(0);

    try {
      if (kind === 'audio' && audioFile) {
        const url = await uploadToPinata(audioFile, (pct) => setSinglePinProgress(pct));
        const record = toPinataAssetRecord(url, audioFile.name, audioFile.size);
        setPinnedAudio(record);
        toast.success('Audio pinned to Pinata IPFS', { description: record.cid });
      } else if (kind === 'cover' && coverFile) {
        const compressed = await compressImageForNFT(coverFile);
        const url = await uploadToPinata(compressed, (pct) => setSinglePinProgress(pct));
        const record = toPinataAssetRecord(url, compressed.name, compressed.size);
        setPinnedCover(record);
        toast.success('Cover art pinned to Pinata IPFS', { description: record.cid });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Pinata upload failed');
    } finally {
      setPinningAssetType(null);
      setSinglePinProgress(0);
    }
  };

  // Audio playback controls
  const toggleStudioAudio = () => {
    const src = pinnedAudio?.gatewayUrl || audioPreviewUrl;
    if (!src) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (!audioRef.current || audioRef.current.src !== src) {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(src);
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
      };
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
    }

    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => toast.error('Audio playback interrupted'));
  };

  const handleSeekAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextTime = Number(e.target.value);
    setCurrentTime(nextTime);
    if (audioRef.current) {
      audioRef.current.currentTime = nextTime;
    }
  };

  // Royalty split helpers
  const handleAddSplit = () => {
    if (royaltySplits.length >= 6) {
      toast.warning('Maximum 6 collaborator splits allowed');
      return;
    }
    setRoyaltySplits([...royaltySplits, { address: '', percentage: 0, label: 'Collaborator' }]);
  };

  const handleSplitEvenly = () => {
    const count = royaltySplits.length;
    if (!count) return;
    const base = Math.floor(100 / count);
    const rem = 100 - base * count;
    setRoyaltySplits(
      royaltySplits.map((s, idx) => ({ ...s, percentage: idx === 0 ? base + rem : base }))
    );
  };

  // Custom Traits
  const handleAddTrait = () => {
    if (!newTraitType.trim() || !newTraitValue.trim()) return;
    setCustomTraits([
      ...customTraits,
      { trait_type: newTraitType.trim(), value: newTraitValue.trim() },
    ]);
    setNewTraitType('');
    setNewTraitValue('');
  };

  // Compiled TEP-64 attributes & JSON preview
  const compiledAttributes: NFTTrait[] = useMemo(
    () => [
      { trait_type: 'Artist', value: artistName.trim() || 'Artist' },
      { trait_type: 'Release', value: albumName.trim() || 'Single' },
      { trait_type: 'Genre', value: genre },
      { trait_type: 'BPM', value: bpm },
      { trait_type: 'Key', value: keySignature },
      { trait_type: 'Audio Master', value: audioQuality },
      { trait_type: 'Rarity', value: rarityTier },
      { trait_type: 'Royalty Fee', value: `${secondaryRoyaltyPct}%` },
      {
        trait_type: 'TON Network',
        value: selectedNetwork === 'mainnet' ? 'TON Mainnet (-239)' : 'TON Testnet (-3)',
      },
      { trait_type: 'Collection Contract', value: selectedContractAddress },
      ...customTraits,
    ],
    [
      artistName,
      albumName,
      genre,
      bpm,
      keySignature,
      audioQuality,
      rarityTier,
      secondaryRoyaltyPct,
      selectedNetwork,
      selectedContractAddress,
      customTraits,
    ]
  );

  const tep64Payload = useMemo(
    () => ({
      name: (title.trim() || 'Untitled Track').slice(0, 300),
      description: (
        description.trim() ||
        `Official Music NFT by ${artistName.trim() || 'TonJam Artist'} stored on Pinata IPFS and minted on TON.`
      ).slice(0, 2000),
      image: pinnedCover?.gatewayUrl || 'ipfs://pending-cover-upload',
      content_url: pinnedAudio?.gatewayUrl || 'ipfs://pending-audio-upload',
      animation_url: pinnedAudio?.gatewayUrl || 'ipfs://pending-audio-upload',
      attributes: compiledAttributes,
      properties: {
        category: 'audio',
        duration_seconds: audioDuration,
        editions: Number(editions) || 1,
        listing_type: listingType,
        price_ton: mintPrice,
        collection_contract: selectedContractAddress,
        royalty_bps: Math.round((parseFloat(secondaryRoyaltyPct) || 5) * 100),
        collaborator_splits: royaltySplits,
        ...(hasExclusivePerks ? { exclusive_perk: exclusivePerksText } : {}),
      },
    }),
    [
      title,
      description,
      artistName,
      pinnedCover,
      pinnedAudio,
      compiledAttributes,
      audioDuration,
      editions,
      listingType,
      mintPrice,
      selectedContractAddress,
      secondaryRoyaltyPct,
      royaltySplits,
      hasExclusivePerks,
      exclusivePerksText,
    ]
  );

  const setStageStatus = (
    id: PipelineStage['id'],
    status: PipelineStage['status'],
    progress: number,
    detail?: string,
    stageProgress?: number
  ) => {
    setPipelineProgress(progress);
    setStages((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status,
              detail: detail ?? s.detail,
              progress: stageProgress !== undefined ? stageProgress : s.progress,
            }
          : s
      )
    );
  };

  // Validate form inputs before executing pipeline
  const validateReleaseInputs = (requireWalletAndContract: boolean): string | null => {
    if (!audioFile && !pinnedAudio) {
      return 'Please upload an audio master file (MP3, WAV, FLAC, OGG, AAC, or M4A).';
    }
    if (!coverFile && !pinnedCover) {
      return 'Please upload cover artwork or click "Generate Cover".';
    }
    if (!title.trim()) {
      return 'Please enter a track title.';
    }
    if (!artistName.trim()) {
      return 'Please enter the artist display name.';
    }
    if (requireWalletAndContract) {
      if (!activeWallet) {
        return 'Please connect your TON wallet to sign the minting transaction.';
      }
      if (!validateTonAddress(selectedContractAddress, selectedNetwork)) {
        return `Selected collection contract address is invalid for TON ${selectedNetwork}.`;
      }
      if (!mintPrice || parseFloat(mintPrice) <= 0) {
        return 'Mint price must be greater than 0 TON.';
      }
      if (!editions || parseInt(editions, 10) < 1) {
        return 'Edition supply must be at least 1.';
      }
      if (totalSplitPercentage !== 100) {
        return `Royalty collaborator splits must total 100% (currently ${totalSplitPercentage}%).`;
      }
    }
    return null;
  };

  const handlePublishTrackOnly = async () => {
    const validationErr = validateReleaseInputs(false);
    if (validationErr) {
      setPipelineError(validationErr);
      toast.error(validationErr);
      return;
    }

    setPipelineError(null);
    setIsExecuting(true);
    setStages(INITIAL_STAGES);
    setTelemetry({
      ...INITIAL_TELEMETRY,
      ipfsUploadStatus: 'active',
      ipfsUploadProgress: 5,
      ipfsUploadLabel: 'Preparing media upload...',
      liveStatusMessage: 'Uploading media assets to Pinata IPFS...',
    });

    try {
      let audioAsset = pinnedAudio;
      if (!audioAsset && audioFile) {
        setStageStatus('audio_pin', 'active', 10, `Uploading ${audioFile.name} to Pinata...`, 0);
        const audioUrl = await uploadToPinata(audioFile, (pct) => {
          setPipelineProgress(Math.round(pct * 0.45));
          setStageStatus('audio_pin', 'active', Math.round(pct * 0.45), `Uploading ${audioFile.name}...`, pct);
          setTelemetry((prev) => ({
            ...prev,
            ipfsUploadStatus: 'active',
            ipfsUploadProgress: Math.round(pct * 0.6),
            ipfsUploadLabel: `Uploading audio (${pct}%)`,
            liveStatusMessage: `Uploading audio master to Pinata IPFS (${pct}%)...`,
          }));
        });
        audioAsset = toPinataAssetRecord(audioUrl, audioFile.name, audioFile.size);
        setPinnedAudio(audioAsset);
      }
      setStageStatus('audio_pin', 'done', 45, audioAsset?.cid, 100);

      let coverAsset = pinnedCover;
      if (!coverAsset && coverFile) {
        setStageStatus('cover_pin', 'active', 55, 'Optimizing & pinning cover art...', 10);
        setTelemetry((prev) => ({
          ...prev,
          ipfsUploadProgress: 65,
          ipfsUploadLabel: 'Compressing & uploading cover...',
          liveStatusMessage: 'Compressing & uploading cover art to Pinata IPFS...',
        }));
        const compressed = await compressImageForNFT(coverFile);
        const coverUrl = await uploadToPinata(compressed, (pct) => {
          setPipelineProgress(50 + Math.round(pct * 0.3));
          setStageStatus('cover_pin', 'active', 50 + Math.round(pct * 0.3), 'Pinning cover artwork...', pct);
          setTelemetry((prev) => ({
            ...prev,
            ipfsUploadProgress: 60 + Math.round(pct * 0.4),
            ipfsUploadLabel: `Uploading cover (${pct}%)`,
          }));
        });
        coverAsset = toPinataAssetRecord(coverUrl, compressed.name, compressed.size);
        setPinnedCover(coverAsset);
      }
      setStageStatus('cover_pin', 'done', 80, coverAsset?.cid, 100);
      setTelemetry((prev) => ({
        ...prev,
        ipfsUploadStatus: 'done',
        ipfsUploadProgress: 100,
        ipfsUploadLabel: 'Audio & cover pinned',
        metadataPinStatus: 'done',
        metadataPinProgress: 100,
        metadataPinLabel: 'Stream release (no NFT)',
        tonConfirmStatus: 'done',
        tonConfirmProgress: 100,
        tonConfirmLabel: 'Off-chain stream track',
        liveStatusMessage: 'Publishing streamable track to Firestore...',
      }));

      setStageStatus('metadata_pin', 'done', 85, 'Skipped (Stream-only release)', 100);
      setStageStatus('ton_tx', 'done', 90, 'Skipped (Off-chain stream release)', 100);
      setStageStatus('db_sync', 'active', 95, 'Publishing track to Firestore...');

      const uid = userProfile?.uid || user?.uid || 'anonymous';
      const trackId = `track-studio-${Date.now()}`;
      const trackDoc: Track = {
        id: trackId,
        songId: `song-${trackId}`,
        title: title.trim().slice(0, 300),
        artist: artistName.trim(),
        artistId: uid,
        album: albumName.trim() || 'Single',
        coverUrl: coverAsset!.gatewayUrl,
        coverIpfsUrl: coverAsset!.gatewayUrl,
        audioUrl: audioAsset!.gatewayUrl,
        audioIpfsUrl: audioAsset!.gatewayUrl,
        ipfsUrl: audioAsset!.gatewayUrl,
        cid: audioAsset!.cid,
        duration: audioDuration || 180,
        genre,
        bpm: Number(bpm) || 120,
        key: keySignature,
        bitrate: audioQuality,
        description: description.trim().slice(0, 4500),
        lyrics,
        isNFT: false,
        artistVerified: Boolean(userProfile?.isVerifiedArtist),
        createdAt: new Date().toISOString(),
        playCount: 0,
        likes: 0,
      };

      await addUserTrack(trackDoc);
      setStageStatus('db_sync', 'done', 100, 'Track published to TonJam', 100);
      setTelemetry((prev) => ({
        ...prev,
        liveStatusMessage: `"${trackDoc.title}" pinned & published.`,
      }));
      toast.success(`"${trackDoc.title}" pinned to Pinata & published for streaming!`);
    } catch (err: any) {
      const msg = err?.message || 'Failed to publish track';
      setPipelineError(msg);
      setStages((prev) =>
        prev.map((s) => (s.status === 'active' ? { ...s, status: 'error', detail: msg } : s))
      );
      setTelemetry((prev) => ({
        ...prev,
        ipfsUploadStatus: prev.ipfsUploadStatus === 'active' ? 'error' : prev.ipfsUploadStatus,
        liveStatusMessage: msg,
      }));
      toast.error(msg);
    } finally {
      setIsExecuting(false);
    }
  };

  // Full Pinata IPFS Pin + TON Collection Smart Contract Mint + Live Confirmation + Firestore Sync
  const handleExecuteFullMint = async () => {
    const validationErr = validateReleaseInputs(true);
    if (validationErr) {
      setPipelineError(validationErr);
      toast.error(validationErr);
      return;
    }

    confirmAbortRef.current?.abort();
    const abortController = new AbortController();
    confirmAbortRef.current = abortController;

    setPipelineError(null);
    setIsExecuting(true);
    setMintedNFT(null);
    setMintTxHash('');
    setStages(INITIAL_STAGES);
    setTelemetry({
      ...INITIAL_TELEMETRY,
      ipfsUploadStatus: 'active',
      ipfsUploadProgress: 5,
      ipfsUploadLabel: 'Preparing audio upload...',
      liveStatusMessage: 'Uploading audio master to Pinata IPFS...',
    });

    const toastId = toast.loading('Starting Pinata IPFS & TON Minting Pipeline...');

    try {
      // 1. Pin Audio Master to Pinata (IPFS Uploading: 0% -> 65%)
      let audioAsset = pinnedAudio;
      if (!audioAsset && audioFile) {
        setStageStatus('audio_pin', 'active', 5, `Uploading ${audioFile.name} to Pinata...`, 0);
        const audioUrl = await uploadToPinata(audioFile, (pct) => {
          const overall = 5 + Math.round(pct * 0.25);
          setStageStatus('audio_pin', 'active', overall, `Uploading audio (${pct}%)...`, pct);
          setTelemetry((prev) => ({
            ...prev,
            ipfsUploadStatus: 'active',
            ipfsUploadProgress: Math.round(pct * 0.65),
            ipfsUploadLabel: `Audio ${pct}%`,
            liveStatusMessage: `Uploading audio master to Pinata IPFS (${pct}%)...`,
          }));
        });
        audioAsset = toPinataAssetRecord(audioUrl, audioFile.name, audioFile.size);
        setPinnedAudio(audioAsset);
      }
      if (!audioAsset) throw new Error('Audio pinning failed to return a valid CID.');
      setStageStatus('audio_pin', 'done', 30, `CID: ${shortAddress(audioAsset.cid, 6, 4)}`, 100);

      // 2. Compress & Pin Cover Art to Pinata (IPFS Uploading: 65% -> 100%)
      let coverAsset = pinnedCover;
      if (!coverAsset && coverFile) {
        setStageStatus('cover_pin', 'active', 35, 'Compressing & uploading artwork...', 10);
        setTelemetry((prev) => ({
          ...prev,
          ipfsUploadStatus: 'active',
          ipfsUploadProgress: 68,
          ipfsUploadLabel: 'Compressing cover art...',
          liveStatusMessage: 'Optimizing & uploading cover artwork to Pinata IPFS...',
        }));
        const compressedCover = await compressImageForNFT(coverFile);
        const coverUrl = await uploadToPinata(compressedCover, (pct) => {
          const overall = 35 + Math.round(pct * 0.15);
          setStageStatus('cover_pin', 'active', overall, `Uploading cover (${pct}%)...`, pct);
          setTelemetry((prev) => ({
            ...prev,
            ipfsUploadStatus: 'active',
            ipfsUploadProgress: 65 + Math.round(pct * 0.35),
            ipfsUploadLabel: `Cover ${pct}%`,
            liveStatusMessage: `Uploading cover artwork to Pinata IPFS (${pct}%)...`,
          }));
        });
        coverAsset = toPinataAssetRecord(coverUrl, compressedCover.name, compressedCover.size);
        setPinnedCover(coverAsset);
      }
      if (!coverAsset) throw new Error('Cover pinning failed to return a valid CID.');
      setStageStatus('cover_pin', 'done', 50, `CID: ${shortAddress(coverAsset.cid, 6, 4)}`, 100);
      setTelemetry((prev) => ({
        ...prev,
        ipfsUploadStatus: 'done',
        ipfsUploadProgress: 100,
        ipfsUploadLabel: 'Audio & cover pinned',
        metadataPinStatus: 'active',
        metadataPinProgress: 15,
        metadataPinLabel: 'Compiling TEP-64 JSON...',
        liveStatusMessage: 'Compiling and pinning TEP-64 metadata to Pinata IPFS...',
      }));

      // 3. Compile & Pin TEP-64 Metadata JSON to Pinata
      setStageStatus('metadata_pin', 'active', 55, 'Pinning TEP-64 metadata JSON...', 25);
      const finalMetadata = {
        ...tep64Payload,
        image: coverAsset.gatewayUrl,
        content_url: audioAsset.gatewayUrl,
        animation_url: audioAsset.gatewayUrl,
      };
      const metadataUrl = await uploadJSONToPinata(finalMetadata, (pct) => {
        const overall = 55 + Math.round(pct * 0.12);
        setStageStatus('metadata_pin', 'active', overall, `Pinning JSON (${pct}%)...`, pct);
        setTelemetry((prev) => ({
          ...prev,
          metadataPinStatus: 'active',
          metadataPinProgress: pct,
          metadataPinLabel: `Pinning JSON (${pct}%)`,
        }));
      });
      const metadataAsset = toPinataAssetRecord(metadataUrl, `${title}-metadata.json`);
      setPinnedMetadata(metadataAsset);
      setStageStatus('metadata_pin', 'done', 68, `CID: ${shortAddress(metadataAsset.cid, 6, 4)}`, 100);
      setTelemetry((prev) => ({
        ...prev,
        metadataPinStatus: 'done',
        metadataPinProgress: 100,
        metadataPinLabel: `CID ${shortAddress(metadataAsset.cid, 5, 4)}`,
        tonConfirmStatus: 'active',
        tonConfirmProgress: 20,
        tonConfirmLabel: 'Awaiting TON wallet signature',
        liveStatusMessage: 'Confirm the mint transaction in your TON wallet...',
      }));

      // 4. Sign & Broadcast TON Smart Contract Mint TX on selected collection contract
      setStageStatus(
        'ton_tx',
        'active',
        72,
        `Approve mint TX in TON wallet (${shortAddress(selectedContractAddress, 6, 4)})`,
        25
      );
      toast.loading('Approve the NFT mint transaction in your TON wallet...', { id: toastId });

      const txHash = await mintTonJamNFT(tonConnectUI, activeWallet, metadataAsset.gatewayUrl, {
        collectionAddress: selectedContractAddress,
        network: selectedNetwork,
      });

      setMintTxHash(txHash);
      setStageStatus(
        'ton_tx',
        'active',
        78,
        `TX broadcast (${shortAddress(txHash, 6, 4)}), confirming on-chain...`,
        55
      );
      setTelemetry((prev) => ({
        ...prev,
        tonConfirmStatus: 'active',
        tonConfirmProgress: 50,
        tonConfirmLabel: 'Polling TON blockchain...',
        liveStatusMessage: 'Transaction signed! Polling TON blockchain for block confirmation...',
      }));
      toast.loading('Confirming mint transaction on TON blockchain...', { id: toastId });

      // 4b. Live TON blockchain transaction confirmation polling
      const confirmationResult: TonTxConfirmationUpdate = await confirmTonTransaction(
        selectedContractAddress,
        txHash,
        selectedNetwork,
        {
          maxAttempts: 6,
          pollIntervalMs: 2000,
          signal: abortController.signal,
          onUpdate: (update) => {
            const pollProgress =
              update.phase === 'confirmed'
                ? 100
                : Math.min(95, 50 + Math.round((update.attempt / update.maxAttempts) * 45));
            const overall =
              update.phase === 'confirmed'
                ? 92
                : Math.min(90, 78 + Math.round((update.attempt / update.maxAttempts) * 12));
            setPipelineProgress(overall);
            setStageStatus(
              'ton_tx',
              update.phase === 'confirmed' ? 'done' : 'active',
              overall,
              update.phase === 'confirmed'
                ? `Confirmed on-chain (${shortAddress(txHash, 6, 4)})`
                : `Confirming on TON (${update.attempt}/${update.maxAttempts})...`,
              pollProgress
            );
            setTelemetry((prev) => ({
              ...prev,
              confirmationUpdate: update,
              tonConfirmStatus:
                update.phase === 'confirmed'
                  ? 'done'
                  : update.phase === 'timeout'
                  ? 'submitted'
                  : 'active',
              tonConfirmProgress: update.phase === 'timeout' ? 100 : pollProgress,
              tonConfirmLabel:
                update.phase === 'confirmed'
                  ? `Confirmed (Poll #${update.attempt})`
                  : update.phase === 'timeout'
                  ? 'Broadcast (Indexing)'
                  : `Confirming (${update.attempt}/${update.maxAttempts})`,
              liveStatusMessage:
                update.phase === 'confirmed'
                  ? 'TON transaction confirmed on-chain! Finalizing catalog...'
                  : update.phase === 'timeout'
                  ? 'Transaction broadcast to TON! Syncing Firestore catalog...'
                  : `Polling TON ${selectedNetwork} RPC (${update.attempt}/${update.maxAttempts})...`,
            }));
          },
        }
      );

      setStageStatus(
        'ton_tx',
        'done',
        92,
        confirmationResult.phase === 'confirmed'
          ? `Confirmed TX: ${shortAddress(txHash, 8, 6)}`
          : `Submitted TX: ${shortAddress(txHash, 8, 6)}`,
        100
      );

      // 5. Sync Track, NFT, Collection Link & Transaction Ledger to Firestore
      setStageStatus('db_sync', 'active', 95, 'Writing Track, NFT & ledger to Firestore...', 50);
      setTelemetry((prev) => ({
        ...prev,
        liveStatusMessage: 'Syncing minted track, NFT & transaction ledger to Firestore...',
      }));
      const uid = userProfile?.uid || user?.uid || 'anonymous';
      const nowIso = new Date().toISOString();
      const trackId = `track-studio-${Date.now()}`;
      const nftId = `nft-studio-${Date.now()}`;
      const safeTitle = title.trim().slice(0, 300);
      const safeDesc = (
        description.trim() ||
        `Music NFT minted via TonJam Artist Studio on ${selectedNetwork}.`
      ).slice(0, 4900);

      const newTrack: Track = {
        id: trackId,
        songId: `song-${trackId}`,
        title: safeTitle,
        artist: artistName.trim(),
        artistId: uid,
        album: albumName.trim() || 'Single',
        coverUrl: coverAsset.gatewayUrl.slice(0, 2040),
        coverIpfsUrl: coverAsset.gatewayUrl.slice(0, 2040),
        audioUrl: audioAsset.gatewayUrl.slice(0, 2040),
        audioIpfsUrl: audioAsset.gatewayUrl.slice(0, 2040),
        ipfsUrl: metadataAsset.gatewayUrl.slice(0, 2040),
        cid: metadataAsset.cid,
        nftCollection: selectedContractAddress,
        nftId,
        nftPrice: mintPrice,
        duration: audioDuration || 180,
        genre,
        bpm: Number(bpm) || 120,
        key: keySignature,
        bitrate: audioQuality,
        description: safeDesc,
        lyrics,
        isNFT: true,
        artistVerified: Boolean(userProfile?.isVerifiedArtist),
        price: mintPrice,
        editions,
        minted: 1,
        listingType,
        rarity: rarityTier,
        royalty: secondaryRoyaltyPct,
        royaltySplits: royaltySplits.map((s) => ({
          ...s,
          percentage: (Number(s.percentage) || 0) / 100,
        })),
        isExclusive: hasExclusivePerks,
        createdAt: nowIso,
        playCount: 0,
        likes: 0,
      };

      await addUserTrack(newTrack);

      const newNFT: NFTItem = {
        id: nftId,
        trackId,
        title: safeTitle,
        owner: activeWallet,
        ownerId: uid,
        creator: artistName.trim(),
        creatorId: uid,
        artist: artistName.trim(),
        artistId: uid,
        nftCollection: selectedContractAddress,
        contractAddress: selectedContractAddress,
        nftContractAddress: selectedContractAddress,
        price: mintPrice,
        imageUrl: coverAsset.gatewayUrl.slice(0, 2040),
        coverUrl: coverAsset.gatewayUrl.slice(0, 2040),
        audioUrl: audioAsset.gatewayUrl.slice(0, 2040),
        edition: `1 of ${editions}`,
        supply: parseInt(editions, 10) || 1,
        minted: 1,
        listingType,
        isAuction: listingType === 'auction',
        ...(listingType === 'auction' ? { startingBid: mintPrice } : {}),
        rarity: rarityTier,
        royalty: Number(secondaryRoyaltyPct) || 5,
        royaltySplits: royaltySplits.map((s) => ({
          ...s,
          percentage: (Number(s.percentage) || 0) / 100,
        })),
        artistVerified: Boolean(userProfile?.isVerifiedArtist),
        description: safeDesc,
        traits: compiledAttributes,
        attributes: compiledAttributes,
        ipfsUrl: metadataAsset.gatewayUrl.slice(0, 2040),
        cid: metadataAsset.cid,
        createdAt: nowIso,
        history: [
          {
            event: 'Minted',
            from: '0x0000000000000000000000000000000000000000',
            to: activeWallet,
            date: nowIso,
            price: mintPrice,
          },
        ],
      };

      await addUserNFT(newNFT);
      addNFT(newNFT);

      // Record blockchain transaction log compliant with firestore.rules (status: 'initiated' | 'pending')
      if (userProfile?.uid || user?.uid) {
        const txDocId = `tx-mint-${Date.now()}`;
        try {
          await setDoc(doc(db, 'transactions', txDocId), {
            id: txDocId,
            userId: uid,
            type: 'nft_mint',
            status: 'initiated',
            confirmationState: confirmationResult.phase,
            ...(confirmationResult.phase === 'confirmed' ? { confirmedAt: nowIso } : {}),
            txHash,
            nftId,
            trackId,
            collectionAddress: selectedContractAddress,
            network: selectedNetwork,
            ipfsMetadataUrl: metadataAsset.gatewayUrl,
            amount: mintPrice,
            currency: 'TON',
            createdAt: nowIso,
          });
        } catch (txErr) {
          handleFirestoreError(txErr, OperationType.CREATE, `transactions/${txDocId}`);
        }

        // If minted into one of the artist's saved Firestore collections, append NFT ID
        const matchedCollection = artistCollections.find(
          (c) => c.contractAddress === selectedContractAddress
        );
        if (matchedCollection) {
          try {
            await updateDoc(doc(db, 'collections', matchedCollection.id), {
              nftIds: arrayUnion(nftId),
              updatedAt: nowIso,
            });
          } catch (colErr) {
            handleFirestoreError(
              colErr,
              OperationType.UPDATE,
              `collections/${matchedCollection.id}`
            );
          }
        }

        await createActivityPost(
          uid,
          artistName.trim(),
          userProfile?.avatar || '',
          `minted "${safeTitle}" on TON via Artist Studio`,
          'nft_mint',
          {
            targetId: nftId,
            artistName: artistName.trim(),
            trackTitle: safeTitle,
            paymentAmount: mintPrice,
            paymentCurrency: 'TON',
          }
        ).catch(() => {});
      }

      setMintedNFT(newNFT);
      setStageStatus('db_sync', 'done', 100, 'Synced on-chain & TonJam catalog', 100);
      setTelemetry((prev) => ({
        ...prev,
        tonConfirmStatus: confirmationResult.phase === 'confirmed' ? 'done' : 'submitted',
        tonConfirmProgress: 100,
        liveStatusMessage:
          confirmationResult.phase === 'confirmed'
            ? `"${safeTitle}" confirmed on TON & synced to TonJam.`
            : `"${safeTitle}" broadcast to TON & synced to TonJam.`,
      }));
      confetti({ particleCount: 110, spread: 75, origin: { y: 0.65 } });
      toast.success(`"${safeTitle}" minted on TON!`, { id: toastId });
    } catch (err: any) {
      const message = err?.message || 'Minting pipeline failed';
      setPipelineError(message);
      setStages((prev) =>
        prev.map((s) => (s.status === 'active' ? { ...s, status: 'error', detail: message } : s))
      );
      setTelemetry((prev) => ({
        ...prev,
        ipfsUploadStatus: prev.ipfsUploadStatus === 'active' ? 'error' : prev.ipfsUploadStatus,
        metadataPinStatus: prev.metadataPinStatus === 'active' ? 'error' : prev.metadataPinStatus,
        tonConfirmStatus: prev.tonConfirmStatus === 'active' ? 'error' : prev.tonConfirmStatus,
        liveStatusMessage: message,
      }));
      toast.error(message, { id: toastId });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleResetRelease = () => {
    confirmAbortRef.current?.abort();
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentTime(0);
    }
    setAudioFile(null);
    setAudioPreviewUrl('');
    setAudioDuration(0);
    setCoverFile(null);
    setCoverPreviewUrl('');
    setPinnedAudio(null);
    setPinnedCover(null);
    setPinnedMetadata(null);
    setTitle('');
    setAlbumName('');
    setDescription('');
    setLyrics('');
    setStages(INITIAL_STAGES);
    setTelemetry(INITIAL_TELEMETRY);
    setPipelineProgress(0);
    setPipelineError(null);
    setMintTxHash('');
    setMintedNFT(null);
  };

  const copyQuick = (id: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedId(id);
    toast.success('Copied');
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleSaveProfileBanner = async (
    croppedFile: File,
    onProgress?: (pct: number, stageLabel?: string) => void
  ): Promise<BannerSaveResult> => {
    const uid = user?.uid || auth.currentUser?.uid || userProfile?.uid;
    if (!uid) {
      throw new Error('Please sign in with your artist account before saving a profile banner.');
    }

    onProgress?.(20, 'Uploading cropped banner to Pinata IPFS...');
    const bannerUrl = await uploadToPinata(croppedFile, (pct) => {
      const scaled = Math.min(86, 20 + Math.round(pct * 0.66));
      onProgress?.(scaled, `Uploading banner to Pinata IPFS (${pct}%)...`);
    });

    const record = toPinataAssetRecord(
      bannerUrl,
      croppedFile.name,
      croppedFile.size
    );

    onProgress?.(92, 'Updating artist profile in Firestore...');
    const nowIso = new Date().toISOString();

    try {
      await updateDoc(doc(db, 'users', uid), {
        bannerUrl,
        bannerImageUrl: bannerUrl,
        coverPhoto: bannerUrl,
        bannerIpfsCid: record.cid,
        updatedAt: nowIso,
      });
    } catch (userErr) {
      handleFirestoreError(userErr, OperationType.UPDATE, `users/${uid}`);
    }

    if (userProfile?.isVerifiedArtist) {
      try {
        await setDoc(
          doc(db, 'artists', uid),
          {
            uid,
            name: artistName.trim() || userProfile?.name || 'TonJam Artist',
            avatarUrl: userProfile?.avatar || '',
            bannerUrl,
            bannerImageUrl: bannerUrl,
            bannerIpfsCid: record.cid,
            updatedAt: nowIso,
          },
          { merge: true }
        );
      } catch (artistErr) {
        handleFirestoreError(artistErr, OperationType.WRITE, `artists/${uid}`);
      }
    }

    setArtistBannerUrl(bannerUrl);
    setUserProfile?.((prev) => ({
      ...prev,
      bannerUrl,
      coverPhoto: bannerUrl,
    }));
    await refreshProfile?.();

    onProgress?.(100, 'Artist profile banner saved');
    return { record, bannerUrl };
  };

  const canAttemptMint = Boolean(
    (audioFile || pinnedAudio) &&
      (coverFile || pinnedCover) &&
      title.trim() &&
      artistName.trim() &&
      validateTonAddress(selectedContractAddress, selectedNetwork)
  );

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 pb-28 selection:bg-[#0088CC]/30">
      {/* Studio Top Bar */}
      <div className="bg-transparent backdrop-blur-none border-none shadow-none sticky top-0 z-30 px-3 py-4">
        <div className="w-full max-w-full flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-transparent hover:bg-white/[0.08] flex items-center justify-center text-[#FFFFFF] transition-colors cursor-pointer border-0 outline-none"
              aria-label="Go back"
            >
              <TonJamBackArrow size="sm" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                  Artist Studio
                </h1>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-[#0088CC]/20 text-[#38BDF8]">
                  Pinata IPFS + TON Minting
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pin lossless masters to Pinata IPFS and mint NFTs into configured TON contracts.
              </p>
            </div>
          </div>

          {/* Infrastructure Status Strip */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Pinata Status Chip */}
            <button
              type="button"
              onClick={() => refreshPinataStatus(true)}
              disabled={checkingPinata}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border-0 outline-none ${
                pinataStatus?.configured
                  ? 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20'
                  : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/20'
              }`}
              title="Click to verify live Pinata API credentials"
            >
              {checkingPinata ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Database className="w-3.5 h-3.5" />
              )}
              <span>
                {checkingPinata
                  ? 'Checking Pinata...'
                  : pinataStatus?.configured
                  ? `Pinata Ready (${pinataStatus.authMode.toUpperCase()})`
                  : 'Pinata Unconfigured'}
              </span>
              <RefreshCw className="w-3 h-3 opacity-70" />
            </button>

            {/* TON Network Switcher */}
            <div className="bg-[#151D2C] p-1 rounded-xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleNetworkSwitch('mainnet')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border-0 outline-none ${
                  selectedNetwork === 'mainnet'
                    ? 'bg-[#0088CC] text-white'
                    : 'bg-transparent text-slate-400 hover:text-white'
                }`}
              >
                Mainnet
              </button>
              <button
                type="button"
                onClick={() => handleNetworkSwitch('testnet')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border-0 outline-none ${
                  selectedNetwork === 'testnet'
                    ? 'bg-[#0088CC] text-white'
                    : 'bg-transparent text-slate-400 hover:text-white'
                }`}
              >
                Testnet
              </button>
            </div>

            {/* TON Wallet Chip */}
            {activeWallet ? (
              <button
                type="button"
                onClick={() => copyQuick('wallet', activeWallet)}
                className="px-3.5 py-2 rounded-xl bg-[#151D2C] hover:bg-[#1C273B] text-xs font-mono tabular-nums text-slate-200 flex items-center gap-2 transition-colors cursor-pointer border-0 outline-none"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{shortAddress(activeWallet, 4, 4)}</span>
                {walletBalanceTon !== null && (
                  <span className="text-[#38BDF8] font-bold">
                    {walletBalanceTon.toFixed(2)} TON
                  </span>
                )}
                {copiedId === 'wallet' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400" />
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => tonConnectUI.openModal()}
                className="px-4 py-2 rounded-xl bg-[#0088CC] hover:bg-[#0077B3] text-xs font-bold text-white flex items-center gap-2 transition-colors cursor-pointer border-0 outline-none"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>

        {/* Studio Workspace Switcher */}
        <div className="w-full max-w-full mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStudioTab('workbench')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border-0 outline-none ${
              studioTab === 'workbench'
                ? 'bg-[#1D273B] text-white'
                : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Release & Mint Workbench
          </button>
          <button
            type="button"
            onClick={() => setStudioTab('releases')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer border-0 outline-none ${
              studioTab === 'releases'
                ? 'bg-[#1D273B] text-white'
                : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <span>My Studio Releases & Contracts</span>
            <span className="px-2 py-0.5 rounded-md bg-[#0088CC]/20 text-[#38BDF8] font-mono tabular-nums text-[11px]">
              {artistNFTs.length + artistTracks.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-full px-2 pt-6 space-y-6">
        {/* Artist Profile Banner Identity Bar */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingBannerZone(true);
          }}
          onDragLeave={() => setIsDraggingBannerZone(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingBannerZone(false);
            const f = e.dataTransfer.files?.[0];
            if (f) {
              setDroppedBannerFile(f);
              setIsBannerEditorOpen(true);
            }
          }}
          data-testid="artist-banner-showcase"
          className={`relative rounded-2xl overflow-hidden transition-colors ${
            isDraggingBannerZone ? 'bg-[#0088CC]/25' : 'bg-[#121824]'
          } shadow-xl shadow-black/25`}
        >
          {artistBannerUrl ? (
            <img
              src={artistBannerUrl}
              alt={`${artistName} profile banner`}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F1B2E] via-[#13253E] to-[#111827]" />
          )}

          <div className="relative z-10 bg-gradient-to-r from-[#0B0F17]/92 via-[#0B0F17]/75 to-[#0B0F17]/45 px-5 py-4 sm:px-6 sm:py-5 flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <span className="font-bold text-white truncate max-w-[240px]">
                  {artistName.trim() || 'TonJam Artist'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-300">
                  {artistBannerUrl ? 'Custom Pinata IPFS Banner Active' : 'No Custom Profile Banner Set'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Upload and crop a wide banner image (3:1, 16:5, or 16:9) stored on Pinata IPFS and synced to your artist profile.
              </p>
            </div>

            <button
              type="button"
              data-testid="open-banner-cropper-btn"
              onClick={() => setIsBannerEditorOpen((prev) => !prev)}
              className="px-4 py-2 rounded-xl bg-[#0088CC] hover:bg-[#0077B3] text-xs font-bold text-white flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-0 outline-none shadow-lg shadow-[#0088CC]/25"
            >
              <Crop className="w-3.5 h-3.5" />
              <span>
                {isBannerEditorOpen
                  ? 'Hide Banner Studio'
                  : artistBannerUrl
                  ? 'Edit Profile Banner'
                  : 'Upload & Crop Banner'}
              </span>
            </button>
          </div>
        </div>

        {/* Interactive Banner Upload & Cropping Tool */}
        <ProfileBannerCropper
          currentBannerUrl={artistBannerUrl}
          artistName={artistName.trim() || 'TonJam Artist'}
          isOpen={isBannerEditorOpen}
          onClose={() => setIsBannerEditorOpen(false)}
          onSaveCroppedBanner={handleSaveProfileBanner}
          droppedFile={droppedBannerFile}
          onConsumeDroppedFile={() => setDroppedBannerFile(null)}
        />

        {studioTab === 'workbench' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Asset Uploaders, Collection Contract, Track Metadata & Economics */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Music & Artwork Upload Card */}
              <div className="bg-[#121824] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl shadow-black/25">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-tight">
                      1. Music Master & Cover Artwork
                    </h2>
                    <p className="text-xs text-slate-400">
                      Files are pinned directly to Pinata IPFS via secure server upload (max 50 MB audio).
                    </p>
                  </div>
                  {pinnedAudio && (
                    <span className="text-[11px] font-mono text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-lg">
                      Audio Pinned
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  {/* Audio Dropzone */}
                  <div className="sm:col-span-7 space-y-3">
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept=".mp3,.wav,.flac,.ogg,.aac,.m4a,audio/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleSelectAudio(f);
                      }}
                    />
                    <div
                      onClick={() => audioInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingAudio(true);
                      }}
                      onDragLeave={() => setIsDraggingAudio(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingAudio(false);
                        const f = e.dataTransfer.files?.[0];
                        if (f) handleSelectAudio(f);
                      }}
                      className={`p-5 rounded-2xl cursor-pointer transition-all min-h-[168px] flex flex-col justify-between ${
                        isDraggingAudio
                          ? 'bg-[#0088CC]/20 scale-[0.99]'
                          : 'bg-[#182032] hover:bg-[#1D273D]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0088CC]/15 flex items-center justify-center text-[#38BDF8]">
                          <FileAudio className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-mono tabular-nums text-slate-400">
                          {audioFile ? formatBytes(audioFile.size) : 'MP3 · WAV · FLAC'}
                        </span>
                      </div>

                      <div className="space-y-1 pt-3">
                        <p className="text-xs font-bold text-white truncate">
                          {audioFile ? audioFile.name : 'Drop audio master or browse'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {audioDuration > 0
                            ? `Detected duration: ${formatAudioTime(audioDuration)}`
                            : 'Supports lossless WAV/FLAC & MP3 up to 50 MB'}
                        </p>
                      </div>
                    </div>

                    {/* Inline Studio Audio Scrubber & Pre-Pin */}
                    {audioPreviewUrl && (
                      <div className="p-3.5 rounded-xl bg-[#0D131F] space-y-2.5">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={toggleStudioAudio}
                            className="w-9 h-9 rounded-xl bg-[#0088CC] hover:bg-[#0077B3] text-white flex items-center justify-center shrink-0 cursor-pointer border-0 outline-none"
                            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
                          >
                            {isPlaying ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4 ml-0.5" />
                            )}
                          </button>

                          <div className="flex-1 space-y-1">
                            <input
                              type="range"
                              min={0}
                              max={audioDuration || 180}
                              value={Math.min(currentTime, audioDuration || 180)}
                              onChange={handleSeekAudio}
                              className="w-full accent-[#38BDF8] cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] font-mono tabular-nums text-slate-400">
                              <span>{formatAudioTime(currentTime)}</span>
                              <span>{formatAudioTime(audioDuration)}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={pinningAssetType !== null || Boolean(pinnedAudio)}
                            onClick={() => handlePinSingleAsset('audio')}
                            className="px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-50 text-[11px] font-semibold text-slate-200 shrink-0 cursor-pointer border-0 outline-none"
                          >
                            {pinningAssetType === 'audio'
                              ? `${singlePinProgress}%`
                              : pinnedAudio
                              ? 'Pinned'
                              : 'Pin Audio'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cover Artwork Dropzone */}
                  <div className="sm:col-span-5 space-y-3">
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.gif,image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleSelectCover(f);
                      }}
                    />
                    <div
                      onClick={() => coverInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingCover(true);
                      }}
                      onDragLeave={() => setIsDraggingCover(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingCover(false);
                        const f = e.dataTransfer.files?.[0];
                        if (f) handleSelectCover(f);
                      }}
                      className={`relative rounded-2xl overflow-hidden cursor-pointer min-h-[168px] flex flex-col justify-end p-4 transition-all ${
                        isDraggingCover
                          ? 'bg-[#0088CC]/20 scale-[0.99]'
                          : 'bg-[#182032] hover:bg-[#1D273D]'
                      }`}
                    >
                      {coverPreviewUrl ? (
                        <>
                          <img
                            src={coverPreviewUrl}
                            alt="Cover preview"
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="relative z-10 flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold text-white truncate">
                              {coverFile?.name || 'Cover loaded'}
                            </span>
                            <span className="text-[10px] font-mono bg-black/60 px-2 py-0.5 rounded text-slate-200">
                              Change
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center py-4 space-y-2">
                          <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-slate-300">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">Drop Cover Artwork</p>
                            <p className="text-[11px] text-slate-400">JPG, PNG, WEBP up to 10 MB</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isGeneratingCover}
                        onClick={handleGenerateStudioCover}
                        className="flex-1 py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-semibold text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer border-0 outline-none"
                      >
                        <Wand2 className="w-3.5 h-3.5 text-[#38BDF8]" />
                        <span>{isGeneratingCover ? 'Rendering...' : 'Generate Cover'}</span>
                      </button>

                      {coverFile && (
                        <button
                          type="button"
                          disabled={pinningAssetType !== null || Boolean(pinnedCover)}
                          onClick={() => handlePinSingleAsset('cover')}
                          className="py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-50 text-[11px] font-semibold text-slate-200 cursor-pointer border-0 outline-none"
                        >
                          {pinningAssetType === 'cover'
                            ? `${singlePinProgress}%`
                            : pinnedCover
                            ? 'Pinned'
                            : 'Pin Art'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Target TON Collection Contract Selector */}
              <CollectionContractPanel
                network={selectedNetwork}
                selectedAddress={selectedContractAddress}
                onSelectAddress={setSelectedContractAddress}
                artistCollections={artistCollections}
                onCollectionDeployed={(col) =>
                  setArtistCollections((prev) =>
                    prev.some((c) => c.contractAddress === col.contractAddress)
                      ? prev
                      : [col, ...prev]
                  )
                }
                tonConnectUI={tonConnectUI}
                walletAddress={activeWallet}
                userUid={userProfile?.uid || user?.uid}
                artistName={artistName}
              />

              {/* 3. Release Details & TEP-64 Metadata */}
              <div className="bg-[#121824] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl shadow-black/25">
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    3. Release Details & Audio Specs
                  </h2>
                  <p className="text-xs text-slate-400">
                    Compiled into TEP-64 compliant JSON metadata stored permanently on Pinata IPFS.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-slate-400">
                      Track Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Midnight Signal (Master)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#182032] text-xs text-white placeholder:text-slate-500 border-0 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-slate-400">
                      Artist Display Name
                    </label>
                    <input
                      type="text"
                      value={artistName}
                      onChange={(e) => setArtistName(e.target.value)}
                      placeholder="Artist name"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#182032] text-xs text-white placeholder:text-slate-500 border-0 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-slate-400">
                      Album / Release EP (Optional)
                    </label>
                    <input
                      type="text"
                      value={albumName}
                      onChange={(e) => setAlbumName(e.target.value)}
                      placeholder="Single"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#182032] text-xs text-white placeholder:text-slate-500 border-0 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-slate-400">Genre</label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#182032] text-xs text-white border-0 outline-none"
                    >
                      {GENRES.map((g) => (
                        <option key={g} value={g} className="bg-[#121824] text-white">
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold text-slate-400">BPM</label>
                      <input
                        type="number"
                        min="40"
                        max="240"
                        value={bpm}
                        onChange={(e) => setBpm(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#182032] text-xs font-mono tabular-nums text-white border-0 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold text-slate-400">Key</label>
                      <input
                        type="text"
                        value={keySignature}
                        onChange={(e) => setKeySignature(e.target.value)}
                        placeholder="A minor"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#182032] text-xs text-white border-0 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-slate-400">
                      Master Audio Quality
                    </label>
                    <input
                      type="text"
                      value={audioQuality}
                      onChange={(e) => setAudioQuality(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#182032] text-xs text-white border-0 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-400">
                    Liner Notes & Story
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the recording equipment, inspiration, and collector utility..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#182032] text-xs text-white placeholder:text-slate-500 border-0 outline-none resize-none"
                  />
                </div>

                {/* Custom TEP-64 Attributes */}
                <div className="space-y-2.5 pt-1">
                  <label className="block text-[11px] font-semibold text-slate-400">
                    On-Chain Traits
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {customTraits.map((trait, idx) => (
                      <div
                        key={`${trait.trait_type}-${idx}`}
                        className="px-3 py-1.5 rounded-lg bg-[#182032] flex items-center gap-2 text-xs"
                      >
                        <span className="text-slate-400">{trait.trait_type}:</span>
                        <span className="text-white font-semibold">{trait.value}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setCustomTraits(customTraits.filter((_, i) => i !== idx))
                          }
                          className="text-slate-500 hover:text-rose-400 cursor-pointer border-0 bg-transparent outline-none"
                          aria-label="Remove trait"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <input
                      type="text"
                      value={newTraitType}
                      onChange={(e) => setNewTraitType(e.target.value)}
                      placeholder="Trait name (e.g. Synth)"
                      className="sm:col-span-5 px-3 py-2 rounded-xl bg-[#182032] text-xs text-white placeholder:text-slate-500 border-0 outline-none"
                    />
                    <input
                      type="text"
                      value={newTraitValue}
                      onChange={(e) => setNewTraitValue(e.target.value)}
                      placeholder="Value (e.g. Prophet-6)"
                      className="sm:col-span-5 px-3 py-2 rounded-xl bg-[#182032] text-xs text-white placeholder:text-slate-500 border-0 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddTrait}
                      className="sm:col-span-2 py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-white cursor-pointer border-0 outline-none"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Editions, Pricing & Collaborator Splits */}
              <div className="bg-[#121824] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl shadow-black/25">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-tight">
                      4. Editions, Pricing & Royalty Splits
                    </h2>
                    <p className="text-xs text-slate-400">
                      Configure mint supply, listing format, and collaborator payout shares.
                    </p>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold tabular-nums px-2.5 py-1 rounded-lg ${
                      totalSplitPercentage === 100
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-rose-500/15 text-rose-300'
                    }`}
                  >
                    Splits: {totalSplitPercentage}%
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-slate-400">
                      Mint Price (TON)
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={mintPrice}
                      onChange={(e) => setMintPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#182032] text-xs font-mono tabular-nums text-white border-0 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-slate-400">
                      Supply Editions
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      value={editions}
                      onChange={(e) => setEditions(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#182032] text-xs font-mono tabular-nums text-white border-0 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-slate-400">
                      Sale Mode
                    </label>
                    <select
                      value={listingType}
                      onChange={(e) => setListingType(e.target.value as 'fixed' | 'auction')}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#182032] text-xs text-white border-0 outline-none"
                    >
                      <option value="fixed" className="bg-[#121824]">
                        Fixed Price
                      </option>
                      <option value="auction" className="bg-[#121824]">
                        Timed Auction
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-slate-400">
                      Secondary Royalty %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      step="0.5"
                      value={secondaryRoyaltyPct}
                      onChange={(e) => setSecondaryRoyaltyPct(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#182032] text-xs font-mono tabular-nums text-white border-0 outline-none"
                    />
                  </div>
                </div>

                {/* Collaborator Payout Splits */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span>Primary Mint Revenue Splits</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSplitEvenly}
                        className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-semibold text-slate-300 cursor-pointer border-0 outline-none"
                      >
                        Split Evenly
                      </button>
                      <button
                        type="button"
                        onClick={handleAddSplit}
                        className="px-2.5 py-1 rounded-lg bg-[#0088CC]/20 hover:bg-[#0088CC]/30 text-[11px] font-semibold text-[#38BDF8] flex items-center gap-1 cursor-pointer border-0 outline-none"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Split</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {royaltySplits.map((split, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                        <input
                          type="text"
                          value={split.label}
                          onChange={(e) => {
                            const next = [...royaltySplits];
                            next[idx] = { ...next[idx], label: e.target.value };
                            setRoyaltySplits(next);
                          }}
                          placeholder="Role"
                          className="col-span-3 px-3 py-2 rounded-xl bg-[#182032] text-xs text-white border-0 outline-none"
                        />
                        <input
                          type="text"
                          value={split.address}
                          onChange={(e) => {
                            const next = [...royaltySplits];
                            next[idx] = { ...next[idx], address: e.target.value };
                            setRoyaltySplits(next);
                          }}
                          placeholder="TON wallet address (EQ / UQ)"
                          className="col-span-6 px-3 py-2 rounded-xl bg-[#182032] text-xs font-mono text-white placeholder:text-slate-500 border-0 outline-none"
                        />
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={split.percentage}
                          onChange={(e) => {
                            const next = [...royaltySplits];
                            next[idx] = {
                              ...next[idx],
                              percentage: Number(e.target.value) || 0,
                            };
                            setRoyaltySplits(next);
                          }}
                          className="col-span-2 px-2.5 py-2 rounded-xl bg-[#182032] text-xs font-mono tabular-nums text-white text-right border-0 outline-none"
                        />
                        <button
                          type="button"
                          disabled={royaltySplits.length <= 1}
                          onClick={() =>
                            setRoyaltySplits(royaltySplits.filter((_, i) => i !== idx))
                          }
                          className="col-span-1 flex items-center justify-center p-2 text-slate-400 hover:text-rose-400 disabled:opacity-30 cursor-pointer border-0 bg-transparent outline-none"
                          aria-label="Remove split"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Holder Exclusive Perks Toggle */}
                <div className="p-3.5 rounded-xl bg-[#0D131F] space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-white">Include NFT Holder Perks</p>
                      <p className="text-[11px] text-slate-400">
                        Unlock bonus stems, high-res downloads, or private session access for collectors.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHasExclusivePerks((p) => !p)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border-0 outline-none ${
                        hasExclusivePerks
                          ? 'bg-[#0088CC] text-white'
                          : 'bg-white/[0.06] text-slate-300'
                      }`}
                    >
                      {hasExclusivePerks ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  {hasExclusivePerks && (
                    <input
                      type="text"
                      value={exclusivePerksText}
                      onChange={(e) => setExclusivePerksText(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#182032] text-xs text-white border-0 outline-none"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Live Release Preview + TEP-64 JSON Inspector + Execution Pipeline */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-32">
              {/* Live NFT & Audio Card Preview */}
              <div className="bg-[#121824] rounded-2xl p-5 space-y-4 shadow-xl shadow-black/25">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Live Release Preview</span>
                  <div className="bg-[#182032] p-1 rounded-xl flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewTab('card')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer border-0 outline-none ${
                        previewTab === 'card'
                          ? 'bg-[#0088CC] text-white'
                          : 'bg-transparent text-slate-400'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('json')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer border-0 outline-none ${
                        previewTab === 'json'
                          ? 'bg-[#0088CC] text-white'
                          : 'bg-transparent text-slate-400'
                      }`}
                    >
                      <Code className="w-3 h-3" />
                      <span>TEP-64 JSON</span>
                    </button>
                  </div>
                </div>

                {previewTab === 'card' ? (
                  <div className="space-y-4">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[#132238] via-[#0F172A] to-[#080C15] flex items-center justify-center">
                      {coverPreviewUrl ? (
                        <img
                          src={coverPreviewUrl}
                          alt={title || 'Release artwork'}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                          <Disc className="w-16 h-16 text-[#38BDF8]/60" />
                          <p className="text-xs font-medium text-slate-400">
                            Upload cover artwork or generate a studio visual
                          </p>
                        </div>
                      )}

                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg bg-black/65 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white">
                          {rarityTier}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-black/65 backdrop-blur-md text-[10px] font-mono tabular-nums text-[#38BDF8]">
                          1/{editions || '1'}
                        </span>
                      </div>

                      {audioPreviewUrl && (
                        <button
                          type="button"
                          onClick={toggleStudioAudio}
                          className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-[#0088CC] hover:bg-[#0077B3] text-white flex items-center justify-center shadow-lg cursor-pointer border-0 outline-none"
                          aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
                        >
                          {isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4 ml-0.5" />
                          )}
                        </button>
                      )}
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-white truncate">
                          {title.trim() || 'Untitled Master Release'}
                        </h3>
                        <p className="text-xs text-slate-400 truncate">
                          {artistName.trim() || 'Artist'} · {genre}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">
                          {listingType === 'auction' ? 'Starting Bid' : 'Mint Price'}
                        </p>
                        <p className="text-sm font-mono font-bold tabular-nums text-[#38BDF8]">
                          {mintPrice || '0'} TON
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <pre className="p-4 rounded-xl bg-[#0B0F17] text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-[340px] leading-relaxed">
                    {JSON.stringify(tep64Payload, null, 2)}
                  </pre>
                )}
              </div>

              {/* Pinata IPFS + TON Smart Contract Pipeline */}
              <PinataMintPipeline
                stages={stages}
                progress={pipelineProgress}
                telemetry={telemetry}
                isExecuting={isExecuting}
                errorMessage={pipelineError}
                pinataConfigured={pinataStatus ? pinataStatus.configured : null}
                pinnedAudio={pinnedAudio}
                pinnedCover={pinnedCover}
                pinnedMetadata={pinnedMetadata}
                mintTxHash={mintTxHash}
                mintedNFT={mintedNFT}
                targetContractAddress={selectedContractAddress}
                network={selectedNetwork}
                walletAddress={activeWallet}
                canMint={canAttemptMint}
                onExecuteMint={handleExecuteFullMint}
                onPublishTrackOnly={handlePublishTrackOnly}
                onConnectWallet={() => tonConnectUI.openModal()}
                onViewNFT={(id) => navigate(`/nft/${id}`)}
                onResetForm={handleResetRelease}
              />
            </div>
          </div>
        ) : (
          /* RELEASES & DEPLOYED CONTRACTS TAB */
          <div className="space-y-6">
            {/* Custom Collection Contracts Section */}
            <div className="bg-[#121824] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl shadow-black/25">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-white">
                    Configured & Deployed TON Collection Contracts
                  </h2>
                  <p className="text-xs text-slate-400">
                    Active protocol contracts alongside your custom Tact NFT collection deployments.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStudioTab('workbench')}
                  className="px-3.5 py-2 rounded-xl bg-[#0088CC] hover:bg-[#0077B3] text-xs font-bold text-white cursor-pointer border-0 outline-none"
                >
                  New Studio Drop
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  {
                    id: 'env-mainnet',
                    name: 'Protocol Mainnet Collection Contract',
                    contractAddress: TON_MAINNET_CONFIG.collectionAddress,
                    network: 'mainnet' as TonNetwork,
                  },
                  {
                    id: 'env-testnet',
                    name: 'Protocol Testnet Collection Contract',
                    contractAddress: TON_TESTNET_CONFIG.collectionAddress,
                    network: 'testnet' as TonNetwork,
                  },
                  ...artistCollections,
                ].map((col) => (
                  <div
                    key={col.id}
                    className="p-4 rounded-xl bg-[#182032] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#38BDF8] shrink-0" />
                        <p className="text-xs font-bold text-white truncate">{col.name}</p>
                      </div>
                      <p className="text-[11px] font-mono tabular-nums text-slate-400 truncate mt-1">
                        {col.contractAddress}
                      </p>
                    </div>
                    <a
                      href={getTonViewerUrl(
                        col.contractAddress,
                        false,
                        col.network === 'testnet' ? 'testnet' : 'mainnet'
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 shrink-0"
                      title="Open on TonViewer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Minted NFTs & Tracks Catalog */}
            <div className="bg-[#121824] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl shadow-black/25">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">Your Minted Studio Drops</h2>
                <span className="text-xs font-mono tabular-nums text-slate-400">
                  {artistNFTs.length} NFTs · {artistTracks.length} Tracks
                </span>
              </div>

              {loadingReleases ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin text-[#38BDF8]" />
                  <span>Loading your studio catalog from Firestore...</span>
                </div>
              ) : artistNFTs.length === 0 && artistTracks.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#182032] flex items-center justify-center text-[#38BDF8]">
                    <Music className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <p className="text-sm font-bold text-white">No Studio Releases Yet</p>
                    <p className="text-xs text-slate-400">
                      Upload an audio master in the Workbench to pin it on Pinata IPFS and mint your first Music NFT on TON.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStudioTab('workbench')}
                    className="px-4 py-2.5 rounded-xl bg-[#0088CC] hover:bg-[#0077B3] text-xs font-bold text-white cursor-pointer border-0 outline-none"
                  >
                    Open Release Workbench
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {artistNFTs.map((nft) => (
                    <div
                      key={nft.id}
                      className="p-4 rounded-2xl bg-[#182032] flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={nft.imageUrl || nft.coverUrl}
                          alt={nft.title}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-xl object-cover bg-[#0D131F] shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">{nft.title}</p>
                          <p className="text-[11px] font-mono tabular-nums text-[#38BDF8]">
                            {nft.price} TON · {nft.edition}
                          </p>
                          {nft.contractAddress && (
                            <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                              {shortAddress(nft.contractAddress, 6, 4)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {nft.audioUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              const matchedTrack = artistTracks.find((t) => t.id === nft.trackId);
                              if (matchedTrack) {
                                playTrack(matchedTrack);
                              } else {
                                playTrack({
                                  id: nft.trackId || nft.id,
                                  songId: nft.trackId || nft.id,
                                  title: nft.title,
                                  artist: nft.artist || nft.creator,
                                  artistId: nft.artistId || nft.creatorId || '',
                                  coverUrl: nft.imageUrl,
                                  audioUrl: nft.audioUrl || '',
                                  duration: 180,
                                  genre: 'Music NFT',
                                  isNFT: true,
                                  createdAt: nft.createdAt || new Date().toISOString(),
                                });
                              }
                            }}
                            className="flex-1 py-2 px-3 rounded-xl bg-[#0088CC]/20 hover:bg-[#0088CC]/30 text-[11px] font-bold text-[#38BDF8] flex items-center justify-center gap-1.5 cursor-pointer border-0 outline-none"
                          >
                            <Play className="w-3 h-3" />
                            <span>Play</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => navigate(`/nft/${nft.id}`)}
                          className="flex-1 py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-[11px] font-bold text-white cursor-pointer border-0 outline-none"
                        >
                          View NFT
                        </button>
                        {nft.ipfsUrl && (
                          <a
                            href={nft.ipfsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300"
                            title="Inspect Pinata IPFS JSON"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistStudio;
