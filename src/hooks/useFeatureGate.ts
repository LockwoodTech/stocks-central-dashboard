import { useMemo } from 'react';
import { useAuthStore } from '@/store/auth';
import type { SubscriptionTier } from '@/types';

interface TierLimits {
  stockTxPerMonth: number;
  fundTransactions: boolean;
  analyticsTabs: number;
  goals: number;
  alerts: number;
  costBreakdown: boolean;
  minorAccounts: boolean;
  exportReports: boolean;
  customBrokerage: boolean;
  apiAccess: boolean;
}

const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    stockTxPerMonth: 5,
    fundTransactions: false,
    analyticsTabs: 2,
    goals: 1,
    alerts: 1,
    costBreakdown: false,
    minorAccounts: false,
    exportReports: false,
    customBrokerage: false,
    apiAccess: false,
  },
  basic: {
    stockTxPerMonth: Infinity,
    fundTransactions: true,
    analyticsTabs: 5,
    goals: 3,
    alerts: 5,
    costBreakdown: true,
    minorAccounts: false,
    exportReports: false,
    customBrokerage: false,
    apiAccess: false,
  },
  pro: {
    stockTxPerMonth: Infinity,
    fundTransactions: true,
    analyticsTabs: 8,
    goals: Infinity,
    alerts: 15,
    costBreakdown: true,
    minorAccounts: true,
    exportReports: true,
    customBrokerage: true,
    apiAccess: false,
  },
  premium: {
    stockTxPerMonth: Infinity,
    fundTransactions: true,
    analyticsTabs: 8,
    goals: Infinity,
    alerts: Infinity,
    costBreakdown: true,
    minorAccounts: true,
    exportReports: true,
    customBrokerage: true,
    apiAccess: true,
  },
};

export function useFeatureGate() {
  const tier = useAuthStore((s) => s.user?.subscriptionTier ?? 'free');

  return useMemo(() => {
    const limits = TIER_LIMITS[tier];

    return {
      tier,
      limits,
      maxAnalyticsTabs: limits.analyticsTabs,

      canAccessTab(index: number): boolean {
        return index < limits.analyticsTabs;
      },

      canCreateTransaction(): boolean {
        // For Infinity this always returns true; for free tier the caller
        // should track the current month's count and compare against limits.stockTxPerMonth
        return limits.stockTxPerMonth > 0;
      },

      canCreateAlert(currentCount: number): boolean {
        return currentCount < limits.alerts;
      },

      canCreateGoal(currentCount: number): boolean {
        return currentCount < limits.goals;
      },

      canAccessFundTransactions(): boolean {
        return limits.fundTransactions;
      },

      canAccessCostBreakdown(): boolean {
        return limits.costBreakdown;
      },

      canAccessMinorAccounts(): boolean {
        return limits.minorAccounts;
      },

      canExportReports(): boolean {
        return limits.exportReports;
      },

      canUseCustomBrokerage(): boolean {
        return limits.customBrokerage;
      },

      hasApiAccess(): boolean {
        return limits.apiAccess;
      },
    };
  }, [tier]);
}
