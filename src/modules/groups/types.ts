import { Group, GroupMember, User } from '../../types';

export type { Group, GroupMember, User };

export interface CreateGroupPayload {
  name: string;
  icon: string;
  coverImage?: string;
  description: string;
  isPrivate?: boolean;
}

export interface UpdateGroupPayload {
  name?: string;
  icon?: string;
  coverImage?: string;
  description?: string;
  isPrivate?: boolean;
}
