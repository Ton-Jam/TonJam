import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, ImageIcon, Music, Coins, List, HelpCircle, User, MessageCircle } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-slate-900 border border-white/5 rounded-[10px] shadow-2xl overflow-hidden text-white"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.03]">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-300">Broadcast Signal Node</h4>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/5 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        <form onSubmit={handlePostSubmit} className="p-4 space-y-4">
          <textarea
            placeholder="What's vibing in your node? Use #Hashtags or @Mentions..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full bg-slate-950 border border-white/5 rounded-[10px] p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#0052FF] transition-colors resize-none font-sans"
          />

          {/* Quick attachment toggles */}
          <div className="flex flex-wrap gap-2 items-center text-xs text-slate-400">
            <span>Attach:</span>
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
              className={`flex items-center gap-1 px-3 py-1.5 rounded-[10px] border transition-colors cursor-pointer ${
                attachmentType === 'image' ? 'bg-[#0052FF]/20 text-[#0052FF] border-[#0052FF]/30' : 'bg-slate-950 border-white/5 hover:text-white'
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
              className={`flex items-center gap-1 px-3 py-1.5 rounded-[10px] border transition-colors cursor-pointer ${
                attachmentType === 'track' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-950 border-white/5 hover:text-white'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Audio Preview</span>
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
              className={`flex items-center gap-1 px-3 py-1.5 rounded-[10px] border transition-colors cursor-pointer ${
                attachmentType === 'nft' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-slate-950 border-white/5 hover:text-white'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>NFT Link</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPoll(!showPoll)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-[10px] border transition-colors cursor-pointer ${
                showPoll ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-950 border-white/5 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Poll</span>
            </button>
          </div>

          {/* Dynamic attachment field editor */}
          {attachmentType !== 'none' && (
            <div className="bg-slate-950 p-3 rounded-[10px] border border-white/5 space-y-2.5">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                Attachment Specs ({attachmentType})
              </span>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Title / Name"
                    value={attachmentData.title}
                    onChange={(e) => setAttachmentData({ ...attachmentData, title: e.target.value })}
                    className="bg-slate-900 border border-white/5 rounded-[10px] px-3 py-1.5 text-xs focus:outline-none text-white placeholder:text-slate-600"
                  />
                  <input
                    type="text"
                    placeholder="Artist / Creator"
                    value={attachmentData.artist}
                    onChange={(e) => setAttachmentData({ ...attachmentData, artist: e.target.value })}
                    className="bg-slate-900 border border-white/5 rounded-[10px] px-3 py-1.5 text-xs focus:outline-none text-white placeholder:text-slate-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block">Custom URL / Link</label>
                  <input
                    type="text"
                    placeholder={
                      attachmentType === 'image'
                        ? 'Paste Unsplash or direct image URL...'
                        : attachmentType === 'track'
                        ? 'Paste MP3 audio preview URL...'
                        : 'Paste TON NFT marketplace link or image URL...'
                    }
                    value={attachmentData.url}
                    onChange={(e) => setAttachmentData({ ...attachmentData, url: e.target.value })}
                    className="w-full bg-slate-900 border border-white/5 rounded-[10px] px-3 py-1.5 text-xs focus:outline-none text-white placeholder:text-slate-600"
                  />
                </div>

                {attachmentType === 'nft' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Floor Price (e.g. 15 TON)"
                        value={attachmentData.price}
                        onChange={(e) => setAttachmentData({ ...attachmentData, price: e.target.value })}
                        className="w-full bg-slate-900 border border-white/5 rounded-[10px] px-3 py-1.5 text-xs focus:outline-none text-white placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                )}

                {/* Preset quick selection suggestions (No border lines) */}
                <div className="space-y-1 pt-1">
                  <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block">Quick Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {attachmentType === 'image' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setAttachmentData(d => ({ ...d, title: 'Concert Scene', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80' }))}
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-850 rounded-[6px] text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          🎸 Concert
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttachmentData(d => ({ ...d, title: 'Studio Session', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80' }))}
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-850 rounded-[6px] text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          🎙️ Studio
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttachmentData(d => ({ ...d, title: 'Vinyl Spin', url: 'https://images.unsplash.com/photo-1487180142328-054b783fc471?auto=format&fit=crop&w=800&q=80' }))}
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-850 rounded-[6px] text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
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
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-850 rounded-[6px] text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          🎵 Beat 1
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttachmentData(d => ({ ...d, title: 'Summer Breeze Stems', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' }))}
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-850 rounded-[6px] text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          🎶 Beat 2
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttachmentData(d => ({ ...d, title: 'Cyberpunk Drone', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }))}
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-850 rounded-[6px] text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
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
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-850 rounded-[6px] text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          ⚡ Neon NFT
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttachmentData(d => ({ ...d, title: 'Golden Master Disc #03', price: '45 TON', url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=300&q=80' }))}
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-850 rounded-[6px] text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
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
            <div className="bg-slate-950 p-3 rounded-[10px] border border-white/5 space-y-2.5">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                Cast Poll Options
              </span>
              <div className="space-y-2">
                {pollOptions.map((opt, oIdx) => (
                  <div key={oIdx} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Choice ${oIdx + 1}`}
                      value={opt}
                      onChange={(e) => handleOptionChange(oIdx, e.target.value)}
                      className="flex-1 bg-slate-900 border border-white/5 rounded-[10px] px-3 py-1.5 text-xs focus:outline-none"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePollOption(oIdx)}
                        className="p-1 hover:bg-white/5 rounded-full text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddPollOption}
                className="text-[10px] font-bold text-[#0052FF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                + Add Option Choice
              </button>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2 bg-[#0052FF] text-white text-xs font-bold uppercase tracking-widest rounded-[10px] cursor-pointer hover:bg-[#0052FF]/95 transition-colors"
            >
              Transmit Signal
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
