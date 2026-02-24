
import React, { useState } from 'react';
import { TON_LOGO } from '../constants';
import { useAudio } from '../context/AudioContext';
import { generateNFTLore } from '../services/geminiService';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { payMintFee } from '../services/tonService';
import { uploadToIPFS, uploadMetadataToIPFS } from '../services/ipfsService';

interface MintModalProps {
  onClose: () => void;
}

const MintModal: React.FC<MintModalProps> = ({ onClose }) => {
  const { addNotification, genesisContractAddress, addUserTrack, addUserNFT, userProfile } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  
  const [step, setStep] = useState(1);
  const [isMinting, setIsMinting] = useState(false);
  const [mintProgress, setMintProgress] = useState(0);
  const [mintStatus, setMintStatus] = useState('');
  const [isGeneratingLore, setIsGeneratingLore] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    genre: 'Electronic',
    bpm: '128',
    key: 'C#m',
    price: '1.5',
    royalty: '7',
    description: '',
    audioFile: null as File | null,
    coverFile: null as File | null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'audioFile' | 'coverFile') => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, [field]: e.target.files![0] }));
      addNotification(`${field === 'audioFile' ? 'Audio' : 'Cover'} signal captured.`, "info");
    }
  };

  const handleLoreGen = async () => {
    if (!formData.title) return addNotification("Enter a title first to seed the forge.", "warning");
    setIsGeneratingLore(true);
    try {
      const lore = await generateNFTLore({ title: formData.title, creator: userProfile.name, traits: [] } as any);
      setFormData(prev => ({ ...prev, description: lore }));
      addNotification("AI Origin forged successfully.", "success");
    } catch (e: any) {
      addNotification(e.message || "Neural forge synchronization failed.", "error");
    } finally {
      setIsGeneratingLore(false);
    }
  };

  const handleMint = async () => {
    if (!userProfile.isVerifiedArtist) {
      addNotification("Artist verification required to mint protocols.", "error");
      return;
    }
    if (!userAddress) {
      addNotification("Please connect your wallet to mint.", "warning");
      return;
    }
    if (!formData.title || !formData.audioFile || !formData.coverFile) {
      addNotification("Incomplete protocol data. All fields required.", "error");
      return;
    }
    
    setIsMinting(true);
    setMintProgress(0);
    setMintStatus('Uploading Audio Signal to IPFS...');

    try {
      // 1. Upload Audio to IPFS
      const audioIpfsUri = await uploadToIPFS(formData.audioFile, (progress) => {
        setMintProgress(progress * 0.3); // 0-30%
      });

      // 2. Upload Cover to IPFS
      setMintStatus('Uploading Visual DNA to IPFS...');
      const coverIpfsUri = await uploadToIPFS(formData.coverFile, (progress) => {
        setMintProgress(30 + (progress * 0.3)); // 30-60%
      });

      // 3. Upload Metadata to IPFS
      setMintStatus('Forging Metadata on IPFS...');
      const metadata = {
        name: formData.title,
        description: formData.description,
        image: coverIpfsUri,
        animation_url: audioIpfsUri,
        attributes: [
          { trait_type: 'Genre', value: formData.genre },
          { trait_type: 'BPM', value: formData.bpm },
          { trait_type: 'Key', value: formData.key }
        ]
      };
      const metadataIpfsUri = await uploadMetadataToIPFS(metadata);
      setMintProgress(75);

      // 4. Pay Mint Fee
      setMintStatus('Synchronizing with TON Blockchain...');
      await payMintFee(tonConnectUI, genesisContractAddress, "0.05");
      
      setMintStatus('Finalizing Genesis Block...');
      setMintProgress(100);

      // Create mock objects for local state since we don't have a real backend upload
      const newTrackId = Date.now().toString();
      const coverUrl = URL.createObjectURL(formData.coverFile);
      const audioUrl = URL.createObjectURL(formData.audioFile);
      
      const newTrack = {
        id: newTrackId,
        title: formData.title,
        artist: userProfile.name,
        artistId: userProfile.id,
        coverUrl: coverUrl,
        audioUrl: audioUrl,
        duration: 180, // Mock duration
        plays: 0,
        likes: 0,
        genre: formData.genre,
        bpm: parseInt(formData.bpm),
        key: formData.key,
        price: formData.price,
        ipfsHash: audioIpfsUri
      };
      
      const newNFT = {
        id: `nft-${newTrackId}`,
        title: formData.title,
        creator: userProfile.name,
        owner: userAddress, // Current user is owner
        price: formData.price,
        coverUrl: coverUrl,
        audioUrl: audioUrl,
        rarity: 'Common',
        traits: [
          { trait_type: 'Genre', value: formData.genre },
          { trait_type: 'BPM', value: formData.bpm },
          { trait_type: 'Key', value: formData.key }
        ],
        royalty: parseInt(formData.royalty),
        metadataUri: metadataIpfsUri
      };
      
      addUserTrack(newTrack);
      addUserNFT(newNFT);
      
      addNotification(`"${formData.title}" minted successfully!`, "success");
      setTimeout(() => onClose(), 500);
    } catch (e) {
      console.error(e);
      addNotification("Minting cancelled or failed.", "error");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={onClose}></div>
      <div className="relative glass w-full max-w-2xl rounded-[3rem] border border-blue-500/20 p-12 shadow-2xl animate-in zoom-in-95 duration-300">
          <header className="flex justify-between items-center mb-10">
            <div>
               <h2 className="text-3xl font-black uppercase text-white">MINT PROTOCOL</h2>
               {genesisContractAddress && <p className="text-[7px] font-black text-blue-400 uppercase tracking-widest mt-1">Targeting: {genesisContractAddress.slice(0, 16)}...</p>}
            </div>
            <button onClick={onClose} className="text-white/40"><i className="fas fa-times"></i></button>
          </header>

          <div className="space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[8px] font-black text-white/30 uppercase tracking-widest ml-2">Audio Protocol (.mp3/wav)</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="audio/*" 
                    onChange={e => handleFileChange(e, 'audioFile')}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  />
                  <div className={`w-full bg-white/5 border border-dashed ${formData.audioFile ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10'} p-5 rounded-2xl text-center transition-all group-hover:bg-white/10`}>
                    <i className={`fas ${formData.audioFile ? 'fa-check-circle text-blue-400' : 'fa-music text-white/20'} mb-2`}></i>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest truncate px-2">
                      {formData.audioFile ? formData.audioFile.name : 'Upload Frequency'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[8px] font-black text-white/30 uppercase tracking-widest ml-2">Visual DNA (.jpg/png)</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => handleFileChange(e, 'coverFile')}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  />
                  <div className={`w-full bg-white/5 border border-dashed ${formData.coverFile ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10'} p-5 rounded-2xl text-center transition-all group-hover:bg-white/10`}>
                    <i className={`fas ${formData.coverFile ? 'fa-image text-white/20' : 'fa-camera text-white/20'} mb-2`}></i>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest truncate px-2">
                      {formData.coverFile ? formData.coverFile.name : 'Upload Cover'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[8px] font-black text-white/30 uppercase tracking-widest ml-2">Asset Identity</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Asset Title" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-blue-500 font-bold" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-[8px] font-black text-white/30 uppercase tracking-widest ml-2">Genre</label>
                <select value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-blue-500 text-[10px] font-black uppercase">
                  {['Electronic', 'Techno', 'Phonk', 'Ambient', 'Hip Hop', 'Rock'].map(g => <option key={g} value={g} className="bg-black">{g}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-white/30 uppercase tracking-widest ml-2">BPM</label>
                <input type="number" value={formData.bpm} onChange={e => setFormData({...formData, bpm: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-blue-500 text-[10px] font-black" />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-white/30 uppercase tracking-widest ml-2">Key</label>
                <input type="text" value={formData.key} onChange={e => setFormData({...formData, key: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-blue-500 text-[10px] font-black uppercase" />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-white/30 uppercase tracking-widest ml-2">Royalty %</label>
                <input type="number" value={formData.royalty} onChange={e => setFormData({...formData, royalty: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-blue-500 text-[10px] font-black" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[8px] font-black text-white/30 uppercase tracking-widest ml-2">Valuation (TON)</label>
              <div className="relative">
                <img src={TON_LOGO} className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" alt="" />
                <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-white/5 border border-white/10 py-5 pl-12 pr-6 rounded-2xl text-white outline-none focus:border-blue-500 font-bold" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[8px] font-black text-white/30 uppercase tracking-widest ml-2">Origin Narrative</label>
              <div className="relative">
                <button onClick={handleLoreGen} disabled={isGeneratingLore} className="absolute right-4 top-4 text-[8px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1 z-10 bg-black/40 px-2 py-1 rounded-full backdrop-blur-md">
                  {isGeneratingLore ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-sparkles"></i>}
                  AI Forge
                </button>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Description forged in the void..." className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white h-32 resize-none outline-none focus:border-blue-500" />
              </div>
            </div>

            {isMinting && (
              <div className="space-y-3 animate-in fade-in duration-300 bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">{mintStatus}</span>
                  <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">{Math.round(mintProgress)}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(37,99,235,0.6)]"
                    style={{ width: `${mintProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <button onClick={handleMint} disabled={isMinting} className="w-full py-5 bg-blue-600 rounded-2xl text-white font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-blue-500/20">
              {isMinting ? 'Syncing Protocol...' : 'Initialize Mint'}
            </button>
          </div>
      </div>
    </div>
  );
};

export default MintModal;
