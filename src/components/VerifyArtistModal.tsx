import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, Globe, Twitter, Instagram, Music, FileText, Loader2 } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, setDoc, updateDoc, serverTimestamp, collection } from 'firebase/firestore';

interface VerifyArtistModalProps {
  onClose: () => void;
  artistName: string;
}

const GENRES = ['Techno', 'House', 'Ambient', 'Phonk', 'Cyberpunk', 'Lo-Fi', 'Electronic', 'Pop', 'Hip-Hop', 'R&B'];

const VerifyArtistModal: React.FC<VerifyArtistModalProps> = ({ onClose, artistName }) => {
  const { addNotification } = useAudio();
  const [step, setStep] = useState(1);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [formData, setFormData] = useState({
    bio: '',
    genre: 'Electronic',
    email: auth.currentUser?.email || '',
    twitter: '',
    instagram: '',
    website: '',
    spotify: '',
    soundcloud: '',
    portfolioUrls: ['']
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePortfolioUrlChange = (index: number, value: string) => {
    const newUrls = [...formData.portfolioUrls];
    newUrls[index] = value;
    setFormData(prev => ({ ...prev, portfolioUrls: newUrls }));
  };

  const addPortfolioUrl = () => {
    setFormData(prev => ({ ...prev, portfolioUrls: [...prev.portfolioUrls, ''] }));
  };

  const removePortfolioUrl = (index: number) => {
    if (formData.portfolioUrls.length <= 1) return;
    const newUrls = formData.portfolioUrls.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, portfolioUrls: newUrls }));
  };

  const handleVerify = async () => {
    if (!auth.currentUser) {
      addNotification("Identity protocol error: Not authenticated", "error");
      return;
    }

    if (!formData.email.trim()) {
      addNotification("Email is required for verification updates", "error");
      return;
    }

    setIsVerifying(true);
    try {
      const userId = auth.currentUser.uid;
      const requestId = `verify_${userId}_${Date.now()}`;
      
      const requestData = {
        id: requestId,
        userId,
        artistName,
        email: formData.email,
        bio: formData.bio,
        genre: formData.genre,
        socialLinks: {
          x: formData.twitter,
          instagram: formData.instagram,
          spotify: formData.spotify,
          website: formData.website,
          soundcloud: formData.soundcloud
        },
        portfolioUrls: formData.portfolioUrls.filter(url => url.trim() !== ''),
        status: 'pending',
        reviewerNotes: '',
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      // 1. Create a verification request in Firestore
      await setDoc(doc(db, "verificationRequests", requestId), requestData);

      // 2. Update user status to 'pending'
      await updateDoc(doc(db, "users", userId), {
        verificationStatus: 'pending'
      });
      
      setIsVerifying(false);
      setStep(3);
      addNotification("Verification request submitted. Status: PENDING", "success");
    } catch (error) {
      setIsVerifying(false);
      handleFirestoreError(error, OperationType.CREATE, "verificationRequests");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-xl bg-black border border-white/5 rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-500 border border-blue-500/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Artist Verification</h2>
              <p className="text-[10px] font-bold text-blue-500/50 uppercase tracking-[0.3em]">Identity Protocol v4.0</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Step Info */}
              <div className="flex items-center gap-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-black italic">1</div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-tight">Sonic Credentials</h4>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest opacity-60">Provide detailed information for proof of artistry</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Email */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Communication Relay (Email)</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="artist@proton.me"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-foreground outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>

                {/* Genre Select */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Identity Genre</label>
                  <select 
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-foreground outline-none focus:border-blue-500/50 transition-all appearance-none"
                  >
                    {GENRES.map(g => (
                      <option key={g} value={g} className="bg-neutral-900 border-none">{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bio Section */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">The Narrative (Bio)</label>
                <textarea 
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Describe your musical journey and vision..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-foreground outline-none focus:border-blue-500/50 transition-all min-h-[120px] resize-none"
                />
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Neural Social Links</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors">
                      <Twitter className="h-4 w-4" />
                    </div>
                    <input 
                      type="text" 
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      placeholder="X (Twitter) URL"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-xs text-foreground outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors">
                      <Instagram className="h-4 w-4" />
                    </div>
                    <input 
                      type="text" 
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      placeholder="Instagram URL"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-xs text-foreground outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors">
                      <Music className="h-4 w-4" />
                    </div>
                    <input 
                      type="text" 
                      name="spotify"
                      value={formData.spotify}
                      onChange={handleInputChange}
                      placeholder="Spotify URL"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-xs text-foreground outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors">
                      <Globe className="h-4 w-4" />
                    </div>
                    <input 
                      type="text" 
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="Portfolio / Website URL"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-xs text-foreground outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Portfolio Evidence */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Portfolio Evidence (URLs)</label>
                  <button 
                    onClick={addPortfolioUrl}
                    className="text-[10px] font-black text-white hover:text-blue-500 uppercase tracking-widest transition-colors flex items-center gap-2"
                  >
                    Add Evidence +
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.portfolioUrls.map((url, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="relative flex-1 group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors">
                          <ExternalLink className="h-4 w-4" />
                        </div>
                        <input 
                          type="text" 
                          value={url}
                          onChange={(e) => handlePortfolioUrlChange(index, e.target.value)}
                          placeholder="Evidence URL (Soundcloud, Behance, YouTube, etc.)"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-xs text-foreground outline-none focus:border-blue-500/50 transition-all"
                        />
                      </div>
                      {formData.portfolioUrls.length > 1 && (
                        <button 
                          onClick={() => removePortfolioUrl(index)}
                          className="w-12 h-12 rounded-2xl bg-red-500/5 hover:bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/10 transition-all"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => setStep(2)}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all active:scale-95 shadow-2xl shadow-blue-600/30 group"
                >
                  Proceed to Terminal Confirmation
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="py-12 space-y-12 animate-in slide-in-from-right-4 duration-500 text-center max-w-md mx-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600/20 blur-[60px] rounded-full animate-pulse"></div>
                <div className="relative w-24 h-24 bg-blue-600/10 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <ShieldCheck className={`h-12 w-12 text-blue-500 ${isVerifying ? 'animate-bounce' : 'animate-pulse'}`} />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Identity Lock-in</h3>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest leading-relaxed opacity-60">
                  Your request will be processed by the neural architects. A small metadata synchronization fee is required to finalize the transmission on-chain.
                </p>
              </div>

              <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl flex gap-4 text-left">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <p className="text-[10px] font-bold text-amber-500/80 leading-relaxed uppercase tracking-widest">
                  Identity submission is immutable once transmitted. Verification grants permanent architect status and blue-core badge.
                </p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="w-full py-5 bg-[linear-gradient(90deg,#007AFF_0%,#00C6FF_100%)] hover:opacity-90 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all active:scale-95 shadow-2xl shadow-blue-600/30 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Syncing Identity...
                    </>
                  ) : (
                    'Finalize Verification (0.1 TON)'
                  )}
                </button>
                <button 
                  onClick={() => setStep(1)}
                  disabled={isVerifying}
                  className="w-full py-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] hover:text-white transition-colors"
                >
                  Return to parameters
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-20 space-y-12 animate-in zoom-in-95 duration-500 text-center">
              <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Protocol Registered</h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed opacity-60 max-w-sm mx-auto">
                  Neural relay established. Your identity "{artistName}" is now being processed by the validation matrix.
                </p>
              </div>

              <div className="pt-8">
                <button 
                  onClick={onClose}
                  className="w-full max-w-xs py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all active:scale-95 shadow-2xl"
                >
                  Close Terminal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyArtistModal;
