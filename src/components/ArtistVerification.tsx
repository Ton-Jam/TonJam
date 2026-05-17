import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Artist } from '@/types';
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface ArtistVerificationProps {
  artist: Artist;
}

const ArtistVerification: React.FC<ArtistVerificationProps> = ({ artist }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const { addNotification, setArtists } = useAudio();
  const { user } = useAuth();
  const navigate = useNavigate();

  const status = artist.verificationStatus || (artist.verified ? 'verified' : 'unverified');
  const isOwnProfile = user?.uid === artist.uid;

  const handleVerify = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOwnProfile) {
      navigate('/settings?tab=verification&modal=verify');
    }
  };

  if (status === 'verified') {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full font-black text-[10px] uppercase tracking-widest" title="Verified Artist">
        <CheckCircle2 className="h-3 w-3 fill-current" />
        <span>Verified</span>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full font-black text-[10px] uppercase tracking-widest animate-pulse">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Pending Review</span>
      </div>
    );
  }

  return (
    <button 
      onClick={handleVerify}
      disabled={isVerifying}
      className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20 active:scale-95"
    >
      {isVerifying ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <ShieldCheck className="h-3 w-3" />
          <span>Apply for Verification</span>
        </>
      )}
    </button>
  );
};

export default ArtistVerification;
