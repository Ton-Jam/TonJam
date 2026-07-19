import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/contexts/AudioContext';
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
  Info, 
  UserCheck, 
  ArrowRight,
  Sparkles,
  Search,
  Upload,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { toast } from 'sonner';

interface NFTDrop {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  price: string; // e.g. "15 TON"
  supply: number;
  coverUrl: string;
  releaseDate: string; // ISO String
  description: string;
  whitelist: string[]; // Whitelisted wallet addresses or usernames
  whitelistLimit: number;
}

const INITIAL_DROPS: NFTDrop[] = [
  {
    id: "drop-1",
    title: "Vaporwave Nights EP",
    artist: "DJKrupy AI",
    artistId: "artist-krupy",
    price: "15 TON",
    supply: 150,
    coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400",
    releaseDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2.5).toISOString(), // 2.5 days from now
    description: "The ultimate neural-synthesized vaporwave collection. Immerse yourself in twilight lo-fi beats crafted by DJKrupy AI. Holding this NFT grants premium VIP club access and future drop whitelists.",
    whitelist: ["EQB-z9X_GZ_uR...", "UQAn8_W91x_4m...", "EQC-99X_123_abc"],
    whitelistLimit: 50,
  },
  {
    id: "drop-2",
    title: "Cybernetic Resonance",
    artist: "Aether Flux",
    artistId: "artist-aether",
    price: "35 TON",
    supply: 50,
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=400",
    releaseDate: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(), // 18 hours from now
    description: "High-octane cyberpunk audio tracks synchronized with 3D generative visuals. A masterclass in modular synthesizer synthesis and neural networking.",
    whitelist: ["EQB-z9X_GZ_uR..."],
    whitelistLimit: 25,
  },
  {
    id: "drop-3",
    title: "Symphony of the Blockchain",
    artist: "Satoshi Symphony",
    artistId: "artist-satoshi",
    price: "50 TON",
    supply: 20,
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400",
    releaseDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days from now
    description: "An orchestral ambient masterpiece dedicated to the genesis block. Rich soundscapes crafted using real-time blockchain telemetry data mapped to classical instrument arrays.",
    whitelist: [],
    whitelistLimit: 10,
  }
];

// Countdown Component
const DropCountdown: React.FC<{ targetDate: string }> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false
  });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
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
  }, [targetDate]);

  if (timeLeft.isOver) {
    return (
      <div className="bg-emerald-500/10 text-emerald-400 font-bold tracking-wider uppercase text-[10px] px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 self-start">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Drop is Active / Live
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="flex flex-col items-center bg-zinc-900/60 backdrop-blur-md px-3 py-2 rounded-xl min-w-[50px]">
        <span className="font-mono text-lg font-black text-white">{String(timeLeft.days).padStart(2, '0')}</span>
        <span className="text-[8px] uppercase tracking-wider text-zinc-500">Days</span>
      </div>
      <div className="flex flex-col items-center bg-zinc-900/60 backdrop-blur-md px-3 py-2 rounded-xl min-w-[50px]">
        <span className="font-mono text-lg font-black text-[#0098EA]">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-[8px] uppercase tracking-wider text-zinc-500">Hrs</span>
      </div>
      <div className="flex flex-col items-center bg-zinc-900/60 backdrop-blur-md px-3 py-2 rounded-xl min-w-[50px]">
        <span className="font-mono text-lg font-black text-[#0098EA]">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-[8px] uppercase tracking-wider text-zinc-500">Min</span>
      </div>
      <div className="flex flex-col items-center bg-zinc-900/60 backdrop-blur-md px-3 py-2 rounded-xl min-w-[50px]">
        <span className="font-mono text-lg font-black text-rose-500">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="text-[8px] uppercase tracking-wider text-zinc-500">Sec</span>
      </div>
    </div>
  );
};

