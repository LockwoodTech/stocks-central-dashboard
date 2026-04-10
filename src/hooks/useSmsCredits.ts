import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSmsBalance, getSmsPackages, purchaseSmsCredits } from '@/api/smsCredits';

export function useSmsBalance() {
  return useQuery({ queryKey: ['sms-credits-balance'], queryFn: getSmsBalance });
}

export function useSmsPackages() {
  return useQuery({ queryKey: ['sms-credit-packages'], queryFn: getSmsPackages });
}

export function usePurchaseSmsCredits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pkg: string) => purchaseSmsCredits(pkg),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sms-credits-balance'] }),
  });
}
