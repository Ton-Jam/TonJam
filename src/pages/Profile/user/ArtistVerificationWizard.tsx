import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Check, ChevronRight, ArrowLeft, Music, ShieldCheck, 
  Search, CheckCircle2, User, Wallet, Lock, HelpCircle, 
  TrendingUp, Play, Disc, Eye, AlertCircle, RefreshCw, Smartphone
} from 'lucide-react';
import { useToast } from '@/components/layout/ToastProvider';

interface ArtistVerificationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type StepId = 'welcome' | 'spotify' | 'identity' | 'review' | 'approved';

export const ArtistVerificationWizard: React.FC<ArtistVerificationWizardProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState<StepId>('welcome');
  const [spotifySearch, setSpotifySearch] = useState('');
  const [selectedSpotifyArtist, setSelectedSpotifyArtist] = useState<any | null>(null);
  const [isSearchingSpotify, setIsSearchingSpotify] = useState(false);
  const [realName, setRealName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isWalletSigned, setIsWalletSigned] = useState(false);
  const [isSigningWallet, setIsSigningWallet] = useState(false);
  const [reviewProgress, setReviewProgress] = useState(0);
  const [reviewLogs, setReviewLogs] = useState<string[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);

  // Mock Spotify search results
  const mockSpotifyArtists = [
    { name: 'DJ Krupy', followers: '154.2K', monthlyListeners: '85,400', image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80' },
    { name: 'Krupy Project', followers: '12.8K', monthlyListeners: '5,100', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=150&h=150&q=80' },
    { name: 'Krupy & Synthwave', followers: '45.1K', monthlyListeners: '22,400', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=150&h=150&q=80' }
  ];

  const filteredArtists = mockSpotifyArtists.filter(artist => 
    artist.name.toLowerCase().includes(spotifySearch.toLowerCase())
  );

  const handleSearchSpotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotifySearch.trim()) return;
    setIsSearchingSpotify(true);
    setTimeout(() => {
      setIsSearchingSpotify(false);
    }, 800);
  };

  const handleSelectSpotify = (artist: any) => {
    setSelectedSpotifyArtist(artist);
    toast.success('Spotify Connected', `Linked successfully with ${artist.name} on Spotify.`);
  };

  const handleSignWallet = () => {
    setIsSigningWallet(true);
    setTimeout(() => {
      setIsSigningWallet(false);
      setIsWalletSigned(true);
      toast.success('Signature Secured', 'Cryptographic proof signed successfully using TON Wallet.');
    }, 1500);
  };

  const startReviewProcess = () => {
    setIsReviewing(true);
    setCurrentStep('review');
    setReviewProgress(0);
    setReviewLogs(['Initializing Decentralized Verification Node...', 'Connecting to Spotify Web API Node...']);

    const logsTimeline = [
      { time: 600, log: 'Spotify credentials authenticated successfully.' },
      { time: 1200, log: 'Retrieving monthly statistics & playlist occurrences...' },
      { time: 1800, log: 'Fetching TON wallet address: UQAs9...7K_p' },
      { time: 2400, log: 'Cryptographic signature match: SUCCESS' },
      { time: 3000, log: 'Running identity background sanitization audit...' },
      { time: 3600, log: 'Sanitization check: CLEAN (0 issues found)' },
      { time: 4200, log: 'Compiling verification report block...' },
      { time: 4800, log: 'Publishing verification metadata status to TON...' }
    ];

    logsTimeline.forEach((item, index) => {
      setTimeout(() => {
        setReviewLogs(prev => [...prev, item.log]);
        setReviewProgress(Math.floor(((index + 1) / logsTimeline.length) * 100));
      }, item.time);
    });

    setTimeout(() => {
      setCurrentStep('approved');
      setIsReviewing(false);
      toast.success('Application Approved!', 'Your TonJam Artist profile has been unlocked.');
    }, 5500);
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
            className="bg-[#050A24] border border-white/10 rounded-[28px] max-w-lg w-full text-white relative flex flex-col max-h-[85vh] shadow-2xl overflow-hidden"
          >
            {/* Upper Indicator Row / Steps Progress Bar */}
            {currentStep !== 'approved' && (
              <div className="bg-slate-950/40 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#0052FF]/10 text-[#0052FF] rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    Artist Onboarding Wizard
                  </span>
                </div>
                
                {/* Horizontal Progress bar indicators */}
                <div className="flex items-center gap-1">
                  <div className={`w-3.5 h-1 rounded-full transition-colors ${currentStep === 'welcome' ? 'bg-[#0052FF]' : 'bg-[#0052FF]/30'}`} />
                  <div className={`w-3.5 h-1 rounded-full transition-colors ${currentStep === 'spotify' ? 'bg-[#0052FF]' : 'bg-[#0052FF]/10'}`} />
                  <div className={`w-3.5 h-1 rounded-full transition-colors ${currentStep === 'identity' ? 'bg-[#0052FF]' : 'bg-[#0052FF]/10'}`} />
                  <div className={`w-3.5 h-1 rounded-full transition-colors ${currentStep === 'review' ? 'bg-[#0052FF]' : 'bg-[#0052FF]/10'}`} />
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
                      Step into the decentralized supersonic ecosystem. Verify ownership, link Spotify catalog & launch direct-payment streaming nodes.
                    </p>
                  </div>

                  {/* Feature perks display */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-start gap-3">
                      <div className="p-2 bg-[#0052FF]/10 text-[#0052FF] rounded-xl shrink-0 mt-0.5">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Direct TON Royalties</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          Say goodbye to middlemen. Your listeners stream directly to your Web3 contract, routing 100% of rewards instant on-chain.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-start gap-3">
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl shrink-0 mt-0.5">
                        <Music className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Digital Audio Collectibles</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          Mint audio artifacts, music NFTs, and special ticket passes directly on the TON blockchain for your super-fans.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-start gap-3">
                      <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl shrink-0 mt-0.5">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Verified Creator Node</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          Unlock deep-analytics dashboards, community announcements feeds, and official verification badges across the network.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Requirements checklist footer */}
                  <div className="bg-blue-950/20 border border-[#0052FF]/10 rounded-xl p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-[#0052FF] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[11px] font-bold text-[#0052FF] uppercase tracking-wider">Before you begin</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                        Prepare your registered Spotify Artist URL, contact email, and active wallet node. Verification takes approx 1 minute.
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
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

              {/* STEP 2: SPOTIFY VERIFICATION */}
              {currentStep === 'spotify' && (
                <div className="space-y-6">
                  <div className="space-y-1.5 text-center">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full mx-auto flex items-center justify-center mb-1">
                      <Music className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold uppercase tracking-tight">Spotify Profile Syncer</h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Search or insert your active Spotify Artist URL node to verify current audio presence and statistics.
                    </p>
                  </div>

                  {/* Search bar */}
                  <form onSubmit={handleSearchSpotify} className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Type artist name (e.g. DJ Krupy)..."
                      value={spotifySearch}
                      onChange={(e) => setSpotifySearch(e.target.value)}
                      className="w-full bg-slate-950/40 border border-white/5 rounded-xl pl-10 pr-24 py-3 text-xs font-semibold outline-none focus:border-[#0052FF] transition-all"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#0052FF] hover:bg-[#0040D9] text-[10px] font-bold uppercase tracking-wider rounded-lg text-white transition-all cursor-pointer"
                    >
                      Search
                    </button>
                  </form>

                  {/* Search Results */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
                      Spotify Directory Results
                    </span>

                    {isSearchingSpotify ? (
                      <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Retrieving Spotify Nodes...</span>
                      </div>
                    ) : filteredArtists.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {filteredArtists.map((artist, i) => {
                          const isSelected = selectedSpotifyArtist?.name === artist.name;
                          return (
                            <div
                              key={i}
                              onClick={() => handleSelectSpotify(artist)}
                              className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#0052FF]/10 border-[#0052FF]'
                                  : 'bg-white/5 border-white/5 hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <img src={artist.image} alt={artist.name} className="w-10 h-10 rounded-lg object-cover" />
                                <div>
                                  <h4 className="text-xs font-bold text-slate-200">{artist.name}</h4>
                                  <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-slate-400">
                                    <span>{artist.monthlyListeners} Listeners</span>
                                    <span>•</span>
                                    <span>{artist.followers} Followers</span>
                                  </div>
                                </div>
                              </div>

                              {isSelected ? (
                                <div className="p-1 bg-[#0052FF] text-white rounded-full">
                                  <Check className="w-3.5 h-3.5" />
                                </div>
                              ) : (
                                <button className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-[9px] font-bold uppercase tracking-wider rounded-lg">
                                  Select
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                        No matches found. Try spelling DJ Krupy.
                      </div>
                    )}
                  </div>

                  {/* Connected Summary */}
                  {selectedSpotifyArtist && (
                    <div className="p-4 bg-emerald-950/20 border border-emerald-500/10 rounded-xl flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Spotify Node Synced</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                          Decentralized link established with "{selectedSpotifyArtist.name}". Spotify statistics verified successfully.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions footer */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => setCurrentStep('welcome')}
                      className="py-3 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-xs font-bold uppercase tracking-widest rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button
                      disabled={!selectedSpotifyArtist}
                      onClick={() => setCurrentStep('identity')}
                      className="py-3 bg-[#0052FF] hover:bg-[#0040D9] active:scale-95 transition-all text-xs font-bold uppercase tracking-widest rounded-xl text-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: IDENTITY VERIFICATION */}
              {currentStep === 'identity' && (
                <div className="space-y-6">
                  <div className="space-y-1.5 text-center">
                    <div className="w-12 h-12 bg-[#0052FF]/10 text-[#0052FF] rounded-full mx-auto flex items-center justify-center mb-1">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold uppercase tracking-tight">Identity & Wallet Signature</h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Verify that you own the on-chain credentials and linked channels for verification safety.
                    </p>
                  </div>

                  {/* Form inputs */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Legal Artist / Team Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          required
                          placeholder="E.g. Arthur Krupy"
                          value={realName}
                          onChange={(e) => setRealName(e.target.value)}
                          className="w-full bg-slate-950/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-[#0052FF] transition-all"
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
                          placeholder="krusherkrupy@gmail.com"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full bg-slate-950/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-[#0052FF] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cryptographic signature block */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
                      Ecosystem Wallet Signature Verification
                    </span>

                    <div className="bg-slate-950/60 border border-white/5 rounded-xl p-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Wallet className="w-4 h-4 text-[#0052FF]" />
                          <span className="text-xs font-bold text-slate-200">UQAs9...7K_p</span>
                        </div>
                        <p className="text-[10px] text-slate-400 max-w-xs">
                          Prove on-chain ownership by signing a cryptographic token payload with your connected TON Wallet.
                        </p>
                      </div>

                      <button
                        onClick={handleSignWallet}
                        disabled={isWalletSigned || isSigningWallet}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-all shrink-0 ${
                          isWalletSigned
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-white/10 hover:bg-white/15 text-white'
                        }`}
                      >
                        {isSigningWallet ? (
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : isWalletSigned ? (
                          'Signed ✔'
                        ) : (
                          'Sign Payload'
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Security disclaimer info */}
                  <div className="flex gap-2.5 text-[10px] text-slate-500 leading-relaxed font-medium">
                    <Lock className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" />
                    <span>
                      Identity data is encrypted using client-side SHA-256 protocols and stored on private, authorized sovereign nodes. No cleartext documents are stored.
                    </span>
                  </div>

                  {/* Actions footer */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => setCurrentStep('spotify')}
                      className="py-3 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-xs font-bold uppercase tracking-widest rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button
                      disabled={!realName.trim() || !contactEmail.trim() || !isWalletSigned}
                      onClick={startReviewProcess}
                      className="py-3 bg-[#0052FF] hover:bg-[#0040D9] active:scale-95 transition-all text-xs font-bold uppercase tracking-widest rounded-xl text-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <span>Submit Application</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW PROCESS */}
              {currentStep === 'review' && (
                <div className="space-y-6 py-6 text-center">
                  <div className="relative w-20 h-20 mx-auto">
                    {/* Ring animated */}
                    <div className="absolute inset-0 border-4 border-white/5 border-t-[#0052FF] rounded-full animate-spin" />
                    <div className="absolute inset-2 border border-white/10 rounded-full flex items-center justify-center">
                      <RefreshCw className="w-7 h-7 text-[#0052FF] animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-bold uppercase tracking-tight">Ecosystem Verification Node</h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Decentralized oracles are processing validation schemas on-chain. Please do not close this transaction window.
                    </p>
                  </div>

                  {/* Progress bar info */}
                  <div className="space-y-1 max-w-sm mx-auto">
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      <span>Oracle Pipeline Status</span>
                      <span>{reviewProgress}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-[#0052FF] to-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${reviewProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Diagnostic logs */}
                  <div className="bg-slate-950/70 border border-white/5 rounded-xl p-4 text-left font-mono text-[9px] text-slate-400 space-y-1.5 max-h-36 overflow-y-auto no-scrollbar select-none">
                    {reviewLogs.map((log, i) => (
                      <div key={i} className="flex gap-1.5">
                        <span className="text-[#0052FF] shrink-0 font-bold">&gt;</span>
                        <span className="truncate">{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5: APPROVED */}
              {currentStep === 'approved' && (
                <div className="space-y-6 text-center py-4">
                  {/* Big Check animations */}
                  <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full mx-auto flex items-center justify-center relative">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 fill-current" />
                    <div className="absolute -inset-1 border-2 border-emerald-500/20 rounded-full animate-ping opacity-75" />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                      Oracle Verification Passed
                    </span>
                    <h3 className="text-xl font-black uppercase tracking-tight text-white leading-none">
                      TonJam Creator Unlocked!
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                      Congratulations Arthur! Your Spotify sync matches perfectly and cryptographic address verification holds legal signature validity.
                    </p>
                  </div>

                  {/* Unlocked badges / features */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2">
                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center space-y-1">
                      <Sparkles className="w-5 h-5 text-purple-400 mx-auto" />
                      <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wide block">Verification Badge</span>
                      <p className="text-[9px] text-slate-500 leading-normal">Official verified mark displays next to credentials</p>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center space-y-1">
                      <Wallet className="w-5 h-5 text-[#0052FF] mx-auto" />
                      <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wide block">Direct Royalties</span>
                      <p className="text-[9px] text-slate-500 leading-normal">Earn real-time TON streaming royalty rewards</p>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center space-y-1">
                      <Disc className="w-5 h-5 text-emerald-400 mx-auto" />
                      <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wide block">Web3 Releases</span>
                      <p className="text-[9px] text-slate-500 leading-normal">Mint collectible music NFT records effortlessly</p>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center space-y-1">
                      <TrendingUp className="w-5 h-5 text-[#0052FF] mx-auto" />
                      <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wide block">Creator Tools</span>
                      <p className="text-[9px] text-slate-500 leading-normal">Complete access to deep listening statistics</p>
                    </div>
                  </div>

                  {/* Finish action */}
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      onComplete();
                      onClose();
                    }}
                    className="w-full bg-[#0052FF] hover:bg-[#0040D9] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Enter Creator Space</span>
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
