import React from 'react';
import { Info, Share2, Send, Tag, Coins, Star, User } from 'lucide-react';
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

  const handleAction = async (action: string) => {
    switch (action) {
      case 'details':
        navigate(`/nft/${nft.id}`);
        onClose();
        break;
      case 'creator':
        const artist = MOCK_ARTISTS.find(a => a.name === nft.creator);
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

  options.push({ id: 'share', icon: Share2, label: 'Share NFT', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('share') });

  return (
    <Drawer open={true} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-background border-t border-border">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <div className="flex items-center gap-4 mb-2">
              <img src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)} className="w-16 h-16 rounded-md object-cover shadow-lg" alt="" />
              <div className="text-left">
                <DrawerTitle className="truncate text-lg">{nft.title}</DrawerTitle>
                <DrawerDescription className="text-sm">{nft.creator}</DrawerDescription>
              </div>
            </div>
          </DrawerHeader>
          
          <div className="p-4 pt-0 space-y-1 max-h-[60vh] overflow-y-auto no-scrollbar">
            {options.map((option, index) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={option.action} 
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <option.icon className={`h-4 w-4 ${option.iconColor}`} />
                </div>
                <span className={`text-sm font-medium ${option.color}`}>{option.label}</span>
              </motion.button>
            ))}
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full rounded-xl h-12">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default NFTOptionsModal;
