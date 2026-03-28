import React, { useState, useRef, useEffect } from 'react';
import { Upload, Loader2, CheckCircle2, FileAudio, ArrowLeft, Plus, Music, Info, Sparkles, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAudio } from '@/context/AudioContext';
import { Track } from '@/types';
import { getPlaceholderImage, validateFile, ALLOWED_IMAGE_TYPES, ALLOWED_AUDIO_TYPES } from '@/lib/utils';
import { toast } from 'sonner';
import { GoogleGenAI, Type } from "@google/genai";
import { uploadToIPFS } from '@/services/pinataService';

const UploadTrack: React.FC = () => {
  const { addUserTrack, userProfile } = useAudio();
  const navigate = useNavigate();
  
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [step, setStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: 'Electronic',
    description: '',
    bpm: '',
    key: '',
    price: '1.0',
    streamingPrice: '0.01',
    editions: '100',
    editionType: 'Standard',
    rarity: 'Common',
    totalRoyalty: '10',
    isNFT: false,
    royaltySplits: [{ address: '', percentage: 100 }]
  });

  const [isDraggingAudio, setIsDraggingAudio] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file, 'audio', 50); // 50MB max for audio
      if (!validation.isValid) {
        toast.error(validation.error);
        if (audioInputRef.current) audioInputRef.current.value = '';
        return;
      }
      setAudioFile(file);
      analyzeAudio(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file, 'image', 10); // 10MB max for images
      if (!validation.isValid) {
        toast.error(validation.error);
        if (coverInputRef.current) coverInputRef.current.value = '';
        return;
      }
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearAudio = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setAudioFile(null);
    if (audioInputRef.current) audioInputRef.current.value = '';
    toast.info("Audio artifact cleared");
  };

  const clearCover = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCoverFile(null);
    setCoverPreview(null);
    if (coverInputRef.current) coverInputRef.current.value = '';
    toast.info("Cover art cleared");
  };

  const handleDragOver = (e: React.DragEvent, type: 'audio' | 'cover') => {
    e.preventDefault();
    if (type === 'audio') setIsDraggingAudio(true);
    else setIsDraggingCover(true);
  };

  const handleDragLeave = (type: 'audio' | 'cover') => {
    if (type === 'audio') setIsDraggingAudio(false);
    else setIsDraggingCover(false);
  };

  const handleDrop = (e: React.DragEvent, type: 'audio' | 'cover') => {
    e.preventDefault();
    handleDragLeave(type);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (type === 'audio') {
        const validation = validateFile(file, 'audio', 50);
        if (validation.isValid) {
          setAudioFile(file);
          analyzeAudio(file);
        } else {
          toast.error(validation.error);
        }
      } else {
        const validation = validateFile(file, 'image', 10);
        if (validation.isValid) {
          setCoverFile(file);
          const reader = new FileReader();
          reader.onloadend = () => setCoverPreview(reader.result as string);
          reader.readAsDataURL(file);
        } else {
          toast.error(validation.error);
        }
      }
    }
  };

  const analyzeAudio = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: file.type,
                  data: base64Data,
                },
              },
              {
                text: "Analyze this audio file and provide the genre, BPM (beats per minute), and musical key. Return the result in JSON format with keys: genre, bpm, key.",
              },
            ],
          },
        ],
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              genre: { type: Type.STRING },
              bpm: { type: Type.NUMBER },
              key: { type: Type.STRING },
            },
            required: ["genre", "bpm", "key"],
          },
        },
      });

      const result = JSON.parse(response.text || '{}');
      setFormData(prev => ({
        ...prev,
        genre: result.genre || prev.genre,
        bpm: result.bpm?.toString() || prev.bpm,
        key: result.key || prev.key,
      }));
      toast.success("Audio analysis complete!", {
        description: `Detected ${result.genre} at ${result.bpm} BPM in ${result.key}`,
        icon: <Sparkles className="h-4 w-4 text-blue-500" />
      });
    } catch (error) {
      console.error("Audio analysis failed:", error);
      toast.error("Failed to analyze audio. Please enter details manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile || !coverFile || !formData.title) {
      toast.error("Please fill in all required fields and upload files.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Upload files to IPFS via Pinata
      toast.info("Uploading artifacts to IPFS...");
      
      // We'll upload audio and cover in parallel
      const [audioRes, coverRes] = await Promise.all([
        uploadToIPFS(audioFile),
        uploadToIPFS(coverFile)
      ]);

      const audioUrl = audioRes.ipfsUrl;
      const coverUrl = coverRes.ipfsUrl;

      if (!audioUrl) {
        throw new Error("Audio upload failed: IPFS URL is missing");
      }
      if (!coverUrl) {
        throw new Error("Cover art upload failed: IPFS URL is missing");
      }

      // 2. Create the track object with IPFS URLs
      const newTrack: Track = {
        id: `track-${Date.now()}`,
        title: formData.title,
        artist: formData.artist || userProfile.name || 'Unknown Artist',
        artistId: userProfile.id || 'user-artist',
        coverUrl: coverUrl || getPlaceholderImage(formData.title || 'default-track'),
        audioUrl: audioUrl,
        audioIpfsUrl: audioUrl,
        coverIpfsUrl: coverUrl,
        duration: 180, // We could calculate this from the audio file if needed
        genre: formData.genre,
        bpm: parseInt(formData.bpm) || 0,
        key: formData.key,
        isNFT: formData.isNFT,
        price: formData.isNFT ? formData.price : undefined,
        editions: formData.isNFT ? formData.editions : undefined,
        editionType: formData.isNFT ? formData.editionType : undefined,
        rarity: formData.isNFT ? formData.rarity : undefined,
        royalty: formData.isNFT ? formData.totalRoyalty : undefined,
        royaltySplits: formData.isNFT ? formData.royaltySplits : undefined,
        streamingPrice: formData.streamingPrice,
        playCount: 0,
        likes: 0,
        releaseDate: new Date().toISOString().split('T')[0],
      };
      
      if (formData.isNFT) {
        setIsUploading(false);
        navigate('/mint', { state: { track: newTrack } });
        return;
      }

      // 4. Persist to Firestore via context
      await addUserTrack(newTrack);
      
      setIsUploading(false);
      setStep(2);
      toast.success("Track successfully broadcasted to the network!");
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast.error("Upload failed: " + (error.response?.data?.error || error.message));
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-4 lg:px-4 py-4 sm:py-4 animate-in fade-in duration-700">
      <div className="px-4 sm:px-4 py-4 sm:py-4 mb-4 sm:mb-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-4 text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Back to Hub</span>
        </button>
      </div>

      <div className="glass border-y sm:border border-border bg-white sm:rounded-[10px] overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-4 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[26px] sm:text-[32px] font-bold text-black tracking-tighter uppercase italic">
              {step === 2 ? 'Upload Complete' : 'Forge New Protocol'}
            </h1>
            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-[0.3em] mt-4">
              {step === 1 ? 'Sequence Audio Artifact & Metadata' : 'Frequency Synchronized'}
            </p>
          </div>
          {step === 1 && (
            <div className="flex items-center gap-4 px-4 py-4 rounded-full bg-blue-500/10 border border-neutral-500/20">
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">AI Analysis Enabled</span>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-4">
          {step === 1 && (
            <form onSubmit={handleUpload} className="space-y-4">
              {/* File Upload Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cover Art */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-4">
                    <Info className="h-3 w-3" /> Cover Art (1:1 Ratio)
                  </label>
                  <div 
                    onClick={() => !coverFile && coverInputRef.current?.click()}
                    onDragOver={(e) => handleDragOver(e, 'cover')}
                    onDragLeave={() => handleDragLeave('cover')}
                    onDrop={(e) => handleDrop(e, 'cover')}
                    className={`w-full aspect-square rounded-[10px] border-2 border-dashed bg-muted/30 flex flex-col items-center justify-center p-4 cursor-pointer transition-all group relative overflow-hidden ${coverFile ? 'border-neutral-500/50' : 'border-border'} ${isDraggingCover ? 'border-neutral-500/50 bg-blue-500/5 scale-[1.02]' : 'hover:border-neutral-500/50'}`}
                  >
                    {coverPreview ? (
                      <>
                        <img src={coverPreview} className="w-full h-full object-cover rounded-[8px]" alt="Cover Preview" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            type="button"
                            onClick={clearCover}
                            className="px-4 py-4 bg-red-500 text-white text-[10px] font-bold uppercase rounded-[5px] hover:bg-red-600 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Plus className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select Image</span>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={coverInputRef} onChange={handleCoverChange} accept={ALLOWED_IMAGE_TYPES.join(',')} className="hidden" />
                </div>

                {/* Audio File */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-4">
                    <Music className="h-3 w-3" /> Audio Artifact (MP3/WAV)
                  </label>
                  <div 
                    onClick={() => !audioFile && audioInputRef.current?.click()}
                    onDragOver={(e) => handleDragOver(e, 'audio')}
                    onDragLeave={() => handleDragLeave('audio')}
                    onDrop={(e) => handleDrop(e, 'audio')}
                    className={`w-full aspect-square rounded-[10px] border-2 border-dashed bg-muted/30 flex flex-col items-center justify-center p-4 cursor-pointer transition-all group relative ${audioFile ? 'border-neutral-500/50' : 'border-border'} ${isDraggingAudio ? 'border-neutral-500/50 bg-blue-500/5 scale-[1.02]' : 'hover:border-neutral-500/50'}`}
                  >
                    {audioFile ? (
                      <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 animate-pulse">
                          <FileAudio className="h-8 w-8" />
                        </div>
                        <div className="space-y-4">
                          <p className="text-xs font-bold text-foreground uppercase tracking-widest line-clamp-1">{audioFile.name}</p>
                          <p className="text-[10px] text-muted-foreground">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                        <button 
                          type="button"
                          onClick={clearAudio}
                          className="px-4 py-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold uppercase rounded-[5px]"
                        >
                          Clear File
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select Audio</span>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={audioInputRef} onChange={handleAudioChange} accept={ALLOWED_AUDIO_TYPES.join(',')} className="hidden" />
                  
                  {isAnalyzing && (
                    <div className="p-4 bg-blue-500/10 border border-neutral-500/20 rounded-[10px] flex items-center gap-4 animate-pulse">
                      <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                      <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">AI Analyzing Frequency...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {uploadProgress > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Uploading Artifact</span>
                    <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Metadata Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Track Title</label>
                  <input 
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-muted/30 border border-border/50 rounded-[5px] p-4 text-sm text-foreground outline-none focus:border-neutral-500/50 transition-colors"
                    placeholder="PROTOCOL_NAME"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Artist Name</label>
                  <input 
                    type="text"
                    value={formData.artist}
                    onChange={(e) => setFormData({...formData, artist: e.target.value})}
                    className="w-full bg-muted/30 border border-border/50 rounded-[5px] p-4 text-sm text-foreground outline-none focus:border-neutral-500/50 transition-colors"
                    placeholder="OPERATOR_ID"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Genre</label>
                  <select 
                    value={formData.genre}
                    onChange={(e) => setFormData({...formData, genre: e.target.value})}
                    className="w-full bg-muted/30 border border-border/50 rounded-[5px] p-4 text-sm text-foreground outline-none focus:border-neutral-500/50 transition-colors appearance-none"
                  >
                    <option value="Electronic">Electronic</option>
                    <option value="Hip-Hop">Hip-Hop</option>
                    <option value="Afrobeats">Afrobeats</option>
                    <option value="Techno">Techno</option>
                    <option value="House">House</option>
                    <option value="Ambient">Ambient</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">BPM</label>
                    <input 
                      type="number"
                      value={formData.bpm}
                      onChange={(e) => setFormData({...formData, bpm: e.target.value})}
                      className="w-full bg-muted/30 border border-border/50 rounded-[5px] p-4 text-sm text-foreground outline-none focus:border-neutral-500/50 transition-colors"
                      placeholder="128"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Key</label>
                    <input 
                      type="text"
                      value={formData.key}
                      onChange={(e) => setFormData({...formData, key: e.target.value})}
                      className="w-full bg-muted/30 border border-border/50 rounded-[5px] p-4 text-sm text-foreground outline-none focus:border-neutral-500/50 transition-colors"
                      placeholder="Am"
                    />
                  </div>
                </div>
              </div>

              {/* NFT Toggle Section - Moved Higher */}
              <div className={`p-6 rounded-[10px] border transition-all duration-500 ${formData.isNFT ? 'bg-amber-500/5 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.05)]' : 'bg-muted/20 border-border/50'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${formData.isNFT ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">Mint as NFT Protocol</h3>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1">Enable ownership & marketplace trading</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, isNFT: !formData.isNFT})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.isNFT ? 'bg-amber-500' : 'bg-muted-foreground/30'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isNFT ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {formData.isNFT && (
                  <div className="space-y-6 pt-4 border-t border-amber-500/20 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Listing Price (TON)</label>
                        <input 
                          type="number"
                          step="0.1"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          className="w-full bg-background/50 border border-amber-500/20 rounded-[5px] p-4 text-sm text-foreground outline-none focus:border-amber-500/50 transition-colors"
                          placeholder="1.0"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Editions</label>
                        <input 
                          type="number"
                          value={formData.editions}
                          onChange={(e) => setFormData({...formData, editions: e.target.value})}
                          className="w-full bg-background/50 border border-amber-500/20 rounded-[5px] p-4 text-sm text-foreground outline-none focus:border-amber-500/50 transition-colors"
                          placeholder="100"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Edition Type</label>
                        <select 
                          value={formData.editionType}
                          onChange={(e) => setFormData({...formData, editionType: e.target.value})}
                          className="w-full bg-background/50 border border-amber-500/20 rounded-[5px] p-4 text-sm text-foreground outline-none focus:border-amber-500/50 transition-colors appearance-none"
                        >
                          <option value="Standard">Standard</option>
                          <option value="Limited">Limited</option>
                          <option value="Unique">Unique (1/1)</option>
                        </select>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rarity Label</label>
                        <input 
                          type="text"
                          value={formData.rarity}
                          onChange={(e) => setFormData({...formData, rarity: e.target.value})}
                          className="w-full bg-background/50 border border-amber-500/20 rounded-[5px] p-4 text-sm text-foreground outline-none focus:border-amber-500/50 transition-colors"
                          placeholder="Common"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Royalty (%)</label>
                        <input 
                          type="number"
                          max="100"
                          value={formData.totalRoyalty}
                          onChange={(e) => setFormData({...formData, totalRoyalty: e.target.value})}
                          className="w-full bg-background/50 border border-amber-500/20 rounded-[5px] p-4 text-sm text-foreground outline-none focus:border-amber-500/50 transition-colors"
                          placeholder="10"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Royalty Splits</label>
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            royaltySplits: [...formData.royaltySplits, { address: '', percentage: 0 }]
                          })}
                          className="text-[9px] font-bold text-amber-500 uppercase tracking-widest hover:text-amber-400 transition-colors flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" /> Add Split
                        </button>
                      </div>

                      <div className="space-y-3">
                        {formData.royaltySplits.map((split, index) => (
                          <div key={index} className="flex gap-2 items-start">
                            <div className="flex-1">
                              <input
                                type="text"
                                placeholder="TON Wallet Address"
                                value={split.address}
                                onChange={(e) => {
                                  const newSplits = [...formData.royaltySplits];
                                  newSplits[index].address = e.target.value;
                                  setFormData({ ...formData, royaltySplits: newSplits });
                                }}
                                className="w-full bg-background/50 border border-amber-500/20 rounded-[5px] p-3 text-[11px] text-foreground outline-none focus:border-amber-500/50 transition-colors"
                              />
                            </div>
                            <div className="w-24">
                              <div className="relative">
                                <input
                                  type="number"
                                  placeholder="%"
                                  value={split.percentage}
                                  onChange={(e) => {
                                    const newSplits = [...formData.royaltySplits];
                                    newSplits[index].percentage = parseInt(e.target.value) || 0;
                                    setFormData({ ...formData, royaltySplits: newSplits });
                                  }}
                                  className="w-full bg-background/50 border border-amber-500/20 rounded-[5px] p-3 pr-8 text-[11px] text-foreground outline-none focus:border-amber-500/50 transition-colors"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">%</span>
                              </div>
                            </div>
                            {formData.royaltySplits.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newSplits = formData.royaltySplits.filter((_, i) => i !== index);
                                  setFormData({ ...formData, royaltySplits: newSplits });
                                }}
                                className="p-3 text-red-500/50 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center px-1">
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Split Total</span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${
                          formData.royaltySplits.reduce((sum, s) => sum + s.percentage, 0) === 100 
                            ? "text-green-500" 
                            : "text-amber-500"
                        }`}>
                          {formData.royaltySplits.reduce((sum, s) => sum + s.percentage, 0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-muted/30 border border-border/50 rounded-[5px] p-4 text-sm text-foreground outline-none focus:border-neutral-500/50 transition-colors h-32 resize-none"
                  placeholder="Enter track transmission details..."
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Streaming Price (TON)</label>
                <input 
                  type="number"
                  step="0.01"
                  value={formData.streamingPrice}
                  onChange={(e) => setFormData({...formData, streamingPrice: e.target.value})}
                  className="w-full bg-muted/30 border border-border/50 rounded-[5px] p-4 text-sm text-foreground outline-none focus:border-neutral-500/50 transition-colors"
                  placeholder="0.01"
                />
              </div>

              <button 
                type="submit"
                disabled={isUploading || isAnalyzing}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[5px] font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Transmitting...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 group-hover:-translate-y-1 transition-transform" />
                    Forge Track
                  </>
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="py-4 flex flex-col items-center text-center space-y-4 animate-in zoom-in duration-500">
              <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-4 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <div className="space-y-4">
                <h3 className="text-[26px] font-bold text-foreground tracking-tighter uppercase italic">Protocol Established</h3>
                <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-[0.4em] max-w-sm mx-auto leading-relaxed">
                  "{formData.title}" has been successfully broadcasted to the network.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <button 
                  onClick={() => navigate('/artist-dashboard')}
                  className="flex-1 py-4 bg-foreground text-background rounded-[5px] font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                >
                  View Dashboard
                </button>
                <button 
                  onClick={() => { setStep(1); setFormData({ ...formData, title: '', isNFT: false }); setAudioFile(null); setCoverFile(null); setCoverPreview(null); setUploadProgress(0); }}
                  className="flex-1 py-4 bg-muted/50 text-foreground rounded-[5px] font-bold text-[10px] uppercase tracking-widest hover:bg-muted transition-all"
                >
                  Upload Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadTrack;
