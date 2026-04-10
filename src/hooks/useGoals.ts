import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGoals, createGoal, updateGoal, deleteGoal } from '@/api/goals';
import type { CreateGoalRequest, FinancialGoal } from '@/types';

export function useGoals() {
  return useQuery({
    queryKey: ['financialGoals'],
    queryFn: getGoals,
    staleTime: 60_000,
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGoalRequest) => createGoal(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['financialGoals'] }),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<FinancialGoal> }) =>
      updateGoal(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['financialGoals'] }),
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['financialGoals'] }),
  });
}
