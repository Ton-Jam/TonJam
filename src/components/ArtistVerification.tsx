import React, { useState } from 'react';
import { Artist } from '@/types';
import { CheckCircle2, Link2, Loader2, AlertCircle } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';

interface ArtistVerificationProps {
  artist: Artist;
}

const ArtistVerification: React.FC<ArtistVerificationProps> = ({ artist }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const { addNotification } = useAudio();

  const handleVerify = () => {
    setIsVerifying(true);
    // Simulate verification process
    setTimeout(() => {
      setIsVerifying(false);
      addNotification("Verification request submitted. Please link your social media or wallet.", "success");
    }, 2000);
  };

  return (
    <div className="p-2 bg-muted/20 border border-border rounded-2xl space-y-2">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-blue-600/10 rounded-xl text-blue-500">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Artist Verification</h2>
          <p className="text-sm text-muted-foreground">Verify your identity to gain the verified badge.</p>
        </div>
      </div>

      {artist.verified ? (
        <div className="flex items-center gap-2 text-emerald-500 font-bold">
          <CheckCircle2 className="h-5 w-5" />
          <span>Artist is already verified</span>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="p-2 bg-background border border-border rounded-xl space-y-2">
            <h3 className="font-bold text-foreground">Requirements:</h3>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-2">
              <li>Link your X (Twitter) account</li>
              <li>Connect your TON wallet</li>
              <li>Have at least 100 followers</li>
            </ul>
          </div>
          
          <button 
            onClick={handleVerify}
            disabled={isVerifying}
            className="flex items-center gap-2 px-2 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50"
          >
            {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
            {isVerifying ? "Submitting..." : "Start Verification"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ArtistVerification;
