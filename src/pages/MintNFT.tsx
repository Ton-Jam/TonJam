import React, { useState } from 'react';
import { BackButton } from '@/components/BackButton';
import { Hammer, FileAudio, CloudUpload, Image, Rocket, Check, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAudio } from '@/context/AudioContext';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { toNano } from '@ton/core';
import { NFTItem, Track, NFTTrait } from '@/types';
import { APP_LOGO } from '@/constants';
import { useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { uploadToIPFS, uploadJSONToIPFS } from '@/services/pinataService';
import { validateFile, ALLOWED_IMAGE_TYPES, ALLOWED_AUDIO_TYPES, ALLOWED_DOCUMENT_TYPES } from '@/lib/utils';

const mintSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  genre: z.string().min(1, 'Genre is required'),
  editionType: z.enum(['Unique', 'Limited', 'Standard']),
  rarity: z.string().optional(),
  lyrics: z.string().optional(),
  royaltySplits: z.array(z.object({
    address: z.string().min(1, 'Address is required'),
    percentage: z.number().min(0).max(100),
  })),
  supply: z.string().min(1, 'Supply is required'),
  price: z.string().min(1, 'Price is required'),
  audioFile: z.any().optional(),
  coverFile: z.any().optional(),
  audioPreview: z.string().min(1, 'Audio is required'),
  coverPreview: z.string().min(1, 'Cover art is required'),
  traits: z.array(z.object({
    trait_type: z.string().min(1, 'Trait type is required'),
    value: z.union([z.string(), z.number()]),
  })),
  exclusiveContent: z.array(z.object({
    title: z.string().min(1, 'Title is required'),
    type: z.enum(['video', 'track', 'image', 'document']),
    url: z.string().min(1, 'URL is required'),
  })),
});

type MintFormData = z.infer<typeof mintSchema>;

