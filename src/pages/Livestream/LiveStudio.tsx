import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Radio, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Share2, 
  Settings, 
  Users, 
  Coins, 
  MessageSquare, 
  Sparkles, 
  StopCircle, 
  Award, 
  Music, 
  Tv,
  CheckCircle2,
  Volume2,
  HelpCircle,
  Clock,
  Flame,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNFT } from '@/contexts/NFTContext';
import { useWallet } from '@/contexts/WalletContext';
import { 
  LiveStreamSession, 
  LiveStreamChatMessage, 
  LiveStreamTip, 
  LiveStreamSongRequest,
  StreamCategory,
  ViewerPrivileges
} from '@/types/livestream';
import { 
  createLiveStreamSession, 
  updateLiveStreamSession, 
  endLiveStreamSession, 
  subscribeToStreamChat, 
  calculateViewerPrivileges 
} from '@/services/livestreamService';
import { StreamVideoStage } from '@/components/livestream/StreamVideoStage';
import { StreamChatPanel } from '@/components/livestream/StreamChatPanel';
import { LiveSoundboard } from '@/components/livestream/LiveSoundboard';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export const LiveStudio: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { nfts } = useNFT();
  const { address } = useWallet();

  // Studio Broadcast State
  const [isLive, setIsLive] = useState(false);
  const [streamSession, setStreamSession] = useState<LiveStreamSession | null>(null);
  const [streamDurationSec, setStreamDurationSec] = useState(0);

  // Setup Form State
  const [title, setTitle] = useState(`${userProfile?.name || 'Artist'}'s Live Jam & Studio Session`);
  const [category, setCategory] = useState<StreamCategory>('Live Performance');
  const [tagsInput, setTagsInput] = useState('TON, Web3Music, LiveJam, Stems');
  const [nftGated, setNftGated] = useState(false);
  const [pinnedText, setPinnedText] = useState('');

  // Hardware / Media Devices
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [videoSource, setVideoSource] = useState<'webcam' | 'stage_visualizer'>('stage_visualizer');

  // Real-time HUD State
  const [messages, setMessages] = useState<LiveStreamChatMessage[]>([]);
  const [latestTip, setLatestTip] = useState<LiveStreamTip | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'controls' | 'requests'>('chat');
  const [songRequests, setSongRequests] = useState<LiveStreamSongRequest[]>([
    {
      id: 'req_demo_1',
      streamId: 'demo',
      requesterId: 'u_1',
      requesterName: 'SatoshiTon',
      requesterAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SatoshiTon',
      requesterTier: 'Genesis VIP',
      songTitle: 'Neon Genesis (VIP Remix)',
      artistName: userProfile?.name || 'Artist',
      tipAmount: 5,
      currency: 'TON',
      status: 'pending',
      isVipPriority: true,
      createdAt: '2m ago'
    }
  ]);
  const [showEndModal, setShowEndModal] = useState(false);

  // Privileges calculation
  const viewerPrivileges: ViewerPrivileges = calculateViewerPrivileges(
    user,
    userProfile,
    nfts,
    user?.uid
  );

  // Initialize Camera / Mic if requested
  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true
        });
        setMediaStream(stream);
        setIsCameraOn(true);
        setVideoSource('webcam');
        toast.success('🎥 Camera & Mic activated for stream');
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      toast.info('Using dynamic visualizer stage feed');
      setVideoSource('stage_visualizer');
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    setIsCameraOn(false);
    setVideoSource('stage_visualizer');
  };

  // Toggle Mic
  const toggleMic = () => {
    if (mediaStream) {
      const audioTracks = mediaStream.getAudioTracks();
      audioTracks.forEach(t => (t.enabled = !isMicOn));
    }
    setIsMicOn(!isMicOn);
  };

  // Stream Duration Timer
  useEffect(() => {
    let interval: any = null;
    if (isLive) {
      interval = setInterval(() => {
        setStreamDurationSec(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive]);

  // Subscribe to stream chat when live
  useEffect(() => {
    if (streamSession?.id) {
      const unsubscribe = subscribeToStreamChat(streamSession.id, (msgs) => {
        setMessages(msgs);
        const lastTipMsg = msgs.slice().reverse().find(m => m.type === 'tip');
        if (lastTipMsg && lastTipMsg.tipAmount) {
          setLatestTip({
            id: lastTipMsg.id,
            streamId: streamSession.id,
            senderId: lastTipMsg.userId,
            senderName: lastTipMsg.userName,
            senderAvatar: lastTipMsg.userAvatar,
            senderAddress: lastTipMsg.userAddress || 'EQ...fan',
            amount: lastTipMsg.tipAmount,
            currency: lastTipMsg.tipCurrency || 'TON',
            message: lastTipMsg.text,
            timestamp: lastTipMsg.timestamp
          });
        }
      });
      return () => unsubscribe();
    }
  }, [streamSession?.id]);

  // Start Broadcast Action
  const handleStartBroadcast = async () => {
    if (!title.trim()) {
      toast.error('Please provide a stream title');
      return;
    }

    const artistName = userProfile?.name || userProfile?.username || user?.displayName || 'TonJam Artist';
    const artistAvatar = userProfile?.avatar || user?.photoURL || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=400';
    const artistHandle = `@${userProfile?.username || 'artist'}`;
    const artistAddress = address || userProfile?.walletAddress || 'EQ...artist';

    try {
      const newSession = await createLiveStreamSession({
        title: title.trim(),
        description: 'Live broadcast on TonJam with real-time tipping and NFT-holder privileges.',
        artistId: user?.uid || 'artist_host',
        artistName,
        artistAvatar,
        artistHandle,
        artistAddress,
        artistVerified: true,
        category,
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
        thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200',
        videoSourceType: videoSource,
        nftGated,
        pinnedAnnouncement: pinnedText.trim() ? {
          text: pinnedText.trim(),
          author: artistName,
          timestamp: 'Just now',
          isVip: true
        } : null,
        quality: '1080p60'
      });

      setStreamSession(newSession);
      setIsLive(true);
      toast.success('🚀 You are now ON AIR!');
    } catch (err) {
      console.error('Failed to start stream:', err);
      toast.error('Failed to go live. Please try again.');
    }
  };

  // End Broadcast Action
  const handleEndBroadcast = async () => {
    if (streamSession) {
      await endLiveStreamSession(streamSession.id);
    }
    stopCamera();
    setIsLive(false);
    setShowEndModal(true);
  };

  // Pin Announcement update
  const handleUpdatePin = async () => {
    if (!streamSession) return;
    const author = userProfile?.name || 'Host';
    const update = {
      pinnedAnnouncement: pinnedText.trim() ? {
        text: pinnedText.trim(),
        author,
        timestamp: 'Just now',
        isVip: true
      } : null
    };
    await updateLiveStreamSession(streamSession.id, update);
    setStreamSession(prev => prev ? { ...prev, ...update } : null);
    toast.success('Pinned announcement updated!');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#040812] text-white p-4 sm:p-6 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/livestream')}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  Artist Live Studio
                </h1>
                {isLive ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                    <Radio className="w-3 h-3" /> ON AIR
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                    Studio Setup
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Broadcast live video, interact with NFT holders, and collect cryptocurrency tips
              </p>
            </div>
          </div>

          {/* Quick Action Top Bar */}
          <div className="flex items-center gap-2">
            {isLive ? (
              <div className="flex items-center gap-3 bg-white/[0.03] p-1.5 rounded-xl">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 rounded-lg text-xs font-mono font-bold text-red-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTime(streamDurationSec)}</span>
                </div>
                <button
                  onClick={handleEndBroadcast}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg shadow-red-600/20"
                >
                  <StopCircle className="w-4 h-4" />
                  <span>End Stream</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartBroadcast}
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-red-500/20"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Go Live Now</span>
              </button>
            )}
          </div>
        </div>

        {/* Studio Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Broadcast Stage + Controls (2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Live Video Canvas */}
            <StreamVideoStage
              stream={streamSession || {
                id: 'preview_stage',
                title,
                description: '',
                artistId: user?.uid || 'host',
                artistName: userProfile?.name || 'Artist Host',
                artistAvatar: userProfile?.avatar || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=400',
                artistHandle: '@host',
                artistAddress: address || 'EQ...host',
                artistVerified: true,
                status: isLive ? 'live' : 'scheduled',
                category,
                tags: ['Live'],
                thumbnailUrl: '',
                videoSourceType: videoSource,
                viewerCount: isLive ? (streamSession?.viewerCount || 1) : 0,
                peakViewers: isLive ? 1 : 0,
                totalTipsTon: 0,
                totalTipsGram: 0,
                totalTipsTJ: 0,
                startedAt: new Date().toISOString()
              }}
              localMediaStream={mediaStream}
              latestTip={latestTip}
              isHost={true}
            />

            {/* Hardware & Broadcast Media Bar */}
            <div className="p-4 rounded-2xl bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={isCameraOn ? stopCamera : startCamera}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    isCameraOn
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  {isCameraOn ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4 text-zinc-400" />}
                  <span>{isCameraOn ? 'Camera ON' : 'Enable Webcam'}</span>
                </button>

                <button
                  onClick={toggleMic}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    isMicOn
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {isMicOn ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-red-400" />}
                  <span>{isMicOn ? 'Mic ON' : 'Mic Muted'}</span>
                </button>

                <button
                  onClick={() => setVideoSource(videoSource === 'webcam' ? 'stage_visualizer' : 'webcam')}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                >
                  <Tv className="w-4 h-4 text-[#00B4D8]" />
                  <span>Mode: {videoSource === 'webcam' ? 'Camera Feed' : 'Stage Visualizer'}</span>
                </button>
              </div>

              {/* Tips Counter on HUD */}
              <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300">
                  {streamSession?.totalTipsTon || 0} TON collected
                </span>
              </div>
            </div>

            {/* Broadcast Configuration (When not live or editing) */}
            <div className="p-5 rounded-2xl bg-white/[0.02] space-y-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-[#00B4D8]" />
                <span>Stream Info & Holder Settings</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
                    Stream Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isLive}
                    className="w-full bg-black/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#00B4D8] disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
                    Stream Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    disabled={isLive}
                    className="w-full bg-black/40 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#00B4D8] disabled:opacity-50 cursor-pointer"
                  >
                    <option value="Live Performance">Live Performance</option>
                    <option value="DJ Set">DJ Set & Mixing</option>
                    <option value="Studio Jam">Studio Jam</option>
                    <option value="Beat Making">Beat Making & Production</option>
                    <option value="Acoustic Lounge">Acoustic Lounge</option>
                    <option value="NFT Drop">NFT Mint & Drop Party</option>
                    <option value="Listening Party">Album Listening Party</option>
                  </select>
                </div>
              </div>

              {/* Pinned Announcement Live Editor */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
                  Pinned Host Announcement (Shown to all viewers on stage)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Genesis NFT holders get priority song requests tonight!"
                    value={pinnedText}
                    onChange={(e) => setPinnedText(e.target.value)}
                    className="flex-1 bg-black/40 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#00B4D8]"
                  />
                  {isLive && (
                    <button
                      onClick={handleUpdatePin}
                      className="px-4 py-2 bg-[#00B4D8] text-black font-black text-xs rounded-xl cursor-pointer hover:bg-[#00B4D8]/90"
                    >
                      Update
                    </button>
                  )}
                </div>
              </div>

              {/* Soundboard for Host */}
              <div className="pt-2">
                <LiveSoundboard canTrigger={true} />
              </div>
            </div>
          </div>

          {/* Right Sidebar: Chat & VIP Queue Manager */}
          <div className="h-[750px] flex flex-col space-y-4">
            {/* Tab switch between Chat and Song Requests Queue */}
            <div className="grid grid-cols-2 gap-1 bg-white/[0.02] p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('chat')}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'chat'
                    ? 'bg-[#00B4D8] text-black font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Live Chat</span>
              </button>

              <button
                onClick={() => setActiveTab('requests')}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'requests'
                    ? 'bg-[#00B4D8] text-black font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Song Requests ({songRequests.length})</span>
              </button>
            </div>

            {activeTab === 'chat' ? (
              <StreamChatPanel
                stream={streamSession || {
                  id: 'preview_stage',
                  title,
                  description: '',
                  artistId: user?.uid || 'host',
                  artistName: userProfile?.name || 'Artist',
                  artistAvatar: '',
                  artistHandle: '@artist',
                  artistAddress: '',
                  artistVerified: true,
                  status: 'live',
                  category,
                  tags: [],
                  thumbnailUrl: '',
                  videoSourceType: 'webcam',
                  viewerCount: 1,
                  peakViewers: 1,
                  totalTipsTon: 0,
                  totalTipsGram: 0,
                  totalTipsTJ: 0,
                  startedAt: ''
                }}
                messages={messages}
                viewerPrivileges={viewerPrivileges}
                onOpenTipModal={() => toast.info('You are the stream host')}
                onOpenSongRequestModal={() => toast.info('Song requests managed on the queue tab')}
                onOpenPrivilegesDrawer={() => toast.info('Host mode active')}
                isHost={true}
              />
            ) : (
              /* Song Requests Queue Tab */
              <div className="flex-1 bg-[#0a0f1d] rounded-2xl p-4 flex flex-col shadow-2xl overflow-hidden">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>VIP Song Requests Queue</span>
                  <span className="text-[10px] text-amber-400 font-normal">NFT priority sorted</span>
                </h4>

                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {songRequests.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 text-xs">
                      <Music className="w-6 h-6 text-zinc-600 mb-2" />
                      <p>No song requests in queue yet.</p>
                    </div>
                  ) : (
                    songRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3 rounded-xl bg-white/[0.03] space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={req.requesterAvatar}
                              alt={req.requesterName}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <div>
                              <p className="text-xs font-bold text-white">{req.requesterName}</p>
                              {req.requesterTier && (
                                <span className="text-[9px] font-black text-amber-400">
                                  👑 {req.requesterTier}
                                </span>
                              )}
                            </div>
                          </div>
                          {req.tipAmount && (
                            <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-black">
                              +{req.tipAmount} {req.currency} Tip
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-medium text-zinc-200">
                          🎵 &ldquo;{req.songTitle}&rdquo;
                        </p>

                        <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                          <button
                            onClick={() => {
                              toast.success(`Now playing "${req.songTitle}"!`);
                              setSongRequests(prev => prev.filter(r => r.id !== req.id));
                            }}
                            className="flex-1 py-1.5 bg-[#00B4D8] hover:bg-[#00B4D8]/90 text-black text-[10px] font-black rounded-lg transition-colors cursor-pointer"
                          >
                            Accept & Play
                          </button>
                          <button
                            onClick={() => {
                              setSongRequests(prev => prev.filter(r => r.id !== req.id));
                              toast.info('Request dismissed');
                            }}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* End Stream Recap Modal */}
      <AnimatePresence>
        {showEndModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[#0e1628] rounded-2xl p-6 shadow-2xl text-center relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 mx-auto flex items-center justify-center mb-4">
                <Award className="w-8 h-8 text-black" />
              </div>

              <h3 className="text-lg font-black text-white mb-1">
                Stream Finished!
              </h3>
              <p className="text-xs text-zinc-400 mb-6">
                Great broadcast session! Here is your performance recap:
              </p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 rounded-xl bg-white/[0.03]">
                  <p className="text-lg font-black text-[#00B4D8]">
                    {streamSession?.totalTipsTon || 15.5}
                  </p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">TON Tips</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03]">
                  <p className="text-lg font-black text-purple-400">
                    {messages.length || 48}
                  </p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Messages</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03]">
                  <p className="text-lg font-black text-emerald-400">
                    {formatTime(streamDurationSec || 180)}
                  </p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Duration</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowEndModal(false);
                  navigate('/livestream');
                }}
                className="w-full py-3 bg-[#00B4D8] hover:bg-[#00B4D8]/90 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-lg shadow-[#00B4D8]/20"
              >
                Back to Livestream Hub
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
