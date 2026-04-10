import apiClient from './client';
import type {
  ApiResponse,
  DseHolding,
  DseOrder,
  DseInvestorProfile,
  ChildAccount,
} from '@/types';

export async function getDseHoldings(): Promise<DseHolding[]> {
  const response = await apiClient.get<ApiResponse<DseHolding[]>>('/portfolio/dse-holdings');
  return response.data.data ?? [];
}

export async function getDseHoldingBySymbol(symbol: string): Promise<DseHolding | null> {
  const response = await apiClient.get<ApiResponse<DseHolding | null>>(`/portfolio/dse-holdings/${symbol}`);
  return response.data.data;
}

export async function getDseOrders(): Promise<DseOrder[]> {
  const response = await apiClient.get<ApiResponse<DseOrder[]>>('/portfolio/dse-orders');
  return response.data.data ?? [];
}

export async function getDseOrdersBySymbol(symbol: string): Promise<DseOrder[]> {
  const response = await apiClient.get<ApiResponse<DseOrder[]>>(`/portfolio/dse-orders/${symbol}`);
  return response.data.data ?? [];
}

export async function getInvestorProfile(): Promise<DseInvestorProfile> {
  const response = await apiClient.get<ApiResponse<DseInvestorProfile>>('/portfolio/investor-profile');
  return response.data.data;
}

export async function getChildAccounts(): Promise<ChildAccount[]> {
  const response = await apiClient.get<ApiResponse<ChildAccount[]>>('/portfolio/dse-children');
  return response.data.data ?? [];
}

export async function getChildHoldings(csdAccount: string): Promise<DseHolding[]> {
  const response = await apiClient.get<ApiResponse<DseHolding[]>>(
    `/portfolio/dse-children/${csdAccount}/holdings`,
  );
  return response.data.data ?? [];
}
