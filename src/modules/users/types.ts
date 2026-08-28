import { User } from '../../types';

export type { User };

export interface UpdateProfilePayload {
  name?: string;
  avatar?: string;
  role?: string;
  bio?: string;
}
