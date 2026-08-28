import { api } from '../../services/api';
import { EventItem, CreateEventPayload } from './types';

export const eventsApi = {
  getEvents: (): Promise<EventItem[]> => {
    return api.getEvents();
  },
  createEvent: (data: CreateEventPayload): Promise<EventItem> => {
    return api.createEvent(data);
  },
  attendEvent: (eventId: string): Promise<EventItem> => {
    return api.attendEvent(eventId);
  },
  leaveEvent: (eventId: string): Promise<EventItem> => {
    return api.leaveEvent(eventId);
  },
  deleteEvent: (eventId: string): Promise<{ success: boolean }> => {
    return api.deleteEvent(eventId);
  },
};
