import { Story, User } from '../../types';

export type { Story, User };

export interface CreateStoryPayload {
  storyImage: string;
  caption?: string;
}
