import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Disc,
  Music,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  Wallet,
  RefreshCw,
  ExternalLink,
  Plus,
  Trash2,
  Play,
  Pause,
  X,
  Database,
  FileJson,
  Layers,
  Wand2,
  Copy,
  Check,
} from 'lucide-react';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useNFT } from '@/contexts/NFTContext';
import { useAudio } from '@/contexts/AudioContext';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import {
  getPinataStatus,
  uploadToPinata,
  uploadJSONToPinata,
  PinataStatus,
} from '@/services/storageService';
import {
  mintTonJamNFT,
  getEstimatedGasFee,
  getTonViewerUrl,
  TON_NETWORK_MODE,
} from '@/services/tonService';
import { createActivityPost } from '@/services/socialService';
import { compressImageForNFT, validateFile, getPlaceholderImage } from '@/lib/utils';
import {
  PinnedAssetRecord,
  toPinataAssetRecord,
  extractCidFromUrl,
  formatBytes,
  shortAddress,
  generateStudioCoverFile,
} from '@/components/studio/StudioCoverGenerator';
import { Track, NFTItem, RoyaltySplitExtended } from '@/types';
import { toast } from 'sonner';

export interface MintTrackNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTrack?: Track | null;
  artistTracks?: Track[];
  onSuccess?: (nft: NFTItem) => void;
}

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

const RARITIES = ['Common', 'Rare', 'Epic', 'Legendary'] as const;

const isPinataOrIpfsUrl = (url?: string): boolean => {
  if (!url) return false;
  return url.includes('/ipfs/') || url.startsWith('ipfs://');
};

