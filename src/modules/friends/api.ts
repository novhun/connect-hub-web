import { api } from '../../services/api';
import { User, FriendStatusInfo, FriendRequestItem } from './types';

export const friendsApi = {
  getFriends: (): Promise<User[]> => {
    return api.getFriends();
  },
  getRequests: (direction: 'incoming' | 'outgoing' = 'incoming'): Promise<FriendRequestItem[]> => {
    return api.getFriendRequests(direction);
  },
  getSuggestions: (): Promise<User[]> => {
    return api.getFriendSuggestions();
  },
  getStatus: (userId: string): Promise<FriendStatusInfo> => {
    return api.getFriendStatus(userId);
  },
  sendRequest: (userId: string): Promise<FriendStatusInfo> => {
    return api.sendFriendRequest(userId);
  },
  respondRequest: (requestId: string, accept: boolean): Promise<FriendStatusInfo> => {
    return api.respondFriendRequest(requestId, accept);
  },
  cancelRequest: (requestId: string): Promise<{ success: boolean }> => {
    return api.cancelFriendRequest(requestId);
  },
  unfriend: (userId: string): Promise<{ success: boolean }> => {
    return api.unfriend(userId);
  },
};
