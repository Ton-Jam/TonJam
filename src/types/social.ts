import { serverTimestamp, Timestamp } from 'firebase/firestore';

export type PostVisibility = 'public' | 'followers' | 'unlisted';

export interface PostAuthor {
  uid: string;
  name: string;
  username: string;
  avatar: string;
  isVerified?: boolean;
  role?: 'artist' | 'collector' | 'admin' | 'user' | string;
}

export type AttachmentType = 'image' | 'video' | 'track' | 'nft';

export interface PostAttachment {
  type: AttachmentType;
  url: string;
  id?: string;
  title?: string;
  artist?: string;
  artistId?: string;
  coverUrl?: string;
  price?: string;
  duration?: number;
}

export interface QuotePostSnippet {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorVerified?: boolean;
  text: string;
  createdAt: string;
  attachment?: PostAttachment;
}

export interface SocialPost {
  id: string;
  authorId: string;
  author: PostAuthor;
  text: string;
  createdAt: any; // Server Timestamp or ISO string
  updatedAt?: any;
  visibility: PostVisibility;
  
  // Conversation threading
  replyToPostId?: string | null;
  replyToAuthorUsername?: string | null;
  rootPostId?: string | null;
  
  // Quote-post relationship
  quotePostId?: string | null;
  quotePost?: QuotePostSnippet | null;
  
  // Attachments
  attachments?: PostAttachment[];
  
  // Engagement counters
  likeCount: number;
  replyCount: number;
  repostCount: number;
  bookmarkCount: number;
  
  // Client-hydrated interaction state for current user
  isLiked?: boolean;
  isReposted?: boolean;
  isBookmarked?: boolean;
  
  // Moderation
  moderationStatus?: 'active' | 'flagged' | 'removed';
}

export interface SocialLike {
  userId: string;
  postId: string;
  createdAt: any;
}

export interface SocialRepost {
  userId: string;
  postId: string;
  createdAt: any;
}

export interface SocialBookmark {
  userId: string;
  postId: string;
  createdAt: any;
  postSnapshot?: {
    text: string;
    authorName: string;
    authorUsername: string;
    authorAvatar: string;
  };
}

export interface SocialFollow {
  followerId: string;
  followingId: string;
  createdAt: any;
}

export interface SocialBlock {
  blockerId: string;
  blockedId: string;
  createdAt: any;
}

export interface SocialMute {
  muterId: string;
  mutedId: string;
  createdAt: any;
}

export type SocialNotificationType = 'like' | 'reply' | 'repost' | 'quote' | 'follow' | 'mention';

export interface SocialNotification {
  id: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  senderAvatar: string;
  type: SocialNotificationType;
  postId?: string;
  postSnippet?: string;
  read: boolean;
  createdAt: any;
}

export interface SocialReport {
  id: string;
  reporterId: string;
  targetPostId?: string;
  targetUserId?: string;
  reason: 'spam' | 'harassment' | 'copyright' | 'inappropriate' | 'other';
  details?: string;
  createdAt: any;
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
}

export interface ConversationThread {
  post: SocialPost;
  parentPost?: SocialPost | null;
  rootPost?: SocialPost | null;
  replies: SocialPost[];
}
