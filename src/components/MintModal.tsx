import React, { useState, useEffect } from 'react';
import { Hammer, X, FileAudio, CloudUpload, Image, RefreshCw, Rocket, Check } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { generateNFTLore } from '@/services/geminiService';
import { NFTItem, Track } from '@/types';
import { APP_LOGO } from '@/constants';

interface MintModalProps {
  onClose: () => void;
  track?: Track;
}

const MintModal: React.FC<MintModalProps> = ({ onClose, track }) => {
  const { addNotification, addUserNFT, addUserTrack, userProfile } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [lore, setLore] = useState('');
  const [mintData, setMintData] = useState({
    title: track?.title || '',
    description: '',
    price: '5',
    royalty: '10',
    supply: '100',
    audioFile: null as File | null,
    coverFile: null as File | null,
    audioPreview: track?.audioUrl || '',
    coverPreview: track?.coverUrl || ''
  });

  useEffect(() => {
    if (step === 2 && !lore && mintData.title) {
      handleGenerateLore();
    }
  }, [step]);

  const handleGenerateLore = async () => {
    setLoading(true);
    try {
      const generatedLore = await generateNFTLore(mintData.title, 'Electronic', 'A sonic journey through the TON ecosystem.');
      setLore(generatedLore);
      setMintData(prev => ({ ...prev, description: generatedLore }));
    } catch (err) {
      console.error("Lore generation failed:", err);
      setLore("A legendary sonic artifact forged in the depths of the TON blockchain.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'audio') {
          setMintData(prev => ({ ...prev, audioFile: file, audioPreview: reader.result as string }));
        } else {
          setMintData(prev => ({ ...prev, coverFile: file, coverPreview: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMint = async () => {
    if (!userAddress) {
      addNotification("Please connect your wallet to mint", "warning");
      tonConnectUI.openModal();
      return;
    }
    setLoading(true);
    try {
      /* Simulate TON transaction */
      await new Promise(resolve => setTimeout(resolve, 3000));
      const newNFT: NFTItem = {
        id: `nft-${Date.now()}`,
        trackId: `track-nft-${Date.now()}`,
        title: mintData.title,
        owner: userProfile.id,
        creator: userProfile.name,
        artist: userProfile.name,
        artistId: userProfile.id,
        imageUrl: mintData.coverPreview || 'https://picsum.photos/seed/tonjam-nft/500/500',
        coverUrl: mintData.coverPreview || 'https://picsum.photos/seed/tonjam-nft/500/500',
        price: mintData.price,
        edition: 'Genesis',
        supply: parseInt(mintData.supply),
        minted: 1,
        description: mintData.description,
        audioUrl: mintData.audioPreview || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        isAuction: false,
        attributes: [
          { trait_type: 'Rarity', value: 'Rare' },
          { trait_type: 'Genre', value: 'Electronic' }
        ]
      };
      const newTrack: Track = {
        id: newNFT.trackId,
        title: mintData.title,
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
      addUserNFT(newNFT);
      addUserTrack(newTrack);
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative glass border border-blue-500/10 w-full max-w-2xl rounded-[10px] p-10 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-3xl rounded-full"></div>
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-[10px] flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Hammer className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tighter text-white">Protocol Forge</h2>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Mint your sonic artifacts on TON</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-right duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Artifact Title</label>
                  <input type="text" value={mintData.title} onChange={(e) => setMintData({...mintData, title: e.target.value})} className="w-full bg-white/5 rounded-[10px] py-3 px-5 text-xs outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white" placeholder="Enter track title..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Sonic Data (Audio)</label>
                  <div className="relative group">
                    <input type="file" accept="audio/*" onChange={(e) => handleFileChange(e, 'audio')} className="hidden" id="audio-upload" />
                    <label htmlFor="audio-upload" className="flex flex-col items-center justify-center w-full h-32 bg-white/5 hover:bg-white/10 rounded-[10px] transition-all cursor-pointer" >
                      {mintData.audioFile ? (
                        <div className="text-center">
                          <FileAudio className="h-8 w-8 text-blue-500 mb-2 mx-auto" />
                          <p className="text-[10px] font-bold text-white uppercase truncate px-4">{mintData.audioFile.name}</p>
                        </div>
                      ) : (
                        <>
                          <CloudUpload className="h-8 w-8 text-white/20 mb-2" />
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Upload Audio</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Visual Matrix (Cover Art)</label>
                <div className="relative group h-full">
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} className="hidden" id="cover-upload" />
                  <label htmlFor="cover-upload" className="flex flex-col items-center justify-center w-full h-full min-h-[180px] bg-white/5 hover:bg-white/10 rounded-[10px] transition-all cursor-pointer overflow-hidden" >
                    {mintData.coverPreview ? (
                      <img src={mintData.coverPreview} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <>
                        <Image className="h-8 w-8 text-white/20 mb-2" />
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Upload Cover</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
            <button onClick={() => setStep(2)} disabled={!mintData.title || (!mintData.audioFile && !track)} className="w-full py-4 bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-[10px] font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all" > INITIALIZE_METADATA_SEQUENCE </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">AI-Generated Artifact Lore</label>
                  <button onClick={handleGenerateLore} disabled={loading} className="text-[9px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors" >
                    <img src={APP_LOGO} className={`h-3 w-3 mr-1 inline-block object-contain ${loading ? 'animate-[spin_3s_linear_infinite]' : ''}`} alt="Regenerate" /> Regenerate
                  </button>
                </div>
                <div className="relative">
                  <textarea value={mintData.description} onChange={(e) => setMintData({...mintData, description: e.target.value})} rows={6} className="w-full bg-white/5 rounded-[10px] py-4 px-5 text-xs outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white/80 leading-relaxed resize-none" />
                  {loading && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-[10px] flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                        <img src={APP_LOGO} className="w-8 h-8 object-contain animate-[spin_3s_linear_infinite] opacity-80" alt="Loading..." />
                        <p className="text-[10px] font-bold text-white uppercase tracking-widest">AI Lore Generation...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Mint Price (TON)</label>
                  <input type="number" value={mintData.price} onChange={(e) => setMintData({...mintData, price: e.target.value})} className="w-full bg-white/5 rounded-[10px] py-3 px-5 text-xs outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Royalty (%)</label>
                  <input type="number" value={mintData.royalty} onChange={(e) => setMintData({...mintData, royalty: e.target.value})} className="w-full bg-white/5 rounded-[10px] py-3 px-5 text-xs outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Supply</label>
                  <input type="number" value={mintData.supply} onChange={(e) => setMintData({...mintData, supply: e.target.value})} className="w-full bg-white/5 rounded-[10px] py-3 px-5 text-xs outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white" />
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 py-4 bg-white/5 text-white rounded-[10px] font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all" > BACK </button>
              <button onClick={() => setStep(3)} className="flex-[2] py-4 bg-blue-600 text-white rounded-[10px] font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all" > REVIEW_PROTOCOL_DEPLOYMENT </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right duration-300">
            <div className="bg-white/5 rounded-[10px] p-6 space-y-6">
              <div className="flex gap-6">
                <img src={mintData.coverPreview} className="w-24 h-24 rounded-[10px] object-cover shadow-xl" alt="" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white uppercase tracking-tighter mb-1">{mintData.title}</h3>
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-3">By {userProfile.name}</p>
                  <div className="flex gap-4">
                    <div className="bg-black/30 px-3 py-1.5 rounded-full">
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest mr-2">Price:</span>
                      <span className="text-[10px] font-bold text-white">{mintData.price} TON</span>
                    </div>
                    <div className="bg-black/30 px-3 py-1.5 rounded-full">
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest mr-2">Supply:</span>
                      <span className="text-[10px] font-bold text-white">{mintData.supply}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-px bg-white/5"></div>
              <div className="space-y-2">
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Deployment Fees</p>
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-white/60">Minting Fee</span>
                  <span className="text-white">0.05 TON</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-white/60">Storage Fee (IPFS)</span>
                  <span className="text-white">0.01 TON</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold pt-2">
                  <span className="text-blue-500">Total Protocol Cost</span>
                  <span className="text-blue-500">0.06 TON</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="flex-1 py-4 bg-white/5 text-white rounded-[10px] font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all" > BACK </button>
              <button onClick={handleMint} disabled={loading} className="flex-[2] py-4 bg-green-600 text-white rounded-[10px] font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-green-600/20 hover:bg-green-500 transition-all flex items-center justify-center gap-3" >
                {loading ? (
                  <>
                    <img src={APP_LOGO} className="w-4 h-4 object-contain animate-[spin_3s_linear_infinite] opacity-80 mr-2 inline-block" alt="Loading..." /> DEPLOYING_PROTOCOL...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2 inline-block" /> CONFIRM_MINT_ON_TON
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-12 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/20">
              <Check className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-white uppercase tracking-tighter mb-4">Protocol Deployed</h2>
            <p className="text-white/60 text-sm max-w-sm mx-auto mb-10 leading-relaxed"> Your sonic artifact has been successfully minted and registered on the TON blockchain. </p>
            <div className="flex flex-col gap-4">
              <button onClick={onClose} className="w-full py-4 bg-blue-600 text-white rounded-[10px] font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all" > VIEW_IN_COLLECTION </button>
              <button onClick={() => { setStep(1); setMintData({ title: '', description: '', price: '5', royalty: '10', supply: '100', audioFile: null, coverFile: null, audioPreview: '', coverPreview: '' }); }} className="w-full py-4 bg-white/5 text-white rounded-[10px] font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all" > MINT_ANOTHER_ARTIFACT </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MintModal;
