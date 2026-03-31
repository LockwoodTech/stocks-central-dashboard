import apiClient from './client';
import type { ApiResponse, FavoriteStock } from '@/types';

export async function getFavorites(): Promise<FavoriteStock[]> {
  const response = await apiClient.get<ApiResponse<FavoriteStock[]>>('/favorite-stocks');
  return response.data.data ?? [];
}

export async function addFavorite(company: string): Promise<FavoriteStock> {
  const response = await apiClient.post<ApiResponse<FavoriteStock>>('/favorite-stocks', { company });
  return response.data.data;
}

export async function removeFavorite(id: string): Promise<void> {
  await apiClient.delete(`/favorite-stocks/${id}`);
}
