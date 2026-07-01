import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, MessageSquare, Share2, MoreHorizontal, CheckCircle2, 
  Users, Radio, Flame, Calendar, MapPin, Bell, ExternalLink, 
  ThumbsUp, Volume2, Plus, ArrowRight 
} from 'lucide-react';

// --- TS INTERFACES ---

export interface SocialPostData {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  isAuthorVerified?: boolean;
  content: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount?: number;
  timeString: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface CommentData {
  id: string;
  authorName: string;
  authorAvatar: string;
  isVerified?: boolean;
  content: string;
  timeString: string;
  likesCount: number;
  isLiked?: boolean;
}

export interface SpaceData {
  id: string;
  title: string;
  hostName: string;
  hostAvatar: string;
  scheduledTime?: string;
  isLive?: boolean;
  listenersCount: number;
  tags?: string[];
  avatars?: string[];
}

export interface EventData {
  id: string;
  title: string;
  organizer: string;
  date: string; // e.g. "JULY 12"
  location: string;
  price?: string; // e.g. "2 TON" or "Free"
  imageUrl?: string;
}

// --- 1. FEED CARD ---
export const FeedCard: React.FC<{
  post?: SocialPostData;
  isLoading?: boolean;
  onLike?: (post: SocialPostData) => void;
  onComment?: (post: SocialPostData) => void;
  onShare?: (post: SocialPostData) => void;
  className?: string;
}> = ({ post, isLoading, onLike, onComment, onShare, className = '' }) => {
  const [liked, setLiked] = useState(post?.isLiked || false);
  const [likesCount, setLikesCount] = useState(post?.likesCount || 0);

  if (isLoading || !post) {
    return (
      <div className={`p-4 rounded-[10px] bg-[#0A113A]/60 animate-pulse w-full max-w-[480px] ${className}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-white/10 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 bg-white/10 rounded w-1/3" />
            <div className="h-3 bg-white/10 rounded w-1/4" />
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-3.5 bg-white/10 rounded w-full" />
          <div className="h-3.5 bg-white/10 rounded w-5/6" />
        </div>
      </div>
    );
  }

  const handleLikeClick = () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount(likesCount + (nextLiked ? 1 : -1));
    onLike?.(post);
  };

  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white w-full max-w-[480px] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-slate-950">
            <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[13px] font-black truncate">{post.authorName}</span>
              {post.isAuthorVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-current shrink-0" />}
            </div>
            <p className="text-[10px] text-[#9AA0AE] font-mono leading-none mt-0.5">{post.authorUsername} • {post.timeString}</p>
          </div>
        </div>
        <button className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
          <MoreHorizontal className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* Body Content */}
      <p className="text-xs sm:text-[13px] text-white/90 leading-relaxed mb-3.5 whitespace-pre-wrap">{post.content}</p>

      {/* Optional Media Image */}
      {post.imageUrl && (
        <div className="w-full max-h-[240px] rounded-lg overflow-hidden mb-3.5 bg-slate-950">
          <img src={post.imageUrl} alt="post visual" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Footer Controls */}
      <div className="flex justify-between items-center pt-2.5 border-t border-white/5 text-[11px] text-[#9AA0AE] font-mono">
        <button onClick={handleLikeClick} className="flex items-center gap-1.5 hover:text-white transition-colors">
          <Heart className={`w-4 h-4 transition-transform active:scale-125 ${liked ? 'text-red-500 fill-red-500' : ''}`} />
          <span>{likesCount}</span>
        </button>
        <button onClick={() => onComment?.(post)} className="flex items-center gap-1.5 hover:text-white transition-colors">
          <MessageSquare className="w-4 h-4" />
          <span>{post.commentsCount}</span>
        </button>
        <button onClick={() => onShare?.(post)} className="flex items-center gap-1.5 hover:text-white transition-colors">
          <Share2 className="w-4 h-4" />
          <span>{post.sharesCount || 0}</span>
        </button>
      </div>
    </div>
  );
};

// --- 2. COMMENT CARD ---
export const CommentCard: React.FC<{
  comment: CommentData;
  onLike?: () => void;
  className?: string;
}> = ({ comment, onLike, className = '' }) => {
  const [liked, setLiked] = useState(comment.isLiked || false);
  const [likesCount, setLikesCount] = useState(comment.likesCount);

  return (
    <div className={`p-3 rounded-[10px] bg-[#0A113A]/50 select-none text-white w-full ${className}`}>
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-slate-950 mt-0.5">
          <img src={comment.authorAvatar} alt={comment.authorName} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[12px] font-black truncate">{comment.authorName}</span>
            {comment.isVerified && <CheckCircle2 className="w-3 h-3 text-blue-500 fill-current shrink-0" />}
            <span className="text-[9px] text-[#9AA0AE] font-mono">{comment.timeString}</span>
          </div>
          <p className="text-[12px] text-white/85 mt-1 leading-relaxed">{comment.content}</p>
          <div className="flex items-center gap-3 mt-2 font-mono text-[9px] text-[#9AA0AE]">
            <button onClick={() => { setLiked(!liked); setLikesCount(likesCount + (!liked ? 1 : -1)); onLike?.(); }} className="flex items-center gap-1 hover:text-white transition-colors">
              <ThumbsUp className={`w-3 h-3 ${liked ? 'text-blue-400 fill-current' : ''}`} />
              <span>{likesCount}</span>
            </button>
            <button className="hover:text-white">Reply</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 3. POST CARD (Compact Text-Only status update) ---
export const PostCard: React.FC<{
  post: SocialPostData;
  onLike?: () => void;
  className?: string;
}> = ({ post, onLike, className = '' }) => {
  return <FeedCard post={post} onLike={onLike} className={className} />;
};

// --- 4. COMMUNITY CARD ---
export const CommunityCard: React.FC<{
  name: string;
  membersCount: number;
  category: string;
  onlineCount?: number;
  avatarUrl?: string;
  onJoin?: () => void;
  className?: string;
}> = ({ name, membersCount, category, onlineCount = 0, avatarUrl, onJoin, className = '' }) => {
  const [joined, setJoined] = useState(false);
  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white w-full max-w-[260px] shrink-0 snap-start flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-[8px] font-black uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">{category}</span>
          {onlineCount > 0 && (
            <span className="flex items-center gap-1 font-mono text-[9px] text-emerald-400">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> {onlineCount} online
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-lg bg-slate-950 overflow-hidden shrink-0">
            {avatarUrl && <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />}
          </div>
          <div className="min-w-0">
            <h4 className="text-[14px] font-bold truncate">{name}</h4>
            <p className="text-[10px] text-[#9AA0AE] font-mono mt-0.5">{membersCount.toLocaleString()} members</p>
          </div>
        </div>
      </div>
      <button
        onClick={() => { setJoined(!joined); onJoin?.(); }}
        className={`w-full py-1.5 text-[11px] font-black uppercase tracking-wider rounded-[6px] transition-all flex items-center justify-center gap-1 ${
          joined ? 'bg-white/10 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
        }`}
      >
        {joined ? 'MEMBERSHIP UNLOCKED' : <><Plus className="w-3.5 h-3.5" /> JOIN HUB</>}
      </button>
    </div>
  );
};

// --- 5. SPACE CARD (Scheduled Session) ---
export const SpaceCard: React.FC<{
  space: SpaceData;
  onRSVP?: () => void;
  className?: string;
}> = ({ space, onRSVP, className = '' }) => {
  const [rsvpState, setRsvpState] = useState(false);
  const avatars = space.avatars || [];

  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white w-full max-w-[260px] shrink-0 snap-start flex flex-col justify-between h-44 ${className}`}>
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="flex items-center gap-1 text-[9px] font-black text-amber-500 uppercase">
            <Calendar className="w-3 h-3" /> SCHEDULED
          </span>
          {space.scheduledTime && <span className="text-[9px] font-mono text-[#9AA0AE]">{space.scheduledTime}</span>}
        </div>
        <h4 className="text-[14px] font-black tracking-tight line-clamp-2 uppercase leading-snug">{space.title}</h4>
        <p className="text-[11px] text-[#9AA0AE] truncate mt-1">Host: {space.hostName}</p>
      </div>

      <div className="flex items-center justify-between mt-3">
        {/* Avatars group overlap */}
        <div className="flex -space-x-2 overflow-hidden">
          {avatars.map((av, idx) => (
            <img key={idx} className="inline-block h-6 w-6 rounded-full ring-2 ring-[#0A113A] object-cover" src={av} alt="participant" />
          ))}
        </div>
        <button
          onClick={() => { setRsvpState(!rsvpState); onRSVP?.(); }}
          className={`py-1 px-3 rounded-[6px] text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
            rsvpState ? 'bg-white/10 text-white' : 'bg-blue-600 text-white'
          }`}
        >
          <Bell className="w-3 h-3" />
          <span>{rsvpState ? 'Reminding' : 'RSVP'}</span>
        </button>
      </div>
    </div>
  );
};

// --- 6. LIVE SPACE CARD (Active Broadcast Audio room) ---
export const LiveSpaceCard: React.FC<{
  space: SpaceData;
  onTuneIn?: () => void;
  className?: string;
}> = ({ space, onTuneIn, className = '' }) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`p-4 rounded-[10px] bg-gradient-to-tr from-[#1E1B4B] to-[#0A113A] select-none text-white w-full max-w-[260px] shrink-0 snap-start flex flex-col justify-between h-44 relative overflow-hidden ${className}`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Radio className="w-24 h-24 text-red-500" />
      </div>

      <div className="z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="flex items-center gap-1 bg-red-600 text-white text-[8px] font-black tracking-wider uppercase px-2 py-0.5 rounded-[4px]">
            <Radio className="w-3 h-3 fill-current animate-pulse" /> LIVE NOW
          </span>
          <span className="flex items-center gap-1 font-mono text-[9px] text-red-400">
            <Users className="w-3 h-3" /> {space.listenersCount.toLocaleString()} listening
          </span>
        </div>
        <h4 className="text-[14px] font-black tracking-tight line-clamp-2 uppercase leading-snug">{space.title}</h4>
        <p className="text-[11px] text-white/70 mt-1">Host: {space.hostName}</p>
      </div>

      <div className="flex items-center justify-between mt-3 z-10">
        <div className="flex items-center gap-0.5">
          <span className="w-1 h-3 bg-red-500 rounded animate-bounce" />
          <span className="w-1 h-4.5 bg-red-500 rounded animate-bounce [animation-delay:0.2s]" />
          <span className="w-1 h-2 bg-red-500 rounded animate-bounce [animation-delay:0.4s]" />
        </div>
        <button onClick={onTuneIn} className="py-1.5 px-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-[10px] uppercase tracking-wider rounded-[6px] flex items-center gap-1 shadow-lg">
          <Volume2 className="w-3.5 h-3.5" /> Tune In
        </button>
      </div>
    </motion.div>
  );
};

// --- 7. ANNOUNCEMENT CARD ---
export const AnnouncementCard: React.FC<{
  title: string;
  description: string;
  ctaText?: string;
  onCTA?: () => void;
  className?: string;
}> = ({ title, description, ctaText = 'LEARN MORE', onCTA, className = '' }) => {
  return (
    <div className={`p-4 rounded-[10px] bg-gradient-to-r from-purple-900 to-blue-900 text-white select-none ${className}`}>
      <div className="flex items-center gap-1.5 mb-2">
        <Flame className="w-4 h-4 text-amber-400 fill-current" />
        <span className="text-[9px] font-black uppercase tracking-widest text-amber-300">PLATFORM NEWS</span>
      </div>
      <h3 className="text-base font-black leading-tight uppercase tracking-tight mb-1">{title}</h3>
      <p className="text-[11px] text-white/80 leading-relaxed mb-3.5">{description}</p>
      <button onClick={onCTA} className="text-[10px] font-black uppercase tracking-widest text-white hover:text-blue-300 transition-colors flex items-center gap-1">
        <span>{ctaText}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// --- 8. EVENT CARD ---
export const EventCard: React.FC<{
  event: EventData;
  onGetTickets?: () => void;
  className?: string;
}> = ({ event, onGetTickets, className = '' }) => {
  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white flex items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-14 h-14 bg-blue-900 text-white flex flex-col items-center justify-center rounded-lg font-black shrink-0 shadow-inner">
          <span className="text-[9px] uppercase text-blue-300 tracking-wider">DATE</span>
          <span className="text-sm tracking-tighter leading-none mt-0.5">{event.date.split(' ')[1] || '12'}</span>
          <span className="text-[8px] uppercase">{event.date.split(' ')[0] || 'JUL'}</span>
        </div>
        <div className="min-w-0">
          <h4 className="text-[14px] font-bold text-white truncate uppercase tracking-tight">{event.title}</h4>
          <div className="flex items-center gap-1.5 text-[10px] text-[#9AA0AE] mt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-[#9AA0AE]" />
            <span className="truncate">{event.location}</span>
          </div>
          <p className="text-[10px] text-[#9AA0AE]/70 font-mono mt-0.5">by {event.organizer}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className="text-sm font-black text-emerald-400 font-mono">{event.price || 'Free'}</span>
        <button onClick={onGetTickets} className="py-1 px-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-[9px] uppercase tracking-wider rounded-[4px] transition-transform active:scale-95">
          Get Tickets
        </button>
      </div>
    </div>
  );
};
