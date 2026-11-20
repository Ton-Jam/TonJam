import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Image,
  Music,
  Gem,
  X,
  Loader2,
  Send,
  Search
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAudio } from '@/contexts/AudioContext';
import { uploadPostMedia } from '@/services/storageService';
import { jamSpaceService } from '@/services/jamSpaceService';
import {
  SocialPost,
  PostAuthor,
  PostAttachment,
  QuotePostSnippet
} from '@/types/social';
import { Track } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';

interface JamComposerProps {
  onPostCreated?: (post: SocialPost) => void;
  replyToPost?: SocialPost | null;
  quotePost?: SocialPost | null;
  onCancelReplyOrQuote?: () => void;
  placeholder?: string;
  isModal?: boolean;
}

const MAX_CHAR_COUNT = 500;

export const JamComposer: React.FC<JamComposerProps> = ({
  onPostCreated,
  replyToPost,
  quotePost,
  onCancelReplyOrQuote,
  placeholder = "What's resonating in your frequency?",
  isModal = false
}) => {
  const { user, userProfile } = useAuth();
  const { allTracks = [], allNFTs = [], addNotification } = useAudio();

  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<PostAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Attachment Picker Modals & Search Queries
  const [showTrackPicker, setShowTrackPicker] = useState(false);
  const [showNftPicker, setShowNftPicker] = useState(false);
  const [trackSearch, setTrackSearch] = useState('');
  const [nftSearch, setNftSearch] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
    }
  }, [text]);

  // Focus textarea when opening modal or starting a reply/quote
  useEffect(() => {
    if (replyToPost || quotePost || isModal) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [replyToPost, quotePost, isModal]);

  const filteredTracks = useMemo(() => {
    const q = trackSearch.trim().toLowerCase();
    if (!q) return allTracks.slice(0, 25);
    return allTracks
      .filter(
        (t) =>
          (t.title || '').toLowerCase().includes(q) ||
          (t.artist || '').toLowerCase().includes(q)
      )
      .slice(0, 25);
  }, [allTracks, trackSearch]);

  const filteredNFTs = useMemo(() => {
    const q = nftSearch.trim().toLowerCase();
    if (!q) return allNFTs.slice(0, 25);
    return allNFTs
      .filter(
        (n) =>
          (n.title || '').toLowerCase().includes(q) ||
          (n.artist || n.creator || '').toLowerCase().includes(q)
      )
      .slice(0, 25);
  }, [allNFTs, nftSearch]);

  const author: PostAuthor = {
    uid: user?.uid || 'guest',
    name: userProfile?.name || user?.displayName || 'TonJam Pioneer',
    username: userProfile?.username || '@pioneer',
    avatar: userProfile?.avatar || user?.photoURL || getPlaceholderImage('artist'),
    isVerified: !!userProfile?.verified || !!userProfile?.isVerifiedArtist,
    role: userProfile?.role || 'fan'
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      addNotification('Please select an image or video file.', 'error');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      addNotification('File exceeds the 25MB maximum size limit.', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadRes = await uploadPostMedia(file, (p) => setUploadProgress(p));
      const newAttachment: PostAttachment = {
        type: isVideo ? 'video' : 'image',
        url: uploadRes.downloadUrl,
        title: file.name
      };
      setAttachments((prev) => [...prev, newAttachment]);
      addNotification(`${isVideo ? 'Video' : 'Image'} attached successfully!`, 'success');
    } catch (err) {
      console.error('[JamComposer] Upload failure:', err);
      addNotification('Failed to upload media. Please retry.', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAttachTrack = (track: Track) => {
    const newAttachment: PostAttachment = {
      type: 'track',
      id: track.id,
      title: track.title,
      artist: track.artist,
      artistId: track.artistId,
      coverUrl: track.coverUrl,
      url: track.audioUrl,
      duration: track.duration
    };
    setAttachments((prev) => [...prev.filter((a) => a.type !== 'track'), newAttachment]);
    setShowTrackPicker(false);
    setTrackSearch('');
    addNotification(`Track "${track.title}" attached!`, 'success');
  };

  const handleAttachNFT = (nft: any) => {
    const newAttachment: PostAttachment = {
      type: 'nft',
      id: nft.id,
      title: nft.title,
      artist: nft.artist || nft.creator,
      coverUrl: nft.imageUrl || nft.coverUrl,
      url: `/nft/${nft.id}`,
      price: nft.price ? `${nft.price} TON` : undefined
    };
    setAttachments((prev) => [...prev.filter((a) => a.type !== 'nft'), newAttachment]);
    setShowNftPicker(false);
    setNftSearch('');
    addNotification(`NFT "${nft.title}" attached!`, 'success');
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      addNotification('Please sign in to publish to JamSpace', 'info');
      return;
    }

    if (!text.trim() && attachments.length === 0 && !quotePost) {
      addNotification('Please enter text or attach media to post', 'warning');
      return;
    }

    if (text.length > MAX_CHAR_COUNT) {
      addNotification(`Post exceeds maximum length of ${MAX_CHAR_COUNT} characters`, 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      let quoteSnippet: QuotePostSnippet | null = null;
      if (quotePost) {
        quoteSnippet = {
          id: quotePost.id,
          authorId: quotePost.authorId,
          authorName: quotePost.author.name,
          authorUsername: quotePost.author.username,
          authorAvatar: quotePost.author.avatar,
          authorVerified: quotePost.author.isVerified,
          text: quotePost.text,
          createdAt: typeof quotePost.createdAt === 'string' ? quotePost.createdAt : new Date().toISOString(),
          attachment: quotePost.attachments?.[0]
        };
      }

      const created = await jamSpaceService.createPost({
        author,
        text: text.trim(),
        attachments: attachments.length > 0 ? attachments : undefined,
        replyToPostId: replyToPost?.id || null,
        replyToAuthorUsername: replyToPost?.author.username || null,
        rootPostId: replyToPost?.rootPostId || replyToPost?.id || null,
        quotePostId: quotePost?.id || null,
        quotePost: quoteSnippet
      });

      addNotification(replyToPost ? 'Reply broadcasted!' : 'Transmission shared to JamSpace!', 'success');
      setText('');
      setAttachments([]);

      if (onCancelReplyOrQuote) {
        onCancelReplyOrQuote();
      }

      if (onPostCreated) {
        onPostCreated(created);
      }
    } catch (err: any) {
      console.error('[JamComposer] Post creation error:', err);
      addNotification(err?.message || 'Failed to broadcast post. Please retry.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const charsRemaining = MAX_CHAR_COUNT - text.length;
  const isOverLimit = charsRemaining < 0;
  const charProgress = Math.min(100, (text.length / MAX_CHAR_COUNT) * 100);
  const canSubmit =
    (text.trim().length > 0 || attachments.length > 0 || !!quotePost) &&
    !isOverLimit &&
    !isUploading &&
    !isSubmitting;

  return (
    <div
      className={`w-full rounded-2xl bg-[var(--tj-color-surface-card,#0A1628)]/95 p-4 sm:p-5 border-none ${
        isModal ? '' : 'shadow-lg shadow-black/40'
      }`}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Reply Context Snippet */}
      {replyToPost && (
        <div className="mb-3 p-3 rounded-xl bg-white/[0.04] space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>
              Replying to <span className="font-semibold text-[#00B4D8]">{replyToPost.author.username}</span>
            </span>
            {onCancelReplyOrQuote && (
              <button
                type="button"
                onClick={onCancelReplyOrQuote}
                className="p-1 text-zinc-400 hover:text-white rounded-full transition-colors cursor-pointer border-none bg-transparent"
                aria-label="Cancel reply"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {replyToPost.text && (
            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
              {replyToPost.text}
            </p>
          )}
        </div>
      )}

      {/* Composer Body */}
      <div className="flex gap-3 sm:gap-4 items-start">
        {/* Current user avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-slate-800">
          <img
            src={author.avatar}
            alt={author.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = getPlaceholderImage('artist');
            }}
          />
        </div>

        {/* Text Input & Previews Area */}
        <div className="flex-1 min-w-0 space-y-3">
          <textarea
            ref={textareaRef}
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && canSubmit) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={replyToPost ? 'Post your reply...' : placeholder}
            aria-label={replyToPost ? 'Write your reply' : 'Create broadcast post'}
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-zinc-500 resize-none outline-none leading-relaxed border-none"
            maxLength={MAX_CHAR_COUNT + 50}
          />

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5 p-3 rounded-xl bg-white/[0.03]">
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00B4D8]" /> Uploading Media...
                </span>
                <span className="font-mono text-zinc-400">{uploadProgress}%</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00B4D8] transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Attachments Preview Grid */}
          {attachments.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {attachments.map((att, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden bg-slate-900/80 p-2.5">
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors z-10 cursor-pointer border-none"
                    aria-label="Remove attachment"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {att.type === 'image' && (
                    <img
                      src={att.url}
                      alt={att.title || 'Attachment'}
                      referrerPolicy="no-referrer"
                      className="w-full h-36 object-cover rounded-lg"
                    />
                  )}

                  {att.type === 'video' && (
                    <video
                      src={att.url}
                      controls
                      className="w-full h-36 object-cover rounded-lg bg-black"
                    />
                  )}

                  {att.type === 'track' && (
                    <div className="flex items-center gap-3 p-1">
                      <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                        <img
                          src={att.coverUrl || getPlaceholderImage('track')}
                          alt={att.title || 'Track'}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = getPlaceholderImage('track');
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Music className="w-3.5 h-3.5 text-[#00B4D8] shrink-0" />
                          <p className="text-xs font-bold text-white truncate">{att.title}</p>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">{att.artist}</p>
                      </div>
                    </div>
                  )}

                  {att.type === 'nft' && (
                    <div className="flex items-center gap-3 p-1">
                      <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                        <img
                          src={att.coverUrl || getPlaceholderImage('nft')}
                          alt={att.title || 'NFT'}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = getPlaceholderImage('nft');
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Gem className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <p className="text-xs font-bold text-white truncate">{att.title}</p>
                        </div>
                        <p className="text-[11px] text-purple-300 font-mono mt-0.5">{att.price || 'Music NFT'}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Quote Post Snippet Preview */}
          {quotePost && (
            <div className="relative rounded-xl p-3 bg-white/[0.04] space-y-1.5 mt-2">
              {onCancelReplyOrQuote && (
                <button
                  type="button"
                  onClick={onCancelReplyOrQuote}
                  className="absolute top-2.5 right-2.5 p-1 bg-black/60 hover:bg-black text-zinc-300 hover:text-white rounded-full transition-colors cursor-pointer border-none"
                  aria-label="Remove quoted post"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-800 shrink-0">
                  <img
                    src={quotePost.author.avatar}
                    alt={quotePost.author.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = getPlaceholderImage('artist');
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-white truncate">{quotePost.author.name}</span>
                <span className="text-xs text-zinc-400 truncate">{quotePost.author.username}</span>
              </div>
              <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                {quotePost.text}
              </p>
            </div>
          )}

          {/* Composer Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {/* Attachment Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isSubmitting}
                className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-full text-[#00B4D8] hover:bg-[#00B4D8]/10 transition-colors cursor-pointer disabled:opacity-50 border-none bg-transparent"
                title="Attach Image or Video"
                aria-label="Attach Image or Video"
              >
                <Image className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowNftPicker(false);
                  setShowTrackPicker((prev) => !prev);
                }}
                disabled={isUploading || isSubmitting}
                className={`min-h-[42px] min-w-[42px] flex items-center justify-center rounded-full transition-colors cursor-pointer disabled:opacity-50 border-none ${
                  showTrackPicker ? 'bg-[#00B4D8]/15 text-[#00B4D8]' : 'bg-transparent text-[#00B4D8] hover:bg-[#00B4D8]/10'
                }`}
                title="Attach Music Track"
                aria-label="Attach Music Track"
              >
                <Music className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowTrackPicker(false);
                  setShowNftPicker((prev) => !prev);
                }}
                disabled={isUploading || isSubmitting}
                className={`min-h-[42px] min-w-[42px] flex items-center justify-center rounded-full transition-colors cursor-pointer disabled:opacity-50 border-none ${
                  showNftPicker ? 'bg-purple-500/15 text-purple-300' : 'bg-transparent text-[#00B4D8] hover:bg-[#00B4D8]/10'
                }`}
                title="Attach Music NFT"
                aria-label="Attach Music NFT"
              >
                <Gem className="w-4 h-4" />
              </button>
            </div>

            {/* Right side: Char counter & Post submit */}
            <div className="flex items-center gap-3">
              {/* Progress bar + Character remaining indicator */}
              {text.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1.5 rounded-full bg-white/10 overflow-hidden hidden sm:block">
                    <div
                      className={`h-full transition-all duration-150 ${
                        isOverLimit ? 'bg-rose-500' : charsRemaining < 50 ? 'bg-amber-400' : 'bg-[#00B4D8]'
                      }`}
                      style={{ width: `${charProgress}%` }}
                    />
                  </div>
                  <span
                    className={`text-xs font-mono font-medium ${
                      isOverLimit ? 'text-rose-400 font-bold' : charsRemaining < 50 ? 'text-amber-400' : 'text-zinc-500'
                    }`}
                  >
                    {charsRemaining}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="min-h-[40px] px-5 rounded-full bg-[var(--tj-color-accent-primary,#0088CC)] hover:bg-[#0077B5] active:scale-95 text-white text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md border-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{replyToPost ? 'Reply' : 'Broadcast'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Track Picker Drawer */}
      {showTrackPicker && (
        <div className="mt-4 p-4 rounded-xl bg-slate-900/90 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Select Track to Feature</h4>
            <button
              type="button"
              onClick={() => setShowTrackPicker(false)}
              aria-label="Close track picker"
              className="p-1 text-zinc-400 hover:text-white rounded-full transition-colors cursor-pointer border-none bg-transparent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={trackSearch}
              onChange={(e) => setTrackSearch(e.target.value)}
              placeholder="Search tracks or artists..."
              className="w-full bg-white/[0.05] pl-8 pr-3 py-1.5 rounded-lg text-xs text-white placeholder:text-zinc-500 outline-none border-none"
            />
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-none">
            {filteredTracks.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No matching tracks found.</p>
            ) : (
              filteredTracks.map((track) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => handleAttachTrack(track)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] transition-colors text-left cursor-pointer border-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded bg-slate-800 overflow-hidden shrink-0">
                      <img
                        src={track.coverUrl || getPlaceholderImage('track')}
                        alt={track.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = getPlaceholderImage('track');
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{track.title}</p>
                      <p className="text-[11px] text-zinc-400 truncate">{track.artist}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#00B4D8] font-semibold shrink-0">Attach</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* NFT Picker Drawer */}
      {showNftPicker && (
        <div className="mt-4 p-4 rounded-xl bg-slate-900/90 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Select NFT Collection Item</h4>
            <button
              type="button"
              onClick={() => setShowNftPicker(false)}
              aria-label="Close NFT picker"
              className="p-1 text-zinc-400 hover:text-white rounded-full transition-colors cursor-pointer border-none bg-transparent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={nftSearch}
              onChange={(e) => setNftSearch(e.target.value)}
              placeholder="Search Music NFTs..."
              className="w-full bg-white/[0.05] pl-8 pr-3 py-1.5 rounded-lg text-xs text-white placeholder:text-zinc-500 outline-none border-none"
            />
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-none">
            {filteredNFTs.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No matching Music NFTs found.</p>
            ) : (
              filteredNFTs.map((nft) => (
                <button
                  key={nft.id}
                  type="button"
                  onClick={() => handleAttachNFT(nft)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] transition-colors text-left cursor-pointer border-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded bg-slate-800 overflow-hidden shrink-0">
                      <img
                        src={nft.imageUrl || nft.coverUrl || getPlaceholderImage('nft')}
                        alt={nft.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = getPlaceholderImage('nft');
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{nft.title}</p>
                      <p className="text-[11px] text-purple-300 truncate">{nft.price ? `${nft.price} TON` : 'NFT'}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#00B4D8] font-semibold shrink-0">Attach</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