export default function NFTLaunchpad() {
  const { user, userProfile } = useAuth();
  const { isArtist, isAdmin } = useUserRole();
  const [drops, setDrops] = useState<NFTDrop[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'my-whitelists' | 'studio'>('upcoming');
  
  // Create Drop Form States
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('10');
  const [newSupply, setNewSupply] = useState('100');
  const [newCoverUrl, setNewCoverUrl] = useState('');
  const [newReleaseDate, setNewReleaseDate] = useState('');
  const [newReleaseTime, setNewReleaseTime] = useState('12:00');
  const [newDescription, setNewDescription] = useState('');
  const [newWhitelistLimit, setNewWhitelistLimit] = useState('50');

  // Whitelist Management States
  const [selectedDropForMgmt, setSelectedDropForMgmt] = useState<NFTDrop | null>(null);
  const [manualAddress, setManualAddress] = useState('');
  const [bulkAddresses, setBulkAddresses] = useState('');

  // Collector join whitelist state
  const [joinWallet, setJoinWallet] = useState('');

  // Load and cache drops
  useEffect(() => {
    const cached = localStorage.getItem('tonjam_launchpad_drops');
    if (cached) {
      try {
        setDrops(JSON.parse(cached));
      } catch (e) {
        setDrops(INITIAL_DROPS);
      }
    } else {
      setDrops(INITIAL_DROPS);
      localStorage.setItem('tonjam_launchpad_drops', JSON.stringify(INITIAL_DROPS));
    }
  }, []);

  const saveDrops = (updatedDrops: NFTDrop[]) => {
    setDrops(updatedDrops);
    localStorage.setItem('tonjam_launchpad_drops', JSON.stringify(updatedDrops));
  };

  const handleCreateDrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice || !newSupply || !newReleaseDate || !newDescription) {
      toast.error('Please fill in all required fields');
      return;
    }

    const isoDateTime = new Date(`${newReleaseDate}T${newReleaseTime || '12:00'}`).toISOString();
    const defaultCovers = [
      "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=400"
    ];

    const randomCover = defaultCovers[Math.floor(Math.random() * defaultCovers.length)];

    const newDrop: NFTDrop = {
      id: `drop-${Date.now()}`,
      title: newTitle,
      artist: userProfile?.name || userProfile?.username || user?.email?.split('@')[0] || "Verified Artist",
      artistId: user?.uid || "artist-temp",
      price: `${newPrice} TON`,
      supply: parseInt(newSupply) || 100,
      coverUrl: newCoverUrl || randomCover,
      releaseDate: isoDateTime,
      description: newDescription,
      whitelist: [],
      whitelistLimit: parseInt(newWhitelistLimit) || 50
    };

    const updated = [newDrop, ...drops];
    saveDrops(updated);
    toast.success('Successfully scheduled new NFT drop!');
    
    // Clear form
    setNewTitle('');
    setNewPrice('10');
    setNewSupply('100');
    setNewCoverUrl('');
    setNewReleaseDate('');
    setNewReleaseTime('12:00');
    setNewDescription('');
    setNewWhitelistLimit('50');
    
    setActiveTab('upcoming');
  };

  const handleDeleteDrop = (id: string) => {
    const updated = drops.filter(d => d.id !== id);
    saveDrops(updated);
    if (selectedDropForMgmt?.id === id) {
      setSelectedDropForMgmt(null);
    }
    toast.success('Scheduled drop canceled successfully');
  };

  const handleJoinWhitelist = (dropId: string, customAddress?: string) => {
    const addressToUse = customAddress || joinWallet || userProfile?.walletAddress || "EQB_Default_Wallet_Holder_Address_1";
    if (!addressToUse.trim()) {
      toast.error('Please provide a valid wallet address');
      return;
    }

    const dropIndex = drops.findIndex(d => d.id === dropId);
    if (dropIndex === -1) return;

    const drop = drops[dropIndex];
    if (drop.whitelist.includes(addressToUse)) {
      toast.info('This address is already registered on the whitelist');
      return;
    }

    if (drop.whitelist.length >= drop.whitelistLimit) {
      toast.error('Whitelist cap reached for this drop!');
      return;
    }

    const updatedWhitelist = [...drop.whitelist, addressToUse];
    const updatedDrops = [...drops];
    updatedDrops[dropIndex] = { ...drop, whitelist: updatedWhitelist };
    saveDrops(updatedDrops);
    
    toast.success('🎉 Congratulations! You have been whitelisted for this drop!');
    setJoinWallet('');
  };

  const handleAddManualAddress = () => {
    if (!selectedDropForMgmt || !manualAddress.trim()) {
      toast.error('Please specify a valid wallet address');
      return;
    }

    const addr = manualAddress.trim();
    if (selectedDropForMgmt.whitelist.includes(addr)) {
      toast.error('Address already exists on this whitelist');
      return;
    }

    if (selectedDropForMgmt.whitelist.length >= selectedDropForMgmt.whitelistLimit) {
      toast.error('Whitelist limit exceeded');
      return;
    }

    const updatedDrops = drops.map(d => {
      if (d.id === selectedDropForMgmt.id) {
        const updatedWhitelist = [...d.whitelist, addr];
        setSelectedDropForMgmt({ ...d, whitelist: updatedWhitelist });
        return { ...d, whitelist: updatedWhitelist };
      }
      return d;
    });

    saveDrops(updatedDrops);
    setManualAddress('');
    toast.success('Wallet address whitelisted!');
  };

  const handleAddBulkAddresses = () => {
    if (!selectedDropForMgmt || !bulkAddresses.trim()) {
      toast.error('No addresses provided');
      return;
    }

    // Split by comma or newline
    const parsed = bulkAddresses
      .split(/[,\n]+/)
      .map(a => a.trim())
      .filter(a => a.length > 0);

    if (parsed.length === 0) {
      toast.error('No valid addresses found');
      return;
    }

    const existingSet = new Set(selectedDropForMgmt.whitelist);
    const added: string[] = [];
    const skipped: string[] = [];

    for (const addr of parsed) {
      if (existingSet.has(addr)) {
        skipped.push(addr);
      } else if (existingSet.size < selectedDropForMgmt.whitelistLimit) {
        existingSet.add(addr);
        added.push(addr);
      } else {
        toast.warning(`Whitelist full! Stopped importing after ${added.length} additions.`);
        break;
      }
    }

    const updatedWhitelist = Array.from(existingSet);
    const updatedDrops = drops.map(d => {
      if (d.id === selectedDropForMgmt.id) {
        setSelectedDropForMgmt({ ...d, whitelist: updatedWhitelist });
        return { ...d, whitelist: updatedWhitelist };
      }
      return d;
    });

    saveDrops(updatedDrops);
    setBulkAddresses('');
    toast.success(`Successfully added ${added.length} addresses. Skipped ${skipped.length} duplicates.`);
  };

  const handleRemoveFromWhitelist = (address: string) => {
    if (!selectedDropForMgmt) return;

    const updatedWhitelist = selectedDropForMgmt.whitelist.filter(a => a !== address);
    const updatedDrops = drops.map(d => {
      if (d.id === selectedDropForMgmt.id) {
        setSelectedDropForMgmt({ ...d, whitelist: updatedWhitelist });
        return { ...d, whitelist: updatedWhitelist };
      }
      return d;
    });

    saveDrops(updatedDrops);
    toast.success('Address removed from whitelist');
  };

  // Filter drops the user has whitelisted on
  const userWhitelistedAddresses = [
    userProfile?.walletAddress,
    "EQB-z9X_GZ_uR...", // Add mock for demo continuity
  ].filter(Boolean);

  const myWhitelists = drops.filter(d => 
    d.whitelist.some(addr => userWhitelistedAddresses.includes(addr))
  );

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 md:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-[#0098EA]/20 to-indigo-500/20 text-[#0098EA] rounded-2xl">
            <Rocket className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase font-sans">NFT Launchpad</h1>
            <p className="text-xs text-zinc-400 font-mono">SCHEDULE, DISCOVER, AND GAIN WHITELIST ACCESS TO PREMIUM AUDIO DROP GEMS</p>
          </div>
        </div>
      </div>

      {/* Tabs Menu - NO BORDERS */}
      <div className="flex gap-2 p-1.5 bg-zinc-900/40 rounded-2xl w-full max-w-md">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'upcoming' 
              ? 'bg-[#0098EA] text-white shadow-lg' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
          }`}
        >
          Upcoming Drops
        </button>
        <button
          onClick={() => setActiveTab('my-whitelists')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'my-whitelists' 
              ? 'bg-[#0098EA] text-white shadow-lg' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
          }`}
        >
          My Whitelists ({myWhitelists.length})
        </button>
        <button
          onClick={() => setActiveTab('studio')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'studio' 
              ? 'bg-[#0098EA] text-white shadow-lg' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
          }`}
        >
          Artist Studio
        </button>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'upcoming' && (
          <motion.div
            key="upcoming"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {drops.length === 0 ? (
              <div className="lg:col-span-3 text-center py-16 bg-zinc-900/20 rounded-3xl p-8 space-y-3">
                <Rocket className="h-12 w-12 text-zinc-600 mx-auto" />
                <h3 className="text-lg font-bold text-zinc-400 uppercase">No scheduled drops active</h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">Get ready for upcoming releases! Switch to the Artist Studio tab to schedule and list a new drop.</p>
              </div>
            ) : (
              drops.map((drop) => {
                const userHasWhitelisted = drop.whitelist.some(addr => userWhitelistedAddresses.includes(addr));
                return (
                  <div 
                    key={drop.id} 
                    className="group bg-zinc-900/30 hover:bg-zinc-900/50 rounded-3xl overflow-hidden p-5 flex flex-col justify-between transition-all duration-300 shadow-xl space-y-4"
                  >
                    {/* Cover Header */}
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-md">
                      <img 
                        src={drop.coverUrl} 
                        alt={drop.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider text-[#0098EA] flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        {drop.price}
                      </div>
                      <div className="absolute top-3 right-3 bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider text-emerald-400">
                        {drop.supply} Units
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h2 className="text-lg font-black tracking-tight uppercase group-hover:text-[#0098EA] transition-colors">{drop.title}</h2>
                          <p className="text-xs text-zinc-400 font-medium">By {drop.artist}</p>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{drop.description}</p>
                    </div>

                    {/* Whitelist Stats */}
                    <div className="bg-black/40 p-3 rounded-2xl flex justify-between items-center text-[10px] font-mono">
                      <span className="text-zinc-500 uppercase">Whitelist spots filled</span>
                      <span className="text-white font-bold">
                        {drop.whitelist.length} / {drop.whitelistLimit} ({Math.round((drop.whitelist.length / drop.whitelistLimit) * 100)}%)
                      </span>
                    </div>

                    {/* Countdown Section */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-mono block">Mint Drops In:</span>
                      <DropCountdown targetDate={drop.releaseDate} />
                    </div>

                    {/* Whitelist Signup Action */}
                    <div className="pt-2">
                      {userHasWhitelisted ? (
                        <div className="w-full py-3 bg-emerald-500/10 text-emerald-400 rounded-2xl text-center text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Whitelisted For Drop
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input 
                            type="text" 
                            placeholder="Enter TON wallet address to join" 
                            className="w-full text-xs bg-black/40 text-white rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#0098EA] placeholder-zinc-600 font-mono text-center"
                            value={joinWallet}
                            onChange={(e) => setJoinWallet(e.target.value)}
                          />
                          <button
                            onClick={() => handleJoinWhitelist(drop.id)}
                            className="w-full py-3 bg-zinc-800 hover:bg-[#0098EA] text-white hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-md cursor-pointer"
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                            Secure Whitelist Slot
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}

        {activeTab === 'my-whitelists' && (
          <motion.div
            key="my-whitelists"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {myWhitelists.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900/20 rounded-3xl p-8 space-y-3">
                <Users className="h-12 w-12 text-zinc-600 mx-auto" />
                <h3 className="text-lg font-bold text-zinc-400 uppercase">You aren't on any whitelists yet</h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">Discover upcoming music NFT drops and sign up to secure your spots before they release!</p>
                <button 
                  onClick={() => setActiveTab('upcoming')}
                  className="px-6 py-2.5 bg-[#0098EA] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                  Browse Drops
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myWhitelists.map(drop => (
                  <div key={drop.id} className="bg-zinc-900/30 p-5 rounded-3xl flex items-center gap-4 shadow-md justify-between">
                    <div className="flex items-center gap-4">
                      <img 
                        src={drop.coverUrl} 
                        alt={drop.title} 
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover" 
                      />
                      <div>
                        <h3 className="font-black text-sm uppercase tracking-tight">{drop.title}</h3>
                        <p className="text-[10px] text-zinc-400 font-mono">By {drop.artist} • Price: {drop.price}</p>
                        <div className="mt-1.5 inline-flex items-center gap-1.5 text-[9px] bg-emerald-400/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase">
                          <CheckCircle className="h-3 w-3" /> Registered Verified
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-mono block mb-1">Releases In</span>
                      <DropCountdown targetDate={drop.releaseDate} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'studio' && (
          <motion.div
            key="studio"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Create Drop Section */}
            <div className="lg:col-span-5 bg-zinc-900/20 rounded-3xl p-6 space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#0098EA]" />
                  Schedule Upcoming Drop
                </h3>
                <p className="text-xs text-zinc-400">Mint your upcoming tracks directly as limited edition music NFTs.</p>
              </div>

              <form onSubmit={handleCreateDrop} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">NFT Drop Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Genesis Beats Album Part 2"
                    className="w-full text-xs bg-zinc-950 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#0098EA] placeholder-zinc-700"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">Drop Price (TON) *</label>
                    <input
                      type="number"
                      required
                      min="0.1"
                      step="any"
                      placeholder="e.g. 15"
                      className="w-full text-xs bg-zinc-950 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#0098EA]"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">Total Supply Limit *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 100"
                      className="w-full text-xs bg-zinc-950 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#0098EA]"
                      value={newSupply}
                      onChange={(e) => setNewSupply(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">Release Date *</label>
                    <input
                      type="date"
                      required
                      className="w-full text-xs bg-zinc-950 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#0098EA] text-zinc-400"
                      value={newReleaseDate}
                      onChange={(e) => setNewReleaseDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">Release Time *</label>
                    <input
                      type="time"
                      required
                      className="w-full text-xs bg-zinc-950 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#0098EA] text-zinc-400"
                      value={newReleaseTime}
                      onChange={(e) => setNewReleaseTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">Whitelist Cap Limit</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 50"
                      className="w-full text-xs bg-zinc-950 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#0098EA]"
                      value={newWhitelistLimit}
                      onChange={(e) => setNewWhitelistLimit(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">Custom Cover URL</label>
                    <input
                      type="url"
                      placeholder="Optional https://..."
                      className="w-full text-xs bg-zinc-950 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#0098EA] placeholder-zinc-700"
                      value={newCoverUrl}
                      onChange={(e) => setNewCoverUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">Drop Description *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide collectors with details about utility, album themes, or custom tracks."
                    className="w-full text-xs bg-zinc-950 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#0098EA] placeholder-zinc-700"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#0098EA] hover:bg-[#0098EA]/80 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-lg cursor-pointer"
                >
                  Schedule Drop & Whitelist
                </button>
              </form>
            </div>

            {/* List and Whitelist Management Section */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-zinc-900/20 rounded-3xl p-6 space-y-4">
                <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  <Layers className="h-5 w-5 text-[#0098EA]" />
                  Active Releases Studio
                </h3>

                {drops.length === 0 ? (
                  <p className="text-xs text-zinc-500">No scheduled drops available to manage.</p>
                ) : (
                  <div className="space-y-3">
                    {drops.map(drop => (
                      <div 
                        key={drop.id} 
                        className={`p-4 rounded-2xl flex items-center justify-between transition-all duration-300 ${
                          selectedDropForMgmt?.id === drop.id ? 'bg-[#0098EA]/10' : 'bg-black/30 hover:bg-black/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={drop.coverUrl} 
                            alt={drop.title} 
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover" 
                          />
                          <div>
                            <h4 className="font-bold text-xs uppercase tracking-tight">{drop.title}</h4>
                            <p className="text-[10px] text-zinc-400 font-mono">By {drop.artist} • {drop.whitelist.length} whitelisted spots filled</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedDropForMgmt(drop)}
                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors ${
                              selectedDropForMgmt?.id === drop.id 
                                ? 'bg-[#0098EA] text-white' 
                                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                            }`}
                          >
                            Manage Whitelist
                          </button>
                          <button
                            onClick={() => handleDeleteDrop(drop.id)}
                            className="p-2 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
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

              {/* Active Drop Whitelist Panel */}
              {selectedDropForMgmt && (
                <div className="bg-zinc-900/20 rounded-3xl p-6 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#0098EA]">Active Management</span>
                      <h3 className="text-md font-black uppercase tracking-tight">{selectedDropForMgmt.title}</h3>
                      <p className="text-[10px] text-zinc-400 font-mono">Cap: {selectedDropForMgmt.whitelist.length} / {selectedDropForMgmt.whitelistLimit} collectors</p>
                    </div>
                  </div>

                  {/* Add Whitelist Address Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Manual Address */}
                    <div className="bg-black/40 p-4 rounded-2xl space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-300 flex items-center gap-1.5">
                        <UserPlus className="h-3.5 w-3.5 text-[#0098EA]" /> Add Address Manually
                      </h4>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="e.g. EQC-99X_abc_123_xyz"
                          className="w-full text-xs bg-zinc-950 text-white rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#0098EA] placeholder-zinc-700 font-mono"
                          value={manualAddress}
                          onChange={(e) => setManualAddress(e.target.value)}
                        />
                        <button
                          onClick={handleAddManualAddress}
                          className="w-full py-2 bg-zinc-800 hover:bg-[#0098EA] text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                        >
                          Register Wallet
                        </button>
                      </div>
                    </div>

                    {/* Bulk Import */}
                    <div className="bg-black/40 p-4 rounded-2xl space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-300 flex items-center gap-1.5">
                        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" /> Import Bulk Wallets
                      </h4>
                      <div className="space-y-2">
                        <textarea
                          placeholder="Paste wallets (separated by commas or lines)"
                          rows={2}
                          className="w-full text-xs bg-zinc-950 text-white rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#0098EA] placeholder-zinc-700 font-mono leading-tight"
                          value={bulkAddresses}
                          onChange={(e) => setBulkAddresses(e.target.value)}
                        />
                        <button
                          onClick={handleAddBulkAddresses}
                          className="w-full py-2 bg-zinc-800 hover:bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                        >
                          Bulk Add Wallets
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Whitelist Members List */}
                  <div className="bg-black/40 p-4 rounded-2xl space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-300 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-[#0098EA]" /> Whitelisted Wallets ({selectedDropForMgmt.whitelist.length})
                    </h4>

                    {selectedDropForMgmt.whitelist.length === 0 ? (
                      <p className="text-xs text-zinc-500 py-4 text-center">No addresses whitelisted for this drop yet.</p>
                    ) : (
                      <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                        {selectedDropForMgmt.whitelist.map((addr, idx) => (
                          <div key={`${addr}-${idx}`} className="flex justify-between items-center bg-zinc-950/40 p-2.5 rounded-xl">
                            <span className="font-mono text-[10px] text-zinc-300 break-all select-all">{addr}</span>
                            <button
                              onClick={() => handleRemoveFromWhitelist(addr)}
                              className="text-zinc-500 hover:text-rose-500 p-1 rounded-lg transition-colors"
                              title="Remove from whitelist"
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
    </div>
  );
}
