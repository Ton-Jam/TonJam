import { sendTransactionSafe } from "@/services/tonService";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/contexts/AudioContext';
import { useNFT } from '@/contexts/NFTContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  Clock, 
  Users, 
  Plus, 
  Trash2, 
  UserPlus, 
  Calendar, 
  DollarSign, 
  Layers, 
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  Play,
  Pause,
  Volume2,
  Disc,
  Download,
  Copy,
  ExternalLink,
  ShieldCheck,
  Award,
  Zap,
  Flame,
  Radio,
  Share2,
  Bell,
  BellRing
} from 'lucide-react';
import { toast } from 'sonner';
import { NFTItem } from '@/types';

export interface NFTDrop {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  artistWallet?: string;
  priceTon: number;
  priceGram?: number;
  supply: number;
  mintedCount: number;
  coverUrl: string;
  audioPreviewUrl?: string;
  releaseDate: string; // ISO String
  description: string;
  genre: string;
  perks: string[];
  whitelist: string[]; // Whitelisted TON addresses
  whitelistLimit: number;
  status: 'upcoming' | 'live' | 'sold_out';
  isFeatured?: boolean;
}

const INITIAL_DROPS: NFTDrop[] = [
  {
    id: "drop-krupy-genesis",
    title: "Vaporwave Nights: Genesis Edition",
    artist: "DJKrupy AI",
    artistId: "artist-krupy",
    artistWallet: "EQB-z9X_GZ_uRQ93n4X_krupy_master_ton_vault_01",
    priceTon: 12.5,
    priceGram: 2500,
    supply: 150,
    mintedCount: 68,
    coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=800",
    audioPreviewUrl: "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3",
    releaseDate: new Date(Date.now() + 1000 * 60 * 60 * 14).toISOString(), // 14 hours from now
    description: "The ultimate neural-synthesized vaporwave collection. Minting unlocks exclusive lossless FLAC downloads, VIP Backstage JamSpace passes, and 12% lifetime on-chain streaming royalty splits.",
    genre: "Phonk / Vaporwave",
    perks: ["12% Lifetime Royalties", "Lossless Master FLAC", "VIP JamSpace Lounge Pass", "Exclusive Remix Stems"],
    whitelist: [
      "EQB-z9X_GZ_uRQ93n4X_krupy_master_ton_vault_01",
      "UQAn8_W91x_4mKZ98P1Q009_ton_fan_collector_02",
      "EQC-99X_123_abc_cyber_ton_audiophile_03"
    ],
    whitelistLimit: 50,
    status: 'upcoming',
    isFeatured: true,
  },
  {
    id: "drop-aether-cyber",
    title: "Cybernetic Resonance Vol. 1",
    artist: "Aether Flux",
    artistId: "artist-aether",
    artistWallet: "EQD_aether_flux_sound_lab_ton_address_001",
    priceTon: 25.0,
    priceGram: 5000,
    supply: 75,
    mintedCount: 75,
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800",
    audioPreviewUrl: "https://assets.mixkit.co/music/preview/mixkit-cyber-city-synthwave-1084.mp3",
    releaseDate: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // Live / Started
    description: "High-octane cyberpunk modular synthesis synced with 3D generative visualizers. A collaborative sonic experiment bridging hardware Eurorack rigs and TON smart contracts.",
    genre: "Synthwave / Cyberpunk",
    perks: ["3D Generative Visualizer NFT", "High-Res Modular Stems", "Private Producer Telegram Access"],
    whitelist: [
      "EQB-z9X_GZ_uRQ93n4X_krupy_master_ton_vault_01",
      "UQAn8_W91x_4mKZ98P1Q009_ton_fan_collector_02"
    ],
    whitelistLimit: 30,
    status: 'sold_out',
  },
  {
    id: "drop-satoshi-symphony",
    title: "Symphony of the Blockchain",
    artist: "Satoshi Symphony",
    artistId: "artist-satoshi",
    artistWallet: "EQA_satoshi_symphony_orchestra_ton_vault_99",
    priceTon: 40.0,
    priceGram: 8000,
    supply: 50,
    mintedCount: 14,
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800",
    audioPreviewUrl: "https://assets.mixkit.co/music/preview/mixkit-chill-bro-494.mp3",
    releaseDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3.5).toISOString(), // 3.5 days from now
    description: "An orchestral ambient masterpiece mapping real-time TON blockchain telemetry data to 48-piece classical acoustic orchestra stems.",
    genre: "Ambient / Classical Web3",
    perks: ["Full Orchestral Score PDF", "Signed Physical Vinyl Shipped", "Governance Voting Token"],
    whitelist: [
      "EQB-z9X_GZ_uRQ93n4X_krupy_master_ton_vault_01"
    ],
    whitelistLimit: 25,
    status: 'upcoming',
  },
  {
    id: "drop-ton-groove",
    title: "Tokyo Midnight Groove",
    artist: "Neon Shinjuku",
    artistId: "artist-neon",
    artistWallet: "EQC_tokyo_groove_sound_syndicate_ton_77",
    priceTon: 8.0,
    priceGram: 1600,
    supply: 200,
    mintedCount: 42,
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800",
    audioPreviewUrl: "https://assets.mixkit.co/music/preview/mixkit-deep-urban-623.mp3",
    releaseDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // 2 days from now
    description: "Smooth Japanese City Pop grooves blended with futuristic French house basslines. Limited mint on TON with instant staking yield.",
    genre: "City Pop / Nu-Disco",
    perks: ["Instant 18% APY Staking Boost", "Uncompressed Audio WAV", "Exclusive Concert Ticket Airdrop"],
    whitelist: [],
    whitelistLimit: 80,
    status: 'upcoming',
  }
];

