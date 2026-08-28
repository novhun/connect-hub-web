import { api } from '../../services/api';
import { Group, GroupMember, CreateGroupPayload, UpdateGroupPayload } from './types';

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
  updateGroup: (groupId: string, data: UpdateGroupPayload): Promise<Group> => {
    return api.updateGroup(groupId, data);
  },
  getGroupMembers: (groupId: string): Promise<GroupMember[]> => {
    return api.getGroupMembers(groupId);
  },
  joinGroup: (groupId: string): Promise<Group> => {
    return api.joinGroup(groupId);
  },
  leaveGroup: (groupId: string): Promise<Group> => {
    return api.leaveGroup(groupId);
  },
  deleteGroup: (groupId: string): Promise<{ success: boolean; message: string }> => {
    return api.deleteGroup(groupId);
  },
};
