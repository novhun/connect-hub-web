import { User, SupportMessage } from '../../types';

export type { SupportMessage };

export interface CallSession {
  id: string;
  callerId: string;
  receiverId: string;
  roomId: string;
  callType: 'audio' | 'video';
  status: 'initiating' | 'ringing' | 'connected' | 'completed' | 'missed' | 'declined';
  durationSeconds: number;
  caller?: User;
  receiver?: User;
}

export interface CallHistoryItem {
  id: string;
  user: User;
  type: 'incoming' | 'outgoing';
  date: string;
  status: 'completed' | 'missed' | 'declined';
  duration?: string;
  callType: 'audio' | 'video';
}
