import apiClient from './client';
import type {
  ApiResponse,
  Transaction,
  CreateTransactionRequest,
  WacSummary,
  TradeVerification,
} from '@/types';

export async function getTransactions(params?: {
  company?: string;
  type?: string;
  source?: string;
}): Promise<Transaction[]> {
  const response = await apiClient.get<ApiResponse<Transaction[]>>('/transactions', { params });
  return response.data.data ?? [];
}

export async function getTransactionsByCompany(symbol: string): Promise<Transaction[]> {
  const response = await apiClient.get<ApiResponse<Transaction[]>>(`/transactions/company/${symbol}`);
  return response.data.data ?? [];
}

export async function createTransaction(data: CreateTransactionRequest): Promise<Transaction> {
  const response = await apiClient.post<ApiResponse<Transaction>>('/transactions', data);
  return response.data.data;
}

export async function updateTransaction(id: string, data: Partial<CreateTransactionRequest>): Promise<Transaction> {
  const response = await apiClient.put<ApiResponse<Transaction>>(`/transactions/${id}`, data);
  return response.data.data;
}

export async function deleteTransaction(id: string): Promise<void> {
  await apiClient.delete(`/transactions/${id}`);
}

export async function getWac(symbol: string): Promise<WacSummary> {
  const response = await apiClient.get<ApiResponse<WacSummary>>(`/transactions/wac/${symbol}`);
  return response.data.data;
}

export async function getRealisedGains(): Promise<{
  totalRealisedGain: number;
  byCompany: Record<string, { realisedGain: number; transactions: number }>;
}> {
  const response = await apiClient.get<ApiResponse<any>>('/transactions/realised-gains');
  return response.data.data;
}

export async function verifyTrades(symbol: string): Promise<TradeVerification> {
  const response = await apiClient.get<ApiResponse<TradeVerification>>(`/transactions/verify/${symbol}`);
  return response.data.data;
}
