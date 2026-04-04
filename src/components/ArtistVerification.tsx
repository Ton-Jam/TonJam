import React, { useState } from 'react';
import { Artist } from '@/types';
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';

interface ArtistVerificationProps {
  artist: Artist;
}

const ArtistVerification: React.FC<ArtistVerificationProps> = ({ artist }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const { addNotification, setArtists } = useAudio();

  const handleVerify = () => {
    setIsVerifying(true);
    // Simulate verification process
    setTimeout(() => {
      setIsVerifying(false);
      // Update artist verification status in local state
      setArtists(prev => prev.map(a => a.uid === artist.uid ? { ...a, verified: true } : a));
      addNotification("Identity verified successfully on the TON blockchain!", "success");
    }, 2000);
  };

  if (artist.verified) {
    return (
      <div className="flex items-center gap-1 text-blue-500" title="Verified Artist">
        <CheckCircle2 className="h-5 w-5 fill-blue-500/10" />
      </div>
    );
  }

  return (
    <button 
      onClick={handleVerify}
      disabled={isVerifying}
      className="flex items-center gap-2 px-3 py-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 border border-blue-500/20 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
    >
      {isVerifying ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Verifying...</span>
        </>
      ) : (
        <>
          <ShieldCheck className="h-3 w-3" />
          <span>Start Verification</span>
        </>
      )}
    </button>
  );
};

export default ArtistVerification;
