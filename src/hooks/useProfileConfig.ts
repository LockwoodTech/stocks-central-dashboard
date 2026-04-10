import { useAuthStore } from '@/store/auth';
import { getProfileConfig } from '@/utils/profileConfig';

export function useProfileConfig() {
  const profileType = useAuthStore((s) => s.user?.investorProfile?.profileType);
  return getProfileConfig(profileType);
}
