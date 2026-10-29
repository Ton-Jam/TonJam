import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Music, 
  Send, 
  Globe, 
  Sparkles, 
  ExternalLink, 
  ArrowLeft,
  ChevronRight,
  FileCheck,
  Headphones,
  Info,
  Radio,
  Check,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth, cleanUpdateData, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useAudio } from '@/contexts/AudioContext';
import { toast } from 'sonner';
import { ArtistVerificationRequest } from '@/types';

const GENRES = [
  'Electronic',
  'Hip-Hop',
  'Techno',
  'House',
  'Ambient',
  'Phonk',
  'Pop',
  'Lo-Fi',
  'R&B',
  'Rock',
  'Cyberpunk',
  'Drum & Bass'
];

const ArtistVerification: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, user, refreshProfile } = useAuth();
  const { addNotification } = useAudio();

  const [requests, setRequests] = useState<ArtistVerificationRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFormAnyway, setShowFormAnyway] = useState(false);

  // Form State
  const [artistName, setArtistName] = useState('');
  const [genre, setGenre] = useState('Electronic');
  const [bio, setBio] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [appleMusicUrl, setAppleMusicUrl] = useState('');
  const [soundCloudUrl, setSoundCloudUrl] = useState('');
  const [audiusUrl, setAudiusUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [statement, setStatement] = useState('');
  const [rightsConfirmed, setRightsConfirmed] = useState(false);

  const [errors, setErrors] = useState<{
    artistName?: string;
    musicLinks?: string;
    socials?: string;
    rights?: string;
  }>({});

  // Sync profile details when loaded
  useEffect(() => {
    if (userProfile) {
      if (!artistName) setArtistName(userProfile.name || userProfile.username || '');
      if (!bio) setBio(userProfile.bio || '');
      if (userProfile.genre && GENRES.includes(userProfile.genre)) {
        setGenre(userProfile.genre);
      }
      if (userProfile.socials?.spotify && !spotifyUrl) setSpotifyUrl(userProfile.socials.spotify);
      if (userProfile.socials?.x && !twitterHandle) setTwitterHandle(userProfile.socials.x);
      if (userProfile.socials?.instagram && !instagramHandle) setInstagramHandle(userProfile.socials.instagram);
      if (userProfile.socials?.website && !websiteUrl) setWebsiteUrl(userProfile.socials.website);
    }
  }, [userProfile]);

  // Subscribe to real Firestore verification requests
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

  const isVerified = Boolean(
    userProfile?.isVerified ||
    userProfile?.isVerifiedArtist ||
    userProfile?.verified ||
    userProfile?.role === 'artist'
  );

  const pendingRequest = requests.find((r) => r.status === 'pending');
  const rejectedRequest = requests.find((r) => r.status === 'rejected' || r.status === 'needs_revision');
  const latestRequest = requests[0];

  const currentStatus: 'verified' | 'pending' | 'rejected' | 'unverified' = isVerified
    ? 'verified'
    : pendingRequest
      ? 'pending'
      : (latestRequest?.status === 'rejected' || latestRequest?.status === 'needs_revision')
        ? 'rejected'
        : 'unverified';

  // Validation
  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!artistName.trim()) {
      newErrors.artistName = 'Artist name or alias is required';
    } else if (artistName.trim().length > 60) {
      newErrors.artistName = 'Artist name must be 60 characters or fewer';
    }

    const hasMusicLink = Boolean(
      spotifyUrl.trim() ||
      appleMusicUrl.trim() ||
      soundCloudUrl.trim() ||
      audiusUrl.trim() ||
      portfolioUrl.trim()
    );

    if (!hasMusicLink) {
      newErrors.musicLinks = 'Please provide at least one music profile or catalog link (Spotify, Apple Music, SoundCloud, Audius, or portfolio)';
    }

    const hasSocialLink = Boolean(
      twitterHandle.trim() ||
      instagramHandle.trim() ||
      websiteUrl.trim()
    );

    if (!hasSocialLink) {
      newErrors.socials = 'Please provide at least one verifiable social profile (X/Twitter, Instagram, or Website)';
    }

    if (!rightsConfirmed) {
      newErrors.rights = 'You must confirm ownership and copyright control of your music';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const cleanHandle = (val: string, prefixUrl: string) => {
    let clean = val.trim();
    if (!clean) return '';
    if (clean.startsWith('@')) clean = clean.substring(1);
    if (!clean.startsWith('http')) return `${prefixUrl}${clean}`;
    return clean;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerified) {
      toast.info('Your artist identity is already verified.');
      return;
    }
    if (currentStatus === 'pending' && !showFormAnyway) {
      toast.warning('You already have a pending verification application under review.');
      return;
    }
    if (isSubmitting) return;

    if (!validateForm()) {
      toast.error('Please complete all required fields and confirm rights declaration.');
      return;
    }

    const currentUid = user?.uid || userProfile?.uid || auth.currentUser?.uid;
    const userEmail = user?.email || userProfile?.email || auth.currentUser?.email || '';

    if (!currentUid) {
      toast.error('You must be signed in to submit verification.');
      return;
    }

    setIsSubmitting(true);

    try {
      const requestId = `verify_${currentUid}_${Date.now()}`;
      const timestamp = new Date().toISOString();

      const requestPayload: ArtistVerificationRequest = {
        id: requestId,
        userId: currentUid,
        email: userEmail,
        userEmail,
        artistName: artistName.trim(),
        genre,
        bio: bio.trim(),
        statement: statement.trim(),
        socialLinks: {
          spotify: spotifyUrl.trim() ? (spotifyUrl.startsWith('http') ? spotifyUrl.trim() : `https://open.spotify.com/artist/${spotifyUrl.trim()}`) : '',
          twitter: cleanHandle(twitterHandle, 'https://x.com/'),
          instagram: cleanHandle(instagramHandle, 'https://instagram.com/'),
          soundcloud: soundCloudUrl.trim(),
          website: websiteUrl.trim(),
          appleMusic: appleMusicUrl.trim(),
          audius: audiusUrl.trim(),
        },
        portfolioUrls: [portfolioUrl.trim()].filter(Boolean),
        status: 'pending',
        submittedAt: timestamp,
        createdAt: timestamp,
      };

      // 1. Create verification request in Firestore
      await setDoc(doc(db, 'verificationRequests', requestId), cleanUpdateData(requestPayload));

      // 2. Update user profile verification status
      const userRef = doc(db, 'users', currentUid);
      await updateDoc(userRef, cleanUpdateData({
        verificationStatus: 'pending',
        pendingArtistName: artistName.trim(),
        genre: genre,
      }));

      if (refreshProfile) {
        await refreshProfile();
      }

      toast.success('Verification application submitted! Our team will review it within 24-48 hours.');
      addNotification('Artist verification application submitted for review', 'success');
      setShowFormAnyway(false);
    } catch (error) {
      console.error('Error submitting verification:', error);
      handleFirestoreError(error, OperationType.CREATE, 'verificationRequests');
      toast.error('Failed to submit verification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#080D1A] text-[#F5F7FB] pb-32 animate-in fade-in duration-500">
      {/* SCREEN HEADER */}
      <div className="sticky top-0 z-30 bg-[#080D1A]/90 backdrop-blur-xl px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-bold text-[#94A3B8] hover:text-white transition-colors cursor-pointer bg-[#111C30] px-3.5 py-2 rounded-xl"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#229ED9] bg-[#229ED9]/10 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>TonJam Creator Protocol</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
        {/* TITLE & INTRO */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Artist Verification
          </h1>
          <p className="text-sm text-[#94A3B8] font-medium">
            Verify your artist identity on TonJam.
          </p>
          <p className="text-xs text-[#94A3B8]/80 leading-relaxed max-w-2xl pt-1">
            Verification authenticates you as a genuine music creator, awards the verified blue checkmark across the TonJam ecosystem, unlocks primary and secondary NFT sales, and prioritizes your releases for algorithmic and editorial playlist discovery.
          </p>
        </div>

        {/* VERIFICATION STATUS CARD */}
        <div className="rounded-2xl bg-[#111C30] p-5 sm:p-6 shadow-xl shadow-black/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                currentStatus === 'verified'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : currentStatus === 'pending'
                    ? 'bg-amber-500/15 text-amber-400'
                    : currentStatus === 'rejected'
                      ? 'bg-rose-500/15 text-rose-400'
                      : 'bg-[#229ED9]/15 text-[#229ED9]'
              }`}>
                {currentStatus === 'verified' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : currentStatus === 'pending' ? (
                  <Clock className="w-6 h-6 animate-pulse" />
                ) : currentStatus === 'rejected' ? (
                  <AlertCircle className="w-6 h-6" />
                ) : (
                  <ShieldCheck className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
                    Account Verification Status
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    currentStatus === 'verified'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : currentStatus === 'pending'
                        ? 'bg-amber-500/20 text-amber-400'
                        : currentStatus === 'rejected'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-zinc-700/50 text-zinc-300'
                  }`}>
                    {currentStatus === 'verified'
                      ? 'Verified Artist'
                      : currentStatus === 'pending'
                        ? 'Pending Review'
                        : currentStatus === 'rejected'
                          ? 'Revision Requested'
                          : 'Unverified'}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  {currentStatus === 'verified'
                    ? `${userProfile?.name || 'You are'} a Verified TonJam Artist`
                    : currentStatus === 'pending'
                      ? 'Application Under Curation Review'
                      : currentStatus === 'rejected'
                        ? 'Application Needs Revision'
                        : 'Ready to Claim Your Artist Badge'}
                </h3>
              </div>
            </div>

            {currentStatus === 'verified' && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => navigate('/artist-dashboard')}
                  className="px-4 py-2 bg-[#229ED9] hover:bg-[#168AC4] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-[#229ED9]/20"
                >
                  Creator Dashboard
                </button>
              </div>
            )}
          </div>

          {/* Contextual Status Explanation */}
          {currentStatus === 'verified' && (
            <div className="rounded-xl bg-[#0B1424] p-4 space-y-3">
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Congratulations! Your identity as a verified music creator is confirmed on-chain and across TonJam. Your profile displays the verified badge and your releases are eligible for high-fidelity master streaming, NFT minting, and algorithmic recommendation channels.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Blue badge on tracks & profile</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-400 bg-cyan-500/10 p-2.5 rounded-lg">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Secondary NFT marketplace enabled</span>
                </div>
                <div className="flex items-center gap-2 text-purple-400 bg-purple-500/10 p-2.5 rounded-lg">
                  <Radio className="w-4 h-4 shrink-0" />
                  <span>Priority playlist placements</span>
                </div>
              </div>
            </div>
          )}

          {currentStatus === 'pending' && (
            <div className="rounded-xl bg-[#0B1424] p-4 space-y-2">
              <p className="text-xs text-amber-300 leading-relaxed">
                Your verification request has been received and is in the active review queue. Our human curators verify catalog links, streaming profiles, and social accounts to protect listeners and creators.
              </p>
              {latestRequest && (
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#94A3B8] pt-1">
                  <span>Application: <strong className="text-white">{latestRequest.artistName}</strong></span>
                  <span>Submitted: <strong className="text-white">{new Date(latestRequest.submittedAt).toLocaleDateString()}</strong></span>
                  <span>Expected review time: <strong className="text-amber-400">24-48 hours</strong></span>
                </div>
              )}
            </div>
          )}

          {currentStatus === 'rejected' && (
            <div className="rounded-xl bg-[#0B1424] p-4 space-y-3">
              <p className="text-xs text-rose-300 leading-relaxed">
                Our curation team was unable to verify your previous submission. Please review your music links and social profiles to ensure they clearly demonstrate your identity as the creator of your music.
              </p>
              {latestRequest?.reviewerNotes && (
                <div className="bg-rose-500/10 p-3 rounded-lg text-xs text-rose-200">
                  <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">Reviewer Note:</span>
                  {latestRequest.reviewerNotes}
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowFormAnyway(true)}
                className="px-4 py-2 bg-[#229ED9] text-white text-xs font-bold rounded-xl hover:bg-[#168AC4] transition-all cursor-pointer"
              >
                Submit Updated Application
              </button>
            </div>
          )}
        </div>

        {/* REQUIREMENTS CHECKLIST */}
        <div className="rounded-2xl bg-[#111C30] p-5 sm:p-6 shadow-xl shadow-black/30 space-y-4">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-[#229ED9]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Verification Requirements Checklist
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-3 bg-[#0B1424] p-3.5 rounded-xl">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3" />
              </div>
              <div>
                <p className="font-bold text-white">Active TonJam Account</p>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">Complete profile with avatar, display name, and bio.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-[#0B1424] p-3.5 rounded-xl">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3" />
              </div>
              <div>
                <p className="font-bold text-white">Proof of Catalog & Music</p>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">Link to Spotify, Apple Music, SoundCloud, or audio portfolio.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-[#0B1424] p-3.5 rounded-xl">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3" />
              </div>
              <div>
                <p className="font-bold text-white">Verifiable Social Presence</p>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">Public X (Twitter), Instagram, or official artist website.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-[#0B1424] p-3.5 rounded-xl">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3" />
              </div>
              <div>
                <p className="font-bold text-white">Copyright & Ownership Declaration</p>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">Affirm that you hold master recording and publishing rights.</p>
              </div>
            </div>
          </div>
        </div>

        {/* VERIFICATION FORM */}
        {(currentStatus === 'unverified' || currentStatus === 'rejected' || showFormAnyway) && currentStatus !== 'verified' && (
          <form onSubmit={handleSubmit} className="rounded-2xl bg-[#111C30] p-5 sm:p-7 shadow-xl shadow-black/30 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Verification Application
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Fill out your artist details for our curation review team.
                </p>
              </div>
              <span className="text-[10px] font-bold text-[#229ED9] bg-[#229ED9]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Step 1 of 1
              </span>
            </div>

            {/* SECTION 1: ARTIST INFORMATION */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#229ED9]/20 text-[#229ED9] text-[11px] font-bold flex items-center justify-center">1</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Artist Identity & Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                    Stage Name / Artist Alias <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={60}
                    value={artistName}
                    onChange={(e) => {
                      setArtistName(e.target.value);
                      if (errors.artistName) setErrors({ ...errors, artistName: undefined });
                    }}
                    placeholder="e.g. Krupy, Nova Waves"
                    className="w-full bg-[#0B1424] text-white text-xs font-semibold px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#229ED9] transition-all placeholder:text-zinc-600"
                  />
                  {errors.artistName && (
                    <p className="text-[11px] text-rose-400">{errors.artistName}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                    Primary Music Genre <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-[#0B1424] text-white text-xs font-semibold px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#229ED9] transition-all cursor-pointer"
                  >
                    {GENRES.map((g) => (
                      <option key={g} value={g} className="bg-[#0B1424] text-white">
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                    Artist Statement or Bio
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {bio.length}/500
                  </span>
                </div>
                <textarea
                  maxLength={500}
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell our review team and fans about your sound, background, and releases..."
                  className="w-full bg-[#0B1424] text-white text-xs font-medium px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#229ED9] transition-all placeholder:text-zinc-600 resize-none"
                />
              </div>
            </div>

            {/* SECTION 2: MUSIC PROFILES & PROOF */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#229ED9]/20 text-[#229ED9] text-[11px] font-bold flex items-center justify-center">2</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Music Profiles & Proof of Work <span className="text-rose-400">*</span>
                </h3>
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                Provide at least one active profile showcasing your music discography.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#94A3B8]">
                    Spotify Artist URL
                  </label>
                  <input
                    type="text"
                    value={spotifyUrl}
                    onChange={(e) => {
                      setSpotifyUrl(e.target.value);
                      if (errors.musicLinks) setErrors({ ...errors, musicLinks: undefined });
                    }}
                    placeholder="https://open.spotify.com/artist/..."
                    className="w-full bg-[#0B1424] text-white text-xs font-medium px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#229ED9] transition-all placeholder:text-zinc-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#94A3B8]">
                    SoundCloud Profile
                  </label>
                  <input
                    type="text"
                    value={soundCloudUrl}
                    onChange={(e) => {
                      setSoundCloudUrl(e.target.value);
                      if (errors.musicLinks) setErrors({ ...errors, musicLinks: undefined });
                    }}
                    placeholder="https://soundcloud.com/artist-name"
                    className="w-full bg-[#0B1424] text-white text-xs font-medium px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#229ED9] transition-all placeholder:text-zinc-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#94A3B8]">
                    Apple Music Artist Link
                  </label>
                  <input
                    type="text"
                    value={appleMusicUrl}
                    onChange={(e) => {
                      setAppleMusicUrl(e.target.value);
                      if (errors.musicLinks) setErrors({ ...errors, musicLinks: undefined });
                    }}
                    placeholder="https://music.apple.com/artist/..."
                    className="w-full bg-[#0B1424] text-white text-xs font-medium px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#229ED9] transition-all placeholder:text-zinc-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#94A3B8]">
                    Audius / Portfolio / EPK Link
                  </label>
                  <input
                    type="text"
                    value={portfolioUrl}
                    onChange={(e) => {
                      setPortfolioUrl(e.target.value);
                      if (errors.musicLinks) setErrors({ ...errors, musicLinks: undefined });
                    }}
                    placeholder="https://audius.co/... or your portfolio"
                    className="w-full bg-[#0B1424] text-white text-xs font-medium px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#229ED9] transition-all placeholder:text-zinc-600"
                  />
                </div>
              </div>
              {errors.musicLinks && (
                <p className="text-[11px] text-rose-400">{errors.musicLinks}</p>
              )}
            </div>

            {/* SECTION 3: SOCIAL & IDENTITY */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#229ED9]/20 text-[#229ED9] text-[11px] font-bold flex items-center justify-center">3</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Social Presence & Identity <span className="text-rose-400">*</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#94A3B8]">
                    X (Twitter) Handle / URL
                  </label>
                  <input
                    type="text"
                    value={twitterHandle}
                    onChange={(e) => {
                      setTwitterHandle(e.target.value);
                      if (errors.socials) setErrors({ ...errors, socials: undefined });
                    }}
                    placeholder="@artist or x.com/artist"
                    className="w-full bg-[#0B1424] text-white text-xs font-medium px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#229ED9] transition-all placeholder:text-zinc-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#94A3B8]">
                    Instagram Handle / URL
                  </label>
                  <input
                    type="text"
                    value={instagramHandle}
                    onChange={(e) => {
                      setInstagramHandle(e.target.value);
                      if (errors.socials) setErrors({ ...errors, socials: undefined });
                    }}
                    placeholder="@artist or instagram.com/artist"
                    className="w-full bg-[#0B1424] text-white text-xs font-medium px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#229ED9] transition-all placeholder:text-zinc-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#94A3B8]">
                    Official Website (Optional)
                  </label>
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://artistname.com"
                    className="w-full bg-[#0B1424] text-white text-xs font-medium px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#229ED9] transition-all placeholder:text-zinc-600"
                  />
                </div>
              </div>
              {errors.socials && (
                <p className="text-[11px] text-rose-400">{errors.socials}</p>
              )}
            </div>

            {/* SECTION 4: ADDITIONAL INFO & RIGHTS CONFIRMATION */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#229ED9]/20 text-[#229ED9] text-[11px] font-bold flex items-center justify-center">4</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Rights Confirmation & Note to Curators
                </h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#94A3B8]">
                  Note to Review Team (Optional)
                </label>
                <input
                  type="text"
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="Any context about upcoming releases or TON web3 drops..."
                  className="w-full bg-[#0B1424] text-white text-xs font-medium px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#229ED9] transition-all placeholder:text-zinc-600"
                />
              </div>

              <div className="bg-[#0B1424] p-4 rounded-xl space-y-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rightsConfirmed}
                    onChange={(e) => {
                      setRightsConfirmed(e.target.checked);
                      if (errors.rights) setErrors({ ...errors, rights: undefined });
                    }}
                    className="mt-1 h-4 w-4 rounded text-[#229ED9] focus:ring-[#229ED9] bg-black cursor-pointer"
                  />
                  <span className="text-xs text-[#94A3B8] leading-relaxed">
                    <strong className="text-white">I confirm that I own or control all rights to my music, audio recordings, and artwork.</strong> I understand that submitting fraudulent or copyrighted material without license will result in permanent suspension of creator privileges.
                  </span>
                </label>
                {errors.rights && (
                  <p className="text-[11px] text-rose-400 ml-7">{errors.rights}</p>
                )}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[11px] text-[#94A3B8]">
                Applications are reviewed in order of arrival. Standard turnaround is 24-48 hours.
              </p>
              <button
                type="submit"
                disabled={isSubmitting || (currentStatus === 'pending' && !showFormAnyway)}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#229ED9] hover:bg-[#168AC4] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#229ED9]/25"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit for Verification</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ArtistVerification;
