import React from 'react';
import { Info, Share2, Send, Tag, Coins, Star, User, ExternalLink, Copy, CheckCircle2, ChevronRight, Trash } from 'lucide-react';
import { NFTItem } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { useNavigate } from 'react-router-dom';
import { getPlaceholderImage } from '@/lib/utils';
import { Button } from "@/components/ui/button"
import ConfirmationModal from './ConfirmationModal';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
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

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);

  const handleAction = async (action: string) => {
    switch (action) {
      case 'details':
        navigate(`/nft/${nft.id}`);
        onClose();
        break;
      case 'creator':
        if (artist) {
          navigate(`/artist/${artist.uid}`);
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
        addNotification('NFT ID copied to clipboard', 'success');
        onClose();
        break;
      case 'delete':
        setIsDeleteConfirmOpen(true);
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
          addNotification('NFT link copied to clipboard', 'success');
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
    options.push({ id: 'anthem', icon: Star, label: isAnthem ? 'Remove Anthem' : 'Set as Anthem', color: isAnthem ? 'text-amber-500' : 'text-foreground', iconColor: isAnthem ? 'text-amber-500 fill-current' : 'text-muted-foreground group-hover:text-amber-400', action: () => handleAction('anthem') });
    options.push({ id: 'send', icon: Send, label: 'Send NFT', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('send') });
    options.push({ id: 'list', icon: Tag, label: 'List for Sale', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('list') });
    options.push({ id: 'delete', icon: Trash, label: 'Burn NFT', color: 'text-red-500', iconColor: 'text-red-500', action: () => handleAction('delete') });
  } else {
    options.push({ id: 'buy', icon: Coins, label: nft.listingType === 'auction' ? 'Place Bid' : 'Buy / Make Offer', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('buy') });
  }

  options.push({ id: 'tonscan', icon: ExternalLink, label: 'View on TonScan', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('tonscan') });
  options.push({ id: 'copy-id', icon: Copy, label: 'Copy NFT ID', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('copy-id') });
  options.push({ id: 'share', icon: Share2, label: 'Share NFT', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('share') });

  const rarity = nft.traits?.find(t => t.trait_type === 'Rarity')?.value;

  return (
    <>
      <Drawer open={true} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="bg-background shadow-[0_-12px_40px_rgba(0,0,0,0.8)] border-none">
          <div className="mx-auto w-full max-w-md relative z-10 px-4 pb-12">
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-12 h-1 rounded-full bg-white/10" />
            </div>

            <DrawerHeader className="pb-6 pt-4 flex flex-row items-center gap-4 text-left">
              <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                <img 
                  src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)} 
                  className="w-full h-full object-cover" 
                  alt={nft.title} 
                />
              </div>
              <div className="flex-1 min-w-0">
                <DrawerTitle className="text-xl font-semibold text-foreground truncate">
                  {nft.title}
                </DrawerTitle>
                <DrawerDescription className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-1 truncate">
                  {nft.creator}
                  {isVerified && (
                    <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  )}
                </DrawerDescription>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-xs font-medium text-purple-500">
                    {nft.edition || 'NFT'}
                  </span>
                  {rarity && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-xs font-medium text-amber-500">
                      {rarity}
                    </span>
                  )}
                  {isOwner && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-xs font-medium text-blue-500">
                      Owner
                    </span>
                  )}
                </div>
              </div>
            </DrawerHeader>
            
            <div className="space-y-1 max-h-[50vh] overflow-y-auto no-scrollbar py-2">
              {options.map((option, index) => (
                <button
                  key={option.id}
                  onClick={option.action} 
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors text-left group focus-visible:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <option.icon className={`h-5 w-5 ${option.iconColor} transition-transform group-hover:scale-110`} />
                    <span className={`text-base font-medium ${option.color}`}>
                      {option.label}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <DrawerClose asChild>
                <Button 
                  variant="outline" 
                  className="w-full rounded-full h-12 text-base font-medium transition-all active:scale-[0.98]"
                >
                  Cancel
                </Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => {
          setIsDeleteConfirmOpen(false);
          addNotification('Burn request submitted to network. Processing...', 'info');
          onClose(); // Also close the options drawer
        }}
        title="Burn NFT?"
        description={`Are you absolutely sure you want to burn "${nft.title}"? This will permanently destroy the asset and remove it from the blockchain. This action cannot be undone.`}
        confirmText="Burn Asset"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
};

export default NFTOptionsModal;
