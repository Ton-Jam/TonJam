import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Send, 
  Music2, 
  Twitter, 
  Instagram, 
  Globe, 
  Sparkles, 
  ExternalLink, 
  ArrowUpRight, 
  RefreshCw, 
  Info,
  BadgeCheck,
  Headphones,
  Flame,
  FileText,
  Check,
  X,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth, cleanUpdateData, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useAudio } from '@/contexts/AudioContext';
import { toast } from 'sonner';
import { ArtistVerificationRequest } from '@/types';
import { format } from 'date-fns';

interface SocialInputs {
  spotify: string;
  twitter: string;
  instagram: string;
  soundcloud?: string;
  website?: string;
}

export const ArtistVerificationSection: React.FC = () => {
  const { userProfile, user, refreshProfile } = useAuth();
  const { addNotification } = useAudio();

  // Verification request state from Firestore
  const [requests, setRequests] = useState<ArtistVerificationRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResubmitForm, setShowResubmitForm] = useState(false);

  // Form State
  const [artistName, setArtistName] = useState(userProfile?.name || userProfile?.username || '');
  const [genre, setGenre] = useState(userProfile?.genre || 'Electronic');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [statement, setStatement] = useState('');
  const [socials, setSocials] = useState<SocialInputs>({
    spotify: userProfile?.socials?.spotify || '',
    twitter: userProfile?.socials?.x || userProfile?.socials?.twitter || '',
    instagram: userProfile?.socials?.instagram || '',
    soundcloud: (userProfile?.socials as any)?.soundcloud || '',
    website: userProfile?.socials?.website || '',
  });

  const [formErrors, setFormErrors] = useState<{
    artistName?: string;
    spotify?: string;
    twitter?: string;
    instagram?: string;
    general?: string;
  }>({});

  // Sync initial user details when profile updates
  useEffect(() => {
    if (userProfile) {
      if (!artistName) setArtistName(userProfile.name || userProfile.username || '');
      if (!bio) setBio(userProfile.bio || '');
      setSocials((prev) => ({
        spotify: prev.spotify || userProfile.socials?.spotify || '',
        twitter: prev.twitter || userProfile.socials?.x || userProfile.socials?.twitter || '',
        instagram: prev.instagram || userProfile.socials?.instagram || '',
        soundcloud: prev.soundcloud || (userProfile.socials as any)?.soundcloud || '',
        website: prev.website || userProfile.socials?.website || '',
      }));
    }
  }, [userProfile]);

  // Listen to user's verification requests in Firestore
  useEffect(() => {
    const currentUid = user?.uid || userProfile?.uid || auth.currentUser?.uid;
    if (!currentUid) {
      setLoadingRequests(false);
      return;
    }

    const q = query(
      collection(db, 'verificationRequests'),
      where('userId', '==', currentUid),
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
  }, [user?.uid, userProfile?.uid]);

  // Derived current status
  const isVerified = Boolean(userProfile?.isVerified || userProfile?.isVerifiedArtist || userProfile?.verified || userProfile?.role === 'artist');
  const activePendingRequest = requests.find((r) => r.status === 'pending');
  const activeRevisionRequest = requests.find((r) => r.status === 'needs_revision');
  const latestRequest = requests[0];

  const currentStatus: 'verified' | 'pending' | 'needs_revision' | 'rejected' | 'unverified' = isVerified
    ? 'verified'
    : activePendingRequest
      ? 'pending'
      : activeRevisionRequest || latestRequest?.status === 'needs_revision' || (userProfile?.verificationStatus as any) === 'needs_revision'
        ? 'needs_revision'
        : latestRequest?.status === 'rejected' || (userProfile?.verificationStatus as any) === 'rejected'
          ? 'rejected'
          : (userProfile?.verificationStatus as any) || 'unverified';

  // Format and validate links
  const validateForm = () => {
    const errors: typeof formErrors = {};
    if (!artistName.trim()) {
      errors.artistName = 'Artist name or alias is required';
    }

    const hasAtLeastOneSocial = Boolean(
      socials.spotify.trim() || socials.twitter.trim() || socials.instagram.trim()
    );

    if (!hasAtLeastOneSocial) {
      errors.general = 'Please provide at least one social media channel (Spotify, Twitter, or Instagram) for review.';
    }

    if (socials.spotify && !socials.spotify.includes('spotify.com') && !socials.spotify.startsWith('spotify:')) {
      errors.spotify = 'Please enter a valid Spotify artist or track URL (e.g. open.spotify.com/artist/...)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const cleanUrl = (input: string, platform: 'twitter' | 'instagram' | 'spotify'): string => {
    let clean = input.trim();
    if (!clean) return '';

    if (platform === 'twitter') {
      if (clean.startsWith('@')) clean = clean.substring(1);
      if (!clean.startsWith('http')) clean = `https://x.com/${clean}`;
    } else if (platform === 'instagram') {
      if (clean.startsWith('@')) clean = clean.substring(1);
      if (!clean.startsWith('http')) clean = `https://instagram.com/${clean}`;
    } else if (platform === 'spotify') {
      if (!clean.startsWith('http') && !clean.startsWith('spotify:')) {
        clean = `https://open.spotify.com/artist/${clean}`;
      }
    }
    return clean;
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerified) {
      toast.error('Your artist profile is already verified.');
      return;
    }
    if (isSubmitting) return;

    if (!validateForm()) {
      toast.error('Please complete all required fields');
      return;
    }

    const currentUid = user?.uid || userProfile?.uid || auth.currentUser?.uid;
    const userEmail = user?.email || userProfile?.email || auth.currentUser?.email || '';

    if (!currentUid) {
      toast.error('Authentication required to submit verification');
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanSpotify = cleanUrl(socials.spotify, 'spotify');
      const cleanTwitter = cleanUrl(socials.twitter, 'twitter');
      const cleanInstagram = cleanUrl(socials.instagram, 'instagram');

      const socialLinksList = [
        ...(cleanSpotify ? [{ platform: 'spotify', url: cleanSpotify }] : []),
        ...(cleanTwitter ? [{ platform: 'twitter', url: cleanTwitter }] : []),
        ...(cleanInstagram ? [{ platform: 'instagram', url: cleanInstagram }] : []),
        ...(socials.soundcloud ? [{ platform: 'soundcloud', url: socials.soundcloud.trim() }] : []),
        ...(socials.website ? [{ platform: 'website', url: socials.website.trim() }] : [])
      ];

      const portfolioUrlsList = [
        ...(cleanSpotify ? [cleanSpotify] : []),
        ...(cleanTwitter ? [cleanTwitter] : []),
        ...(cleanInstagram ? [cleanInstagram] : []),
        ...(socials.soundcloud ? [socials.soundcloud.trim()] : []),
        ...(socials.website ? [socials.website.trim()] : [])
      ];

      const nowIso = new Date().toISOString();

      const newRequestPayload = {
        userId: currentUid,
        artistName: artistName.trim(),
        email: userEmail,
        bio: bio.trim(),
        statement: statement.trim() || bio.trim(),
        genre: genre.trim(),
        socialLinks: socialLinksList,
        socialsMap: {
          spotify: cleanSpotify,
          x: cleanTwitter,
          twitter: cleanTwitter,
          instagram: cleanInstagram,
          soundcloud: socials.soundcloud?.trim() || '',
          website: socials.website?.trim() || ''
        },
        portfolioUrl: cleanSpotify || cleanTwitter || cleanInstagram || socials.website?.trim() || '',
        portfolioUrls: portfolioUrlsList,
        metadata: {
          bio: bio.trim(),
          genre: genre.trim(),
          statement: statement.trim()
        },
        status: 'pending',
        submittedAt: nowIso,
        createdAt: nowIso,
        updatedAt: nowIso
      };

      // 1. Create document in verificationRequests
      await addDoc(collection(db, 'verificationRequests'), cleanUpdateData(newRequestPayload));

      // 2. Update user profile document to pending
      const userRef = doc(db, 'users', currentUid);
      await updateDoc(userRef, cleanUpdateData({
        verificationStatus: 'pending',
        genre: genre.trim(),
        bio: bio.trim() || userProfile?.bio || '',
        socials: {
          ...(userProfile?.socials || {}),
          spotify: cleanSpotify || userProfile?.socials?.spotify || '',
          x: cleanTwitter || userProfile?.socials?.x || userProfile?.socials?.twitter || '',
          instagram: cleanInstagram || userProfile?.socials?.instagram || '',
          soundcloud: socials.soundcloud?.trim() || (userProfile?.socials as any)?.soundcloud || '',
          website: socials.website?.trim() || userProfile?.socials?.website || ''
        }
      }));

      await refreshProfile();
      addNotification('Artist verification application submitted successfully!', 'success');
      toast.success('Application submitted for review!');
      setShowResubmitForm(false);
    } catch (error: any) {
      console.error('Error submitting verification:', error);
      handleFirestoreError(error, OperationType.CREATE, 'verificationRequests');
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner / Status Overview Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900/90 via-[#0D1527]/90 to-zinc-950 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Identity Protocol
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                {currentStatus === 'verified' && 'Active Verified Creator'}
                {currentStatus === 'pending' && 'Under Active Review'}
                {currentStatus === 'rejected' && 'Action Required'}
                {currentStatus === 'unverified' && 'Application Ready'}
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Artist Verification
              {currentStatus === 'verified' && (
                <BadgeCheck className="w-7 h-7 text-cyan-400 fill-cyan-400/20 inline-block" />
              )}
            </h2>

            <p className="text-xs md:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Verify your official artist presence across streaming and social platforms to unlock verified creator badges, decentralized audio distribution, and smart contract royalty splits.
            </p>
          </div>

          {/* Status Badge Pill */}
          <div className="shrink-0 flex items-center gap-3">
            {currentStatus === 'verified' && (
              <div className="flex items-center gap-3 bg-cyan-500/10 px-5 py-3 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-cyan-400/20 text-cyan-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold">Status</div>
                  <div className="text-sm font-black text-white uppercase tracking-wider">Verified Artist</div>
                </div>
              </div>
            )}

            {currentStatus === 'pending' && (
              <div className="flex items-center gap-3 bg-amber-500/10 px-5 py-3 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-amber-400 font-bold">Status</div>
                  <div className="text-sm font-black text-white uppercase tracking-wider">In Review</div>
                </div>
              </div>
            )}

            {currentStatus === 'needs_revision' && (
              <div className="flex items-center gap-3 bg-orange-500/10 px-5 py-3 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-orange-400/20 text-orange-400 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-orange-400 font-bold">Status</div>
                  <div className="text-sm font-black text-white uppercase tracking-wider">Needs Revision</div>
                </div>
              </div>
            )}

            {currentStatus === 'rejected' && (
              <div className="flex items-center gap-3 bg-rose-500/10 px-5 py-3 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-rose-400/20 text-rose-400 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-rose-400 font-bold">Status</div>
                  <div className="text-sm font-black text-white uppercase tracking-wider">Declined</div>
                </div>
              </div>
            )}

            {currentStatus === 'unverified' && (
              <div className="flex items-center gap-3 bg-white/5 px-5 py-3 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-zinc-300 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-zinc-300" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Status</div>
                  <div className="text-sm font-black text-white uppercase tracking-wider">Unverified</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* VERIFIED STATE BANNER & PERKS */}
      {currentStatus === 'verified' && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/60 backdrop-blur-md space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 text-cyan-400 flex items-center justify-center shrink-0">
                <BadgeCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-lg font-black text-white">Your Artist Identity is Verified</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Your identity has been authenticated. You possess full creator rights on TonJam, including official catalog publishing, verified badge displays, and automated smart contract distribution splits.
                </p>
              </div>
            </div>

            {/* Verified Perks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/[0.03] space-y-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <BadgeCheck className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Verified Checkmark</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Distinctive cyan verification badge displayed on your public artist page, track cards, and leaderboards.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] space-y-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">NFT Music Studio</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Direct access to mint exclusive music stem NFTs, limited vinyl drops, and master royalty collections on TON.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Headphones className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Royalty Automation</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Set multi-recipient collaborator splits and withdraw streaming earnings straight to your TON wallet.
                </p>
              </div>
            </div>

            {/* Linked Socials Summary */}
            <div className="pt-4 space-y-3">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider block">
                Linked Channels On File
              </span>
              <div className="flex flex-wrap gap-3">
                {userProfile?.socials?.spotify && (
                  <a 
                    href={userProfile.socials.spotify} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
                  >
                    <Music2 className="w-3.5 h-3.5" /> Spotify Profile <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {(userProfile?.socials?.x || userProfile?.socials?.twitter) && (
                  <a 
                    href={userProfile.socials.x || userProfile.socials.twitter} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-500/10 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-colors"
                  >
                    <Twitter className="w-3.5 h-3.5" /> Twitter (X) <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {userProfile?.socials?.instagram && (
                  <a 
                    href={userProfile.socials.instagram} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-pink-500/10 text-pink-400 text-xs font-bold hover:bg-pink-500/20 transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5" /> Instagram <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {userProfile?.socials?.website && (
                  <a 
                    href={userProfile.socials.website} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 text-zinc-200 text-xs font-bold hover:bg-white/20 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" /> Website <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PENDING STATE CARD */}
      {currentStatus === 'pending' && (
        <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/60 backdrop-blur-md space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-lg font-black text-white">Application Under Review</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Your artist verification request has been queued for verification. Our review team cross-references your social footprints and release history to assign your on-chain verification credentials.
              </p>
            </div>
          </div>

          {/* Submission Details */}
          {activePendingRequest && (
            <div className="p-4 rounded-2xl bg-black/40 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-zinc-400">
                <span>Submitted: {activePendingRequest.submittedAt ? format(new Date(activePendingRequest.submittedAt), 'PPpp') : 'Recently'}</span>
                <span className="text-amber-400 font-bold uppercase">Estimated Review: 24 - 48 Hours</span>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-white">Artist Name: {activePendingRequest.artistName}</div>
                <div className="text-xs text-zinc-400">Genre: {activePendingRequest.genre}</div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-zinc-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" /> You will be automatically notified once review finishes.
            </span>
            <button
              onClick={() => setShowResubmitForm(!showResubmitForm)}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors bg-transparent border-none cursor-pointer"
            >
              {showResubmitForm ? 'Close Edit Form' : 'Update Application Details'}
            </button>
          </div>
        </div>
      )}

      {/* NEEDS REVISION NOTICE */}
      {currentStatus === 'needs_revision' && (
        <div className="p-6 md:p-8 rounded-3xl bg-orange-950/20 backdrop-blur-md space-y-4 border border-orange-500/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-lg font-black text-white">Application Needs Revision</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Your verification request requires revision. Please check reviewer feedback below, update your artist profile or social links, and resubmit.
              </p>
              {latestRequest?.reviewerNotes && (
                <div className="mt-3 p-3 rounded-xl bg-black/40 text-xs text-orange-200 italic border border-orange-500/10">
                  Reviewer note: "{latestRequest.reviewerNotes}"
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowResubmitForm(true)}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              Update & Resubmit Links
            </button>
          </div>
        </div>
      )}

      {/* REJECTED NOTICE */}
      {currentStatus === 'rejected' && (
        <div className="p-6 md:p-8 rounded-3xl bg-rose-950/20 backdrop-blur-md space-y-4 border border-rose-500/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-lg font-black text-white">Verification Declined</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Your artist verification request was declined. Review notes from the review team are shown below.
              </p>
              {latestRequest?.reviewerNotes && (
                <div className="mt-3 p-3 rounded-xl bg-black/40 text-xs text-rose-200 italic border border-rose-500/10">
                  Reviewer note: "{latestRequest.reviewerNotes}"
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowResubmitForm(true)}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              Submit New Application
            </button>
          </div>
        </div>
      )}

      {/* SUBMISSION FORM (Displayed if unverified, needs_revision, rejected, or updating) */}
      {(currentStatus === 'unverified' || showResubmitForm || currentStatus === 'needs_revision' || currentStatus === 'rejected') && (
        <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/60 backdrop-blur-md space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-cyan-400" />
              {currentStatus === 'pending' ? 'Update Verification Submission' : 'Submit Verification Links'}
            </h3>
            <p className="text-xs text-zinc-400">
              Provide your official Spotify, Twitter (X), and Instagram artist links for manual and automated verification.
            </p>
          </div>

          {formErrors.general && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {formErrors.general}
            </div>
          )}

          <form onSubmit={handleSubmitVerification} className="space-y-6">
            {/* Artist Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase font-bold text-zinc-400 tracking-wider">
                  Artist / Stage Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="e.g. Neon Horizon"
                  className="w-full px-4 py-3 rounded-2xl bg-black/40 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
                  required
                />
                {formErrors.artistName && (
                  <p className="text-[10px] text-rose-400">{formErrors.artistName}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase font-bold text-zinc-400 tracking-wider">
                  Primary Genre / Musical Style
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-black/40 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all cursor-pointer"
                >
                  <option value="Electronic">Electronic / EDM</option>
                  <option value="Hip Hop">Hip Hop / Rap</option>
                  <option value="Techno">Techno / House</option>
                  <option value="Synthwave">Synthwave / Cyberpunk</option>
                  <option value="Ambient">Ambient / Chillout</option>
                  <option value="Pop">Pop / Indie</option>
                  <option value="Rock">Rock / Alternative</option>
                  <option value="Classical">Classical / Orchestral</option>
                  <option value="World">World / Experimental</option>
                </select>
              </div>
            </div>

            {/* Social Media Link Inputs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 tracking-wider">
                  Social Channels & Streaming Profiles
                </span>
                <span className="text-[10px] text-zinc-500">Provide at least 1 primary channel</span>
              </div>

              {/* Spotify Link Input */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/40 focus-within:ring-1 focus-within:ring-emerald-400 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Music2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-mono uppercase text-emerald-400 font-bold">Spotify Artist Profile URL</div>
                    <input
                      type="text"
                      value={socials.spotify}
                      onChange={(e) => setSocials({ ...socials, spotify: e.target.value })}
                      placeholder="https://open.spotify.com/artist/..."
                      className="w-full bg-transparent text-xs text-white placeholder:text-zinc-600 focus:outline-none"
                    />
                  </div>
                  {socials.spotify && (
                    <a
                      href={cleanUrl(socials.spotify, 'spotify')}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-400 hover:text-emerald-400 transition-colors p-1"
                      title="Preview link"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
                {formErrors.spotify && (
                  <p className="text-[10px] text-rose-400 px-2">{formErrors.spotify}</p>
                )}
              </div>

              {/* Twitter / X Link Input */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/40 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                    <Twitter className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-mono uppercase text-blue-400 font-bold">Twitter (X) Profile or Handle</div>
                    <input
                      type="text"
                      value={socials.twitter}
                      onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
                      placeholder="https://x.com/yourhandle or @yourhandle"
                      className="w-full bg-transparent text-xs text-white placeholder:text-zinc-600 focus:outline-none"
                    />
                  </div>
                  {socials.twitter && (
                    <a
                      href={cleanUrl(socials.twitter, 'twitter')}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-400 hover:text-blue-400 transition-colors p-1"
                      title="Preview link"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Instagram Link Input */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/40 focus-within:ring-1 focus-within:ring-pink-400 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center shrink-0">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-mono uppercase text-pink-400 font-bold">Instagram Profile or Handle</div>
                    <input
                      type="text"
                      value={socials.instagram}
                      onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                      placeholder="https://instagram.com/yourhandle or @yourhandle"
                      className="w-full bg-transparent text-xs text-white placeholder:text-zinc-600 focus:outline-none"
                    />
                  </div>
                  {socials.instagram && (
                    <a
                      href={cleanUrl(socials.instagram, 'instagram')}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-400 hover:text-pink-400 transition-colors p-1"
                      title="Preview link"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Optional Website / Extra Portfolio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/40 focus-within:ring-1 focus-within:ring-cyan-400 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-mono uppercase text-cyan-400 font-bold">Official Website (Optional)</div>
                    <input
                      type="url"
                      value={socials.website}
                      onChange={(e) => setSocials({ ...socials, website: e.target.value })}
                      placeholder="https://artistwebsite.com"
                      className="w-full bg-transparent text-xs text-white placeholder:text-zinc-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/40 focus-within:ring-1 focus-within:ring-amber-400 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-mono uppercase text-amber-400 font-bold">SoundCloud / Other URL</div>
                    <input
                      type="text"
                      value={socials.soundcloud}
                      onChange={(e) => setSocials({ ...socials, soundcloud: e.target.value })}
                      placeholder="https://soundcloud.com/artist"
                      className="w-full bg-transparent text-xs text-white placeholder:text-zinc-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bio & Statement */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase font-bold text-zinc-400 tracking-wider">
                  Artist Bio & Background
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell listeners and the community about your musical background, releases, and vision..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-black/40 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase font-bold text-zinc-400 tracking-wider">
                  Verification Statement / Proof Note (Optional)
                </label>
                <textarea
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="Additional context or proof notes for the verification review team (e.g. notable performances, label contracts, discography links)..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-2xl bg-black/40 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all resize-none"
                />
              </div>
            </div>

            {/* Submission Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                Submitted data will be reviewed by TonJam moderators.
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit for Verification
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VERIFICATION HISTORY LOGS */}
      {requests.length > 0 && (
        <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/40 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" /> Verification Submission History
            </h4>
            <span className="text-[10px] font-mono text-zinc-500">{requests.length} Record(s)</span>
          </div>

          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-black/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-white">{req.artistName}</span>
                    <span
                      className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full ${
                        req.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : req.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div className="text-[10px] text-zinc-400 font-mono">
                    {req.submittedAt ? format(new Date(req.submittedAt), 'PPP • p') : 'Pending'}
                  </div>

                  {req.reviewerNotes && (
                    <p className="text-[11px] text-zinc-300 italic pt-1">
                      Note: "{req.reviewerNotes}"
                    </p>
                  )}
                </div>

                {/* Social Links Chips */}
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(req.socialLinks) ? (
                    req.socialLinks.map((s: any, idx: number) => (
                      <a
                        key={idx}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1 transition-colors"
                      >
                        {s.platform} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ))
                  ) : req.socialLinks && typeof req.socialLinks === 'object' ? (
                    Object.entries(req.socialLinks).map(([platform, url], idx) => {
                      if (!url) return null;
                      return (
                        <a
                          key={idx}
                          href={url as string}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1 transition-colors"
                        >
                          {platform} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      );
                    })
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistVerificationSection;
