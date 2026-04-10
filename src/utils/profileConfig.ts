import type { ProfileType } from '@/types';

export interface ProfileConfig {
  dashboardView: 'overview' | 'detailed' | 'trader';
  portfolioDefaultTab: 'stocks' | 'analytics' | 'transactions';
  maxAnalyticsTabs: number;
  infoDensity: 'comfortable' | 'normal' | 'compact';
  sidebarOrder: string[];
  showCostBreakdown: boolean;
  showOrderBook: boolean;
}

const configs: Record<ProfileType, ProfileConfig> = {
  casual: {
    dashboardView: 'overview',
    portfolioDefaultTab: 'stocks',
    maxAnalyticsTabs: 3,
    infoDensity: 'comfortable',
    sidebarOrder: ['Dashboard', 'Portfolio', 'Watchlist', 'Alerts', 'Trade'],
    showCostBreakdown: false,
    showOrderBook: false,
  },
  growth: {
    dashboardView: 'detailed',
    portfolioDefaultTab: 'analytics',
    maxAnalyticsTabs: 6,
    infoDensity: 'normal',
    sidebarOrder: ['Dashboard', 'Portfolio', 'Watchlist', 'Trade', 'Alerts'],
    showCostBreakdown: true,
    showOrderBook: false,
  },
  active: {
    dashboardView: 'trader',
    portfolioDefaultTab: 'transactions',
    maxAnalyticsTabs: 8,
    infoDensity: 'compact',
    sidebarOrder: ['Dashboard', 'Trade', 'Portfolio', 'Watchlist', 'Alerts'],
    showCostBreakdown: true,
    showOrderBook: true,
  },
};

export function getProfileConfig(profileType?: ProfileType): ProfileConfig {
  return configs[profileType ?? 'casual'];
}
