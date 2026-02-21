
import React, { useState } from 'react';
import { TON_LOGO } from '../constants';
import { useAudio } from '../context/AudioContext';
import { generateNFTLore } from '../services/geminiService';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { payMintFee } from '../services/tonService';

interface MintModalProps {
  onClose: () => void;
}

const MintModal: React.FC<MintModalProps> = ({ onClose }) => {
  const { addNotification, genesisContractAddress } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  
  const [step, setStep] = useState(1);
  const [isMinting, setIsMinting] = useState(false);
  const [isGeneratingLore, setIsGeneratingLore] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    genre: 'Electronic',
    bpm: '128',
    key: 'C#m',
    price: '1.5',
    royalty: '7',
    description: ''
  });

  const handleLoreGen = async () => {
    if (!formData.title) return addNotification("Enter a title first to seed the forge.", "warning");
    setIsGeneratingLore(true);
    try {
      const lore = await generateNFTLore({ title: formData.title, creator: 'You', traits: [] } as any);
      setFormData(prev => ({ ...prev, description: lore }));
      addNotification("AI Origin forged successfully.", "success");
    } catch (e: any) {
      addNotification(e.message || "Neural forge synchronization failed.", "error");
    } finally {
      setIsGeneratingLore(false);
    }
  };

  const handleMint = async () => {
    if (!userAddress) {
      addNotification("Please connect your wallet to mint.", "warning");
      return;
    }
    setIsMinting(true);
    try {
      await payMintFee(tonConnectUI, genesisContractAddress, "0.05");
      addNotification(`"${formData.title}" minted successfully!`, "success");
      onClose();
    } catch (e) {
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

          <div className="space-y-6">
            <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Asset Title" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-blue-500 font-bold" />
            
            <div className="relative">
              <button onClick={handleLoreGen} disabled={isGeneratingLore} className="absolute right-4 top-4 text-[8px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1">
                {isGeneratingLore ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-sparkles"></i>}
                AI Forge
              </button>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Description forged in the void..." className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white h-32 resize-none" />
            </div>

            <button onClick={handleMint} disabled={isMinting} className="w-full py-5 bg-blue-600 rounded-2xl text-white font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50">
              {isMinting ? 'Syncing...' : 'Initialize Mint'}
            </button>
          </div>
      </div>
    </div>
  );
};

export default MintModal;
