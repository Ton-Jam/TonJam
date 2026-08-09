import React, { useState, useRef, useMemo } from 'react';
import { z } from 'zod';
import { 
  Upload, 
  Music, 
  Image as ImageIcon, 
  Tag, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Wallet, 
  Plus, 
  Trash2, 
  Info, 
  Lock, 
  RefreshCw, 
  FileAudio, 
  Layers, 
  ExternalLink,
  Gavel,
  Clock,
  Coins
} from 'lucide-react';
import { useNFT } from '@/contexts/NFTContext';
import { useWallet } from '@/contexts/WalletContext';
import { useTonPrice } from '@/contexts/TonPriceContext';
import { useTrackMinting, MintNFTParams } from '@/lib/nftMinting';
import { NFTItem, NFTTrait, RoyaltySplitExtended, Track } from '@/types';
import { TON_LOGO } from '@/constants';

export const listNFTFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Track title is required')
    .max(100, 'Track title must be 100 characters or less'),
  description: z.string().optional(),
  genre: z.string().trim().min(1, 'Genre selection is required'),
  editionsOption: z.string(),
  customEditions: z.string().optional(),
  price: z
    .string()
    .trim()
    .min(1, 'Listing price is required')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, 'Price must be a positive number in TON (greater than 0)'),
  royaltyPercentage: z
    .number()
    .min(0, 'Royalty percentage cannot be negative')
    .max(25, 'Royalty percentage cannot exceed 25%'),
  listingType: z.enum(['fixed', 'auction']),
  startingBid: z.string().optional(),
  auctionDuration: z.string().optional(),
  hasAudio: z.boolean().refine((val) => val === true, 'Audio track file is required'),
  hasCover: z.boolean().refine((val) => val === true, 'Cover artwork image is required'),
  hasExclusive: z.boolean().optional(),
  exclusiveTitle: z.string().optional(),
  exclusiveUrl: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.editionsOption === 'custom') {
    const num = parseInt(data.customEditions || '0', 10);
    if (isNaN(num) || num <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customEditions'],
        message: 'Custom edition quantity must be a positive integer',
      });
    }
  }
  if (data.listingType === 'auction') {
    const bid = parseFloat(data.startingBid || '0');
    if (isNaN(bid) || bid <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['startingBid'],
        message: 'Starting bid must be a positive number in TON',
      });
    }
  }
  if (data.hasExclusive) {
    if (!data.exclusiveTitle?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['exclusiveTitle'],
        message: 'Perk title is required when exclusive perk is enabled',
      });
    }
    if (!data.exclusiveUrl?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['exclusiveUrl'],
        message: 'Perk download/link URL is required when exclusive perk is enabled',
      });
    }
  }
});

export type ListNFTFormData = z.infer<typeof listNFTFormSchema>;

export interface ListNFTFormProps {
  initialTrack?: Partial<Track>;
  onSuccess?: (nft: NFTItem) => void;
  onCancel?: () => void;
  className?: string;
}

const GENRE_OPTIONS = [
  'Electronic', 'Hip-Hop', 'Ambient', 'Techno', 'House', 
  'Pop', 'Rock', 'Jazz', 'Lo-Fi', 'Afrobeat', 'R&B', 'Experimental'
];

const EDITION_PRESETS = [
  { label: '1/1 Unique', value: '1' },
  { label: '10 Limited', value: '10' },
  { label: '100 Standard', value: '100' },
  { label: 'Custom', value: 'custom' },
];

