import React, { useState, useEffect } from 'react';
import {
  Loader2,
  CheckCircle2,
  Wallet,
  Zap,
  Share2,
  ArrowRight,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TON_LOGO } from '@/constants';
import { useAudio } from '@/contexts/AudioContext';
import { NFTItem } from '@/types';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import LoadingOverlay from './LoadingOverlay';
import NFTPurchaseConfirmationDialog from './NFTPurchaseConfirmationDialog';
import NFTAudioPreviewPlayer from './NFTAudioPreviewPlayer';
import { motion, AnimatePresence } from 'motion/react';
import type { WalletTransactionState } from './QuickBuyNFTModal';

interface BuyNFTModalProps {
  nft: NFTItem;
  onClose: () => void;
}

const TX_STATE_LABELS: Record<WalletTransactionState, string> = {
  connect_wallet: 'Connect Wallet',
  wallet_connected: 'Wallet Connected',
  confirm_purchase: 'Confirm Purchase',
  pending: 'Transaction Pending',
  success: 'Transaction Successful',
  failed: 'Transaction Failed',
};

const BuyNFTModal: React.FC<BuyNFTModalProps> = ({ nft, onClose }) => {
  const { addNotification, updateNFT, addUserNFT, userProfile } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const navigate = useNavigate();

  const [txState, setTxState] = useState<WalletTransactionState>(() =>
    userAddress ? 'wallet_connected' : 'connect_wallet'
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmedTxId, setConfirmedTxId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isProcessing = txState === 'pending';

  useEffect(() => {
    if (txState === 'connect_wallet' && userAddress) {
      setTxState('wallet_connected');
    } else if (
      (txState === 'wallet_connected' || txState === 'confirm_purchase') &&
      !userAddress
    ) {
      setTxState('connect_wallet');
    }
  }, [userAddress, txState]);

  const price = parseFloat(String(nft.price || '0').replace(/[^\d.]/g, '')) || 0;
  const platformFeeFromBuyer = price * 0.05;
  const gasFee = 0.05;
  const total = (price + platformFeeFromBuyer + gasFee).toFixed(2);
  const royaltySplits = nft.royaltySplits || [];

  const handleConnectWallet = () => {
    try {
      tonConnectUI.openModal();
    } catch (err) {
      console.warn('[BuyNFTModal] TON Connect modal error:', err);
    }
  };

  const handlePurchase = () => {
    if (!userAddress) {
      setTxState('connect_wallet');
      toast.warning('Please connect your TON wallet to purchase this NFT.');
      addNotification('Connect your TON wallet to continue.', 'warning');
      handleConnectWallet();
      return;
    }
    setErrorMessage(null);
    setTxState('confirm_purchase');
    setIsConfirmOpen(true);
  };

  const executePurchase = async () => {
    triggerHaptic('medium');
    setIsConfirmOpen(false);
    setTxState('pending');
    setErrorMessage(null);
    addNotification('Requesting wallet confirmation...', 'info');
    const toastId = toast.loading('Transaction Pending...', {
      description: 'Broadcasting payment instruction to TON network...',
    });

    try {
      const listing = await getActiveListingForNFT(nft.id);

      if (!listing) {
        throw new Error('Listing not found or is no longer active.');
      }

      const txId = await buyNFT(tonConnectUI, listing, nft);
      setConfirmedTxId(txId || '');

      const confirmed = await monitorTransaction(txId, (status) => {
        if (status === 'pending') {
          toast.loading('Transaction Pending...', {
            id: toastId,
            description: 'Broadcasting payment instruction to TON network...',
          });
        } else if (status === 'confirming') {
          toast.loading('Confirming on TON...', {
            id: toastId,
            description: 'Waiting for blockchain confirmation...',
          });
        } else if (status === 'failed') {
          toast.error('Transaction failed on the TON network.', { id: toastId });
        }
      });

      if (!confirmed) {
        throw new Error('Transaction could not be confirmed on the TON blockchain.');
      }

      const updatedNFT = {
        ...nft,
        owner: userAddress,
        listingType: undefined,
        listingStatus: 'sold',
        price: nft.price,
      } as NFTItem;

      updateNFT(
        nft.id,
        {
          owner: userAddress,
          listingType: undefined,
        },
        true
      );

      addUserNFT(updatedNFT, true);

      if (userProfile.uid) {
        updateEngagementScore(userProfile.uid, 50);
      }

      await createActivityPost(
        userProfile.uid,
        userProfile.name,
        userProfile.avatar,
        `collected ${nft.title} on TON`,
        'nft_purchase',
        {
          targetId: nft.id,
          artistName: nft.artist || nft.creator,
          paymentAmount: nft.price,
          paymentCurrency: 'TON',
        }
      );

      setTxState('success');
      toast.success(`Transaction Successful — "${nft.title}" added to your library!`, {
        id: toastId,
      });
      addNotification(
        'Transaction Successful',
        'success',
        6000,
        `You now own "${nft.title}".`
      );
    } catch (e: any) {
      console.error(e);
      const errorMsg =
        e?.message || 'Transaction could not be verified on the TON network.';
      setErrorMessage(errorMsg);
      setTxState('failed');
      toast.error(`Transaction Failed: ${errorMsg}`, { id: toastId });
      addNotification('Transaction Failed', 'error', 4000, errorMsg);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/#/nft/${nft.id}`;
    navigator.clipboard?.writeText(url);
    addNotification('NFT link copied to clipboard.', 'info');
  };

  return (
    <Dialog
      open={true}
      onOpenChange={() => {
        if (!isProcessing) onClose();
      }}
    >
      <DialogContent
        data-tonjam-modal="true"
        data-tx-state={txState}
        className="sm:max-w-[400px] p-0 overflow-hidden rounded-[8px] border-2 border-[rgba(192,192,192,0.22)] bg-[#0E1729] text-[#F8FAFC] shadow-2xl"
      >
        <DialogTitle className="sr-only">Buy Music NFT</DialogTitle>
        <LoadingOverlay
          isVisible={isProcessing}
          type="transaction"
          message="Transaction Pending..."
        />

        <AnimatePresence mode="wait">
          {txState === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 text-center space-y-5"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-[8px] bg-[#34D399]/15 border-2 border-[#34D399]/40 flex items-center justify-center text-[#34D399]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-white">Transaction Successful</h2>
                  <p className="text-xs text-[#A8B7CC]">
                    NFT added to your TonJam library.
                  </p>
                </div>
              </div>

              <div className="bg-[#121C30] rounded-[8px] border-2 border-[rgba(192,192,192,0.22)] p-4 space-y-4">
                <div className="flex items-center gap-3 text-left">
                  <img
                    src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)}
                    className="w-14 h-14 rounded-[8px] object-cover shrink-0"
                    alt={nft.title}
                  />
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{nft.title}</h3>
                    <span className="text-[11px] font-medium text-[#34D399] block truncate">
                      Confirmed on TON
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-left">
                  <div className="bg-[#0B1424] p-2.5 rounded-[8px] border-2 border-[rgba(192,192,192,0.22)]">
                    <p className="text-[9px] font-semibold text-[#A8B7CC] uppercase tracking-wider mb-0.5">
                      Transaction ID
                    </p>
                    <p className="text-[11px] font-mono text-[#229ED9] truncate">
                      {confirmedTxId || nft.contractAddress || nft.id}
                    </p>
                  </div>
                  <div className="bg-[#0B1424] p-2.5 rounded-[8px] border-2 border-[rgba(192,192,192,0.22)]">
                    <p className="text-[9px] font-semibold text-[#A8B7CC] uppercase tracking-wider mb-0.5">
                      Total Paid
                    </p>
                    <p className="text-[11px] font-mono font-bold text-white">{total} TON</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <Button
                  type="button"
                  onClick={handleShare}
                  variant="outline"
                  className="h-10 rounded-[8px] border-2 border-[rgba(192,192,192,0.22)] bg-[#142036] hover:bg-[#1A2A46] text-white font-semibold text-xs"
                >
                  <Share2 className="w-3.5 h-3.5 mr-1.5" />
                  Share
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    navigate('/library');
                    onClose();
                  }}
                  className="h-10 rounded-[8px] bg-[#229ED9] hover:bg-[#168AC4] text-white font-bold text-xs"
                >
                  View in Library
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-[#A8B7CC] hover:text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-5 space-y-3.5"
            >
              <DialogHeader>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-white">
                      {TX_STATE_LABELS[txState]}
                    </h2>
                    <p className="text-[11px] text-[#A8B7CC]">
                      Review NFT price, fees, and TON wallet status
                    </p>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-[8px] text-[10px] font-semibold border-2',
                      txState === 'failed'
                        ? 'bg-red-500/15 border-red-500/40 text-red-300'
                        : userAddress
                        ? 'bg-[#34D399]/15 border-[#34D399]/40 text-[#34D399]'
                        : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    )}
                  >
                    {userAddress ? 'Wallet Connected' : 'Connect Wallet'}
                  </span>
                </div>
              </DialogHeader>

              <div className="bg-[#142036] border-2 border-[rgba(192,192,192,0.22)] p-2.5 rounded-[8px] flex items-center gap-2.5">
                <img
                  src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)}
                  className="w-11 h-11 rounded-[8px] object-cover shrink-0"
                  alt={nft.title}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-white truncate">{nft.title}</h3>
                  <p className="text-[11px] text-[#A8B7CC] truncate">
                    {nft.artist || nft.creator}
                  </p>
                </div>
              </div>

              <NFTAudioPreviewPlayer
                nft={nft}
                variant="compact"
                title={nft.title}
                artist={nft.artist || nft.creator}
              />

              <ScrollArea className="max-h-[240px]">
                <div className="space-y-3">
                  <div className="p-3 rounded-[8px] border-2 border-[rgba(192,192,192,0.22)] bg-[#121C30] space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[#A8B7CC]">
                      <span>NFT Price</span>
                      <span className="font-mono font-bold text-white">
                        {price.toFixed(2)} TON
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[#A8B7CC]">
                      <span>Platform Fee (5%)</span>
                      <span className="font-mono font-semibold text-[#229ED9]">
                        +{platformFeeFromBuyer.toFixed(2)} TON
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[#A8B7CC]">
                      <span>Network Fee</span>
                      <GasFeeDisplay
                        variant="inline"
                        transactionData={{ type: 'buy', nftId: nft.id, price }}
                      />
                    </div>

                    <Separator className="my-1.5 bg-[rgba(192,192,192,0.18)]" />

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-xs font-bold text-white">Total Payable</span>
                      <div className="flex items-center gap-1.5">
                        <img src={TON_LOGO} className="w-4 h-4" alt="TON" />
                        <span className="text-base font-bold font-mono text-[#229ED9]">
                          {total} TON
                        </span>
                      </div>
                    </div>
                  </div>

                  {royaltySplits.length > 0 && (
                    <div className="p-3 rounded-[8px] bg-[#121C30] border-2 border-[rgba(192,192,192,0.22)] space-y-1.5 text-xs">
                      <span className="text-[10px] font-bold text-[#A8B7CC] uppercase tracking-wider block">
                        Creator Royalties
                      </span>
                      {royaltySplits.map((split, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-[11px] text-[#A8B7CC]">
                            {split.label || 'Creator'} {(split.percentage * 100).toFixed(0)}%
                          </span>
                          <span className="text-[11px] font-mono font-semibold text-[#34D399]">
                            +{(split.percentage * price).toFixed(2)} TON
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {txState === 'failed' && errorMessage && (
                    <div className="p-2.5 rounded-[8px] border-2 border-red-500/40 bg-red-500/10 text-red-200 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <DialogFooter className="flex-col sm:flex-col gap-2 pt-1">
                {!userAddress ? (
                  <Button
                    type="button"
                    onClick={handleConnectWallet}
                    className="w-full h-11 rounded-[8px] text-xs font-bold bg-[#229ED9] hover:bg-[#168AC4] text-white"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handlePurchase}
                    disabled={isProcessing}
                    className="w-full h-11 rounded-[8px] text-xs font-bold bg-[#229ED9] hover:bg-[#168AC4] text-white"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Transaction Pending</span>
                      </div>
                    ) : txState === 'failed' ? (
                      <div className="flex items-center gap-2">
                        <RotateCcw className="h-4 w-4" />
                        <span>Retry Purchase</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 fill-current" />
                        <span>Confirm Purchase</span>
                      </div>
                    )}
                  </Button>
                )}

                <p className="text-[10px] text-center text-[#7F91AA]">
                  Ownership updates once the TON blockchain transaction is confirmed.
                </p>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>

      <NFTPurchaseConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          if (txState === 'confirm_purchase') {
            setTxState(userAddress ? 'wallet_connected' : 'connect_wallet');
          }
        }}
        onConfirm={executePurchase}
        title="Confirm Purchase"
        description="Verify NFT price, 5% platform fee, and network fee before signing in your TON wallet."
        confirmText="Confirm Purchase"
        nft={nft}
        networkFee={gasFee}
        platformFeePercentage={0.05}
        userWalletAddress={userAddress}
        recipientAddress={nft.owner}
      />
    </Dialog>
  );
};

export default BuyNFTModal;
