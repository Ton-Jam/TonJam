export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isVerified: boolean;
  contributionPoints: number;
  badges: string[];
  role: 'artist' | 'fan' | 'moderator' | 'curator';
}

export interface Artist {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  genre: string;
  followersCount: number;
  trackCount: number;
  nftCount: number;
  isVerified: boolean;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  liveSpacesCount: number;
  imageUrl: string;
  joined: boolean;
}

export interface PollOption {
  text: string;
  votes: number;
}

export interface Poll {
  question: string;
  options: PollOption[];
  totalVotes: number;
  votedIndex?: number;
}

export interface Attachment {
  type: 'image' | 'video' | 'audio' | 'track' | 'nft';
  url?: string;
  title?: string;
  artist?: string;
  price?: string;
  id?: string;
}

export interface Post {
  id: string;
  user: User;
  content: string;
  attachments?: Attachment[];
  timestamp: string;
  likes: number;
  commentsCount: number;
  reposts: number;
  isPinned?: boolean;
  category: string;
  isLiked?: boolean;
  isReposted?: boolean;
  isBookmarked?: boolean;
  poll?: Poll;
  replies?: Reply[];
}

export interface Reply {
  id: string;
  postId: string;
  user: User;
  content: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
}

export interface Space {
  id: string;
  title: string;
  host: User;
  listenerCount: number;
  speakerAvatars: string[];
  isLive: boolean;
  scheduledTime?: string;
  description: string;
  speakers: string[];
}

export interface NFTDiscussion {
  id: string;
  title: string;
  imageUrl: string;
  currentBid: string;
  timeLeft: string;
  author: string;
  royaltyPercent: number;
  marketplaceUrl: string;
  royaltiesEarned: string;
  bidsCount: number;
}

export interface MusicNews {
  id: string;
  title: string;
  summary: string;
  category: 'announcement' | 'release' | 'concert' | 'industry';
  timestamp: string;
  imageUrl: string;
  readTime: string;
}

export interface Event {
  id: string;
  title: string;
  type: 'concert' | 'space' | 'launch' | 'nft' | 'meetup';
  date: string;
  location: string;
  imageUrl: string;
  host: string;
  interestedCount: number;
  interested: boolean;
}

export interface JamSpaceNotification {
  id: string;
  type: 'like' | 'reply' | 'mention' | 'follow' | 'invite';
  user: User;
  content: string;
  timestamp: string;
  read: boolean;
}
