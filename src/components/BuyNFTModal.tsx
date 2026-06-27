import React, { useState } from 'react';
import { Loader2, CheckCircle2, Info, Wallet, Music as MusicIcon, Zap, ShieldCheck, Share2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TON_LOGO } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import { NFTItem } from '@/types';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { processNFTSaleRoyalty } from '@/services/royaltyService';
import { createActivityPost } from '@/services/socialService';
import { getPlaceholderImage, cn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';
import { buyNFT, getActiveListingForNFT } from '@/services/marketplaceService';
import { updateEngagementScore } from '@/services/engagementService';
import { GasFeeDisplay } from '@/components/GasFeeDisplay';
import { toast } from 'sonner';
import { monitorTransaction } from '@/services/tonService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import LoadingOverlay from './LoadingOverlay';
import ConfirmationModal from './ConfirmationModal';
import { motion, AnimatePresence } from 'motion/react';

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
  const [isSuccess, setIsSuccess] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const price = parseFloat(nft.price) || 0;
  const platformFeeFromBuyer = price * 0.05;
  const platformFeeFromSeller = price * 0.05;
  const gasFee = 0.05;
  const total = (price + platformFeeFromBuyer + gasFee).toFixed(2);
  
  // Calculate royalty splits
  const royaltySplits = nft.royaltySplits || [];
  const royaltyTotal = royaltySplits.reduce((sum, split) => sum + (split.percentage * price), 0);
  const artistShare = (price - platformFeeFromSeller - royaltyTotal).toFixed(2);

  const handlePurchase = () => {
    if (!userAddress) {
      addNotification("Connect wallet to initialize sync.", "warning");
      return;
    }
    setIsConfirmOpen(true);
  };

  const executePurchase = async () => {
    triggerHaptic('medium');
    setIsConfirmOpen(false);
    setIsProcessing(true);
    addNotification("Requesting wallet signature...", "info");
    try {
      // 1. Fetch active listing from Firestore
      const listing = await getActiveListingForNFT(nft.id);
      
      if (!listing) {
        addNotification("Listing not found or no longer active.", "error");
        setIsProcessing(false);
        return;
      }

      // 2. Execute buy through marketplace service
      const txId = await buyNFT(tonConnectUI, listing, nft);
      
      const toastId = toast.loading("Purchase processing...", {
        description: "Checking wallet state and initializing sync..."
      });
      await monitorTransaction(txId, (status) => {
        if (status === 'pending') {
          toast.loading("Transaction initiated...", { 
            id: toastId,
            description: "Broadcasting payment instruction to TON network..."
          });
        } else if (status === 'confirming') {
          toast.loading("Blockchain confirming...", { 
            id: toastId, 
            description: "Validator validation in progress. This will take a moment..."
          });
        } else if (status === 'success') {
          toast.success("Transaction success!", { 
            id: toastId,
            description: `You are now the certified owner of "${nft.title}"!`,
            duration: 8000,
            action: {
              label: "View Wallet",
              onClick: () => navigate("/wallet")
            }
          });
        } else if (status === 'failed') {
          toast.error("Transaction failed", { 
            id: toastId,
            description: "The network reverted the transaction or the signature was rejected."
          });
        }
      });
      
      const updatedNFT = {
        ...nft,
        owner: userAddress,
        listingType: undefined,
        price: nft.price
      } as NFTItem;

      // Update global state
      updateNFT(nft.id, { 
        owner: userAddress, 
        listingType: undefined 
      }, true);
      
      addUserNFT(updatedNFT, true);

      // Add points for purchasing
      if (userProfile.uid) {
        updateEngagementScore(userProfile.uid, 50); // 50 points for purchasing
      }

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
      setIsSuccess(true);
    } catch (e) {
      console.error(e);
      addNotification("Sync protocol aborted.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = () => {
    // Simple mock sharing
    addNotification("Broadcast link copied to clipboard.", "info");
  };

  return (
    <Dialog open={true} onOpenChange={() => { if (!isProcessing) onClose(); }}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-2xl bg-background border border-border shadow-xl">
        <DialogTitle className="sr-only">Asset Acquisition</DialogTitle>
        <LoadingOverlay isVisible={isProcessing} type="transaction" message="Recalibrating..." />
        
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div 
              key="checkout"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="p-5 space-y-4"
            >
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">
                      Acquisition
                    </h2>
                  </div>
                </div>
              </DialogHeader>

              <div className="bg-muted/50 p-3 rounded-xl flex items-center gap-3">
                  <img 
                    src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)} 
                    className="w-12 h-12 rounded-lg object-cover" 
                    alt={nft.title} 
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate">{nft.title}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase">{nft.creator}</p>
                  </div>
              </div>

              <ScrollArea className="max-h-[220px] pr-4 -mr-4">
                <div className="space-y-4 list-section-silver">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center group/item">
                      <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">Signal_Value</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-foreground">{price}</span>
                        <span className="text-[9px] font-black text-muted-foreground/40">TON</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-primary group/item">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Relay_Premium</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-primary">+{platformFeeFromBuyer.toFixed(2)}</span>
                        <span className="text-[9px] font-black opacity-40">TON</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center group/item">
                      <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">Gas_Load</span>
                      <div className="flex items-center gap-1.5">
                        <GasFeeDisplay variant="inline" transactionData={{type: 'buy', nftId: nft.id, price: price}} />
                      </div>
                    </div>
                    
                    <Separator className="my-1.5 bg-border" />
                    
                    <div className="flex justify-between items-center p-4 bg-muted/80 rounded-[4px] relative overflow-hidden">
                      <span className="text-[9px] font-black text-foreground uppercase tracking-[0.3em] leading-none">Total</span>
                      <div className="flex items-center gap-2">
                        <img src={TON_LOGO} className="w-4 h-4" alt="TON" />
                        <span className="text-lg font-black text-foreground tracking-tighter">{total}</span>
                      </div>
                    </div>
                  </div>

                  {royaltySplits.length > 0 && (
                    <div className="p-4 rounded-[4px] bg-muted/50 border border-border space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em]">Royalties</span>
                      </div>
                      {royaltySplits.map((split, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{split.label || 'Creator'} {(split.percentage * 100).toFixed(0)}%</span>
                          <span className="text-[9px] font-black text-emerald-500">+{(split.percentage * price).toFixed(2)} TON</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>

              <DialogFooter className="space-y-3 mt-4">
                <Button
                  onClick={handlePurchase}
                  disabled={isProcessing}
                  className="w-full h-12 rounded-full text-[10px] font-black uppercase tracking-[0.3em] bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white border border-[#C0C0C0]/50 shadow-lg hover:scale-[1.02] transition-all"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Transmitting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 fill-current" />
                      <span>Execute.Acquisition</span>
                    </div>
                  )}
                </Button>

                <div className="flex flex-col items-center gap-3 opacity-30 px-4">
                  <div className="h-px w-full bg-border"></div>
                  <p className="text-[8px] text-center text-muted-foreground font-black uppercase tracking-[0.3em]">
                    Acquisition binds data to your personal TON vault forever.
                  </p>
                </div>
              </DialogFooter>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 text-center space-y-8"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center">
                  <ShieldCheck className="w-10 h-10 text-white" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter leading-none">Sync.Complete</h2>
                  <p className="text-[9px] font-black text-primary uppercase tracking-[0.6em]">Asset Locked in Vault</p>
                </div>
              </div>

              <div className="bg-muted/80 rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-4 text-left">
                  <img 
                    src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)} 
                    className="w-20 h-20 rounded-xl object-cover" 
                    alt={nft.title} 
                  />
                  <div className="space-y-1.5 min-w-0">
                    <h3 className="text-lg font-black text-foreground uppercase tracking-tighter leading-none truncate">{nft.title}</h3>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                       <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest truncate">Node: TON_MAINNET_SYNCED</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background p-3 rounded-xl border">
                     <p className="text-[7px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1">TX.ID</p>
                     <p className="text-[9px] font-mono text-primary truncate">EQ{Math.random().toString(36).substring(7).toUpperCase()}...</p>
                  </div>
                  <div className="bg-background p-3 rounded-xl border">
                     <p className="text-[7px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1">COST</p>
                     <p className="text-[9px] font-black text-foreground">{total} TON</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={handleShare}
                  variant="outline" 
                  className="h-12 rounded-full font-black uppercase text-[9px] tracking-widest"
                >
                  <Share2 className="w-3.5 h-3.5 mr-2" />
                  Broadcast
                </Button>
                <Button 
                  onClick={() => { navigate('/library'); onClose(); }}
                  className="h-12 rounded-full bg-primary font-black uppercase text-[9px] tracking-widest"
                >
                  Vault View
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Button>
              </div>
              
              <button 
                onClick={onClose}
                className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] hover:text-foreground transition-colors mt-2"
              >
                Close Protocol Terminal
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executePurchase}
        title="Execute Purchase Protocol?"
        description="Verify signal parameters before broadcasting to the TON blockchain relay."
        confirmText="Confirm & Acquire"
        assetName={nft.title}
        assetImage={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)}
        tonAmount={price.toString()}
        networkFee={gasFee.toString()}
        totalAmount={total}
        fromAddress={userAddress}
        recipient={nft.owner}
        transactionType="Acquisition Execution"
      />
    </Dialog>
  );
};

export default BuyNFTModal;
