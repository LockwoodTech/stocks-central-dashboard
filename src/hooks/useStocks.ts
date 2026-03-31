import { useQuery } from '@tanstack/react-query';
import { getCompanies, getStockPortfolio, getOrderBook, getMarketData } from '@/api/stocks';

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: getCompanies,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStockPortfolio() {
  return useQuery({
    queryKey: ['stock-portfolio'],
    queryFn: getStockPortfolio,
  });
}

export function useOrderBook(companyId: string) {
  return useQuery({
    queryKey: ['order-book', companyId],
    queryFn: () => getOrderBook(companyId),
    enabled: !!companyId,
    refetchInterval: 30_000,
  });
}

export function useMarketData(companyId: string) {
  return useQuery({
    queryKey: ['market-data', companyId],
    queryFn: () => getMarketData(companyId),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });
}
