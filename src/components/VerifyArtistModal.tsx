import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, Globe, Twitter, Instagram, Music, FileText } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';

interface VerifyArtistModalProps {
  onClose: () => void;
  artistName: string;
}

const GENRES = ['Techno', 'House', 'Ambient', 'Phonk', 'Cyberpunk', 'Lo-Fi', 'Electronic', 'Pop', 'Hip-Hop', 'R&B'];

const VerifyArtistModal: React.FC<VerifyArtistModalProps> = ({ onClose, artistName }) => {
  const { addNotification, artists, setArtists } = useAudio();
  const [step, setStep] = useState(1);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [formData, setFormData] = useState({
    bio: '',
    genre: 'Electronic',
    twitter: '',
    instagram: '',
    website: '',
    spotify: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep(3);
      
      // Update artist verification status and metadata
      const updatedArtists = artists.map(artist => 
        artist.name === artistName ? { 
          ...artist, 
          verified: true,
          bio: formData.bio || artist.bio,
          genre: formData.genre,
          socials: {
            ...artist.socials,
            x: formData.twitter || artist.socials?.x,
            instagram: formData.instagram || artist.socials?.instagram,
            website: formData.website || artist.socials?.website,
            spotify: formData.spotify || artist.socials?.spotify
          }
        } : artist
      );
      setArtists(updatedArtists);
      
      addNotification("Identity protocol verified on TON.", "success");
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-lg bg-neutral-900 border border-border rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground uppercase tracking-tight">Verify Artist</h2>
              <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Identity Protocol</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full" aria-label="Close Verify Modal">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8 max-h-[80vh] overflow-y-auto no-scrollbar">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Artist Information</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                  Complete your profile to establish your sonic identity on the network.
                </p>
              </div>

              <div className="space-y-6">
                {/* Bio Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <FileText className="h-3 w-3" /> Origin Narrative (Bio)
                  </div>
                  <textarea 
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell your story..."
                    className="w-full bg-muted/50 border border-border rounded-2xl p-4 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all min-h-[100px] resize-none"
                    aria-label="Artist Bio"
                  />
                </div>

                {/* Genre Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <Music className="h-3 w-3" /> Sonic Genre
                  </div>
                  <select 
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    className="w-full bg-muted/50 border border-border rounded-2xl p-4 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all appearance-none"
                    aria-label="Sonic Genre"
                  >
                    {GENRES.map(g => (
                      <option key={g} value={g} className="bg-neutral-900">{g}</option>
                    ))}
                  </select>
                </div>

                {/* Social Links Section */}
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Social Protocols</div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-1 bg-muted/50 rounded-2xl border border-border/50 focus-within:border-blue-500/30 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-background/40 flex items-center justify-center text-muted-foreground">
                        <Twitter className="h-4 w-4" />
                      </div>
                      <input 
                        type="text" 
                        name="twitter"
                        value={formData.twitter}
                        onChange={handleInputChange}
                        placeholder="X (Twitter) URL"
                        className="flex-1 bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground/30 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md px-2"
                        aria-label="X (Twitter) URL"
                      />
                    </div>
                    <div className="flex items-center gap-3 p-1 bg-muted/50 rounded-2xl border border-border/50 focus-within:border-blue-500/30 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-background/40 flex items-center justify-center text-muted-foreground">
                        <Instagram className="h-4 w-4" />
                      </div>
                      <input 
                        type="text" 
                        name="instagram"
                        value={formData.instagram}
                        onChange={handleInputChange}
                        placeholder="Instagram URL"
                        className="flex-1 bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground/30 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md px-2"
                        aria-label="Instagram URL"
                      />
                    </div>
                    <div className="flex items-center gap-3 p-1 bg-muted/50 rounded-2xl border border-border/50 focus-within:border-blue-500/30 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-background/40 flex items-center justify-center text-muted-foreground">
                        <Globe className="h-4 w-4" />
                      </div>
                      <input 
                        type="text" 
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="Official Website URL"
                        className="flex-1 bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground/30 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md px-2"
                        aria-label="Official Website URL"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-foreground rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-blue-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Submit for Verification
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 text-center">
              <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className={`h-10 w-10 text-blue-500 ${isVerifying ? 'animate-pulse' : ''}`} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Final Confirmation</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                  A small transaction (0.1 TON) is required to verify your identity on-chain. This will grant you the blue checkmark and artist features.
                </p>
              </div>

              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-4 text-left">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <p className="text-[9px] text-muted-foreground leading-relaxed uppercase tracking-tight">
                  Verification is permanent and linked to your wallet address. Ensure you are using your primary artist wallet.
                </p>
              </div>

              <button 
                onClick={handleVerify}
                disabled={isVerifying}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-foreground rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-blue-600/20 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {isVerifying ? 'Verifying Identity...' : 'Confirm & Verify (0.1 TON)'}
              </button>
              <button 
                onClick={() => setStep(1)}
                disabled={isVerifying}
                className="w-full py-3 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Back to Edit
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 text-center py-4">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">Identity Verified</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                  Welcome to the network, {artistName}. Your architect status is now active.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={onClose}
                  className="w-full py-5 bg-foreground text-background rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Return to Profile
                </button>
                <a 
                  href="#" 
                  className="flex items-center justify-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm px-2 py-1"
                >
                  View Transaction <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyArtistModal;
