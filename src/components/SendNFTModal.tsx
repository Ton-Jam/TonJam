import React, { useState } from 'react';
import { X, Send, User, Shield, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { NFTItem } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { motion, AnimatePresence } from 'motion/react';

interface SendNFTModalProps {
  nft: NFTItem;
  isOpen: boolean;
  onClose: () => void;
}

const SendNFTModal: React.FC<SendNFTModalProps> = ({ nft, isOpen, onClose }) => {
  const { addNotification, updateNFT } = useAudio();
  const [recipient, setRecipient] = useState('');
  const [step, setStep] = useState<'input' | 'confirm' | 'sending' | 'success'>('input');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSend = async () => {
    if (!recipient) {
      addNotification("Recipient address required.", "error");
      return;
    }
    setStep('confirm');
  };

  const confirmSend = async () => {
    setStep('sending');
    setIsProcessing(true);
    
    // Simulate blockchain transaction
    setTimeout(() => {
      updateNFT(nft.id, { 
        owner: recipient,
        listingType: undefined, // Remove from sale if it was listed
        offers: [] // Clear offers
      });
      setIsProcessing(false);
      setStep('success');
      addNotification(`Asset ${nft.title} transferred to ${recipient.slice(0, 6)}...`, "success");
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose}></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-[#0A0A0A] border border-border rounded-[20px] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[8px] bg-blue-600/20 flex items-center justify-center">
              <Send className="h-4 w-4 text-blue-500" />
            </div>
            <h2 className="text-sm font-bold text-foreground uppercase tracking-[0.2em]">Transfer Protocol</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground/50 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm" aria-label="Close Send Modal">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 'input' && (
              <motion.div 
                key="input"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-[12px] border border-border/50">
                  <img src={nft.imageUrl} className="w-16 h-16 rounded-[8px] object-cover" alt="" />
                  <div>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">{nft.title}</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{nft.edition}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label htmlFor="recipient-address" className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest ml-1">Recipient Wallet Address</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <input 
                      id="recipient-address"
                      type="text" 
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="EQD... or username"
                      className="w-full bg-muted/50 border border-border rounded-[12px] py-4 pl-12 pr-4 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-[12px] flex gap-3">
                  <Shield className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest leading-relaxed">
                    Warning: This action is irreversible. Ensure the recipient address is correct on the TON network.
                  </p>
                </div>

                <button 
                  onClick={handleSend}
                  disabled={!recipient}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-foreground rounded-[12px] font-bold text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Review Transfer <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {step === 'confirm' && (
              <motion.div 
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 text-center"
              >
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground uppercase tracking-tighter">Confirm Transfer</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">You are sending {nft.title} to:</p>
                </div>

                <div className="p-6 bg-muted/50 border border-border rounded-[16px] break-all">
                  <p className="text-xs font-mono text-blue-400">{recipient}</p>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setStep('input')}
                    className="flex-1 py-4 bg-muted/50 hover:bg-muted text-muted-foreground/80 rounded-[12px] font-bold text-[10px] uppercase tracking-[0.2em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    Back
                  </button>
                  <button 
                    onClick={confirmSend}
                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-foreground rounded-[12px] font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    Confirm & Send
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'sending' && (
              <motion.div 
                key="sending"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 flex flex-col items-center justify-center gap-6"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin"></div>
                  <Loader2 className="absolute inset-0 m-auto h-8 w-8 text-blue-500 animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-[0.3em]">Broadcasting Signal</h3>
                  <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Awaiting TON network confirmation...</p>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center gap-6 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-[0.3em]">Transfer Complete</h3>
                  <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest leading-relaxed">
                    The asset has been successfully transferred to the new owner.
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="mt-4 px-10 py-3 bg-muted/50 hover:bg-muted text-foreground rounded-[10px] font-bold text-[9px] uppercase tracking-[0.2em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Close Vault
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default SendNFTModal;
