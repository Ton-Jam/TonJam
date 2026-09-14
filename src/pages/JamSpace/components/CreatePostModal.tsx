import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, ImageIcon, Music, Coins, List, Sparkles } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { useAuth } from '@/contexts/AuthContext';
import { getPlaceholderImage } from '@/lib/utils';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, attachments?: any[], pollOptions?: string[]) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const { addNotification } = useAudio();
  const { user, userProfile } = useAuth();
  const [content, setContent] = useState('');
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [attachmentType, setAttachmentType] = useState<'none' | 'image' | 'track' | 'nft'>('none');
  const [attachmentData, setAttachmentData] = useState({
    title: '',
    artist: '',
    price: '',
    url: ''
  });

  const MAX_CHAR_COUNT = 500;

  // Handle Escape key and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, '']);
    } else {
      addNotification('Maximum 5 options allowed', 'warning');
    }
  };

  const handleRemovePollOption = (idx: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== idx));
    }
  };

  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...pollOptions];
    updated[idx] = val;
    setPollOptions(updated);
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      addNotification('Please write some content first', 'warning');
      return;
    }

    let attachments: any[] | undefined = undefined;
    if (attachmentType !== 'none') {
      attachments = [{
        type: attachmentType,
        title: attachmentData.title || 'Broadcast Track',
        artist: attachmentData.artist || 'Direct Creator',
        price: attachmentData.price || '5.5 TON',
        url: attachmentData.url || (attachmentType === 'image' ? 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80' : '')
      }];
    }

    const finalPoll = showPoll ? pollOptions.filter(o => o.trim() !== '') : [];

    onSubmit(content, attachments, finalPoll.length > 1 ? finalPoll : undefined);
    setContent('');
    setShowPoll(false);
    setPollOptions(['', '']);
    setAttachmentType('none');
    setAttachmentData({ title: '', artist: '', price: '', url: '' });
    onClose();
  };

  const userAvatar = userProfile?.avatar || user?.photoURL || getPlaceholderImage(`user-${userProfile?.uid || user?.uid || 'guest'}`);
  const userName = userProfile?.name || userProfile?.username || user?.displayName || 'Jammer';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-post-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0F141C] rounded-2xl sm:rounded-3xl shadow-2xl text-white border-none max-h-[88vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3.5 min-w-0 pr-2">
            <img 
              src={userAvatar} 
              alt={userName} 
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shrink-0 select-none ring-2 ring-white/5"
            />
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm font-bold text-white tracking-tight truncate">
                  {userName}
                </span>
                <span className="text-[9px] font-mono font-bold bg-[#00B4D8]/15 text-[#00B4D8] px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                  JAMMER
                </span>
              </div>
              <span className="text-xs text-zinc-400 font-normal tracking-tight block truncate">
                Create JamSpace broadcast
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/10 active:bg-white/15 rounded-full cursor-pointer transition-colors border-none text-zinc-400 hover:text-white shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body with uniform 20px padding and 16px gap between sections */}
        <form onSubmit={handlePostSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 overscroll-contain">
          <div className="space-y-1.5">
            <textarea
              placeholder="What's vibing in your space? Share tracks, thoughts, or drops..."
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX_CHAR_COUNT))}
              rows={4}
              className="w-full bg-white/[0.04] rounded-xl p-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:bg-white/[0.06] transition-colors resize-none font-sans border-none leading-relaxed"
              aria-label="Post message content"
              autoFocus
            />
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 px-1">
              <span className="truncate mr-2">Supports links, tags, and music signals</span>
              <span className={`shrink-0 ${content.length >= MAX_CHAR_COUNT ? 'text-rose-400 font-bold' : ''}`}>
                {content.length}/{MAX_CHAR_COUNT}
              </span>
            </div>
          </div>

          {/* Quick attachment toggles */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Attach to Post
            </span>
            <div className="flex flex-wrap gap-2 items-center">
              <button
                type="button"
                onClick={() => {
                  setAttachmentType(attachmentType === 'image' ? 'none' : 'image');
                  setAttachmentData({
                    title: 'Aesthetic Stage Vibe',
                    artist: 'TonJam Live',
                    price: '',
                    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'
                  });
                }}
                aria-pressed={attachmentType === 'image'}
                className={`min-h-[40px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer border-none text-xs font-semibold ${
                  attachmentType === 'image' 
                    ? 'bg-[#00B4D8] text-black shadow-md shadow-[#00B4D8]/20' 
                    : 'bg-white/[0.05] text-zinc-300 hover:bg-white/[0.08]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Image</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAttachmentType(attachmentType === 'track' ? 'none' : 'track');
                  setAttachmentData({
                    title: 'Sunset Jam Session',
                    artist: 'Pioneer Jammer',
                    price: '',
                    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
                  });
                }}
                aria-pressed={attachmentType === 'track'}
                className={`min-h-[40px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer border-none text-xs font-semibold ${
                  attachmentType === 'track' 
                    ? 'bg-emerald-400 text-black shadow-md shadow-emerald-400/20' 
                    : 'bg-white/[0.05] text-zinc-300 hover:bg-white/[0.08]'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Audio Track</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAttachmentType(attachmentType === 'nft' ? 'none' : 'nft');
                  setAttachmentData({
                    title: 'Decentralized Track Token #08',
                    artist: 'TON Master',
                    price: '15 TON',
                    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80'
                  });
                }}
                aria-pressed={attachmentType === 'nft'}
                className={`min-h-[40px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer border-none text-xs font-semibold ${
                  attachmentType === 'nft' 
                    ? 'bg-purple-400 text-black shadow-md shadow-purple-400/20' 
                    : 'bg-white/[0.05] text-zinc-300 hover:bg-white/[0.08]'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>NFT Drop</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPoll(!showPoll)}
                aria-pressed={showPoll}
                className={`min-h-[40px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer border-none text-xs font-semibold ${
                  showPoll 
                    ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20' 
                    : 'bg-white/[0.05] text-zinc-300 hover:bg-white/[0.08]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Live Poll</span>
              </button>
            </div>
          </div>

          {/* Dynamic attachment field editor */}
          {attachmentType !== 'none' && (
            <div className="bg-white/[0.03] p-4 rounded-2xl space-y-3 border-none">
              <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-widest block">
                Attachment Details ({attachmentType})
              </span>
              <div className="space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="Title / Name"
                    value={attachmentData.title}
                    onChange={(e) => setAttachmentData({ ...attachmentData, title: e.target.value })}
                    className="bg-white/[0.05] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:bg-white/[0.08] text-white placeholder:text-zinc-500 border-none transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Artist / Creator"
                    value={attachmentData.artist}
                    onChange={(e) => setAttachmentData({ ...attachmentData, artist: e.target.value })}
                    className="bg-white/[0.05] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:bg-white/[0.08] text-white placeholder:text-zinc-500 border-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-mono uppercase tracking-wider block">Custom URL / Link</label>
                  <input
                    type="text"
                    placeholder={
                      attachmentType === 'image'
                        ? 'Paste image URL...'
                        : attachmentType === 'track'
                        ? 'Paste audio preview URL...'
                        : 'Paste TON NFT link or image URL...'
                    }
                    value={attachmentData.url}
                    onChange={(e) => setAttachmentData({ ...attachmentData, url: e.target.value })}
                    className="w-full bg-white/[0.05] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:bg-white/[0.08] text-white placeholder:text-zinc-500 border-none transition-colors"
                  />
                </div>

                {attachmentType === 'nft' && (
                  <div>
                    <input
                      type="text"
                      placeholder="Floor Price (e.g. 15 TON)"
                      value={attachmentData.price}
                      onChange={(e) => setAttachmentData({ ...attachmentData, price: e.target.value })}
                      className="w-full bg-white/[0.05] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:bg-white/[0.08] text-white placeholder:text-zinc-500 border-none transition-colors"
                    />
                  </div>
                )}

                {/* Preset quick selection suggestions */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[9px] text-zinc-400 font-mono uppercase tracking-wider block">Quick Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {attachmentType === 'image' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setAttachmentData(d => ({ ...d, title: 'Concert Scene', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80' }))}
                          className="px-2.5 py-1 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg text-[10px] text-zinc-300 hover:text-white transition-colors cursor-pointer border-none"
                        >
                          🎸 Concert
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttachmentData(d => ({ ...d, title: 'Studio Session', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80' }))}
                          className="px-2.5 py-1 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg text-[10px] text-zinc-300 hover:text-white transition-colors cursor-pointer border-none"
                        >
                          🎙️ Studio
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttachmentData(d => ({ ...d, title: 'Vinyl Spin', url: 'https://images.unsplash.com/photo-1487180142328-054b783fc471?auto=format&fit=crop&w=800&q=80' }))}
                          className="px-2.5 py-1 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg text-[10px] text-zinc-300 hover:text-white transition-colors cursor-pointer border-none"
                        >
                          💿 Vinyl
                        </button>
                      </>
                    )}
                    {attachmentType === 'track' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setAttachmentData(d => ({ ...d, title: 'Deep Vibes Mix', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' }))}
                          className="px-2.5 py-1 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg text-[10px] text-zinc-300 hover:text-white transition-colors cursor-pointer border-none"
                        >
                          🎵 Beat 1
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttachmentData(d => ({ ...d, title: 'Summer Breeze Stems', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' }))}
                          className="px-2.5 py-1 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg text-[10px] text-zinc-300 hover:text-white transition-colors cursor-pointer border-none"
                        >
                          🎶 Beat 2
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttachmentData(d => ({ ...d, title: 'Cyberpunk Drone', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }))}
                          className="px-2.5 py-1 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg text-[10px] text-zinc-300 hover:text-white transition-colors cursor-pointer border-none"
                        >
                          🎹 Beat 3
                        </button>
                      </>
                    )}
                    {attachmentType === 'nft' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setAttachmentData(d => ({ ...d, title: 'Neon Vinyl Token #12', price: '12 TON', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80' }))}
                          className="px-2.5 py-1 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg text-[10px] text-zinc-300 hover:text-white transition-colors cursor-pointer border-none"
                        >
                          ⚡ Neon NFT
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttachmentData(d => ({ ...d, title: 'Golden Master Disc #03', price: '45 TON', url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=300&q=80' }))}
                          className="px-2.5 py-1 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg text-[10px] text-zinc-300 hover:text-white transition-colors cursor-pointer border-none"
                        >
                          🏆 Gold NFT
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Poll editor */}
          {showPoll && (
            <div className="bg-white/[0.03] p-4 rounded-2xl space-y-3 border-none">
              <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-widest block">
                Poll Options (Minimum 2)
              </span>
              <div className="space-y-2">
                {pollOptions.map((opt, oIdx) => (
                  <div key={oIdx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder={`Option choice ${oIdx + 1}`}
                      value={opt}
                      onChange={(e) => handleOptionChange(oIdx, e.target.value)}
                      className="flex-1 bg-white/[0.05] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:bg-white/[0.08] text-white border-none transition-colors"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePollOption(oIdx)}
                        className="w-9 h-9 flex items-center justify-center hover:bg-rose-500/20 rounded-xl text-rose-400 transition-colors border-none cursor-pointer"
                        aria-label={`Remove option choice ${oIdx + 1}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {pollOptions.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddPollOption}
                  className="text-xs font-semibold text-[#00B4D8] hover:underline flex items-center gap-1 cursor-pointer border-none bg-transparent pt-1"
                >
                  + Add Option Choice
                </button>
              )}
            </div>
          )}

          {/* Footer Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer border-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#00B4D8] hover:bg-[#00B4D8]/90 active:scale-[0.98] text-black text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all border-none shadow-lg shadow-[#00B4D8]/20 flex items-center gap-2"
            >
              <span>Publish Post</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

