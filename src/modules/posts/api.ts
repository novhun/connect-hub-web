import { api } from '../../services/api';
import { Post, ReactionType, CreatePostPayload, PostFeedFilter } from './types';

export const postsApi = {
  getFeed: (filters?: PostFeedFilter): Promise<Post[]> => {
    return api.getFeed(filters);
  },
  createPost: (data: CreatePostPayload): Promise<Post> => {
    return api.createPost(data);
  },
  reactPost: (postId: string, reaction: ReactionType | null): Promise<Post> => {
    return api.reactPost(postId, reaction);
  },
  addComment: (postId: string, content: string): Promise<Post> => {
    return api.addComment(postId, content);
  },
  toggleCommentLike: (commentId: string): Promise<{ isLiked: boolean }> => {
    return api.toggleCommentLike(commentId);
  },
  toggleSavePost: (postId: string): Promise<{ isSaved: boolean }> => {
    return api.toggleSavePost(postId);
  },
  sharePost: (postId: string): Promise<{ sharesCount: number }> => {
    return api.sharePost(postId);
  },
  deletePost: (postId: string): Promise<{ success: boolean }> => {
    return api.deletePost(postId);
  },
  updatePost: (postId: string, data: Partial<CreatePostPayload>): Promise<Post> => {
    return api.updatePost(postId, data);
  },
  uploadMedia: (file: File): Promise<{ url: string; filename: string; size: number }> => {
    return api.uploadMedia(file);
  },
};
