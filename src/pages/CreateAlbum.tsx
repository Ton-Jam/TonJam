import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Disc, Music, Image as ImageIcon, Sparkles, Plus, Trash2, ArrowUp, ArrowDown, 
  Play, Square, ChevronRight, Check, Cloud, Zap, Database, Folder, Radio, 
  Percent, ShieldCheck, FileAudio, Info, Tag, Loader2, Clock, Layers
} from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { validateFile, ALLOWED_IMAGE_TYPES, ALLOWED_AUDIO_TYPES } from '@/lib/utils';
import { uploadToPinata, uploadJSONToPinata } from '@/services/storageService';
import { Track, RoyaltySplitExtended, Album } from '@/types';
import { BackButton } from '@/components/BackButton';
import MintingProgressOverlay, { MintingStep } from '@/components/MintingProgressOverlay';
import { GoogleDriveImportModal } from '@/components/GoogleDriveImportModal';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { mintTonJamNFT } from '@/services/tonService';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface TracklistItem {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: number; // in seconds
  audioFile: File | null;
  audioUrl: string;
  lyrics?: string;
  isExplicit?: boolean;
  isExistingTrack?: boolean;
}

export const CreateAlbum: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, addUserTrack, addUserNFT, addNotification, allTracks, setHeaderTitle } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  const connectedAddress = useTonAddress() || userProfile?.walletAddress || '';

  useEffect(() => {
    setHeaderTitle('Album Creation Studio');
    return () => setHeaderTitle('');
  }, [setHeaderTitle]);

  // 4-Step Flow: 1. Release Info & Art | 2. Tracklist Builder | 3. Web3 & Royalties | 4. Review & Deploy
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Processing...');
  const [overallProgress, setOverallProgress] = useState(0);

  const [mintingSteps, setMintingSteps] = useState<MintingStep[]>([
    { id: 'upload_cover', label: 'Album Artwork IPFS Pin', status: 'pending', description: 'Pinata Gateway cover art upload', icon: ImageIcon },
    { id: 'upload_audio', label: 'Track Audio Masters IPFS Pin', status: 'pending', description: 'Batch track audio file deployment', icon: FileAudio },
    { id: 'metadata', label: 'Album Metadata Encoding', status: 'pending', description: 'TEP-64 standard album JSON pin', icon: Sparkles },
    { id: 'transaction', label: 'Blockchain Smart Contract', status: 'pending', description: 'TON Collection contract deployment', icon: Zap },
    { id: 'registry', label: 'Platform Synchronization', status: 'pending', description: 'Catalog indexing & database sync', icon: Database },
  ]);

  // Form State - Album Info
  const [albumData, setAlbumData] = useState({
    title: '',
    artistName: userProfile?.name || 'Artist',
    releaseType: 'Album' as 'Album' | 'EP' | 'Single' | 'Mixtape' | 'Compilation',
    genre: 'Electronic',
    releaseYear: new Date().getFullYear(),
    description: '',
    coverFile: null as File | null,
    coverPreview: '',
    isMintNFT: true,
    price: '5.0',
    editions: '500',
    secondaryRoyalty: '5',
    blockchain: 'ton-mainnet' as 'ton-mainnet' | 'ton-testnet' | 'ton-miniapp'
  });

  // Tracklist State
  const [tracklist, setTracklist] = useState<TracklistItem[]>([]);

  // New Track Input Form State
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackGenre, setNewTrackGenre] = useState('Electronic');
  const [newTrackFile, setNewTrackFile] = useState<File | null>(null);
  const [newTrackAudioPreview, setNewTrackAudioPreview] = useState('');
  const [newTrackLyrics, setNewTrackLyrics] = useState('');
  const [newTrackExplicit, setNewTrackExplicit] = useState(false);

  // Royalty Collaborator Splits
  const [royaltySplits, setRoyaltySplits] = useState<RoyaltySplitExtended[]>([
    { address: connectedAddress || userProfile?.walletAddress || '', percentage: 100, label: 'Creator' }
  ]);

  const [termsConfirmed, setTermsConfirmed] = useState(false);

  // AI Cover Art
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAiCover, setIsGeneratingAiCover] = useState(false);

  // Google Drive Modal
  const [driveModalOpen, setDriveModalOpen] = useState(false);
  const [driveModalType, setDriveModalType] = useState<'audio' | 'image'>('audio');

  // Drag and Drop
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [isDraggingAudio, setIsDraggingAudio] = useState(false);

  // Audio Preview Player
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Existing tracks from artist catalog to quickly add
  const artistCatalogTracks = allTracks.filter(t => t.artistId === userProfile.uid);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle playing preview audio
  const handleTogglePlayPreview = (trackId: string, audioUrl: string) => {
    if (playingTrackId === trackId) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => setPlayingTrackId(null);
      } else {
        audioRef.current.src = audioUrl;
      }
      audioRef.current.play().catch(e => {
        console.warn("Audio playback error:", e);
        toast.error("Could not play track preview");
      });
      setPlayingTrackId(trackId);
    }
  };

  const processCoverFile = (file: File) => {
    const validation = validateFile(file, 'image', 10);
    if (!validation.isValid) {
      addNotification(validation.error || "Invalid cover image", "error");
      return;
    }
    const coverUrl = URL.createObjectURL(file);
    setAlbumData(prev => ({ ...prev, coverFile: file, coverPreview: coverUrl }));
    addNotification("Album cover uploaded successfully!", "success");
  };

  const processAudioFileForNewTrack = (file: File) => {
    const validation = validateFile(file, 'audio', 50);
    if (!validation.isValid) {
      addNotification(validation.error || "Invalid audio file", "error");
      return;
    }
    const url = URL.createObjectURL(file);
    setNewTrackFile(file);
    setNewTrackAudioPreview(url);
    if (!newTrackTitle) {
      setNewTrackTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
    addNotification(`Audio file loaded for new track`, "success");
  };

  const handleAddNewTrackToAlbum = () => {
    if (!newTrackTitle.trim()) {
      addNotification("Please enter a track title", "error");
      return;
    }
    if (!newTrackAudioPreview && !newTrackFile) {
      addNotification("Please select an audio file for the track", "error");
      return;
    }

    const item: TracklistItem = {
      id: `album-track-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: newTrackTitle.trim(),
      artist: albumData.artistName || userProfile.name || 'Artist',
      genre: newTrackGenre || albumData.genre,
      duration: 210, // Default 3:30 estimation
      audioFile: newTrackFile,
      audioUrl: newTrackAudioPreview,
      lyrics: newTrackLyrics,
      isExplicit: newTrackExplicit,
      isExistingTrack: false
    };

    setTracklist(prev => [...prev, item]);

    // Reset track input
    setNewTrackTitle('');
    setNewTrackFile(null);
    setNewTrackAudioPreview('');
    setNewTrackLyrics('');
    setNewTrackExplicit(false);
    addNotification(`Added track "${item.title}" to album tracklist`, "success");
  };

  const handleAddExistingTrack = (track: Track) => {
    if (tracklist.some(t => t.id === track.id)) {
      addNotification("This track is already in the album tracklist", "warning");
      return;
    }
    const item: TracklistItem = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      genre: track.genre || albumData.genre,
      duration: track.duration || 180,
      audioFile: null,
      audioUrl: track.audioUrl,
      lyrics: track.lyrics,
      isExplicit: track.isExplicit,
      isExistingTrack: true
    };
    setTracklist(prev => [...prev, item]);
    addNotification(`Added "${track.title}" from catalog`, "success");
  };

  const handleRemoveTrack = (id: string) => {
    setTracklist(prev => prev.filter(t => t.id !== id));
  };

  const handleMoveTrack = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === tracklist.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...tracklist];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setTracklist(updated);
  };

  const openDriveModal = (type: 'audio' | 'image') => {
    setDriveModalType(type);
    setDriveModalOpen(true);
  };

  const handleDriveFileSelected = (file: File) => {
    if (driveModalType === 'image') {
      processCoverFile(file);
    } else {
      processAudioFileForNewTrack(file);
    }
  };

  const totalDurationSeconds = tracklist.reduce((acc, t) => acc + (t.duration || 180), 0);
  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const totalSplitsPercentage = royaltySplits.reduce((acc, curr) => acc + (Number(curr.percentage) || 0), 0);

  const handlePublishAlbum = async () => {
    if (!albumData.title.trim()) {
      addNotification("Please enter an album title", "error");
      setStep(1);
      return;
    }

    if (!albumData.coverPreview && !albumData.coverFile) {
      addNotification("Please upload or generate an album cover", "error");
      setStep(1);
      return;
    }

    if (tracklist.length === 0) {
      addNotification("Please add at least one track to the album tracklist", "error");
      setStep(2);
      return;
    }

    if (albumData.isMintNFT && totalSplitsPercentage !== 100) {
      addNotification(`Royalty splits must sum to 100%. Current sum: ${totalSplitsPercentage}%`, "error");
      setStep(3);
      return;
    }

    if (!termsConfirmed) {
      addNotification("Please confirm ownership and copyright attestation", "warning");
      return;
    }

    const wallet = tonConnectUI.wallet?.account.address || connectedAddress;
    if (albumData.isMintNFT && !wallet) {
      addNotification("Please connect your TON wallet to mint", "warning");
      tonConnectUI.openModal();
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Initializing decentralized IPFS storage deployment...');
    setOverallProgress(10);
    setMintingSteps(steps => steps.map(s => ({ ...s, status: 'pending' })));

    const updateStepStatus = (id: string, status: 'pending' | 'processing' | 'completed' | 'error', progress: number) => {
      setMintingSteps(steps => steps.map(s => s.id === id ? { ...s, status } : s));
      setOverallProgress(progress);
    };

    try {
      updateStepStatus('upload_cover', 'processing', 15);

      // 1. Upload Album Cover to Pinata IPFS
      let finalCoverUrl = albumData.coverPreview;
      if (albumData.coverFile) {
        setLoadingMessage('Uploading album cover art to IPFS gateway...');
        finalCoverUrl = await uploadToPinata(albumData.coverFile);
      }
      updateStepStatus('upload_cover', 'completed', 30);
      updateStepStatus('upload_audio', 'processing', 35);

      // 2. Upload audio files for new tracks
      setLoadingMessage(`Deploying ${tracklist.length} track audio files to IPFS...`);
      const compiledTracks: Track[] = [];
      const trackIds: string[] = [];

      for (let i = 0; i < tracklist.length; i++) {
        const item = tracklist[i];
        let finalAudioUrl = item.audioUrl;

        if (item.audioFile) {
          setLoadingMessage(`Uploading track ${i + 1}/${tracklist.length}: "${item.title}"...`);
          finalAudioUrl = await uploadToPinata(item.audioFile);
        }

        const trackId = item.isExistingTrack ? item.id : `track-alb-${Date.now()}-${i}`;
        const newTrackObj: Track = {
          id: trackId,
          songId: `song-${trackId}`,
          title: item.title,
          artist: albumData.artistName || userProfile.name || 'Unknown Artist',
          artistId: userProfile.uid,
          coverUrl: finalCoverUrl,
          audioUrl: finalAudioUrl,
          duration: item.duration,
          genre: item.genre || albumData.genre,
          isNFT: albumData.isMintNFT,
          price: albumData.price,
          editions: albumData.editions,
          album: albumData.title,
          albumId: `alb-${Date.now()}`,
          lyrics: item.lyrics || '',
          isExplicit: item.isExplicit || false,
          createdAt: new Date().toISOString()
        } as Track;

        if (!item.isExistingTrack) {
          await addUserTrack(newTrackObj);
        }

        compiledTracks.push(newTrackObj);
        trackIds.push(trackId);
      }

      updateStepStatus('upload_audio', 'completed', 55);
      updateStepStatus('metadata', 'processing', 65);

      // 3. Metadata encoding
      setLoadingMessage('Generating TEP-64 compliant Album Metadata...');

      const albumId = `alb-${Date.now()}`;
      const newAlbum: Album = {
        id: albumId,
        title: albumData.title,
        artist: albumData.artistName || userProfile.name || 'Unknown Artist',
        artistId: userProfile.uid,
        coverUrl: finalCoverUrl,
        releaseYear: Number(albumData.releaseYear) || new Date().getFullYear(),
        trackIds: trackIds,
        genre: albumData.genre,
        description: albumData.description
      };

      const metadataJSON = {
        name: albumData.title,
        description: albumData.description,
        image: finalCoverUrl,
        type: albumData.releaseType,
        attributes: [
          { trait_type: "Release Type", value: albumData.releaseType },
          { trait_type: "Artist", value: albumData.artistName },
          { trait_type: "Genre", value: albumData.genre },
          { trait_type: "Track Count", value: tracklist.length },
          { trait_type: "Secondary Royalty %", value: `${albumData.secondaryRoyalty}%` },
          { trait_type: "Network", value: albumData.blockchain }
        ]
      };

      const ipfsMetadataUrl = await uploadJSONToPinata(metadataJSON);

      updateStepStatus('metadata', 'completed', 75);

      // 4. Blockchain Transaction (if NFT Enabled)
      if (albumData.isMintNFT) {
        updateStepStatus('transaction', 'processing', 85);
        setLoadingMessage('Minting Album Collection NFT on TON Blockchain...');
        await mintTonJamNFT(tonConnectUI, wallet, ipfsMetadataUrl);
        updateStepStatus('transaction', 'completed', 90);
      } else {
        updateStepStatus('transaction', 'completed', 90);
      }

      updateStepStatus('registry', 'processing', 95);
      setLoadingMessage('Synchronizing TonJam music catalog...');

      // Save album to Local Storage for immediate access across the app
      try {
        const existingStoredAlbums = JSON.parse(localStorage.getItem('tonjam_user_albums') || '[]');
        localStorage.setItem('tonjam_user_albums', JSON.stringify([newAlbum, ...existingStoredAlbums]));
      } catch (e) {
        console.warn("Local storage album save warning:", e);
      }

      updateStepStatus('registry', 'completed', 100);
      await new Promise(resolve => setTimeout(resolve, 600));

      setIsLoading(false);
      addNotification(`Album "${albumData.title}" published successfully with ${tracklist.length} tracks!`, "success");
      navigate(`/album/${albumId}`);
    } catch (err: any) {
      console.error("Album publication failed:", err);
      setMintingSteps(steps => steps.map(s => s.status === 'processing' ? { ...s, status: 'error' } : s));
      setIsLoading(false);
      addNotification(err.message || "Failed to publish album. Check wallet or connection.", "error");
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

      {/* Background Ambience */}
      <div className="fixed inset-0 opacity-15 blur-[140px] pointer-events-none z-0">
        <div className="absolute top-10 right-10 w-96 h-96 bg-[#0052FF] rounded-full" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-600 rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        {/* Header Navigation & Stepper */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1527]/90 p-5 rounded-2xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <BackButton className="bg-white/5 hover:bg-white/10 text-white" />
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <Disc className="w-5 h-5 text-[#0052FF]" /> Create Album & EP Studio
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Step {step} of 4: {
                  step === 1 ? 'Album Metadata & Artwork' :
                  step === 2 ? 'Tracklist Assembly' :
                  step === 3 ? 'Web3 & Royalty Splits' :
                  'Final Review & Publication'
                }
              </p>
            </div>
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            {[
              { num: 1, label: 'Artwork' },
              { num: 2, label: 'Tracklist' },
              { num: 3, label: 'Web3' },
              { num: 4, label: 'Publish' }
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

        {/* STEP 1: RELEASE DETAILS & COVER ARTWORK */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0D1527] p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-md space-y-8"
          >
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#0052FF]" /> Step 1: Album Details & Cover Art
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Define the title, release type, primary genre, and upload or generate official cover art.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Form Input Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Album / EP Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={albumData.title}
                    onChange={e => setAlbumData({...albumData, title: e.target.value})}
                    placeholder="e.g. Neon Genesis Part I"
                    className="w-full bg-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:bg-white/10"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Artist / Stage Name
                  </label>
                  <input
                    type="text"
                    value={albumData.artistName}
                    onChange={e => setAlbumData({...albumData, artistName: e.target.value})}
                    placeholder="Artist Name"
                    className="w-full bg-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:bg-white/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Release Format
                    </label>
                    <select
                      value={albumData.releaseType}
                      onChange={e => setAlbumData({...albumData, releaseType: e.target.value as any})}
                      className="w-full bg-[#0A1021] rounded-xl px-4 py-3 text-xs font-bold text-white outline-none"
                    >
                      <option value="Album">Full Album (LP)</option>
                      <option value="EP">Extended Play (EP)</option>
                      <option value="Single">Single Bundle</option>
                      <option value="Mixtape">Mixtape</option>
                      <option value="Compilation">Compilation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Primary Genre
                    </label>
                    <select
                      value={albumData.genre}
                      onChange={e => setAlbumData({...albumData, genre: e.target.value})}
                      className="w-full bg-[#0A1021] rounded-xl px-4 py-3 text-xs font-bold text-white outline-none"
                    >
                      {['Electronic', 'Hip-hop', 'Afrobeats', 'Pop', 'Rock', 'Synthwave', 'Phonk', 'Techno', 'Jazz', 'Ambient', 'House', 'R&B'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Release Description & Album Lore
                  </label>
                  <textarea
                    value={albumData.description}
                    onChange={e => setAlbumData({...albumData, description: e.target.value})}
                    rows={4}
                    placeholder="Tell listeners the artistic story, synth equipment used, or inspiration behind this album body of work..."
                    className="w-full bg-white/5 rounded-xl p-4 text-xs font-semibold text-white outline-none focus:bg-white/10 resize-none"
                  />
                </div>
              </div>

              {/* Cover Art Box & Gemini AI Box */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Album Cover Art Vision
                  </label>
                  <button
                    type="button"
                    onClick={() => openDriveModal('image')}
                    className="text-[10px] font-bold text-[#0052FF] hover:underline uppercase tracking-wider flex items-center gap-1"
                  >
                    <Folder className="w-3.5 h-3.5" /> Google Drive
                  </button>
                </div>

                {/* Drag and Drop Zone for Cover */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingCover(true); }}
                  onDragLeave={() => setIsDraggingCover(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingCover(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) processCoverFile(file);
                  }}
                  onClick={() => !isGeneratingAiCover && coverInputRef.current?.click()}
                  className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group ${
                    isDraggingCover
                      ? 'bg-[#0052FF]/20 scale-[1.01]'
                      : albumData.coverPreview
                      ? 'bg-black/60'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <input
                    type="file"
                    ref={coverInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) processCoverFile(file);
                    }}
                    accept={ALLOWED_IMAGE_TYPES.join(',')}
                    className="hidden"
                  />

                  {isGeneratingAiCover ? (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-[#0052FF] animate-spin" />
                      <span className="text-xs font-black text-[#0052FF] uppercase tracking-widest animate-pulse">
                        Synthesizing Album Art with Gemini AI...
                      </span>
                    </div>
                  ) : albumData.coverPreview ? (
                    <>
                      <img src={albumData.coverPreview} alt="Album Cover" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-7 h-7 text-slate-400" />
                      </div>
                      <p className="text-xs font-black uppercase tracking-wider text-white">Upload Album Cover</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Drag & drop image or click to browse</p>
                    </div>
                  )}
                </div>

                {/* Gemini AI Generator Box */}
                <div className="p-4 bg-white/5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-400" /> Gemini AI Album Art Studio
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g. Cyberpunk synthwave album cover with glowing neon vinyl..."
                      className="flex-1 bg-black/40 rounded-xl px-3 py-2 text-xs text-white outline-none focus:bg-black/60"
                    />
                    <button
                      type="button"
                      disabled={isGeneratingAiCover}
                      onClick={async () => {
                        const promptToUse = aiPrompt.trim() || (albumData.title ? `Album cover for ${albumData.title} in genre ${albumData.genre}, futuristic music artwork, 3D render` : 'Futuristic music album cover art, neon vinyl, high resolution 3D render');
                        setIsGeneratingAiCover(true);
                        try {
                          addNotification("Synthesizing AI cover image...", "info");
                          const response = await fetch('/api/gemini/generate-image', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              title: albumData.title || "Music Album",
                              trackInfo: albumData.genre || "Electronic",
                              prompt: promptToUse
                            })
                          });
                          if (!response.ok) throw new Error("AI generation failed");
                          const data = await response.json();
                          if (data.imageUrl) {
                            setAlbumData(prev => ({ ...prev, coverPreview: data.imageUrl, coverFile: null }));
                            addNotification("AI Album Cover generated successfully!", "success");
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

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  if (!albumData.title.trim()) {
                    addNotification("Please enter an album title", "warning");
                    return;
                  }
                  if (!albumData.coverPreview) {
                    addNotification("Please upload or generate an album cover image", "warning");
                    return;
                  }
                  setStep(2);
                }}
                className="px-6 py-3 bg-[#0052FF] hover:bg-[#1a66ff] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Next: Tracklist Builder</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: TRACKLIST BUILDER */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0D1527] p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-md space-y-8"
          >
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-[#0052FF]" /> Step 2: Tracklist Builder
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Upload new audio tracks or select existing releases from your catalog to build your album tracklist.
              </p>
            </div>

            {/* Current Tracklist Items */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Album Tracklist ({tracklist.length} Tracks • {formatDuration(totalDurationSeconds)})
                </span>
                {tracklist.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setTracklist([])}
                    className="text-[10px] font-bold text-rose-400 hover:underline uppercase tracking-wider"
                  >
                    Clear All Tracks
                  </button>
                )}
              </div>

              {tracklist.length === 0 ? (
                <div className="p-8 bg-white/5 rounded-2xl text-center space-y-2">
                  <Disc className="w-10 h-10 text-slate-500 mx-auto animate-spin-slow" />
                  <p className="text-xs font-bold text-slate-300">Your tracklist is empty</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                    Upload audio files below or add tracks from your existing catalog.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tracklist.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-white/5 rounded-2xl flex items-center gap-3 transition-all hover:bg-white/10"
                    >
                      <span className="text-xs font-mono font-bold text-slate-500 w-6 text-center">
                        {index + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleTogglePlayPreview(item.id, item.audioUrl)}
                        className="w-9 h-9 rounded-xl bg-[#0052FF] text-white flex items-center justify-center shrink-0 hover:scale-105 transition-transform cursor-pointer"
                      >
                        {playingTrackId === item.id ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{item.title}</p>
                        <p className="text-[9px] text-slate-400 uppercase font-bold truncate">
                          {item.artist} • {item.genre} {item.isExplicit && <span className="text-rose-400 ml-1">[E]</span>}
                        </p>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400">
                        {formatDuration(item.duration)}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveTrack(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveTrack(index, 'down')}
                          disabled={index === tracklist.length - 1}
                          className="p-1.5 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveTrack(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Audio Track Box */}
            <div className="p-5 bg-white/5 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#0052FF]" /> Add New Audio Track
                </span>
                <button
                  type="button"
                  onClick={() => openDriveModal('audio')}
                  className="text-[10px] font-bold text-[#0052FF] hover:underline uppercase tracking-wider flex items-center gap-1"
                >
                  <Folder className="w-3.5 h-3.5" /> Google Drive Audio
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Track Title</label>
                  <input
                    type="text"
                    value={newTrackTitle}
                    onChange={(e) => setNewTrackTitle(e.target.value)}
                    placeholder="e.g. Track 1 - Horizon"
                    className="w-full bg-black/40 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:bg-black/60"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Genre</label>
                  <input
                    type="text"
                    value={newTrackGenre}
                    onChange={(e) => setNewTrackGenre(e.target.value)}
                    placeholder="e.g. Synthwave"
                    className="w-full bg-black/40 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:bg-black/60"
                  />
                </div>
              </div>

              {/* Audio Drag and Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDraggingAudio(true); }}
                onDragLeave={() => setIsDraggingAudio(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingAudio(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) processAudioFileForNewTrack(file);
                }}
                onClick={() => audioInputRef.current?.click()}
                className={`p-4 rounded-xl flex items-center justify-center gap-3 cursor-pointer transition-all ${
                  isDraggingAudio
                    ? 'bg-[#0052FF]/20 scale-[1.01]'
                    : newTrackFile
                    ? 'bg-blue-950/20'
                    : 'bg-black/30 hover:bg-black/50'
                }`}
              >
                <input
                  type="file"
                  ref={audioInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processAudioFileForNewTrack(file);
                  }}
                  accept={ALLOWED_AUDIO_TYPES.join(',')}
                  className="hidden"
                />
                <FileAudio className="w-5 h-5 text-[#0052FF]" />
                <span className="text-xs font-bold text-white truncate">
                  {newTrackFile ? newTrackFile.name : 'Click or Drag & Drop audio file (MP3, WAV, FLAC)'}
                </span>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleAddNewTrackToAlbum}
                  className="px-5 py-2 bg-[#0052FF] hover:bg-[#1a66ff] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Add Track to Album
                </button>
              </div>
            </div>

            {/* Quick Catalog Track Selector */}
            {artistCatalogTracks.length > 0 && (
              <div className="p-5 bg-white/5 rounded-2xl space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#0052FF]" /> Quick Add From Unassigned Catalog
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {artistCatalogTracks.map(track => {
                    const isAdded = tracklist.some(t => t.id === track.id);
                    return (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => handleAddExistingTrack(track)}
                        disabled={isAdded}
                        className={`p-2.5 rounded-xl flex items-center gap-2.5 text-left transition-all ${
                          isAdded
                            ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                            : 'bg-black/30 hover:bg-black/60 text-white cursor-pointer'
                        }`}
                      >
                        <img src={track.coverUrl} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate">{track.title}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase truncate">{track.genre}</p>
                        </div>
                        {isAdded ? (
                          <Check className="w-4 h-4 text-green-400 shrink-0" />
                        ) : (
                          <Plus className="w-4 h-4 text-[#0052FF] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
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
                  if (tracklist.length === 0) {
                    addNotification("Please add at least one track to the album", "warning");
                    return;
                  }
                  setStep(3);
                }}
                className="px-6 py-3 bg-[#0052FF] hover:bg-[#1a66ff] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Next: Web3 & Royalties</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: WEB3 & ROYALTIES */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0D1527] p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-md space-y-8"
          >
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                <Percent className="w-5 h-5 text-[#0052FF]" /> Step 3: Web3 & Royalty Configuration
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure TON NFT collection minting, primary pricing, edition supply, and collaborator revenue splits.
              </p>
            </div>

            {/* Toggle Web3 NFT Minting */}
            <div className="p-5 bg-white/5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#0052FF]" /> Mint Album as Web3 NFT Collection on TON
                </span>
                <p className="text-[10px] text-slate-400 mt-1">
                  Enables fans to collect, trade, and hold decentralized album editions on TON.
                </p>
              </div>

              <input
                type="checkbox"
                checked={albumData.isMintNFT}
                onChange={(e) => setAlbumData({...albumData, isMintNFT: e.target.checked})}
                className="w-5 h-5 accent-[#0052FF] cursor-pointer"
              />
            </div>

            {albumData.isMintNFT && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Album Primary Mint Price (TON)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={albumData.price}
                      onChange={e => setAlbumData({...albumData, price: e.target.value})}
                      placeholder="5.0"
                      className="w-full bg-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:bg-white/10"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Editions Supply Limit
                    </label>
                    <input
                      type="number"
                      value={albumData.editions}
                      onChange={e => setAlbumData({...albumData, editions: e.target.value})}
                      placeholder="500"
                      className="w-full bg-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:bg-white/10"
                    />
                  </div>
                </div>

                {/* Blockchain Network Selector */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Target Blockchain Network
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'ton-mainnet', title: 'TON Mainnet', badge: 'Recommended', fee: '~0.05 TON' },
                      { id: 'ton-testnet', title: 'TON Testnet', badge: 'Sandbox', fee: 'Free (Test)' },
                      { id: 'ton-miniapp', title: 'Mini App Storage', badge: 'Instant', fee: '~0.02 TON' },
                    ].map(net => (
                      <div
                        key={net.id}
                        onClick={() => setAlbumData({...albumData, blockchain: net.id as any})}
                        className={`p-4 rounded-2xl cursor-pointer transition-all ${
                          albumData.blockchain === net.id
                            ? 'bg-[#0052FF]/20 text-white'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                            <Radio className={`w-3.5 h-3.5 ${albumData.blockchain === net.id ? 'text-[#0052FF]' : 'text-slate-500'}`} />
                            {net.title}
                          </span>
                          <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                            {net.badge}
                          </span>
                        </div>
                        <p className="text-[9px] font-mono text-blue-400 font-bold mt-2">Gas Fee: {net.fee}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Secondary Sales Royalty Slider */}
                <div className="p-5 bg-white/5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-white">
                        Secondary Sales Royalty Percentage
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Percentage earned on every secondary peer-to-peer album resale.
                      </p>
                    </div>
                    <span className="text-lg font-black text-[#0052FF] font-mono">
                      {albumData.secondaryRoyalty}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="0.5"
                    value={albumData.secondaryRoyalty}
                    onChange={(e) => setAlbumData({ ...albumData, secondaryRoyalty: e.target.value })}
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
                      <div key={index} className="flex gap-2 items-center bg-white/5 p-2 rounded-xl">
                        <input
                          type="text"
                          value={split.address}
                          onChange={(e) => {
                            const updated = [...royaltySplits];
                            updated[index].address = e.target.value;
                            setRoyaltySplits(updated);
                          }}
                          placeholder="Collaborator TON Address (EQ...)"
                          className="flex-1 bg-black/40 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none"
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
                          className="w-16 bg-black/40 rounded-lg px-2 py-2 text-xs font-bold text-white text-center outline-none"
                        />
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => setRoyaltySplits(royaltySplits.filter((_, i) => i !== index))}
                            className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-400">Target sum: 100%</span>
                    <span className={totalSplitsPercentage === 100 ? 'text-green-400' : 'text-rose-400'}>
                      Current total: {totalSplitsPercentage}%
                    </span>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-between pt-4">
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
                  if (albumData.isMintNFT && totalSplitsPercentage !== 100) {
                    addNotification(`Royalty splits must total 100% (currently ${totalSplitsPercentage}%)`, "warning");
                    return;
                  }
                  setStep(4);
                }}
                className="px-6 py-3 bg-[#0052FF] hover:bg-[#1a66ff] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Next: Review & Deploy</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: REVIEW & PUBLISH */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0D1527] p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-md space-y-8"
          >
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0052FF]" /> Step 4: Final Review & Album Publication
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Review your album structure, cover vision, tracklist order, and publish to the TonJam network.
              </p>
            </div>

            {/* Album Summary Card */}
            <div className="p-6 bg-black/40 rounded-2xl space-y-6">
              <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                <img src={albumData.coverPreview} alt="" className="w-28 h-28 rounded-2xl object-cover shrink-0" />
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#0052FF]">
                    {albumData.releaseType} • {albumData.genre}
                  </span>
                  <h3 className="text-xl font-black text-white truncate">{albumData.title}</h3>
                  <p className="text-xs text-slate-300 font-semibold mt-0.5">by {albumData.artistName}</p>
                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{albumData.description}</p>
                </div>
              </div>

              {/* Tracklist Preview */}
              <div className="space-y-2 pt-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                  Tracklist Overview ({tracklist.length} Tracks)
                </span>
                <div className="space-y-1.5 max-h-44 overflow-y-auto custom-scrollbar">
                  {tracklist.map((track, i) => (
                    <div key={track.id} className="p-2.5 bg-white/5 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-slate-500 font-bold text-[10px]">{i + 1}</span>
                        <span className="font-bold text-white truncate">{track.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">{formatDuration(track.duration)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {albumData.isMintNFT && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 font-mono text-[10px]">
                  <div className="p-2.5 bg-white/5 rounded-xl">
                    <span className="text-slate-400 block">Price</span>
                    <span className="text-white font-bold">{albumData.price} TON</span>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl">
                    <span className="text-slate-400 block">Editions</span>
                    <span className="text-white font-bold">{albumData.editions}</span>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl">
                    <span className="text-slate-400 block">Royalty</span>
                    <span className="text-green-400 font-bold">{albumData.secondaryRoyalty}%</span>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl">
                    <span className="text-slate-400 block">Network</span>
                    <span className="text-blue-300 font-bold">{albumData.blockchain}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Terms confirmation checkbox */}
            <div className="p-4 bg-blue-950/20 rounded-2xl flex items-start gap-3 text-xs text-slate-300">
              <input
                type="checkbox"
                id="terms-check"
                checked={termsConfirmed}
                onChange={(e) => setTermsConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#0052FF] cursor-pointer"
              />
              <label htmlFor="terms-check" className="cursor-pointer select-none text-[11px] leading-relaxed">
                <strong>Copyright & Publishing Attestation:</strong> I confirm that I own or hold valid licenses to all audio recordings and cover visual assets included in this album release, and agree to publish it to TonJam.
              </label>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!termsConfirmed}
                onClick={handlePublishAlbum}
                className="px-7 py-3 bg-[#0052FF] hover:bg-[#1a66ff] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/25"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Publish Album Now</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Google Drive Import Modal */}
      <GoogleDriveImportModal
        isOpen={driveModalOpen}
        onClose={() => setDriveModalOpen(false)}
        onFileSelected={handleDriveFileSelected}
        fileType={driveModalType}
      />
    </div>
  );
};
