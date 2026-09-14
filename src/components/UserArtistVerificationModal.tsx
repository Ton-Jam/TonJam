import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Twitter, 
  Instagram, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  Clock, 
  XCircle, 
  ExternalLink,
  Sparkles,
  Send,
  RefreshCw
} from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { db, handleFirestoreError, OperationType, cleanUpdateData } from '@/lib/firebase';
import { doc, updateDoc, collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { toast } from 'sonner';
import { ArtistVerificationRequest } from '@/types';

interface UserArtistVerificationModalProps {
  onClose: () => void;
}

export const normalizeSocialUrl = (input: string, platform: 'twitter' | 'instagram'): string => {
  let clean = input.trim();
  if (!clean) return '';
  if (clean === 'verified' || clean === 'connected' || clean === 'mock') return '';

  clean = clean.replace(/\/+$/, '');

  if (platform === 'twitter') {
    if (clean.startsWith('@')) {
      clean = clean.substring(1);
    }
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      return clean.replace(/^http:\/\/twitter\.com\//, 'https://x.com/').replace(/^https:\/\/twitter\.com\//, 'https://x.com/');
    }
    return `https://x.com/${clean}`;
  }

  if (platform === 'instagram') {
    if (clean.startsWith('@')) {
      clean = clean.substring(1);
    }
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      return clean.replace(/^http:\/\//, 'https://');
    }
    return `https://instagram.com/${clean}`;
  }

  return clean;
};

const UserArtistVerificationModal: React.FC<UserArtistVerificationModalProps> = ({ onClose }) => {
  const { userProfile, setUserProfile, addNotification } = useAudio();

  // Requests state
  const [requests, setRequests] = useState<ArtistVerificationRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectingProvider, setConnectingProvider] = useState<'twitter' | 'instagram' | null>(null);

  // Form inputs
  const [artistName, setArtistName] = useState(userProfile.name || userProfile.username || '');
  const [genre, setGenre] = useState(userProfile.genre || 'Electronic');
  const [bio, setBio] = useState(userProfile.bio || '');
  
  // Connection states
  const [isTwitterConnected, setIsTwitterConnected] = useState<boolean>(
    Boolean(userProfile.socials?.x || userProfile.socials?.twitter)
  );
  const [isInstagramConnected, setIsInstagramConnected] = useState<boolean>(
    Boolean(userProfile.socials?.instagram)
  );

  // URL inputs
  const [twitterUrl, setTwitterUrl] = useState(
    userProfile.socials?.x || userProfile.socials?.twitter || (userProfile.username ? `@${userProfile.username}` : '')
  );
  const [instagramUrl, setInstagramUrl] = useState(
    userProfile.socials?.instagram || (userProfile.username ? `@${userProfile.username}` : '')
  );

  const [formErrors, setFormErrors] = useState<{
    artistName?: string;
    twitter?: string;
    instagram?: string;
    general?: string;
  }>({});

  // Sync profile data on mount or change
  useEffect(() => {
    if (userProfile) {
      if (!artistName) setArtistName(userProfile.name || userProfile.username || '');
      if (!bio) setBio(userProfile.bio || '');
      if (userProfile.socials?.x || userProfile.socials?.twitter) {
        setIsTwitterConnected(true);
      }
      if (userProfile.socials?.instagram) {
        setIsInstagramConnected(true);
      }
    }
  }, [userProfile]);

  // Listen for verification requests in Firestore
  useEffect(() => {
    if (!userProfile?.uid) {
      setLoadingRequests(false);
      return;
    }

    const q = query(
      collection(db, 'verificationRequests'),
      where('userId', '==', userProfile.uid),
      orderBy('submittedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: ArtistVerificationRequest[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        } as ArtistVerificationRequest));
        setRequests(fetched);
        setLoadingRequests(false);
      },
      (error) => {
        console.warn('Error fetching verification requests:', error);
        setLoadingRequests(false);
      }
    );

    return () => unsubscribe();
  }, [userProfile?.uid]);

  // Listen for OAuth messages from popup window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin
      const isAllowedOrigin = 
        event.origin === window.location.origin || 
        event.origin.endsWith('.run.app') || 
        event.origin.includes('localhost');

      if (!isAllowedOrigin) return;

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const provider = String(event.data?.provider || '').toLowerCase();
        
        if (provider === 'twitter' || provider === 'x') {
          setIsTwitterConnected(true);
          if (!twitterUrl.trim()) {
            setTwitterUrl(userProfile.username ? `@${userProfile.username}` : 'https://x.com/');
          }
          addNotification('Twitter / X account connected successfully', 'success');
          toast.success('Twitter / X account connected!');
        } else if (provider === 'instagram') {
          setIsInstagramConnected(true);
          if (!instagramUrl.trim()) {
            setInstagramUrl(userProfile.username ? `@${userProfile.username}` : 'https://instagram.com/');
          }
          addNotification('Instagram account connected successfully', 'success');
          toast.success('Instagram account connected!');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [userProfile, twitterUrl, instagramUrl, addNotification]);

  // OAuth connect trigger
  const handleConnect = async (provider: 'twitter' | 'instagram') => {
    try {
      setConnectingProvider(provider);
      const res = await fetch(`/api/auth/${provider}/url`);
      if (!res.ok) {
        throw new Error(`Failed to initialize ${provider} authorization flow`);
      }
      const data = await res.json();
      if (!data.url) {
        throw new Error('No authorization URL returned');
      }

      const width = 600;
      const height = 700;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;

      window.open(
        data.url,
        `${provider}_oauth_window`,
        `width=${width},height=${height},left=${left},top=${top},status=0,toolbar=0,menubar=0`
      );
    } catch (error: any) {
      console.error(`OAuth trigger error for ${provider}:`, error);
      toast.error(`Unable to open ${provider} login: ${error.message || 'Error'}`);
    } finally {
      setConnectingProvider(null);
    }
  };

  // Determine verification status
  const isVerified = Boolean(
    userProfile.isVerified || 
    userProfile.isVerifiedArtist || 
    userProfile.verified || 
    userProfile.role === 'artist'
  );

  const activePendingRequest = requests.find((r) => r.status === 'pending');
  const activeRevisionRequest = requests.find((r) => r.status === 'needs_revision');
  const latestRequest = requests[0];

  const currentStatus: 'verified' | 'pending' | 'needs_revision' | 'rejected' | 'unverified' = isVerified
    ? 'verified'
    : activePendingRequest
      ? 'pending'
      : activeRevisionRequest || latestRequest?.status === 'needs_revision' || (userProfile.verificationStatus as any) === 'needs_revision'
        ? 'needs_revision'
        : latestRequest?.status === 'rejected' || (userProfile.verificationStatus as any) === 'rejected'
          ? 'rejected'
          : (userProfile.verificationStatus as any) || 'unverified';

  // Validation
  const hasTwitterUrl = Boolean(twitterUrl.trim() && normalizeSocialUrl(twitterUrl, 'twitter'));
  const hasInstagramUrl = Boolean(instagramUrl.trim() && normalizeSocialUrl(instagramUrl, 'instagram'));
  const canSubmit = isTwitterConnected && isInstagramConnected && hasTwitterUrl && hasInstagramUrl && Boolean(artistName.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    const cleanTwitter = normalizeSocialUrl(twitterUrl, 'twitter');
    const cleanInstagram = normalizeSocialUrl(instagramUrl, 'instagram');

    if (!cleanTwitter) {
      setFormErrors((prev) => ({ ...prev, twitter: 'Please enter a valid Twitter/X profile URL or handle' }));
      return;
    }
    if (!cleanInstagram) {
      setFormErrors((prev) => ({ ...prev, instagram: 'Please enter a valid Instagram profile URL or handle' }));
      return;
    }

    setIsSubmitting(true);
    try {
      const currentUid = userProfile.uid;
      const nowIso = new Date().toISOString();

      const socialLinksList = [
        { platform: 'twitter', url: cleanTwitter },
        { platform: 'instagram', url: cleanInstagram }
      ];

      const socialsMap = {
        twitter: cleanTwitter,
        x: cleanTwitter,
        instagram: cleanInstagram
      };

      // 1. Create document in verificationRequests
      await addDoc(collection(db, 'verificationRequests'), cleanUpdateData({
        userId: currentUid,
        artistName: artistName.trim(),
        email: userProfile.email || '',
        bio: bio.trim(),
        genre: genre.trim(),
        socialLinks: socialLinksList,
        socialsMap: socialsMap,
        portfolioUrl: cleanTwitter,
        status: 'pending',
        submittedAt: nowIso,
        createdAt: nowIso,
        updatedAt: nowIso
      }));

      // 2. Update user profile to pending (no self-approval)
      const userRef = doc(db, 'users', currentUid);
      const updatedSocials = {
        ...(userProfile.socials || {}),
        x: cleanTwitter,
        twitter: cleanTwitter,
        instagram: cleanInstagram
      };

      await updateDoc(userRef, cleanUpdateData({
        verificationStatus: 'pending',
        bio: bio.trim() || userProfile.bio || '',
        genre: genre.trim() || 'Electronic',
        socials: updatedSocials
      }));

      setUserProfile({
        ...userProfile,
        verificationStatus: 'pending',
        bio: bio.trim() || userProfile.bio || '',
        genre: genre.trim() || 'Electronic',
        socials: updatedSocials
      });

      addNotification('Artist verification submitted for moderator review!', 'success');
      toast.success('Verification request submitted for moderator review!');
    } catch (error: any) {
      console.error('Error submitting verification:', error);
      handleFirestoreError(error, OperationType.CREATE, 'verificationRequests');
      toast.error('Failed to submit verification request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      id="user-artist-verification-modal-backdrop" 
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="artist-verification-modal-title"
    >
      <div 
        id="user-artist-verification-modal-container"
        className="w-full max-w-lg bg-[#0B0F14] text-zinc-100 rounded-3xl p-6 md:p-8 shadow-2xl relative my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h2 id="artist-verification-modal-title" className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                Artist Verification
              </h2>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                Official Identity & Social Authentication
              </p>
            </div>
          </div>
          <button 
            type="button"
            id="close-artist-verification-modal-btn"
            onClick={onClose} 
            className="p-2.5 rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none"
            aria-label="Close verification modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* State: Verified */}
        {currentStatus === 'verified' && (
          <div className="space-y-6 py-4">
            <div className="p-6 rounded-2xl bg-cyan-500/10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                Artist Profile Verified
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed max-w-sm mx-auto">
                Your artist credentials have been reviewed and approved by TonJam moderators. You have full creator rights and badge authentication.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Connected Social Profiles
              </div>
              <div className="flex flex-wrap gap-2">
                {(userProfile.socials?.x || userProfile.socials?.twitter) && (
                  <a 
                    href={normalizeSocialUrl(userProfile.socials.x || userProfile.socials.twitter || '', 'twitter')}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 text-blue-400 text-xs font-bold hover:bg-white/10 transition-colors"
                  >
                    <Twitter className="w-3.5 h-3.5" /> Twitter (X) <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {userProfile.socials?.instagram && (
                  <a 
                    href={normalizeSocialUrl(userProfile.socials.instagram, 'instagram')}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 text-pink-400 text-xs font-bold hover:bg-white/10 transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5" /> Instagram <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-widest transition-all"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* State: Pending */}
        {currentStatus === 'pending' && (
          <div className="space-y-6 py-4">
            <div className="p-6 rounded-2xl bg-amber-500/10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                <Clock className="w-7 h-7 animate-pulse" />
              </div>
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                Application Under Review
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed max-w-sm mx-auto">
                Your artist verification request is currently in queue. TonJam moderators will review your official Twitter/X and Instagram profiles.
              </p>
            </div>

            {activePendingRequest && (
              <div className="p-4 rounded-xl bg-white/5 space-y-2 text-xs">
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Artist Name:</span>
                  <span className="font-bold text-white">{activePendingRequest.artistName}</span>
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Submitted:</span>
                  <span className="font-mono text-zinc-300">
                    {activePendingRequest.submittedAt ? new Date(activePendingRequest.submittedAt).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Review Status:</span>
                  <span className="font-bold text-amber-400 uppercase">Pending Moderator Review</span>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-widest transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* State: Needs Revision / Rejected Notice (Allows resubmission) */}
        {(currentStatus === 'needs_revision' || currentStatus === 'rejected') && (
          <div className="mb-6 p-4 rounded-2xl bg-orange-500/10 space-y-2">
            <div className="flex items-center gap-2 text-orange-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-xs font-black uppercase tracking-wide">
                {currentStatus === 'needs_revision' ? 'Revision Requested by Moderator' : 'Previous Request Declined'}
              </span>
            </div>
            {latestRequest?.reviewerNotes && (
              <p className="text-xs text-zinc-300 italic pl-6">
                "{latestRequest.reviewerNotes}"
              </p>
            )}
            <p className="text-[11px] text-zinc-400 pl-6">
              Please review and update your Twitter/X and Instagram handles below, then resubmit for review.
            </p>
          </div>
        )}

        {/* State: Form (Unverified / Needs Revision / Rejected) */}
        {(currentStatus === 'unverified' || currentStatus === 'needs_revision' || currentStatus === 'rejected') && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect both your official Twitter/X and Instagram accounts and provide their profile handles to request verification review from TonJam moderators.
              </p>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label 
                  htmlFor="verification-artist-name-input"
                  className="block text-[10px] font-mono uppercase font-bold text-zinc-400 tracking-wider"
                >
                  Artist / Stage Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  id="verification-artist-name-input"
                  type="text"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="e.g. Neon Horizon"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label 
                    htmlFor="verification-genre-select"
                    className="block text-[10px] font-mono uppercase font-bold text-zinc-400 tracking-wider"
                  >
                    Primary Genre
                  </label>
                  <select
                    id="verification-genre-select"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 text-xs text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition-all cursor-pointer"
                  >
                    <option value="Electronic" className="bg-zinc-900 text-white">Electronic</option>
                    <option value="Hip Hop" className="bg-zinc-900 text-white">Hip Hop</option>
                    <option value="Techno" className="bg-zinc-900 text-white">Techno / House</option>
                    <option value="Synthwave" className="bg-zinc-900 text-white">Synthwave</option>
                    <option value="Ambient" className="bg-zinc-900 text-white">Ambient</option>
                    <option value="Pop" className="bg-zinc-900 text-white">Pop / Indie</option>
                    <option value="Rock" className="bg-zinc-900 text-white">Rock</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label 
                    htmlFor="verification-bio-input"
                    className="block text-[10px] font-mono uppercase font-bold text-zinc-400 tracking-wider"
                  >
                    Short Bio (Optional)
                  </label>
                  <input
                    id="verification-bio-input"
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Short artist bio..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Social Connection Cards */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 tracking-wider">
                  Required Social Connections (2/2)
                </span>
                <span className="text-[10px] font-bold text-cyan-400">
                  {(isTwitterConnected ? 1 : 0) + (isInstagramConnected ? 1 : 0)} of 2 Connected
                </span>
              </div>

              {/* Twitter / X Card */}
              <div 
                id="verification-twitter-card"
                className="p-4 rounded-2xl bg-white/5 space-y-3 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isTwitterConnected ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-zinc-400'
                    }`}>
                      <Twitter className="h-5 w-5 fill-current" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">Twitter / X</h4>
                      <p className="text-[10px] text-zinc-400">Official artist social account</p>
                    </div>
                  </div>

                  {isTwitterConnected ? (
                    <div 
                      id="twitter-connected-badge"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Connected</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      id="connect-twitter-btn"
                      onClick={() => handleConnect('twitter')}
                      disabled={connectingProvider === 'twitter'}
                      className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-400 focus:outline-none flex items-center gap-1.5"
                    >
                      {connectingProvider === 'twitter' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <span>Connect</span>
                      )}
                    </button>
                  )}
                </div>

                {/* Twitter Profile URL / Handle Field */}
                <div className="space-y-1">
                  <label 
                    htmlFor="verification-twitter-handle-input"
                    className="block text-[9px] font-mono uppercase font-bold text-zinc-400"
                  >
                    Twitter / X Profile URL or Handle <span className="text-cyan-400">*</span>
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/40 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
                    <span className="text-xs text-zinc-500">@</span>
                    <input
                      id="verification-twitter-handle-input"
                      type="text"
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                      placeholder="yourhandle or https://x.com/yourhandle"
                      className="w-full bg-transparent text-xs text-white placeholder:text-zinc-600 focus:outline-none"
                      required
                    />
                  </div>
                  {twitterUrl && (
                    <p className="text-[9px] text-zinc-500 truncate">
                      Canonical URL: {normalizeSocialUrl(twitterUrl, 'twitter')}
                    </p>
                  )}
                  {formErrors.twitter && (
                    <p className="text-[10px] text-rose-400">{formErrors.twitter}</p>
                  )}
                </div>
              </div>

              {/* Instagram Card */}
              <div 
                id="verification-instagram-card"
                className="p-4 rounded-2xl bg-white/5 space-y-3 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isInstagramConnected ? 'bg-pink-500/20 text-pink-400' : 'bg-white/5 text-zinc-400'
                    }`}>
                      <Instagram className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">Instagram</h4>
                      <p className="text-[10px] text-zinc-400">Official artist visual account</p>
                    </div>
                  </div>

                  {isInstagramConnected ? (
                    <div 
                      id="instagram-connected-badge"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Connected</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      id="connect-instagram-btn"
                      onClick={() => handleConnect('instagram')}
                      disabled={connectingProvider === 'instagram'}
                      className="h-9 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-pink-400 focus:outline-none flex items-center gap-1.5"
                    >
                      {connectingProvider === 'instagram' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <span>Connect</span>
                      )}
                    </button>
                  )}
                </div>

                {/* Instagram Profile URL / Handle Field */}
                <div className="space-y-1">
                  <label 
                    htmlFor="verification-instagram-handle-input"
                    className="block text-[9px] font-mono uppercase font-bold text-zinc-400"
                  >
                    Instagram Profile URL or Handle <span className="text-cyan-400">*</span>
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/40 focus-within:ring-1 focus-within:ring-pink-400 transition-all">
                    <span className="text-xs text-zinc-500">@</span>
                    <input
                      id="verification-instagram-handle-input"
                      type="text"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="yourhandle or https://instagram.com/yourhandle"
                      className="w-full bg-transparent text-xs text-white placeholder:text-zinc-600 focus:outline-none"
                      required
                    />
                  </div>
                  {instagramUrl && (
                    <p className="text-[9px] text-zinc-500 truncate">
                      Canonical URL: {normalizeSocialUrl(instagramUrl, 'instagram')}
                    </p>
                  )}
                  {formErrors.instagram && (
                    <p className="text-[10px] text-rose-400">{formErrors.instagram}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                id="submit-verification-request-btn"
                disabled={!canSubmit || isSubmitting}
                className={`w-full h-14 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none ${
                  canSubmit && !isSubmitting
                    ? 'bg-cyan-400 hover:bg-cyan-300 text-zinc-950 shadow-lg shadow-cyan-400/20 active:scale-[0.99] cursor-pointer'
                    : 'bg-white/5 text-zinc-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Submitting Application...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Submit for Moderator Review
                  </>
                )}
              </button>

              {!canSubmit && (
                <p className="text-[10px] text-center text-zinc-500 font-medium">
                  Connect Twitter/X and Instagram, and confirm profile links to enable submission
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserArtistVerificationModal;
