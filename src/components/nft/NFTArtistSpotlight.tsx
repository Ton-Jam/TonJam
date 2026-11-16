import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  ChevronRight,
  Disc3,
  ExternalLink,
  Headphones,
  MapPin,
  Music,
  UserPlus,
  Users,
} from "lucide-react";
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import { Artist, NFTItem, Track } from "@/types";
import { useAudio } from "@/contexts/AudioContext";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { getPlaceholderImage } from "@/lib/utils";
import VerifiedArtistBadge from "@/components/common/VerifiedArtistBadge";

interface NFTArtistSpotlightProps {
  nft: NFTItem;
  matchedCreator?: Artist | null;
  associatedTrack?: Track | null;
}

interface FirestoreCreatorProfile {
  uid: string;
  name?: string;
  displayName?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  photoURL?: string;
  bannerUrl?: string;
  bannerImageUrl?: string;
  genre?: string;
  location?: string;
  followers?: number;
  verified?: boolean;
  isVerifiedArtist?: boolean;
  totalStreams?: number;
  monthlyListeners?: number;
  socials?: Artist["socials"];
}

const formatCompactNumber = (num: number): string => {
  if (!Number.isFinite(num) || num <= 0) return "0";
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return num.toLocaleString();
};

export const NFTArtistSpotlight: React.FC<NFTArtistSpotlightProps> = ({
  nft,
  matchedCreator,
  associatedTrack,
}) => {
  const navigate = useNavigate();
  const {
    artists,
    allTracks,
    allNFTs,
    followedUserIds = [],
    toggleFollowUser,
    userProfile,
  } = useAudio();

  const [firestoreProfile, setFirestoreProfile] =
    useState<FirestoreCreatorProfile | null>(null);
  const [firestoreTrackCount, setFirestoreTrackCount] = useState<number | null>(
    null
  );
  const [avatarError, setAvatarError] = useState(false);

  const creatorNameInput = useMemo(
    () => (nft.creator || nft.artist || associatedTrack?.artist || "").trim(),
    [nft.creator, nft.artist, associatedTrack?.artist]
  );

  const contextArtist = useMemo(() => {
    if (matchedCreator) return matchedCreator;
    const targetIds = new Set(
      [nft.artistId, nft.creatorId, associatedTrack?.artistId].filter(
        Boolean
      ) as string[]
    );
    return (
      artists.find(
        (a) =>
          targetIds.has(a.uid) ||
          (creatorNameInput &&
            a.name.toLowerCase() === creatorNameInput.toLowerCase())
      ) || null
    );
  }, [matchedCreator, artists, nft.artistId, nft.creatorId, associatedTrack?.artistId, creatorNameInput]);

  const candidateCreatorUid = useMemo(
    () =>
      contextArtist?.uid ||
      nft.artistId ||
      nft.creatorId ||
      associatedTrack?.artistId ||
      "",
    [contextArtist?.uid, nft.artistId, nft.creatorId, associatedTrack?.artistId]
  );

  // Pull live creator profile & total track count from Firestore
  useEffect(() => {
    let cancelled = false;
    setAvatarError(false);

    const loadCreatorDetails = async () => {
      let resolvedUid = candidateCreatorUid;

      // 1. Fetch creator's Firestore profile if available
      if (candidateCreatorUid) {
        try {
          const userSnap = await getDoc(doc(db, "users", candidateCreatorUid));
          if (!cancelled && userSnap.exists()) {
            const data = userSnap.data() as Record<string, any>;
            resolvedUid = userSnap.id;
            setFirestoreProfile({
              uid: userSnap.id,
              name: data.name || data.displayName,
              displayName: data.displayName,
              username: data.username,
              bio: data.bio,
              avatarUrl: data.avatarUrl || data.photoURL,
              bannerUrl: data.bannerUrl || data.bannerImageUrl,
              genre: data.genre,
              location: data.location,
              followers:
                typeof data.followers === "number" ? data.followers : undefined,
              verified: Boolean(data.verified || data.isVerifiedArtist),
              isVerifiedArtist: Boolean(data.isVerifiedArtist || data.verified),
              totalStreams:
                typeof data.totalStreams === "number"
                  ? data.totalStreams
                  : undefined,
              monthlyListeners:
                typeof data.monthlyListeners === "number"
                  ? data.monthlyListeners
                  : undefined,
              socials: data.socials,
            });
          }
        } catch (err) {
          handleFirestoreError(
            err,
            OperationType.GET,
            `users/${candidateCreatorUid}`
          );
        }
      } else if (creatorNameInput) {
        try {
          const nameQuery = query(
            collection(db, "users"),
            where("name", "==", creatorNameInput),
            limit(1)
          );
          const snap = await getDocs(nameQuery);
          if (!cancelled && !snap.empty) {
            const matchedDoc = snap.docs[0];
            const data = matchedDoc.data() as Record<string, any>;
            resolvedUid = matchedDoc.id;
            setFirestoreProfile({
              uid: matchedDoc.id,
              name: data.name || data.displayName,
              displayName: data.displayName,
              username: data.username,
              bio: data.bio,
              avatarUrl: data.avatarUrl || data.photoURL,
              bannerUrl: data.bannerUrl || data.bannerImageUrl,
              genre: data.genre,
              location: data.location,
              followers:
                typeof data.followers === "number" ? data.followers : undefined,
              verified: Boolean(data.verified || data.isVerifiedArtist),
              isVerifiedArtist: Boolean(data.isVerifiedArtist || data.verified),
              totalStreams:
                typeof data.totalStreams === "number"
                  ? data.totalStreams
                  : undefined,
              monthlyListeners:
                typeof data.monthlyListeners === "number"
                  ? data.monthlyListeners
                  : undefined,
              socials: data.socials,
            });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, "users");
        }
      }

      // 2. Fetch authoritative total tracks count for creator
      try {
        if (resolvedUid) {
          const tracksByIdQuery = query(
            collection(db, "tracks"),
            where("artistId", "==", resolvedUid)
          );
          const countSnap = await getCountFromServer(tracksByIdQuery);
          if (!cancelled) {
            setFirestoreTrackCount(countSnap.data().count);
          }
        } else if (creatorNameInput) {
          const tracksByNameQuery = query(
            collection(db, "tracks"),
            where("artist", "==", creatorNameInput)
          );
          const countSnap = await getCountFromServer(tracksByNameQuery);
          if (!cancelled) {
            setFirestoreTrackCount(countSnap.data().count);
          }
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "tracks");
      }
    };

    loadCreatorDetails();

    return () => {
      cancelled = true;
    };
  }, [candidateCreatorUid, creatorNameInput]);

  const resolvedUid = firestoreProfile?.uid || candidateCreatorUid;
  const displayName =
    firestoreProfile?.name ||
    firestoreProfile?.displayName ||
    contextArtist?.name ||
    creatorNameInput ||
    "Creator";

  const username = firestoreProfile?.username || contextArtist?.username;
  const genre =
    firestoreProfile?.genre ||
    contextArtist?.genre ||
    associatedTrack?.genre;
  const location = firestoreProfile?.location || contextArtist?.location;
  const bio =
    firestoreProfile?.bio ||
    contextArtist?.bio ||
    "Independent creator releasing music collectibles and master editions on TON.";

  const isVerified = Boolean(
    firestoreProfile?.verified ||
      firestoreProfile?.isVerifiedArtist ||
      contextArtist?.verified ||
      contextArtist?.isVerifiedArtist ||
      nft.artistVerified
  );

  const fallbackAvatar = getPlaceholderImage(
    `artist-${displayName || nft.id}`
  );
  const rawAvatar =
    firestoreProfile?.avatarUrl ||
    contextArtist?.avatarUrl ||
    associatedTrack?.artistAvatar;
  const avatarSrc =
    !avatarError && rawAvatar ? rawAvatar : fallbackAvatar;

  // Local catalog counts merged with Firestore count
  const localTrackCount = useMemo(() => {
    const normalizedName = displayName.toLowerCase();
    return allTracks.filter((track) => {
      if (resolvedUid && track.artistId === resolvedUid) return true;
      return (
        Boolean(normalizedName) &&
        track.artist?.trim().toLowerCase() === normalizedName
      );
    }).length;
  }, [allTracks, resolvedUid, displayName]);

  const totalTracks = Math.max(firestoreTrackCount ?? 0, localTrackCount);

  const totalNFTReleases = useMemo(() => {
    const normalizedName = displayName.toLowerCase();
    return allNFTs.filter((item) => {
      if (
        resolvedUid &&
        (item.artistId === resolvedUid || item.creatorId === resolvedUid)
      ) {
        return true;
      }
      return (
        Boolean(normalizedName) &&
        (item.creator?.trim().toLowerCase() === normalizedName ||
          item.artist?.trim().toLowerCase() === normalizedName)
      );
    }).length;
  }, [allNFTs, resolvedUid, displayName]);

  const followersCount = Math.max(
    firestoreProfile?.followers ?? contextArtist?.followers ?? 0,
    0
  );

  const totalStreams = useMemo(() => {
    const profileStreams =
      firestoreProfile?.totalStreams ?? contextArtist?.totalStreams ?? 0;
    if (profileStreams > 0) return profileStreams;
    const normalizedName = displayName.toLowerCase();
    return allTracks.reduce((sum, track) => {
      const matches =
        (resolvedUid && track.artistId === resolvedUid) ||
        (Boolean(normalizedName) &&
          track.artist?.trim().toLowerCase() === normalizedName);
      if (!matches) return sum;
      return sum + (track.playCount || track.streams || 0);
    }, 0);
  }, [
    firestoreProfile?.totalStreams,
    contextArtist?.totalStreams,
    allTracks,
    resolvedUid,
    displayName,
  ]);

  const followTargetId =
    resolvedUid ||
    displayName.toLowerCase().replace(/\s+/g, "-");

  const profileRouteId =
    resolvedUid || displayName.toLowerCase().replace(/\s+/g, "-");

  const isOwnProfile = Boolean(
    userProfile?.uid && resolvedUid && userProfile.uid === resolvedUid
  );

  const isFollowing = Boolean(
    followTargetId && followedUserIds.includes(followTargetId)
  );

  const socials = firestoreProfile?.socials || contextArtist?.socials;
  const websiteHref = socials?.website
    ? socials.website.startsWith("http")
      ? socials.website
      : `https://${socials.website}`
    : null;

  const metaParts = [
    username ? `@${username.replace(/^@/, "")}` : null,
    genre && genre !== "Unknown" ? genre : null,
    location || null,
  ].filter(Boolean) as string[];

  return (
    <section
      aria-labelledby="artist-spotlight-heading"
      className="mt-10 bg-[var(--tj-color-surface-default,#0D1628)] border-0 rounded-[var(--tj-radius-md,8px)] p-5 sm:p-6 space-y-5"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2
            id="artist-spotlight-heading"
            className="text-base sm:text-lg font-bold text-white tracking-tight"
          >
            Artist Spotlight
          </h2>
          <p className="text-xs text-[var(--tj-color-text-secondary,#C2C7CD)]">
            Creator profile & catalog overview
          </p>
        </div>

        {profileRouteId && (
          <button
            type="button"
            onClick={() => navigate(`/artist/${profileRouteId}`)}
            className="min-h-[40px] px-3.5 py-2 bg-[var(--tj-color-surface-elevated,#111F36)] hover:bg-[var(--tj-color-surface-hover,#132B49)] rounded-[var(--tj-radius-sm,6px)] text-xs font-semibold text-white transition-colors inline-flex items-center gap-1.5 border-0 cursor-pointer shrink-0"
          >
            <span>View Profile</span>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--tj-color-text-secondary,#C2C7CD)]" />
          </button>
        )}
      </div>

      {/* Main Profile + Stats Grid */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Identity & Bio */}
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <button
            type="button"
            onClick={() =>
              profileRouteId && navigate(`/artist/${profileRouteId}`)
            }
            className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-[var(--tj-radius-md,8px)] overflow-hidden bg-[var(--tj-color-surface-elevated,#111F36)] border-0 p-0 cursor-pointer group"
            aria-label={`Open ${displayName} artist profile`}
          >
            <img
              src={avatarSrc}
              alt={displayName}
              referrerPolicy="no-referrer"
              onError={() => setAvatarError(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  profileRouteId && navigate(`/artist/${profileRouteId}`)
                }
                className="text-left text-base sm:text-lg font-bold text-white hover:text-[var(--tj-color-brand-primary,#00B4D8)] transition-colors truncate bg-transparent border-0 p-0 cursor-pointer"
              >
                {displayName}
              </button>
              <VerifiedArtistBadge
                isVerified={isVerified}
                artistName={displayName}
                artistId={resolvedUid}
                size="sm"
              />
            </div>

            {metaParts.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--tj-color-text-secondary,#C2C7CD)]">
                {metaParts.map((part, idx) => (
                  <React.Fragment key={part}>
                    {idx > 0 && (
                      <span
                        aria-hidden="true"
                        className="text-[var(--tj-color-text-muted,#7E8A9A)]"
                      >
                        ·
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 truncate">
                      {part === location && (
                        <MapPin className="w-3 h-3 text-[var(--tj-color-brand-primary,#00B4D8)] shrink-0" />
                      )}
                      <span>{part}</span>
                    </span>
                  </React.Fragment>
                ))}
              </div>
            )}

            <p className="text-xs sm:text-sm text-[var(--tj-color-text-secondary,#C2C7CD)] leading-relaxed line-clamp-2 max-w-2xl">
              {bio}
            </p>

            {websiteHref && (
              <a
                href={websiteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--tj-color-brand-primary,#00B4D8)] hover:underline pt-0.5"
              >
                <span>Official Website</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Actions (Follow button shown when not already followed) */}
        {!isOwnProfile && followTargetId && (
          <div className="flex items-center gap-2.5 shrink-0">
            {!isFollowing ? (
              <button
                type="button"
                onClick={() => toggleFollowUser(followTargetId)}
                className="w-full sm:w-auto min-h-[42px] px-5 py-2.5 bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[#009EC0] text-[#050B18] font-bold text-xs sm:text-sm rounded-[var(--tj-radius-sm,6px)] transition-colors inline-flex items-center justify-center gap-2 border-0 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 shrink-0" />
                <span>Follow</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => toggleFollowUser(followTargetId)}
                aria-label={`Unfollow ${displayName}`}
                className="w-full sm:w-auto min-h-[42px] px-5 py-2.5 bg-[var(--tj-color-surface-elevated,#111F36)] hover:bg-[var(--tj-color-surface-hover,#132B49)] text-[var(--tj-color-text-secondary,#C2C7CD)] font-semibold text-xs sm:text-sm rounded-[var(--tj-radius-sm,6px)] transition-colors inline-flex items-center justify-center gap-2 border-0 cursor-pointer"
              >
                <Check className="w-4 h-4 text-[var(--tj-color-brand-primary,#00B4D8)] shrink-0" />
                <span>Following</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Catalog & Community Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[var(--tj-color-surface-elevated,#111F36)] border-0 rounded-[var(--tj-radius-sm,6px)] p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--tj-color-text-muted,#7E8A9A)] uppercase tracking-wider">
            <Music className="w-3.5 h-3.5 text-[var(--tj-color-brand-primary,#00B4D8)]" />
            <span>Total Tracks</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-white font-mono tabular-nums">
            {totalTracks.toLocaleString()}
          </p>
        </div>

        <div className="bg-[var(--tj-color-surface-elevated,#111F36)] border-0 rounded-[var(--tj-radius-sm,6px)] p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--tj-color-text-muted,#7E8A9A)] uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-[var(--tj-color-brand-primary,#00B4D8)]" />
            <span>Followers</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-white font-mono tabular-nums">
            {formatCompactNumber(followersCount)}
          </p>
        </div>

        <div className="bg-[var(--tj-color-surface-elevated,#111F36)] border-0 rounded-[var(--tj-radius-sm,6px)] p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--tj-color-text-muted,#7E8A9A)] uppercase tracking-wider">
            <Disc3 className="w-3.5 h-3.5 text-[var(--tj-color-brand-primary,#00B4D8)]" />
            <span>NFT Editions</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-white font-mono tabular-nums">
            {totalNFTReleases.toLocaleString()}
          </p>
        </div>

        <div className="bg-[var(--tj-color-surface-elevated,#111F36)] border-0 rounded-[var(--tj-radius-sm,6px)] p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--tj-color-text-muted,#7E8A9A)] uppercase tracking-wider">
            <Headphones className="w-3.5 h-3.5 text-[var(--tj-color-brand-primary,#00B4D8)]" />
            <span>Total Streams</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-white font-mono tabular-nums">
            {formatCompactNumber(totalStreams)}
          </p>
        </div>
      </div>
    </section>
  );
};

export default NFTArtistSpotlight;
