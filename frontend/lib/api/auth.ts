import { apiClient } from './client';

export interface LoginDto {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  globalRole: 'super_user' | 'user';
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export const authApi = {
  login: async (credentials: LoginDto): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      '/auth/login',
      credentials,
    );
    return response.data;
  },
};

