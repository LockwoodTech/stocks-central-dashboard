import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFunds,
  getFundPortfolio,
  createFundPortfolio,
  updateFundPortfolio,
  deleteFundPortfolio,
  getFundNAVHistory,
} from '@/api/funds';
import type { FundPortfolioEntry } from '@/types';

export function useFunds() {
  return useQuery({
    queryKey: ['funds'],
    queryFn: getFunds,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFundPortfolio() {
  return useQuery({
    queryKey: ['fundPortfolio'],
    queryFn: getFundPortfolio,
    staleTime: 60_000,
  });
}

export function useFundNAV(fundName: string) {
  return useQuery({
    queryKey: ['fundNAV', fundName],
    queryFn: () => getFundNAVHistory(fundName),
    enabled: !!fundName,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateFundPortfolio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<FundPortfolioEntry>) => createFundPortfolio(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fundPortfolio'] }),
  });
}

export function useUpdateFundPortfolio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<FundPortfolioEntry> }) =>
      updateFundPortfolio(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fundPortfolio'] }),
  });
}

export function useDeleteFundPortfolio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFundPortfolio(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fundPortfolio'] }),
  });
}
