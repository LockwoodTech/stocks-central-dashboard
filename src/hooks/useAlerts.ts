import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAlerts, createAlert, updateAlert, deleteAlert, toggleAlert, checkAlerts } from '@/api/alerts';
import { getFavorites, addFavorite, removeFavorite } from '@/api/favorites';
import type { CreateAlertRequest } from '@/types';

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: getAlerts,
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAlertRequest) => createAlert(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });
}

export function useUpdateAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAlertRequest> }) =>
      updateAlert(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAlert(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });
}

export function useToggleAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleAlert(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });
}

export function useCheckAlerts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkAlerts,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });
}

// ── Favorites ──
export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (company: string) => addFavorite(company),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeFavorite(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });
}
