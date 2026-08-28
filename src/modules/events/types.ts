import { EventItem, EventMember } from '../../types';

export type { EventItem, EventMember };

export interface CreateEventPayload {
  title: string;
  description?: string;
  location: string;
  category?: string;
  coverImage?: string;
  startAt: string;
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  location?: string;
  category?: string;
  coverImage?: string;
  startAt?: string;
}
