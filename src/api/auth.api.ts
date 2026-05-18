import api from './axios';
import type { LoginRequest, RegisterRequest, LoginResponse } from '../types';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/api/Auth/login', data);
    return res.data;
  },

  register: async (data: RegisterRequest): Promise<void> => {
    await api.post('/api/Auth/register', data);
  },
};
