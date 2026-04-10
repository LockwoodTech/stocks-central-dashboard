import apiClient from './client';
import type { ApiResponse, SmsCreditBalance, SmsCreditPackage } from '@/types';

export async function getSmsBalance(): Promise<SmsCreditBalance> {
  const res = await apiClient.get<ApiResponse<SmsCreditBalance>>('/sms-credits/balance');
  return res.data.data;
}

export async function getSmsPackages(): Promise<SmsCreditPackage[]> {
  const res = await apiClient.get<ApiResponse<SmsCreditPackage[]>>('/sms-credits/packages');
  return res.data.data ?? [];
}

export async function purchaseSmsCredits(pkg: string): Promise<{ creditsAdded: number; totalCredits: number; amountTzs: number }> {
  const res = await apiClient.post<ApiResponse<{ creditsAdded: number; totalCredits: number; amountTzs: number }>>('/sms-credits/purchase', { package: pkg });
  return res.data.data;
}
