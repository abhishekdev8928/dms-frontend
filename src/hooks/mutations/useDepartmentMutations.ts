import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createDepartment,
  updateDepartment,
  deleteDepartment,
  
} from '@/config/api/departmentApi';

import {type ICreateDepartmentData,
  type IUpdateDepartmentData,
  type ICreateDepartmentResponse,
  type IUpdateDepartmentResponse,
  type IDeleteDepartmentResponse} from "@/config/types/departmentTypes"

interface UseDepartmentMutationsOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useDepartmentMutations = (
  options?: UseDepartmentMutationsOptions
) => {
  const queryClient = useQueryClient();

  // Mutation: Create Department
  const createDepartmentMutation = useMutation<
    ICreateDepartmentResponse,
    Error,
    ICreateDepartmentData
  >({
    mutationFn: (data: ICreateDepartmentData) => createDepartment(data),
    onSuccess: (data) => {
      toast.success('Department Created', {
        description: 'The department has been successfully created.',
      });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['tree'] });
      options?.onSuccess?.(data);
    },
    onError: (error: any) => {
      console.error('Failed to create department:', error);
      toast.error('Creation Failed', {
        description:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to create department.',
      });
      options?.onError?.(error);
    },
  });

  // Mutation: Update Department
  const updateDepartmentMutation = useMutation<
    IUpdateDepartmentResponse,
    Error,
    { id: string; data: IUpdateDepartmentData }
  >({
    mutationFn: ({ id, data }: { id: string; data: IUpdateDepartmentData }) =>
      updateDepartment(id, data),
    onSuccess: (data) => {
      toast.success('Department Updated', {
        description: 'The department has been successfully updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['tree'] });
      options?.onSuccess?.(data);
    },
    onError: (error: any) => {
      console.error('Failed to update department:', error);
      toast.error('Update Failed', {
        description:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update department.',
      });
      options?.onError?.(error);
    },
  });

  // Mutation: Delete Department
  const deleteDepartmentMutation = useMutation<
    IDeleteDepartmentResponse,
    Error,
    string
  >({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: (data) => {
      toast.success('Department Deleted', {
        description: 'The department has been successfully deleted.',
      });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['tree'] });
      options?.onSuccess?.(data);
    },
    onError: (error: any) => {
      console.error('Failed to delete department:', error);
      toast.error('Delete Failed', {
        description:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to delete department.',
      });
      options?.onError?.(error);
    },
  });

  // Utility: Invalidate all department queries
  const invalidateAllDepartmentQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['departments'] });
  };

  // Utility: Invalidate specific department
  const invalidateDepartment = (departmentId: string) => {
    queryClient.invalidateQueries({
      queryKey: ['departments', departmentId],
    });
  };

  // Utility: Invalidate tree queries
  const invalidateTreeQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['tree'] });
  };

  // Utility: Optimistic update for department
  const optimisticUpdateDepartment = (
    departmentId: string,
    updates: Partial<IUpdateDepartmentData>
  ) => {
    queryClient.setQueryData(
      ['departments', departmentId],
      (old: any) => old && { ...old, ...updates }
    );
  };

  return {
    // Mutations
    createDepartmentMutation,
    updateDepartmentMutation,
    deleteDepartmentMutation,

    // Utilities
    invalidateAllDepartmentQueries,
    invalidateDepartment,
    invalidateTreeQueries,
    optimisticUpdateDepartment,
  };
};