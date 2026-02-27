import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Heart, PlusCircle, Gem, Share2, VolumeX, Volume1, Volume2, Shuffle, SkipBack, Play, Pause, SkipForward, Repeat } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { useNavigate } from "react-router-dom";
import { MOCK_ARTISTS, APP_LOGO } from "@/constants";
import MintModal from "@/components/MintModal";

const AudioVisualizer: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { analyser } = useAudio();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const bars = 32;
    const heights = Array(bars).fill(2);
    const targets = Array(bars).fill(2);
    let phase = 0;

    const dataArray = analyser
      ? new Uint8Array(analyser.frequencyBinCount)
      : null;

    const draw = () => {
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width / bars;
      phase += 0.05;

      if (analyser && isPlaying && dataArray) {
        analyser.getByteFrequencyData(dataArray);
      }

      for (let i = 0; i < bars; i++) {
        if (isPlaying) {
          if (analyser && dataArray) {
            const dataIndex = Math.floor(i * (dataArray.length / bars) * 0.5);
            const value = dataArray[dataIndex] || 0;
            targets[i] = 2 + (value / 255) * (canvas.height * 0.6);
          } else {
            const wave = Math.sin(phase + i * 0.2) * 0.5 + 0.5;
            if (Math.random() > 0.6) {
              targets[i] =
                2 +
                wave * (canvas.height * 0.3) +
                Math.random() * (canvas.height * 0.2);
            }
          }
        } else {
          targets[i] = 2;
        }

        heights[i] += (targets[i] - heights[i]) * 0.2;
        const h = Math.max(2, heights[i]);
        const x = i * width;
        const y = canvas.height - h;

        ctx.fillStyle = "#3b82f6";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#3b82f6";
        ctx.beginPath();
        const barWidth = Math.max(2, width - 3);
        ctx.roundRect(x + (width - barWidth) / 2, y, barWidth, h, [3, 3, 0, 0]);
        ctx.fill();
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, analyser]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full max-w-[240px] h-[30px] opacity-80 mix-blend-screen"
    />
  );
};

