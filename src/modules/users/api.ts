import { api } from '../../services/api';
import { User, UpdateProfilePayload } from './types';

export const usersApi = {
  getUsers: (params?: { onlyOnline?: boolean; query?: string }): Promise<User[]> => {
    return api.getUsers(params);
  },
  getProfile: (userId: string): Promise<User> => {
    return api.getUserProfile(userId);
  },
  updateProfile: (data: UpdateProfilePayload): Promise<User> => {
    return api.updateProfile(data);
  },
  updatePresence: (isOnline: boolean): Promise<User> => {
    return api.updatePresence(isOnline);
  },
};
