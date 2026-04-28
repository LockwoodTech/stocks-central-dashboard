import { useQuery } from '@tanstack/react-query';
import { getCompanies, getStockPortfolio, getOrderBook, getMarketData, getMarketMovers, getLivePrices } from '@/api/stocks';

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

export function useMarketData(companyId: string, days = 90) {
  return useQuery({
    queryKey: ['market-data', companyId, days],
    queryFn: () => getMarketData(companyId, days),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMarketMovers() {
  return useQuery({
    queryKey: ['market-movers'],
    queryFn: getMarketMovers,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLivePrices() {
  return useQuery({
    queryKey: ['live-prices'],
    queryFn: getLivePrices,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