const FullAudioPlayer: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    progress,
    seek,
    nextTrack,
    prevTrack,
    setFullPlayerOpen,
    isShuffle,
    isRepeat,
    toggleShuffle,
    toggleRepeat,
    addNotification,
    volume,
    isMuted,
    setVolume,
    toggleMute,
    likedTrackIds,
    toggleLikeTrack,
    userProfile,
    setTrackToAddToPlaylist,
  } = useAudio();
  const [view, setView] = useState<"cover" | "lyrics">("cover");
  const [showVolume, setShowVolume] = useState(false);
  const [showMintModal, setShowMintModal] = useState(false);

  const initialVolumeRef = useRef(volume);

  useEffect(() => {
    if (volume !== initialVolumeRef.current) {
      setShowVolume(true);
      initialVolumeRef.current = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (showVolume) {
      const timer = setTimeout(() => {
        setShowVolume(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showVolume]);

  const isLiked = currentTrack
    ? likedTrackIds.includes(currentTrack.id)
    : false;
  const artistData = MOCK_ARTISTS.find((a) => a.id === currentTrack?.artistId);

  if (!currentTrack) return null;

  const handleArtistClick = () => {
    setFullPlayerOpen(false);
    navigate(`/artist/${currentTrack.artistId}`);
  };

  const handleLikeToggle = () => {
    if (currentTrack) {
      toggleLikeTrack(currentTrack.id);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: currentTrack.title,
          text: `Check out ${currentTrack.title} by ${currentTrack.artist} on TonJam!`,
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      addNotification(
        "Sharing protocol initiated. Link copied to clipboard.",
        "success",
      );
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleAddToPlaylist = () => {
    if (currentTrack) {
      setTrackToAddToPlaylist(currentTrack);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-3xl animate-in slide-in-from-bottom duration-500 overflow-y-auto overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <img
          src={currentTrack.coverUrl}
          className="w-full h-full object-cover blur-[150px] opacity-20 scale-150 transition-all duration-[3s]"
          alt=""
        />
        <div className="absolute inset-0 "></div>
      </div>

      <div className="relative z-10 min-h-full flex flex-col p-6 md:p-8 max-w-xl mx-auto w-full pb-32">
        <header className="flex items-center justify-between mb-8 flex-shrink-0">
          <button
            onClick={() => setFullPlayerOpen(false)}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all hover:bg-white/5"
          >
            <ChevronDown className="h-6 w-6" />
          </button>
          <div className="flex gap-2 bg-white/5 p-1.5 rounded-full">
            <button
              onClick={() => setView("cover")}
              className={`px-6 py-2 rounded-full text-[14px] font-bold uppercase tracking-widest transition-all ${view === "cover" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-white/60 hover:text-white"}`}
            >
              Player
            </button>
            <button
              onClick={() => setView("lyrics")}
              className={`px-6 py-2 rounded-full text-[14px] font-bold uppercase tracking-widest transition-all ${view === "lyrics" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-white/60 hover:text-white"}`}
            >
              Lyrics
            </button>
          </div>
          <button
            onClick={handleLikeToggle}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 ${isLiked ? "text-red-500" : "text-white/60 hover:text-white"}`}
          >
            <Heart className={`h-6 w-6 ${isLiked ? "fill-current" : ""}`} />
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center w-full pb-12">
          {view === "cover" ? (
            <div className="relative w-full aspect-square rounded-[10px] overflow-hidden shadow-2xl mb-10 group">
              <img
                src={currentTrack.coverUrl}
                className={`w-full h-full object-cover transition-transform duration-[15s] ease-linear ${isPlaying ? "scale-110" : "scale-100"}`}
                alt={currentTrack.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
            </div>
          ) : (
            <div className="w-full h-full max-h-[450px] overflow-y-auto no-scrollbar py-10 px-4 space-y-8">
              <p className="text-xl font-bold text-white uppercase tracking-tighter leading-tight text-left">
                Frequencies locked, we're forging the soul
              </p>
              <p className="text-xl font-bold text-blue-400 uppercase tracking-tighter leading-tight text-left">
                Digital diamonds in a decentralized bowl
              </p>
              <p className="text-xl font-bold text-white/20 uppercase tracking-tighter leading-tight text-left">
                TON blockchain rhythm, heart under control
              </p>
            </div>
          )}

          <div className="w-full text-center mb-6">
            <h2 className="text-[18px] font-bold mb-2 tracking-tighter uppercase text-white leading-none truncate px-4">
              {currentTrack.title}
            </h2>
            <p
              onClick={handleArtistClick}
              className="text-blue-500 font-bold text-[14px] tracking-widest uppercase cursor-pointer hover:text-white transition-colors"
            >
              {currentTrack.artist}
            </p>
          </div>

          <div className="w-full flex justify-center mb-6">
            <AudioVisualizer isPlaying={isPlaying} />
          </div>

          <div className="w-full max-w-[420px] mb-12 space-y-8">
            {/* Row 1: Utility Icons */}
            <div className="flex items-center justify-center gap-8">
              <button
                onClick={handleAddToPlaylist}
                className="text-xl text-white/20 hover:text-white transition-all p-2"
                title="Add to Playlist"
              >
                <PlusCircle className="h-6 w-6" />
              </button>
              <button
                onClick={() => setShowMintModal(true)}
                className="text-xl text-white/20 hover:text-white transition-all p-2"
                title="Mint NFT"
              >
                <Gem className="h-6 w-6" />
              </button>
              <button
                onClick={handleShare}
                className="text-xl text-white/20 hover:text-white transition-all p-2"
                title="Share"
              >
                <Share2 className="h-6 w-6" />
              </button>
              <div className="relative">
                <div
                  className={`text-xl transition-all p-2 cursor-pointer ${showVolume ? "text-blue-400" : "text-white/20 hover:text-white"}`}
                  onClick={() => setShowVolume(!showVolume)}
                  title="Volume"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-6 w-6 text-red-500/60" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="h-6 w-6" />
                  ) : (
                    <Volume2 className="h-6 w-6" />
                  )}
                </div>
                {showVolume && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-[#111] p-5 rounded-[10px] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
                    <div
                      className="h-32 w-2 bg-white/10 rounded-full relative cursor-pointer group/vslider"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const y = e.clientY - rect.top;
                        const newVolume = Math.max(
                          0,
                          Math.min(1, 1 - y / rect.height),
                        );
                        setVolume(newVolume);
                      }}
                    >
                      <div
                        className="absolute bottom-0 left-0 w-full bg-blue-500 rounded-full transition-all shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        style={{ height: `${(isMuted ? 0 : volume) * 100}%` }}
                      >
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg scale-0 group-hover/vslider:scale-100 transition-transform"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Play Controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={toggleShuffle}
                className={`text-lg transition-all p-2 ${isShuffle ? "text-blue-400" : "text-white/20 hover:text-white"}`}
                title="Shuffle"
              >
                <Shuffle className="h-5 w-5" />
              </button>
              <button
                onClick={prevTrack}
                className="text-2xl text-white/40 hover:text-white transition-all hover:scale-125 active:scale-90 p-2"
              >
                <SkipBack className="h-8 w-8 fill-current" />
              </button>
              <button
                onClick={togglePlay}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-blue-500"
              >
                {isPlaying ? (
                  <Pause className="h-10 w-10 md:h-12 md:w-12 fill-current" />
                ) : (
                  <Play className="h-10 w-10 md:h-12 md:w-12 fill-current" />
                )}
              </button>
              <button
                onClick={nextTrack}
                className="text-2xl text-white/40 hover:text-white transition-all hover:scale-125 active:scale-90 p-2"
              >
                <SkipForward className="h-8 w-8 fill-current" />
              </button>
              <button
                onClick={toggleRepeat}
                className={`text-lg transition-all p-2 ${isRepeat ? "text-blue-400" : "text-white/20 hover:text-white"}`}
                title="Repeat"
              >
                <Repeat className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Track Details Section */}
        <div className="w-full mt-12 pt-12 space-y-10">
          <div className="space-y-4">
            <h3 className="text-[14px] font-bold text-white/60 uppercase tracking-[0.4em]">
              Track Info
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-white/60 uppercase tracking-widest">
                Release Date
              </span>
              <span className="text-[12px] font-bold text-white uppercase tracking-tight">
                {currentTrack.releaseDate || "2023-10-01"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-white/60 uppercase tracking-widest">
                Genre
              </span>
              <span className="text-[12px] font-bold text-blue-500 uppercase tracking-tight">
                {currentTrack.genre}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[14px] font-bold text-white/60 uppercase tracking-[0.4em]">
              Artist Info
            </h3>
            <div
              className="flex items-center gap-4 mb-4 cursor-pointer group/dossier"
              onClick={handleArtistClick}
            >
              <img
                src={artistData?.avatarUrl}
                className="w-12 h-12 rounded-full transition-all"
                alt=""
              />
              <div>
                <h4 className="text-[14px] font-bold text-white uppercase tracking-tight group-hover/dossier:text-blue-400 transition-colors">
                  {currentTrack.artist}
                </h4>
                <p className="text-[12px] font-bold text-blue-500 uppercase tracking-widest">
                  {artistData?.followers ? artistData.followers.toLocaleString() : 0} Followers
                </p>
              </div>
            </div>
            <p className="text-[16px] text-white/60 leading-relaxed font-medium italic">
              {artistData?.bio ||
                "Digital pioneer forging new sonic landscapes in the TON ecosystem."}
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-[14px] font-bold text-white/60 uppercase tracking-[0.4em]">
              Track Comments
            </h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <img
                  src={userProfile.avatar}
                  className="w-10 h-10 rounded-full"
                  alt=""
                />
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="w-full bg-white/5 rounded-[10px] py-3 px-5 text-[14px] text-white outline-none transition-all"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 text-[14px] font-bold uppercase tracking-widest">
                    Post
                  </button>
                </div>
              </div>

              <div className="space-y-6 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                {[
                  {
                    id: 1,
                    user: "Neon Voyager",
                    avatar: "https://picsum.photos/100/100?random=21",
                    text: "This track is absolutely mind-blowing! The bass is perfect.",
                    time: "2h ago",
                  },
                  {
                    id: 2,
                    user: "Sarah Jenkins",
                    avatar: "https://picsum.photos/100/100?random=32",
                    text: "Love the atmospheric vibes here. Great work!",
                    time: "5h ago",
                  },
                  {
                    id: 3,
                    user: "CryptoPioneer",
                    avatar: "https://picsum.photos/100/100?random=50",
                    text: "Added this immediately. A future classic.",
                    time: "1d ago",
                  },
                ].map((comment) => (
                  <div key={comment.id} className="flex gap-4 group">
                    <img
                      src={comment.avatar}
                      className="w-10 h-10 rounded-full"
                      alt=""
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[14px] font-bold text-white uppercase tracking-tight">
                          {comment.user}
                        </span>
                        <span className="text-[12px] font-bold text-white/60 uppercase tracking-widest">
                          {comment.time}
                        </span>
                      </div>
                      <p className="text-[16px] text-white/90 leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showMintModal && <MintModal onClose={() => setShowMintModal(false)} />}

      {/* Bottom Progress Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-blue-500/10 px-4 md:px-8 py-4 flex items-center gap-4">
        <img
          src={APP_LOGO}
          alt="TonJam"
          className={`w-10 h-10 rounded-full ${isPlaying ? "animate-spin" : ""}`}
          style={{ animationDuration: "4s" }}
        />
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between text-[12px] font-bold text-white/60 tracking-widest uppercase px-1">
            <span>
              {Math.floor(((progress / 100) * currentTrack.duration) / 60)}:
              {String(
                Math.floor(((progress / 100) * currentTrack.duration) % 60),
              ).padStart(2, "0")}
            </span>
            <span>
              {Math.floor(currentTrack.duration / 60)}:
              {String(currentTrack.duration % 60).padStart(2, "0")}
            </span>
          </div>
          <div className="relative w-full h-[2px] bg-white/5 rounded-full overflow-hidden group cursor-pointer">
            <input
              type="range"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              value={progress}
              onChange={(e) => seek(Number(e.target.value))}
            />
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.5)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullAudioPlayer;
