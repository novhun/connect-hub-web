import { api } from '../../services/api';
import { EventItem, CreateEventPayload, UpdateEventPayload, EventMember } from './types';

export const eventsApi = {
  getEvents: (): Promise<EventItem[]> => {
    return api.getEvents();
  },
  getEvent: (eventId: string): Promise<EventItem> => {
    return api.getEvent(eventId);
  },
  createEvent: (data: CreateEventPayload): Promise<EventItem> => {
    return api.createEvent(data);
  },
  updateEvent: (eventId: string, data: UpdateEventPayload): Promise<EventItem> => {
    return api.updateEvent(eventId, data);
  },
  getEventMembers: (eventId: string): Promise<EventMember[]> => {
    return api.getEventMembers(eventId);
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
