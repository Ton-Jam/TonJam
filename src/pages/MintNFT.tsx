import React, { useState } from 'react';
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

const mintSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  royaltySplits: z.array(z.object({
    address: z.string().min(1, 'Address is required'),
    percentage: z.number().min(0).max(100),
  })),
  supply: z.string().min(1, 'Supply is required'),
  price: z.string().min(1, 'Price is required'),
  audioFile: z.any().optional(),
  coverFile: z.any().optional(),
  audioPreview: z.string().optional(),
  coverPreview: z.string().optional(),
  traits: z.array(z.object({
    trait_type: z.string().min(1, 'Trait type is required'),
    value: z.union([z.string(), z.number()]),
  }).required()),
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
      description: '',
      royaltySplits: [{ address: userAddress || '', percentage: 100 }],
      supply: '100',
      price: '5',
      audioPreview: track?.audioUrl || '',
      coverPreview: track?.coverUrl || '',
      traits: [
        { trait_type: 'Genre', value: track?.genre || 'Electronic' },
        { trait_type: 'Rarity', value: 'Common' }
      ],
      exclusiveContent: []
    },
  });

  const { fields: royaltyFields, append: appendRoyalty, remove: removeRoyalty, update: updateRoyalty } = useFieldArray({ control, name: 'royaltySplits' });
  const { fields: traitFields, append: appendTrait, remove: removeTrait, update: updateTrait } = useFieldArray({ control, name: 'traits' });
  const { fields: exclusiveFields, append: appendExclusive, remove: removeExclusive, update: updateExclusive } = useFieldArray({ control, name: 'exclusiveContent' });

  const mintData = watch();
  const totalRoyaltyPercentage = mintData.royaltySplits.reduce((sum, split) => sum + split.percentage, 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
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
  const handleUpdateRoyaltySplit = (index: number, field: 'address' | 'percentage', value: string | number) => {
    const current = royaltyFields[index];
    updateRoyalty(index, { ...current, [field]: field === 'percentage' ? Number(value) : value });
  };
  const handleRemoveRoyaltySplit = (index: number) => removeRoyalty(index);

  const handleAddTrait = () => appendTrait({ trait_type: '', value: '' });
  const handleUpdateTrait = (index: number, field: 'trait_type' | 'value', value: string) => {
    const current = traitFields[index];
    updateTrait(index, { ...current, [field]: value });
  };
  const handleRemoveTrait = (index: number) => removeTrait(index);

  const handleAddExclusive = () => appendExclusive({ title: '', type: 'video', url: '' });
  const handleUpdateExclusive = (index: number, field: 'title' | 'type' | 'url', value: string) => {
    const current = exclusiveFields[index];
    updateExclusive(index, { ...current, [field]: value });
  };
  const handleRemoveExclusive = (index: number) => removeExclusive(index);

  const handleMint = async (data: MintFormData) => {
    if (!userAddress) {
      addNotification("Please connect your wallet to mint", "warning");
      tonConnectUI.openModal();
      return;
    }
    setLoading(true);
    try {
      /* Real TON transaction for minting fee */
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 120,
        messages: [
          {
            address: "EQB_PLATFORM_WALLET_ADDRESS", // Platform wallet for fees
            amount: toNano("0.06").toString(), // Total Protocol Cost (0.05 + 0.01)
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
        imageUrl: data.coverPreview || 'https://picsum.photos/seed/tonjam-nft/500/500',
        coverUrl: data.coverPreview || 'https://picsum.photos/seed/tonjam-nft/500/500',
        price: data.price,
        edition: 'Genesis',
        supply: parseInt(data.supply),
        minted: 1,
        description: data.description || '',
        audioUrl: data.audioPreview || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        isAuction: false,
        attributes: data.traits as unknown as NFTTrait[],
        royaltySplits: data.royaltySplits,
        exclusiveContent: data.exclusiveContent.filter(e => e.title && e.url).map(e => ({
          ...e,
          id: `ex-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }))
      };
      
      if (track) {
        // Update existing track
        const updatedTrack = { ...track, isNFT: true, price: data.price };
        addUserTrack(updatedTrack);
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
          genre: 'Electronic',
          isNFT: true
        };
        addUserTrack(newTrack);
      }
      
      addUserNFT(newNFT);
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
    <div className="w-full px-0 sm:px-6 lg:px-10 py-0 sm:py-8 animate-in fade-in duration-1000">
      <div className="w-full">
        <div className="px-6 sm:px-0 py-6 sm:py-0 mb-2 sm:mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Back</span>
          </button>
        </div>

        <div className="relative glass border-y sm:border border-blue-500/10 w-full sm:rounded-[10px] p-6 sm:p-10 shadow-2xl flex flex-col overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-[10px] flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
              <Hammer className="h-6 w-6 sm:h-8 sm:w-8 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tighter text-foreground leading-tight">Protocol Forge</h1>
              <p className="text-[10px] sm:text-xs font-bold text-muted-foreground/50 uppercase tracking-widest mt-1">Mint your sonic artifacts on TON</p>
            </div>
          </div>

          <div className="relative z-10">
            {step === 1 && (
            <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-right duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-5 sm:space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Artifact Title</label>
                    <input {...register('title')} className="w-full bg-muted/50 rounded-[8px] py-3 px-4 text-xs outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all text-foreground" placeholder="Enter track title..." />
                    {errors.title && <p className="text-[10px] text-red-500 mt-1">{errors.title.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Sonic Data (Audio)</label>
                    <div className="relative group">
                      <input type="file" accept="audio/*" onChange={(e) => handleFileChange(e, 'audio')} className="hidden" id="audio-upload" />
                      <label htmlFor="audio-upload" className="flex flex-col items-center justify-center w-full h-28 sm:h-32 bg-muted/50 hover:bg-muted rounded-[8px] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { document.getElementById('audio-upload')?.click(); e.preventDefault(); } }} aria-label="Upload Audio">
                        {mintData.audioPreview ? (
                          <div className="text-center">
                            <FileAudio className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mb-2 mx-auto" />
                            <p className="text-[10px] sm:text-xs font-bold text-foreground uppercase truncate px-4">Audio Loaded</p>
                          </div>
                        ) : (
                          <>
                            <CloudUpload className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/50 mb-2" />
                            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Upload Audio</p>
                          </>
                        )}
                      </label>
                    </div>
                    {errors.audioPreview && <p className="text-[10px] text-red-500 mt-1">{errors.audioPreview.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Visual Matrix (Cover Art)</label>
                  <div className="relative group h-full">
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} className="hidden" id="cover-upload" />
                    <label htmlFor="cover-upload" className="flex flex-col items-center justify-center w-full h-full min-h-[160px] sm:min-h-[200px] bg-muted/50 hover:bg-muted rounded-[8px] transition-all cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { document.getElementById('cover-upload')?.click(); e.preventDefault(); } }} aria-label="Upload Cover Art">
                      {mintData.coverPreview ? (
                        <img src={mintData.coverPreview} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                      ) : (
                        <>
                          <Image className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/50 mb-2" />
                          <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Upload Cover</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
              <button onClick={() => setStep(2)} disabled={!mintData.title || !mintData.audioPreview} className="w-full py-4 sm:py-5 bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-foreground rounded-[8px] font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" > INITIALIZE_METADATA_SEQUENCE </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-right duration-300">
              <div className="space-y-6 sm:space-y-8">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">AI-Generated Artifact Lore</label>
                  </div>
                  <div className="relative">
                    <textarea {...register('description')} rows={5} className="w-full bg-muted/50 rounded-[10px] py-4 px-5 sm:py-5 sm:px-6 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all text-muted-foreground/90 leading-relaxed resize-none" aria-label="AI-Generated Artifact Lore" />
                    {loading && (
                      <div className="absolute inset-0 bg-background/40 backdrop-blur-sm rounded-[10px] flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                          <img src={APP_LOGO} className="w-10 h-10 object-contain animate-[spin_3s_linear_infinite] opacity-80" alt="Loading..." referrerPolicy="no-referrer" />
                          <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">AI Lore Generation...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Mint Price (TON)</label>
                    <input {...register('price')} type="number" className="w-full bg-muted/50 rounded-[10px] py-3 px-4 sm:py-4 sm:px-5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all text-foreground" aria-label="Mint Price (TON)" />
                  </div>
                  <div className="space-y-4 sm:space-y-5 col-span-1 sm:col-span-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Royalty Splits (%)</label>
                      <button onClick={handleAddRoyaltySplit} className="text-[10px] sm:text-xs font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm" aria-label="Add Royalty Recipient">
                        <Plus className="h-4 w-4" /> Add Recipient
                      </button>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      {royaltyFields.map((field, index) => (
                        <div key={field.id} className="flex gap-3 sm:gap-4 items-center">
                          <input 
                            {...register(`royaltySplits.${index}.address`)}
                            type="text" 
                            placeholder="Wallet Address" 
                            className="flex-1 bg-muted/50 rounded-[10px] py-3 px-4 sm:px-5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all text-foreground"
                            aria-label={`Royalty recipient address ${index + 1}`}
                          />
                          <input 
                            {...register(`royaltySplits.${index}.percentage`, { valueAsNumber: true })}
                            type="number" 
                            placeholder="%" 
                            className="w-20 sm:w-24 bg-muted/50 rounded-[10px] py-3 px-4 sm:px-5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all text-foreground"
                            aria-label={`Royalty recipient percentage ${index + 1}`}
                          />
                          <button onClick={() => removeRoyalty(index)} className="p-2 sm:p-3 text-muted-foreground/50 hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm" aria-label={`Remove royalty recipient ${index + 1}`}>
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                      <div className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">
                        Total: {totalRoyaltyPercentage}%
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Supply</label>
                    <input {...register('supply')} type="number" className="w-full bg-muted/50 rounded-[10px] py-3 px-4 sm:py-4 sm:px-5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all text-foreground" aria-label="Supply" />
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Custom Properties (Traits)</label>
                    <button onClick={handleAddTrait} className="text-[10px] sm:text-xs font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm" aria-label="Add Trait">
                      <Plus className="h-4 w-4" /> Add Trait
                    </button>
                  </div>
                  <div className="space-y-3 sm:space-y-4 max-h-48 sm:max-h-64 overflow-y-auto pr-2 no-scrollbar">
                    {mintData.traits.map((trait, index) => (
                      <div key={index} className="flex gap-3 sm:gap-4 items-center">
                        <input 
                          type="text" 
                          placeholder="Type (e.g. Genre)" 
                          value={trait.trait_type}
                          onChange={(e) => handleUpdateTrait(index, 'trait_type', e.target.value)}
                          className="flex-1 bg-muted/50 rounded-[10px] py-3 px-4 sm:px-5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all text-foreground"
                          aria-label={`Trait type ${index + 1}`}
                        />
                        <input 
                          type="text" 
                          placeholder="Value (e.g. Electronic)" 
                          value={trait.value}
                          onChange={(e) => handleUpdateTrait(index, 'value', e.target.value)}
                          className="flex-1 bg-muted/50 rounded-[10px] py-3 px-4 sm:px-5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all text-foreground"
                          aria-label={`Trait value ${index + 1}`}
                        />
                        <button onClick={() => handleRemoveTrait(index)} className="p-2 sm:p-3 text-muted-foreground/50 hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm" aria-label={`Remove trait ${index + 1}`}>
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    {mintData.traits.length === 0 && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground/50 uppercase tracking-widest text-center py-4">No custom traits added</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Exclusive Holder Content (Perks)</label>
                    <button onClick={handleAddExclusive} className="text-[10px] sm:text-xs font-bold text-purple-500 uppercase tracking-widest hover:text-purple-400 transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm" aria-label="Add Perk">
                      <Plus className="h-4 w-4" /> Add Perk
                    </button>
                  </div>
                  <div className="space-y-3 sm:space-y-4 max-h-48 sm:max-h-64 overflow-y-auto pr-2 no-scrollbar">
                    {mintData.exclusiveContent.map((item, index) => (
                      <div key={index} className="flex gap-3 sm:gap-4 items-center bg-muted/50 p-4 sm:p-5 rounded-[10px] border border-border/50">
                        <div className="flex-1 space-y-3 sm:space-y-4">
                          <input 
                            type="text" 
                            placeholder="Perk Title (e.g. BTS Video)" 
                            value={item.title}
                            onChange={(e) => handleUpdateExclusive(index, 'title', e.target.value)}
                            className="w-full bg-background/20 rounded-[8px] py-2.5 px-4 text-xs outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all text-foreground"
                            aria-label={`Perk title ${index + 1}`}
                          />
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <select 
                              value={item.type}
                              onChange={(e) => handleUpdateExclusive(index, 'type', e.target.value)}
                              className="bg-background/20 rounded-[8px] py-2.5 px-3 text-xs outline-none text-muted-foreground/80 focus-visible:ring-2 focus-visible:ring-blue-500"
                              aria-label={`Perk type ${index + 1}`}
                            >
                              <option value="video">Video</option>
                              <option value="track">Audio</option>
                              <option value="image">Image</option>
                              <option value="document">PDF</option>
                            </select>
                            <input 
                              type="text" 
                              placeholder="URL (IPFS or CDN)" 
                              value={item.url}
                              onChange={(e) => handleUpdateExclusive(index, 'url', e.target.value)}
                              className="flex-1 bg-background/20 rounded-[8px] py-2.5 px-4 text-xs outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all text-foreground"
                              aria-label={`Perk URL ${index + 1}`}
                            />
                          </div>
                        </div>
                        <button onClick={() => handleRemoveExclusive(index)} className="p-2 sm:p-3 text-muted-foreground/50 hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm" aria-label={`Remove perk ${index + 1}`}>
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    {mintData.exclusiveContent.length === 0 && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground/30 uppercase tracking-widest text-center py-4">No exclusive content added</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 sm:gap-6 pt-4 sm:pt-6">
                <button onClick={() => setStep(1)} className="w-1/3 py-3 sm:py-4 bg-muted/50 text-foreground rounded-[8px] font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] hover:bg-muted transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" > BACK </button>
                <button onClick={() => setStep(3)} className="w-2/3 py-3 sm:py-4 bg-blue-600 text-foreground rounded-[8px] font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" > REVIEW_PROTOCOL_DEPLOYMENT </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-right duration-300">
              <div className="bg-muted/50 rounded-[10px] p-6 sm:p-8 space-y-6 sm:space-y-8">
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                  <img src={mintData.coverPreview} className="w-24 h-24 sm:w-32 sm:h-32 rounded-[10px] object-cover shadow-xl shrink-0" alt="" referrerPolicy="no-referrer" />
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground uppercase tracking-tighter mb-2">{mintData.title}</h3>
                    <p className="text-[10px] sm:text-xs font-bold text-blue-500 uppercase tracking-widest mb-4">By {userProfile.name}</p>
                    <div className="flex flex-wrap gap-3 sm:gap-4">
                      <div className="bg-background/30 px-3 sm:px-4 py-2 rounded-full">
                        <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-2">Price:</span>
                        <span className="text-[10px] sm:text-xs font-bold text-foreground">{mintData.price} TON</span>
                      </div>
                      <div className="bg-background/30 px-3 sm:px-4 py-2 rounded-full">
                        <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-2">Supply:</span>
                        <span className="text-[10px] sm:text-xs font-bold text-foreground">{mintData.supply}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-px bg-muted/50"></div>
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Deployment Fees</p>
                  <div className="flex justify-between text-xs sm:text-sm font-bold">
                    <span className="text-muted-foreground/80">Minting Fee</span>
                    <span className="text-foreground">0.05 TON</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm font-bold">
                    <span className="text-muted-foreground/80">Storage Fee (IPFS)</span>
                    <span className="text-foreground">0.01 TON</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm font-bold pt-2 sm:pt-3">
                    <span className="text-blue-500">Total Protocol Cost</span>
                    <span className="text-blue-500">0.06 TON</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 sm:gap-6 pt-4 sm:pt-6">
                <button onClick={() => setStep(2)} className="w-1/3 py-3 sm:py-4 bg-muted/50 text-foreground rounded-[8px] font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] hover:bg-muted transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" > BACK </button>
                <button onClick={handleMint} disabled={loading} className="w-2/3 py-3 sm:py-4 bg-green-600 text-foreground rounded-[8px] font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] shadow-lg shadow-green-600/20 hover:bg-green-500 transition-all flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" >
                  {loading ? (
                    <>
                      <img src={APP_LOGO} className="w-4 h-4 sm:w-5 sm:h-5 object-contain animate-[spin_3s_linear_infinite] opacity-80 mr-2 inline-block" alt="Loading..." referrerPolicy="no-referrer" /> DEPLOYING_PROTOCOL...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4 sm:h-5 sm:w-5 mr-2 inline-block" /> CONFIRM_MINT_ON_TON
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-12 sm:py-16 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/20">
                <Check className="h-10 w-10 sm:h-12 sm:w-12 text-green-500" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground uppercase tracking-tighter mb-4">Protocol Deployed</h2>
              <p className="text-muted-foreground/80 text-sm sm:text-base max-w-md mx-auto mb-10 leading-relaxed px-4"> Your sonic artifact has been successfully minted and registered on the TON blockchain. </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => navigate('/profile')} className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-foreground rounded-[10px] font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" > VIEW_IN_COLLECTION </button>
                <button onClick={() => { setStep(1); reset(); }} className="w-full sm:w-auto px-8 py-4 bg-muted/50 text-foreground rounded-[10px] font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] hover:bg-muted transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" > MINT_ANOTHER_ARTIFACT </button>
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
