import apiClient from './client';
import type { ApiResponse, LoginRequest, LoginResponse, LinkDseRequest, LinkDseResponse, RegisterRequest, InvestorProfile, User } from '@/types';

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/dse-login', data);
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

export async function register(data: RegisterRequest): Promise<LoginResponse> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/register', data);
  return response.data.data;
}

export async function updateInvestorProfile(data: InvestorProfile): Promise<User> {
  const response = await apiClient.put<ApiResponse<User>>('/auth/profile', { investorProfile: data });
  return response.data.data;
}

export async function updatePersonalInfo(data: { full_name?: string; email?: string; phoneNumber?: string; language?: 'en' | 'sw' }): Promise<User> {
  const response = await apiClient.put<ApiResponse<User>>('/auth/personal-info', data);
  return response.data.data;
}

export async function changePassword(data: { oldPassword: string; newPassword: string }): Promise<User> {
  const response = await apiClient.post<ApiResponse<User>>('/auth/change-password', data);
  return response.data.data;
}
