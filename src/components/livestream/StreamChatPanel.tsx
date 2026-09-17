import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Coins, 
  HelpCircle, 
  Music, 
  Crown, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  MessageSquare, 
  Award,
  Filter,
  X,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { LiveStreamChatMessage, LiveStreamSession, ViewerPrivileges, UserHeldNFT } from '@/types/livestream';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { sendStreamChatMessage } from '@/services/livestreamService';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface StreamChatPanelProps {
  stream: LiveStreamSession;
  messages: LiveStreamChatMessage[];
  viewerPrivileges: ViewerPrivileges;
  onOpenTipModal: () => void;
  onOpenSongRequestModal: () => void;
  onOpenPrivilegesDrawer: () => void;
  isHost?: boolean;
}

export const StreamChatPanel: React.FC<StreamChatPanelProps> = ({
  stream,
  messages,
  viewerPrivileges,
  onOpenTipModal,
  onOpenSongRequestModal,
  onOpenPrivilegesDrawer,
  isHost = false
}) => {
  const { user, userProfile } = useAuth();
  const { address } = useWallet();

  const [inputText, setInputText] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'vip' | 'tips' | 'qa'>('all');
  const [selectedUserNFTs, setSelectedUserNFTs] = useState<{
    userName: string;
    tier?: string;
    nfts: UserHeldNFT[];
  } | null>(null);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, activeFilter]);

  const handleSendMessage = async (e?: React.FormEvent, customType: 'chat' | 'qa' = 'chat') => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const senderName = userProfile?.name || userProfile?.username || user?.displayName || 'TonJam Listener';
    const senderAvatar = userProfile?.avatar || user?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.uid || 'fan'}`;
    const senderAddress = address || userProfile?.walletAddress;

    try {
      await sendStreamChatMessage(stream.id, {
        streamId: stream.id,
        userId: user?.uid || 'guest_user',
        userName: senderName,
        userAvatar: senderAvatar,
        userAddress: senderAddress,
        text: trimmed,
        type: customType,
        userNfts: viewerPrivileges.heldNFTs,
        highestTierBadge: viewerPrivileges.tier,
        privileges: {
          glowEffect: viewerPrivileges.glowEffect,
          badgeLabel: viewerPrivileges.badgeLabel,
          badgeColor: viewerPrivileges.badgeColor
        },
        isHost,
        isArtist: userProfile?.role === 'artist' || isHost
      });

      setInputText('');
      if (customType === 'qa') {
        toast.success('Question submitted to artist queue!');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Failed to send message');
    }
  };

  // Filter messages
  const filteredMessages = messages.filter((msg) => {
    if (activeFilter === 'vip') {
      return (
        msg.highestTierBadge === 'Genesis VIP' ||
        msg.highestTierBadge === 'Diamond Holder' ||
        msg.highestTierBadge === 'Artist VIP' ||
        msg.isHost
      );
    }
    if (activeFilter === 'tips') {
      return msg.type === 'tip';
    }
    if (activeFilter === 'qa') {
      return msg.type === 'qa';
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] rounded-2xl overflow-hidden flex-1 shadow-2xl">
      {/* 1. Chat Header */}
      <div className="p-3.5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#00B4D8]" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Live Chat</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-zinc-400">
            {messages.length}
          </span>
        </div>

        {/* NFT Privileges Status Pill */}
        <button
          onClick={onOpenPrivilegesDrawer}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-transform hover:scale-105 cursor-pointer"
          style={{
            backgroundColor: `${viewerPrivileges.badgeColor}20`,
            color: viewerPrivileges.badgeColor
          }}
        >
          <Crown className="w-3 h-3" />
          <span>{viewerPrivileges.badgeLabel}</span>
        </button>
      </div>

      {/* 2. Filter Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 bg-black/40 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All' },
          { id: 'vip', label: '👑 VIP / Holders' },
          { id: 'tips', label: '💎 Tips' },
          { id: 'qa', label: '❓ Q&A' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
              activeFilter === tab.id
                ? 'bg-[#00B4D8] text-black font-black'
                : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Messages Scrollable List */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3.5 space-y-3"
      >
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 text-xs">
            <Sparkles className="w-6 h-6 text-zinc-600 mb-2" />
            <p>No messages in this filter yet.</p>
            <p className="text-[10px] text-zinc-600 mt-1">Be the first to say hello to the artist!</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isTip = msg.type === 'tip';
            const isQA = msg.type === 'qa';
            const isVipTier = msg.highestTierBadge === 'Genesis VIP' || msg.highestTierBadge === 'Diamond Holder' || msg.highestTierBadge === 'Artist VIP';

            return (
              <div
                key={msg.id}
                className={`p-2.5 rounded-xl transition-all ${
                  isTip
                    ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-transparent'
                    : isQA
                    ? 'bg-blue-500/10'
                    : msg.privileges?.glowEffect
                    ? 'bg-white/[0.04]'
                    : 'bg-white/[0.02]'
                }`}
              >
                {/* User Info Bar */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {/* User Avatar (Clickable to inspect NFTs) */}
                    <button
                      onClick={() => {
                        if (msg.userNfts && msg.userNfts.length > 0) {
                          setSelectedUserNFTs({
                            userName: msg.userName,
                            tier: msg.highestTierBadge,
                            nfts: msg.userNfts
                          });
                        }
                      }}
                      className="cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                      title={msg.userNfts?.length ? `View ${msg.userName}'s ${msg.userNfts.length} NFTs` : msg.userName}
                    >
                      <img
                        src={msg.userAvatar}
                        alt={msg.userName}
                        className="w-5 h-5 rounded-full object-cover bg-black"
                      />
                    </button>

                    <span className="text-xs font-bold text-white truncate">
                      {msg.userName}
                    </span>

                    {/* Host / Artist Crown Badge */}
                    {msg.isHost && (
                      <span className="px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-300 text-[9px] font-black uppercase shrink-0">
                        Host
                      </span>
                    )}

                    {/* NFT Holder Badge */}
                    {msg.highestTierBadge && !msg.isHost && (
                      <button
                        onClick={() => {
                          if (msg.userNfts && msg.userNfts.length > 0) {
                            setSelectedUserNFTs({
                              userName: msg.userName,
                              tier: msg.highestTierBadge,
                              nfts: msg.userNfts
                            });
                          }
                        }}
                        className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase cursor-pointer hover:underline shrink-0"
                        style={{
                          backgroundColor: `${msg.privileges?.badgeColor || '#00B4D8'}20`,
                          color: msg.privileges?.badgeColor || '#00B4D8'
                        }}
                      >
                        {msg.highestTierBadge}
                      </button>
                    )}
                  </div>

                  <span className="text-[10px] text-zinc-500 shrink-0">
                    {msg.timestamp?.includes('T') ? 'Just now' : msg.timestamp}
                  </span>
                </div>

                {/* Message Text */}
                {isTip ? (
                  <div className="mt-1">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-400 text-black text-xs font-black mb-1">
                      <Coins className="w-3 h-3" />
                      <span>TIPPED {msg.tipAmount} {msg.tipCurrency}</span>
                    </div>
                    {msg.text && (
                      <p className="text-xs text-amber-200 font-medium">{msg.text}</p>
                    )}
                  </div>
                ) : isQA ? (
                  <div className="mt-1">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-0.5">
                      Live Question
                    </span>
                    <p className="text-xs text-white font-medium">{msg.text}</p>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-300 break-words">{msg.text}</p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. Action Shortcut Buttons Bar */}
      <div className="px-3 py-1.5 bg-black/40 flex items-center justify-between gap-1.5">
        <button
          onClick={onOpenTipModal}
          className="flex-1 py-1.5 px-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 hover:from-amber-500/30 hover:to-orange-500/30 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
        >
          <Coins className="w-3 h-3" />
          <span>Tip Artist</span>
        </button>

        <button
          onClick={onOpenSongRequestModal}
          className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
        >
          <Music className="w-3 h-3 text-[#00B4D8]" />
          <span>Song Request</span>
        </button>

        <button
          onClick={() => handleSendMessage(undefined, 'qa')}
          disabled={!inputText.trim()}
          className="py-1.5 px-2.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
          title="Send as Q&A Question"
        >
          <HelpCircle className="w-3 h-3" />
          <span>Ask Q&A</span>
        </button>
      </div>

      {/* 5. Chat Input Box */}
      <form onSubmit={handleSendMessage} className="p-3 bg-[#0e1628] flex items-center gap-2">
        <input
          type="text"
          placeholder={
            viewerPrivileges.tier === 'Genesis VIP'
              ? '👑 Send VIP chat message...'
              : 'Chat with artist and viewers...'
          }
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          maxLength={200}
          className="flex-1 bg-black/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#00B4D8]"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-[#00B4D8] hover:bg-[#00B4D8]/90 text-black font-black disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md shadow-[#00B4D8]/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* 6. User NFT Holdings Inspection Modal */}
      <AnimatePresence>
        {selectedUserNFTs && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#0e1628] rounded-2xl p-5 shadow-2xl relative overflow-hidden"
            >
              <button
                onClick={() => setSelectedUserNFTs(null)}
                className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-lg bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#00B4D8]/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#00B4D8]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedUserNFTs.userName}</h4>
                  <p className="text-xs text-amber-400 font-semibold">{selectedUserNFTs.tier || 'NFT Holder'}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Verified NFT Holdings ({selectedUserNFTs.nfts.length})
                </p>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedUserNFTs.nfts.map((nft) => (
                    <div
                      key={nft.id}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03]"
                    >
                      <img
                        src={nft.imageUrl}
                        alt={nft.title}
                        className="w-9 h-9 rounded-lg object-cover bg-black"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{nft.title}</p>
                        <p className="text-[10px] text-zinc-400">{nft.rarity || 'Sonic NFT'} • {nft.edition || 'Official Edition'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedUserNFTs(null)}
                className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
