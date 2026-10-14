import { useQuery } from '@tanstack/react-query';
import {
  getDseHoldings,
  getDseHoldingBySymbol,
  getDseOrders,
  getDseOrdersBySymbol,
  getInvestorProfile,
  getChildAccounts,
  getChildHoldings,
} from '@/api/portfolio';
import { useAuthStore } from '@/store/auth';
import { readDseError } from '@/utils/dseError';

/**
 * Runs a DSE request and keeps the stored link status honest: when the API says the account
 * is not linked, or the DSE session needs a reconnect, the store is updated so every page
 * shows the right prompt instead of an empty table.
 */
function trackDseStatus<T>(fn: () => Promise<T>) {
  return async () => {
    try {
      const data = await fn();
      const { dseStatus, setDseStatus } = useAuthStore.getState();
      if (dseStatus === 'RECONNECT_REQUIRED') setDseStatus('LINKED');
      return data;
    } catch (err) {
      const { status } = readDseError(err);
      const { setDseStatus } = useAuthStore.getState();
      if (status === 'NOT_LINKED') setDseStatus('NOT_LINKED');
      if (status === 'RECONNECT_REQUIRED') setDseStatus('RECONNECT_REQUIRED');
      throw err;
    }
  };
}

/** Retrying cannot fix "not linked" or "reconnect"; it only delays the message. */
const retryUnlessLinkProblem = (count: number, err: unknown) => {
  const status = (err as { response?: { status?: number } })?.response?.status;
  if (status === 403 || status === 409) return false;
  return count < 2;
};

const useDseEnabled = () => useAuthStore((s) => s.dseLinked);

export function useDseHoldings() {
  return useQuery({
    queryKey: ['dse-holdings'],
    queryFn: trackDseStatus(getDseHoldings),
    enabled: useDseEnabled(),
    retry: retryUnlessLinkProblem,
    staleTime: 60_000,
  });
}

export function useDseHoldingBySymbol(symbol: string) {
  return useQuery({
    queryKey: ['dse-holding', symbol],
    queryFn: trackDseStatus(() => getDseHoldingBySymbol(symbol)),
    enabled: useDseEnabled() && !!symbol,
    retry: retryUnlessLinkProblem,
  });
}

export function useDseOrders() {
  return useQuery({
    queryKey: ['dse-orders'],
    queryFn: trackDseStatus(getDseOrders),
    enabled: useDseEnabled(),
    retry: retryUnlessLinkProblem,
  });
}

export function useDseOrdersBySymbol(symbol: string) {
  return useQuery({
    queryKey: ['dse-orders', symbol],
    queryFn: trackDseStatus(() => getDseOrdersBySymbol(symbol)),
    enabled: useDseEnabled() && !!symbol,
    retry: retryUnlessLinkProblem,
  });
}

export function useInvestorProfile() {
  return useQuery({
    queryKey: ['investor-profile'],
    queryFn: trackDseStatus(getInvestorProfile),
    enabled: useDseEnabled(),
    retry: retryUnlessLinkProblem,
    staleTime: 5 * 60 * 1000,
  });
}

export function useChildAccounts() {
  return useQuery({
    queryKey: ['dse-children'],
    queryFn: trackDseStatus(getChildAccounts),
    enabled: useDseEnabled(),
    retry: retryUnlessLinkProblem,
  });
}

export function useChildHoldings(csdAccount: string) {
  return useQuery({
    queryKey: ['dse-child-holdings', csdAccount],
    queryFn: trackDseStatus(() => getChildHoldings(csdAccount)),
    enabled: useDseEnabled() && !!csdAccount,
    retry: retryUnlessLinkProblem,
  });
}
