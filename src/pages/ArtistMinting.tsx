import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Image, Box, Loader2, Upload, Info, Check } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { getPlaceholderImage, validateFile, ALLOWED_IMAGE_TYPES, ALLOWED_AUDIO_TYPES } from '@/lib/utils';
import { uploadAudio, uploadCover } from '@/services/storageService';
import { Track, NFTItem } from '@/types';
import { APP_LOGO } from '@/constants';
import { BackButton } from '@/components/BackButton';

const ArtistMinting: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, addUserTrack, addUserNFT, addNotification } = useAudio();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [trackData, setTrackData] = useState({
    title: '',
    genre: '',
    description: '',
    coverFile: null as File | null,
    audioFile: null as File | null,
    coverPreview: '',
    price: '10',
  });

  const [mintData, setMintData] = useState({
    royaltySplits: [{ address: userProfile.walletAddress || '', percentage: 100 }] as { address: string, percentage: number }[],
    supply: 1,
    listingType: 'fixed' as 'fixed' | 'auction',
  });

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
      }
    }
  };

  const handleSubmit = async () => {
    if (!trackData.title || !trackData.genre || !trackData.audioFile || !trackData.coverFile) {
      addNotification("Please fill in all required fields and upload files", "error");
      return;
    }
    setIsLoading(true);

    try {
      addNotification("Uploading assets...", "info");
      const { downloadUrl: audioUrl } = await uploadAudio(trackData.audioFile);
      const { downloadUrl: coverUrl } = await uploadCover(trackData.coverFile);

      const newTrackId = Date.now().toString();
      const newTrack: Track = {
        id: newTrackId,
        songId: `song-${newTrackId}`,
        title: trackData.title,
        artist: userProfile.name || 'Unknown Artist',
        artistId: userProfile.uid,
        coverUrl,
        audioUrl,
        duration: 180,
        genre: trackData.genre,
        isNFT: true,
        artistVerified: true,
        price: trackData.price,
        releaseDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      addUserTrack(newTrack);

      const newNFT: NFTItem = {
        id: Date.now().toString(),
        trackId: newTrackId,
        title: trackData.title,
        owner: userProfile.name || 'Unknown Artist',
        creator: userProfile.name || 'Unknown Artist',
        price: trackData.price,
        imageUrl: coverUrl,
        edition: `1 of ${mintData.supply}`,
        royaltySplits: mintData.royaltySplits,
        description: trackData.description,
        listingType: mintData.listingType,
        history: [{ event: 'Minted', from: 'NullAddress', to: userProfile.name || 'Unknown', date: new Date().toISOString(), price: trackData.price }]
      };
      addUserNFT(newNFT);

      addNotification("Track minted as NFT successfully", "success");
      navigate('/artist-dashboard');
    } catch (error) {
      console.error("Minting failed:", error);
      addNotification("Failed to mint NFT", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <BackButton />
          <h1 className="text-2xl font-black uppercase tracking-tighter">Mint New NFT - Step {step} of 3</h1>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
              <h2 className="text-xl font-black uppercase tracking-tighter">1. Upload Assets</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Audio File</label>
                  <div onClick={() => audioInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-all" >
                    <input type="file" ref={audioInputRef} onChange={(e) => handleFileChange(e, 'audio')} accept={ALLOWED_AUDIO_TYPES.join(',')} className="hidden" />
                    <Music className="h-8 w-8 text-white/20 mb-2" />
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest"> {trackData.audioFile ? trackData.audioFile.name : "Click to Upload Audio"} </span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Cover Art</label>
                  <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-square border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-all overflow-hidden relative" >
                    <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e, 'cover')} accept={ALLOWED_IMAGE_TYPES.join(',')} className="hidden" />
                    {trackData.coverPreview ? (
                      <img src={trackData.coverPreview} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Image className="h-8 w-8 text-white/20 mb-2" />
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Upload Cover</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
              <h2 className="text-xl font-black uppercase tracking-tighter">2. Track Metadata</h2>
              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Track Title</label>
                <input type="text" value={trackData.title} onChange={e => setTrackData({...trackData, title: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-cyan-500 transition-colors" placeholder="e.g. Midnight Protocol" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Genre</label>
                <select value={trackData.genre} onChange={e => setTrackData({...trackData, genre: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-cyan-500 transition-colors" >
                  <option value="" disabled>Select Genre</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Hip Hop">Hip Hop</option>
                  <option value="Rock">Rock</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Description</label>
                <textarea value={trackData.description} onChange={e => setTrackData({...trackData, description: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-cyan-500 transition-colors h-24" placeholder="Describe your track..." />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
              <h2 className="text-xl font-black uppercase tracking-tighter">3. Minting Options</h2>
              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Listing Price (TON)</label>
                <input type="number" value={trackData.price} onChange={e => setTrackData({...trackData, price: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-cyan-500 transition-colors" />
              </div>
              <div>
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Royalty Splits (%)</h3>
                {mintData.royaltySplits.map((split, index) => (
                  <div key={index} className="flex gap-4 items-center mb-4">
                    <input type="text" placeholder="Wallet Address" value={split.address} onChange={(e) => { const newSplits = [...mintData.royaltySplits]; newSplits[index].address = e.target.value; setMintData({...mintData, royaltySplits: newSplits}); }} className="flex-1 bg-black/20 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500/50" />
                    <input type="number" placeholder="%" value={split.percentage} onChange={(e) => { const newSplits = [...mintData.royaltySplits]; newSplits[index].percentage = Number(e.target.value); setMintData({...mintData, royaltySplits: newSplits}); }} className="w-20 bg-black/20 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500/50" />
                  </div>
                ))}
                <button type="button" onClick={() => setMintData({...mintData, royaltySplits: [...mintData.royaltySplits, { address: '', percentage: 0 }]})} className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest hover:text-cyan-400"> + Add Recipient </button>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t border-white/10">
            <button type="button" disabled={step === 1} onClick={() => setStep(step - 1)} className="px-6 py-3 bg-white/5 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-white/10 disabled:opacity-50">Back</button>
            {step < 3 ? (
              <button type="button" onClick={() => setStep(step + 1)} className="px-6 py-3 bg-cyan-600 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-cyan-500">Next</button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={isLoading} className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-2xl text-sm font-bold uppercase tracking-widest hover:scale-[1.01] flex items-center gap-2">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Box className="h-4 w-4" /> Mint NFT</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistMinting;
