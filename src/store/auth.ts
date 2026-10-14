import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, InvestorProfile, SubscriptionTier, DseStatus } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  dseLinked: boolean;
  dseStatus: DseStatus;
  setAuth: (user: User, token: string) => void;
  setDseLinked: (linked: boolean) => void;
  setDseStatus: (status: DseStatus) => void;
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
      dseStatus: 'NOT_LINKED',

      setAuth: (user: User, token: string) =>
        set({
          user,
          token,
          isAuthenticated: true,
          dseLinked: user.dseLinked ?? false,
          dseStatus: user.dseStatus ?? (user.dseLinked ? 'LINKED' : 'NOT_LINKED'),
        }),

      setDseLinked: (linked: boolean) =>
        set((state) => {
          const dseStatus: DseStatus = linked ? 'LINKED' : 'NOT_LINKED';
          return { dseLinked: linked, dseStatus, user: state.user ? { ...state.user, dseLinked: linked, dseStatus } : null };
        }),

      setDseStatus: (dseStatus: DseStatus) =>
        set((state) => {
          // RECONNECT_REQUIRED keeps the link, so the last synced portfolio stays visible.
          const dseLinked = dseStatus === 'LINKED' || dseStatus === 'RECONNECT_REQUIRED';
          return { dseStatus, dseLinked, user: state.user ? { ...state.user, dseStatus, dseLinked } : null };
        }),

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
          dseStatus: 'NOT_LINKED',
        }),
    }),
    {
      name: 'dse-auth',
    },
  ),
);