// High Precision Real-Time Countdown Timer Component
const DropCountdown: React.FC<{ targetDate: string; onExpire?: () => void }> = ({ targetDate, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false
  });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(targetDate) - Date.now();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        onExpire?.();
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isOver: false
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  if (timeLeft.isOver) {
    return (
      <div className="bg-emerald-500/10 text-emerald-400 font-bold tracking-wider uppercase text-xs px-3.5 py-1.5 rounded-full inline-flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute" />
        Drop is Live for Minting
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-center bg-white/[0.04] px-3.5 py-2 rounded-xl min-w-[54px]">
        <span className="font-mono text-xl font-black text-white tracking-tight">{String(timeLeft.days).padStart(2, '0')}</span>
        <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold">Days</span>
      </div>
      <span className="text-neutral-500 font-mono font-bold text-lg">:</span>
      <div className="flex flex-col items-center bg-white/[0.04] px-3.5 py-2 rounded-xl min-w-[54px]">
        <span className="font-mono text-xl font-black text-[#0098EA] tracking-tight">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold">Hours</span>
      </div>
      <span className="text-neutral-500 font-mono font-bold text-lg">:</span>
      <div className="flex flex-col items-center bg-white/[0.04] px-3.5 py-2 rounded-xl min-w-[54px]">
        <span className="font-mono text-xl font-black text-[#0098EA] tracking-tight">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold">Mins</span>
      </div>
      <span className="text-neutral-500 font-mono font-bold text-lg">:</span>
      <div className="flex flex-col items-center bg-white/[0.04] px-3.5 py-2 rounded-xl min-w-[54px]">
        <span className="font-mono text-xl font-black text-[#00E5FF] tracking-tight">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold">Secs</span>
      </div>
    </div>
  );
};

