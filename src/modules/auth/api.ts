import { api } from '../../services/api';
import { AuthResponse, LoginPayload, RegisterPayload } from './types';
import { User } from '../../types';

export const authApi = {
  login: (data: LoginPayload): Promise<{ access_token: string; user: User }> => {
    return api.login(data.email, data.password);
  },
  register: (data: RegisterPayload): Promise<{ access_token: string; user: User }> => {
    return api.register(data);
  },
  googleLogin: (token: string): Promise<{ access_token: string; user: User }> => {
    return api.googleLogin(token);
  },
  getMe: (): Promise<User> => {
    return api.getMe();
  },
  logout: () => {
    api.setToken(null);
  },
};
