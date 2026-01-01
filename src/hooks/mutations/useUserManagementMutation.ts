import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createUser, updateUserDepartments } from '@/config/api/userManagementApi';
import type { CreateUserRequest, UpdateUserDepartmentsRequest } from '@/config/types/userManagementTypes';

/**
 * Hook to create a new user
 * @access SUPER_ADMIN
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserRequest) => createUser(userData),
    onSuccess: (data) => {
      toast.success('User created successfully! Welcome email sent.');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create user';
      toast.error(message);
    },
  });
};

/**
 * Hook to update user departments
 * @access SUPER_ADMIN
 */
export const useUpdateUserDepartments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserDepartmentsRequest }) =>
      updateUserDepartments(userId, data),
    onSuccess: (data) => {
      toast.success('User departments updated successfully!');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', data.data.userId] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update user departments';
      toast.error(message);
    },
  });
};