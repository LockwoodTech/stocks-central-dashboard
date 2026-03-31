import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  dseLinked: boolean;
  setAuth: (user: User, token: string) => void;
  setDseLinked: (linked: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      dseLinked: false,

      setAuth: (user: User, token: string) =>
        set({
          user,
          token,
          isAuthenticated: true,
          dseLinked: user.dseLinked ?? false,
        }),

      setDseLinked: (linked: boolean) =>
        set((state) => ({
          dseLinked: linked,
          user: state.user ? { ...state.user, dseLinked: linked } : null,
        })),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          dseLinked: false,
        }),
    }),
    {
      name: 'dse-auth',
    },
  ),
);
