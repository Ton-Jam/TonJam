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
import { buyNFT, getActiveListingForNFT } from '@/services/marketplaceService';
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
      // 1. Fetch active listing from Firestore
      const listing = await getActiveListingForNFT(nft.id);
      
      if (!listing) {
        addNotification("Listing not found or no longer active.", "error");
        setIsProcessing(false);
        return;
      }

      // 2. Execute buy through marketplace service
      await buyNFT(tonConnectUI, listing, nft);
      
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
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[32px] bg-[#0A0A0A] shadow-[0_0_80px_rgba(var(--primary-rgb),0.15)] border-none">
        <LoadingOverlay isVisible={isProcessing} type="transaction" message="Recalibrating Neural Frequencies..." />
        
        {/* Hardware-style scanline overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-[60]" />

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div 
              key="checkout"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="p-5 md:p-8 space-y-6 md:space-y-8 relative z-10"
            >
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_15px_rgba(var(--primary-rgb),0.6)]"></div>
                       <span className="text-[10px] font-black text-primary uppercase tracking-[0.6em] italic">Consensus.Inbound_v2.4</span>
                    </div>
                    <DialogTitle className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic leading-[0.85] text-white">
                      Initialize <br/>
                      <span className="text-primary">Acquisition</span>
                    </DialogTitle>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="p-2.5 md:p-3 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
                      <Zap className="w-4 h-4 md:w-5 md:h-5 text-primary fill-current" />
                    </div>
                    <span className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest">Protocol.Zap</span>
                  </div>
                </div>
              </DialogHeader>

              <div className="bg-white/[0.02] border border-white/5 p-5 md:p-6 rounded-[24px] md:rounded-[28px] relative overflow-hidden group">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 blur-3xl rounded-full"></div>
                
                <div className="flex items-center gap-4 md:gap-6 relative z-10">
                  <div className="relative shrink-0">
                    <img 
                      src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)} 
                      className="w-20 h-20 md:w-28 md:h-28 rounded-xl md:rounded-2xl object-cover shadow-2xl border border-white/10 group-hover:scale-105 transition-transform duration-700" 
                      alt={nft.title} 
                    />
                    <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-[#0A0A0A] border-2 border-white/10 rounded-full p-1.5 md:p-2.5 shadow-xl">
                        <MusicIcon className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                      <Badge variant="outline" className="text-[7px] md:text-[8px] font-black tracking-[0.2em] px-1.5 md:px-2 py-0.5 bg-primary/10 border-primary/20 text-primary italic">
                        {nft.edition || 'GENESIS'}
                      </Badge>
                      <span className="text-[7px] md:text-[8px] font-black text-muted-foreground/30 uppercase">#0{Math.floor(Math.random() * 999)}</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter italic truncate leading-none mb-1 md:mb-2">{nft.title}</h3>
                    <p className="text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] flex items-center gap-2">
                      <span className="text-white/40">Architect:</span>
                      <span className="text-primary italic truncate">{nft.creator}</span>
                    </p>
                    <div className="mt-3 md:mt-4 flex items-center gap-4 text-[8px] md:text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest italic">
                       <span className="flex items-center gap-1.5"><ShieldCheck className="w-2.5 h-2.5 md:w-3 md:h-3 text-emerald-500/50" /> Ownership_Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              <ScrollArea className="max-h-[200px] md:max-h-[250px] pr-4 -mr-4">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center group/item">
                      <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.3em] italic group-hover/item:text-white/60 transition-colors">Digital_Signal_Value</span>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white italic">{price}</span>
                        <span className="text-[10px] font-black text-muted-foreground/40 italic">TON</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-primary group/item">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] italic opacity-80 group-hover/item:opacity-100 transition-opacity">Network_Relay_Premium</span>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black italic">+{platformFeeFromBuyer.toFixed(2)}</span>
                        <span className="text-[10px] font-black opacity-40 italic">TON</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center group/item">
                      <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.3em] italic group-hover/item:text-white/60 transition-colors">Gas_Protocol_Load</span>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white italic">~{gasFee}</span>
                        <span className="text-[10px] font-black text-muted-foreground/40 italic">TON</span>
                      </div>
                    </div>
                    
                    <div className="h-px w-full bg-white/5 relative overflow-hidden">
                       <motion.div 
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-primary/50 to-transparent" 
                       />
                    </div>
                    
                    <div className="flex justify-between items-center p-6 md:p-8 bg-primary/5 border border-primary/20 rounded-[28px] md:rounded-[32px] relative overflow-hidden group/total">
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/total:opacity-100 transition-opacity pointer-events-none"></div>
                      <div className="absolute top-0 right-0 p-6 opacity-5"><Wallet className="w-20 h-20" /></div>
                      
                      <div className="relative z-10 space-y-0.5 md:space-y-1">
                        <span className="text-[10px] md:text-[11px] font-black text-white uppercase tracking-[0.4em] italic leading-none">Payload.Total</span>
                        <p className="text-[7px] md:text-[8px] text-muted-foreground/40 uppercase tracking-widest italic">Calculated Consensus</p>
                      </div>
                      
                      <div className="flex items-center gap-3 md:gap-4 relative z-10 group-hover/total:scale-105 transition-transform">
                        <img src={TON_LOGO} className="w-6 h-6 md:w-8 md:h-8 contrast-200 brightness-200" alt="TON" />
                        <span className="text-2xl md:text-4xl font-black text-white tracking-tighter italic shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]">{total}</span>
                      </div>
                    </div>
                  </div>

                  {royaltySplits.length > 0 && (
                    <div className="p-5 md:p-6 rounded-[24px] md:rounded-3xl bg-white/[0.02] border border-white/5 space-y-3 md:space-y-4">
                      <div className="flex items-center gap-3 mb-1.5 md:mb-2">
                        <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
                        <span className="text-[8px] md:text-[9px] font-black text-white/50 uppercase tracking-[0.4em] italic">Creator_Royalty_Matrix</span>
                      </div>
                      {royaltySplits.map((split, i) => (
                        <div key={i} className="flex justify-between items-center group/split">
                          <span className="text-[9px] md:text-[10px] font-black text-muted-foreground group-hover/split:text-white transition-colors uppercase tracking-widest italic">{split.label || 'Protocol_Architect'} ({ (split.percentage * 100).toFixed(0) }%)</span>
                          <span className="text-[10px] md:text-[11px] font-black text-emerald-500 italic">+{(split.percentage * price).toFixed(2)} TON</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="space-y-4">
                <Button
                  onClick={handlePurchase}
                  disabled={isProcessing}
                  className="w-full h-15 md:h-18 rounded-full text-xs font-black uppercase tracking-[0.4em] md:tracking-[0.5em] italic shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] group relative overflow-hidden bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {isProcessing ? (
                    <div className="flex items-center gap-3 md:gap-4">
                      <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                      <span>Transmitting.Signal...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 md:gap-4">
                      <Zap className="h-4 w-4 md:h-5 md:w-5 fill-current" />
                      <span>Execute.Acquisition</span>
                    </div>
                  )}
                </Button>

                <div className="flex flex-col items-center gap-3 md:gap-4 opacity-30 px-4">
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-white to-transparent"></div>
                  <p className="text-[8px] md:text-[9px] text-center text-muted-foreground font-black uppercase tracking-[0.3em] italic">
                    Acquisition binds data to your personal TON vault forever.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 md:p-10 text-center space-y-8 md:space-y-10 relative z-10"
            >
              <div className="flex flex-col items-center gap-4 md:gap-6">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.4)]"
                >
                  <ShieldCheck className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </motion.div>
                <div className="space-y-2 md:space-y-3">
                  <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic leading-none">Sync.Complete</h2>
                  <p className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.6em] italic">Asset Locked in Vault</p>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-[28px] md:rounded-[32px] p-6 md:p-8 space-y-5 md:space-y-6 relative group overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center gap-4 md:gap-6 text-left">
                  <img 
                    src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)} 
                    className="w-20 h-20 md:w-24 md:h-24 rounded-xl md:rounded-2xl object-cover grayscale brightness-125" 
                    alt={nft.title} 
                  />
                  <div className="space-y-1.5 md:space-y-2 min-w-0">
                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter italic leading-none truncate">{nft.title}</h3>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500"></div>
                       <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-widest italic truncate">Node: TON_MAINNET_SYNCED</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="bg-black/40 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5 overflow-hidden">
                     <p className="text-[7px] md:text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1">TX.ID</p>
                     <p className="text-[9px] md:text-[10px] font-mono text-primary truncate">EQ{Math.random().toString(36).substring(7).toUpperCase()}...</p>
                  </div>
                  <div className="bg-black/40 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5">
                     <p className="text-[7px] md:text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1">COST</p>
                     <p className="text-[9px] md:text-[10px] font-black text-white italic">{total} TON</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <Button 
                  onClick={handleShare}
                  variant="outline" 
                  className="h-12 md:h-14 rounded-full border-white/10 bg-white/5 font-black uppercase text-[9px] md:text-[10px] tracking-widest italic group"
                >
                  <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2 md:mr-3 group-hover:text-primary transition-colors" />
                  Broadcast
                </Button>
                <Button 
                  onClick={() => { navigate('/library'); onClose(); }}
                  className="h-12 md:h-14 rounded-full bg-primary font-black uppercase text-[9px] md:text-[10px] tracking-widest italic group"
                >
                  <span className="hidden md:inline">Vault View</span>
                  <span className="md:hidden">Vault</span>
                  <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 ml-2 md:ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
              
              <button 
                onClick={onClose}
                className="text-[9px] md:text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] italic hover:text-white transition-colors"
              >
                Close Protocol Terminal
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default BuyNFTModal;
