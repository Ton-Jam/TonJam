import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Image, Info, Box } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { Track, NFTItem } from '@/types';
import { MOCK_USER } from '@/constants';

const ArtistOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, setUserProfile, addUserTrack, addUserNFT, addNotification } = useAudio();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  /* Step 1: Profile State */
  const [profileData, setProfileData] = useState({
    name: userProfile.name || '',
    handle: userProfile.handle || '',
    bio: userProfile.bio || '',
    avatar: userProfile.avatar || '',
    bannerUrl: userProfile.bannerUrl || ''
  });

  /* Step 2: Track State */
  const [trackData, setTrackData] = useState({
    title: '',
    genre: '',
    description: '',
    coverFile: null as File | null,
    audioFile: null as File | null,
    coverPreview: '',
    price: '10'
  });

  /* Step 3: NFT State */
  const [mintData, setMintData] = useState({
    royalty: 10,
    supply: 1,
    listingType: 'fixed' as 'fixed' | 'auction',
    price: '10'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserProfile({ ...userProfile, ...profileData, isVerifiedArtist: true /* Upgrade user to artist */ });
    addNotification("Artist profile initialized", "success");
    setStep(2);
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackData.title || !trackData.genre) {
      addNotification("Please fill in required track details", "error");
      return;
    }
    setIsLoading(true);
    /* Simulate upload delay */
    setTimeout(() => {
      const newTrack: Track = {
        id: Date.now().toString(),
        title: trackData.title,
        artist: profileData.name,
        artistId: userProfile.id,
        coverUrl: trackData.coverPreview || 'https://picsum.photos/400/400',
        audioUrl: '', /* In a real app, this would be the uploaded URL */
        duration: 180, /* Mock duration */
        genre: trackData.genre,
        isNFT: false,
        artistVerified: true,
        price: trackData.price,
        releaseDate: new Date().toISOString()
      };
      addUserTrack(newTrack);
      addNotification("Track uploaded successfully", "success");
      setIsLoading(false);
      setStep(3);
    }, 1500);
  };

  const handleMintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      /* Create NFT from the track */
      const newNFT: NFTItem = {
        id: Date.now().toString(),
        trackId: Date.now().toString(), /* Should link to the actual track ID */
        title: trackData.title,
        owner: profileData.name,
        creator: profileData.name,
        price: mintData.price,
        imageUrl: trackData.coverPreview || 'https://picsum.photos/400/400',
        edition: `1 of ${mintData.supply}`,
        royalty: mintData.royalty,
        description: trackData.description,
        listingType: mintData.listingType,
        history: [
          { event: 'Minted', from: 'NullAddress', to: profileData.name, date: new Date().toISOString(), price: mintData.price }
        ]
      };
      addUserNFT(newNFT);
      addNotification("Genesis NFT minted successfully", "success");
      setIsLoading(false);
      navigate('/artist-dashboard');
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'audio') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'cover') {
        setTrackData(prev => ({ ...prev, coverFile: file, coverPreview: URL.createObjectURL(file) }));
      } else {
        setTrackData(prev => ({ ...prev, audioFile: file }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter mb-2">Artist Protocol Initialization</h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Step {step} of 3</p>
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className={`h-1 w-16 rounded-full transition-colors ${step >= 1 ? 'bg-blue-500' : 'bg-white/10'}`}></div>
            <div className={`h-1 w-16 rounded-full transition-colors ${step >= 2 ? 'bg-blue-500' : 'bg-white/10'}`}></div>
            <div className={`h-1 w-16 rounded-full transition-colors ${step >= 3 ? 'bg-blue-500' : 'bg-white/10'}`}></div>
          </div>
        </header>

        <div className="glass p-8 rounded-[10px] -white/5 shadow-2xl relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 blur-[100px] rounded-full pointer-events-none"></div>

          {step === 1 && (
            <form onSubmit={handleProfileSubmit} className="space-y-6 animate-in fade-in slide-in-from-right duration-500 relative z-10">
              <h2 className="text-xl font-bold uppercase tracking-tight mb-6">Identity Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Artist Name</label>
                  <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full bg-white/5 -white/10 rounded-[10px] px-4 py-3 text-sm font-bold text-white outline-none focus:-blue-500 transition-colors" placeholder="Enter your stage name" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Handle (@)</label>
                  <input type="text" value={profileData.handle} onChange={e => setProfileData({...profileData, handle: e.target.value})} className="w-full bg-white/5 -white/10 rounded-[10px] px-4 py-3 text-sm font-bold text-white outline-none focus:-blue-500 transition-colors" placeholder="@username" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Bio</label>
                  <textarea value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} className="w-full bg-white/5 -white/10 rounded-[10px] px-4 py-3 text-sm font-bold text-white outline-none focus:-blue-500 transition-colors h-32 resize-none" placeholder="Tell your story..." />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest py-4 rounded-[10px] transition-all hover:scale-[1.02] active:scale-[0.98]" > Confirm Identity </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleTrackSubmit} className="space-y-6 animate-in fade-in slide-in-from-right duration-500 relative z-10">
              <h2 className="text-xl font-bold uppercase tracking-tight mb-6">Upload Genesis Track</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Track Title</label>
                    <input type="text" value={trackData.title} onChange={e => setTrackData({...trackData, title: e.target.value})} className="w-full bg-white/5 -white/10 rounded-[10px] px-4 py-3 text-sm font-bold text-white outline-none focus:-blue-500 transition-colors" placeholder="e.g. Midnight Protocol" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Genre</label>
                    <select value={trackData.genre} onChange={e => setTrackData({...trackData, genre: e.target.value})} className="w-full bg-white/5 -white/10 rounded-[10px] px-4 py-3 text-sm font-bold text-white outline-none focus:-blue-500 transition-colors appearance-none" required >
                      <option value="" disabled>Select Genre</option>
                      <option value="Electronic">Electronic</option>
                      <option value="Hip Hop">Hip Hop</option>
                      <option value="Rock">Rock</option>
                      <option value="Jazz">Jazz</option>
                      <option value="Classical">Classical</option>
                      <option value="Pop">Pop</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Audio File</label>
                    <div onClick={() => audioInputRef.current?.click()} className="w-full h-24 -2 -dashed -white/10 rounded-[10px] flex flex-col items-center justify-center cursor-pointer hover:-blue-500/50 hover:bg-white/5 transition-all" >
                      <input type="file" ref={audioInputRef} onChange={(e) => handleFileChange(e, 'audio')} accept="audio/*" className="hidden" />
                      <Music className="h-6 w-6 text-white/20 mb-2" />
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest"> {trackData.audioFile ? trackData.audioFile.name : "Click to Upload Audio"} </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Cover Art</label>
                    <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-square -2 -dashed -white/10 rounded-[10px] flex flex-col items-center justify-center cursor-pointer hover:-blue-500/50 hover:bg-white/5 transition-all overflow-hidden relative" >
                      <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e, 'cover')} accept="image/*" className="hidden" />
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
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setStep(1)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest py-4 rounded-[10px] transition-all" > Back </button>
                <button type="submit" disabled={isLoading} className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest py-4 rounded-[10px] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2" >
                  {isLoading ? (
                    <div className="w-5 h-5 -2 -white/30 -t-white rounded-full animate-spin"></div>
                  ) : (
                    "Upload Track"
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleMintSubmit} className="space-y-6 animate-in fade-in slide-in-from-right duration-500 relative z-10">
              <h2 className="text-xl font-bold uppercase tracking-tight mb-6">Mint Genesis Asset</h2>
              <div className="flex gap-6 mb-8">
                <div className="w-32 h-32 rounded-[10px] overflow-hidden shadow-xl -white/10 flex-shrink-0">
                  <img src={trackData.coverPreview || 'https://picsum.photos/400/400'} alt="Cover" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight">{trackData.title}</h3>
                  <p className="text-sm text-white/60 font-medium mb-4">{profileData.name}</p>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full"> {trackData.genre} </span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest rounded-full"> Genesis Edition </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Listing Price (TON)</label>
                  <input type="number" value={mintData.price} onChange={e => setMintData({...mintData, price: e.target.value})} className="w-full bg-white/5 -white/10 rounded-[10px] px-4 py-3 text-sm font-bold text-white outline-none focus:-blue-500 transition-colors" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Royalty (%)</label>
                  <input type="number" value={mintData.royalty} onChange={e => setMintData({...mintData, royalty: parseInt(e.target.value)})} className="w-full bg-white/5 -white/10 rounded-[10px] px-4 py-3 text-sm font-bold text-white outline-none focus:-blue-500 transition-colors" min="0" max="50" />
                </div>
              </div>
              <div className="p-4 bg-blue-600/10 -blue-500/20 rounded-[10px] flex items-start gap-3">
                <Info className="h-4 w-4 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Smart Contract Deployment</h4>
                  <p className="text-[10px] text-white/60 leading-relaxed"> By confirming, you will deploy a new smart contract for this asset on the TON blockchain. This action is irreversible and requires a small gas fee (simulated). </p>
                </div>
              </div>
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setStep(2)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest py-4 rounded-[10px] transition-all" > Back </button>
                <button type="submit" disabled={isLoading} className="flex-[2] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold uppercase tracking-widest py-4 rounded-[10px] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20" >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 -2 -white/30 -t-white rounded-full animate-spin"></div>
                      <span>Minting...</span>
                    </>
                  ) : (
                    <>
                      <Box className="h-4 w-4" />
                      <span>Mint Genesis NFT</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistOnboarding;
