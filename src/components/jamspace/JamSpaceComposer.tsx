import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Music, Camera, X, Sparkles, Disc, Film } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { Track } from '@/types';
import { db, OperationType, handleFirestoreError } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { uploadPostMedia } from '@/services/storageService';

interface JamSpaceComposerProps {
  onClose?: () => void;
  onPostCreated?: () => void;
  isModal?: boolean;
}

export const JamSpaceComposer: React.FC<JamSpaceComposerProps> = ({
  onClose,
  onPostCreated,
  isModal = false
}) => {
  const { allTracks, userProfile, addNotification, createPost } = useAudio();
  const [content, setContent] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [showTrackSelector, setShowTrackSelector] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [showImageInput, setShowImageInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isImage && !isVideo) {
      addNotification('Please select a valid image or video file.', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await uploadPostMedia(file, (progress) => {
        setUploadProgress(progress);
      });

      setMediaUrl(response.downloadUrl);
      setMediaType(isVideo ? 'video' : 'image');
      addNotification(isVideo ? 'Video clip attached successfully!' : 'Image attached successfully!', 'success');
    } catch (error) {
      console.error('[JamSpaceComposer] Media upload error:', error);
      addNotification('Failed to upload media. Please try again.', 'error');
    } finally {
      setIsUploading(false);
      // Reset input value so same file can be selected again if needed
      if (e.target) e.target.value = '';
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedTrack && !mediaUrl) {
      addNotification('Please add some text, music, or media to your post.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const postId = `post-${Date.now()}`;
      
      const attachments = [];
      if (selectedTrack) {
        attachments.push({
          type: 'track',
          id: selectedTrack.id,
          title: selectedTrack.title,
          artist: selectedTrack.artist,
          url: selectedTrack.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
        });
      }
      if (mediaUrl) {
        attachments.push({
          type: mediaType,
          title: mediaType === 'video' ? 'Studio Clip' : 'Shared Vibe',
          artist: userProfile?.name || 'Jammer',
          url: mediaUrl
        });
      }

      const postPayload: any = {
        id: postId,
        userId: userProfile?.uid || 'anonymous',
        userName: userProfile?.name || 'Anonymous Jammer',
        userAvatar: userProfile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        username: userProfile?.username || '@jammer',
        content: content.trim(),
        likes: 0,
        comments: 0,
        reposts: 0,
        timestamp: new Date().toISOString(),
        createdAt: serverTimestamp(),
        trackId: selectedTrack?.id || undefined,
        attachments: attachments.length > 0 ? attachments : undefined
      };

      // Filter out undefined fields for Firestore
      const cleanPost = Object.fromEntries(
        Object.entries(postPayload).filter(([_, v]) => v !== undefined)
      );

      await setDoc(doc(db, 'posts', postId), cleanPost);
      
      if (typeof createPost === 'function') {
        try {
          await createPost(postPayload);
        } catch (err) {
          // Fallback handled by direct setDoc
        }
      }

      addNotification('Signal broadcasted to JamSpace!', 'success');
      setContent('');
      setSelectedTrack(null);
      setMediaUrl('');
      setShowTrackSelector(false);
      setShowImageInput(false);

      if (onPostCreated) onPostCreated();
      if (onClose) onClose();
    } catch (error) {
      console.error('[JamSpaceComposer] Error publishing post:', error);
      handleFirestoreError(error, OperationType.CREATE, 'posts');
      addNotification('Failed to broadcast post. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contentForm = (
    <div className="bg-slate-900 border border-white/[0.04] rounded-[14px] p-4 text-white shadow-xl relative overflow-hidden">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#0052FF]/40 to-transparent"></div>

      <div className="flex items-start gap-3">
        <img 
          src={userProfile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
          alt={userProfile?.name || 'User'} 
          className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0" 
        />

        <div className="flex-1 min-w-0">
          <form onSubmit={handlePostSubmit} className="space-y-3">
            <textarea
              placeholder="What's spinning in your mind or studio? Share music, thoughts, or media..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full bg-slate-950/60 border border-white/[0.04] rounded-[10px] p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#0052FF] transition-colors resize-none font-sans"
            />

            {/* Hidden file & camera inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*,video/*"
              capture="environment"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Uploading Progress Indicator */}
            {isUploading && (
              <div className="p-3 bg-slate-950 border border-[#0052FF]/30 rounded-[10px] space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#0052FF] animate-spin" /> Uploading media to Firebase Storage...
                  </span>
                  <span className="text-[#0052FF] font-mono font-bold">{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0052FF] transition-all duration-200" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}

            {/* Attached Track Preview */}
            {selectedTrack && (
              <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-[#0052FF]/30 rounded-[10px]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-[8px] bg-blue-600/20 flex items-center justify-center text-[#0052FF] shrink-0 border border-[#0052FF]/20">
                    <Disc className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono uppercase bg-[#0052FF]/20 text-[#0052FF] px-1.5 py-0.5 rounded font-extrabold">Attached Track</span>
                      <span className="text-xs font-bold text-white truncate">{selectedTrack.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{selectedTrack.artist}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTrack(null)}
                  className="p-1.5 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Attached Media Preview */}
            {mediaUrl && (
              <div className="relative rounded-[10px] overflow-hidden border border-white/10 max-h-56 bg-slate-950">
                {mediaType === 'video' ? (
                  <video src={mediaUrl} controls className="w-full max-h-56 object-cover bg-black" />
                ) : (
                  <img src={mediaUrl} alt="Attachment preview" className="w-full h-full object-cover max-h-56" />
                )}
                <button
                  type="button"
                  onClick={() => setMediaUrl('')}
                  className="absolute top-2 right-2 p-1.5 bg-slate-950/80 hover:bg-red-500/80 rounded-full text-white transition-colors cursor-pointer shadow-lg"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Track Selector Popup / Drawer */}
            <AnimatePresence>
              {showTrackSelector && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-slate-950 border border-white/[0.06] rounded-[10px] p-3 space-y-2 max-h-56 overflow-y-auto"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-[#0052FF]" /> Attach from Your Library
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowTrackSelector(false)}
                      className="text-slate-500 hover:text-white text-xs cursor-pointer"
                    >
                      Close
                    </button>
                  </div>

                  {allTracks && allTracks.length > 0 ? (
                    <div className="space-y-1">
                      {allTracks.slice(0, 15).map((track) => (
                        <div
                          key={track.id}
                          onClick={() => {
                            setSelectedTrack(track);
                            setShowTrackSelector(false);
                          }}
                          className="flex items-center justify-between p-2 rounded-[8px] hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-[#0052FF] transition-colors shrink-0">
                              <Music className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{track.title}</p>
                              <p className="text-[10px] text-slate-400 truncate">{track.artist}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-[#0052FF] opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 py-3 text-center">No tracks available in library.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Image URL Input (Optional fallback) */}
            <AnimatePresence>
              {showImageInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-2 items-center bg-slate-950 border border-white/[0.06] rounded-[10px] p-2"
                >
                  <input
                    type="url"
                    placeholder="Enter media URL (https://...)"
                    value={mediaUrl}
                    onChange={(e) => {
                      setMediaUrl(e.target.value);
                      setMediaType('image');
                    }}
                    className="flex-1 bg-transparent border-none text-xs text-white placeholder:text-slate-600 focus:outline-none px-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowImageInput(false)}
                    className="px-3 py-1 bg-[#0052FF] text-white text-xs font-bold rounded-[8px] hover:bg-[#0040cc] transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toolbar & Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.04]">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowTrackSelector(!showTrackSelector);
                    setShowImageInput(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border text-xs font-medium transition-colors cursor-pointer ${
                    selectedTrack ? 'bg-[#0052FF]/20 text-[#0052FF] border-[#0052FF]/40' : 'bg-slate-950 border-white/[0.06] text-slate-300 hover:text-white hover:border-white/20'
                  }`}
                >
                  <Music className="w-3.5 h-3.5 text-[#0052FF]" />
                  <span>{selectedTrack ? 'Track Attached' : 'Attach Music'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border text-xs font-medium transition-colors cursor-pointer ${
                    mediaUrl ? 'bg-purple-600/20 text-purple-400 border-purple-500/40' : 'bg-slate-950 border-white/[0.06] text-slate-300 hover:text-white hover:border-white/20'
                  }`}
                >
                  <Film className="w-3.5 h-3.5 text-purple-400" />
                  <span>{mediaUrl ? 'Media Attached' : 'Upload File'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  title="Capture photo or record short video clip from camera"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border bg-slate-950 border-white/[0.06] text-slate-300 hover:text-white hover:border-white/20 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Camera</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {isModal && onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-[8px] text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading || (!content.trim() && !selectedTrack && !mediaUrl)}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0052FF] hover:bg-[#0040cc] disabled:opacity-50 text-white rounded-[8px] text-xs font-bold tracking-wide transition-colors cursor-pointer shadow-lg shadow-[#0052FF]/20"
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Broadcasting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg"
        >
          <div className="flex items-center justify-between pb-2 mb-2 px-1">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-300">New JamSpace Broadcast</h3>
            <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-full text-slate-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          {contentForm}
        </motion.div>
      </div>
    );
  }

  return contentForm;
};
