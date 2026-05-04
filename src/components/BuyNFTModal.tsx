import React, { useState } from 'react';
import { Loader2, CheckCircle2, Info, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TON_LOGO } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import { NFTItem } from '@/types';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { buyNFT } from '@/services/tonService';
import { processNFTSaleRoyalty } from '@/services/royaltyService';
import { createActivityPost } from '@/services/socialService';
import { getPlaceholderImage, cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import LoadingOverlay from './LoadingOverlay';

interface BuyNFTModalProps {
  nft: NFTItem;
  onClose: () => void;
}

const BuyNFTModal: React.FC<BuyNFTModalProps> = ({ nft, onClose }) => {
  const { addNotification, updateNFT, addUserNFT, userProfile } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const price = parseFloat(nft.price) || 0;
  const platformFeeFromBuyer = price * 0.05;
  const platformFeeFromSeller = price * 0.05;
  const gasFee = 0.05;
  const total = (price + platformFeeFromBuyer + gasFee).toFixed(2);
  
  // Calculate royalty splits
  const royaltySplits = nft.royaltySplits || [];
  const royaltyTotal = royaltySplits.reduce((sum, split) => sum + (split.percentage * price), 0);
  const artistShare = (price - platformFeeFromSeller - royaltyTotal).toFixed(2);

  const handlePurchase = async () => {
    if (!userAddress) {
      addNotification("Connect wallet to initialize sync.", "warning");
      return;
    }
    setIsProcessing(true);
    addNotification("Requesting wallet signature...", "info");
    try {
      await buyNFT(tonConnectUI, nft.owner, nft.price, nft.title, nft.royaltySplits || []);
      
      const updatedNFT = {
        ...nft,
        owner: userAddress,
        listingType: undefined,
        price: nft.price
      } as NFTItem;

      // Record the transaction for royalty distribution
      await processNFTSaleRoyalty(nft, price);

      // Update global state
      updateNFT(nft.id, { 
        owner: userAddress, 
        listingType: undefined 
      }, true);
      
      addUserNFT(updatedNFT, true);

      // Create a sophisticated activity post
      await createActivityPost(
        userProfile.uid,
        userProfile.name,
        userProfile.avatar,
        `just acquired a rare sonic artifact: ${nft.title}`,
        'nft_purchase',
        {
          targetId: nft.id,
          artistName: nft.artist || nft.creator,
          paymentAmount: nft.price,
          paymentCurrency: 'TON'
        }
      );
      
      addNotification("Asset successfully synced to vault.", "success");
      onClose();
    } catch (e) {
      console.error(e);
      addNotification("Sync protocol aborted.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden rounded-3xl border-border bg-card shadow-2xl">
        <LoadingOverlay isVisible={isProcessing} type="transaction" message="Executing TON Protocol..." />
        
        <div className="p-6 space-y-6">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight">Purchase Asset</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  TON Blockchain Sync
                </DialogDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => { navigate(`/nft/${nft.id}`); onClose(); }}
                className="h-8 w-8 rounded-full"
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <Card className="border-border bg-background/50">
            <CardContent className="flex items-center gap-4 p-4">
              <img 
                src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)} 
                className="w-16 h-16 rounded-lg object-cover shadow-md" 
                alt={nft.title} 
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{nft.title}</p>
                <p className="text-xs text-muted-foreground truncate uppercase font-medium mt-0.5">Creator: {nft.creator}</p>
                <Badge variant="secondary" className="mt-2 text-[10px] font-medium h-5">
                  {nft.edition || 'Rare'} Artifact
                </Badge>
              </div>
            </CardContent>
          </Card>

          <ScrollArea className="max-h-[300px] pr-2 -mr-2">
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Artifact Value</span>
                  <span className="font-semibold text-foreground">{price} TON</span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Network Sync Fee</span>
                  <span className="text-primary font-medium">+{platformFeeFromBuyer.toFixed(2)} TON</span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Gas Reservation</span>
                  <span className="text-muted-foreground">~{gasFee} TON</span>
                </div>
                
                <Separator className="bg-border my-2" />
                
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-xl">
                  <span className="text-sm font-semibold text-foreground">Total Required</span>
                  <div className="flex items-center gap-2">
                    <img src={TON_LOGO} className="w-5 h-5" alt="TON" />
                    <span className="text-xl font-bold text-foreground">{total}</span>
                  </div>
                </div>
              </div>

              {royaltySplits.length > 0 && (
                <div className="p-4 rounded-xl border border-border bg-background space-y-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Royalty Distribution</span>
                  {royaltySplits.map((split, i) => (
                    <div key={i} className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{split.label || 'Collaborator'} ({ (split.percentage * 100).toFixed(0) }%)</span>
                      <span className="text-primary">{(split.percentage * price).toFixed(2)} TON</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          <Button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="w-full h-12 rounded-xl text-sm font-semibold uppercase tracking-wide"
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wallet className="h-4 w-4 mr-2" />}
            {isProcessing ? 'Executing...' : 'Execute Purchase'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyNFTModal;