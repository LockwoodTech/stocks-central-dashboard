import apiClient from './client';
import type { ApiResponse, LivePrice, MarketMover } from '@/types';

export async function getLivePrices(): Promise<LivePrice[]> {
  const { data } = await apiClient.get<ApiResponse<LivePrice[]>>('/live-prices');
  return data.data ?? [];
}

export async function syncLivePrices(): Promise<void> {
  await apiClient.post('/live-prices/sync');
}

export interface PublicMoversResponse {
  gainers: MarketMover[];
  losers: MarketMover[];
  mostActive: MarketMover[];
}

export async function getPublicMovers(): Promise<PublicMoversResponse> {
  const { data } = await apiClient.get<ApiResponse<PublicMoversResponse>>('/market-data/public-movers');
  return data.data;
}
