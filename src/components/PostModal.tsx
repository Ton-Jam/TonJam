import React, { useState, useRef } from "react";
import { X, Image, Share2, Sparkles, Music, Check, Send } from "lucide-react";
import { MOCK_USER, APP_LOGO } from "@/constants";
import { useAudio } from "@/context/AudioContext";

interface PostModalProps {
  onClose: () => void;
  onSubmit: (content: string, mediaUrl?: string, trackId?: string) => void;
}

const PostModal: React.FC<PostModalProps> = ({ onClose, onSubmit }) => {
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [showTrackPicker, setShowTrackPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNotification, allTracks } = useAudio();
  const maxLength = 280;

  const handleSubmit = () => {
    if (!content.trim() && !mediaUrl && !selectedTrackId) return;
    onSubmit(content, mediaUrl || undefined, selectedTrackId || undefined);
    onClose();
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        addNotification("File too large. Max 10MB allowed.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSocialShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "TonJam Broadcast",
          text: content || "Check out this signal on TonJam!",
          url: window.location.href,
        })
        .catch((error) => {
          if (error.name !== 'AbortError') {
            console.error('Error sharing:', error);
          }
        });
    } else {
      addNotification("Web Share API not supported on this browser.", "info");
    }
  };

  const progress = (content.length / maxLength) * 100;
  const selectedTrack = allTracks.find(t => t.id === selectedTrackId);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-background/90 backdrop-blur-md"
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-sm glass border border-neutral-500/10 bg-[#0A0A0A] rounded-[12px] shadow-[0_0_50px_rgba(37,99,235,0.15)] animate-in zoom-in-95 duration-200 overflow-hidden group focus-within:border-neutral-500/30 transition-all">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        <header className="flex justify-between items-center p-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <img src={APP_LOGO} className="w-4 h-4 object-contain" alt="" aria-hidden="true" />
            <h2 id="modal-title" className="text-[9px] font-bold uppercase tracking-[0.2em] text-foreground">
              New Signal
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-[6px] bg-muted/50 flex items-center justify-center text-foreground/30 hover:text-foreground hover:bg-muted transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Close modal"
          >
            <X className="h-3 w-3" />
          </button>
        </header>
        <div className="p-3">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <img
                src={MOCK_USER.avatar}
                className="w-8 h-8 rounded-full object-cover border border-border"
                alt="Your avatar"
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <textarea
                autoFocus
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe the vibe..."
                className="w-full bg-transparent border-none outline-none resize-none text-foreground text-sm placeholder:text-muted-foreground/50 min-h-[80px] font-medium tracking-tight leading-relaxed no-scrollbar focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md p-1"
                aria-label="Post content"
              ></textarea>

              {selectedTrack && (
                <div className="relative rounded-[10px] bg-muted/50 border border-border p-2 flex items-center gap-3 group/track hover:bg-muted transition-colors">
                  <img src={selectedTrack.coverUrl} className="w-10 h-10 rounded-[6px] object-cover shadow-lg" alt="" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-foreground uppercase truncate tracking-wide">{selectedTrack.title}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate mt-0.5">{selectedTrack.artist}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedTrackId(null)} 
                    className="w-7 h-7 rounded-full bg-background/20 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-red-500/20 transition-all opacity-0 group-hover/track:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label="Remove track"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {mediaUrl && (
                <div className="relative rounded-[10px] overflow-hidden group/media border border-border">
                  {mediaUrl.startsWith("data:video") ? (
                    <video
                      src={mediaUrl}
                      controls
                      className="w-full max-h-48 object-cover"
                      aria-label="Uploaded video"
                    />
                  ) : (
                    <img
                      src={mediaUrl}
                      className="w-full max-h-48 object-cover"
                      alt="Upload preview"
                    />
                  )}
                  <button
                    onClick={() => setMediaUrl(null)}
                    className="absolute top-2 right-2 w-7 h-7 bg-background/60 backdrop-blur-md rounded-full flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-red-500/80 transition-all opacity-0 group-hover/media:opacity-100 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
            className="absolute inset-x-0 bottom-[60px] top-[60px] bg-[#0A0A0A] z-20 overflow-y-auto no-scrollbar border-t border-border/50 p-3 animate-in slide-in-from-bottom-4 duration-300"
            role="region"
            aria-label="Track picker"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Select Track to Share</h3>
              <button 
                onClick={() => setShowTrackPicker(false)} 
                className="text-muted-foreground hover:text-foreground p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                aria-label="Close track picker"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-1.5">
              {allTracks.map(track => (
                <button 
                  key={track.id} 
                  onClick={() => { setSelectedTrackId(track.id); setShowTrackPicker(false); }}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-[8px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${selectedTrackId === track.id ? 'bg-blue-600/20 border border-neutral-500/30' : 'bg-muted/50 border border-transparent hover:bg-muted'}`}
                  aria-label={`Select ${track.title} by ${track.artist}`}
                  aria-pressed={selectedTrackId === track.id}
                >
                  <img src={track.coverUrl} className="w-7 h-7 rounded-[4px] object-cover" alt="" aria-hidden="true" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-[9px] font-bold text-foreground uppercase truncate">{track.title}</p>
                    <p className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest truncate">{track.artist}</p>
                  </div>
                  {selectedTrackId === track.id && <Check className="h-3 w-3 text-blue-500" aria-hidden="true" />}
                </button>
              ))}
            </div>
          </div>
        )}

        <footer className="flex items-center justify-between p-3 bg-foreground/[0.02] border-t border-border/50">
          <div className="flex gap-0.5">
            <input
              type="file"
              id="media-upload"
              ref={fileInputRef}
              onChange={handleMediaUpload}
              accept="image/*,video/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-8 h-8 rounded-[8px] flex items-center justify-center text-muted-foreground/50 hover:text-blue-400 hover:bg-blue-500/10 transition-all group/btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Upload Media"
            >
              <Image className="h-3.5 w-3.5 group-hover/btn:scale-110 transition-transform" />
            </button>
            <button
              onClick={() => setShowTrackPicker(!showTrackPicker)}
              className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-all group/btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${showTrackPicker ? 'text-blue-400 bg-blue-500/10' : 'text-muted-foreground/50 hover:text-blue-400 hover:bg-blue-500/10'}`}
              aria-label="Attach Track"
              aria-expanded={showTrackPicker}
            >
              <Music className="h-3.5 w-3.5 group-hover/btn:scale-110 transition-transform" />
            </button>
            <button
              onClick={handleSocialShare}
              className="w-8 h-8 rounded-[8px] flex items-center justify-center text-muted-foreground/50 hover:text-blue-400 hover:bg-blue-500/10 transition-all group/btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Share externally"
            >
              <Share2 className="h-3.5 w-3.5 group-hover/btn:scale-110 transition-transform" />
            </button>
            <button 
              className="px-2 h-8 rounded-[8px] flex items-center gap-1.5 text-blue-500/40 hover:text-blue-400 hover:bg-blue-500/10 transition-all group/btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Forge AI"
            >
              <Sparkles className="h-3 w-3" />
              <span className="text-[7px] font-bold uppercase tracking-widest">
                Forge AI
              </span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2" aria-label={`Character count: ${content.length} of ${maxLength}`}>
              <div className="w-10 h-1 bg-muted/50 rounded-full overflow-hidden" aria-hidden="true">
                <div
                  className={`h-full transition-all duration-300 ${progress > 90 ? "bg-red-500" : "bg-blue-500"}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              <span
                className={`text-[7px] font-bold uppercase tracking-widest tabular-nums ${content.length > maxLength ? "text-red-500" : "text-muted-foreground/50"}`}
              >
                {content.length}
              </span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={
                (!content.trim() && !mediaUrl && !selectedTrackId) || content.length > maxLength
              }
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-muted/50 disabled:text-muted-foreground/30 w-10 h-10 rounded-[8px] flex items-center justify-center text-foreground transition-all shadow-lg shadow-blue-600/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Post Signal"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PostModal;
