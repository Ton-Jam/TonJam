import React, { useState } from 'react';
import { useNFT } from '@/contexts/NFTContext';
import { useModal } from '@/components/layout/ModalProvider';
import { Upload, Loader2, CheckCircle } from 'lucide-react';

export const MintNFTModal: React.FC = () => {
  const { setIsMinting, addNFT } = useNFT();
  const { closeModal } = useModal();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'completed'>('idle');

  const handleMint = async () => {
    setStatus('uploading');
    setIsMinting(true);
    // Simulate API/Blockchain call
    setTimeout(() => {
      setStatus('completed');
      addNFT({
        id: Math.random().toString(36).substring(7),
        title,
        description,
        owner: 'Me',
        trackId: 'track_' + Math.random().toString(36).substring(7),
        imageUrl: 'https://placehold.co/400',
        creator: 'Me',
        price: '0.1 TON',
        edition: '1/1',
      });
      setIsMinting(false);
      setTimeout(closeModal, 1500);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {status === 'idle' && (
        <>
          <input
            type="text"
            placeholder="NFT Title"
            className="w-full bg-[#1E2230] rounded-xl p-3 text-xs text-white placeholder-slate-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Description"
            className="w-full h-20 bg-[#1E2230] rounded-xl p-3 text-xs text-white placeholder-slate-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button className="w-full py-3 bg-[#1E2230] rounded-xl text-slate-400 flex items-center justify-center gap-2 text-xs font-bold hover:bg-slate-700">
            <Upload className="w-4 h-4" /> Upload Audio
          </button>
          <button
            onClick={handleMint}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-black text-xs uppercase"
          >
            Mint NFT
          </button>
        </>
      )}
      {status === 'uploading' && (
        <div className="py-10 flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
          <p className="text-slate-400 text-xs">Minting to Blockchain...</p>
        </div>
      )}
      {status === 'completed' && (
        <div className="py-10 flex flex-col items-center gap-4">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
          <p className="text-emerald-400 text-xs">NFT Minted Successfully!</p>
        </div>
      )}
    </div>
  );
};
