import apiClient from './client';
import type { ApiResponse, FundProfile, FundNAV, FundPortfolioEntry } from '@/types';

export async function getFunds(): Promise<FundProfile[]> {
  const { data } = await apiClient.get<ApiResponse<FundProfile[]>>('/funds');
  return data.data ?? [];
}

export async function getFundPortfolio(): Promise<FundPortfolioEntry[]> {
  const { data } = await apiClient.get<ApiResponse<FundPortfolioEntry[]>>('/fund-portfolio');
  return data.data ?? [];
}

export async function createFundPortfolio(payload: Partial<FundPortfolioEntry>): Promise<FundPortfolioEntry> {
  const { data } = await apiClient.post<ApiResponse<FundPortfolioEntry>>('/fund-portfolio', payload);
  return data.data;
}

export async function updateFundPortfolio(id: string, payload: Partial<FundPortfolioEntry>): Promise<FundPortfolioEntry> {
  const { data } = await apiClient.put<ApiResponse<FundPortfolioEntry>>(`/fund-portfolio/${id}`, payload);
  return data.data;
}

export async function deleteFundPortfolio(id: string): Promise<void> {
  await apiClient.delete(`/fund-portfolio/${id}`);
}

export async function getFundNAVHistory(fundName: string): Promise<FundNAV[]> {
  const { data } = await apiClient.get<ApiResponse<FundNAV[]>>('/fund-nav', {
    params: { fundName },
  });
  return data.data ?? [];
}

export async function getLatestFundNAV(fundName: string): Promise<FundNAV | null> {
  const navs = await getFundNAVHistory(fundName);
  if (!navs.length) return null;
  return navs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
}
