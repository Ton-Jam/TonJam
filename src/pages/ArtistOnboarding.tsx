import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Image, Info, Box, Upload, Loader2, Camera, Image as ImageIcon } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { getPlaceholderImage, validateFile, ALLOWED_IMAGE_TYPES, ALLOWED_AUDIO_TYPES } from '@/lib/utils';
import { uploadToIPFS } from '@/services/pinataService';
import { Track, NFTItem } from '@/types';
import { MOCK_USER, APP_LOGO } from '@/constants';
import { db, auth, handleFirestoreError, OperationType, cleanUpdateData } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const ArtistOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, setUserProfile, addUserTrack, addUserNFT, addNotification } = useAudio();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

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
    price: '10',
    createdTrackId: ''
  });

  /* Step 3: NFT State */
  const [mintData, setMintData] = useState({
    royaltySplits: [{ address: userProfile.walletAddress || '', percentage: 100 }] as { address: string, percentage: number }[],
    supply: 1,
    listingType: 'fixed' as 'fixed' | 'auction',
    price: '10'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleProfileFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file, 'image', 5);
      if (!validation.isValid) {
        addNotification(validation.error || "Invalid file", "error");
        e.target.value = '';
        return;
      }
      
      setIsUploading(true);
      try {
        addNotification(`Uploading ${type} to IPFS...`, 'info');
        const { ipfsUrl } = await uploadToIPFS(file);
        setProfileData(prev => ({ ...prev, [type === 'avatar' ? 'avatar' : 'bannerUrl']: ipfsUrl }));
        addNotification(`${type.toUpperCase()} uploaded to IPFS`, 'success');
      } catch (error) {
        console.error(`Error uploading ${type}:`, error);
        addNotification(`Failed to upload ${type} to IPFS`, 'error');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (user) {
      try {
        setIsLoading(true);
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, cleanUpdateData({
          ...profileData,
          isVerifiedArtist: true,
          role: 'artist'
        }));
        
        setUserProfile({ ...userProfile, ...profileData, isVerifiedArtist: true, role: 'artist' });
        addNotification("Artist profile initialized", "success");
        setStep(2);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Fallback for non-logged in users (shouldn't happen with onboarding)
      setUserProfile({ ...userProfile, ...profileData, isVerifiedArtist: true });
      addNotification("Artist profile initialized (local)", "success");
      setStep(2);
    }
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackData.title || !trackData.genre) {
      addNotification("Please fill in required track details", "error");
      return;
    }
    setIsLoading(true);

    // 0. Double check validation
    if (trackData.audioFile) {
      const audioValidation = validateFile(trackData.audioFile, 'audio', 50);
      if (!audioValidation.isValid) {
        addNotification(audioValidation.error, "error");
        setIsLoading(false);
        return;
      }
    }
    if (trackData.coverFile) {
      const coverValidation = validateFile(trackData.coverFile, 'image', 10);
      if (!coverValidation.isValid) {
        addNotification(coverValidation.error, "error");
        setIsLoading(false);
        return;
      }
    }

    /* Simulate upload delay */
    setTimeout(() => {
      const newTrackId = Date.now().toString();
      const newTrack: Track = {
        id: newTrackId,
        title: trackData.title,
        artist: profileData.name,
        artistId: userProfile.id,
        coverUrl: trackData.coverPreview || getPlaceholderImage(trackData.title || 'onboarding-track'),
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', /* Placeholder audio */
        duration: 180, /* Mock duration */
        genre: trackData.genre,
        isNFT: false,
        artistVerified: true,
        price: trackData.price,
        releaseDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      addUserTrack(newTrack);
      setTrackData(prev => ({ ...prev, createdTrackId: newTrackId }));
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
        trackId: trackData.createdTrackId || Date.now().toString(),
        title: trackData.title,
        owner: profileData.name,
        creator: profileData.name,
        price: mintData.price,
        imageUrl: trackData.coverPreview || getPlaceholderImage(trackData.title || 'onboarding-track'),
        edition: `1 of ${mintData.supply}`,
        royaltySplits: mintData.royaltySplits,
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
        const validation = validateFile(file, 'image', 10);
        if (!validation.isValid) {
          addNotification(validation.error || "Invalid file", "error");
          e.target.value = '';
          return;
        }
        setTrackData(prev => ({ ...prev, coverFile: file, coverPreview: URL.createObjectURL(file) }));
      } else {
        const validation = validateFile(file, 'audio', 50);
        if (!validation.isValid) {
          addNotification(validation.error || "Invalid file", "error");
          e.target.value = '';
          return;
        }
        setTrackData(prev => ({ ...prev, audioFile: file }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-4 pb-4 px-4 md:px-4">
      <div className="max-w-2xl mx-auto">
        <header className="mb-4 text-center">
          <h1 className="text-[26px] md:text-[32px] font-bold uppercase tracking-tighter mb-4">Artist Protocol Initialization</h1>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Step {step} of 3</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className={`h-1 w-16 rounded-full transition-colors ${step >= 1 ? 'bg-blue-500' : 'bg-muted'}`}></div>
            <div className={`h-1 w-16 rounded-full transition-colors ${step >= 2 ? 'bg-blue-500' : 'bg-muted'}`}></div>
            <div className={`h-1 w-16 rounded-full transition-colors ${step >= 3 ? 'bg-blue-500' : 'bg-muted'}`}></div>
          </div>
        </header>

        <div className="glass p-4 rounded-[10px] border border-white/5 shadow-2xl relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 blur-[100px] rounded-full pointer-events-none"></div>

          {step === 1 && (
            <form onSubmit={handleProfileSubmit} className="space-y-6 animate-in fade-in slide-in-from-right duration-500 relative z-10">
              <h2 className="text-xl font-bold uppercase tracking-tight mb-4">Identity Configuration</h2>
              
              {/* Image Uploads */}
              <div className="space-y-6">
                <div className="relative h-32 w-full rounded-[10px] overflow-hidden bg-muted/50 group">
                  <img 
                    src={profileData.bannerUrl || getPlaceholderImage('banner-onboarding', 1200, 400)} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" 
                    alt="Banner" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-4 py-2 bg-blue-600 rounded-full text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                    >
                      {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
                      Change Banner
                    </button>
                  </div>
                  <input type="file" hidden ref={bannerInputRef} onChange={(e) => handleProfileFileChange(e, 'banner')} accept={ALLOWED_IMAGE_TYPES.join(',')} />
                </div>

                <div className="flex items-center gap-6">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-muted/50 group flex-shrink-0">
                    <img 
                      src={profileData.avatar || getPlaceholderImage('avatar-onboarding')} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" 
                      alt="Avatar" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={isUploading}
                        className="p-2 bg-blue-600 rounded-full text-white"
                      >
                        {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
                      </button>
                    </div>
                    <input type="file" hidden ref={avatarInputRef} onChange={(e) => handleProfileFileChange(e, 'avatar')} accept={ALLOWED_IMAGE_TYPES.join(',')} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold uppercase tracking-tight">Profile Visuals</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Upload your artist avatar and banner</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Artist Name</label>
                  <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full bg-muted/50 border border-white/10 rounded-[10px] px-4 py-4 text-sm font-bold text-foreground outline-none focus:border-blue-500 transition-colors" placeholder="Enter your stage name" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Handle (@)</label>
                  <input type="text" value={profileData.handle} onChange={e => setProfileData({...profileData, handle: e.target.value})} className="w-full bg-muted/50 border border-white/10 rounded-[10px] px-4 py-4 text-sm font-bold text-foreground outline-none focus:border-blue-500 transition-colors" placeholder="@username" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Bio</label>
                  <textarea value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} className="w-full bg-muted/50 border border-white/10 rounded-[10px] px-4 py-4 text-sm font-bold text-foreground outline-none focus:border-blue-500 transition-colors h-32 resize-none" placeholder="Tell your story..." />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-foreground font-bold uppercase tracking-widest py-4 rounded-[10px] transition-all hover:scale-[1.02] active:scale-[0.98]" > Confirm Identity </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleTrackSubmit} className="space-y-4 animate-in fade-in slide-in-from-right duration-500 relative z-10">
              <h2 className="text-xl font-bold uppercase tracking-tight mb-4">Upload Genesis Track</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Track Title</label>
                    <input type="text" value={trackData.title} onChange={e => setTrackData({...trackData, title: e.target.value})} className="w-full bg-muted/50 border border-white/10 rounded-[10px] px-4 py-4 text-sm font-bold text-foreground outline-none focus:border-blue-500 transition-colors" placeholder="e.g. Midnight Protocol" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Genre</label>
                    <select value={trackData.genre} onChange={e => setTrackData({...trackData, genre: e.target.value})} className="w-full bg-muted/50 border border-white/10 rounded-[10px] px-4 py-4 text-sm font-bold text-foreground outline-none focus:border-blue-500 transition-colors appearance-none" required >
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
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Audio File</label>
                    <div onClick={() => audioInputRef.current?.click()} className="w-full h-24 border-2 border-dashed border-white/10 rounded-[10px] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-muted/50 transition-all" >
                      <input type="file" ref={audioInputRef} onChange={(e) => handleFileChange(e, 'audio')} accept={ALLOWED_AUDIO_TYPES.join(',')} className="hidden" />
                      <Music className="h-6 w-6 text-muted-foreground/50 mb-4" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest"> {trackData.audioFile ? trackData.audioFile.name : "Click to Upload Audio"} </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Cover Art</label>
                    <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-square border-2 border-dashed border-white/10 rounded-[10px] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-muted/50 transition-all overflow-hidden relative" >
                      <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e, 'cover')} accept={ALLOWED_IMAGE_TYPES.join(',')} className="hidden" />
                      {trackData.coverPreview ? (
                        <img src={trackData.coverPreview} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Image className="h-8 w-8 text-muted-foreground/50 mb-4" />
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Upload Cover</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4 flex flex-col md:flex-row gap-4">
                <button type="button" onClick={() => setStep(1)} className="flex-1 bg-muted/50 hover:bg-muted text-foreground font-bold uppercase tracking-widest py-4 rounded-[10px] transition-all" > Back </button>
                <button type="button" onClick={() => navigate('/artist-dashboard')} className="flex-1 bg-muted/50 hover:bg-muted text-foreground font-bold uppercase tracking-widest py-4 rounded-[10px] transition-all" > Skip Upload </button>
                <button type="submit" disabled={isLoading} className="flex-[2] bg-blue-600 hover:bg-blue-500 text-foreground font-bold uppercase tracking-widest py-4 rounded-[10px] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-4" >
                  {isLoading ? (
                    <img src={APP_LOGO} className="w-5 h-5 object-contain animate-[spin_3s_linear_infinite] opacity-80" alt="Loading..." />
                  ) : (
                    "Upload Track"
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleMintSubmit} className="space-y-4 animate-in fade-in slide-in-from-right duration-500 relative z-10">
              <h2 className="text-xl font-bold uppercase tracking-tight mb-4">Mint Genesis Asset</h2>
              <div className="flex gap-4 mb-4">
                <div className="w-32 h-32 rounded-[10px] overflow-hidden shadow-xl border border-white/10 flex-shrink-0">
                  <img src={trackData.coverPreview || getPlaceholderImage(trackData.title || 'onboarding-track')} alt="Cover" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">{trackData.title}</h3>
                  <p className="text-sm text-muted-foreground/80 font-medium mb-4">{profileData.name}</p>
                  <div className="flex gap-4">
                    <span className="px-4 py-4 bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full"> {trackData.genre} </span>
                    <span className="px-4 py-4 bg-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest rounded-full"> Genesis Edition </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Listing Price (TON)</label>
                  <input type="number" value={mintData.price} onChange={e => setMintData({...mintData, price: e.target.value})} className="w-full bg-muted/50 border border-white/10 rounded-[10px] px-4 py-4 text-sm font-bold text-foreground outline-none focus:border-blue-500 transition-colors" required />
                </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Royalty Splits (%)</label>
                {mintData.royaltySplits.map((split, index) => (
                  <div key={index} className="flex gap-4 items-center mb-4">
                    <input 
                      type="text" 
                      placeholder="Wallet Address" 
                      value={split.address}
                      onChange={(e) => {
                        const newSplits = [...mintData.royaltySplits];
                        newSplits[index].address = e.target.value;
                        setMintData({...mintData, royaltySplits: newSplits});
                      }}
                      className="flex-1 bg-muted/50 rounded-[10px] px-4 py-4 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                    <input 
                      type="number" 
                      placeholder="%" 
                      value={split.percentage}
                      onChange={(e) => {
                        const newSplits = [...mintData.royaltySplits];
                        newSplits[index].percentage = Number(e.target.value);
                        setMintData({...mintData, royaltySplits: newSplits});
                      }}
                      className="w-20 bg-muted/50 rounded-[10px] px-4 py-4 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>
                ))}
                <button type="button" onClick={() => setMintData({...mintData, royaltySplits: [...mintData.royaltySplits, { address: '', percentage: 0 }]})} className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">
                  + Add Recipient
                </button>
              </div>
              </div>
              <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-[10px] flex items-start gap-4">
                <Info className="h-4 w-4 text-blue-400 mt-4" />
                <div>
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Smart Contract Deployment</h4>
                  <p className="text-[10px] text-muted-foreground/80 leading-relaxed"> By confirming, you will deploy a new smart contract for this asset on the TON blockchain. This action is irreversible and requires a small gas fee (simulated). </p>
                </div>
              </div>
              <div className="pt-4 flex flex-col md:flex-row gap-4">
                <button type="button" onClick={() => setStep(2)} className="flex-1 bg-muted/50 hover:bg-muted text-foreground font-bold uppercase tracking-widest py-4 rounded-[10px] transition-all" > Back </button>
                <button type="button" onClick={() => navigate('/artist-dashboard')} className="flex-1 bg-muted/50 hover:bg-muted text-foreground font-bold uppercase tracking-widest py-4 rounded-[10px] transition-all" > Skip Minting </button>
                <button type="submit" disabled={isLoading} className="flex-[2] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-foreground font-bold uppercase tracking-widest py-4 rounded-[10px] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-4 shadow-lg shadow-blue-600/20" >
                  {isLoading ? (
                    <>
                      <img src={APP_LOGO} className="w-5 h-5 object-contain animate-[spin_3s_linear_infinite] opacity-80" alt="Loading..." />
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
