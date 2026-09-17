import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Music, Sparkles, Coins, Send, CheckCircle2 } from 'lucide-react';
import { LiveStreamSession, ViewerPrivileges } from '@/types/livestream';
import { useAuth } from '@/contexts/AuthContext';
import { submitStreamSongRequest } from '@/services/livestreamService';
import { toast } from 'sonner';

interface SongRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  stream: LiveStreamSession;
  viewerPrivileges: ViewerPrivileges;
}

export const SongRequestModal: React.FC<SongRequestModalProps> = ({
  isOpen,
  onClose,
  stream,
  viewerPrivileges
}) => {
  const { user, userProfile } = useAuth();
  const [songTitle, setSongTitle] = useState('');
  const [tipBoost, setTipBoost] = useState<number>(1);
  const [includeTip, setIncludeTip] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle.trim()) {
      toast.error('Please enter a track name');
      return;
    }

    setIsSubmitting(true);
    try {
      const requesterName = userProfile?.name || userProfile?.username || user?.displayName || 'TonJam Fan';
      const requesterAvatar = userProfile?.avatar || user?.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=requester';

      await submitStreamSongRequest(stream.id, {
        streamId: stream.id,
        requesterId: user?.uid || 'guest_requester',
        requesterName,
        requesterAvatar,
        requesterNfts: viewerPrivileges.heldNFTs,
        requesterTier: viewerPrivileges.tier,
        songTitle: songTitle.trim(),
        artistName: stream.artistName,
        tipAmount: includeTip ? tipBoost : undefined,
        currency: includeTip ? 'TON' : undefined,
        isVipPriority: viewerPrivileges.canRequestSongs
      });

      toast.success(`🎵 Song request for "${songTitle}" sent to ${stream.artistName}!`);
      onClose();
    } catch (err) {
      console.error('Song request error:', err);
      toast.error('Failed to submit song request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-[#0e1628] rounded-2xl p-6 shadow-2xl relative overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg bg-white/5 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-[#00B4D8]/20 flex items-center justify-center">
            <Music className="w-6 h-6 text-[#00B4D8]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Live Song Request</h3>
            <p className="text-xs text-zinc-400">Request a track or stem remix from {stream.artistName}</p>
          </div>
        </div>

        {/* VIP Status Banner */}
        {viewerPrivileges.canRequestSongs && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-300 font-medium">
              👑 {viewerPrivileges.badgeLabel} Priority Queue active
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
              Track Title / ID
            </label>
            <input
              type="text"
              placeholder="e.g. Neon Odyssey (Stem Mix), Cyber Drift #3"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              required
              className="w-full bg-black/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#00B4D8]"
            />
          </div>

          {/* Optional Tip Boost */}
          <div className="p-3 rounded-xl bg-white/[0.02]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTip}
                  onChange={(e) => setIncludeTip(e.target.checked)}
                  className="rounded text-[#00B4D8] focus:ring-0"
                />
                <span>Attach Tip to boost queue position</span>
              </label>
            </div>

            {includeTip && (
              <div className="flex items-center gap-2 mt-2">
                {[1, 3, 5, 10].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTipBoost(amt)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      tipBoost === amt
                        ? 'bg-amber-400 text-black font-black'
                        : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                    }`}
                  >
                    +{amt} TON
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !songTitle.trim()}
            className="w-full py-3 bg-[#00B4D8] hover:bg-[#00B4D8]/90 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Song Request</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
