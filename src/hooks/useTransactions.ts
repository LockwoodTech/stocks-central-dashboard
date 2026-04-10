import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTransactions,
  getTransactionsByCompany,
  createTransaction,
  deleteTransaction,
  getWac,
  getRealisedGains,
  verifyTrades,
} from '@/api/transactions';
import type { CreateTransactionRequest } from '@/types';

export function useTransactions(params?: { company?: string; type?: string; source?: string }) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => getTransactions(params),
  });
}

export function useTransactionsByCompany(symbol: string) {
  return useQuery({
    queryKey: ['transactions', 'company', symbol],
    queryFn: () => getTransactionsByCompany(symbol),
    enabled: !!symbol,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTransactionRequest) => createTransaction(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });
}

export function useWac(symbol: string) {
  return useQuery({
    queryKey: ['wac', symbol],
    queryFn: () => getWac(symbol),
    enabled: !!symbol,
  });
}

export function useRealisedGains() {
  return useQuery({
    queryKey: ['realised-gains'],
    queryFn: getRealisedGains,
  });
}

export function useVerifyTrades(symbol: string) {
  return useQuery({
    queryKey: ['verify-trades', symbol],
    queryFn: () => verifyTrades(symbol),
    enabled: !!symbol,
  });
}
