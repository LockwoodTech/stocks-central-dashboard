import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentSubscription, getPricingTiers, createSubscription, cancelSubscription } from '@/api/subscription';
import type { SubscriptionTier, BillingCycle } from '@/types';

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: getCurrentSubscription,
  });
}

export function usePricingTiers() {
  return useQuery({
    queryKey: ['pricing-tiers'],
    queryFn: getPricingTiers,
    staleTime: 10 * 60 * 1000,
  });
}

export function useUpgradeSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tier, billingCycle }: { tier: SubscriptionTier; billingCycle: BillingCycle }) =>
      createSubscription(tier, billingCycle),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscription'] }),
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscription'] }),
  });
}
