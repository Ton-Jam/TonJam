import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Coins, 
  Share2, 
  Heart, 
  Crown, 
  Sparkles, 
  Music, 
  Disc3, 
  Radio, 
  Users, 
  ShieldCheck, 
  ExternalLink,
  ShoppingBag,
  Volume2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNFT } from '@/contexts/NFTContext';
import { useWallet } from '@/contexts/WalletContext';
import { 
  LiveStreamSession, 
  LiveStreamChatMessage, 
  LiveStreamTip, 
  ViewerPrivileges 
} from '@/types/livestream';
import { 
  getLiveStreamById, 
  subscribeToStreamChat, 
  calculateViewerPrivileges, 
  updateLiveStreamSession 
} from '@/services/livestreamService';
import { StreamVideoStage } from '@/components/livestream/StreamVideoStage';
import { StreamChatPanel } from '@/components/livestream/StreamChatPanel';
import { LiveTipModal } from '@/components/livestream/LiveTipModal';
import { NFTPrivilegesDrawer } from '@/components/livestream/NFTPrivilegesDrawer';
import { SongRequestModal } from '@/components/livestream/SongRequestModal';
import { LiveSoundboard } from '@/components/livestream/LiveSoundboard';
import { toast } from 'sonner';

export const LivestreamViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { nfts } = useNFT();
  const { address } = useWallet();

  const [stream, setStream] = useState<LiveStreamSession | null>(null);
  const [messages, setMessages] = useState<LiveStreamChatMessage[]>([]);
  const [latestTip, setLatestTip] = useState<LiveStreamTip | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  // Modals / Drawers state
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [isPrivilegesDrawerOpen, setIsPrivilegesDrawerOpen] = useState(false);
  const [isSongRequestModalOpen, setIsSongRequestModalOpen] = useState(false);
  const [showSoundboard, setShowSoundboard] = useState(false);

  // Calculate viewer privileges based on their actual held NFTs in TonJam
  const viewerPrivileges: ViewerPrivileges = calculateViewerPrivileges(
    user,
    userProfile,
    nfts,
    stream?.artistId
  );

  // Load stream details
  useEffect(() => {
    if (!id) return;
    getLiveStreamById(id).then((data) => {
      if (data) {
        setStream(data);
      } else {
        toast.error('Stream not found');
        navigate('/livestream');
      }
    });
  }, [id, navigate]);

  // Subscribe to real-time chat messages
  useEffect(() => {
    if (!id) return;
    const unsubscribe = subscribeToStreamChat(id, (msgs) => {
      setMessages(msgs);
      const lastTipMsg = msgs.slice().reverse().find(m => m.type === 'tip');
      if (lastTipMsg && lastTipMsg.tipAmount) {
        setLatestTip({
          id: lastTipMsg.id,
          streamId: id,
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
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Stream link copied to clipboard!');
    }
  };

  if (!stream) {
    return (
      <div className="min-h-screen bg-[#040812] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-400">Loading live stream...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040812] text-white p-4 sm:p-6 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <button
            onClick={() => navigate('/livestream')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Streams</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              title="Share Stream"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPrivilegesDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-transform hover:scale-105 cursor-pointer"
              style={{
                backgroundColor: `${viewerPrivileges.badgeColor}20`,
                color: viewerPrivileges.badgeColor
              }}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>{viewerPrivileges.badgeLabel}</span>
            </button>
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Video Stage & Artist Details (2 Cols) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Stream Video Player Stage */}
            <StreamVideoStage
              stream={stream}
              latestTip={latestTip}
            />

            {/* Artist Info & Interaction Actions */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={stream.artistAvatar}
                  alt={stream.artistName}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-[#00B4D8]/40 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-white truncate">
                      {stream.artistName}
                    </h2>
                    {stream.artistVerified && (
                      <ShieldCheck className="w-4 h-4 text-[#00B4D8]" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 truncate">{stream.artistHandle}</p>
                </div>

                <button
                  onClick={() => {
                    setIsFollowing(!isFollowing);
                    toast.success(isFollowing ? `Unfollowed ${stream.artistName}` : `Following ${stream.artistName}!`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isFollowing
                      ? 'bg-white/10 text-zinc-300'
                      : 'bg-[#00B4D8] hover:bg-[#00B4D8]/90 text-black font-black'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>

              {/* Action Buttons: Tip, Request Song, Soundboard */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsTipModalOpen(true)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:opacity-95 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <Coins className="w-4 h-4" />
                  <span>Send Tip</span>
                </button>

                <button
                  onClick={() => setIsSongRequestModalOpen(true)}
                  className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Music className="w-4 h-4 text-[#00B4D8]" />
                  <span>Song Request</span>
                </button>

                <button
                  onClick={() => setShowSoundboard(!showSoundboard)}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    showSoundboard
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                  }`}
                  title="Toggle Soundboard"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Soundboard Bar (Collapsible or Active) */}
            {showSoundboard && (
              <div className="p-4 rounded-2xl bg-white/[0.02]">
                <LiveSoundboard canTrigger={viewerPrivileges.canTriggerVipSoundboard} />
              </div>
            )}

            {/* Stream Description & Tags */}
            <div className="p-5 rounded-2xl bg-white/[0.02] space-y-3">
              <h3 className="text-sm font-bold text-white">{stream.title}</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">{stream.description}</p>
              
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {stream.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg bg-black/40 text-zinc-400 text-[10px] font-mono font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Artist NFTs in Marketplace Callout */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#0d162d] to-blue-950/40 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Disc3 className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Collect {stream.artistName}&apos;s Music NFTs
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Unlock permanent Genesis VIP privileges, royalty splits, and live perks
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/marketplace')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#00B4D8]" />
                <span>Explore NFTs</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Chat & Real-time Interaction Panel */}
          <div className="h-[680px] lg:h-[750px] flex flex-col">
            <StreamChatPanel
              stream={stream}
              messages={messages}
              viewerPrivileges={viewerPrivileges}
              onOpenTipModal={() => setIsTipModalOpen(true)}
              onOpenSongRequestModal={() => setIsSongRequestModalOpen(true)}
              onOpenPrivilegesDrawer={() => setIsPrivilegesDrawerOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Tip Modal */}
      <LiveTipModal
        isOpen={isTipModalOpen}
        onClose={() => setIsTipModalOpen(false)}
        stream={stream}
        viewerPrivileges={viewerPrivileges}
      />

      {/* NFT Privileges Drawer */}
      <NFTPrivilegesDrawer
        isOpen={isPrivilegesDrawerOpen}
        onClose={() => setIsPrivilegesDrawerOpen(false)}
        privileges={viewerPrivileges}
        artistName={stream.artistName}
        artistId={stream.artistId}
      />

      {/* Song Request Modal */}
      <SongRequestModal
        isOpen={isSongRequestModalOpen}
        onClose={() => setIsSongRequestModalOpen(false)}
        stream={stream}
        viewerPrivileges={viewerPrivileges}
      />
    </div>
  );
};
