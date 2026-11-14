import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, ChevronRight, ArrowLeft, Music, ShieldCheck, 
  CheckCircle2, User, Wallet, Lock, 
  AlertCircle, RefreshCw
} from 'lucide-react';
import { useToast } from '@/components/layout/ToastProvider';
import { useAuth } from '@/contexts/AuthContext';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface ArtistVerificationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type StepId = 'welcome' | 'spotify' | 'identity' | 'submitted';

export const ArtistVerificationWizard: React.FC<ArtistVerificationWizardProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const toast = useToast();
  const { user, userProfile } = useAuth();
  const tonAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  const [currentStep, setCurrentStep] = useState<StepId>('welcome');
  const [spotifyArtistUrl, setSpotifyArtistUrl] = useState('');
  const [realName, setRealName] = useState(userProfile?.name || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidSpotifyUrl = /^https:\/\/(open\.)?spotify\.com\/(artist|user)\/[a-zA-Z0-9]+/i.test(spotifyArtistUrl.trim());

  const handleConnectWallet = async () => {
    try {
      await tonConnectUI.openModal();
    } catch (err) {
      toast.error('Wallet Connection Failed', 'Could not open TON Connect wallet selector.');
    }
  };

  const handleSubmitVerification = async () => {
    if (!user?.uid) {
      toast.error('Sign In Required', 'Please sign in before submitting an artist verification request.');
      return;
    }
    if (!tonAddress) {
      toast.error('Wallet Required', 'Connect your TON wallet to link creator royalties.');
      return;
    }
    if (!isValidSpotifyUrl) {
      toast.error('Invalid URL', 'Enter a valid Spotify Artist profile URL.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'verificationRequests'), {
        userId: user.uid,
        artistName: realName.trim(),
        contactEmail: contactEmail.trim(),
        spotifyUrl: spotifyArtistUrl.trim(),
        walletAddress: tonAddress,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setCurrentStep('submitted');
      toast.success('Application Submitted', 'Your verification request is now queued for admin review.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'verificationRequests');
      toast.error('Submission Failed', 'Could not submit verification request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.45 }}
            className="bg-[#050A24] rounded-[28px] max-w-lg w-full text-white relative flex flex-col max-h-[85vh] shadow-2xl overflow-hidden"
          >
            {/* Upper Indicator Row / Steps Progress Bar */}
            {currentStep !== 'submitted' && (
              <div className="bg-slate-950/40 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#0052FF]/10 text-[#0052FF] rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    Artist Onboarding Wizard
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <div className={`w-3.5 h-1 rounded-full transition-colors ${currentStep === 'welcome' ? 'bg-[#0052FF]' : 'bg-[#0052FF]/30'}`} />
                  <div className={`w-3.5 h-1 rounded-full transition-colors ${currentStep === 'spotify' ? 'bg-[#0052FF]' : 'bg-[#0052FF]/10'}`} />
                  <div className={`w-3.5 h-1 rounded-full transition-colors ${currentStep === 'identity' ? 'bg-[#0052FF]' : 'bg-[#0052FF]/10'}`} />
                </div>
              </div>
            )}

            {/* Scrollable Contents */}
            <div className="p-6 overflow-y-auto flex-1 no-scrollbar space-y-6">
              {/* STEP 1: WELCOME */}
              {currentStep === 'welcome' && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-black uppercase tracking-tight text-white leading-none">
                      Become a Verified Creator
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Submit your Spotify artist profile and connected TON wallet for verification review.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-white/5 rounded-xl p-4 flex items-start gap-3">
                      <div className="p-2 bg-[#0052FF]/10 text-[#0052FF] rounded-xl shrink-0 mt-0.5">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Direct TON Royalties</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          Route NFT sales and listener payouts directly to your connected TON wallet address.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 flex items-start gap-3">
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl shrink-0 mt-0.5">
                        <Music className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Digital Audio Collectibles</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          Publish tracks and mint limited music NFT editions on TON.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-950/20 rounded-xl p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-[#0052FF] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[11px] font-bold text-[#0052FF] uppercase tracking-wider">Before you begin</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                        Prepare your official Spotify Artist URL, contact email, and connected TON wallet.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={onClose}
                      className="py-3 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-xs font-bold uppercase tracking-widest rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setCurrentStep('spotify')}
                      className="py-3 bg-[#0052FF] hover:bg-[#0040D9] active:scale-95 transition-all text-xs font-bold uppercase tracking-widest rounded-xl text-white flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Get Started</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: SPOTIFY LINK */}
              {currentStep === 'spotify' && (
                <div className="space-y-6">
                  <div className="space-y-1.5 text-center">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full mx-auto flex items-center justify-center mb-1">
                      <Music className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold uppercase tracking-tight">Spotify Artist Profile</h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Paste your official Spotify Artist URL for ownership review.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Spotify Artist URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://open.spotify.com/artist/..."
                      value={spotifyArtistUrl}
                      onChange={(e) => setSpotifyArtistUrl(e.target.value)}
                      className="w-full bg-slate-950/40 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#0052FF] transition-all"
                    />
                    {spotifyArtistUrl.trim().length > 0 && !isValidSpotifyUrl && (
                      <p className="text-[11px] text-rose-400">
                        Please enter a valid https://open.spotify.com/artist/... link.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => setCurrentStep('welcome')}
                      className="py-3 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-xs font-bold uppercase tracking-widest rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button
                      disabled={!isValidSpotifyUrl}
                      onClick={() => setCurrentStep('identity')}
                      className="py-3 bg-[#0052FF] hover:bg-[#0040D9] active:scale-95 transition-all text-xs font-bold uppercase tracking-widest rounded-xl text-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: IDENTITY & WALLET */}
              {currentStep === 'identity' && (
                <div className="space-y-6">
                  <div className="space-y-1.5 text-center">
                    <div className="w-12 h-12 bg-[#0052FF]/10 text-[#0052FF] rounded-full mx-auto flex items-center justify-center mb-1">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold uppercase tracking-tight">Identity & Wallet Link</h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Confirm your artist name, email, and live TON Connect wallet address.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Legal Artist / Stage Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          required
                          placeholder="Your artist name"
                          value={realName}
                          onChange={(e) => setRealName(e.target.value)}
                          className="w-full bg-slate-950/40 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#0052FF] transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Contact Verification Email
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          required
                          placeholder="you@domain.com"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full bg-slate-950/40 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#0052FF] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
                      Connected TON Wallet
                    </span>

                    <div className="bg-slate-950/60 rounded-xl p-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Wallet className="w-4 h-4 text-[#0052FF] shrink-0" />
                          <span className="text-xs font-bold text-slate-200 font-mono truncate">
                            {tonAddress || 'No wallet connected'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Royalties and creator payouts will be associated with this wallet.
                        </p>
                      </div>

                      {!tonAddress && (
                        <button
                          type="button"
                          onClick={handleConnectWallet}
                          className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-all shrink-0 bg-white/10 hover:bg-white/15 text-white"
                        >
                          Connect Wallet
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => setCurrentStep('spotify')}
                      className="py-3 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-xs font-bold uppercase tracking-widest rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button
                      disabled={!realName.trim() || !contactEmail.trim() || !tonAddress || isSubmitting}
                      onClick={handleSubmitVerification}
                      className="py-3 bg-[#0052FF] hover:bg-[#0040D9] active:scale-95 transition-all text-xs font-bold uppercase tracking-widest rounded-xl text-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Submit Request</span>}
                      {!isSubmitting && <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: SUBMITTED FOR REVIEW */}
              {currentStep === 'submitted' && (
                <div className="space-y-6 text-center py-4">
                  <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                      Pending Admin Review
                    </span>
                    <h3 className="text-xl font-black uppercase tracking-tight text-white leading-none">
                      Verification Submitted
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                      Your request has been saved to Firestore and will remain pending until reviewed by a TonJam administrator.
                    </p>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      onComplete();
                      onClose();
                    }}
                    className="w-full bg-[#0052FF] hover:bg-[#0040D9] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Done</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ArtistVerificationWizard;
