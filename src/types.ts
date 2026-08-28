export interface User {
  id: string;
  name: string;
  avatar: string;
  coverImage?: string;
  email?: string;
  role?: string;
  bio?: string;
  jobTitle?: string;
  location?: string;
  website?: string;
  isOnline?: boolean;
  lastSeen?: string;
  createdAt?: string;
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
  userReaction?: ReactionType | null;
  parentId?: string;
  replies?: Comment[];
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
  sharedPostId?: string;
  sharedPost?: Post;
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

export interface GroupMember {
  id: string;
  userId: string;
  name: string;
  username: string;
  avatar?: string;
  headline?: string;
  role: string;
  isCreator: boolean;
  joinedAt: string;
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
  messageType?: 'text' | 'voice' | 'file' | 'sticker' | 'image';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: string;
  duration?: string;
}

export interface ChatSession {
  userId: string;
  user: User;
  messages: DirectMessage[];
  isOpen: boolean;
  isMinimized: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  description?: string;
  location: string;
  category?: string;
  coverImage?: string;
  startAt: string;
  date: string;
  attendeesCount: number;
  isAttending: boolean;
  isCreator: boolean;
  creatorId: string;
}

export interface EventMember {
  id: string;
  userId: string;
  name: string;
  username: string;
  avatar?: string;
  headline?: string;
  isCreator: boolean;
  joinedAt: string;
}

export interface SupportMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface UserSettings {
  pushNotifications: boolean;
  callRingtone: boolean;
  defaultAudience: 'public' | 'friends' | 'only_me';
  showOnlineStatus: boolean;
}

export type FriendStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends' | 'self';

export interface FriendStatusInfo {
  status: FriendStatus;
  requestId?: string;
}

export interface FriendRequestItem {
  id: string;
  user: User;
  status: 'pending' | 'accepted';
  direction: 'incoming' | 'outgoing';
  createdAt: string;
}
