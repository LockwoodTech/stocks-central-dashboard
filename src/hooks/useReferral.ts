import { useQuery } from '@tanstack/react-query';
import { getMyCode, getReferralStats } from '@/api/referral';

export function useReferralCode() {
  return useQuery({
    queryKey: ['referral-code'],
    queryFn: getMyCode,
  });
}

export function useReferralStats() {
  return useQuery({
    queryKey: ['referral-stats'],
    queryFn: getReferralStats,
  });
}
