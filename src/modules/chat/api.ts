import { api } from '../../services/api';
import { DirectMessage } from './types';

export const chatApi = {
  getMessages: (userId: string): Promise<DirectMessage[]> => {
    return api.getMessages(userId);
  },
  sendMessage: (userId: string, text: string): Promise<DirectMessage> => {
    return api.sendMessage(userId, text);
  },
  markRead: (userId: string): Promise<{ success: boolean }> => {
    return api.markChatRead(userId);
  },
  getWebSocketUrl: (userId: string): string => {
    return api.getChatWebSocketUrl(userId);
  },
};
