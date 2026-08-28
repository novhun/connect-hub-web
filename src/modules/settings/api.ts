import { api } from '../../services/api';
import { UserSettings } from './types';

export const settingsApi = {
  getSettings: (): Promise<UserSettings> => {
    return api.getSettings();
  },
  updateSettings: (data: Partial<UserSettings>): Promise<UserSettings> => {
    return api.updateSettings(data);
  },
};
