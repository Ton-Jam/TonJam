import React, { useState, useRef } from "react";
import { X, Image, Share2, Sparkles, Music, Check, Send, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MOCK_USER, APP_LOGO } from "@/constants";
import { useAudio } from "@/contexts/AudioContext";
import { getPlaceholderImage, validateFile, ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, shareContent } from "@/lib/utils";
import { uploadPostImage } from "@/services/storageService";

interface PostModalProps {
  onClose: () => void;
  onSubmit: (content: string, mediaUrl?: string, trackId?: string) => void;
}

const PostModal: React.FC<PostModalProps> = ({ onClose, onSubmit }) => {
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [showTrackPicker, setShowTrackPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNotification, allTracks } = useAudio();
  const maxLength = 280;

  const handleSubmit = async () => {
    if (!content.trim() && !mediaUrl && !selectedTrackId) return;
    
    let finalMediaUrl = mediaUrl || undefined;
    
    if (mediaFile) {
      try {
        setIsUploading(true);
        addNotification("Broadcasting signal assets...", "info");
        const { downloadUrl } = await uploadPostImage(mediaFile);
        finalMediaUrl = downloadUrl;
      } catch (error) {
        console.error("Post upload error:", error);
        addNotification("Failed to upload signal media", "error");
        setIsUploading(false);
        return;
      }
    }

    onSubmit(content, finalMediaUrl, selectedTrackId || undefined);
    onClose();
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file, 'image_or_video', 10);
      if (!validation.isValid) {
        addNotification(validation.error || "Invalid file", "error");
        e.target.value = '';
        return;
      }
      setMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSocialShare = async () => {
    const result = await shareContent({
      title: "TonJam Broadcast",
      text: content || "Check out this signal on TonJam!",
      url: window.location.href,
    });

    if (result.success) {
      if (result.method === 'clipboard') {
        addNotification("Signal link copied to local buffer", "success");
      }
    }
  };

  const progress = (content.length / maxLength) * 100;
  const selectedTrack = allTracks.find(t => t.id === selectedTrackId);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-lg border-none bg-[#0F141C] text-white rounded-2xl sm:rounded-3xl shadow-2xl">
        <DialogHeader className="p-5 flex flex-row items-center justify-between bg-white/[0.02] border-none">
          <div className="flex items-center gap-2.5">
            <img src={APP_LOGO} className="w-5 h-5 object-contain" alt="" aria-hidden="true" />
            <DialogTitle className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
              New Signal
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="p-5">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <img
                src={MOCK_USER.avatar || getPlaceholderImage(`user-${MOCK_USER.uid}`)}
                className="w-10 h-10 rounded-full object-cover border-none"
                alt="Your avatar"
              />
            </div>
            <div className="flex-1 flex flex-col gap-4">
              <textarea
                autoFocus
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe the vibe..."
                className="w-full bg-white/[0.04] focus:bg-white/[0.06] border-none outline-none resize-none text-white text-sm placeholder:text-zinc-500 min-h-[90px] font-medium tracking-tight leading-relaxed no-scrollbar rounded-xl p-3.5 transition-colors"
                aria-label="Post content"
              ></textarea>

              {selectedTrack && (
                <div className="relative rounded-xl bg-white/[0.04] border-none p-2.5 flex items-center gap-2.5 group/track hover:bg-white/[0.07] transition-colors">
                  <img src={selectedTrack.coverUrl || getPlaceholderImage(`track-${selectedTrack.id}`)} className="w-10 h-10 rounded-lg object-cover shadow-lg" alt="" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-white uppercase truncate tracking-wide">{selectedTrack.title}</p>
                    <p className="text-[9px] font-medium text-zinc-400 uppercase tracking-wider truncate">{selectedTrack.artist}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedTrackId(null)} 
                    className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-rose-500/30 transition-all opacity-0 group-hover/track:opacity-100 border-none cursor-pointer"
                    aria-label="Remove track"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {mediaUrl && (
                <div className="relative rounded-xl overflow-hidden group/media border-none bg-white/[0.02]">
                  {mediaUrl.startsWith("data:video") ? (
                    <video
                      src={mediaUrl}
                      controls
                      className="w-full max-h-48 object-cover rounded-xl"
                      aria-label="Uploaded video"
                    />
                  ) : (
                    <img
                      src={mediaUrl}
                      className="w-full max-h-48 object-cover rounded-xl"
                      alt="Upload preview"
                    />
                  )}
                  <button
                    onClick={() => setMediaUrl(null)}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-rose-500/80 transition-all opacity-0 group-hover/media:opacity-100 shadow-lg border-none cursor-pointer"
                    aria-label="Remove media"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {showTrackPicker && (
          <div 
            className="absolute inset-x-0 bottom-[60px] top-[60px] bg-[#0F141C] z-20 overflow-y-auto no-scrollbar p-4 animate-in slide-in-from-bottom-4 duration-300 border-none"
            role="region"
            aria-label="Track picker"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Select Track to Share</h3>
              <button 
                onClick={() => setShowTrackPicker(false)} 
                className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-white/10 border-none cursor-pointer"
                aria-label="Close track picker"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {allTracks.map(track => (
                <button 
                  key={track.id} 
                  onClick={() => { setSelectedTrackId(track.id); setShowTrackPicker(false); }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all border-none cursor-pointer ${selectedTrackId === track.id ? 'bg-[#00B4D8]/20 text-white' : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white'}`}
                  aria-label={`Select ${track.title} by ${track.artist}`}
                  aria-pressed={selectedTrackId === track.id}
                >
                  <img src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} className="w-8 h-8 rounded-lg object-cover" alt="" aria-hidden="true" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-[11px] font-bold uppercase truncate">{track.title}</p>
                    <p className="text-[9px] font-medium text-zinc-400 uppercase tracking-wider truncate">{track.artist}</p>
                  </div>
                  {selectedTrackId === track.id && <Check className="h-3.5 w-3.5 text-[#00B4D8]" aria-hidden="true" />}
                </button>
              ))}
            </div>
          </div>
        )}

        <footer className="flex items-center justify-between p-3 sm:p-4 bg-white/[0.02] border-none">
          <div className="flex gap-2">
            <input
              type="file"
              id="media-upload"
              ref={fileInputRef}
              onChange={handleMediaUpload}
              accept={[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(',')}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-[#00B4D8] hover:bg-[#00B4D8]/10 transition-all border-none cursor-pointer"
              aria-label="Upload Media"
            >
              <Image className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowTrackPicker(!showTrackPicker)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border-none cursor-pointer ${showTrackPicker ? 'text-[#00B4D8] bg-[#00B4D8]/10' : 'text-zinc-400 hover:text-[#00B4D8] hover:bg-[#00B4D8]/10'}`}
              aria-label="Attach Track"
              aria-expanded={showTrackPicker}
            >
              <Music className="h-4 w-4" />
            </button>
            <button
              onClick={handleSocialShare}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-[#00B4D8] hover:bg-[#00B4D8]/10 transition-all border-none cursor-pointer"
              aria-label="Share externally"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2" aria-label={`Character count: ${content.length} of ${maxLength}`}>
              <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden" aria-hidden="true">
                <div
                  className={`h-full transition-all duration-300 ${progress > 90 ? "bg-rose-500" : "bg-[#00B4D8]"}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              <span
                className={`text-[9px] font-mono font-bold tabular-nums ${content.length > maxLength ? "text-rose-400" : "text-zinc-500"}`}
              >
                {content.length}
              </span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={
                (!content.trim() && !mediaUrl && !selectedTrackId) || content.length > maxLength || isUploading
              }
              className="bg-[#00B4D8] hover:bg-[#00B4D8]/90 disabled:bg-white/[0.05] disabled:text-zinc-600 w-9 h-9 rounded-xl flex items-center justify-center text-black font-bold transition-all shadow-md shadow-[#00B4D8]/20 active:scale-95 border-none cursor-pointer"
              aria-label="Post Signal"
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
};

export default PostModal;
