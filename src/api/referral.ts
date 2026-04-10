import client from './client';
import type { ApiResponse, ReferralCode, ReferralStats } from '@/types';

export async function getMyCode(): Promise<ReferralCode> {
  const res = await client.get<ApiResponse<ReferralCode>>('/referral/my-code');
  return res.data.data;
}

export async function getReferralStats(): Promise<ReferralStats> {
  const res = await client.get<ApiResponse<ReferralStats>>('/referral/stats');
  return res.data.data;
}

export async function applyReferralCode(code: string): Promise<void> {
  await client.post('/referral/apply', { code });
}
