import React from 'react';
import { Info, Share2, Send, Tag, Coins, Star, User, ExternalLink, Copy, ShieldCheck } from 'lucide-react';
import { NFTItem } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { useNavigate } from 'react-router-dom';
import { getPlaceholderImage } from '@/lib/utils';
import { Button } from "@/components/ui/button"
import { motion } from 'motion/react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { MOCK_ARTISTS } from '@/constants';

interface NFTOptionsModalProps {
  nft: NFTItem;
  onClose: () => void;
  onSend?: () => void;
  onList?: () => void;
  onBuy?: () => void;
}

const NFTOptionsModal: React.FC<NFTOptionsModalProps> = ({ nft, onClose, onSend, onList, onBuy }) => {
  const navigate = useNavigate();
  const { addNotification, userProfile, setAnthem } = useAudio();

  const isOwner = nft.owner === userProfile.walletAddress;
  const isAnthem = userProfile.anthemId === nft.id;
  
  const artist = MOCK_ARTISTS.find(a => a.name === nft.creator || a.name === nft.artist);
  const isVerified = artist?.verified || artist?.isVerifiedArtist;

  const handleAction = async (action: string) => {
    switch (action) {
      case 'details':
        navigate(`/nft/${nft.id}`);
        onClose();
        break;
      case 'creator':
        if (artist) {
          navigate(`/artist/${artist.id}`);
        }
        onClose();
        break;
      case 'anthem':
        setAnthem(isAnthem ? null : nft.id);
        addNotification(isAnthem ? 'Profile anthem removed' : 'Profile anthem updated', 'success');
        onClose();
        break;
      case 'send':
        if (onSend) onSend();
        onClose();
        break;
      case 'list':
        if (onList) onList();
        onClose();
        break;
      case 'buy':
        if (onBuy) onBuy();
        onClose();
        break;
      case 'tonscan':
        window.open(`https://tonscan.org/nft/${nft.contractAddress || nft.id}`, '_blank');
        onClose();
        break;
      case 'copy-id':
        navigator.clipboard.writeText(nft.id);
        addNotification('NFT ID copied to neural buffer', 'success');
        onClose();
        break;
      case 'share':
        const shareUrl = `${window.location.origin}/#/nft/${nft.id}`;
        const shareData = {
          title: nft.title,
          text: `Check out this NFT: ${nft.title} by ${nft.creator} on TonJam!`,
          url: shareUrl
        };

        if (navigator.share) {
          navigator.share(shareData).catch((err) => {
            if (err.name !== 'AbortError') {
              console.error('Error sharing:', err);
            }
          });
        } else {
          navigator.clipboard.writeText(shareUrl);
          addNotification('NFT link copied to neural buffer', 'success');
        }
        onClose();
        break;
    }
  };

  const options = [
    { id: 'details', icon: Info, label: 'View Details', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('details') },
    { id: 'creator', icon: User, label: 'View Creator', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('creator') },
  ];

  if (isOwner) {
    options.push({ id: 'anthem', icon: Star, label: isAnthem ? 'Remove Anthem' : 'Set as Anthem', color: isAnthem ? 'text-amber-400' : 'text-foreground', iconColor: isAnthem ? 'text-amber-400 fill-current' : 'text-muted-foreground group-hover:text-amber-400', action: () => handleAction('anthem') });
    options.push({ id: 'send', icon: Send, label: 'Transfer NFT', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('send') });
    options.push({ id: 'list', icon: Tag, label: 'List for Sale', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('list') });
  } else {
    options.push({ id: 'buy', icon: Coins, label: nft.listingType === 'auction' ? 'Place Bid' : 'Buy / Make Offer', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('buy') });
  }

  options.push({ id: 'tonscan', icon: ExternalLink, label: 'View on TonScan', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('tonscan') });
  options.push({ id: 'copy-id', icon: Copy, label: 'Copy NFT ID', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('copy-id') });
  options.push({ id: 'share', icon: Share2, label: 'Share NFT', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('share') });

  const rarity = nft.traits?.find(t => t.trait_type === 'Rarity')?.value;

  return (
    <Drawer open={true} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-[#0A0A0A] border-t border-white/10 shadow-[0_-8px_40px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
        {/* Hardware style scanline */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        
        <div className="mx-auto w-full max-w-md relative z-10">
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-12 h-1 rounded-full bg-white/10" />
          </div>

          <DrawerHeader className="border-b border-white/5 pb-6 pt-4">
            <div className="flex items-center gap-5">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-20 h-20 rounded-[12px] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.5)] border border-white/10 flex-shrink-0"
              >
                <img 
                  src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)} 
                  className="w-full h-full object-cover" 
                  alt={nft.title} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </motion.div>
              <div className="text-left flex-1 min-w-0">
                <DrawerTitle className="text-2xl font-bold tracking-tighter text-white truncate leading-none uppercase">
                  {nft.title}
                </DrawerTitle>
                <DrawerDescription className="text-[10px] text-blue-500 font-bold mt-2 flex items-center gap-2 uppercase tracking-[0.2em]">
                  {nft.creator}
                  {isVerified && (
                    <ShieldCheck className="w-3 h-3 text-blue-400 fill-blue-400/10" />
                  )}
                </DrawerDescription>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-2 py-1 rounded-[4px] bg-purple-500/10 text-[8px] font-bold uppercase tracking-[0.3em] text-purple-400 border border-purple-500/20">
                    {nft.edition || 'NFT_ASSET'}
                  </span>
                  {rarity && (
                    <span className="px-2 py-1 rounded-[4px] bg-amber-500/10 text-[8px] font-bold uppercase tracking-[0.3em] text-amber-400 border border-amber-500/20">
                      {rarity}
                    </span>
                  )}
                  {isOwner && (
                    <span className="px-2 py-1 rounded-[4px] bg-blue-500/10 text-[8px] font-bold uppercase tracking-[0.3em] text-blue-400 border border-blue-500/20">
                      OWNER
                    </span>
                  )}
                </div>
              </div>
            </div>
          </DrawerHeader>
          
          <div className="p-4 pt-4 space-y-1 max-h-[60vh] overflow-y-auto no-scrollbar pb-8">
            <div className="grid grid-cols-1 gap-1">
              {options.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03, ease: "easeOut" }}
                  onClick={option.action} 
                  className="w-full flex items-center gap-4 p-3 rounded-[12px] hover:bg-white/5 active:bg-white/10 active:scale-[0.98] transition-all text-left group focus-visible:outline-none border border-transparent hover:border-white/5"
                >
                  <div className="w-10 h-10 rounded-[8px] bg-white/5 flex items-center justify-center group-hover:bg-blue-500/10 group-active:scale-90 transition-all border border-white/5 group-hover:border-blue-500/20">
                    <option.icon className={`h-4 w-4 ${option.iconColor} transition-transform group-hover:scale-110`} />
                  </div>
                  <div className="flex-1">
                    <span className={`text-[10px] font-bold uppercase tracking-[0.3em] ${option.color}`}>
                      {option.label}
                    </span>
                  </div>
                  <div className="w-4 h-4 rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 rounded-full bg-blue-500" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="p-4 pt-0 pb-8">
            <DrawerClose asChild>
              <Button 
                variant="secondary" 
                className="w-full rounded-[12px] h-12 font-bold text-[10px] uppercase tracking-[0.4em] bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all active:scale-[0.98]"
              >
                Close_Interface
              </Button>
            </DrawerClose>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default NFTOptionsModal;
