import apiClient from './client';
import type { ApiResponse, StockAlert, CreateAlertRequest } from '@/types';

export async function getAlerts(): Promise<StockAlert[]> {
  const response = await apiClient.get<ApiResponse<StockAlert[]>>('/stock-alerts');
  return response.data.data ?? [];
}

export async function createAlert(data: CreateAlertRequest): Promise<StockAlert> {
  const response = await apiClient.post<ApiResponse<StockAlert>>('/stock-alerts', data);
  return response.data.data;
}

export async function updateAlert(id: string, data: Partial<CreateAlertRequest>): Promise<StockAlert> {
  const response = await apiClient.put<ApiResponse<StockAlert>>(`/stock-alerts/${id}`, data);
  return response.data.data;
}

export async function deleteAlert(id: string): Promise<void> {
  await apiClient.delete(`/stock-alerts/${id}`);
}

export async function toggleAlert(id: string): Promise<StockAlert> {
  const response = await apiClient.patch<ApiResponse<StockAlert>>(`/stock-alerts/${id}/toggle`);
  return response.data.data;
}

export async function checkAlerts(): Promise<void> {
  await apiClient.post('/stock-alerts/check');
}