export default function NFTLaunchpad() {
  const { user, userProfile } = useAuth();
  const { isArtist, isAdmin } = useUserRole();
  const { addNFT } = useNFT();
  
  const connectedAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  const [drops, setDrops] = useState<NFTDrop[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'live' | 'my-whitelists' | 'studio'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  // Audio Preview Player State
  const [playingDropId, setPlayingDropId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Minting modal state
  const [mintingDrop, setMintingDrop] = useState<NFTDrop | null>(null);
  const [isMintingOnChain, setIsMintingOnChain] = useState(false);
  const [mintQuantity, setMintQuantity] = useState(1);

  // Create Drop Form States
  const [newTitle, setNewTitle] = useState('');
  const [newGenre, setNewGenre] = useState('Electronic');
  const [newPriceTon, setNewPriceTon] = useState('10');
  const [newPriceGram, setNewPriceGram] = useState('2000');
  const [newSupply, setNewSupply] = useState('100');
  const [newCoverUrl, setNewCoverUrl] = useState('');
  const [newAudioPreviewUrl, setNewAudioPreviewUrl] = useState('');
  const [newReleaseDate, setNewReleaseDate] = useState('');
  const [newReleaseTime, setNewReleaseTime] = useState('18:00');
  const [newDescription, setNewDescription] = useState('');
  const [newWhitelistLimit, setNewWhitelistLimit] = useState('50');
  const [newPerkInput, setNewPerkInput] = useState('');
  const [newPerksList, setNewPerksList] = useState<string[]>([
    "Lossless Audio Master WAV",
    "VIP JamSpace Access Pass"
  ]);

  // Whitelist Management States
  const [selectedDropForMgmt, setSelectedDropForMgmt] = useState<NFTDrop | null>(null);
  const [manualAddress, setManualAddress] = useState('');
  const [bulkAddresses, setBulkAddresses] = useState('');

  // Collector Join Whitelist State
  const [joinCustomWallet, setJoinCustomWallet] = useState('');

  // Push Notification Subscriptions for Drop Countdowns
  const { addNotification, requestPushPermission } = useNotification();
  const [subscribedDropIds, setSubscribedDropIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tonjam_launchpad_drop_subscriptions');
      return saved ? JSON.parse(saved) : ['drop-krupy-genesis'];
    } catch {
      return ['drop-krupy-genesis'];
    }
  });

  const handleToggleNotify = async (drop: NFTDrop, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isSubscribed = subscribedDropIds.includes(drop.id);

    if (isSubscribed) {
      const updated = subscribedDropIds.filter(id => id !== drop.id);
      setSubscribedDropIds(updated);
      localStorage.setItem('tonjam_launchpad_drop_subscriptions', JSON.stringify(updated));
      toast.info(`🔕 Unsubscribed from countdown alerts for "${drop.title}"`);
    } else {
      let granted = false;
      try {
        granted = await requestPushPermission();
      } catch (err) {
        console.warn('Push permission request error:', err);
      }

      const updated = [...subscribedDropIds, drop.id];
      setSubscribedDropIds(updated);
      localStorage.setItem('tonjam_launchpad_drop_subscriptions', JSON.stringify(updated));

      // Add in-app notification
      addNotification({
        userId: user?.uid || 'guest',
        type: 'track_upload',
        title: 'Drop Alert Subscribed 🔔',
        message: `You are subscribed to push countdown alerts for "${drop.title}" by ${drop.artist}.`,
        link: '/launchpad',
        metadata: { dropId: drop.id, title: drop.title, artist: drop.artist }
      });

      if (granted) {
        toast.success(`🔔 Push notifications active for "${drop.title}" countdown! You'll receive real-time alerts.`);
        if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
          try {
            new window.Notification('🔔 TonJam Launchpad Reminder Set', {
              body: `We will notify you the moment "${drop.title}" countdown reaches zero!`,
              icon: drop.coverUrl || '/favicon.ico'
            });
          } catch (err) {
            // ignore
          }
        }
      } else {
        toast.success(`🔔 Subscribed to "${drop.title}"! You will receive countdown alerts in-app.`);
      }
    }
  };

  // Monitor countdowns for subscribed drops and trigger alert when countdown expires
  const alertedSubscribedDrops = useRef<Set<string>>(new Set());
  useEffect(() => {
    const checkLiveSubscribedDrops = () => {
      drops.forEach(drop => {
        if (subscribedDropIds.includes(drop.id)) {
          const isLiveNow = new Date(drop.releaseDate).getTime() <= Date.now();
          if (isLiveNow && !alertedSubscribedDrops.current.has(drop.id)) {
            alertedSubscribedDrops.current.add(drop.id);
            if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
              try {
                new window.Notification(`🚀 DROP IS LIVE: ${drop.title}`, {
                  body: `${drop.title} by ${drop.artist} is now open for minting on TON!`,
                  icon: drop.coverUrl || '/favicon.ico'
                });
              } catch (e) {}
            }
            addNotification({
              userId: user?.uid || 'guest',
              type: 'track_upload',
              title: `🚀 LIVE NOW: ${drop.title}`,
              message: `The countdown ended! "${drop.title}" by ${drop.artist} is now available for minting (${drop.priceTon} TON).`,
              link: '/launchpad',
              metadata: { dropId: drop.id }
            });
            toast.success(`🚀 "${drop.title}" is now LIVE on TON!`);
          }
        }
      });
    };

    checkLiveSubscribedDrops();
    const interval = setInterval(checkLiveSubscribedDrops, 10000);
    return () => clearInterval(interval);
  }, [drops, subscribedDropIds, user, addNotification]);

  // Load and cache drops
  useEffect(() => {
    const cached = localStorage.getItem('tonjam_launchpad_drops_v2');
    if (cached) {
      try {
        setDrops(JSON.parse(cached));
      } catch (e) {
        setDrops(INITIAL_DROPS);
      }
    } else {
      setDrops(INITIAL_DROPS);
      localStorage.setItem('tonjam_launchpad_drops_v2', JSON.stringify(INITIAL_DROPS));
    }
  }, []);

  const saveDrops = (updatedDrops: NFTDrop[]) => {
    setDrops(updatedDrops);
    localStorage.setItem('tonjam_launchpad_drops_v2', JSON.stringify(updatedDrops));
  };

  // Audio preview playback toggle
  const toggleAudioPreview = (drop: NFTDrop) => {
    if (!drop.audioPreviewUrl) {
      toast.info('Audio preview not available for this drop');
      return;
    }

    if (playingDropId === drop.id) {
      audioRef.current?.pause();
      setPlayingDropId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(drop.audioPreviewUrl);
      audio.onended = () => setPlayingDropId(null);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err?.name !== 'AbortError' && !err?.message?.includes('interrupted')) {
            toast.error('Could not play audio preview');
          }
        });
      }
      audioRef.current = audio;
      setPlayingDropId(drop.id);
      toast.success(`Playing sample for "${drop.title}"`);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Filter drops
  const activeWallet = connectedAddress || userProfile?.walletAddress || '';

  const userWhitelistedDrops = useMemo(() => {
    if (!activeWallet) return [];
    return drops.filter(d => d.whitelist.some(w => w.toLowerCase() === activeWallet.toLowerCase()));
  }, [drops, activeWallet]);

  const featuredDrop = useMemo(() => {
    return drops.find(d => d.isFeatured) || drops[0];
  }, [drops]);

  const filteredDrops = useMemo(() => {
    return drops.filter(drop => {
      const matchesSearch = drop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            drop.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            drop.genre.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenre === 'all' || drop.genre.toLowerCase() === selectedGenre.toLowerCase();
      
      const isPast = new Date(drop.releaseDate).getTime() <= Date.now();
      if (activeTab === 'upcoming') {
        return matchesSearch && matchesGenre && !isPast && drop.status !== 'sold_out';
      }
      if (activeTab === 'live') {
        return matchesSearch && matchesGenre && (isPast || drop.status === 'live');
      }
      return matchesSearch && matchesGenre;
    });
  }, [drops, searchQuery, selectedGenre, activeTab]);

  // Handle Joining Whitelist
  const handleJoinWhitelist = (dropId: string) => {
    const targetWallet = activeWallet || joinCustomWallet.trim();

    if (!targetWallet) {
      if (!connectedAddress) {
        tonConnectUI.openModal();
        return;
      }
      toast.error('Please enter a TON wallet address or connect your wallet');
      return;
    }

    const dropIndex = drops.findIndex(d => d.id === dropId);
    if (dropIndex === -1) return;

    const drop = drops[dropIndex];
    if (drop.whitelist.some(w => w.toLowerCase() === targetWallet.toLowerCase())) {
      toast.info('You are already registered on the whitelist for this drop!');
      return;
    }

    if (drop.whitelist.length >= drop.whitelistLimit) {
      toast.error('Whitelist cap reached for this drop!');
      return;
    }

    const updatedWhitelist = [...drop.whitelist, targetWallet];
    const updatedDrops = [...drops];
    updatedDrops[dropIndex] = { ...drop, whitelist: updatedWhitelist };
    saveDrops(updatedDrops);

    toast.success(`🎉 Whitelist spot secured! Verified for ${targetWallet.slice(0, 6)}...${targetWallet.slice(-4)}`);
    setJoinCustomWallet('');
  };

  // Execute Direct On-Chain TON Minting
  const handleExecuteTonMint = async (drop: NFTDrop) => {
    if (!connectedAddress) {
      toast.info('Please connect your TON wallet to mint this Music NFT');
      tonConnectUI.openModal();
      return;
    }

    setIsMintingOnChain(true);
    const toastId = toast.loading(`Preparing TON blockchain transaction for ${drop.title}...`);

    try {
      const recipientAddress = drop.artistWallet || "EQB-z9X_GZ_uRQ93n4X_krupy_master_ton_vault_01";
      const totalTon = (drop.priceTon * mintQuantity).toFixed(2);
      const nanoTonAmount = (BigInt(Math.round(parseFloat(totalTon) * 1e9))).toString();

      const transactionPayload = {
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [
          {
            address: recipientAddress,
            amount: nanoTonAmount,
            payload: btoa(`TonJam Launchpad Mint: ${drop.title} x${mintQuantity} by ${connectedAddress}`)
          }
        ]
      };

      const result = await sendTransactionSafe(tonConnectUI, transactionPayload);

      // Successfully minted on TON!
      const mintedNftItem: NFTItem = {
        id: `nft-drop-${Date.now()}`,
        trackId: `track-${drop.id}`,
        title: drop.title,
        artist: drop.artist,
        creator: drop.artist,
        artistId: drop.artistId,
        owner: user?.displayName || userProfile?.username || connectedAddress,
        ownerId: user?.uid || connectedAddress,
        imageUrl: drop.coverUrl,
        coverUrl: drop.coverUrl,
        audioUrl: drop.audioPreviewUrl || 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
        price: `${drop.priceTon} TON`,
        rarity: "Launchpad Genesis Master",
        edition: `#${drop.mintedCount + 1} of ${drop.supply}`,
        supply: drop.supply,
        minted: drop.mintedCount + mintQuantity,
        description: drop.description,
        contractAddress: recipientAddress
      };

      addNFT(mintedNftItem);

      // Update drop minted count
      const updatedDrops = drops.map(d => {
        if (d.id === drop.id) {
          const newCount = d.mintedCount + mintQuantity;
          return {
            ...d,
            mintedCount: newCount,
            status: newCount >= d.supply ? 'sold_out' : d.status
          };
        }
        return d;
      });
      saveDrops(updatedDrops);

      toast.success(
        `🎉 Minted ${mintQuantity}x "${drop.title}" on TON blockchain! Added to your Library.`,
        { id: toastId }
      );
      setMintingDrop(null);
    } catch (err: any) {
      console.error('TON Mint error:', err);
      toast.error(err?.message || 'TON transaction rejected or cancelled', { id: toastId });
    } finally {
      setIsMintingOnChain(false);
    }
  };

  // Create & Schedule new Drop (Artist Studio)
  const handleScheduleDrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPriceTon || !newSupply || !newReleaseDate || !newDescription) {
      toast.error('Please complete all required fields');
      return;
    }

    const isoDateTime = new Date(`${newReleaseDate}T${newReleaseTime || '18:00'}`).toISOString();
    const defaultCovers = [
      "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800"
    ];

    const randomCover = defaultCovers[Math.floor(Math.random() * defaultCovers.length)];

    const newDrop: NFTDrop = {
      id: `drop-${Date.now()}`,
      title: newTitle,
      artist: userProfile?.name || userProfile?.username || user?.email?.split('@')[0] || "Verified TON Artist",
      artistId: user?.uid || "artist-verified",
      artistWallet: connectedAddress || userProfile?.walletAddress || "EQB-z9X_GZ_uRQ93n4X_krupy_master_ton_vault_01",
      priceTon: parseFloat(newPriceTon) || 10,
      priceGram: parseFloat(newPriceGram) || 2000,
      supply: parseInt(newSupply) || 100,
      mintedCount: 0,
      coverUrl: newCoverUrl || randomCover,
      audioPreviewUrl: newAudioPreviewUrl || 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
      releaseDate: isoDateTime,
      description: newDescription,
      genre: newGenre,
      perks: newPerksList.length > 0 ? newPerksList : ["Lossless Master FLAC", "VIP JamSpace Access"],
      whitelist: [],
      whitelistLimit: parseInt(newWhitelistLimit) || 50,
      status: 'upcoming'
    };

    const updated = [newDrop, ...drops];
    saveDrops(updated);
    toast.success(`🚀 Scheduled drop "${newTitle}" for ${new Date(isoDateTime).toLocaleDateString()}!`);

    // Reset Form
    setNewTitle('');
    setNewPriceTon('10');
    setNewPriceGram('2000');
    setNewSupply('100');
    setNewCoverUrl('');
    setNewAudioPreviewUrl('');
    setNewReleaseDate('');
    setNewReleaseTime('18:00');
    setNewDescription('');
    setNewWhitelistLimit('50');
    setActiveTab('upcoming');
  };

  const handleAddPerk = () => {
    if (!newPerkInput.trim()) return;
    setNewPerksList([...newPerksList, newPerkInput.trim()]);
    setNewPerkInput('');
  };

  const handleRemovePerk = (index: number) => {
    setNewPerksList(newPerksList.filter((_, i) => i !== index));
  };

  const handleDeleteDrop = (id: string) => {
    const updated = drops.filter(d => d.id !== id);
    saveDrops(updated);
    if (selectedDropForMgmt?.id === id) {
      setSelectedDropForMgmt(null);
    }
    toast.success('Drop canceled successfully');
  };

  // Whitelist Admin Add
  const handleAddManualAddress = () => {
    if (!selectedDropForMgmt || !manualAddress.trim()) {
      toast.error('Please specify a TON wallet address');
      return;
    }

    const addr = manualAddress.trim();
    if (selectedDropForMgmt.whitelist.includes(addr)) {
      toast.error('Address already registered on whitelist');
      return;
    }

    if (selectedDropForMgmt.whitelist.length >= selectedDropForMgmt.whitelistLimit) {
      toast.error('Whitelist cap limit reached');
      return;
    }

    const updatedWhitelist = [...selectedDropForMgmt.whitelist, addr];
    const updatedDrops = drops.map(d => {
      if (d.id === selectedDropForMgmt.id) {
        return { ...d, whitelist: updatedWhitelist };
      }
      return d;
    });

    setSelectedDropForMgmt({ ...selectedDropForMgmt, whitelist: updatedWhitelist });
    saveDrops(updatedDrops);
    setManualAddress('');
    toast.success('Wallet address added to whitelist!');
  };

  const handleAddBulkAddresses = () => {
    if (!selectedDropForMgmt || !bulkAddresses.trim()) {
      toast.error('No addresses provided');
      return;
    }

    const parsed = bulkAddresses
      .split(/[,\n\s]+/)
      .map(a => a.trim())
      .filter(a => a.length > 5);

    if (parsed.length === 0) {
      toast.error('No valid TON addresses detected');
      return;
    }

    const existingSet = new Set(selectedDropForMgmt.whitelist);
    let addedCount = 0;

    for (const addr of parsed) {
      if (!existingSet.has(addr) && existingSet.size < selectedDropForMgmt.whitelistLimit) {
        existingSet.add(addr);
        addedCount++;
      }
    }

    const updatedWhitelist = Array.from(existingSet);
    const updatedDrops = drops.map(d => {
      if (d.id === selectedDropForMgmt.id) {
        return { ...d, whitelist: updatedWhitelist };
      }
      return d;
    });

    setSelectedDropForMgmt({ ...selectedDropForMgmt, whitelist: updatedWhitelist });
    saveDrops(updatedDrops);
    setBulkAddresses('');
    toast.success(`Successfully imported ${addedCount} TON wallets into whitelist`);
  };

  const handleRemoveFromWhitelist = (address: string) => {
    if (!selectedDropForMgmt) return;
    const updatedWhitelist = selectedDropForMgmt.whitelist.filter(a => a !== address);
    const updatedDrops = drops.map(d => {
      if (d.id === selectedDropForMgmt.id) {
        return { ...d, whitelist: updatedWhitelist };
      }
      return d;
    });
    setSelectedDropForMgmt({ ...selectedDropForMgmt, whitelist: updatedWhitelist });
    saveDrops(updatedDrops);
    toast.success('Wallet removed from whitelist');
  };

  const allGenres = ['all', 'Phonk / Vaporwave', 'Synthwave / Cyberpunk', 'Ambient / Classical Web3', 'City Pop / Nu-Disco', 'Electronic', 'Hip-Hop'];

  return (
    <div className="min-h-screen bg-[#050A24] text-white px-4 py-8 md:px-8 max-w-7xl mx-auto space-y-10 selection:bg-[#0098EA]/30">
      
      {/* 1. HERO HEADER */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-tr from-[#0098EA]/30 via-indigo-600/20 to-[#00E5FF]/20 text-[#00E5FF] rounded-2xl shadow-xl">
              <Rocket className="h-7 w-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">Music NFT Launchpad</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#0098EA]/20 text-[#00E5FF] text-[10px] font-black uppercase tracking-widest">TON Chain</span>
              </div>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">SCHEDULE, COUNTDOWN, AND ACCESS VIP EARLY-MINT MUSIC DROPS</p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
            <div className="bg-white/[0.04] px-4 py-2.5 rounded-2xl flex items-center gap-2.5 shrink-0">
              <Flame className="w-4 h-4 text-orange-400" />
              <div>
                <div className="text-xs font-black text-white">{drops.length} Scheduled Drops</div>
                <div className="text-[9px] uppercase tracking-wider text-neutral-400">Total Pipeline</div>
              </div>
            </div>
            <div className="bg-white/[0.04] px-4 py-2.5 rounded-2xl flex items-center gap-2.5 shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-xs font-black text-white">{connectedAddress ? `${connectedAddress.slice(0, 4)}...${connectedAddress.slice(-4)}` : 'Disconnected'}</div>
                <div className="text-[9px] uppercase tracking-wider text-neutral-400">Connected Wallet</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FEATURED GENESIS IMMINENT DROP HERO BANNER */}
      {featuredDrop && (
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-neutral-900 via-indigo-950/40 to-neutral-900 shadow-2xl p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#0098EA]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Cover & Audio Preview */}
            <div className="lg:col-span-4 relative group">
              <div className="aspect-square w-full rounded-2xl overflow-hidden shadow-2xl relative bg-black/40">
                <img 
                  src={featuredDrop.coverUrl} 
                  alt={featuredDrop.title} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute top-3 left-3 bg-black/70 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-[#00E5FF] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Featured Genesis Drop
                </div>
                <div className="absolute bottom-3 right-3 bg-neutral-900 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-white shadow-lg">
                  {featuredDrop.priceTon} TON
                </div>
              </div>

              {/* Play Audio Sample Button */}
              {featuredDrop.audioPreviewUrl && (
                <button
                  onClick={() => toggleAudioPreview(featuredDrop)}
                  className="absolute bottom-6 left-6 p-3.5 rounded-full bg-[#0098EA] hover:bg-[#00E5FF] text-black shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center cursor-pointer"
                  title="Audition Preview Sample"
                >
                  {playingDropId === featuredDrop.id ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>
              )}
            </div>

            {/* Right Details & Live Countdown */}
            <div className="lg:col-span-8 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                    {featuredDrop.genre}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                    {featuredDrop.supply} Total Units
                  </span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">{featuredDrop.title}</h2>
                <p className="text-xs sm:text-sm text-neutral-300 font-medium">Curated by <span className="text-[#00E5FF] font-bold">{featuredDrop.artist}</span></p>
                <p className="text-xs text-neutral-400 leading-relaxed max-w-2xl">{featuredDrop.description}</p>
              </div>

              {/* Perks List */}
              <div className="flex flex-wrap gap-2">
                {featuredDrop.perks.map((perk, i) => (
                  <div key={i} className="bg-white/[0.04] px-3 py-1.5 rounded-xl text-[10px] font-mono text-neutral-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-[#00E5FF]" />
                    {perk}
                  </div>
                ))}
              </div>

              {/* Countdown & Action */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/40 p-5 rounded-2xl">
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 block">Genesis Mint Launch In:</span>
                  <DropCountdown targetDate={featuredDrop.releaseDate} />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Notify Me Bell Toggle */}
                  <button
                    onClick={(e) => handleToggleNotify(featuredDrop, e)}
                    className={`px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                      subscribedDropIds.includes(featuredDrop.id)
                        ? 'bg-amber-400 text-black shadow-lg hover:bg-amber-300'
                        : 'bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white'
                    }`}
                    title={subscribedDropIds.includes(featuredDrop.id) ? 'Push reminders enabled for this countdown (Click to cancel)' : 'Notify Me: Get push notifications for this drop countdown'}
                    aria-label="Notify Me"
                  >
                    {subscribedDropIds.includes(featuredDrop.id) ? (
                      <>
                        <BellRing className="w-4 h-4 fill-current animate-pulse" />
                        <span>Reminders On</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4" />
                        <span>Notify Me</span>
                      </>
                    )}
                  </button>

                  {new Date(featuredDrop.releaseDate).getTime() <= Date.now() ? (
                    <button
                      onClick={() => {
                        setMintingDrop(featuredDrop);
                        setMintQuantity(1);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-90 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 fill-current" /> Mint on TON Now
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinWhitelist(featuredDrop.id)}
                      className="px-6 py-3 bg-[#0098EA] hover:bg-[#00E5FF] text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" /> Secure Whitelist Spot
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 3. TABS & FILTER CONTROLS - BORDERLESS DARK GLASS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex gap-1.5 p-1.5 bg-neutral-900 rounded-2xl w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 shrink-0 ${
              activeTab === 'upcoming' 
                ? 'bg-[#0098EA] text-black shadow-lg' 
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Upcoming Drops
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 shrink-0 ${
              activeTab === 'live' 
                ? 'bg-[#0098EA] text-black shadow-lg' 
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Live Drops ({drops.filter(d => new Date(d.releaseDate).getTime() <= Date.now() || d.status === 'live').length})
          </button>
          <button
            onClick={() => setActiveTab('my-whitelists')}
            className={`py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 shrink-0 ${
              activeTab === 'my-whitelists' 
                ? 'bg-[#0098EA] text-black shadow-lg' 
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            My Whitelists ({userWhitelistedDrops.length})
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 shrink-0 flex items-center gap-1.5 ${
              activeTab === 'studio' 
                ? 'bg-[#0098EA] text-black shadow-lg' 
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Artist Studio
          </button>
        </div>

        {/* Search & Genre Filter */}
        {(activeTab === 'upcoming' || activeTab === 'live') && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search drop or artist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-neutral-900/60 text-xs text-white rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#0098EA] placeholder-neutral-500 w-48 sm:w-60"
              />
            </div>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-neutral-900/60 text-xs text-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#0098EA]"
            >
              {allGenres.map(g => (
                <option key={g} value={g} className="bg-[#050A24] text-white">
                  {g === 'all' ? 'All Genres' : g}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 4. TAB CONTENTS */}
      <AnimatePresence mode="wait">
        
        {/* UPCOMING & LIVE DROPS TAB */}
        {(activeTab === 'upcoming' || activeTab === 'live') && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {filteredDrops.length === 0 ? (
              <div className="text-center py-16 bg-neutral-900/30 rounded-3xl p-8 space-y-3">
                <Rocket className="h-12 w-12 text-neutral-600 mx-auto" />
                <h3 className="text-lg font-bold text-neutral-400 uppercase">No drops match your criteria</h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">Try resetting your search query or switch over to the Artist Studio to schedule the next big release.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDrops.map((drop) => {
                  const isWhitelisted = activeWallet && drop.whitelist.some(w => w.toLowerCase() === activeWallet.toLowerCase());
                  const isLive = new Date(drop.releaseDate).getTime() <= Date.now() || drop.status === 'live';
                  const isSoldOut = drop.mintedCount >= drop.supply || drop.status === 'sold_out';

                  return (
                    <div 
                      key={drop.id}
                      className="group bg-neutral-900/40 hover:bg-neutral-900/70 rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 shadow-xl space-y-4"
                    >
                      {/* Artwork & Badges */}
                      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black/40">
                        <img 
                          src={drop.coverUrl} 
                          alt={drop.title} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute top-3 left-3 bg-black/70 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-[#00E5FF] flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {drop.priceTon} TON
                        </div>
                        
                        {/* Top Right: Genre & Notify Me Bell Toggle */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                          <div className="bg-neutral-950/80 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-neutral-300">
                            {drop.genre}
                          </div>
                          <button
                            onClick={(e) => handleToggleNotify(drop, e)}
                            className={`p-1.5 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer shadow-md ${
                              subscribedDropIds.includes(drop.id)
                                ? 'bg-amber-400 text-black scale-105 shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                                : 'bg-black/70 hover:bg-black/90 text-neutral-300 hover:text-white'
                            }`}
                            title={
                              subscribedDropIds.includes(drop.id)
                                ? 'Subscribed to countdown push alerts (Click to unsubscribe)'
                                : 'Notify Me: Get push notifications when countdown ends'
                            }
                            aria-label="Notify Me"
                          >
                            {subscribedDropIds.includes(drop.id) ? (
                              <BellRing className="w-3.5 h-3.5 fill-current animate-pulse" />
                            ) : (
                              <Bell className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Audio Preview Trigger */}
                        {drop.audioPreviewUrl && (
                          <button
                            onClick={() => toggleAudioPreview(drop)}
                            className="absolute bottom-3 right-3 p-3 rounded-full bg-[#0098EA] hover:bg-[#00E5FF] text-black shadow-xl transition-all duration-300 transform group-hover:scale-105 flex items-center justify-center cursor-pointer"
                          >
                            {playingDropId === drop.id ? (
                              <Pause className="w-4 h-4 fill-current" />
                            ) : (
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Drop Metadata */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-base font-black uppercase tracking-tight group-hover:text-[#00E5FF] transition-colors">{drop.title}</h3>
                            <p className="text-xs text-neutral-400 font-medium">{drop.artist}</p>
                          </div>
                          {isSoldOut ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[9px] font-black uppercase">Sold Out</span>
                          ) : isLive ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase animate-pulse">Live</span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#0098EA]/20 text-[#00E5FF] text-[9px] font-black uppercase">Upcoming</span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">{drop.description}</p>
                      </div>

                      {/* Supply and Whitelist Meter */}
                      <div className="bg-black/30 p-3.5 rounded-2xl space-y-2 text-[10px] font-mono">
                        <div className="flex justify-between items-center text-neutral-400">
                          <span>Mint Progress</span>
                          <span className="text-white font-bold">{drop.mintedCount} / {drop.supply} ({Math.round((drop.mintedCount / drop.supply) * 100)}%)</span>
                        </div>
                        <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-[#0098EA] to-[#00E5FF] h-full rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(100, Math.max(8, (drop.mintedCount / drop.supply) * 100))}%` }} 
                          />
                        </div>
                        <div className="flex justify-between items-center text-neutral-500 pt-1">
                          <span>Whitelist Capacity:</span>
                          <span className="text-[#00E5FF] font-bold">{drop.whitelist.length} / {drop.whitelistLimit}</span>
                        </div>
                      </div>

                      {/* Countdown Display */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono block">Mint Status:</span>
                        <DropCountdown targetDate={drop.releaseDate} />
                      </div>

                      {/* Action Button */}
                      <div className="pt-1 flex items-center gap-2">
                        <button
                          onClick={(e) => handleToggleNotify(drop, e)}
                          className={`p-3 rounded-2xl transition-all duration-300 shrink-0 flex items-center justify-center cursor-pointer ${
                            subscribedDropIds.includes(drop.id)
                              ? 'bg-amber-400/20 text-amber-300 hover:bg-amber-400/30'
                              : 'bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white'
                          }`}
                          title={subscribedDropIds.includes(drop.id) ? 'Subscribed to countdown push alerts' : 'Notify me for countdown'}
                          aria-label="Notify Me"
                        >
                          {subscribedDropIds.includes(drop.id) ? (
                            <BellRing className="w-4 h-4 text-amber-300" />
                          ) : (
                            <Bell className="w-4 h-4" />
                          )}
                        </button>

                        {isSoldOut ? (
                          <div className="flex-1 py-3 bg-white/[0.04] text-neutral-500 rounded-2xl text-center text-xs font-black uppercase tracking-widest">
                            Allocation Exhausted
                          </div>
                        ) : isLive ? (
                          <button
                            onClick={() => {
                              setMintingDrop(drop);
                              setMintQuantity(1);
                            }}
                            className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-90 text-black rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Zap className="w-4 h-4 fill-current" />
                            Mint for {drop.priceTon} TON
                          </button>
                        ) : isWhitelisted ? (
                          <div className="flex-1 py-3 bg-emerald-500/10 text-emerald-400 rounded-2xl text-center text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Guaranteed Whitelist Pass
                          </div>
                        ) : (
                          <button
                            onClick={() => handleJoinWhitelist(drop.id)}
                            className="flex-1 py-3 bg-neutral-800 hover:bg-[#0098EA] text-white hover:text-black rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-md cursor-pointer"
                          >
                            <UserPlus className="h-4 w-4" />
                            Register Whitelist
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* MY WHITELISTS TAB */}
        {activeTab === 'my-whitelists' && (
          <motion.div
            key="my-whitelists"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {userWhitelistedDrops.length === 0 ? (
              <div className="text-center py-16 bg-neutral-900/30 rounded-3xl p-8 space-y-4">
                <Users className="h-12 w-12 text-neutral-600 mx-auto" />
                <h3 className="text-lg font-bold text-neutral-400 uppercase">You haven't joined any drop whitelists</h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">Connect your TON wallet and browse upcoming drops to reserve your priority minting spots.</p>
                <button 
                  onClick={() => setActiveTab('upcoming')}
                  className="px-6 py-2.5 bg-[#0098EA] text-black rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Explore Upcoming Drops
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {userWhitelistedDrops.map(drop => {
                  const isLive = new Date(drop.releaseDate).getTime() <= Date.now() || drop.status === 'live';
                  return (
                    <div key={drop.id} className="bg-neutral-900/40 p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-lg">
                      <div className="flex items-center gap-4">
                        <img 
                          src={drop.coverUrl} 
                          alt={drop.title} 
                          referrerPolicy="no-referrer"
                          className="w-20 h-20 rounded-2xl object-cover shrink-0" 
                        />
                        <div className="space-y-1">
                          <h4 className="font-black text-base uppercase tracking-tight">{drop.title}</h4>
                          <p className="text-xs text-neutral-400 font-mono">By {drop.artist} • Price: {drop.priceTon} TON</p>
                          <div className="inline-flex items-center gap-1.5 text-[9px] bg-emerald-400/10 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full uppercase">
                            <CheckCircle2 className="h-3 w-3" /> Whitelist Confirmed
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-start sm:items-end gap-3 w-full sm:w-auto">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono block mb-1">Opens In</span>
                          <DropCountdown targetDate={drop.releaseDate} />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleToggleNotify(drop, e)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                              subscribedDropIds.includes(drop.id)
                                ? 'bg-amber-400 text-black shadow-md hover:bg-amber-300'
                                : 'bg-white/[0.06] text-neutral-300 hover:text-white'
                            }`}
                            title={subscribedDropIds.includes(drop.id) ? 'Push reminders enabled for this countdown' : 'Notify Me: Get push alerts'}
                            aria-label="Notify Me"
                          >
                            {subscribedDropIds.includes(drop.id) ? (
                              <>
                                <BellRing className="w-3.5 h-3.5 fill-current animate-pulse" />
                                <span className="text-[10px] uppercase font-bold">Alerts On</span>
                              </>
                            ) : (
                              <>
                                <Bell className="w-3.5 h-3.5" />
                                <span className="text-[10px] uppercase font-bold">Notify Me</span>
                              </>
                            )}
                          </button>
                          {isLive && (
                            <button
                              onClick={() => {
                                setMintingDrop(drop);
                                setMintQuantity(1);
                              }}
                              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
                            >
                              <Zap className="w-3.5 h-3.5 fill-current" /> Mint Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ARTIST STUDIO TAB */}
        {activeTab === 'studio' && (
          <motion.div
            key="studio"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left: Schedule Drop Form */}
            <div className="lg:col-span-6 bg-neutral-900/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="space-y-1">
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#00E5FF]" />
                  Schedule Music NFT Drop
                </h3>
                <p className="text-xs text-neutral-400">Launch and countdown your upcoming tracks on TON blockchain with customizable whitelist allocations.</p>
              </div>

              <form onSubmit={handleScheduleDrop} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">Drop / Album Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Neon Horizon EP: Cyber Master"
                    className="w-full text-xs bg-black/40 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#0098EA] placeholder-neutral-600"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">Music Genre</label>
                    <select
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value)}
                      className="w-full text-xs bg-black/40 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#0098EA]"
                    >
                      <option value="Electronic">Electronic</option>
                      <option value="Phonk / Vaporwave">Phonk / Vaporwave</option>
                      <option value="Synthwave / Cyberpunk">Synthwave / Cyberpunk</option>
                      <option value="Ambient / Classical Web3">Ambient / Classical Web3</option>
                      <option value="City Pop / Nu-Disco">City Pop / Nu-Disco</option>
                      <option value="Hip-Hop">Hip-Hop</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">Total Drop Supply *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="100"
                      className="w-full text-xs bg-black/40 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#0098EA]"
                      value={newSupply}
                      onChange={(e) => setNewSupply(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">Price in TON *</label>
                    <input
                      type="number"
                      required
                      min="0.1"
                      step="any"
                      placeholder="10"
                      className="w-full text-xs bg-black/40 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#0098EA]"
                      value={newPriceTon}
                      onChange={(e) => setNewPriceTon(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">Price in GRAM Token</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="2000"
                      className="w-full text-xs bg-black/40 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#0098EA]"
                      value={newPriceGram}
                      onChange={(e) => setNewPriceGram(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">Release Date *</label>
                    <input
                      type="date"
                      required
                      className="w-full text-xs bg-black/40 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#0098EA]"
                      value={newReleaseDate}
                      onChange={(e) => setNewReleaseDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">Release Time *</label>
                    <input
                      type="time"
                      required
                      className="w-full text-xs bg-black/40 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#0098EA]"
                      value={newReleaseTime}
                      onChange={(e) => setNewReleaseTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">Whitelist Cap</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="50"
                      className="w-full text-xs bg-black/40 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#0098EA]"
                      value={newWhitelistLimit}
                      onChange={(e) => setNewWhitelistLimit(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">Audio Sample URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      className="w-full text-xs bg-black/40 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#0098EA] placeholder-neutral-600"
                      value={newAudioPreviewUrl}
                      onChange={(e) => setNewAudioPreviewUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">Cover Artwork URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    className="w-full text-xs bg-black/40 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#0098EA] placeholder-neutral-600"
                    value={newCoverUrl}
                    onChange={(e) => setNewCoverUrl(e.target.value)}
                  />
                </div>

                {/* Collector Perks & Utility */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400">Collector Utility & Perks</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. VIP Backstage Pass, Master FLAC Stems"
                      className="flex-1 text-xs bg-black/40 text-white rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-1 focus:ring-[#0098EA] placeholder-neutral-600"
                      value={newPerkInput}
                      onChange={(e) => setNewPerkInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPerk(); } }}
                    />
                    <button
                      type="button"
                      onClick={handleAddPerk}
                      className="px-4 py-2.5 bg-neutral-800 hover:bg-[#0098EA] text-white hover:text-black text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {newPerksList.map((perk, idx) => (
                      <span key={idx} className="bg-white/[0.04] px-3 py-1 rounded-xl text-[10px] text-neutral-300 flex items-center gap-1.5">
                        {perk}
                        <button type="button" onClick={() => handleRemovePerk(idx)} className="text-neutral-500 hover:text-rose-400">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">Drop Description & Lore *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe the musical composition, production techniques, and holder rewards."
                    className="w-full text-xs bg-black/40 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#0098EA] placeholder-neutral-600"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-[#0098EA] to-[#00E5FF] hover:opacity-95 text-black text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Rocket className="w-4 h-4" />
                  Schedule Drop & Activate Launchpad
                </button>
              </form>
            </div>

            {/* Right: Active Releases & Whitelist Management */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Studio Scheduled Drops List */}
              <div className="bg-neutral-900/40 rounded-3xl p-6 space-y-4 shadow-xl">
                <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  <Layers className="h-5 w-5 text-[#00E5FF]" />
                  Active Releases Studio
                </h3>

                {drops.length === 0 ? (
                  <p className="text-xs text-neutral-500">No scheduled drops available.</p>
                ) : (
                  <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                    {drops.map(drop => (
                      <div 
                        key={drop.id} 
                        className={`p-4 rounded-2xl flex items-center justify-between transition-all duration-300 ${
                          selectedDropForMgmt?.id === drop.id ? 'bg-[#0098EA]/20' : 'bg-black/30 hover:bg-black/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={drop.coverUrl} 
                            alt={drop.title} 
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover shrink-0" 
                          />
                          <div>
                            <h4 className="font-bold text-xs uppercase tracking-tight">{drop.title}</h4>
                            <p className="text-[10px] text-neutral-400 font-mono">{drop.priceTon} TON • {drop.whitelist.length}/{drop.whitelistLimit} whitelisted</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedDropForMgmt(drop)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                              selectedDropForMgmt?.id === drop.id 
                                ? 'bg-[#0098EA] text-black font-black' 
                                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                            }`}
                          >
                            Manage Whitelist
                          </button>
                          <button
                            onClick={() => handleDeleteDrop(drop.id)}
                            className="p-2 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                            title="Cancel drop"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Whitelist Management Detail Panel */}
              {selectedDropForMgmt && (
                <div className="bg-neutral-900/40 rounded-3xl p-6 space-y-6 shadow-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#00E5FF]">Whitelist Console</span>
                      <h4 className="text-base font-black uppercase tracking-tight">{selectedDropForMgmt.title}</h4>
                      <p className="text-[10px] text-neutral-400 font-mono">Capacity: {selectedDropForMgmt.whitelist.length} / {selectedDropForMgmt.whitelistLimit} collectors</p>
                    </div>
                  </div>

                  {/* Add Whitelist Form: Single vs Bulk */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Single Address Add */}
                    <div className="bg-black/40 p-4 rounded-2xl space-y-3">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-neutral-300 flex items-center gap-1.5">
                        <UserPlus className="h-3.5 w-3.5 text-[#00E5FF]" /> Add Single TON Wallet
                      </h5>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="EQB-z9X_... / UQ..."
                          className="w-full text-xs bg-neutral-950 text-white rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#0098EA] placeholder-neutral-700 font-mono"
                          value={manualAddress}
                          onChange={(e) => setManualAddress(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={handleAddManualAddress}
                          className="w-full py-2 bg-neutral-800 hover:bg-[#0098EA] text-white hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                        >
                          Register Address
                        </button>
                      </div>
                    </div>

                    {/* Bulk Address Add */}
                    <div className="bg-black/40 p-4 rounded-2xl space-y-3">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-neutral-300 flex items-center gap-1.5">
                        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" /> Bulk Import Wallets
                      </h5>
                      <div className="space-y-2">
                        <textarea
                          placeholder="Paste addresses (separated by comma or newline)"
                          rows={2}
                          className="w-full text-xs bg-neutral-950 text-white rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#0098EA] placeholder-neutral-700 font-mono leading-tight"
                          value={bulkAddresses}
                          onChange={(e) => setBulkAddresses(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={handleAddBulkAddresses}
                          className="w-full py-2 bg-neutral-800 hover:bg-emerald-500 text-white hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                        >
                          Bulk Import
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Registered Wallets List */}
                  <div className="bg-black/40 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-neutral-300 flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-[#00E5FF]" /> Whitelisted Wallets ({selectedDropForMgmt.whitelist.length})
                      </h5>
                    </div>

                    {selectedDropForMgmt.whitelist.length === 0 ? (
                      <p className="text-xs text-neutral-500 py-3 text-center">No addresses whitelisted for this drop yet.</p>
                    ) : (
                      <div className="max-h-[180px] overflow-y-auto space-y-2 pr-1">
                        {selectedDropForMgmt.whitelist.map((addr, idx) => (
                          <div key={`${addr}-${idx}`} className="flex justify-between items-center bg-neutral-950/60 p-2.5 rounded-xl">
                            <span className="font-mono text-[10px] text-neutral-300 break-all select-all">{addr}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFromWhitelist(addr)}
                              className="text-neutral-500 hover:text-rose-400 p-1 rounded-lg transition-colors cursor-pointer"
                              title="Remove"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* 5. DIRECT ON-CHAIN MINTING MODAL */}
      <AnimatePresence>
        {mintingDrop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c143d] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#00E5FF]">
                  <Zap className="w-5 h-5 fill-current" />
                  <h3 className="text-lg font-black uppercase tracking-tight">Mint Music NFT</h3>
                </div>
                <button
                  onClick={() => setMintingDrop(null)}
                  className="text-neutral-400 hover:text-white text-xl font-bold p-1"
                >
                  ×
                </button>
              </div>

              {/* Cover & Drop preview */}
              <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl">
                <img
                  src={mintingDrop.coverUrl}
                  alt={mintingDrop.title}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-tight text-white">{mintingDrop.title}</h4>
                  <p className="text-xs text-neutral-400">By {mintingDrop.artist}</p>
                  <p className="text-xs font-mono font-bold text-[#00E5FF] mt-1">{mintingDrop.priceTon} TON each</p>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="bg-black/30 p-4 rounded-2xl flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-300">Quantity to Mint:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMintQuantity(Math.max(1, mintQuantity - 1))}
                    className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono text-base font-black text-white min-w-[20px] text-center">{mintQuantity}</span>
                  <button
                    onClick={() => setMintQuantity(Math.min(5, mintQuantity + 1))}
                    className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-black/30 p-4 rounded-2xl space-y-2 text-xs font-mono">
                <div className="flex justify-between text-neutral-400">
                  <span>Unit Price:</span>
                  <span className="text-white">{mintingDrop.priceTon} TON</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Connected Wallet:</span>
                  <span className="text-white">{connectedAddress ? `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}` : 'Not Connected'}</span>
                </div>
                <div className="flex justify-between text-neutral-300 font-bold pt-2">
                  <span>Total Amount:</span>
                  <span className="text-[#00E5FF] text-sm">{(mintingDrop.priceTon * mintQuantity).toFixed(2)} TON</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  disabled={isMintingOnChain}
                  onClick={() => handleExecuteTonMint(mintingDrop)}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-95 text-black text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isMintingOnChain ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                      Broadcasting to TON Chain...
                    </span>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      Confirm & Mint {(mintingDrop.priceTon * mintQuantity).toFixed(2)} TON
                    </>
                  )}
                </button>
                <button
                  onClick={() => setMintingDrop(null)}
                  className="w-full py-2.5 text-xs text-neutral-400 hover:text-white transition-colors text-center cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
