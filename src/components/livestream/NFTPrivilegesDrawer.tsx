import React from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Crown, 
  Sparkles, 
  Check, 
  Zap, 
  ExternalLink, 
  Music, 
  Award,
  Radio,
  ShoppingBag,
  Disc3
} from 'lucide-react';
import { ViewerPrivileges, UserHeldNFT } from '@/types/livestream';
import { useNavigate } from 'react-router-dom';

interface NFTPrivilegesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  privileges: ViewerPrivileges;
  artistName: string;
  artistId?: string;
  onOpenSongRequest?: () => void;
  onTriggerSoundboard?: () => void;
}

export const NFTPrivilegesDrawer: React.FC<NFTPrivilegesDrawerProps> = ({
  isOpen,
  onClose,
  privileges,
  artistName,
  artistId,
  onOpenSongRequest,
  onTriggerSoundboard
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md bg-[#0a0f1d] h-full flex flex-col p-6 overflow-y-auto relative shadow-2xl"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-lg bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400/20 to-purple-500/20 flex items-center justify-center">
            <Crown className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">NFT VIP Privileges</h3>
            <p className="text-xs text-zinc-400">Stream interactions & holder status</p>
          </div>
        </div>

        {/* Current Active Tier Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121c38] to-[#0d152a] mb-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Active Tier
            </span>
            <span 
              className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider"
              style={{ backgroundColor: `${privileges.badgeColor}25`, color: privileges.badgeColor }}
            >
              {privileges.badgeLabel}
            </span>
          </div>

          <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
            {privileges.tier === 'Genesis VIP' && 'Full VIP access unlocked. You enjoy priority pinned Q&A, glowing chat badges, soundboard control, and song requests.'}
            {privileges.tier === 'Artist VIP' && `Verified holder of ${artistName}'s music NFTs! You receive VIP chat styling and direct song requests.`}
            {privileges.tier === 'Diamond Holder' && 'Holding Rare/Diamond NFTs on TonJam gives you high-visibility chat badges and custom emotes.'}
            {privileges.tier === 'Collector' && 'Music NFT collector status active with verified collector badge in chat.'}
            {privileges.tier === 'Listener' && 'Standard listener mode. Collect music NFTs on TonJam to unlock special interaction privileges!'}
          </p>

          {/* Quick privilege perks checklist */}
          <div className="space-y-2 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 flex items-center gap-2">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Priority Q&A Questions</span>
              </span>
              {privileges.canPriorityPinQA ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Unlocked
                </span>
              ) : (
                <span className="text-zinc-500 font-medium">Requires VIP</span>
              )}
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 flex items-center gap-2">
                <Music className="w-3.5 h-3.5 text-[#00B4D8]" />
                <span>Direct Live Song Requests</span>
              </span>
              {privileges.canRequestSongs ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Unlocked
                </span>
              ) : (
                <span className="text-zinc-500 font-medium">Requires 1+ NFT</span>
              )}
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-purple-400" />
                <span>VIP Stream Soundboard FX</span>
              </span>
              {privileges.canTriggerVipSoundboard ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Unlocked
                </span>
              ) : (
                <span className="text-zinc-500 font-medium">Genesis Holders</span>
              )}
            </div>
          </div>
        </div>

        {/* Viewer's Held NFTs Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Disc3 className="w-3.5 h-3.5 text-[#00B4D8]" />
              <span>Your Held NFTs ({privileges.heldNFTs.length})</span>
            </h4>
          </div>

          {privileges.heldNFTs.length === 0 ? (
            <div className="p-4 rounded-xl bg-white/[0.02] text-center text-zinc-400">
              <p className="text-xs mb-2">No NFTs detected in connected wallet.</p>
              <button
                onClick={() => {
                  onClose();
                  navigate('/marketplace');
                }}
                className="px-4 py-2 bg-[#00B4D8] hover:bg-[#00B4D8]/90 text-black text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Browse NFT Marketplace
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {privileges.heldNFTs.map((nft) => (
                <div 
                  key={nft.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                >
                  <img
                    src={nft.imageUrl}
                    alt={nft.title}
                    className="w-10 h-10 rounded-lg object-cover bg-black"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{nft.title}</p>
                    <p className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                      <span className="text-amber-400 font-semibold">{nft.rarity || 'Sonic NFT'}</span>
                      <span>•</span>
                      <span>{nft.edition || 'Official Edition'}</span>
                    </p>
                  </div>
                  {nft.isGenesis && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase">
                      Genesis
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Explore Artist Collection Callout */}
        <div className="mt-auto pt-4 border-t border-white/5">
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-900/30 to-blue-900/30 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-white">Want more privileges?</p>
              <p className="text-[10px] text-zinc-400">Collect {artistName}&apos;s music artifacts</p>
            </div>
            <button
              onClick={() => {
                onClose();
                if (artistId) navigate(`/artist/${artistId}`);
                else navigate('/marketplace');
              }}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
              <span>Collect</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
