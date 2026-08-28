import { Post, ReactionType, Comment, User } from '../../types';

export type { Post, ReactionType, Comment, User };

export interface CreatePostPayload {
  content: string;
  privacy?: 'public' | 'friends' | 'only_me';
  images?: string[];
  feeling?: string;
  location?: string;
  taggedGroup?: string;
  sharedPostId?: string;
}

export interface PostFeedFilter {
  group?: string;
  authorId?: string;
  savedOnly?: boolean;
}
