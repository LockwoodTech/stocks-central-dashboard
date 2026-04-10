import apiClient from './client';
import type { ApiResponse, FinancialGoal, CreateGoalRequest } from '@/types';

export async function getGoals(): Promise<FinancialGoal[]> {
  const { data } = await apiClient.get<ApiResponse<FinancialGoal[]>>('/financial-goals');
  return data.data ?? [];
}

export async function createGoal(payload: CreateGoalRequest): Promise<FinancialGoal> {
  const { data } = await apiClient.post<ApiResponse<FinancialGoal>>('/financial-goals', payload);
  return data.data;
}

export async function updateGoal(id: string, payload: Partial<FinancialGoal>): Promise<FinancialGoal> {
  const { data } = await apiClient.put<ApiResponse<FinancialGoal>>(`/financial-goals/${id}`, payload);
  return data.data;
}

export async function deleteGoal(id: string): Promise<void> {
  await apiClient.delete(`/financial-goals/${id}`);
}
