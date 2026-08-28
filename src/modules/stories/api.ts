import { api } from '../../services/api';
import { Story, CreateStoryPayload } from './types';

export const storiesApi = {
  getStories: (): Promise<Story[]> => {
    return api.getStories();
  },
  createStory: (data: CreateStoryPayload): Promise<Story> => {
    return api.createStory(data);
  },
  markStoryViewed: (storyId: string): Promise<{ success: boolean }> => {
    return api.markStoryViewed(storyId);
  },
  deleteStory: (storyId: string): Promise<{ success: boolean }> => {
    return api.deleteStory(storyId);
  },
};
