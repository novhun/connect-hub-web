import { Group, User } from '../../types';

export type { Group, User };

export interface CreateGroupPayload {
  name: string;
  icon: string;
  coverImage?: string;
  description: string;
  isPrivate?: boolean;
}
