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
    <div className="fixed inset-0 z-[100] bg-white dark:bg-[#0B0F14] text-zinc-900 dark:text-zinc-100 overflow-y-auto animate-in fade-in duration-300">
      <div className="max-w-md mx-auto px-6 py-12 md:py-20 min-h-screen flex flex-col justify-between gap-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Artist Verification</h2>
              <p className="text-[10px] font-bold text-zinc-400 dark:text-white/40 uppercase tracking-[0.2em] mt-0.5">Identity Protocol</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 rounded-full bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col justify-center space-y-8">
          <div className="space-y-3">
            <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-100 uppercase tracking-wide">Link Accounts</h3>
            <p className="text-xs font-bold text-zinc-500 dark:text-white/50 uppercase tracking-widest leading-relaxed">
              Connect the four external identities below to verify your digital footprint and unlock advanced creator capabilities on TONJAM.
            </p>
          </div>

          <div className="space-y-3">
            {/* X (Twitter) Link */}
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-white/5 rounded-2xl transition-all">
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${linkedAccounts.x ? 'bg-blue-500/10 text-blue-500 dark:text-blue-400' : 'bg-zinc-200/50 dark:bg-white/5 text-zinc-400 dark:text-white/30'}`}>
                  <Twitter className="h-5 w-5 fill-current" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">X (Twitter)</h4>
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-white/30 uppercase tracking-widest">Social Footprint</p>
                </div>
              </div>
              {linkedAccounts.x ? (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Linked</span>
                </div>
              ) : (
                <button 
                  onClick={() => handleLinkAccount('x')}
                  disabled={isVerifying}
                  className="h-9 px-4 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  Connect
                </button>
              )}
            </div>

            {/* Spotify Link */}
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-white/5 rounded-2xl transition-all">
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${linkedAccounts.spotify ? 'bg-[#1DB954]/10 text-[#1DB954]' : 'bg-zinc-200/50 dark:bg-white/5 text-zinc-400 dark:text-white/30'}`}>
                  <Music className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">Spotify</h4>
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-white/30 uppercase tracking-widest">Discography Proof</p>
                </div>
              </div>
              {linkedAccounts.spotify ? (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Linked</span>
                </div>
              ) : (
                <button 
                  onClick={() => handleLinkAccount('spotify')}
                  disabled={isVerifying}
                  className="h-9 px-4 bg-[#1DB954] hover:bg-[#1ed760] active:scale-95 text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  Connect
                </button>
              )}
            </div>

            {/* Vercel Link */}
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-white/5 rounded-2xl transition-all">
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${linkedAccounts.vercel ? 'bg-zinc-900/10 text-zinc-900 dark:bg-white/10 dark:text-white' : 'bg-zinc-200/50 dark:bg-white/5 text-zinc-400 dark:text-white/30'}`}>
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">Vercel</h4>
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-white/30 uppercase tracking-widest">Web Deployments</p>
                </div>
              </div>
              {linkedAccounts.vercel ? (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Linked</span>
                </div>
              ) : (
                <button 
                  onClick={() => handleLinkAccount('vercel')}
                  disabled={isVerifying}
                  className="h-9 px-4 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-100 dark:hover:bg-zinc-100 active:scale-95 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  Connect
                </button>
              )}
            </div>

            {/* TON Wallet Link */}
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-white/5 rounded-2xl transition-all">
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${linkedAccounts.wallet ? 'bg-blue-500/10 text-blue-500' : 'bg-zinc-200/50 dark:bg-white/5 text-zinc-400 dark:text-white/30'}`}>
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">TON Wallet</h4>
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-white/30 uppercase tracking-widest">Web3 Identity</p>
                </div>
              </div>
              {linkedAccounts.wallet ? (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Linked</span>
                </div>
              ) : (
                <button 
                  onClick={() => handleLinkAccount('wallet')}
                  disabled={isVerifying}
                  className="h-9 px-4 bg-blue-600 hover:bg-blue-500 dark:bg-[linear-gradient(90deg,#007AFF_0%,#00C6FF_100%)] active:scale-95 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="space-y-4">
          <button 
            onClick={handleCompleteVerification}
            disabled={!canVerify || isVerifying}
            className={`w-full h-14 rounded-2xl text-xs font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 ${
              canVerify 
                ? 'bg-blue-600 hover:bg-blue-500 dark:bg-[linear-gradient(90deg,#007AFF_0%,#00C6FF_100%)] text-white shadow-lg shadow-blue-600/10' 
                : 'bg-zinc-100 dark:bg-white/5 text-zinc-400 dark:text-white/20 cursor-not-allowed'
            }`}
          >
            {isVerifying ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Processing Identity...</>
            ) : (
              <><ShieldCheck className="h-4 w-4" /> Finalize Verification Key</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserArtistVerificationModal;
