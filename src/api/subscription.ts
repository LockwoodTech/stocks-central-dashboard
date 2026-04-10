import apiClient from './client';
import type { ApiResponse, Subscription, PricingTier, SubscriptionTier, BillingCycle } from '@/types';

export async function getCurrentSubscription(): Promise<Subscription> {
  const response = await apiClient.get<ApiResponse<Subscription>>('/subscription');
  return response.data.data;
}

export async function createSubscription(tier: SubscriptionTier, billingCycle: BillingCycle): Promise<Subscription> {
  const response = await apiClient.post<ApiResponse<Subscription>>('/subscription', { tier, billingCycle });
  return response.data.data;
}

export async function cancelSubscription(): Promise<Subscription> {
  const response = await apiClient.post<ApiResponse<Subscription>>('/subscription/cancel');
  return response.data.data;
}

export async function getPricingTiers(): Promise<PricingTier[]> {
  const response = await apiClient.get<ApiResponse<PricingTier[]>>('/subscription/tiers');
  return response.data.data;
}
