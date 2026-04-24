import React, { useState } from 'react';
import { X, ShieldCheck, Twitter, Music, Wallet, CheckCircle2, Loader2, Globe } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { db, handleFirestoreError, OperationType, cleanUpdateData } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useEffect } from 'react';

interface UserArtistVerificationModalProps {
  onClose: () => void;
}

const UserArtistVerificationModal: React.FC<UserArtistVerificationModalProps> = ({ onClose }) => {
  const { userProfile, setUserProfile, addNotification } = useAudio();
  const [step, setStep] = useState(1);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [linkedAccounts, setLinkedAccounts] = useState({
    x: !!userProfile.socials?.x,
    spotify: !!userProfile.socials?.spotify,
    vercel: !!(userProfile as any).socials?.vercel,
    wallet: !!userProfile.walletAddress
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin
      if (!event.origin.endsWith('.run.app') && !event.origin.includes('localhost')) return;

      if (event.data?.type === 'SPOTIFY_VERIFIED') {
        const profile = event.data.data;
        updateRemoteSocial('spotify', profile.external_urls?.spotify || 'verified');
        setLinkedAccounts(prev => ({ ...prev, spotify: true }));
        addNotification("Spotify linked successfully", "success");
      }

      if (event.data?.type === 'VERCEL_SSO_SUCCESS') {
        const data = event.data.data;
        updateRemoteSocial('vercel', data.user?.username || 'verified');
        setLinkedAccounts(prev => ({ ...prev, vercel: true }));
        addNotification("Vercel linked successfully", "success");
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [userProfile]);

  const updateRemoteSocial = async (platform: string, value: string) => {
    try {
      const userRef = doc(db, 'users', userProfile.uid);
      const socials = { ...(userProfile.socials || {}), [platform]: value };
      await updateDoc(userRef, cleanUpdateData({ socials }));
      setUserProfile({ ...userProfile, socials });
    } catch (error) {
      console.error(`Error updating ${platform}:`, error);
    }
  };

  const handleLinkAccount = async (platform: 'x' | 'spotify' | 'wallet' | 'vercel') => {
    if (platform === 'x' || platform === 'wallet') {
      setIsVerifying(true);
      // Simulate OAuth / Wallet connection delay for these for now
      setTimeout(() => {
        setIsVerifying(false);
        setLinkedAccounts(prev => ({ ...prev, [platform]: true }));
        
        // Update user profile with mock data
        const updates: any = {};
        if (platform === 'x') {
          updates.socials = { ...userProfile.socials, x: `https://x.com/${userProfile.username}` };
        } else if (platform === 'wallet') {
          updates.walletAddress = 'EQD...mock...wallet';
        }
        
        setUserProfile({ ...userProfile, ...updates });
        addNotification(`${platform.toUpperCase()} linked successfully`, 'success');
      }, 1500);
      return;
    }

    try {
      setIsVerifying(true);
      const response = await fetch(`/api/auth/${platform}/url`);
      if (!response.ok) throw new Error(`Failed to get ${platform} auth URL`);
      const { url } = await response.json();
      
      const width = 600;
      const height = 700;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
      
      window.open(url, `${platform}_oauth`, `width=${width},height=${height},left=${left},top=${top}`);
    } catch (error) {
      console.error(`OAuth error for ${platform}:`, error);
      addNotification(`Failed to connect ${platform}`, 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCompleteVerification = async () => {
    setIsVerifying(true);
    try {
      const userRef = doc(db, 'users', userProfile.uid);
      await updateDoc(userRef, { 
        isVerifiedArtist: true,
        role: 'artist'
      });
      setUserProfile({ ...userProfile, isVerifiedArtist: true, role: 'artist' });
      addNotification("Artist identity verified successfully!", "success");
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userProfile.uid}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const canVerify = linkedAccounts.x && linkedAccounts.spotify && linkedAccounts.wallet && linkedAccounts.vercel;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-background rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground uppercase tracking-tight">Artist Verification</h2>
              <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Identity Protocol</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-2 space-y-2">
          <div className="space-y-2 text-center">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
              Link your accounts to verify your identity and unlock artist features.
            </p>
          </div>

          <div className="space-y-2">
            {/* X (Twitter) Link */}
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-2xl">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${linkedAccounts.x ? 'bg-blue-500/20 text-blue-400' : 'bg-muted text-muted-foreground'}`}>
                  <Twitter className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-widest">X (Twitter)</h4>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Social Identity</p>
                </div>
              </div>
              {linkedAccounts.x ? (
                <div className="flex items-center gap-2 text-emerald-500">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Linked</span>
                </div>
              ) : (
                <button 
                  onClick={() => handleLinkAccount('x')}
                  disabled={isVerifying}
                  className="px-2 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  Connect
                </button>
              )}
            </div>

            {/* Spotify Link */}
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-2xl">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${linkedAccounts.spotify ? 'bg-[#1DB954]/20 text-[#1DB954]' : 'bg-muted text-muted-foreground'}`}>
                  <Music className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-widest">Spotify</h4>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Artist Profile</p>
                </div>
              </div>
              {linkedAccounts.spotify ? (
                <div className="flex items-center gap-2 text-emerald-500">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Linked</span>
                </div>
              ) : (
                <button 
                  onClick={() => handleLinkAccount('spotify')}
                  disabled={isVerifying}
                  className="px-2 py-2 bg-[#1DB954] hover:bg-[#1ed760] text-black rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  Connect
                </button>
              )}
            </div>

            {/* Vercel Link */}
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-2xl">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${linkedAccounts.vercel ? 'bg-foreground/20 text-foreground' : 'bg-muted text-muted-foreground'}`}>
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-widest">Vercel</h4>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Developer Artifacts</p>
                </div>
              </div>
              {linkedAccounts.vercel ? (
                <div className="flex items-center gap-2 text-emerald-500">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Linked</span>
                </div>
              ) : (
                <button 
                  onClick={() => handleLinkAccount('vercel')}
                  disabled={isVerifying}
                  className="px-4 py-2 bg-foreground text-background rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 min-w-[80px]"
                >
                  Connect
                </button>
              )}
            </div>

            {/* TON Wallet Link */}
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-2xl">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${linkedAccounts.wallet ? 'bg-blue-500/20 text-blue-400' : 'bg-muted text-muted-foreground'}`}>
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-widest">TON Wallet</h4>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Web3 Identity</p>
                </div>
              </div>
              {linkedAccounts.wallet ? (
                <div className="flex items-center gap-2 text-emerald-500">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Linked</span>
                </div>
              ) : (
                <button 
                  onClick={() => handleLinkAccount('wallet')}
                  disabled={isVerifying}
                  className="px-2 py-2 bg-[linear-gradient(90deg,#007AFF_0%,#00C6FF_100%)] hover:opacity-90 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  Connect
                </button>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button 
              onClick={handleCompleteVerification}
              disabled={!canVerify || isVerifying}
              className={`w-full py-[7px] rounded-full text-xs font-bold uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 ${
                canVerify 
                  ? 'bg-[linear-gradient(90deg,#007AFF_0%,#00C6FF_100%)] hover:opacity-90 text-white shadow-lg shadow-blue-600/20' 
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {isVerifying ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
              ) : (
                <><ShieldCheck className="h-4 w-4" /> Complete Verification</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserArtistVerificationModal;
