import apiClient from './client';

export interface ActivityData {
  period: string;
  loginCount?: number;
  tabVisits?: Record<string, number>;
  featuresUsed?: Record<string, number>;
  transactionCount?: number;
}

export async function upsertActivity(data: ActivityData): Promise<void> {
  await apiClient.post('/user-activity', data);
}