export const MintTrackNFTModal: React.FC<MintTrackNFTModalProps> = ({
  isOpen,
  onClose,
  preselectedTrack = null,
  artistTracks,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [tonConnectUI] = useTonConnectUI();
  const connectedTonAddress = useTonAddress();
  const { user } = useAuth();
  const {
    isMinting,
    setIsMinting,
    mintingStatus,
    updateMintingStatus,
    removeMintingStatus,
    addNFT,
    getNFTByTrackId,
  } = useNFT();
  const {
    allTracks,
    userProfile,
    addUserTrack,
    addUserNFT,
    addNotification,
  } = useAudio();

  const currentUid = auth.currentUser?.uid || user?.uid || userProfile?.uid || '';
  const artistDisplayName = userProfile?.name || userProfile?.username || 'TonJam Artist';
  const resolvedWalletAddress =
    connectedTonAddress ||
    tonConnectUI?.wallet?.account?.address ||
    userProfile?.walletAddress ||
    '';

  const catalogTracks = useMemo(() => {
    const sourceList = artistTracks && artistTracks.length > 0 ? artistTracks : allTracks;
    const filtered = currentUid
      ? sourceList.filter((t) => t.artistId === currentUid)
      : sourceList;

    const list = filtered.length > 0 ? [...filtered] : [];
    if (preselectedTrack && !list.some((t) => t.id === preselectedTrack.id)) {
      list.unshift(preselectedTrack);
    }
    return list;
  }, [artistTracks, allTracks, currentUid, preselectedTrack]);

  // Source mode & selected track
  const [sourceMode, setSourceMode] = useState<'catalog' | 'upload'>('catalog');
  const [selectedTrackId, setSelectedTrackId] = useState<string>('');

  // Form state
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Electronic');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('2.5');
  const [editions, setEditions] = useState('25');
  const [rarity, setRarity] = useState<(typeof RARITIES)[number]>('Rare');
  const [listingType, setListingType] = useState<'fixed' | 'auction'>('fixed');
  const [auctionDuration, setAuctionDuration] = useState('3');
  const [royaltySplits, setRoyaltySplits] = useState<RoyaltySplitExtended[]>([
    {
      address: resolvedWalletAddress,
      percentage: 100,
      label: 'Main Artist',
    },
  ]);

  // Media files & previews
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState('');
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  // Pinata configuration & pinning state
  const [pinataStatus, setPinataStatus] = useState<PinataStatus | null>(null);
  const [pinataChecking, setPinataChecking] = useState(false);
  const [pinataCheckError, setPinataCheckError] = useState<string | null>(null);
  const [pinnedAudio, setPinnedAudio] = useState<PinnedAssetRecord | null>(null);
  const [pinnedCover, setPinnedCover] = useState<PinnedAssetRecord | null>(null);
  const [pinnedMetadata, setPinnedMetadata] = useState<PinnedAssetRecord | null>(null);
  const [audioUploadPct, setAudioUploadPct] = useState(0);
  const [coverUploadPct, setCoverUploadPct] = useState(0);
  const [isPinningAssets, setIsPinningAssets] = useState(false);

  // Minting & outcome state
  const [estimatedGasTon, setEstimatedGasTon] = useState<number>(0.1);
  const [formError, setFormError] = useState<string | null>(null);
  const [mintedNFT, setMintedNFT] = useState<NFTItem | null>(null);
  const [mintTxHash, setMintTxHash] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activePipelineId, setActivePipelineId] = useState<string>('');

  const selectedTrack = useMemo(
    () => catalogTracks.find((t) => t.id === selectedTrackId) || preselectedTrack || null,
    [catalogTracks, selectedTrackId, preselectedTrack]
  );

  const existingMintedNft = useMemo(() => {
    if (sourceMode !== 'catalog' || !selectedTrack) return undefined;
    return getNFTByTrackId(selectedTrack.id);
  }, [sourceMode, selectedTrack, getNFTByTrackId]);

  const activeMintStatus = activePipelineId ? mintingStatus[activePipelineId] : undefined;

  const checkPinataConfig = async () => {
    setPinataChecking(true);
    setPinataCheckError(null);
    try {
      const status = await getPinataStatus(true);
      setPinataStatus(status);
      if (!status.configured) {
        setPinataCheckError('Pinata API credentials are not configured on the server.');
      } else if (status.authenticated === false) {
        setPinataCheckError(status.verifyError || 'Pinata authentication verification failed.');
      }
    } catch (err: any) {
      setPinataStatus(null);
      setPinataCheckError(err?.message || 'Unable to reach Pinata IPFS status endpoint.');
    } finally {
      setPinataChecking(false);
    }
  };

  // Sync primary royalty address if wallet connects while open
  useEffect(() => {
    if (!resolvedWalletAddress) return;
    setRoyaltySplits((prev) => {
      if (prev.length === 1 && !prev[0].address.trim()) {
        return [{ ...prev[0], address: resolvedWalletAddress }];
      }
      return prev;
    });
  }, [resolvedWalletAddress]);

  // Populate fields from a selected track
  const applyTrackSelection = (track: Track) => {
    setSelectedTrackId(track.id);
    setTitle(track.title || '');
    setGenre(GENRES.includes(track.genre) ? track.genre : 'Electronic');
    setDescription(
      track.description || `${track.title} — official master music NFT by ${track.artist || artistDisplayName}.`
    );
    setPrice(track.nftPrice || track.price || '2.5');
    setEditions(track.editions || '25');
    setListingType(track.listingType || 'fixed');
    if (track.rarity && RARITIES.includes(track.rarity as any)) {
      setRarity(track.rarity as (typeof RARITIES)[number]);
    }
    setAudioFile(null);
    setCoverFile(null);
    const trackAudio = track.audioIpfsUrl || track.audioUrl || '';
    const trackCover = track.coverIpfsUrl || track.coverUrl || '';
    setAudioUrl(trackAudio);
    setCoverUrl(trackCover);
    setCoverPreviewUrl(trackCover || getPlaceholderImage('track'));
    setPinnedAudio(isPinataOrIpfsUrl(trackAudio) ? toPinataAssetRecord(trackAudio) : null);
    setPinnedCover(isPinataOrIpfsUrl(trackCover) ? toPinataAssetRecord(trackCover) : null);
    setPinnedMetadata(
      track.metadataIpfsUrl ? toPinataAssetRecord(track.metadataIpfsUrl, 'metadata.json') : null
    );
    if (track.royaltySplits && track.royaltySplits.length > 0) {
      setRoyaltySplits(
        track.royaltySplits.map((s) => ({
          address: s.address || resolvedWalletAddress,
          percentage: s.percentage <= 1 ? Math.round(s.percentage * 100) : s.percentage,
          label: s.label || 'Collaborator',
        }))
      );
    } else {
      setRoyaltySplits([
        {
          address: resolvedWalletAddress,
          percentage: 100,
          label: 'Main Artist',
        },
      ]);
    }
    setFormError(null);
    setMintedNFT(null);
    setMintTxHash('');
  };

  // Initialize modal state on open
  useEffect(() => {
    if (!isOpen) return;

    checkPinataConfig();
    getEstimatedGasFee()
      .then((fee) => setEstimatedGasTon(fee))
      .catch(() => setEstimatedGasTon(0.1));

    setFormError(null);
    setMintedNFT(null);
    setMintTxHash('');
    setAudioUploadPct(0);
    setCoverUploadPct(0);
    setActivePipelineId('');

    if (preselectedTrack) {
      setSourceMode('catalog');
      applyTrackSelection(preselectedTrack);
    } else if (catalogTracks.length > 0) {
      setSourceMode('catalog');
      applyTrackSelection(catalogTracks[0]);
    } else {
      setSourceMode('upload');
      setSelectedTrackId('');
      setTitle('');
      setGenre('Electronic');
      setDescription('');
      setPrice('2.5');
      setEditions('25');
      setRarity('Rare');
      setListingType('fixed');
      setAudioFile(null);
      setCoverFile(null);
      setAudioUrl('');
      setCoverUrl('');
      setCoverPreviewUrl('');
      setPinnedAudio(null);
      setPinnedCover(null);
      setPinnedMetadata(null);
      setRoyaltySplits([
        {
          address: resolvedWalletAddress,
          percentage: 100,
          label: 'Main Artist',
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, preselectedTrack?.id]);

  // Stop audio preview when closing
  useEffect(() => {
    if (!isOpen && audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      setIsPlayingPreview(false);
    }
  }, [isOpen]);

  const handleModeSwitch = (mode: 'catalog' | 'upload') => {
    setSourceMode(mode);
    setFormError(null);
    setMintedNFT(null);
    setPinnedMetadata(null);

    if (mode === 'catalog' && catalogTracks.length > 0) {
      const target =
        catalogTracks.find((t) => t.id === selectedTrackId) || preselectedTrack || catalogTracks[0];
      applyTrackSelection(target);
    } else if (mode === 'upload') {
      setSelectedTrackId('');
      setAudioFile(null);
      setCoverFile(null);
      setAudioUrl('');
      setCoverUrl('');
      setCoverPreviewUrl('');
      setPinnedAudio(null);
      setPinnedCover(null);
      setTitle('');
      setDescription('');
    }
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateFile(file, 'audio', 100);
    if (!validation.isValid) {
      setFormError(validation.error || 'Invalid audio file');
      return;
    }
    setFormError(null);
    setAudioFile(file);
    setPinnedAudio(null);
    setPinnedMetadata(null);
    setAudioUploadPct(0);
    const localUrl = URL.createObjectURL(file);
    setAudioUrl(localUrl);
    if (!title.trim()) {
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' '));
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateFile(file, 'image', 20);
    if (!validation.isValid) {
      setFormError(validation.error || 'Invalid cover image');
      return;
    }
    setFormError(null);
    setCoverFile(file);
    setPinnedCover(null);
    setPinnedMetadata(null);
    setCoverUploadPct(0);
    const localUrl = URL.createObjectURL(file);
    setCoverUrl(localUrl);
    setCoverPreviewUrl(localUrl);
  };

  const handleGenerateStudioCover = async () => {
    try {
      const generated = await generateStudioCoverFile(
        title || 'TonJam Master',
        artistDisplayName,
        genre
      );
      setCoverFile(generated);
      setPinnedCover(null);
      setPinnedMetadata(null);
      setCoverUploadPct(0);
      const localUrl = URL.createObjectURL(generated);
      setCoverUrl(localUrl);
      setCoverPreviewUrl(localUrl);
      toast.success('Generated studio cover artwork');
    } catch (err: any) {
      setFormError(err?.message || 'Could not generate cover art');
    }
  };

  const toggleAudioPreview = () => {
    const el = audioPreviewRef.current;
    if (!el || !audioUrl) return;
    if (isPlayingPreview) {
      el.pause();
      setIsPlayingPreview(false);
    } else {
      el.play().catch(() => {});
      setIsPlayingPreview(true);
    }
  };

  const addRoyaltyRow = () => {
    setRoyaltySplits((prev) => [...prev, { address: '', percentage: 0, label: 'Collaborator' }]);
  };

  const updateRoyaltyRow = (
    idx: number,
    field: keyof RoyaltySplitExtended,
    val: string | number
  ) => {
    setRoyaltySplits((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: val } : row))
    );
  };

  const removeRoyaltyRow = (idx: number) => {
    setRoyaltySplits((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));
  };

  const totalRoyaltyPct = useMemo(
    () => royaltySplits.reduce((sum, s) => sum + (Number(s.percentage) || 0), 0),
    [royaltySplits]
  );

  const validateBeforePinOrMint = (requireWallet: boolean): string | null => {
    if (existingMintedNft) {
      return `Track "${selectedTrack?.title}" is already minted as NFT "${existingMintedNft.title}".`;
    }
    if (pinataStatus && !pinataStatus.configured) {
      return 'Pinata IPFS credentials are not configured on the server.';
    }
    if (!title.trim()) {
      return 'Track title is required.';
    }
    if (!audioFile && !audioUrl) {
      return 'Select a catalog track or upload an audio master file.';
    }
    if (!coverFile && !coverUrl) {
      return 'Upload cover artwork or generate studio artwork.';
    }
    const priceNum = parseFloat(price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      return 'Mint price must be greater than 0 TON.';
    }
    const editionsNum = parseInt(editions, 10);
    if (!Number.isFinite(editionsNum) || editionsNum < 1) {
      return 'Editions supply must be at least 1.';
    }
    if (Math.abs(totalRoyaltyPct - 100) > 0.01) {
      return `Royalty splits must total 100% (currently ${totalRoyaltyPct}%).`;
    }
    if (requireWallet) {
      for (let i = 0; i < royaltySplits.length; i++) {
        if (!royaltySplits[i].address.trim()) {
          return `Royalty recipient #${i + 1} requires a TON wallet address.`;
        }
      }
      if (!resolvedWalletAddress) {
        return 'Connect your TON wallet to sign the mint transaction.';
      }
    }
    return null;
  };

  /**
   * Pins audio master (if local File) & compressed cover artwork (if local File) to Pinata IPFS.
   */
  const pinMediaAssetsToPinata = async (
    pipelineId: string
  ): Promise<{ finalAudioUrl: string; finalCoverUrl: string }> => {
    let resolvedAudio = pinnedAudio?.gatewayUrl || audioUrl;
    let resolvedCover = pinnedCover?.gatewayUrl || coverUrl;

    if (audioFile && !pinnedAudio) {
      updateMintingStatus(pipelineId, {
        trackId: pipelineId,
        step: 'uploading',
        progress: 15,
        title,
        artist: artistDisplayName,
        message: 'Pinning audio master to Pinata IPFS...',
      });
      const uploadedAudioUrl = await uploadToPinata(audioFile, (pct) => {
        setAudioUploadPct(pct);
        updateMintingStatus(pipelineId, {
          progress: Math.min(40, 10 + Math.round(pct * 0.3)),
          message: `Pinning audio master to Pinata IPFS (${pct}%)...`,
        });
      });
      const audioRec = toPinataAssetRecord(uploadedAudioUrl, audioFile.name, audioFile.size);
      setPinnedAudio(audioRec);
      resolvedAudio = uploadedAudioUrl;
    }

    if (coverFile && !pinnedCover) {
      updateMintingStatus(pipelineId, {
        step: 'uploading',
        progress: 45,
        message: 'Optimizing & pinning cover artwork to Pinata IPFS...',
      });
      const optimizedCover = await compressImageForNFT(coverFile);
      const uploadedCoverUrl = await uploadToPinata(optimizedCover, (pct) => {
        setCoverUploadPct(pct);
        updateMintingStatus(pipelineId, {
          progress: Math.min(62, 45 + Math.round(pct * 0.17)),
          message: `Pinning cover artwork to Pinata IPFS (${pct}%)...`,
        });
      });
      const coverRec = toPinataAssetRecord(
        uploadedCoverUrl,
        optimizedCover.name,
        optimizedCover.size
      );
      setPinnedCover(coverRec);
      setCoverPreviewUrl(uploadedCoverUrl);
      resolvedCover = uploadedCoverUrl;
    }

    // Ensure non-blob URLs for Firestore / metadata
    if (resolvedAudio.startsWith('blob:') || resolvedAudio.startsWith('data:')) {
      throw new Error('Audio master must be uploaded to Pinata IPFS before minting.');
    }
    if (resolvedCover.startsWith('blob:') || resolvedCover.startsWith('data:')) {
      throw new Error('Cover artwork must be uploaded to Pinata IPFS before minting.');
    }

    return { finalAudioUrl: resolvedAudio, finalCoverUrl: resolvedCover };
  };

  const handlePrePinAssets = async () => {
    const validationErr = validateBeforePinOrMint(false);
    if (validationErr) {
      setFormError(validationErr);
      return;
    }
    setFormError(null);
    setIsPinningAssets(true);
    const pipelineId = selectedTrack?.id || `track-pin-${Date.now()}`;
    setActivePipelineId(pipelineId);
    try {
      await pinMediaAssetsToPinata(pipelineId);
      updateMintingStatus(pipelineId, {
        step: 'idle',
        progress: 55,
        message: 'Media assets pinned to Pinata IPFS. Ready to compile metadata & mint.',
      });
      toast.success('Media assets pinned to Pinata IPFS');
    } catch (err: any) {
      const msg = err?.message || 'Pinata IPFS upload failed.';
      setFormError(msg);
      updateMintingStatus(pipelineId, {
        step: 'error',
        progress: 0,
        message: msg,
        error: msg,
      });
      toast.error(msg);
    } finally {
      setIsPinningAssets(false);
    }
  };

  const handleExecuteMint = async () => {
    if (!resolvedWalletAddress) {
      setFormError('Please connect your TON wallet first.');
      tonConnectUI?.openModal?.();
      return;
    }

    const validationErr = validateBeforePinOrMint(true);
    if (validationErr) {
      setFormError(validationErr);
      return;
    }

    const pipelineId = selectedTrack?.id || `track-nft-${Date.now()}`;
    setActivePipelineId(pipelineId);
    setFormError(null);
    setIsMinting(true);

    try {
      // Step 1: Pin audio & cover assets via Pinata
      const { finalAudioUrl, finalCoverUrl } = await pinMediaAssetsToPinata(pipelineId);

      // Step 2: Compile & pin TEP-64 JSON metadata via Pinata
      updateMintingStatus(pipelineId, {
        step: 'metadata',
        progress: 68,
        title,
        artist: artistDisplayName,
        coverUrl: finalCoverUrl,
        price,
        editions,
        message: 'Compiling & pinning TEP-64 metadata JSON to Pinata IPFS...',
      });

      const normalizedSplits = royaltySplits.map((s) => ({
        address: s.address.trim(),
        percentage: (Number(s.percentage) || 0) / 100,
        label: s.label || 'Collaborator',
      }));

      const tep64Metadata = {
        name: title.trim(),
        description:
          description.trim() || `${title.trim()} — official music NFT by ${artistDisplayName} on TonJam`,
        image: finalCoverUrl,
        animation_url: finalAudioUrl,
        external_url: typeof window !== 'undefined' ? window.location.origin : 'https://tonjam.app',
        attributes: [
          { trait_type: 'Artist', value: artistDisplayName },
          { trait_type: 'Genre', value: genre },
          { trait_type: 'Rarity', value: rarity },
          { trait_type: 'Editions', value: editions },
          { trait_type: 'ListingType', value: listingType },
          { trait_type: 'AudioCID', value: extractCidFromUrl(finalAudioUrl) },
          { trait_type: 'CoverCID', value: extractCidFromUrl(finalCoverUrl) },
          { trait_type: 'RoyaltySplits', value: JSON.stringify(normalizedSplits) },
        ],
      };

      const metadataGatewayUrl = await uploadJSONToPinata(tep64Metadata, (pct) => {
        updateMintingStatus(pipelineId, {
          progress: Math.min(76, 68 + Math.round(pct * 0.08)),
        });
      });
      const metadataRec = toPinataAssetRecord(metadataGatewayUrl, 'metadata.json');
      setPinnedMetadata(metadataRec);

      // Step 3: Sign & broadcast TON mint transaction
      updateMintingStatus(pipelineId, {
        step: 'blockchain',
        progress: 82,
        ipfsHash: metadataRec.cid,
        message: 'Awaiting TON wallet signature to mint NFT on-chain...',
      });

      const txHash = await mintTonJamNFT(tonConnectUI, resolvedWalletAddress, metadataGatewayUrl);
      if (!txHash) {
        throw new Error('TON mint transaction was cancelled or rejected.');
      }
      setMintTxHash(txHash);

      // Step 4: Register in NFTProvider (Firestore + context) & AudioContext catalog
      updateMintingStatus(pipelineId, {
        step: 'registering',
        progress: 94,
        txHash,
        ipfsHash: metadataRec.cid,
        message: 'Registering NFT & IPFS records in TonJam catalog...',
      });

      const nowIso = new Date().toISOString();
      const nftId = `nft-${Date.now()}`;
      const editionsCount = Math.max(1, parseInt(editions, 10) || 1);
      const auctionDays = Math.max(1, parseInt(auctionDuration, 10) || 3);
      const auctionEnd = new Date(Date.now() + auctionDays * 86400000).toISOString();

      const updatedTrack: Track = {
        ...(selectedTrack || ({} as Track)),
        id: pipelineId,
        songId: selectedTrack?.songId || `song-${pipelineId}`,
        title: title.trim(),
        artist: artistDisplayName,
        artistId: currentUid || selectedTrack?.artistId || 'artist-local',
        artistAvatar: userProfile?.avatar || selectedTrack?.artistAvatar,
        coverUrl: finalCoverUrl,
        audioUrl: finalAudioUrl,
        duration: selectedTrack?.duration || 180,
        genre,
        isNFT: true,
        nftId,
        nftPrice: price,
        price,
        editions: String(editionsCount),
        minted: (selectedTrack?.minted || 0) + 1,
        rarity,
        listingType,
        auctionDuration: listingType === 'auction' ? auctionDuration : undefined,
        artistVerified: Boolean(userProfile?.isVerifiedArtist || userProfile?.verified),
        description: description.trim(),
        ipfsUrl: metadataGatewayUrl,
        cid: metadataRec.cid,
        audioIpfsUrl: finalAudioUrl,
        coverIpfsUrl: finalCoverUrl,
        metadataIpfsUrl: metadataGatewayUrl,
        royaltySplits: normalizedSplits,
        createdAt: selectedTrack?.createdAt || nowIso,
      };

      const newNFT: NFTItem = {
        id: nftId,
        trackId: pipelineId,
        title: title.trim(),
        owner: resolvedWalletAddress,
        ownerId: currentUid || resolvedWalletAddress,
        creator: artistDisplayName,
        creatorId: currentUid || resolvedWalletAddress,
        artist: artistDisplayName,
        artistId: currentUid || resolvedWalletAddress,
        price: price.trim(),
        imageUrl: finalCoverUrl,
        coverUrl: finalCoverUrl,
        audioUrl: finalAudioUrl,
        audioIpfsUrl: finalAudioUrl,
        rarity,
        edition: `1 of ${editionsCount}`,
        supply: editionsCount,
        minted: 1,
        royaltySplits: normalizedSplits,
        description: description.trim(),
        attributes: tep64Metadata.attributes,
        traits: tep64Metadata.attributes,
        ipfsUrl: metadataGatewayUrl,
        cid: metadataRec.cid,
        listingType,
        isAuction: listingType === 'auction',
        startingBid: listingType === 'auction' ? price.trim() : undefined,
        auctionStartTime: listingType === 'auction' ? nowIso : undefined,
        auctionEndTime: listingType === 'auction' ? auctionEnd : undefined,
        createdAt: nowIso,
        history: [
          {
            event: 'Minted',
            from: '0x0000000000000000000000000000000000000000',
            to: artistDisplayName,
            date: nowIso,
            price: price.trim(),
          },
        ],
      };

      addNFT(newNFT);
      await Promise.allSettled([
        addUserTrack(updatedTrack),
        addUserNFT(newNFT, true),
        auth.currentUser
          ? createActivityPost(
              auth.currentUser.uid,
              artistDisplayName,
              userProfile?.avatar || getPlaceholderImage('artist'),
              `Minted "${title.trim()}" as a Music NFT on TON (${editionsCount} edition${editionsCount > 1 ? 's' : ''})`,
              'nft_mint',
              {
                targetId: nftId,
                artistName: artistDisplayName,
                trackTitle: title.trim(),
                paymentAmount: price.trim(),
                paymentCurrency: 'TON',
              }
            )
          : Promise.resolve(),
      ]);

      updateMintingStatus(pipelineId, {
        step: 'completed',
        progress: 100,
        txHash,
        ipfsHash: metadataRec.cid,
        timestamp: Date.now(),
        message: 'Track minted on TON and pinned on Pinata IPFS!',
      });

      setMintedNFT(newNFT);
      addNotification(`"${title.trim()}" minted as an NFT!`, 'success');
      toast.success(`Minted "${title.trim()}" on TON!`);
      onSuccess?.(newNFT);
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to mint track NFT.';
      setFormError(errMsg);
      updateMintingStatus(pipelineId, {
        step: 'error',
        progress: 0,
        message: errMsg,
        error: errMsg,
      });
      toast.error(errMsg);
    } finally {
      setIsMinting(false);
    }
  };

  const copyValue = (key: string, value: string) => {
    navigator.clipboard?.writeText(value);
    setCopiedKey(key);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleClose = () => {
    if (isMinting) return;
    if (activePipelineId) {
      removeMintingStatus(activePipelineId);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl w-[calc(100%-1.5rem)] max-h-[90vh] overflow-hidden p-0 bg-[#0A1324] text-white border-0 ring-0 outline-none rounded-2xl shadow-2xl flex flex-col gap-0"
      >
        {/* Modal Header (no border line — surface separation only) */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#0E1A30] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0088CC] to-cyan-500 flex items-center justify-center shrink-0">
              <Disc className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-sm font-black uppercase tracking-wider text-white truncate">
                Mint Track as NFT
              </DialogTitle>
              <DialogDescription className="text-[11px] text-slate-400 truncate">
                Pinata IPFS media storage · TEP-64 metadata · TON Blockchain
              </DialogDescription>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isMinting}
            aria-label="Close mint modal"
            className="w-8 h-8 rounded-full bg-[#152440] hover:bg-[#1D3154] text-slate-300 hover:text-white flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 custom-scrollbar">
          {/* Pinata IPFS Configuration Banner */}
          <div className="rounded-xl bg-[#111E36] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  pinataChecking
                    ? 'bg-sky-500/15 text-sky-400'
                    : pinataStatus?.configured && pinataStatus.authenticated !== false
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-amber-500/15 text-amber-400'
                }`}
              >
                {pinataChecking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Database className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white">
                    {pinataChecking
                      ? 'Checking Pinata IPFS configuration...'
                      : pinataStatus?.configured && pinataStatus.authenticated !== false
                        ? 'Pinata IPFS Ready'
                        : 'Pinata IPFS Attention Needed'}
                  </span>
                  {pinataStatus?.configured && (
                    <span className="px-2 py-0.5 rounded-md bg-[#192B4B] text-[10px] font-bold uppercase tracking-wider text-sky-300">
                      {pinataStatus.authMode === 'jwt' ? 'JWT Auth' : 'API Key'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {pinataCheckError
                    ? pinataCheckError
                    : pinataStatus?.configured
                      ? `Gateway: ${pinataStatus.gatewayBaseUrl} · Max ${formatBytes(pinataStatus.maxFileSizeBytes)}`
                      : 'Verifying decentralized pinning gateway...'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={checkPinataConfig}
              disabled={pinataChecking}
              className="px-3 py-1.5 rounded-lg bg-[#172744] hover:bg-[#1F345B] text-[11px] font-bold text-slate-200 flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${pinataChecking ? 'animate-spin' : ''}`} />
              <span>Verify Pinata</span>
            </button>
          </div>

          {/* Minted Success View */}
          {mintedNFT ? (
            <div className="rounded-2xl bg-[#111E36] p-5 space-y-4">
              <div className="flex items-start gap-4">
                <img
                  src={mintedNFT.imageUrl || getPlaceholderImage('nft')}
                  alt={mintedNFT.title}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 bg-[#172744]"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Minted on TON & Pinned to IPFS</span>
                  </div>
                  <h3 className="text-base font-black text-white truncate">{mintedNFT.title}</h3>
                  <p className="text-xs text-slate-400">
                    {mintedNFT.price} TON · {mintedNFT.edition} · {mintedNFT.rarity}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {pinnedMetadata?.cid && (
                  <div className="rounded-xl bg-[#172744] p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        Metadata JSON CID
                      </p>
                      <p className="text-xs font-mono text-sky-300 truncate">{pinnedMetadata.cid}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyValue('metaCid', pinnedMetadata.cid)}
                      className="p-1.5 rounded-lg bg-[#1F345B] text-slate-200 hover:text-white cursor-pointer"
                      aria-label="Copy Metadata CID"
                    >
                      {copiedKey === 'metaCid' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {mintTxHash && (
                  <div className="rounded-xl bg-[#172744] p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        TON Transaction ({TON_NETWORK_MODE})
                      </p>
                      <p className="text-xs font-mono text-emerald-300 truncate">
                        {shortAddress(mintTxHash, 8, 6)}
                      </p>
                    </div>
                    <a
                      href={getTonViewerUrl(mintTxHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-[#1F345B] text-slate-200 hover:text-white"
                      aria-label="Inspect on TonViewer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    navigate(`/nft/${mintedNFT.id}`);
                  }}
                  className="flex-1 min-w-[160px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0088CC] to-cyan-500 text-xs font-black uppercase tracking-wider text-white cursor-pointer"
                >
                  View NFT in Marketplace
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMintedNFT(null);
                    setMintTxHash('');
                    setPinnedMetadata(null);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-[#172744] hover:bg-[#1F345B] text-xs font-bold text-slate-200 cursor-pointer"
                >
                  Mint Another Track
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Source Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#111E36]">
                <button
                  type="button"
                  onClick={() => handleModeSwitch('catalog')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    sourceMode === 'catalog'
                      ? 'bg-[#0088CC] text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>My Catalog ({catalogTracks.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleModeSwitch('upload')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    sourceMode === 'upload'
                      ? 'bg-[#0088CC] text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload New Track</span>
                </button>
              </div>

              {/* Catalog Track Selector */}
              {sourceMode === 'catalog' && (
                <div className="space-y-2">
                  <label
                    htmlFor="mint-catalog-select"
                    className="block text-[11px] font-bold uppercase tracking-wider text-slate-400"
                  >
                    Select Artist Track
                  </label>
                  {catalogTracks.length > 0 ? (
                    <select
                      id="mint-catalog-select"
                      value={selectedTrack?.id || ''}
                      onChange={(e) => {
                        const found = catalogTracks.find((t) => t.id === e.target.value);
                        if (found) applyTrackSelection(found);
                      }}
                      className="w-full rounded-xl bg-[#121F38] px-3.5 py-2.5 text-xs font-semibold text-white outline-none focus:bg-[#172744]"
                    >
                      {catalogTracks.map((t) => {
                        const minted = Boolean(t.isNFT || getNFTByTrackId(t.id));
                        return (
                          <option key={t.id} value={t.id} className="bg-[#0E1A30] text-white">
                            {t.title} — {t.genre} {minted ? '(Already Minted)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <div className="rounded-xl bg-[#111E36] p-4 flex items-center justify-between gap-3">
                      <p className="text-xs text-slate-400">
                        No catalog tracks found yet. Upload an audio master and cover art directly.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleModeSwitch('upload')}
                        className="px-3 py-1.5 rounded-lg bg-[#0088CC] text-xs font-bold text-white shrink-0 cursor-pointer"
                      >
                        Upload Track
                      </button>
                    </div>
                  )}

                  {existingMintedNft && (
                    <div className="rounded-xl bg-amber-500/10 p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <p className="text-xs text-amber-200 truncate">
                          This track is already minted as NFT &ldquo;{existingMintedNft.title}&rdquo;.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          handleClose();
                          navigate(`/nft/${existingMintedNft.id}`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-[11px] font-bold text-amber-200 shrink-0 cursor-pointer"
                      >
                        View NFT
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Cover Artwork + Audio Master IPFS Staging */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                {/* Cover Preview & Upload */}
                <div className="sm:col-span-5 rounded-xl bg-[#111E36] p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Cover Artwork
                    </span>
                    {pinnedCover?.cid && (
                      <span className="text-[10px] font-mono text-emerald-400">
                        IPFS: {pinnedCover.cid.slice(0, 8)}...
                      </span>
                    )}
                  </div>

                  <div className="relative aspect-square rounded-xl overflow-hidden bg-[#172744] flex items-center justify-center">
                    {coverPreviewUrl ? (
                      <img
                        src={coverPreviewUrl}
                        alt={title || 'Track Cover'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-[11px]">No cover selected</span>
                      </div>
                    )}
                  </div>

                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleCoverFileChange}
                    className="hidden"
                    aria-label="Upload cover artwork"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="py-2 px-2.5 rounded-lg bg-[#172744] hover:bg-[#1F345B] text-[11px] font-bold text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Art</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateStudioCover}
                      className="py-2 px-2.5 rounded-lg bg-[#172744] hover:bg-[#1F345B] text-[11px] font-bold text-sky-300 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Generate</span>
                    </button>
                  </div>

                  {coverUploadPct > 0 && coverUploadPct < 100 && (
                    <div className="w-full h-1.5 rounded-full bg-[#192B4B] overflow-hidden">
                      <div
                        className="h-full bg-sky-400 transition-all"
                        style={{ width: `${coverUploadPct}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Audio Master + Track Metadata */}
                <div className="sm:col-span-7 space-y-3">
                  {/* Audio Master Pinning Card */}
                  <div className="rounded-xl bg-[#111E36] p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Audio Master (IPFS)
                      </span>
                      {pinnedAudio?.cid ? (
                        <span className="text-[10px] font-mono text-emerald-400">
                          Pinned: {pinnedAudio.cid.slice(0, 10)}...
                        </span>
                      ) : audioUrl ? (
                        <span className="text-[10px] font-semibold text-sky-300">
                          {audioFile ? 'Ready to pin' : 'Catalog master linked'}
                        </span>
                      ) : null}
                    </div>

                    <input
                      ref={audioInputRef}
                      type="file"
                      accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/flac,audio/m4a"
                      onChange={handleAudioFileChange}
                      className="hidden"
                      aria-label="Upload audio master"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => audioInputRef.current?.click()}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-[#172744] hover:bg-[#1F345B] text-xs font-bold text-slate-200 flex items-center justify-center gap-2 truncate cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          {audioFile
                            ? audioFile.name
                            : audioUrl
                              ? 'Replace Audio File'
                              : 'Select Audio File (MP3/WAV/FLAC)'}
                        </span>
                      </button>

                      {audioUrl && (
                        <button
                          type="button"
                          onClick={toggleAudioPreview}
                          aria-label={isPlayingPreview ? 'Pause preview' : 'Play preview'}
                          className="w-10 h-10 rounded-xl bg-[#0088CC]/20 hover:bg-[#0088CC]/30 text-sky-300 flex items-center justify-center shrink-0 cursor-pointer"
                        >
                          {isPlayingPreview ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>

                    {audioUrl && (
                      <audio
                        ref={audioPreviewRef}
                        src={audioUrl}
                        onEnded={() => setIsPlayingPreview(false)}
                        className="hidden"
                      />
                    )}

                    {audioUploadPct > 0 && audioUploadPct < 100 && (
                      <div className="w-full h-1.5 rounded-full bg-[#192B4B] overflow-hidden">
                        <div
                          className="h-full bg-sky-400 transition-all"
                          style={{ width: `${audioUploadPct}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Title & Genre */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label
                        htmlFor="mint-track-title"
                        className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1"
                      >
                        NFT Title
                      </label>
                      <input
                        id="mint-track-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Midnight Frequency"
                        className="w-full rounded-xl bg-[#121F38] px-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:bg-[#172744]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="mint-track-genre"
                        className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1"
                      >
                        Genre
                      </label>
                      <select
                        id="mint-track-genre"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        className="w-full rounded-xl bg-[#121F38] px-3 py-2.5 text-xs text-white outline-none focus:bg-[#172744]"
                      >
                        {GENRES.map((g) => (
                          <option key={g} value={g} className="bg-[#0E1A30] text-white">
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="mint-track-description"
                      className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1"
                    >
                      TEP-64 Description
                    </label>
                    <textarea
                      id="mint-track-description"
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the story, stems, or collector perks..."
                      className="w-full rounded-xl bg-[#121F38] px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:bg-[#172744] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing, Editions, Rarity & Listing Mode */}
              <div className="rounded-xl bg-[#111E36] p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    <span>Edition & Marketplace Economics</span>
                  </span>
                  <div className="flex items-center gap-1 bg-[#172744] p-0.5 rounded-lg">
                    {(['fixed', 'auction'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setListingType(mode)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                          listingType === mode
                            ? 'bg-[#0088CC] text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {mode === 'fixed' ? 'Fixed Price' : 'Auction'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label
                      htmlFor="mint-price-ton"
                      className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1"
                    >
                      {listingType === 'auction' ? 'Starting Bid (TON)' : 'Price (TON)'}
                    </label>
                    <input
                      id="mint-price-ton"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full rounded-xl bg-[#172744] px-3 py-2 text-xs font-bold text-white outline-none focus:bg-[#1D3154]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="mint-editions"
                      className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1"
                    >
                      Editions
                    </label>
                    <input
                      id="mint-editions"
                      type="number"
                      min="1"
                      step="1"
                      value={editions}
                      onChange={(e) => setEditions(e.target.value)}
                      className="w-full rounded-xl bg-[#172744] px-3 py-2 text-xs font-bold text-white outline-none focus:bg-[#1D3154]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="mint-rarity"
                      className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1"
                    >
                      Rarity
                    </label>
                    <select
                      id="mint-rarity"
                      value={rarity}
                      onChange={(e) => setRarity(e.target.value as (typeof RARITIES)[number])}
                      className="w-full rounded-xl bg-[#172744] px-3 py-2 text-xs font-bold text-white outline-none focus:bg-[#1D3154]"
                    >
                      {RARITIES.map((r) => (
                        <option key={r} value={r} className="bg-[#0E1A30] text-white">
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  {listingType === 'auction' ? (
                    <div>
                      <label
                        htmlFor="mint-auction-days"
                        className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1"
                      >
                        Duration (Days)
                      </label>
                      <input
                        id="mint-auction-days"
                        type="number"
                        min="1"
                        max="30"
                        value={auctionDuration}
                        onChange={(e) => setAuctionDuration(e.target.value)}
                        className="w-full rounded-xl bg-[#172744] px-3 py-2 text-xs font-bold text-white outline-none focus:bg-[#1D3154]"
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl bg-[#172744] px-3 py-2 flex flex-col justify-center">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        Est. Gas
                      </span>
                      <span className="text-xs font-bold text-sky-300">
                        ~{estimatedGasTon.toFixed(3)} TON
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Collaborator Royalty Splits */}
              <div className="rounded-xl bg-[#111E36] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Royalty Splits
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        Math.abs(totalRoyaltyPct - 100) < 0.01
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-rose-500/15 text-rose-300'
                      }`}
                    >
                      {totalRoyaltyPct}% / 100%
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addRoyaltyRow}
                    className="px-2.5 py-1 rounded-lg bg-[#172744] hover:bg-[#1F345B] text-[11px] font-bold text-sky-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Split</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {royaltySplits.map((split, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        value={split.label}
                        onChange={(e) => updateRoyaltyRow(idx, 'label', e.target.value)}
                        placeholder="Role"
                        aria-label={`Royalty role ${idx + 1}`}
                        className="col-span-3 rounded-lg bg-[#172744] px-2.5 py-2 text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        value={split.address}
                        onChange={(e) => updateRoyaltyRow(idx, 'address', e.target.value)}
                        placeholder="TON Wallet Address"
                        aria-label={`Royalty wallet address ${idx + 1}`}
                        className="col-span-6 rounded-lg bg-[#172744] px-2.5 py-2 text-xs font-mono text-white outline-none"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={split.percentage}
                        onChange={(e) =>
                          updateRoyaltyRow(idx, 'percentage', Number(e.target.value) || 0)
                        }
                        aria-label={`Royalty percentage ${idx + 1}`}
                        className="col-span-2 rounded-lg bg-[#172744] px-2 py-2 text-xs font-bold text-white text-center outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeRoyaltyRow(idx)}
                        disabled={royaltySplits.length <= 1}
                        aria-label={`Remove split ${idx + 1}`}
                        className="col-span-1 h-8 rounded-lg bg-[#172744] hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 flex items-center justify-center disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pinata IPFS Pinned Records & NFTProvider Live Pipeline Status */}
              {(pinnedAudio || pinnedCover || pinnedMetadata || activeMintStatus) && (
                <div className="rounded-xl bg-[#111E36] p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FileJson className="w-3.5 h-3.5 text-sky-400" />
                      <span>Pinata IPFS & NFTProvider Pipeline</span>
                    </span>
                    {activeMintStatus && (
                      <span className="text-[11px] font-bold text-sky-300">
                        {activeMintStatus.progress}%
                      </span>
                    )}
                  </div>

                  {activeMintStatus && (
                    <div className="space-y-1.5">
                      <div className="w-full h-1.5 rounded-full bg-[#192B4B] overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            activeMintStatus.step === 'error'
                              ? 'bg-rose-400'
                              : activeMintStatus.step === 'completed'
                                ? 'bg-emerald-400'
                                : 'bg-[#0088CC]'
                          }`}
                          style={{ width: `${activeMintStatus.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-300">{activeMintStatus.message}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {pinnedAudio?.cid && (
                      <span className="px-2.5 py-1 rounded-lg bg-[#172744] text-[10px] font-mono text-emerald-300">
                        Audio CID: {pinnedAudio.cid.slice(0, 12)}...
                      </span>
                    )}
                    {pinnedCover?.cid && (
                      <span className="px-2.5 py-1 rounded-lg bg-[#172744] text-[10px] font-mono text-emerald-300">
                        Cover CID: {pinnedCover.cid.slice(0, 12)}...
                      </span>
                    )}
                    {pinnedMetadata?.cid && (
                      <span className="px-2.5 py-1 rounded-lg bg-[#172744] text-[10px] font-mono text-sky-300">
                        JSON CID: {pinnedMetadata.cid.slice(0, 12)}...
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Validation / Runtime Error Banner */}
              {formError && (
                <div
                  role="alert"
                  className="rounded-xl bg-rose-500/15 px-3.5 py-2.5 flex items-center gap-2.5 text-xs text-rose-200"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sticky Footer Actions (no border line — surface separation only) */}
        {!mintedNFT && (
          <div className="px-5 py-3.5 bg-[#0E1A30] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Wallet className="w-4 h-4 text-sky-400 shrink-0" />
              {resolvedWalletAddress ? (
                <span className="font-mono text-[11px] text-slate-300">
                  {shortAddress(resolvedWalletAddress, 6, 4)}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => tonConnectUI?.openModal?.()}
                  className="text-xs font-bold text-sky-400 hover:text-sky-300 cursor-pointer"
                >
                  Connect TON Wallet
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {(audioFile || coverFile) && (!pinnedAudio || !pinnedCover) && (
                <button
                  type="button"
                  onClick={handlePrePinAssets}
                  disabled={isPinningAssets || isMinting}
                  className="py-2.5 px-3.5 rounded-xl bg-[#172744] hover:bg-[#1F345B] text-xs font-bold text-slate-200 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isPinningAssets ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Database className="w-3.5 h-3.5 text-sky-400" />
                  )}
                  <span>Pin to IPFS</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleExecuteMint}
                disabled={isMinting || isPinningAssets || Boolean(existingMintedNft)}
                className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#0088CC] to-cyan-500 hover:brightness-110 text-xs font-black uppercase tracking-wider text-white flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer transition-all"
              >
                {isMinting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Minting on TON...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Pin &amp; Mint NFT</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MintTrackNFTModal;
