import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginResponse } from '../api/auth';
import { authApi } from '../api/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setAuth: (data: LoginResponse) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        const response = await authApi.login({ email, password });
        set({
          user: response.user,
          accessToken: response.access_token,
          isAuthenticated: true,
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      },
      logout: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        }
      },
      setAuth: (data: LoginResponse) => {
        set({
          user: data.user,
          accessToken: data.access_token,
          isAuthenticated: true,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

