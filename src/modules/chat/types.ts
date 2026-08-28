import { DirectMessage, User } from '../../types';

export type { DirectMessage, User };

export interface SendMessagePayload {
  recipientId: string;
  text: string;
}