export const ListNFTForm: React.FC<ListNFTFormProps> = ({
  initialTrack,
  onSuccess,
  onCancel,
  className = ''
}) => {
  const { isMinting, mintingStatus } = useNFT();
  const { address, isConnected, connectWallet } = useWallet();
  const { price: tonUsdRate } = useTonPrice();
  const { mintTrackAsNFT } = useTrackMinting();

  // Form State
  const [title, setTitle] = useState(initialTrack?.title || '');
  const [description, setDescription] = useState(initialTrack?.description || '');
  const [genre, setGenre] = useState(initialTrack?.genre || 'Electronic');
  const [editionsOption, setEditionsOption] = useState('1');
  const [customEditions, setCustomEditions] = useState('50');
  const [price, setPrice] = useState(initialTrack?.price || '2.5');
  const [royaltyPercentage, setRoyaltyPercentage] = useState<number>(5);
  
  // Listing Type State
  const [listingType, setListingType] = useState<'fixed' | 'auction'>('fixed');
  const [startingBid, setStartingBid] = useState('1.0');
  const [auctionDuration, setAuctionDuration] = useState('7'); // days

  // Custom Traits/Attributes
  const [traits, setTraits] = useState<NFTTrait[]>([
    { trait_type: 'BPM', value: '128' },
    { trait_type: 'Audio Format', value: 'FLAC 24-bit/96kHz' }
  ]);
  const [newTraitKey, setNewTraitKey] = useState('');
  const [newTraitValue, setNewTraitValue] = useState('');

  // Exclusive Content State
  const [hasExclusive, setHasExclusive] = useState(false);
  const [exclusiveTitle, setExclusiveTitle] = useState('');
  const [exclusiveType, setExclusiveType] = useState<'video' | 'track' | 'image' | 'document'>('document');
  const [exclusiveUrl, setExclusiveUrl] = useState('');
  const [exclusiveDescription, setExclusiveDescription] = useState('');

  // Media File Handling State
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>(initialTrack?.audioUrl || '');
  const [audioDuration, setAudioDuration] = useState<number>(initialTrack?.duration || 0);
  
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState<string>(initialTrack?.coverUrl || '');

  // Validation & Submission State
  const [formError, setFormError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [createdNFT, setCreatedNFT] = useState<NFTItem | null>(null);

  // File Inputs Refs
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Zod Validation Object
  const formDataToValidate = useMemo(() => ({
    title,
    description,
    genre,
    editionsOption,
    customEditions,
    price,
    royaltyPercentage,
    listingType,
    startingBid,
    auctionDuration,
    hasAudio: !!(audioFile || audioUrl),
    hasCover: !!(coverFile || coverUrl),
    hasExclusive,
    exclusiveTitle,
    exclusiveUrl,
  }), [
    title, description, genre, editionsOption, customEditions, price,
    royaltyPercentage, listingType, startingBid, auctionDuration,
    audioFile, audioUrl, coverFile, coverUrl, hasExclusive, exclusiveTitle, exclusiveUrl
  ]);

  const validationResult = useMemo(() => {
    return listNFTFormSchema.safeParse(formDataToValidate);
  }, [formDataToValidate]);

  const isFormValid = validationResult.success;

  // Map field errors from Zod validation result
  const fieldErrors = useMemo(() => {
    if (validationResult.success) return {};
    const errors: Record<string, string> = {};
    for (const issue of validationResult.error.issues) {
      const field = issue.path[0];
      if (field && typeof field === 'string' && !errors[field]) {
        errors[field] = issue.message;
      }
    }
    return errors;
  }, [validationResult]);

  const markTouched = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  // Calculated Editions Count
  const finalEditions = editionsOption === 'custom' ? customEditions : editionsOption;

  // Calculate approximate USD value
  const estimatedUsdValue = useMemo(() => {
    const numericPrice = parseFloat(price) || 0;
    if (!tonUsdRate || numericPrice <= 0) return null;
    return (numericPrice * tonUsdRate).toFixed(2);
  }, [price, tonUsdRate]);

  // Handle Audio Selection
  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      const tempUrl = URL.createObjectURL(file);
      setAudioUrl(tempUrl);

      // Extract duration
      const audio = new Audio();
      audio.src = tempUrl;
      audio.onloadedmetadata = () => {
        setAudioDuration(Math.round(audio.duration));
      };
      setFormError(null);
      markTouched('hasAudio');
    }
  };

  // Handle Cover Selection
  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      const tempUrl = URL.createObjectURL(file);
      setCoverUrl(tempUrl);
      setFormError(null);
      markTouched('hasCover');
    }
  };

  // Add Dynamic Trait
  const handleAddTrait = () => {
    if (!newTraitKey.trim() || !newTraitValue.trim()) return;
    setTraits([...traits, { trait_type: newTraitKey.trim(), value: newTraitValue.trim() }]);
    setNewTraitKey('');
    setNewTraitValue('');
  };

  // Remove Dynamic Trait
  const handleRemoveTrait = (index: number) => {
    setTraits(traits.filter((_, i) => i !== index));
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Run Zod schema validation
    const result = listNFTFormSchema.safeParse(formDataToValidate);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      setFormError(firstIssue.message);
      // Mark all fields as touched to display field error messages
      setTouched({
        title: true,
        genre: true,
        price: true,
        hasAudio: true,
        hasCover: true,
        customEditions: true,
        startingBid: true,
        exclusiveTitle: true,
        exclusiveUrl: true,
      });
      return;
    }

    if (!isConnected || !address) {
      setFormError('TON wallet must be connected to list NFTs');
      connectWallet();
      return;
    }

    const royaltySplits: RoyaltySplitExtended[] = [
      {
        address: address,
        percentage: royaltyPercentage,
        label: 'Creator Royalty'
      }
    ];

    const params: MintNFTParams = {
      track: {
        id: initialTrack?.id || `track-${Date.now()}`,
        songId: `song-${Date.now()}`,
        title,
        artist: 'Current Artist',
        artistId: 'current-artist-id',
        coverUrl,
        audioUrl,
        duration: audioDuration || 180,
        genre,
        isNFT: true,
        createdAt: new Date().toISOString(),
      } as Track,
      title,
      genre,
      description,
      coverFile,
      audioFile,
      coverUrl,
      audioUrl,
      price: listingType === 'fixed' ? price : startingBid,
      editions: finalEditions,
      royaltySplits,
      hasExclusive,
      exclusiveTitle,
      exclusiveType,
      exclusiveUrl,
      exclusiveDescription,
      listingType,
      startingBid,
      auctionDuration
    };

    const nft = await mintTrackAsNFT(params);
    if (nft) {
      setCreatedNFT(nft);
      if (onSuccess) {
        onSuccess(nft);
      }
    }
  };

  // Format Seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // If successfully created NFT
  if (createdNFT) {
    return (
      <div className={`bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-6 ${className}`}>
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-white">Music NFT Listed Successfully!</h3>
          <p className="text-slate-400 text-sm mt-1">
            "{createdNFT.title}" is now minted on the TON Blockchain and available in the marketplace.
          </p>
        </div>

        {/* NFT Preview Card */}
        <div className="max-w-sm mx-auto bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 text-left flex gap-4 items-center">
          <img 
            src={createdNFT.imageUrl || createdNFT.coverUrl} 
            alt={createdNFT.title} 
            className="w-20 h-20 rounded-lg object-cover border border-slate-700" 
          />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded uppercase">
              {createdNFT.edition || '1/1'}
            </span>
            <h4 className="text-white font-bold truncate text-sm mt-1">{createdNFT.title}</h4>
            <p className="text-xs text-slate-400 truncate">{createdNFT.artist || 'Artist'}</p>
            <div className="flex items-center gap-1 mt-2 text-emerald-400 font-black text-xs">
              <Coins className="w-3.5 h-3.5" />
              <span>{createdNFT.price} TON</span>
            </div>
          </div>
        </div>

        {createdNFT.ipfsUrl && (
          <div className="bg-slate-950/60 p-3 rounded-lg flex items-center justify-between text-xs text-slate-400">
            <span className="truncate max-w-[240px]">IPFS CID: {createdNFT.ipfsUrl}</span>
            <a 
              href={createdNFT.ipfsUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold ml-2"
            >
              View <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => {
              setCreatedNFT(null);
              setTitle('');
              setDescription('');
              setAudioFile(null);
              setCoverFile(null);
              setAudioUrl('');
              setCoverUrl('');
            }}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> List Another Track
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs"
            >
              Done
            </button>
          )}
        </div>
      </div>
    );
  }

  // Active Minting Status
  const currentStatusKey = initialTrack?.id || 'track-temp';
  const activeStatus = mintingStatus[currentStatusKey];

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 text-left ${className}`}>
      {/* Wallet Banner Header */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">TON Wallet Status</h4>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </div>
            {isConnected && address ? (
              <p className="text-xs font-mono font-bold text-white mt-0.5">
                {address.slice(0, 6)}...{address.slice(-6)}
              </p>
            ) : (
              <p className="text-xs text-amber-400/90 font-medium mt-0.5">
                Wallet not connected. Connect TON wallet to list tracks.
              </p>
            )}
          </div>
        </div>

        {!isConnected && (
          <button
            type="button"
            onClick={connectWallet}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
          >
            <Wallet className="w-4 h-4" /> Connect Wallet
          </button>
        )}
      </div>

      {formError && (
        <div className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-xl flex items-center gap-3 text-red-400 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* 1. Media Upload Section (Audio & Cover) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Audio Upload */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-blue-400" /> Audio Track File *
            </span>
            {audioDuration > 0 && (
              <span className="text-[11px] font-mono text-slate-400">{formatTime(audioDuration)}</span>
            )}
          </label>

          <input 
            ref={audioInputRef} 
            type="file" 
            accept="audio/*" 
            onChange={handleAudioSelect} 
            className="hidden" 
          />

          <div
            onClick={() => {
              audioInputRef.current?.click();
              markTouched('hasAudio');
            }}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] ${
              audioUrl 
                ? 'border-blue-500/50 bg-blue-950/20' 
                : (touched.hasAudio || formError) && fieldErrors.hasAudio
                  ? 'border-red-500/70 bg-red-950/10'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
            }`}
          >
            {audioUrl ? (
              <div className="space-y-2 w-full">
                <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto">
                  <FileAudio className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-white truncate max-w-[200px] mx-auto">
                  {audioFile ? audioFile.name : 'Audio Selected'}
                </p>
                <audio controls src={audioUrl} className="w-full h-8 mt-2" onClick={(e) => e.stopPropagation()} />
                <p className="text-[10px] text-blue-400 font-bold hover:underline">Click to change file</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs font-bold text-slate-300">Upload Audio File</p>
                <p className="text-[10px] text-slate-500">MP3, WAV, FLAC, M4A (Max 50MB)</p>
              </div>
            )}
          </div>
          {(touched.hasAudio || formError) && fieldErrors.hasAudio && (
            <p className="text-[11px] text-red-400 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {fieldErrors.hasAudio}
            </p>
          )}
        </div>

        {/* Cover Artwork Upload */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-blue-400" /> Cover Artwork *
          </label>

          <input 
            ref={coverInputRef} 
            type="file" 
            accept="image/*" 
            onChange={handleCoverSelect} 
            className="hidden" 
          />

          <div
            onClick={() => {
              coverInputRef.current?.click();
              markTouched('hasCover');
            }}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] relative overflow-hidden ${
              coverUrl 
                ? 'border-blue-500/50 bg-blue-950/20' 
                : (touched.hasCover || formError) && fieldErrors.hasCover
                  ? 'border-red-500/70 bg-red-950/10'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
            }`}
          >
            {coverUrl ? (
              <div className="flex items-center gap-4 text-left w-full">
                <img src={coverUrl} alt="Cover Preview" className="w-20 h-20 rounded-lg object-cover border border-slate-700" />
                <div>
                  <p className="text-xs font-bold text-white">Cover Image Attached</p>
                  <p className="text-[10px] text-slate-400 mt-1">High resolution artwork pinned to IPFS gateway</p>
                  <span className="text-[11px] text-blue-400 font-bold hover:underline mt-2 inline-block">Change Image</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs font-bold text-slate-300">Upload Cover Artwork</p>
                <p className="text-[10px] text-slate-500">PNG, JPG, WEBP (Square 1:1 Recommended)</p>
              </div>
            )}
          </div>
          {(touched.hasCover || formError) && fieldErrors.hasCover && (
            <p className="text-[11px] text-red-400 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {fieldErrors.hasCover}
            </p>
          )}
        </div>
      </div>

      {/* 2. Basic Metadata Details */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> NFT Track Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Track Title *</label>
            <input
              type="text"
              placeholder="e.g. Midnight Cyber Symphony"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                markTouched('title');
              }}
              onBlur={() => markTouched('title')}
              className={`w-full bg-slate-950 border ${
                (touched.title || formError) && fieldErrors.title ? 'border-red-500/80 focus:border-red-500' : 'border-slate-800 focus:border-blue-500'
              } rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors`}
            />
            {(touched.title || formError) && fieldErrors.title && (
              <p className="text-[11px] text-red-400 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {fieldErrors.title}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Genre *</label>
            <select
              value={genre}
              onChange={(e) => {
                setGenre(e.target.value);
                markTouched('genre');
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              {GENRE_OPTIONS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">Description / Story</label>
          <textarea
            placeholder="Describe the track inspiration, production story, or exclusive benefits..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* 3. Editions & Royalty Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Edition Supply */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-400" /> Edition Supply
          </label>
          <div className="grid grid-cols-2 gap-2">
            {EDITION_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setEditionsOption(preset.value)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  editionsOption === preset.value
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          {editionsOption === 'custom' && (
            <div>
              <input
                type="number"
                min="1"
                max="10000"
                placeholder="Number of editions"
                value={customEditions}
                onChange={(e) => {
                  setCustomEditions(e.target.value);
                  markTouched('customEditions');
                }}
                className="w-full mt-2 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              {fieldErrors.customEditions && (
                <p className="text-[11px] text-red-400 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.customEditions}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Creator Royalty */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-400" /> Creator Royalty %
            </label>
            <span className="text-xs font-mono font-bold text-blue-400">{royaltyPercentage}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="25"
            step="0.5"
            value={royaltyPercentage}
            onChange={(e) => setRoyaltyPercentage(parseFloat(e.target.value))}
            className="w-full accent-blue-500 bg-slate-800 rounded-lg cursor-pointer h-2 mt-3"
          />
          <p className="text-[10px] text-slate-500">Secondary sales royalty paid directly to creator address.</p>
        </div>
      </div>

      {/* 4. Pricing & Listing Options */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5" /> Market Listing & Price (TON)
          </h3>

          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setListingType('fixed')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                listingType === 'fixed' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tag className="w-3 h-3" /> Fixed Price
            </button>
            <button
              type="button"
              onClick={() => setListingType('auction')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                listingType === 'auction' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gavel className="w-3 h-3" /> Timed Auction
            </button>
          </div>
        </div>

        {listingType === 'fixed' ? (
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Listing Price (TON) *</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="2.5"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  markTouched('price');
                }}
                onBlur={() => markTouched('price')}
                className={`w-full bg-slate-900 border ${
                  (touched.price || formError) && fieldErrors.price ? 'border-red-500/80' : 'border-slate-800 focus:border-emerald-500'
                } rounded-xl pl-3.5 pr-20 py-2.5 text-sm font-bold text-white placeholder-slate-600 focus:outline-none`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-400 border border-slate-700">
                <img src={TON_LOGO} alt="TON" className="w-3.5 h-3.5 object-contain" />
                <span>TON</span>
              </div>
            </div>
            {fieldErrors.price ? (
              <p className="text-[11px] text-red-400 font-medium mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {fieldErrors.price}
              </p>
            ) : estimatedUsdValue ? (
              <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                Approx. <span className="text-white font-bold">${estimatedUsdValue} USD</span> based on live market price.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Starting Bid (TON) *</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="1.0"
                  value={startingBid}
                  onChange={(e) => {
                    setStartingBid(e.target.value);
                    markTouched('startingBid');
                  }}
                  onBlur={() => markTouched('startingBid')}
                  className={`w-full bg-slate-900 border ${
                    (touched.startingBid || formError) && fieldErrors.startingBid ? 'border-red-500/80' : 'border-slate-800 focus:border-emerald-500'
                  } rounded-xl pl-3.5 pr-16 py-2.5 text-xs font-bold text-white focus:outline-none`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">TON</span>
              </div>
              {fieldErrors.startingBid && (
                <p className="text-[11px] text-red-400 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.startingBid}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Auction Duration</label>
              <select
                value={auctionDuration}
                onChange={(e) => setAuctionDuration(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="1">1 Day</option>
                <option value="3">3 Days</option>
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 5. Custom Attributes / Traits */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
          <span>NFT Traits & Metadata Attributes</span>
          <span className="text-[10px] text-slate-500">{traits.length} Attributes</span>
        </label>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Key (e.g. BPM)"
            value={newTraitKey}
            onChange={(e) => setNewTraitKey(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="Value (e.g. 128)"
            value={newTraitValue}
            onChange={(e) => setNewTraitValue(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={handleAddTrait}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {traits.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {traits.map((t, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">{t.trait_type}:</span>
                <span className="text-white font-bold">{t.value}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTrait(idx)}
                  className="text-slate-500 hover:text-red-400 transition-colors ml-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Exclusive Holder Perks */}
      <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400" />
            <div>
              <h4 className="text-xs font-bold text-white">Holder Exclusive Perk</h4>
              <p className="text-[10px] text-slate-400">Attach stems, private links, or high-res content for buyers</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={hasExclusive}
            onChange={(e) => setHasExclusive(e.target.checked)}
            className="w-4 h-4 rounded accent-purple-500 cursor-pointer"
          />
        </div>

        {hasExclusive && (
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Perk Title (e.g. Master Stems & Wav Pack)"
                  value={exclusiveTitle}
                  onChange={(e) => {
                    setExclusiveTitle(e.target.value);
                    markTouched('exclusiveTitle');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
                {fieldErrors.exclusiveTitle && (
                  <p className="text-[11px] text-red-400 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.exclusiveTitle}
                  </p>
                )}
              </div>
              <select
                value={exclusiveType}
                onChange={(e) => setExclusiveType(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="document">Document / Download</option>
                <option value="track">Bonus Audio Track</option>
                <option value="video">Exclusive Video</option>
                <option value="image">High-Res Artwork</option>
              </select>
            </div>
            <div>
              <input
                type="url"
                placeholder="Private Download / Drive / IPFS Link"
                value={exclusiveUrl}
                onChange={(e) => {
                  setExclusiveUrl(e.target.value);
                  markTouched('exclusiveUrl');
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
              {fieldErrors.exclusiveUrl && (
                <p className="text-[11px] text-red-400 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.exclusiveUrl}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Live Minting Pipeline Indicator */}
      {isMinting && activeStatus && (
        <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-4 space-y-3 animate-pulse">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-blue-400 uppercase tracking-wider">Minting & Listing Progress</span>
            <span className="font-mono text-white font-bold">{activeStatus.progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${activeStatus.progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-300 font-medium">{activeStatus.message}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isMinting}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!isFormValid || isMinting}
          title={!isFormValid ? 'Please fill out all required fields correctly' : ''}
          className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
        >
          {isMinting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Processing IPFS & TON...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Mint & List NFT ({listingType === 'fixed' ? `${price || '0'} TON` : `Auction`})</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ListNFTForm;
