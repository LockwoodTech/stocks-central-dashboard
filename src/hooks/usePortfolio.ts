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

export function useDseHoldings() {
  const dseLinked = useAuthStore((s) => s.dseLinked);
  return useQuery({
    queryKey: ['dse-holdings'],
    queryFn: getDseHoldings,
    enabled: dseLinked,
    staleTime: 60_000,
  });
}

export function useDseHoldingBySymbol(symbol: string) {
  const dseLinked = useAuthStore((s) => s.dseLinked);
  return useQuery({
    queryKey: ['dse-holding', symbol],
    queryFn: () => getDseHoldingBySymbol(symbol),
    enabled: dseLinked && !!symbol,
  });
}

export function useDseOrders() {
  const dseLinked = useAuthStore((s) => s.dseLinked);
  return useQuery({
    queryKey: ['dse-orders'],
    queryFn: getDseOrders,
    enabled: dseLinked,
  });
}

export function useDseOrdersBySymbol(symbol: string) {
  const dseLinked = useAuthStore((s) => s.dseLinked);
  return useQuery({
    queryKey: ['dse-orders', symbol],
    queryFn: () => getDseOrdersBySymbol(symbol),
    enabled: dseLinked && !!symbol,
  });
}

export function useInvestorProfile() {
  const dseLinked = useAuthStore((s) => s.dseLinked);
  return useQuery({
    queryKey: ['investor-profile'],
    queryFn: getInvestorProfile,
    enabled: dseLinked,
    staleTime: 5 * 60 * 1000,
  });
}

export function useChildAccounts() {
  const dseLinked = useAuthStore((s) => s.dseLinked);
  return useQuery({
    queryKey: ['dse-children'],
    queryFn: getChildAccounts,
    enabled: dseLinked,
  });
}

export function useChildHoldings(csdAccount: string) {
  const dseLinked = useAuthStore((s) => s.dseLinked);
  return useQuery({
    queryKey: ['dse-child-holdings', csdAccount],
    queryFn: () => getChildHoldings(csdAccount),
    enabled: dseLinked && !!csdAccount,
  });
}
