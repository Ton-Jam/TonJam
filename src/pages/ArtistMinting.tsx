import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Image, Box, Loader2, Upload, Info, Check, ChevronRight, Plus, Percent } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { getPlaceholderImage, validateFile, ALLOWED_IMAGE_TYPES, ALLOWED_AUDIO_TYPES } from '@/lib/utils';
import { uploadAudio, uploadCover, uploadMetadata } from '@/services/storageService';
import { Track, NFTItem, RoyaltySplitExtended } from '@/types';
import { BackButton } from '@/components/BackButton';
import LoadingOverlay from '@/components/LoadingOverlay';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { mintTonJamNFT } from '@/services/tonService';
import { motion } from 'motion/react';

const ArtistMinting: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, addUserTrack, addUserNFT, addNotification, allTracks } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'default' | 'transaction' | 'upload' | 'mint'>('default');
  const [loadingMessage, setLoadingMessage] = useState('Processing...');

  const artistTracks = allTracks.filter(t => t.artistId === userProfile.uid && !t.isNFT);

  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [trackData, setTrackData] = useState({
    title: '',
    genre: '',
    description: '',
    coverFile: null as File | null,
    audioFile: null as File | null,
    coverPreview: '',
    price: '2.5',
    editions: '100'
  });

  const [royaltySplits, setRoyaltySplits] = useState<RoyaltySplitExtended[]>([{ address: userProfile.walletAddress || '', percentage: 100, label: 'Creator' }]);

  useEffect(() => {
    if (selectedTrack) {
      setTrackData({
        title: selectedTrack.title,
        genre: selectedTrack.genre || '',
        description: selectedTrack.description || '',
        coverFile: null,
        audioFile: null,
        coverPreview: selectedTrack.coverUrl,
        price: selectedTrack.price || '2.5',
        editions: selectedTrack.editions || '100'
      });
      
      const extendedSplits: RoyaltySplitExtended[] = (selectedTrack.royaltySplits || []).map(s => ({
        address: s.address,
        percentage: s.percentage,
        label: s.label || 'Collaborator'
      }));
      
      setRoyaltySplits(extendedSplits.length > 0 ? extendedSplits : [{ address: userProfile.walletAddress || '', percentage: 100, label: 'Creator' }]);
      setStep(2);
    }
  }, [selectedTrack, userProfile.walletAddress]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'audio') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'cover') {
        const validation = validateFile(file, 'image', 10);
        if (!validation.isValid) {
          addNotification(validation.error || "Invalid file", "error");
          return;
        }
        setTrackData(prev => ({ ...prev, coverFile: file, coverPreview: URL.createObjectURL(file) }));
      } else {
        const validation = validateFile(file, 'audio', 50);
        if (!validation.isValid) {
          addNotification(validation.error || "Invalid file", "error");
          return;
        }
        setTrackData(prev => ({ ...prev, audioFile: file }));
        if (!trackData.title) setTrackData(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, "") }));
      }
    }
  };

  const handleSubmit = async () => {
    if (!trackData.title || !trackData.genre || (!selectedTrack && (!trackData.audioFile || !trackData.coverFile))) {
      addNotification("Please fill in all required fields and upload files", "error");
      return;
    }

    const wallet = tonConnectUI.wallet?.account.address;
    if (!wallet) {
      addNotification("Please connect your TON wallet first", "warning");
      tonConnectUI.openModal();
      return;
    }
    
    setIsLoading(true);
    setLoadingType('upload');
    setLoadingMessage('Uploading assets to storage...');

    try {
      let audioUrl = selectedTrack?.audioUrl || '';
      let coverUrl = selectedTrack?.coverUrl || '';

      if (trackData.audioFile) {
        const { downloadUrl } = await uploadAudio(trackData.audioFile);
        audioUrl = downloadUrl;
      }
      if (trackData.coverFile) {
        const { downloadUrl } = await uploadCover(trackData.coverFile);
        coverUrl = downloadUrl;
      }

      setLoadingType('mint');
      setLoadingMessage('Creating metadata artifact...');

      const royaltySplitsDecimals = royaltySplits.map(s => ({
        ...s,
        percentage: s.percentage / 100
      }));

      // Create and upload metadata
      const metadata = {
        name: trackData.title,
        description: trackData.description,
        image: coverUrl,
        animation_url: audioUrl,
        attributes: [
          { trait_type: "Genre", value: trackData.genre },
          { trait_type: "RoyaltySplits", value: JSON.stringify(royaltySplitsDecimals) },
          { trait_type: "Editions", value: trackData.editions }
        ]
      };
      
      const metadataRes = await uploadMetadata(metadata);

      setLoadingType('transaction');
      setLoadingMessage('Confirming on TON Blockchain...');

      await mintTonJamNFT(tonConnectUI, wallet, metadataRes.downloadUrl);

      // Save to database
      const finalTrackId = selectedTrack?.id || `track-nft-${Date.now()}`;
      const newTrack: Track = {
        ...(selectedTrack || {}),
        id: finalTrackId,
        songId: `song-${finalTrackId}`,
        title: trackData.title,
        artist: userProfile.name || 'Unknown Artist',
        artistId: userProfile.uid,
        coverUrl,
        audioUrl,
        duration: selectedTrack?.duration || 180,
        genre: trackData.genre,
        isNFT: true,
        artistVerified: true,
        price: trackData.price,
        editions: trackData.editions,
        royaltySplits: royaltySplitsDecimals,
        minted: (selectedTrack?.minted || 0) + 1,
        metadataUrl: metadataRes.downloadUrl,
        updatedAt: new Date().toISOString()
      } as Track;

      await addUserTrack(newTrack);

      const newNFT: NFTItem = {
        id: `nft-${Date.now()}`,
        trackId: finalTrackId,
        title: trackData.title,
        owner: userProfile.walletAddress || userProfile.uid,
        creator: userProfile.name || 'Unknown Artist',
        artist: userProfile.name,
        artistId: userProfile.uid,
        price: trackData.price,
        imageUrl: coverUrl,
        coverUrl: coverUrl,
        audioUrl: audioUrl,
        edition: `${(selectedTrack?.minted || 0) + 1} of ${trackData.editions}`,
        supply: parseInt(trackData.editions),
        minted: 1,
        royaltySplits: royaltySplitsDecimals,
        description: trackData.description,
        listingType: 'fixed',
        ipfsUrl: metadataRes.downloadUrl,
        history: [{ event: 'Minted', from: 'NullAddress', to: userProfile.name || 'Unknown', date: new Date().toISOString(), price: trackData.price }]
      };
      
      await addUserNFT(newNFT);

      setIsLoading(false);
      addNotification("Track minted as NFT successfully!", "success");
      navigate('/artist-dashboard');
    } catch (error) {
      console.error("Minting failed:", error);
      setIsLoading(false);
      addNotification("Minting failed. Check your connection.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white p-6 pb-24 relative overflow-x-hidden">
      <LoadingOverlay isVisible={isLoading} type={loadingType} message={loadingMessage} />
      
      {/* Background Glow */}
      <div className="fixed inset-0 opacity-10 blur-[120px] pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton className="bg-white/5 hover:bg-white/10" />
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter">Protocol Forge</h1>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Step {step} of 3: {step === 1 ? 'Selection' : step === 2 ? 'Metadata' : 'Minting'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1 w-8 rounded-full transition-all ${s <= step ? 'bg-cyan-500' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] shadow-2xl backdrop-blur-md space-y-8 relative overflow-hidden group">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black uppercase tracking-tighter">Select Artifact</h2>
                <button onClick={() => setStep(2)} className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest hover:text-cyan-400 flex items-center gap-2">
                  Skip to Upload <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {artistTracks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {artistTracks.map(track => (
                    <motion.div
                      key={track.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTrack(track)}
                      className="bg-white/5 border border-white/10 p-4 rounded-3xl flex items-center gap-4 hover:border-cyan-500/50 transition-all cursor-pointer group/item"
                    >
                      <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0">
                        <img src={track.coverUrl} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black uppercase tracking-tight truncate">{track.title}</h4>
                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">{track.genre}</p>
                      </div>
                      <Check className="w-4 h-4 text-cyan-500 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                    </motion.div>
                  ))}
                  
                  <div 
                    onClick={() => setStep(2)}
                    className="bg-white/5 border border-dashed border-white/10 p-4 rounded-3xl flex items-center justify-center gap-4 hover:border-purple-500/50 transition-all cursor-pointer group/new"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center group-hover/new:rotate-90 transition-transform">
                      <Plus className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">New Upload</span>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Music className="w-8 h-8 text-white/20" />
                  </div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">No existing artifacts found to mint.</p>
                  <button onClick={() => setStep(2)} className="px-8 py-4 bg-cyan-500 text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Start New Artifact</button>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-black uppercase tracking-tighter">Asset Metadata</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <div 
                    onClick={() => fileInputRef.current?.click()} 
                    className="w-full aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-all overflow-hidden relative group" 
                  >
                    <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e, 'cover')} accept={ALLOWED_IMAGE_TYPES.join(',')} className="hidden" />
                    {trackData.coverPreview ? (
                      <img src={trackData.coverPreview} alt="Cover" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="w-8 h-8 text-white/20" />
                        </div>
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Upload Vision</span>
                      </>
                    )}
                  </div>

                  {!selectedTrack && (
                    <div 
                      onClick={() => audioInputRef.current?.click()} 
                      className="w-full h-32 bg-white/5 border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 transition-all group" 
                    >
                      <input type="file" ref={audioInputRef} onChange={(e) => handleFileChange(e, 'audio')} accept={ALLOWED_AUDIO_TYPES.join(',')} className="hidden" />
                      <Music className={`h-8 w-8 transition-all ${trackData.audioFile ? 'text-purple-500 animate-pulse' : 'text-white/20 group-hover:scale-110'}`} />
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-4"> {trackData.audioFile ? trackData.audioFile.name : "Capture Sonic Data"} </span>
                    </div>
                  )}

                  {selectedTrack && (
                    <div className="p-6 bg-white/5 rounded-[32px] border border-white/10 flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                        <Check className="w-6 h-6 text-cyan-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Sonic Data Linked</p>
                        <p className="text-xs font-bold text-white mt-1">Existing track selected</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 ml-2">Manifest Title</label>
                    <input type="text" value={trackData.title} onChange={e => setTrackData({...trackData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-cyan-500 transition-colors uppercase tracking-tight" placeholder="Midnight Protocol" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 ml-2">Sonic Category</label>
                    <select value={trackData.genre} onChange={e => setTrackData({...trackData, genre: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-cyan-500 transition-colors uppercase tracking-widest" >
                      <option value="" disabled>Select Genre</option>
                      {['Electronic', 'Hip-hop', 'Ambient', 'Synthwave', 'Phonk', 'Techno'].map(g => (
                        <option key={g} value={g} className="bg-[#15191C]">{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 ml-2">Artifact Lore</label>
                    <textarea value={trackData.description} onChange={e => setTrackData({...trackData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-cyan-500 transition-colors h-32 resize-none" placeholder="Describe the frequency..." />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-8 border-t border-white/5">
                <button type="button" onClick={() => setStep(1)} className="px-10 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Back</button>
                <button type="button" onClick={() => setStep(3)} className="px-10 py-4 bg-cyan-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_10px_30px_rgba(6,182,212,0.2)]">Next Stage</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-black uppercase tracking-tighter">Economic Parameters</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 ml-2">Market Price (TON)</label>
                  <input type="number" value={trackData.price} onChange={e => setTrackData({...trackData, price: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-black text-amber-500 outline-none focus:border-amber-500/50 transition-colors" />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 ml-2">Max Editions</label>
                  <input type="number" value={trackData.editions} onChange={e => setTrackData({...trackData, editions: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-black text-purple-500 outline-none focus:border-purple-500/50 transition-colors" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4 px-2">
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <Percent className="w-3 h-3" /> Protocol Distribution
                  </h3>
                  <button type="button" onClick={() => setRoyaltySplits([...royaltySplits, { address: '', percentage: 0, label: 'Collaborator' }])} className="text-[9px] font-bold text-cyan-500 uppercase tracking-widest hover:text-cyan-400"> + Add Node </button>
                </div>
                
                <div className="space-y-3">
                  {royaltySplits.map((split, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white/5 p-4 rounded-2xl border border-white/10 animate-in fade-in duration-300">
                      <input 
                        type="text" 
                        placeholder="Role (e.g. Producer)" 
                        value={split.label} 
                        onChange={(e) => { const newSplits = [...royaltySplits]; newSplits[index].label = e.target.value; setRoyaltySplits(newSplits); }} 
                        className="w-full sm:w-32 bg-transparent border-none outline-none text-xs font-bold p-0 text-cyan-500" 
                      />
                      <input 
                        type="text" 
                        placeholder="TON Wallet Address" 
                        value={split.address} 
                        onChange={(e) => { const newSplits = [...royaltySplits]; newSplits[index].address = e.target.value; setRoyaltySplits(newSplits); }} 
                        className="flex-1 bg-transparent border-none outline-none text-xs font-bold p-0 font-mono" 
                      />
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-xl">
                          <input 
                            type="number" 
                            placeholder="0" 
                            value={split.percentage} 
                            onChange={(e) => { const newSplits = [...royaltySplits]; newSplits[index].percentage = Number(e.target.value); setRoyaltySplits(newSplits); }} 
                            className="w-12 bg-transparent border-none outline-none text-xs font-black p-0 text-right" 
                          />
                          <span className="text-[10px] font-bold text-white/20">%</span>
                        </div>
                        <button type="button" onClick={() => setRoyaltySplits(royaltySplits.filter((_, i) => i !== index))} className="p-2 text-white/20 hover:text-red-500 transition-colors">
                          <Plus className="w-4 h-4 rotate-45" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-cyan-500/10 border border-cyan-500/20 rounded-3xl space-y-4">
                <div className="flex items-center gap-3">
                  <Info className="w-4 h-4 text-cyan-500" />
                  <p className="text-[10px] font-black text-cyan-500/70 uppercase tracking-widest">Deployment Summary</p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white/60">Estimated Protocol Cost</span>
                  <span className="text-sm font-black text-white">0.05 TON</span>
                </div>
              </div>

              <div className="flex justify-between pt-8 border-t border-white/5">
                <button type="button" onClick={() => setStep(2)} className="px-10 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Back</button>
                <button 
                  type="button" 
                  onClick={handleSubmit} 
                  disabled={isLoading} 
                  className="px-12 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-[0_10px_30px_rgba(6,182,212,0.2)]"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Box className="h-4 w-4" /> Initialize Mint</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistMinting;
