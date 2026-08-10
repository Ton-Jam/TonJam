import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Music, 
  Gem, 
  User, 
  ExternalLink, 
  Share2, 
  LayoutDashboard,
  Verified,
  Sparkles,
  ArrowRight,
  Play,
  LayoutGrid,
  TrendingUp,
  BarChart3,
  QrCode
} from 'lucide-react';
import { ProfileQRCodeModal } from '@/components/profile/ProfileQRCodeModal';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { doc, updateDoc } from 'firebase/firestore';
import { useUser } from '@/contexts/UserContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { NFTItem } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function ArtistPortfolio() {
  const { userProfile, loading } = useUser();
  const navigate = useNavigate();
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(true);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  useEffect(() => {
    async function fetchArtistNFTs() {
      if (!userProfile?.uid) return;
      
      try {
        const nftsRef = collection(db, 'nfts');
        const q = query(nftsRef, where('artistId', '==', userProfile.uid));
        const querySnapshot = await getDocs(q);
        
        const fetchedNfts: NFTItem[] = [];
        querySnapshot.forEach((doc) => {
          fetchedNfts.push({ id: doc.id, ...doc.data() } as NFTItem);
        });
        
        setNfts(fetchedNfts);
      } catch (error) {
        console.error("Error fetching artist NFTs:", error);
      } finally {
        setIsLoadingNFTs(false);
      }
    }

    fetchArtistNFTs();
  }, [userProfile?.uid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <User className="w-12 h-12 text-zinc-800 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Authentication Required</h2>
        <p className="text-zinc-500 text-sm max-w-xs mb-6">
          Please sign in to access your dedicated artist portfolio dashboard.
        </p>
        <button 
          onClick={() => navigate('/login')}
          className="px-8 py-3 bg-white text-black font-bold rounded-full text-xs uppercase tracking-widest"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const handleShare = () => {
    setIsQRModalOpen(true);
  };

  const activityData = [
    { name: 'Mon', sales: 12, engagement: 450 },
    { name: 'Tue', sales: 19, engagement: 520 },
    { name: 'Wed', sales: 15, engagement: 480 },
    { name: 'Thu', sales: 22, engagement: 610 },
    { name: 'Fri', sales: 30, engagement: 850 },
    { name: 'Sat', sales: 25, engagement: 790 },
    { name: 'Sun', sales: 35, engagement: 920 },
  ];

  const SALES_THRESHOLD = 50;
  const LISTENERS_THRESHOLD = 1000;

  const currentSales = userProfile.milestones?.totalSales || 35; // Mocking if not present
  const currentListeners = userProfile.milestones?.totalListeners || 850;

  const checkMilestones = async () => {
    if (!userProfile.uid) return;
    
    if (!userProfile.isVerifiedArtist && (currentSales >= SALES_THRESHOLD || currentListeners >= LISTENERS_THRESHOLD)) {
      try {
        const userRef = doc(db, 'users', userProfile.uid);
        await updateDoc(userRef, { isVerifiedArtist: true });
        toast.success("Milestone Reached! You are now a Verified Artist.");
      } catch (e) {
        console.error("Error updating verification:", e);
      }
    }
  };

  useEffect(() => {
    checkMilestones();
  }, [currentSales, currentListeners]);

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Cover Photo Banner */}
      <div className="relative h-[130px] md:h-[170px] w-full overflow-hidden">
        {userProfile.coverPhoto ? (
          <img 
            src={userProfile.coverPhoto} 
            className="w-full h-full object-cover" 
            alt="Artist Cover" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-black relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <div className="absolute inset-0 flex items-center justify-center opacity-5">
               <LayoutGrid className="w-48 h-48" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-full px-4 pt-8 md:pt-12 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-1000 group-hover:duration-200" />
              <img 
                src={userProfile.avatar || getPlaceholderImage(userProfile.name)} 
                alt={userProfile.name}
                className="relative w-20 h-20 md:w-28 md:h-28 rounded-full border-2 border-white/10 object-cover bg-zinc-900"
              />
              {userProfile.isVerifiedArtist && (
                <div className="absolute bottom-1 right-1 bg-cyan-500 p-1 rounded-full border-2 border-black">
                  <Verified className="w-3 h-3 text-white fill-current" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-4xl font-black tracking-tight">{userProfile.name}</h1>
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
              <p className="text-zinc-500 font-mono text-xs tracking-wider">@{userProfile.username}</p>
              <div className="flex items-center gap-3 pt-2">
                <div className="px-2 py-1 bg-white/5 rounded-md border border-white/10">
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                    {userProfile.followers || 0} Followers
                  </span>
                </div>
                <div className="px-2 py-1 bg-white/5 rounded-md border border-white/10">
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                    {nfts.length} Collectibles
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsQRModalOpen(true)}
              className="h-10 px-3.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-xl border border-blue-500/20 flex items-center gap-2 text-xs font-bold transition-all"
              title="Share Profile QR Code"
            >
              <QrCode className="w-4 h-4 text-blue-400" /> Share QR
            </button>
            <button 
              onClick={handleShare}
              className="h-10 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl border border-white/10 flex items-center gap-2 text-xs font-bold transition-all"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button 
              onClick={() => navigate(`/artist/${userProfile.uid}`)}
              className="h-10 px-5 bg-white text-black hover:bg-zinc-200 rounded-xl flex items-center gap-2 text-xs font-bold transition-all"
            >
              Public View <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Activity & Trends Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-[32px] overflow-hidden"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-xl font-black uppercase tracking-tight">Performance Matrix</h2>
                </div>
                <p className="text-xs text-zinc-500 font-medium tracking-wide">Real-time listener engagement & NFT sales distribution</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">NFT Sales</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Engagement</span>
                </div>
              </div>
            </div>

            <div className="h-[300px] w-full">
              {/* @ts-ignore - Recharts type mismatch with React 18 */}
              <ResponsiveContainer width="100%" height="100%">
                {/* @ts-ignore */}
                <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  {/* @ts-ignore */}
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#52525b', fontWeight: 600 }}
                    dy={10}
                  />
                  {/* @ts-ignore */}
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#52525b', fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      border: '1px solid #ffffff10',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  {/* @ts-ignore */}
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#06b6d4" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                  />
                  {/* @ts-ignore */}
                  <Area 
                    type="monotone" 
                    dataKey="engagement" 
                    stroke="#a855f7" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorEngagement)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-[32px] flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Verified className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-black uppercase tracking-tight">Milestones</h2>
                </div>
                <p className="text-xs text-zinc-500 font-medium tracking-wide">Path to Verified Artist status</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">NFT Sales</span>
                    <span className="text-xs font-bold text-white">{currentSales} / {SALES_THRESHOLD}</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((currentSales / SALES_THRESHOLD) * 100, 100)}%` }}
                      className="h-full bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Listeners</span>
                    <span className="text-xs font-bold text-white">{currentListeners} / {LISTENERS_THRESHOLD}</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((currentListeners / LISTENERS_THRESHOLD) * 100, 100)}%` }}
                      className="h-full bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={`mt-8 p-4 rounded-2xl border transition-all duration-500 ${
              userProfile.isVerifiedArtist 
                ? 'bg-blue-500/10 border-blue-500/30' 
                : 'bg-white/5 border-white/5 opacity-60'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  userProfile.isVerifiedArtist ? 'bg-blue-500' : 'bg-zinc-800'
                }`}>
                  <Verified className={`w-5 h-5 ${userProfile.isVerifiedArtist ? 'text-white' : 'text-zinc-500'}`} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight">Verified Status</h3>
                  <p className="text-[10px] font-bold text-zinc-500">
                    {userProfile.isVerifiedArtist ? 'Official Badge Unlocked' : 'Thresholds not yet met'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Biography & Info */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-[24px] space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Artist Biography</h3>
                <User className="w-4 h-4 text-cyan-400/50" />
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                {userProfile.bio || "No biography provided. Head to profile settings to sign your narrative to the ledger."}
              </p>
              
              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Member Since</span>
                  <span className="text-zinc-300 font-mono">
                    {userProfile.createdAt ? new Date(userProfile.createdAt).getFullYear() : '2026'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Location</span>
                  <span className="text-zinc-300">{userProfile.location || "Global Node"}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Wallet</span>
                  <span className="text-zinc-300 font-mono truncate max-w-[120px]">
                    {userProfile.walletAddress || "Not Connected"}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-cyan-500/10 to-purple-600/10 backdrop-blur-xl border border-white/5 p-6 rounded-[24px] space-y-4"
            >
              <h3 className="text-sm font-black uppercase tracking-tight">Ecosystem Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Total Streams</span>
                  <span className="text-lg font-black text-white">{(userProfile.earnings || 0) * 100}</span>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">NFT Sales</span>
                  <span className="text-lg font-black text-cyan-400">{userProfile.nftEarnings || 0}</span>
                </div>
              </div>
              <button 
                onClick={() => navigate('/artist-analytics')}
                className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
              >
                Deep Insights <ArrowRight className="w-3 h-3" />
              </button>
            </motion.div>
          </div>

          {/* Right Column: Music NFT Showcase */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-cyan-500 rounded-full" />
                <h2 className="text-lg font-black tracking-tight uppercase">Music NFT Portfolio</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  {nfts.length} Assets
                </span>
                <div className="w-px h-3 bg-zinc-800" />
                <button 
                  onClick={() => navigate('/mint')}
                  className="text-[10px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest transition-all"
                >
                  Mint New
                </button>
              </div>
            </div>

            {isLoadingNFTs ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-48 bg-zinc-900/50 rounded-[24px] animate-pulse" />
                ))}
              </div>
            ) : nfts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {nfts.map((nft, idx) => (
                  <motion.div
                    key={nft.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 400,
                      damping: 17,
                      delay: idx * 0.05 
                    }}
                    className="group relative bg-zinc-900/30 hover:bg-zinc-900/50 border border-white/5 hover:border-cyan-500/30 rounded-[24px] overflow-hidden transition-colors duration-500 cursor-pointer shadow-lg hover:shadow-cyan-500/10"
                    onClick={() => navigate(`/nft/${nft.id}`)}
                  >
                    <div className="aspect-square overflow-hidden relative">
                      <img 
                        src={nft.imageUrl || nft.coverUrl || getPlaceholderImage(nft.title)} 
                        alt={nft.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                      
                      {/* Play Hover Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                          <Play className="w-5 h-5 text-white fill-current" />
                        </div>
                      </div>

                      {/* NFT Badge */}
                      <div className="absolute top-4 right-4 px-2 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg flex items-center gap-1.5">
                        <Gem className="w-3 h-3 text-cyan-400" />
                        <span className="text-[8px] font-black uppercase text-white tracking-widest">
                          NFT
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-1">
                      <h4 className="font-bold text-sm truncate uppercase tracking-tight">{nft.title}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                          {nft.edition || "1 of 1"}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-black text-cyan-400">{nft.price}</span>
                          <span className="text-[8px] font-black text-zinc-600 uppercase">TON</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-6 bg-zinc-900/20 border border-dashed border-white/10 rounded-[32px] text-center space-y-4">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center">
                  <Music className="w-8 h-8 text-zinc-700" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-white uppercase tracking-tight">No Portfolio Assets</h3>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                    You haven't minted any music NFTs yet. Start by uploading your first track and converting it to a digital collectible.
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/mint')}
                  className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-[10px] uppercase tracking-widest rounded-full transition-all"
                >
                  Mint First NFT
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Global Footer Navigation Shortcut */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-4 h-4 text-zinc-500" />
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Artist Workspace v2.4</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/artist-dashboard')} className="text-[9px] font-black text-zinc-500 hover:text-white uppercase tracking-widest">Management Hub</button>
            <button onClick={() => navigate('/settings')} className="text-[9px] font-black text-zinc-500 hover:text-white uppercase tracking-widest">Account Nodes</button>
            <button onClick={() => navigate('/support')} className="text-[9px] font-black text-zinc-500 hover:text-white uppercase tracking-widest">Protocol Support</button>
          </div>
        </div>
      </div>

      {userProfile && (
        <ProfileQRCodeModal 
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          profile={{
            name: userProfile.name,
            username: userProfile.username,
            avatar: userProfile.avatar,
            role: userProfile.isVerifiedArtist ? 'Verified Artist' : 'Artist / Creator',
            bio: userProfile.bio,
            isVerified: Boolean(userProfile.isVerifiedArtist),
            uid: userProfile.uid,
            profileUrl: `${window.location.origin}/#/artist/${userProfile.uid}`
          }}
        />
      )}
    </div>
  );
}
