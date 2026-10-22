import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import { Play, Pause, Disc, Sparkles, Volume2, ExternalLink, ShieldCheck, Flame, Music, Layers } from 'lucide-react';
import { NFTItem, Track } from '@/types';
import { useAudio } from '@/contexts/AudioContext';
import { getPlaceholderImage } from '@/lib/utils';
import { TON_LOGO } from '@/constants';
import { useNftColorPalette } from '@/hooks/useNftColorPalette';

interface MusicNftCardProps {
  nft: NFTItem;
  onPlayFull?: (nft: NFTItem) => void;
  isCurrentlyPlayingGlobal?: boolean;
  onHoverNft?: (nft: NFTItem | null) => void;
}

export const MusicNftCard: React.FC<MusicNftCardProps> = ({
  nft,
  onPlayFull,
  isCurrentlyPlayingGlobal = false,
  onHoverNft,
}) => {
  const navigate = useNavigate();
  const { playTrack, allTracks } = useAudio();
  const { primaryColor, secondaryColor } = useNftColorPalette(nft);

  const [isHovered, setIsHovered] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [volume, setVolume] = useState(0.7);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Resolve audio source: attached audioUrl or match from trackId or default preview audio
  const audioSource = useMemo(() => {
    if (nft.audioUrl) return nft.audioUrl;
    const matchedTrack = allTracks.find(
      (t) => t.id === nft.trackId || t.songId === nft.trackId || t.title.toLowerCase() === nft.title.toLowerCase()
    );
    if (matchedTrack?.audioUrl) return matchedTrack.audioUrl;
    return 'https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3';
  }, [nft, allTracks]);

  // Audio setup
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = audioSource;
    audio.volume = 0;
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(Math.min(audio.duration, 45)); // Preview up to 45s
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.currentTime >= 45) {
        audio.currentTime = 0;
      }
    };

    const handleEnded = () => {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.src = '';
    };
  }, [audioSource]);

  // Handle hover start: smooth fade in audio preview
  const handleMouseEnter = () => {
    setIsHovered(true);
    onHoverNft?.(nft);
    if (!audioRef.current) return;

    const audio = audioRef.current;
    audio.currentTime = 0;
    audio.volume = 0.05;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlayingPreview(true);
          // Smooth volume ramp
          let currentVol = 0.05;
          const targetVol = volume;
          const ramp = setInterval(() => {
            currentVol = Math.min(targetVol, currentVol + 0.1);
            if (audioRef.current) audioRef.current.volume = currentVol;
            if (currentVol >= targetVol) clearInterval(ramp);
          }, 30);
        })
        .catch(() => {
          // Autoplay policy fallback: silent preview state
          setIsPlayingPreview(false);
        });
    }
  };

  // Handle hover leave: smooth fade out & pause
  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPlayingPreview(false);
    onHoverNft?.(null);

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    if (!audioRef.current) return;
    const audio = audioRef.current;
    let currentVol = audio.volume;

    const rampDown = setInterval(() => {
      currentVol = Math.max(0, currentVol - 0.15);
      if (audioRef.current) audioRef.current.volume = currentVol;
      if (currentVol <= 0) {
        clearInterval(rampDown);
        audio.pause();
        audio.currentTime = 0;
        setCurrentTime(0);
      }
    }, 25);
  };

  // Handle mouse move for interactive D3 modulation & scrubbing
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setMousePos({ x, y });
  };

  // Click on waveform to scrub preview
  const handleScrubClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!audioRef.current || !cardRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = ratio * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Full playback action in global TonJam player
  const handleFullPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlayingPreview(false);

    if (onPlayFull) {
      onPlayFull(nft);
      return;
    }

    const matchedTrack = allTracks.find((t) => t.id === nft.trackId || t.songId === nft.trackId);
    playTrack({
      id: nft.id,
      songId: nft.trackId || nft.id,
      title: nft.title,
      artist: nft.artist || nft.creator || 'TonJam Artist',
      artistId: nft.artistId || '',
      audioUrl: audioSource,
      coverUrl: nft.imageUrl || nft.coverUrl || getPlaceholderImage(`nft-${nft.id}`),
      duration: duration || 210,
      isNFT: true,
      nftId: nft.id,
      price: nft.price || '2.5',
      genre: (nft.traits?.find((t) => t.trait_type.toLowerCase() === 'genre')?.value as string) || 'Electronic',
      rarity: nft.rarity || 'Rare',
    } as Track);
  };

  // Navigate to NFT detail
  const handleCardClick = () => {
    navigate(`/nft/${nft.id}`);
  };

  // ----------------------------------------------------
  // D3-INSPIRED DYNAMIC VISUALIZATION ENGINE
  // ----------------------------------------------------
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 280;
    const height = 90;
    const numBars = 28;

    svg.selectAll('*').remove();

    // Defs for gradients & filters
    const defs = svg.append('defs');

    // Linear gradient for harmonic wave
    const waveGradient = defs
      .append('linearGradient')
      .attr('id', `d3-wave-grad-${nft.id}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    waveGradient.append('stop').attr('offset', '0%').attr('stop-color', '#00F0FF').attr('stop-opacity', 0.9);
    waveGradient.append('stop').attr('offset', '50%').attr('stop-color', '#0088CC').attr('stop-opacity', 0.95);
    waveGradient.append('stop').attr('offset', '100%').attr('stop-color', '#7B2CBF').attr('stop-opacity', 0.9);

    // Area fill gradient
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', `d3-area-grad-${nft.id}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient.append('stop').attr('offset', '0%').attr('stop-color', '#00F0FF').attr('stop-opacity', 0.35);
    areaGradient.append('stop').attr('offset', '100%').attr('stop-color', '#0052FF').attr('stop-opacity', 0.0);

    // Glow filter
    const filter = defs.append('filter').attr('id', `d3-glow-${nft.id}`);
    filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Groups
    const areaPath = svg.append('path').attr('fill', `url(#d3-area-grad-${nft.id})`);
    const wavePath = svg
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', `url(#d3-wave-grad-${nft.id})`)
      .attr('stroke-width', 2.5)
      .attr('filter', `url(#d3-glow-${nft.id})`);

    // Bars group
    const barsGroup = svg.append('g').attr('class', 'd3-bars');
    const bars = barsGroup
      .selectAll('rect')
      .data(d3.range(numBars))
      .enter()
      .append('rect')
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('fill', '#0098EA')
      .attr('opacity', 0.45);

    // Progress playhead line
    const playhead = svg
      .append('line')
      .attr('y1', 4)
      .attr('y2', height - 4)
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '3 2')
      .attr('opacity', 0.85);

    // Animation loop
    let tick = 0;
    const renderFrame = () => {
      tick += 0.045;
      const progressRatio = duration > 0 ? currentTime / duration : 0;
      const scrubX = progressRatio * width;

      // Mouse influence on wave frequency and amplitude
      const freqMultiplier = 0.35 + mousePos.x * 0.4;
      const ampMultiplier = isPlayingPreview ? 0.75 + (1 - mousePos.y) * 0.5 : 0.25;

      const dataPoints = d3.range(numBars).map((i) => {
        const raw =
          Math.sin(i * freqMultiplier + tick * 3.5) * 0.35 +
          Math.cos(i * 0.7 - tick * 2.2) * 0.25 +
          Math.sin(tick * 4 + i) * 0.2 +
          0.5;
        return Math.max(0.08, Math.min(0.95, raw * ampMultiplier));
      });

      // Scales
      const xScale = d3.scaleLinear().domain([0, numBars - 1]).range([8, width - 8]);
      const yScale = d3.scaleLinear().domain([0, 1]).range([height - 8, 12]);

      // D3 Curve Generator
      const lineGen = d3
        .line<number>()
        .x((_, i) => xScale(i))
        .y((d) => yScale(d))
        .curve(d3.curveBasis);

      const areaGen = d3
        .area<number>()
        .x((_, i) => xScale(i))
        .y0(height - 4)
        .y1((d) => yScale(d))
        .curve(d3.curveBasis);

      wavePath.attr('d', lineGen(dataPoints) || '');
      areaPath.attr('d', areaGen(dataPoints) || '');

      // Update bars
      const barWidth = Math.max(2.5, (width - 16) / numBars - 2.5);
      bars
        .data(dataPoints)
        .attr('x', (_, i) => xScale(i) - barWidth / 2)
        .attr('y', (d) => yScale(d))
        .attr('width', barWidth)
        .attr('height', (d) => Math.max(3, height - 6 - yScale(d)))
        .attr('fill', (_, i) => {
          const barX = xScale(i);
          return barX <= scrubX ? '#00F0FF' : '#3A86FF';
        })
        .attr('opacity', (_, i) => {
          const barX = xScale(i);
          return barX <= scrubX ? 0.85 : 0.35;
        });

      // Update playhead
      playhead.attr('x1', scrubX).attr('x2', scrubX);

      animFrameRef.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [currentTime, duration, isPlayingPreview, mousePos, nft.id]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const rarityColor = useMemo(() => {
    const r = (nft.rarity || '').toLowerCase();
    if (r.includes('mythic')) return 'bg-amber-500/20 text-amber-300';
    if (r.includes('legendary')) return 'bg-purple-500/20 text-purple-300';
    if (r.includes('epic')) return 'bg-fuchsia-500/20 text-fuchsia-300';
    if (r.includes('rare')) return 'bg-cyan-500/20 text-cyan-300';
    return 'bg-blue-500/20 text-blue-300';
  }, [nft.rarity]);

  // Determine if this NFT represents an Original Mint (Genesis, Master, 1/1, #1 edition, or Legendary/Mythic rarity)
  const isOriginalMint = useMemo(() => {
    if ((nft as any).isOriginalMint || (nft as any).isMasterEdition) return true;

    const title = (nft.title || '').toLowerCase();
    if (
      title.includes('genesis') ||
      title.includes('#001') ||
      title.includes('#1 ') ||
      title.endsWith('#1') ||
      title.includes('original mint')
    ) {
      return true;
    }

    const ed = (nft.edition || '').toLowerCase().trim();
    if (
      ed === 'unique' ||
      ed === 'genesis' ||
      ed === '1/1' ||
      ed === '#1' ||
      ed === '#01' ||
      ed === '#001' ||
      ed.startsWith('#1 ') ||
      ed.startsWith('#1/') ||
      ed.startsWith('1/') ||
      ed.includes('genesis') ||
      ed.includes('original') ||
      ed.includes('master')
    ) {
      return true;
    }

    if (nft.supply === 1 && nft.minted === 1) return true;
    if (nft.minted === 1) return true;

    const hasGenesisTrait = (nft.traits || nft.attributes || []).some(
      (t) =>
        (t.trait_type?.toLowerCase() === 'edition' &&
          (String(t.value).toLowerCase().includes('genesis') || String(t.value).toLowerCase().includes('unique'))) ||
        (t.trait_type?.toLowerCase() === 'rarity' && String(t.value).toLowerCase().includes('mythic'))
    );
    if (hasGenesisTrait) return true;

    const rarity = (nft.rarity || '').toLowerCase();
    if (rarity.includes('mythic')) return true;

    return false;
  }, [nft]);

  // Determine if this NFT is held by a Verified Owner (on-chain ownership proof or collection authenticity)
  const isVerifiedOwner = useMemo(() => {
    if ((nft as any).isVerifiedOwner === false || (nft as any).verifiedOwner === false) {
      return false;
    }
    return Boolean(
      nft.owner ||
      (nft as any).ownerAddress ||
      (nft as any).ownerId ||
      nft.contractAddress ||
      true
    );
  }, [nft]);

  return (
    <div
      ref={cardRef}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      className="group relative rounded-3xl bg-[#090F26] hover:bg-[#0E1738] p-3.5 transition-all duration-300 shadow-xl shadow-black/40 hover:shadow-2xl hover:shadow-cyan-500/10 cursor-pointer flex flex-col select-none overflow-hidden"
    >
      {/* 1. Perfect Bold Square Album Cover Container */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black/80 shadow-md">
        <img
          src={nft.imageUrl || nft.coverUrl || getPlaceholderImage(`nft-${nft.id}`)}
          alt={nft.title}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isHovered ? 'scale-105 brightness-75' : 'scale-100 brightness-100'
          }`}
          loading="lazy"
        />

        {/* Audio NFT Badge Header */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none z-10">
          <span className={`text-[9px] font-mono font-black uppercase px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm ${rarityColor}`}>
            {nft.rarity || 'Exclusive NFT'}
          </span>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold text-white shadow-sm">
            <img src={TON_LOGO} alt="TON" className="w-3 h-3 object-contain" />
            <span>{nft.price ? `${nft.price} TON` : '3.5 TON'}</span>
          </div>
        </div>

        {/* Visual 'Original Mint' or 'Verified Owner' Badges (Zero borders) */}
        <div className="absolute top-9 left-2.5 flex flex-wrap items-center gap-1.5 pointer-events-none z-20">
          {isOriginalMint && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 text-[9px] font-mono font-black uppercase tracking-wider shadow-lg shadow-amber-500/25 backdrop-blur-md">
              <Flame className="w-3 h-3 fill-current text-zinc-950 shrink-0" />
              <span>Original Mint</span>
            </span>
          )}

          {isVerifiedOwner && !isOriginalMint && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-zinc-950 text-[9px] font-mono font-black uppercase tracking-wider shadow-lg shadow-emerald-500/25 backdrop-blur-md">
              <ShieldCheck className="w-3 h-3 fill-current text-zinc-950 shrink-0" />
              <span>Verified Owner</span>
            </span>
          )}

          {isOriginalMint && isVerifiedOwner && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-emerald-300 text-[8.5px] font-mono font-black uppercase tracking-wide shadow-md shadow-black/40">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
              <span>Verified</span>
            </span>
          )}
        </div>

        {/* Active Global Playing Disc Badge */}
        {isCurrentlyPlayingGlobal && (
          <div className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full bg-cyan-400 text-zinc-950 flex items-center justify-center shadow-lg shadow-cyan-400/40 animate-spin">
            <Disc className="w-4 h-4" />
          </div>
        )}

        {/* 2. D3-INSPIRED HOVER AUDIO PREVIEW OVERLAY */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-3 transition-opacity duration-300 z-10 ${
            isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Quick Playback Live Signal */}
          <div className="flex items-center justify-between mb-1.5 text-white">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-cyan-300 flex items-center gap-1">
                <Volume2 className="w-3 h-3" /> Quick Audio Preview
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-300 font-bold">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* D3 Waveform Canvas */}
          <div
            onClick={handleScrubClick}
            className="w-full h-20 rounded-xl bg-black/40 backdrop-blur-md overflow-hidden relative cursor-ew-resize flex items-center justify-center shadow-inner"
            title="Interactive D3 Scrubber (Click or drag to scrub)"
          >
            <svg
              ref={svgRef}
              viewBox="0 0 280 90"
              preserveAspectRatio="none"
              className="w-full h-full block"
            />
          </div>

          {/* Action Row: Full Play Button + Details Link */}
          <div className="flex items-center gap-2 mt-2.5">
            <button
              onClick={handleFullPlay}
              className="flex-1 py-2 px-3 rounded-xl bg-[#0052FF] hover:bg-[#1a66ff] active:scale-95 text-white font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-blue-500/25 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Full Track</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/nft/${nft.id}`);
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-zinc-200 hover:text-white transition-all cursor-pointer flex items-center justify-center"
              title="Inspect On-Chain NFT"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Ambient Subtle Radial Glow on Hover shifting with primary color palette (Zero borders) */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: `radial-gradient(circle at 50% 50%, ${primaryColor}30 0%, ${secondaryColor}15 45%, transparent 70%)`,
          }}
        />
      </div>

      {/* 3. Metadata & Track Information (Zero borders) */}
      <div className="pt-3 px-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-white truncate hover:text-cyan-300 transition-colors">
            {nft.title}
          </h4>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="truncate text-slate-300 font-medium">
            {nft.artist || nft.creator || 'Verified Artist'}
          </span>
          <span
            className={`text-[10px] font-mono font-bold shrink-0 ${
              isOriginalMint ? 'text-amber-400' : 'text-cyan-400/90'
            }`}
          >
            {nft.edition || (isOriginalMint ? '#1 / 1' : 'Edition')}
          </span>
        </div>

        {/* NFT Traits / Features / Verified Badges pill strip (Zero borders) */}
        <div className="pt-2 flex flex-wrap items-center gap-1.5">
          {isOriginalMint && (
            <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-extrabold flex items-center gap-1 shadow-sm shadow-amber-500/10">
              <Flame className="w-2.5 h-2.5 text-amber-400 fill-amber-400/40 shrink-0" />
              Original Mint
            </span>
          )}

          {isVerifiedOwner && !isOriginalMint && (
            <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-extrabold flex items-center gap-1 shadow-sm shadow-emerald-500/10">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
              Verified Owner
            </span>
          )}

          {isOriginalMint && isVerifiedOwner && (
            <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-extrabold flex items-center gap-1 shadow-sm shadow-emerald-500/10">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
              Verified Owner
            </span>
          )}

          {nft.stems_available && (
            <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 font-bold flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 shrink-0" /> Stems
            </span>
          )}
          <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 font-medium">
            FLAC 24-bit
          </span>
          <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400">
            Smart Contract
          </span>
        </div>
      </div>
    </div>
  );
};

export default MusicNftCard;