const MintNFT: React.FC = () => {
  const { addNotification, addUserNFT, addUserTrack, userProfile } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const navigate = useNavigate();
  const location = useLocation();
  const track = location.state?.track as Track | undefined;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
    reset,
  } = useForm<MintFormData>({
    resolver: zodResolver(mintSchema),
    defaultValues: {
      title: track?.title || '',
      description: track?.description || '',
      genre: track?.genre || 'Electronic',
      editionType: (track?.editionType as any) || 'Standard',
      rarity: track?.rarity || 'Common',
      lyrics: track?.lyrics || '',
      royaltySplits: track?.royaltySplits || [{ address: userAddress || '', percentage: 100 }],
      supply: track?.editions || '100',
      price: track?.price || '5',
      audioPreview: track?.audioUrl || '',
      coverPreview: track?.coverUrl || '',
      traits: [
        { trait_type: 'Genre', value: track?.genre || 'Electronic' },
        { trait_type: 'BPM', value: track?.bpm || 128 },
        { trait_type: 'Key', value: track?.key || 'Am' },
        { trait_type: 'Rarity', value: 'Common' }
      ],
      exclusiveContent: []
    },
  });

  const { fields: royaltyFields, append: appendRoyalty, remove: removeRoyalty } = useFieldArray({ control, name: 'royaltySplits' });
  const { fields: traitFields, append: appendTrait, remove: removeTrait } = useFieldArray({ control, name: 'traits' });
  const { fields: exclusiveFields, append: appendExclusive, remove: removeExclusive } = useFieldArray({ control, name: 'exclusiveContent' });

  const mintData = watch();
  const totalRoyaltyPercentage = mintData.royaltySplits.reduce((sum, split) => sum + split.percentage, 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'cover' | 'lyrics') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'lyrics') {
        const validation = validateFile(file, 'document', 2); // 2MB max for lyrics
        if (!validation.isValid) {
          addNotification(validation.error || "Invalid file", "error");
          e.target.value = '';
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          setValue('lyrics', event.target?.result as string);
        };
        reader.readAsText(file);
        return;
      }

      if (type === 'audio') {
        const validation = validateFile(file, 'audio', 50); // 50MB max for audio
        if (!validation.isValid) {
          addNotification(validation.error || "Invalid file", "error");
          e.target.value = '';
          return;
        }
      } else if (type === 'cover') {
        const validation = validateFile(file, 'image', 10); // 10MB max for images
        if (!validation.isValid) {
          addNotification(validation.error || "Invalid file", "error");
          e.target.value = '';
          return;
        }
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'audio') {
          setValue('audioFile', file);
          setValue('audioPreview', reader.result as string);
        } else {
          setValue('coverFile', file);
          setValue('coverPreview', reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddRoyaltySplit = () => appendRoyalty({ address: '', percentage: 0 });
  const handleRemoveRoyaltySplit = (index: number) => removeRoyalty(index);

  const handleAddTrait = () => appendTrait({ trait_type: '', value: '' });
  const handleRemoveTrait = (index: number) => removeTrait(index);

  const handleAddExclusive = () => appendExclusive({ title: '', type: 'video', url: '' });
  const handleRemoveExclusive = (index: number) => removeExclusive(index);

  const handleMint = async (data: MintFormData) => {
    if (!userAddress) {
      addNotification("Please connect your wallet to mint", "warning");
      tonConnectUI.openModal();
      return;
    }
    setLoading(true);
    try {
      // 1. Upload files to IPFS if they are new
      let audioUrl = data.audioPreview;
      let coverUrl = data.coverPreview;

      if (data.audioFile instanceof File) {
        addNotification("Uploading audio to IPFS...", "info");
        const audioRes = await uploadToIPFS(data.audioFile);
        if (!audioRes?.ipfsUrl) {
          throw new Error("Audio upload failed: IPFS URL missing from response");
        }
        audioUrl = audioRes.ipfsUrl;
      }

      if (data.coverFile instanceof File) {
        addNotification("Uploading cover art to IPFS...", "info");
        const coverRes = await uploadToIPFS(data.coverFile);
        if (!coverRes?.ipfsUrl) {
          throw new Error("Cover art upload failed: IPFS URL missing from response");
        }
        coverUrl = coverRes.ipfsUrl;
      }

      // 2. Prepare Metadata for IPFS
      const metadata = {
        name: data.title,
        description: data.description,
        image: coverUrl,
        audio: audioUrl,
        attributes: data.traits,
        royalty_splits: data.royaltySplits,
        exclusive_content: data.exclusiveContent
      };

      addNotification("Uploading metadata to IPFS...", "info");
      const metadataRes = await uploadJSONToIPFS(metadata);
      if (!metadataRes?.ipfsUrl) {
        throw new Error("Metadata upload failed: IPFS URL missing from response");
      }
      const ipfsUrl = metadataRes.ipfsUrl;

      // 3. Real TON transaction for minting fee
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 120,
        messages: [
          {
            address: "EQB_PLATFORM_WALLET_ADDRESS", // Platform wallet for fees
            amount: toNano("0.06").toString(), // Total Protocol Cost (0.05 + 0.01)
            payload: ipfsUrl // Optionally pass metadata URL in payload
          },
        ],
      };
      
      await tonConnectUI.sendTransaction(transaction);

      const newNFT: NFTItem = {
        id: `nft-${Date.now()}`,
        trackId: track ? track.id : `track-nft-${Date.now()}`,
        title: data.title,
        owner: userProfile.walletAddress || userProfile.id,
        creator: userProfile.name,
        artist: userProfile.name,
        artistId: userProfile.id,
        imageUrl: coverUrl,
        coverUrl: coverUrl,
        price: data.price,
        edition: data.editionType,
        supply: parseInt(data.supply),
        minted: 1,
        description: data.description || '',
        audioUrl: audioUrl,
        ipfsUrl: ipfsUrl,
        isAuction: false,
        attributes: [
          ...data.traits,
          { trait_type: 'Edition Type', value: data.editionType },
          { trait_type: 'Rarity', value: data.rarity || 'Common' }
        ] as NFTTrait[],
        royaltySplits: data.royaltySplits,
        exclusiveContent: data.exclusiveContent.filter(e => e.title && e.url).map(e => ({
          ...e,
          id: `ex-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }))
      };
      
      if (track) {
        // Update existing track
        const updatedTrack = { ...track, isNFT: true, price: data.price, genre: data.genre, lyrics: data.lyrics };
        await addUserTrack(updatedTrack);
      } else {
        const newTrack: Track = {
          id: newNFT.trackId,
          title: data.title,
          artist: userProfile.name,
          artistId: userProfile.id,
          coverUrl: newNFT.imageUrl,
          audioUrl: newNFT.audioUrl || '',
          duration: 180,
          playCount: 0,
          streams: 0,
          likes: 0,
          genre: data.genre,
          lyrics: data.lyrics,
          isNFT: true
        };
        await addUserTrack(newTrack);
      }
      
      await addUserNFT(newNFT);
      addNotification("NFT Protocol successfully deployed to TON", "success");
      setStep(4);
    } catch (err) {
      console.error("Minting failed:", err);
      addNotification("Protocol deployment failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-4 lg:px-4 py-4 sm:py-4 animate-in fade-in duration-1000">
      {/* COMPACT MARKET TICKER */}
      <div className="sticky top-[var(--header-height,64px)] z-[38] bg-background/90 backdrop-blur-xl py-4 px-4 flex items-center justify-center overflow-hidden whitespace-nowrap transition-all duration-300 mb-4 rounded-[10px] border border-neutral-500/10">
        <div className="flex gap-4 animate-[marquee_40s_linear_infinite]">
          {[
            { label: 'TON/USD', val: '$5.42', up: true },
            { label: 'MARKET CAP', val: '24.2M TON', up: true },
            { label: 'AVG FLOOR', val: '4.8 TON', up: false },
            { label: 'NET VOLUME', val: '1.2M TON', up: true },
            { label: 'ACTIVE BIDS', val: '1,242', up: true },
            { label: 'NODES', val: '8,421', up: true },
            { label: 'TON/USD', val: '$5.42', up: true },
            { label: 'MARKET CAP', val: '24.2M TON', up: true },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-[7px] font-bold uppercase text-blue-500/50 tracking-[0.2em]">{stat.label}</span>
              <span className="text-[9px] font-bold text-foreground tracking-tighter font-mono bg-muted/50 px-4 py-4 rounded-[4px]">{stat.val}</span>
              <TrendingUp className={`h-3 w-3 ${stat.up ? 'text-emerald-500' : 'text-rose-500 rotate-180'}`} />
            </div>
          ))}
        </div>
      </div>

      <div className="w-full">
        <div className="px-4 sm:px-4 py-4 sm:py-4 mb-4 sm:mb-4">
          <BackButton 
            className="flex items-center gap-4 text-muted-foreground hover:text-foreground transition-colors group"
            iconClassName="w-4 h-4 group-hover:-translate-x-1 transition-transform"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">Back</span>
          </BackButton>
        </div>

        <div className="relative glass border-y sm:border border-neutral-500/10 w-full sm:rounded-[10px] p-4 sm:p-4 shadow-2xl flex flex-col overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-[10px] flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
              <Hammer className="h-6 w-6 sm:h-8 sm:w-8 text-foreground" />
            </div>
            <div>
              <h1 className="text-[20px] sm:text-[26px] font-bold uppercase tracking-tighter text-foreground leading-tight">Protocol Forge</h1>
              <p className="text-[10px] sm:text-xs font-bold text-muted-foreground/50 uppercase tracking-widest mt-4">Mint your sonic artifacts on TON</p>
            </div>
          </div>

          <div className="relative z-10">
            {step === 1 && (
            <div className="space-y-4 sm:space-y-4 animate-in slide-in-from-right duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4">
                <div className="space-y-4 sm:space-y-4">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-4">Artifact Title</label>
                    <input {...register('title')} className="w-full bg-muted/50 rounded-[8px] py-4 px-4 text-xs outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all text-foreground" placeholder="Enter track title..." />
                    {errors.title && <p className="text-[10px] text-red-500 mt-4">{errors.title.message}</p>}
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-4">Genre</label>
                    <select {...register('genre')} className="w-full bg-muted/50 rounded-[8px] py-4 px-4 text-xs outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all text-foreground">
                      <option value="Electronic">Electronic</option>
                      <option value="Hip Hop">Hip Hop</option>
                      <option value="Pop">Pop</option>
                      <option value="Rock">Rock</option>
                      <option value="Jazz">Jazz</option>
                      <option value="Classical">Classical</option>
                      <option value="Ambient">Ambient</option>
                      <option value="Techno">Techno</option>
                      <option value="House">House</option>
                      <option value="Phonk">Phonk</option>
                    </select>
                    {errors.genre && <p className="text-[10px] text-red-500 mt-4">{errors.genre.message}</p>}
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-4">Sonic Data (Audio)</label>
                    <div className="relative group">
                      <input type="file" accept={ALLOWED_AUDIO_TYPES.join(',')} onChange={(e) => handleFileChange(e, 'audio')} className="hidden" id="audio-upload" />
                      <label htmlFor="audio-upload" className="flex flex-col items-center justify-center w-full h-28 sm:h-32 bg-muted/50 hover:bg-muted rounded-[8px] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { document.getElementById('audio-upload')?.click(); e.preventDefault(); } }} aria-label="Upload Audio">
                        {mintData.audioPreview ? (
                          <div className="text-center">
                            <FileAudio className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mb-4 mx-auto" />
                            <p className="text-[10px] sm:text-xs font-bold text-foreground uppercase truncate px-4">Audio Loaded</p>
                          </div>
                        ) : (
                          <>
                            <CloudUpload className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/50 mb-4" />
                            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Upload Audio</p>
                          </>
                        )}
                      </label>
                    </div>
                    {errors.audioPreview && <p className="text-[10px] text-red-500 mt-4">{errors.audioPreview.message}</p>}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-4">Visual Matrix (Cover Art)</label>
                  <div className="relative group h-full">
                    <input type="file" accept={ALLOWED_IMAGE_TYPES.join(',')} onChange={(e) => handleFileChange(e, 'cover')} className="hidden" id="cover-upload" />
                    <label htmlFor="cover-upload" className="flex flex-col items-center justify-center w-full h-full min-h-[160px] sm:min-h-[200px] bg-muted/50 hover:bg-muted rounded-[8px] transition-all cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { document.getElementById('cover-upload')?.click(); e.preventDefault(); } }} aria-label="Upload Cover Art">
                      {mintData.coverPreview ? (
                        <img src={mintData.coverPreview} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                      ) : (
                        <>
                          <Image className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/50 mb-4" />
                          <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Upload Cover</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
              <button onClick={() => setStep(2)} disabled={!mintData.title || !mintData.audioPreview || !mintData.genre} className="w-full py-4 sm:py-4 bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-foreground rounded-[8px] font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" > INITIALIZE_METADATA_SEQUENCE </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 sm:space-y-4 animate-in slide-in-from-right duration-300">
              <div className="space-y-4 sm:space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4">AI-Generated Artifact Lore</label>
                  </div>
                  <div className="relative">
                    <textarea {...register('description')} rows={5} className="w-full bg-muted/50 rounded-[10px] py-4 px-4 sm:py-4 sm:px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all text-muted-foreground/90 leading-relaxed resize-none" aria-label="AI-Generated Artifact Lore" />
                    {loading && (
                      <div className="absolute inset-0 bg-background/40 backdrop-blur-sm rounded-[10px] flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                          <img src={APP_LOGO} className="w-10 h-10 object-contain animate-[spin_3s_linear_infinite] opacity-80" alt="Loading..." referrerPolicy="no-referrer" />
                          <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">AI Lore Generation...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4">Lyrics / Poetry</label>
                    <div className="flex items-center gap-4">
                      <input type="file" accept=".txt,.lrc,text/plain" onChange={(e) => handleFileChange(e, 'lyrics')} className="hidden" id="lyrics-upload" />
                      <label htmlFor="lyrics-upload" className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors cursor-pointer">
                        Upload File
                      </label>
                    </div>
                  </div>
                  <textarea {...register('lyrics')} rows={4} className="w-full bg-muted/50 rounded-[10px] py-4 px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all text-foreground resize-none" placeholder="Enter lyrics or upload a file..." />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4">
                  <div className="space-y-4">
                    <label className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4">Mint Price (TON)</label>
                    <input {...register('price')} type="number" className="w-full bg-muted/50 rounded-[10px] py-4 px-4 sm:py-4 sm:px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all text-foreground" aria-label="Mint Price (TON)" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4">Edition Type</label>
                    <select {...register('editionType')} className="w-full bg-muted/50 rounded-[10px] py-4 px-4 sm:py-4 sm:px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all text-foreground">
                      <option value="Standard">Standard</option>
                      <option value="Limited">Limited</option>
                      <option value="Unique">Unique (1/1)</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4">Rarity Label/Score</label>
                    <input {...register('rarity')} placeholder="e.g. Legendary, 99/100" className="w-full bg-muted/50 rounded-[10px] py-4 px-4 sm:py-4 sm:px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all text-foreground" />
                  </div>
                  <div className="space-y-4 sm:space-y-4 col-span-1 sm:col-span-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4">Royalty Splits (%)</label>
                      <button onClick={handleAddRoyaltySplit} className="text-[10px] sm:text-xs font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors flex items-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm" aria-label="Add Royalty Recipient">
                        <Plus className="h-4 w-4" /> Add Recipient
                      </button>
                    </div>
                    <div className="space-y-4 sm:space-y-4">
                      {royaltyFields.map((field, index) => (
                        <div key={field.id} className="flex gap-4 sm:gap-4 items-center">
                          <input 
                            {...register(`royaltySplits.${index}.address`)}
                            type="text" 
                            placeholder="Wallet Address" 
                            className="flex-1 bg-muted/50 rounded-[10px] py-4 px-4 sm:px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all text-foreground"
                            aria-label={`Royalty recipient address ${index + 1}`}
                          />
                          <input 
                            {...register(`royaltySplits.${index}.percentage`, { valueAsNumber: true })}
                            type="number" 
                            placeholder="%" 
                            className="w-20 sm:w-24 bg-muted/50 rounded-[10px] py-4 px-4 sm:px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all text-foreground"
                            aria-label={`Royalty recipient percentage ${index + 1}`}
                          />
                          <button onClick={() => removeRoyalty(index)} className="p-4 sm:p-4 text-muted-foreground/50 hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm" aria-label={`Remove royalty recipient ${index + 1}`}>
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                      <div className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">
                        Total: {totalRoyaltyPercentage}%
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4">Supply</label>
                    <input {...register('supply')} type="number" className="w-full bg-muted/50 rounded-[10px] py-4 px-4 sm:py-4 sm:px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all text-foreground" aria-label="Supply" />
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4">Custom Properties (Traits)</label>
                    <button onClick={handleAddTrait} className="text-[10px] sm:text-xs font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors flex items-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm" aria-label="Add Trait">
                      <Plus className="h-4 w-4" /> Add Trait
                    </button>
                  </div>
                  <div className="space-y-4 sm:space-y-4 max-h-48 sm:max-h-64 overflow-y-auto pr-4 no-scrollbar">
                    {traitFields.map((field, index) => (
                      <div key={field.id} className="flex gap-4 sm:gap-4 items-center">
                        <input 
                          {...register(`traits.${index}.trait_type`)}
                          placeholder="Type (e.g. Genre)" 
                          className="flex-1 bg-muted/50 rounded-[10px] py-4 px-4 sm:px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all text-foreground"
                          aria-label={`Trait type ${index + 1}`}
                        />
                        <input 
                          {...register(`traits.${index}.value`)}
                          placeholder="Value (e.g. Electronic)" 
                          className="flex-1 bg-muted/50 rounded-[10px] py-4 px-4 sm:px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all text-foreground"
                          aria-label={`Trait value ${index + 1}`}
                        />
                        <button onClick={() => removeTrait(index)} className="p-4 sm:p-4 text-muted-foreground/50 hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm" aria-label={`Remove trait ${index + 1}`}>
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    {traitFields.length === 0 && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground/50 uppercase tracking-widest text-center py-4">No custom traits added</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4">Exclusive Holder Content (Perks)</label>
                    <button onClick={handleAddExclusive} className="text-[10px] sm:text-xs font-bold text-purple-500 uppercase tracking-widest hover:text-purple-400 transition-colors flex items-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm" aria-label="Add Perk">
                      <Plus className="h-4 w-4" /> Add Perk
                    </button>
                  </div>
                  <div className="space-y-4 sm:space-y-4 max-h-48 sm:max-h-64 overflow-y-auto pr-4 no-scrollbar">
                    {exclusiveFields.map((field, index) => (
                      <div key={field.id} className="flex gap-4 sm:gap-4 items-center bg-muted/50 p-4 sm:p-4 rounded-[10px] border border-border/50">
                        <div className="flex-1 space-y-4 sm:space-y-4">
                          <input 
                            {...register(`exclusiveContent.${index}.title`)}
                            placeholder="Perk Title (e.g. BTS Video)" 
                            className="w-full bg-background/20 rounded-[8px] py-4 px-4 text-xs outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all text-foreground"
                            aria-label={`Perk title ${index + 1}`}
                          />
                          <div className="flex flex-col sm:flex-row gap-4 sm:gap-4">
                            <select 
                              {...register(`exclusiveContent.${index}.type`)}
                              className="bg-background/20 rounded-[8px] py-4 px-4 text-xs outline-none text-muted-foreground/80 focus-visible:ring-2 focus-visible:ring-blue-500"
                              aria-label={`Perk type ${index + 1}`}
                            >
                              <option value="video">Video</option>
                              <option value="track">Audio</option>
                              <option value="image">Image</option>
                              <option value="document">PDF</option>
                            </select>
                            <input 
                              {...register(`exclusiveContent.${index}.url`)}
                              placeholder="URL (IPFS or CDN)" 
                              className="flex-1 bg-background/20 rounded-[8px] py-4 px-4 text-xs outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all text-foreground"
                              aria-label={`Perk URL ${index + 1}`}
                            />
                          </div>
                        </div>
                        <button onClick={() => removeExclusive(index)} className="p-4 sm:p-4 text-muted-foreground/50 hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm" aria-label={`Remove perk ${index + 1}`}>
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    {exclusiveFields.length === 0 && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground/30 uppercase tracking-widest text-center py-4">No exclusive content added</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 sm:gap-4 pt-4 sm:pt-4">
                <button onClick={() => setStep(1)} className="w-1/3 py-4 sm:py-4 bg-muted/50 text-foreground rounded-[8px] font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] hover:bg-muted transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" > BACK </button>
                <button onClick={() => setStep(3)} className="w-2/3 py-4 sm:py-4 bg-blue-600 text-foreground rounded-[8px] font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" > REVIEW_PROTOCOL_DEPLOYMENT </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 sm:space-y-4 animate-in slide-in-from-right duration-300">
              <div className="bg-muted/50 rounded-[10px] p-4 sm:p-4 space-y-4 sm:space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-4">
                  <img src={mintData.coverPreview} className="w-24 h-24 sm:w-32 sm:h-32 rounded-[10px] object-cover shadow-xl shrink-0" alt="" referrerPolicy="no-referrer" />
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-[20px] font-bold text-foreground uppercase tracking-tighter mb-4">{mintData.title}</h3>
                    <p className="text-[10px] sm:text-xs font-bold text-blue-500 uppercase tracking-widest mb-4">By {userProfile.name}</p>
                    <div className="flex flex-wrap gap-4 sm:gap-4">
                      <div className="bg-background/30 px-4 sm:px-4 py-4 rounded-full">
                        <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-4">Price:</span>
                        <span className="text-[10px] sm:text-xs font-bold text-foreground">{mintData.price} TON</span>
                      </div>
                      <div className="bg-background/30 px-4 sm:px-4 py-4 rounded-full">
                        <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-4">Supply:</span>
                        <span className="text-[10px] sm:text-xs font-bold text-foreground">{mintData.supply}</span>
                      </div>
                      <div className="bg-background/30 px-4 sm:px-4 py-4 rounded-full">
                        <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-4">Edition:</span>
                        <span className="text-[10px] sm:text-xs font-bold text-foreground">{mintData.editionType}</span>
                      </div>
                      <div className="bg-background/30 px-4 sm:px-4 py-4 rounded-full">
                        <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-4">Rarity:</span>
                        <span className="text-[10px] sm:text-xs font-bold text-foreground">{mintData.rarity}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-px bg-muted/50"></div>
                <div className="space-y-4 sm:space-y-4">
                  <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Deployment Fees</p>
                  <div className="flex justify-between text-xs sm:text-sm font-bold">
                    <span className="text-muted-foreground/80">Minting Fee</span>
                    <span className="text-foreground">0.05 TON</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm font-bold">
                    <span className="text-muted-foreground/80">Storage Fee (IPFS)</span>
                    <span className="text-foreground">0.01 TON</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm font-bold pt-4 sm:pt-4">
                    <span className="text-blue-500">Total Protocol Cost</span>
                    <span className="text-blue-500">0.06 TON</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 sm:gap-4 pt-4 sm:pt-4">
                <button onClick={() => setStep(2)} className="w-1/3 py-4 sm:py-4 bg-muted/50 text-foreground rounded-[8px] font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] hover:bg-muted transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" > BACK </button>
                <button onClick={handleMint} disabled={loading} className="w-2/3 py-4 sm:py-4 bg-green-600 text-foreground rounded-[8px] font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] shadow-lg shadow-green-600/20 hover:bg-green-500 transition-all flex items-center justify-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" >
                  {loading ? (
                    <>
                      <img src={APP_LOGO} className="w-4 h-4 sm:w-5 sm:h-5 object-contain animate-[spin_3s_linear_infinite] opacity-80 mr-4 inline-block" alt="Loading..." referrerPolicy="no-referrer" /> DEPLOYING_PROTOCOL...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4 sm:h-5 sm:w-5 mr-4 inline-block" /> CONFIRM_MINT_ON_TON
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-4 sm:py-4 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-green-500/20">
                <Check className="h-10 w-10 sm:h-12 sm:w-12 text-green-500" />
              </div>
              <h2 className="text-[26px] sm:text-[32px] font-bold text-foreground uppercase tracking-tighter mb-4">Protocol Deployed</h2>
              <p className="text-muted-foreground/80 text-sm sm:text-base max-w-md mx-auto mb-4 leading-relaxed px-4"> Your sonic artifact has been successfully minted and registered on the TON blockchain. </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => navigate('/profile')} className="w-full sm:w-auto px-4 py-4 bg-blue-600 text-foreground rounded-[10px] font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" > VIEW_IN_COLLECTION </button>
                <button onClick={() => { setStep(1); reset(); }} className="w-full sm:w-auto px-4 py-4 bg-muted/50 text-foreground rounded-[10px] font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] hover:bg-muted transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" > MINT_ANOTHER_ARTIFACT </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MintNFT;
