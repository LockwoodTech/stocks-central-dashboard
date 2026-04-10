import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, InvestorProfile, SubscriptionTier } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  dseLinked: boolean;
  setAuth: (user: User, token: string) => void;
  setDseLinked: (linked: boolean) => void;
  setInvestorProfile: (profile: InvestorProfile) => void;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  setOnboardingComplete: (complete: boolean) => void;
  updateUser: (data: Partial<User>) => void;
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

      setInvestorProfile: (profile: InvestorProfile) =>
        set((state) => ({
          user: state.user ? { ...state.user, investorProfile: profile, onboardingComplete: true } : null,
        })),

      setSubscriptionTier: (tier: SubscriptionTier) =>
        set((state) => ({
          user: state.user ? { ...state.user, subscriptionTier: tier } : null,
        })),

      setOnboardingComplete: (complete: boolean) =>
        set((state) => ({
          user: state.user ? { ...state.user, onboardingComplete: complete } : null,
        })),

      updateUser: (data: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
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
