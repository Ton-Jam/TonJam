import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Play, 
  Pause, 
  Sparkles, 
  RotateCw, 
  Sliders, 
  Layers, 
  HelpCircle,
  Volume2,
  VolumeX,
  Disc
} from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { NFTItem } from '@/types';
import { Interactive3DViewer } from './Interactive3DViewer';
import { MOCK_TRACKS } from '@/constants';
import { toast } from 'sonner';

interface NFT3DViewerModalProps {
  nft: NFTItem;
  isOpen: boolean;
  onClose: () => void;
}

export const NFT3DViewerModal: React.FC<NFT3DViewerModalProps> = ({ nft, isOpen, onClose }) => {
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const [spinSpeed, setSpinSpeed] = useState<number>(45); // RPM (33, 45, 78)
  const [tiltSensitivity, setTiltSensitivity] = useState<number>(1); // multiplier
  const [visualFilter, setVisualFilter] = useState<'none' | 'cyber' | 'holo' | 'vintage'>('none');
  const [showWireframe, setShowWireframe] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const associatedTrack = MOCK_TRACKS.find((t) => t.id === nft.trackId);
  const isActive = currentTrack?.id === nft.trackId;
  const isCurrentlyPlaying = isActive && isPlaying;

  const handlePlayToggle = () => {
    if (associatedTrack) {
      playTrack(associatedTrack);
      toast.success(isCurrentlyPlaying ? "Preview paused" : `Now playing preview: ${associatedTrack.title}`);
    } else {
      toast.error("No preview audio file linked to this NFT smart contract");
    }
  };

  // Atmospheric CSS Filter Styles based on selected environment
  const getFilterClass = () => {
    switch (visualFilter) {
      case 'cyber':
        return 'hue-rotate-90 saturate-[1.6] contrast-[1.1] drop-shadow-[0_0_15px_rgba(236,72,153,0.3)]';
      case 'holo':
        return 'saturate-[1.3] brightness-[1.1] drop-shadow-[0_0_20px_rgba(56,189,248,0.3)]';
      case 'vintage':
        return 'sepia-[0.35] contrast-[0.95] saturate-[0.85]';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      {/* Click outside to close */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Main Modal Container (with absolute zero borders) */}
      <div className="relative w-full max-w-4xl bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden max-h-[90vh] flex flex-col md:flex-row z-10 animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-50 p-2.5 bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white rounded-full transition-all focus:outline-none cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Interactive 3D Stage */}
        <div className="w-full md:w-1/2 p-8 flex flex-col items-center justify-center relative bg-gradient-to-b from-indigo-950/20 to-slate-950/40 select-none">
          {/* Main 3D Artwork Stage Container */}
          <div className={`w-full max-w-[320px] aspect-square flex items-center justify-center transition-all duration-500 ${getFilterClass()}`}>
            <Interactive3DViewer
              imageUrl={nft.imageUrl || nft.coverUrl}
              title={nft.title}
              isActive={isActive}
              isPlaying={isCurrentlyPlaying}
              handlePlayClick={handlePlayToggle}
              edition={nft.edition}
              minted={nft.supply ? Math.round(nft.supply * 0.8) : undefined}
              supply={nft.supply}
              isAuction={nft.listingType === 'auction'}
            />
          </div>

          {/* Holographic Wireframe Grid Lines Effect (only enabled if user toggles it) */}
          <AnimatePresence>
            {showWireframe && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.12 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none bg-[radial-gradient(#5b6bff_1px,transparent_1px)] [background-size:16px_16px]"
              />
            )}
          </AnimatePresence>

          {/* Quick status notice under artwork */}
          <p className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <RotateCw className="w-3 h-3 text-indigo-400 animate-spin-slow" />
            Hover or drag on desktop to tilt the 3D sleeve
          </p>
        </div>

        {/* Right Side: Rotation & Audio Controls & NFT metadata details */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-none bg-slate-900/40">
          
          <div className="space-y-6">
            {/* Header / Info */}
            <div>
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[9px] font-black uppercase tracking-widest">
                Interactive 3D Stage
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase mt-3 mb-1">
                {nft.title}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Released by <span className="text-indigo-400 font-bold">{nft.creator}</span>
              </p>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed">
              {nft.description || "This premium Web3 audio collectible represents unique intellectual and mechanical rights securely recorded on the TON blockchain layers."}
            </p>

            {/* Stage Manipulator Controls */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                Render Engine Customization
              </h3>

              {/* Slider 1: Rotation Speed (RPM) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                  <span>Spin Velocity (RPM)</span>
                  <span className="text-indigo-400 font-mono">{isCurrentlyPlaying ? spinSpeed : 0} RPM</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-mono text-slate-500">33</span>
                  <input
                    type="range"
                    min="33"
                    max="78"
                    value={spinSpeed}
                    onChange={(e) => setSpinSpeed(Number(e.target.value))}
                    className="flex-1 h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-indigo-500 outline-none"
                  />
                  <span className="text-[9px] font-mono text-slate-500">78</span>
                </div>
              </div>

              {/* Atmosphere Presets (Buttons without borders!) */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Lighting Shader</span>
                <div className="grid grid-cols-4 gap-2">
                  {(['none', 'cyber', 'holo', 'vintage'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setVisualFilter(mode)}
                      className={`py-2 px-1 text-[8px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                        visualFilter === mode 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                          : 'bg-white/[0.02] hover:bg-white/[0.05] text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode === 'none' ? 'Default' : mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Show Wireframe Overlay Toggle */}
              <div className="flex items-center justify-between p-3 bg-white/[0.015] rounded-2xl">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-200 uppercase block">Holographic Grid</span>
                  <span className="text-[8px] text-slate-400 block">Project a virtual wireframe laser background</span>
                </div>
                <button
                  onClick={() => setShowWireframe(!showWireframe)}
                  className={`w-10 h-6 rounded-full p-1 transition-all cursor-pointer ${
                    showWireframe ? 'bg-indigo-600' : 'bg-white/5'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                    showWireframe ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            {/* Smart Contract Properties */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Contract Specification</span>
              <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                <div className="bg-white/[0.015] p-2.5 rounded-xl">
                  <span className="text-slate-500 block">STANDARD</span>
                  <span className="text-slate-300 font-bold uppercase">TON TIP-62</span>
                </div>
                <div className="bg-white/[0.015] p-2.5 rounded-xl">
                  <span className="text-slate-500 block">FILE FORMAT</span>
                  <span className="text-slate-300 font-bold uppercase">Lossless WAV</span>
                </div>
                <div className="bg-white/[0.015] p-2.5 rounded-xl">
                  <span className="text-slate-500 block">ROYALTY FEE</span>
                  <span className="text-slate-300 font-bold">{nft.royalty || 5}% Immutable</span>
                </div>
                <div className="bg-white/[0.015] p-2.5 rounded-xl">
                  <span className="text-slate-500 block">STORAGE TARGET</span>
                  <span className="text-indigo-400 font-bold uppercase">Decentralized IPFS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action bar (Play preview and details) */}
          <div className="mt-8 pt-6 flex gap-3">
            <button
              onClick={handlePlayToggle}
              className={`flex-1 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isCurrentlyPlaying 
                  ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/15'
              }`}
            >
              {isCurrentlyPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  Pause Preview
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  Stream Preview
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="px-5 py-3.5 bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default NFT3DViewerModal;
