import apiClient from './client';
import type { ApiResponse, LoginRequest, LoginResponse, LinkDseRequest, LinkDseResponse } from '@/types';

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
  return response.data.data;
}

export async function linkDse(data: LinkDseRequest): Promise<LinkDseResponse> {
  const response = await apiClient.post<ApiResponse<LinkDseResponse>>('/auth/link-dse', data);
  return response.data.data;
}

export async function unlinkDse(): Promise<{ dseLinked: boolean }> {
  const response = await apiClient.post<ApiResponse<{ dseLinked: boolean }>>('/auth/unlink-dse');
  return response.data.data;
}
