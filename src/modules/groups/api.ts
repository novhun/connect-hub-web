import { api } from '../../services/api';
import { Group, CreateGroupPayload } from './types';

export const groupsApi = {
  getGroups: (): Promise<Group[]> => {
    return api.getGroups();
  },
  getGroup: (groupId: string): Promise<Group> => {
    return api.getGroup(groupId);
  },
  createGroup: (data: CreateGroupPayload): Promise<Group> => {
    return api.createGroup(data);
  },
  joinGroup: (groupId: string): Promise<Group> => {
    return api.joinGroup(groupId);
  },
  leaveGroup: (groupId: string): Promise<Group> => {
    return api.leaveGroup(groupId);
  },
};
