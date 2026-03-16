import React, { useState, useRef, useEffect } from 'react';
import { Upload, Loader2, CheckCircle2, FileAudio, ArrowLeft, Plus, Music, Info, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '@/context/AudioContext';
import { Track } from '@/types';
import { toast } from 'sonner';
import { GoogleGenAI, Type } from "@google/genai";

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
    editions: '100',
    royalty: '10',
    isNFT: false
  });

  const [isDraggingAudio, setIsDraggingAudio] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      analyzeAudio(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
        if (file.type.startsWith('audio/')) {
          setAudioFile(file);
          analyzeAudio(file);
        } else {
          toast.error("Invalid file type. Please upload an audio file.");
        }
      } else {
        if (file.type.startsWith('image/')) {
          setCoverFile(file);
          const reader = new FileReader();
          reader.onloadend = () => setCoverPreview(reader.result as string);
          reader.readAsDataURL(file);
        } else {
          toast.error("Invalid file type. Please upload an image.");
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
        model: "gemini-2.5-flash-preview-12-2025",
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

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);

    // Simulate upload delay
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      
      const newTrack: Track = {
        id: `track-${Date.now()}`,
        title: formData.title,
        artist: formData.artist || 'Unknown Artist',
        artistId: userProfile.id || 'user-artist',
        coverUrl: coverPreview || 'https://picsum.photos/400/400?seed=default',
        audioUrl: URL.createObjectURL(audioFile),
        duration: 180,
        genre: formData.genre,
        bpm: parseInt(formData.bpm) || 0,
        key: formData.key,
        isNFT: formData.isNFT,
        price: formData.isNFT ? formData.price : undefined,
        playCount: 0,
        likes: 0,
        releaseDate: new Date().toISOString().split('T')[0],
      };
      
      if (formData.isNFT) {
        setIsUploading(false);
        navigate('/mint', { state: { track: newTrack } });
        return;
      }

      addUserTrack(newTrack);
      setIsUploading(false);
      setStep(2);
      toast.success("Track successfully broadcasted to the network!");
    }, 2000);
  };

  return (
    <div className="w-full px-0 sm:px-6 lg:px-10 py-0 sm:py-8 animate-in fade-in duration-700">
      <div className="px-6 sm:px-0 py-6 sm:py-0 mb-2 sm:mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Back to Hub</span>
        </button>
      </div>

      <div className="glass border-y sm:border border-border bg-[#0a0a0a] sm:rounded-[10px] overflow-hidden shadow-2xl">
        <div className="p-6 sm:p-10 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tighter uppercase italic">
              {step === 2 ? 'Upload Complete' : 'Forge New Protocol'}
            </h1>
            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-[0.3em] mt-2">
              {step === 1 ? 'Sequence Audio Artifact & Metadata' : 'Frequency Synchronized'}
            </p>
          </div>
          {step === 1 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-neutral-500/20">
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">AI Analysis Enabled</span>
            </div>
          )}
        </div>

        <div className="p-6 sm:p-10">
          {step === 1 && (
            <form onSubmit={handleUpload} className="space-y-10">
              {/* File Upload Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Cover Art */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Info className="h-3 w-3" /> Cover Art (1:1 Ratio)
                  </label>
                  <div 
                    onClick={() => !coverFile && coverInputRef.current?.click()}
                    onDragOver={(e) => handleDragOver(e, 'cover')}
                    onDragLeave={() => handleDragLeave('cover')}
                    onDrop={(e) => handleDrop(e, 'cover')}
                    className={`w-full aspect-square rounded-[10px] border-2 border-dashed bg-foreground/[0.02] flex flex-col items-center justify-center p-2 cursor-pointer transition-all group relative overflow-hidden ${coverFile ? 'border-neutral-500/50' : 'border-border'} ${isDraggingCover ? 'border-neutral-500/50 bg-blue-500/5 scale-[1.02]' : 'hover:border-neutral-500/50'}`}
                  >
                    {coverPreview ? (
                      <>
                        <img src={coverPreview} className="w-full h-full object-cover rounded-[8px]" alt="Cover Preview" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            type="button"
                            onClick={clearCover}
                            className="px-4 py-2 bg-red-500 text-white text-[10px] font-bold uppercase rounded-[5px] hover:bg-red-600 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Plus className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select Image</span>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={coverInputRef} onChange={handleCoverChange} accept="image/*" className="hidden" />
                </div>

                {/* Audio File */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Music className="h-3 w-3" /> Audio Artifact (MP3/WAV)
                  </label>
                  <div 
                    onClick={() => !audioFile && audioInputRef.current?.click()}
                    onDragOver={(e) => handleDragOver(e, 'audio')}
                    onDragLeave={() => handleDragLeave('audio')}
                    onDrop={(e) => handleDrop(e, 'audio')}
                    className={`w-full aspect-square rounded-[10px] border-2 border-dashed bg-foreground/[0.02] flex flex-col items-center justify-center p-6 cursor-pointer transition-all group relative ${audioFile ? 'border-neutral-500/50' : 'border-border'} ${isDraggingAudio ? 'border-neutral-500/50 bg-blue-500/5 scale-[1.02]' : 'hover:border-neutral-500/50'}`}
                  >
                    {audioFile ? (
                      <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 animate-pulse">
                          <FileAudio className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-foreground uppercase tracking-widest line-clamp-1">{audioFile.name}</p>
                          <p className="text-[10px] text-muted-foreground">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                        <button 
                          type="button"
                          onClick={clearAudio}
                          className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold uppercase rounded-[5px]"
                        >
                          Clear File
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select Audio</span>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={audioInputRef} onChange={handleAudioChange} accept="audio/*" className="hidden" />
                  
                  {isAnalyzing && (
                    <div className="p-4 bg-blue-500/10 border border-neutral-500/20 rounded-[10px] flex items-center gap-3 animate-pulse">
                      <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                      <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">AI Analyzing Frequency...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {uploadProgress > 0 && (
                <div className="space-y-2">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Track Title</label>
                  <input 
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-foreground/[0.03] border border-border/50 rounded-[5px] p-4 text-sm text-foreground outline-none focus:border-neutral-500/50 transition-colors"
                    placeholder="PROTOCOL_NAME"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Artist Name</label>
                  <input 
                    type="text"
                    value={formData.artist}
                    onChange={(e) => setFormData({...formData, artist: e.target.value})}
                    className="w-full bg-foreground/[0.03] border border-border/50 rounded-[5px] p-4 text-sm text-foreground outline-none focus:border-neutral-500/50 transition-colors"
                    placeholder="OPERATOR_ID"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Genre</label>
                  <select 
                    value={formData.genre}
                    onChange={(e) => setFormData({...formData, genre: e.target.value})}
                    className="w-full bg-foreground/[0.03] border border-border/50 rounded-[5px] p-4 text-sm text-foreground outline-none focus:border-neutral-500/50 transition-colors appearance-none"
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
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">BPM</label>
                    <input 
                      type="number"
                      value={formData.bpm}
                      onChange={(e) => setFormData({...formData, bpm: e.target.value})}
                      className="w-full bg-foreground/[0.03] border border-border/50 rounded-[5px] p-4 text-sm text-foreground outline-none focus:border-neutral-500/50 transition-colors"
                      placeholder="128"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Key</label>
                    <input 
                      type="text"
                      value={formData.key}
                      onChange={(e) => setFormData({...formData, key: e.target.value})}
                      className="w-full bg-foreground/[0.03] border border-border/50 rounded-[5px] p-4 text-sm text-foreground outline-none focus:border-neutral-500/50 transition-colors"
                      placeholder="Am"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-foreground/[0.03] border border-border/50 rounded-[5px] p-4 text-sm text-foreground outline-none focus:border-neutral-500/50 transition-colors h-32 resize-none"
                  placeholder="Enter track transmission details..."
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-foreground/[0.02] border border-border/50 rounded-[10px]">
                <input 
                  type="checkbox"
                  id="isNFT"
                  checked={formData.isNFT}
                  onChange={(e) => setFormData({...formData, isNFT: e.target.checked})}
                  className="w-4 h-4 rounded border-border bg-background text-blue-500 focus:ring-neutral-500/50"
                />
                <label htmlFor="isNFT" className="text-[10px] font-bold text-foreground uppercase tracking-widest cursor-pointer">
                  Mint as NFT Protocol
                </label>
              </div>

              {formData.isNFT && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-500">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Price (TON)</label>
                    <input 
                      type="text"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full bg-foreground/[0.03] border border-border/50 rounded-[5px] p-4 text-sm text-foreground outline-none focus:border-neutral-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Editions</label>
                    <input 
                      type="text"
                      value={formData.editions}
                      onChange={(e) => setFormData({...formData, editions: e.target.value})}
                      className="w-full bg-foreground/[0.03] border border-border/50 rounded-[5px] p-4 text-sm text-foreground outline-none focus:border-neutral-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Royalty %</label>
                    <input 
                      type="text"
                      value={formData.royalty}
                      onChange={(e) => setFormData({...formData, royalty: e.target.value})}
                      className="w-full bg-foreground/[0.03] border border-border/50 rounded-[5px] p-4 text-sm text-foreground outline-none focus:border-neutral-500/50 transition-colors"
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit"
                disabled={isUploading || isAnalyzing}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-foreground rounded-[5px] font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
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
            <div className="py-20 flex flex-col items-center text-center space-y-8 animate-in zoom-in duration-500">
              <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-4 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-foreground tracking-tighter uppercase italic">Protocol Established</h3>
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
