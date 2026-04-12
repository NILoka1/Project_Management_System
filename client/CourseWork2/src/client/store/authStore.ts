import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, SafeUser } from '../types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user: SafeUser, token: string): void => {
        set({ user, token, isAuthenticated: true });
      },
      logout: (): void => {
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    },
  ),
);
