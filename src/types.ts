export interface User {
  id: string;
  name: string;
  avatar: string;
  role?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  storyImage: string;
  timestamp: string;
  caption?: string;
  viewed?: boolean;
}

export interface Comment {
  id: string;
  user: User;
  content: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
}

export type ReactionType = 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry';

export interface ReactionCount {
  like: number;
  love: number;
  care: number;
  haha: number;
  wow: number;
  sad: number;
  angry: number;
}

export interface Post {
  id: string;
  author: User;
  timestamp: string;
  privacy: 'public' | 'friends' | 'only_me';
  content: string;
  images?: string[];
  reactionCounts: ReactionCount;
  userReaction?: ReactionType | null;
  comments: Comment[];
  sharesCount: number;
  isSaved?: boolean;
  feeling?: string;
  location?: string;
  taggedGroup?: string;
}

export interface Group {
  id: string;
  name: string;
  icon: string;
  coverImage?: string;
  description: string;
  isPrivate: boolean;
  membersCount: string;
  membersNumber: number;
  isManaged?: boolean;
  joined?: boolean;
  recentPostsCount?: number;
}

export interface NotificationItem {
  id: string;
  user: User;
  type: 'like' | 'comment' | 'share' | 'group' | 'call';
  content: string;
  target?: string;
  timestamp: string;
  isRead: boolean;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface ChatSession {
  userId: string;
  user: User;
  messages: DirectMessage[];
  isOpen: boolean;
  isMinimized: boolean;
}
