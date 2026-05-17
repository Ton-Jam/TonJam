import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Globe, 
  Twitter, 
  Instagram, 
  Music, 
  FileText, 
  Loader2,
  Plus,
  X,
  Brain
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';

const GENRES = ['Techno', 'House', 'Ambient', 'Phonk', 'Cyberpunk', 'Lo-Fi', 'Electronic', 'Pop', 'Hip-Hop', 'R&B'];

interface VerificationFormProps {
  onSuccess?: () => void;
}

const VerificationForm: React.FC<VerificationFormProps> = ({ onSuccess }) => {
  const { addNotification, userProfile } = useAudio();
  const [isVerifying, setIsVerifying] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    bio: userProfile?.bio || '',
    statement: '',
    genre: 'Electronic',
    email: auth.currentUser?.email || '',
    twitter: userProfile?.socials?.x || '',
    instagram: userProfile?.socials?.instagram || '',
    website: userProfile?.website || '',
    spotify: userProfile?.socials?.spotify || '',
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
        artistName: userProfile?.name || 'Unknown Artist',
        email: formData.email,
        bio: formData.bio,
        statement: formData.statement,
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
      setStep(2);
      addNotification("Verification request submitted. Status: PENDING", "success");
      if (onSuccess) onSuccess();
    } catch (error) {
      setIsVerifying(false);
      handleFirestoreError(error, OperationType.CREATE, "verificationRequests");
    }
  };

  if (step === 2) {
    return (
      <div className="py-20 space-y-12 animate-in zoom-in-95 duration-500 text-center">
        <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        </div>
        
        <div className="space-y-4">
          <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Protocol Registered</h3>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed opacity-60 max-w-sm mx-auto">
            Neural relay established. Your identity is now being processed by the validation matrix.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Email */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Communication Relay (Email)</label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="artist@proton.me"
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-foreground outline-none focus:border-blue-500/50 transition-all font-medium"
          />
        </div>

        {/* Genre Select */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Primary Musical Identity</label>
          <select 
            name="genre"
            value={formData.genre}
            onChange={handleInputChange}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-foreground outline-none focus:border-blue-500/50 transition-all appearance-none font-medium"
          >
            {GENRES.map(g => (
              <option key={g} value={g} className="bg-neutral-900 border-none">{g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Artist Statement Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
            <Brain className="h-3 w-3 text-blue-500" />
            <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Artist Statement (Why verification?)</label>
        </div>
        <textarea 
          name="statement"
          value={formData.statement}
          onChange={handleInputChange}
          placeholder="Briefly describe your vision as an artist and why you seek verification..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-foreground outline-none focus:border-blue-500/50 transition-all min-h-[100px] resize-none font-medium"
        />
        <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">This helps our curators understand your artistic direction.</p>
      </div>

      {/* Bio Section */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Public Narrative (Bio)</label>
        <textarea 
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          placeholder="Detailed bio for your verified profile..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-foreground outline-none focus:border-blue-500/50 transition-all min-h-[120px] resize-none font-medium"
        />
      </div>

      {/* Social Links */}
      <div className="space-y-6">
        <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">External Neural Nodes (Socials)</label>
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Portfolio Evidence (High-Fidelity Links)</label>
          <button 
            type="button"
            onClick={addPortfolioUrl}
            className="text-[10px] font-black text-white hover:text-blue-500 uppercase tracking-widest transition-colors flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5"
          >
            <Plus className="h-3 w-3" /> Add Link
          </button>
        </div>
        <div className="space-y-4">
          {formData.portfolioUrls.map((url, index) => (
            <div key={index} className="flex gap-4">
              <div className="relative flex-1 group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors">
                  <FileText className="h-4 w-4" />
                </div>
                <input 
                  type="text" 
                  value={url}
                  onChange={(e) => handlePortfolioUrlChange(index, e.target.value)}
                  placeholder="Evidence URL (Soundcloud, Behance, YouTube, etc.)"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-xs text-foreground outline-none focus:border-blue-500/50 transition-all font-medium"
                />
              </div>
              {formData.portfolioUrls.length > 1 && (
                <button 
                  type="button"
                  onClick={() => removePortfolioUrl(index)}
                  className="w-12 h-14 rounded-2xl bg-red-500/5 hover:bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/10 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl space-y-4">
        <div className="flex gap-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 shrink-0">
                <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
                <h4 className="text-xs font-black text-white uppercase tracking-tight">Identity Lock-in Agreement</h4>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-relaxed mt-1">
                    By submitting, you confirm you are the rightful owner of the linked assets. Fraudulent claims will result in permanent identity blacklisting.
                </p>
            </div>
        </div>
      </div>

      <div className="pt-6">
        <button 
          type="button"
          onClick={handleVerify}
          disabled={isVerifying}
          className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all active:scale-95 shadow-2xl shadow-blue-600/30 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isVerifying ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Syncing Identity Matrix...
            </>
          ) : (
            'Finalize Verification Protocol'
          )}
        </button>
      </div>
    </div>
  );
};

export default VerificationForm;
