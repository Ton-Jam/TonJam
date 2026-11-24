import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Disc3,
  ExternalLink,
  Globe,
  Headphones,
  MessageCircle,
  Music2,
  Pause,
  Play,
  Send,
  Share2,
  UserPlus,
} from "lucide-react";
import { Artist, Track } from "@/types";
import { useAudio } from "@/contexts/AudioContext";
import { getPlaceholderImage } from "@/lib/utils";
import LazyArtworkImage from "@/components/common/LazyArtworkImage";
import VerifiedArtistBadge from "@/components/common/VerifiedArtistBadge";

interface SpotlightEntry {
  artist: Artist;
  topTracks: Track[];
  totalStreams: number;
}

interface NormalizedSocialLink {
  key: string;
  label: string;
  href: string;
}

const formatCompactCount = (value: number): string => {
  if (!Number.isFinite(value) || value <= 0) return "0";
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return value.toLocaleString();
};

const formatTrackDuration = (seconds?: number): string => {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const normalizeSocialUrl = (
  platform: "x" | "telegram" | "instagram" | "spotify" | "youtube" | "discord" | "website",
  rawValue?: string
): string | null => {
  if (!rawValue) return null;
  const trimmed = rawValue.trim();
  if (!trimmed) return null;

  // Reject unsafe protocols
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const cleanHandle = trimmed.replace(/^@/, "").replace(/^\/+/, "");
  if (!cleanHandle) return null;

  switch (platform) {
    case "x":
      return cleanHandle.includes(".")
        ? `https://${cleanHandle}`
        : `https://x.com/${cleanHandle}`;
    case "telegram":
      return cleanHandle.includes(".")
        ? `https://${cleanHandle}`
        : `https://t.me/${cleanHandle}`;
    case "instagram":
      return cleanHandle.includes(".")
        ? `https://${cleanHandle}`
        : `https://instagram.com/${cleanHandle}`;
    case "spotify":
      return cleanHandle.includes(".")
        ? `https://${cleanHandle}`
        : `https://open.spotify.com/artist/${cleanHandle}`;
    case "youtube":
      return cleanHandle.includes(".")
        ? `https://${cleanHandle}`
        : `https://youtube.com/@${cleanHandle}`;
    case "discord":
      return cleanHandle.includes(".")
        ? `https://${cleanHandle}`
        : `https://discord.gg/${cleanHandle}`;
    case "website":
      return `https://${trimmed.replace(/^\/+/, "")}`;
    default:
      return null;
  }
};

const extractArtistSocialLinks = (artist: Artist): NormalizedSocialLink[] => {
  const socials = artist.socials as
    | (NonNullable<Artist["socials"]> & {
        twitter?: string;
        youtube?: string;
        discord?: string;
      })
    | undefined;

  if (!socials) return [];

  const candidates: Array<{
    key: string;
    label: string;
    href: string | null;
  }> = [
    {
      key: "x",
      label: "X",
      href: normalizeSocialUrl("x", socials.x || socials.twitter),
    },
    {
      key: "telegram",
      label: "Telegram",
      href: normalizeSocialUrl("telegram", socials.telegram),
    },
    {
      key: "instagram",
      label: "Instagram",
      href: normalizeSocialUrl("instagram", socials.instagram),
    },
    {
      key: "spotify",
      label: "Spotify",
      href: normalizeSocialUrl("spotify", socials.spotify),
    },
    {
      key: "youtube",
      label: "YouTube",
      href: normalizeSocialUrl("youtube", socials.youtube),
    },
    {
      key: "discord",
      label: "Discord",
      href: normalizeSocialUrl("discord", socials.discord),
    },
    {
      key: "website",
      label: "Website",
      href: normalizeSocialUrl("website", socials.website),
    },
  ];

  return candidates.filter((item): item is NormalizedSocialLink =>
    Boolean(item.href)
  );
};

const renderSocialIcon = (key: string) => {
  switch (key) {
    case "telegram":
      return <Send className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />;
    case "spotify":
      return <Music2 className="w-3.5 h-3.5 text-[#1DB954] shrink-0" />;
    case "discord":
      return <MessageCircle className="w-3.5 h-3.5 text-[#818CF8] shrink-0" />;
    case "x":
      return <Share2 className="w-3.5 h-3.5 text-slate-200 shrink-0" />;
    case "website":
      return <Globe className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />;
    default:
      return <ExternalLink className="w-3.5 h-3.5 text-slate-300 shrink-0" />;
  }
};

export const ArtistSpotlightSection: React.FC = () => {
  const navigate = useNavigate();
  const {
    artists = [],
    allTracks = [],
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    followedUserIds = [],
    toggleFollowUser,
    userProfile,
  } = useAudio();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const spotlightEntries = useMemo<SpotlightEntry[]>(() => {
    const trackList = Array.isArray(allTracks) ? allTracks : [];
    const artistList = Array.isArray(artists) ? artists : [];

    // If explicit artists exist in context, enrich each with their top tracks;
    // otherwise derive artist entries from the catalog tracks so the spotlight still reflects real tracks.
    const candidateArtists: Artist[] =
      artistList.length > 0
        ? artistList
        : (() => {
            const byId = new Map<string, Artist>();
            for (const track of trackList) {
              const key =
                track.artistId ||
                track.artist?.trim().toLowerCase() ||
                track.id;
              if (!key || byId.has(key)) continue;
              byId.set(key, {
                uid: track.artistId || key,
                name: track.artist || "Independent Artist",
                avatarUrl:
                  track.artistAvatar ||
                  track.coverUrl ||
                  getPlaceholderImage(`artist-${key}`),
                followers: 0,
                verified: Boolean(track.artistVerified),
                isVerifiedArtist: Boolean(track.artistVerified),
                genre: track.genre && track.genre !== "Unknown" ? track.genre : undefined,
              });
            }
            return Array.from(byId.values());
          })();

    const enriched: SpotlightEntry[] = candidateArtists.map((artist) => {
      const normalizedName = (artist.name || "").trim().toLowerCase();
      const matchingTracks = trackList.filter((track) => {
        if (artist.uid && track.artistId === artist.uid) return true;
        return (
          Boolean(normalizedName) &&
          track.artist?.trim().toLowerCase() === normalizedName
        );
      });

      const sortedTracks = [...matchingTracks].sort(
        (a, b) =>
          (b.playCount || b.streams || 0) - (a.playCount || a.streams || 0)
      );

      const computedStreams = matchingTracks.reduce(
        (sum, t) => sum + (t.playCount || t.streams || 0),
        0
      );

      return {
        artist,
        topTracks: sortedTracks.slice(0, 3),
        totalStreams: Math.max(artist.totalStreams || 0, computedStreams),
      };
    });

    // Rank artists by verified status, catalog presence, social completeness, followers, and streams
    return enriched
      .sort((a, b) => {
        const scoreA =
          (a.artist.verified || a.artist.isVerifiedArtist ? 100_000 : 0) +
          (a.topTracks.length > 0 ? 10_000 : 0) +
          extractArtistSocialLinks(a.artist).length * 500 +
          (a.artist.followers || 0) +
          a.totalStreams * 0.1;
        const scoreB =
          (b.artist.verified || b.artist.isVerifiedArtist ? 100_000 : 0) +
          (b.topTracks.length > 0 ? 10_000 : 0) +
          extractArtistSocialLinks(b.artist).length * 500 +
          (b.artist.followers || 0) +
          b.totalStreams * 0.1;
        return scoreB - scoreA;
      })
      .slice(0, 5);
  }, [artists, allTracks]);

  // Keep active index bounded if data refreshes
  useEffect(() => {
    if (activeIndex >= spotlightEntries.length && spotlightEntries.length > 0) {
      setActiveIndex(0);
    }
  }, [activeIndex, spotlightEntries.length]);

  const handlePrev = useCallback(() => {
    if (spotlightEntries.length <= 1) return;
    setActiveIndex(
      (prev) => (prev - 1 + spotlightEntries.length) % spotlightEntries.length
    );
  }, [spotlightEntries.length]);

  const handleNext = useCallback(() => {
    if (spotlightEntries.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % spotlightEntries.length);
  }, [spotlightEntries.length]);

  // Gentle auto-rotation every 8s when multiple artists exist and user isn't interacting
  useEffect(() => {
    if (isPaused || spotlightEntries.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 8000);
    return () => clearInterval(timer);
  }, [isPaused, spotlightEntries.length, handleNext]);

  if (spotlightEntries.length === 0) {
    return null;
  }

  const currentEntry = spotlightEntries[activeIndex] || spotlightEntries[0];
  const { artist, topTracks, totalStreams } = currentEntry;

  const isVerified = Boolean(artist.verified || artist.isVerifiedArtist);
  const socialLinks = extractArtistSocialLinks(artist);
  const artistRouteId =
    artist.uid ||
    artist.name.toLowerCase().trim().replace(/\s+/g, "-");
  const isOwnProfile = Boolean(
    userProfile?.uid && artist.uid && userProfile.uid === artist.uid
  );
  const isFollowing = Boolean(
    artist.uid && followedUserIds.includes(artist.uid)
  );

  const backdropSrc =
    artist.bannerUrl ||
    artist.bannerImageUrl ||
    artist.coverPhoto ||
    topTracks[0]?.coverUrl ||
    artist.avatarUrl ||
    getPlaceholderImage(`spotlight-${artist.uid || artist.name}`);

  const avatarSrc =
    artist.avatarUrl ||
    topTracks[0]?.artistAvatar ||
    topTracks[0]?.coverUrl ||
    getPlaceholderImage(`artist-${artist.uid || artist.name}`);

  const listenersOrFollowers =
    artist.monthlyListeners && artist.monthlyListeners > 0
      ? `${formatCompactCount(artist.monthlyListeners)} monthly listeners`
      : `${formatCompactCount(artist.followers || 0)} followers`;

  const metaParts = [
    artist.username ? `@${artist.username.replace(/^@/, "")}` : null,
    artist.genre && artist.genre !== "Unknown" ? artist.genre : null,
    listenersOrFollowers,
  ].filter(Boolean) as string[];

  return (
    <section
      aria-labelledby="home-artist-spotlight-heading"
      className="w-full px-3 space-y-3 text-left select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Section Header & Carousel Controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2
            id="home-artist-spotlight-heading"
            className="text-section-title font-bold text-white tracking-tight"
          >
            Artist Spotlight
          </h2>
          <p className="text-xs text-[#94A3B8]">
            Featured creator, top releases & official channels
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {spotlightEntries.length > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous spotlight artist"
                className="min-h-[40px] min-w-[40px] rounded-[8px] bg-[#111F36] hover:bg-[#132B49] text-slate-200 hover:text-white flex items-center justify-center transition-colors border-0 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next spotlight artist"
                className="min-h-[40px] min-w-[40px] rounded-[8px] bg-[#111F36] hover:bg-[#132B49] text-slate-200 hover:text-white flex items-center justify-center transition-colors border-0 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate("/artists")}
            className="min-h-[40px] px-2.5 text-xs font-semibold text-[#38BDF8] hover:text-white inline-flex items-center gap-1 transition-colors border-0 bg-transparent cursor-pointer"
          >
            <span>All Artists</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Spotlight Card / Carousel Slide */}
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Artist Spotlight Carousel"
        className="relative w-full rounded-[8px] bg-[var(--tj-color-surface-default,#0D1628)] overflow-hidden border-0"
      >
        {/* Subtle Background Artwork Tint */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <LazyArtworkImage
            src={backdropSrc}
            fallbackSrc={getPlaceholderImage(`spotlight-${artist.uid}`)}
            alt=""
            className="w-full h-full object-cover opacity-20 filter blur-md scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0D1628] via-[#0D1628]/90 to-[#0B1323]/95" />
        </div>

        <motion.div
          key={artist.uid || artist.name}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="relative z-10 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start"
        >
            {/* Left Column: Artist Profile, Bio, Actions & Social Links */}
            <div className="lg:col-span-7 space-y-4 min-w-0">
              {/* Profile Identity */}
              <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
                <button
                  type="button"
                  onClick={() => navigate(`/artist/${artistRouteId}`)}
                  aria-label={`Open ${artist.name} profile`}
                  className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-[8px] overflow-hidden shrink-0 bg-[#111F36] border-0 p-0 cursor-pointer group"
                >
                  <LazyArtworkImage
                    src={avatarSrc}
                    fallbackSrc={getPlaceholderImage(`artist-${artist.name}`)}
                    alt={artist.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </button>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => navigate(`/artist/${artistRouteId}`)}
                      className="text-left text-lg sm:text-xl font-extrabold text-white hover:text-[#38BDF8] transition-colors truncate bg-transparent border-0 p-0 cursor-pointer"
                    >
                      {artist.name}
                    </button>
                    <VerifiedArtistBadge
                      isVerified={isVerified}
                      artistName={artist.name}
                      artistId={artist.uid}
                      size="sm"
                    />
                  </div>

                  {/* Unboxed Metadata Row */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#C2C7CD] tabular-nums">
                    {metaParts.map((part, idx) => (
                      <React.Fragment key={part}>
                        {idx > 0 && (
                          <span aria-hidden="true" className="text-[#64748B]">
                            ·
                          </span>
                        )}
                        <span className="truncate">{part}</span>
                      </React.Fragment>
                    ))}
                    {totalStreams > 0 && (
                      <>
                        <span aria-hidden="true" className="text-[#64748B]">
                          ·
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Headphones className="w-3 h-3 text-[#38BDF8]" />
                          {formatCompactCount(totalStreams)} streams
                        </span>
                      </>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-[#C2C7CD] leading-relaxed line-clamp-2 pt-1 max-w-xl">
                    {artist.bio?.trim()
                      ? artist.bio
                      : `Independent TON music creator sharing ${
                          artist.genre && artist.genre !== "Unknown"
                            ? `${artist.genre} `
                            : ""
                        }releases and digital editions on TonJam.`}
                  </p>
                </div>
              </div>

              {/* Primary Profile Actions */}
              <div className="flex flex-wrap items-center gap-2.5">
                {!isOwnProfile && artist.uid && (
                  <button
                    type="button"
                    onClick={() => toggleFollowUser(artist.uid)}
                    aria-label={
                      isFollowing
                        ? `Following ${artist.name}`
                        : `Follow ${artist.name}`
                    }
                    className={`min-h-[42px] px-4 py-2 rounded-[8px] text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-colors border-0 cursor-pointer ${
                      isFollowing
                        ? "bg-[#111F36] hover:bg-[#132B49] text-slate-200"
                        : "bg-[#00B4D8] hover:bg-[#21C2E8] text-[#050B18]"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <Check className="w-4 h-4 text-[#38BDF8]" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => navigate(`/artist/${artistRouteId}`)}
                  className="min-h-[42px] px-4 py-2 rounded-[8px] bg-[#111F36] hover:bg-[#132B49] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-colors border-0 cursor-pointer"
                >
                  <span>View Profile</span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
              </div>

              {/* Artist Social Links */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8] block">
                  Socials & Links
                </span>
                {socialLinks.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {socialLinks.map((social) => (
                      <a
                        key={social.key}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${artist.name} on ${social.label}`}
                        className="min-h-[38px] px-3 py-1.5 rounded-[8px] bg-[#111F36] hover:bg-[#132B49] text-xs font-semibold text-slate-200 hover:text-white inline-flex items-center gap-1.5 transition-colors no-underline"
                      >
                        {renderSocialIcon(social.key)}
                        <span>{social.label}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/artist/${artistRouteId}`)}
                      className="min-h-[38px] px-3 py-1.5 rounded-[8px] bg-[#111F36] hover:bg-[#132B49] text-xs font-semibold text-slate-200 hover:text-white inline-flex items-center gap-1.5 transition-colors border-0 cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span>TonJam Artist Page</span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Top Tracks */}
            <div className="lg:col-span-5 space-y-2.5 min-w-0 w-full">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                  Top Tracks
                </h3>
                <span className="text-xs text-[#94A3B8] tabular-nums">
                  {topTracks.length}{" "}
                  {topTracks.length === 1 ? "release" : "releases"}
                </span>
              </div>

              {topTracks.length > 0 ? (
                <div className="space-y-2">
                  {topTracks.map((track, idx) => {
                    const isCurrent = currentTrack?.id === track.id;
                    const isTrackPlaying = isCurrent && isPlaying;
                    const plays = track.playCount || track.streams || 0;

                    return (
                      <div
                        key={track.id}
                        className="min-h-[56px] p-2.5 rounded-[8px] bg-[#111F36] hover:bg-[#132B49] transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="w-5 text-center text-xs font-bold text-[#94A3B8] tabular-nums shrink-0">
                            {idx + 1}
                          </span>

                          <button
                            type="button"
                            onClick={() => navigate(`/track/${track.id}`)}
                            aria-label={`Open track ${track.title}`}
                            className="w-10 h-10 rounded-[6px] overflow-hidden bg-[#0B0F17] shrink-0 border-0 p-0 cursor-pointer"
                          >
                            <LazyArtworkImage
                              src={
                                track.coverUrl ||
                                getPlaceholderImage(`track-${track.id}`)
                              }
                              fallbackSrc={getPlaceholderImage(
                                `track-${track.id}`
                              )}
                              alt={track.title}
                              className="w-full h-full object-cover"
                            />
                          </button>

                          <div className="min-w-0 flex-1 text-left">
                            <button
                              type="button"
                              onClick={() => navigate(`/track/${track.id}`)}
                              className={`block w-full text-left text-xs sm:text-sm font-bold truncate bg-transparent border-0 p-0 cursor-pointer transition-colors ${
                                isCurrent
                                  ? "text-[#38BDF8]"
                                  : "text-white hover:text-[#38BDF8]"
                              }`}
                            >
                              {track.title}
                            </button>
                            <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8] tabular-nums truncate">
                              {track.genre && track.genre !== "Unknown" && (
                                <>
                                  <span className="truncate">{track.genre}</span>
                                  <span aria-hidden="true">·</span>
                                </>
                              )}
                              <span>
                                {plays > 0
                                  ? `${formatCompactCount(plays)} plays`
                                  : formatTrackDuration(track.duration)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            isCurrent ? togglePlay() : playTrack(track)
                          }
                          aria-label={
                            isTrackPlaying
                              ? `Pause ${track.title}`
                              : `Play ${track.title}`
                          }
                          className={`min-h-[40px] min-w-[40px] rounded-full flex items-center justify-center transition-transform active:scale-95 border-0 cursor-pointer shrink-0 ${
                            isTrackPlaying
                              ? "bg-[#00B4D8] text-[#050B18]"
                              : "bg-[#0D1628] hover:bg-[#00B4D8] text-white hover:text-[#050B18]"
                          }`}
                        >
                          {isTrackPlaying ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-[8px] bg-[#111F36] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Disc3 className="w-5 h-5 text-[#38BDF8] shrink-0" />
                    <p className="text-xs text-[#C2C7CD]">
                      Explore {artist.name}’s releases and NFT editions on their profile.
                    </p>
                  </div>
                </div>
              )}
            </div>
        </motion.div>

        {/* Carousel Artist Selector Strip (when multiple artists exist) */}
        {spotlightEntries.length > 1 && (
          <div className="relative z-10 px-4 sm:px-6 pb-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {spotlightEntries.map((entry, idx) => {
                const selected = idx === activeIndex;
                return (
                  <button
                    key={entry.artist.uid || entry.artist.name}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Spotlight ${entry.artist.name}`}
                    aria-pressed={selected}
                    className={`min-h-[36px] px-2.5 py-1 rounded-[8px] inline-flex items-center gap-2 text-xs font-semibold transition-colors border-0 cursor-pointer shrink-0 ${
                      selected
                        ? "bg-[#00B4D8] text-[#050B18]"
                        : "bg-[#111F36] hover:bg-[#132B49] text-slate-300 hover:text-white"
                    }`}
                  >
                    <span className="w-5 h-5 rounded-[4px] overflow-hidden shrink-0 bg-[#0B0F17]">
                      <LazyArtworkImage
                        src={
                          entry.artist.avatarUrl ||
                          getPlaceholderImage(`artist-${entry.artist.name}`)
                        }
                        fallbackSrc={getPlaceholderImage(
                          `artist-${entry.artist.name}`
                        )}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </span>
                    <span className="max-w-[110px] truncate">
                      {entry.artist.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <span className="text-[11px] font-medium text-[#94A3B8] tabular-nums shrink-0">
              {activeIndex + 1} / {spotlightEntries.length}
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

export default ArtistSpotlightSection;
