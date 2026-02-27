import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';

interface VerifyArtistModalProps {
  onClose: () => void;
  artistName: string;
}

const VerifyArtistModal: React.FC<VerifyArtistModalProps> = ({ onClose, artistName }) => {
  const { addNotification, artists, setArtists } = useAudio();
  const [step, setStep] = useState(1);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep(3);
      
      // Update artist verification status
      const updatedArtists = artists.map(artist => 
        artist.name === artistName ? { ...artist, verified: true } : artist
      );
      setArtists(updatedArtists);
      
      addNotification("Identity protocol verified on TON.", "success");
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">Verify Artist</h2>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Identity Protocol</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">Verification Requirements</h3>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                  To become a verified architect on TonJam, you must link your official social profiles and confirm your identity via a TON transaction.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Link Spotify Profile', done: true },
                  { label: 'Link X (Twitter) Account', done: true },
                  { label: 'TON Wallet Connection', done: true },
                ].map((req, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{req.label}</span>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-blue-600/20"
              >
                Continue to Verification
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 text-center">
              <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className={`h-10 w-10 text-blue-500 ${isVerifying ? 'animate-pulse' : ''}`} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">Final Confirmation</h3>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                  A small transaction (0.1 TON) is required to verify your identity on-chain. This will grant you the blue checkmark and artist features.
                </p>
              </div>

              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-4 text-left">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <p className="text-[9px] text-white/40 leading-relaxed uppercase tracking-tight">
                  Verification is permanent and linked to your wallet address. Ensure you are using your primary artist wallet.
                </p>
              </div>

              <button 
                onClick={handleVerify}
                disabled={isVerifying}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-blue-600/20 disabled:opacity-50"
              >
                {isVerifying ? 'Verifying Identity...' : 'Confirm & Verify (0.1 TON)'}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 text-center py-4">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Identity Verified</h3>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                  Welcome to the network, {artistName}. Your architect status is now active.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={onClose}
                  className="w-full py-5 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all active:scale-95"
                >
                  Return to Profile
                </button>
                <a 
                  href="#" 
                  className="flex items-center justify-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-white transition-colors"
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
