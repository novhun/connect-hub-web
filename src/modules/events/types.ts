import { EventItem } from '../../types';

export type { EventItem };

export interface CreateEventPayload {
  title: string;
  description?: string;
  location: string;
  category?: string;
  coverImage?: string;
  startAt: string;
}
