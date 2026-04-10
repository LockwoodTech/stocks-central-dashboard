import { useQuery } from '@tanstack/react-query';
import { getLivePrices } from '@/api/livePrices';

export function useLivePrices() {
  return useQuery({
    queryKey: ['livePrices'],
    queryFn: getLivePrices,
    refetchInterval: 60_000, // refresh every minute
    staleTime: 30_000,
  });
}
