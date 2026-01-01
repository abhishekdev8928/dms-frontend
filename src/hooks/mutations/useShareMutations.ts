import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  shareResource,
  updateUserPermissions,
  removeUserAccess,
} from '@/config/api/shareApi';
import type {
  ShareResourceResponse,
  UpdateUserPermissionsResponse,
  RemoveUserAccessResponse,
  Permission,
  ResourceType,
} from '@/config/types/shareTypes';

interface UseShareMutationsOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useShareMutations = (options?: UseShareMutationsOptions) => {
  const queryClient = useQueryClient();

  // Mutation: Share Resource with Users
  const shareResourceMutation = useMutation<
    ShareResourceResponse,
    Error,
    {
      resourceType: ResourceType;
      resourceId: string;
      users: {
        userId: string;
        permissions: Permission[];
      }[];
    }
  >({
    mutationFn: (data) => shareResource(data),
    onSuccess: (data, variables) => {
      const sharedCount = data.data.sharedWith?.length || 0;
      const failedCount = data.data.errors?.length || 0;

      if (failedCount === 0) {
        toast.success('Resource Shared', {
          description: `Successfully shared with ${sharedCount} user${sharedCount > 1 ? 's' : ''}.`,
        });
      } else {
        toast.warning('Partially Shared', {
          description: `Shared with ${sharedCount} user${sharedCount > 1 ? 's' : ''}, ${failedCount} failed.`,
        });
      }

      // Invalidate resource access queries
      queryClient.invalidateQueries({
        queryKey: ['resource-access', variables.resourceType, variables.resourceId],
      });
      queryClient.invalidateQueries({
        queryKey: ['shared-resources'],
      });

      options?.onSuccess?.(data);
    },
    onError: (error: any) => {
      console.error('Failed to share resource:', error);
      toast.error('Share Failed', {
        description:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to share resource.',
      });
      options?.onError?.(error);
    },
  });

  // Mutation: Update User Permissions
  const updatePermissionsMutation = useMutation<
    UpdateUserPermissionsResponse,
    Error,
    {
      resourceType: ResourceType;
      resourceId: string;
      userId: string;
      permissions: Permission[];
    }
  >({
    mutationFn: (data) => updateUserPermissions(data),
    onSuccess: (data, variables) => {
      toast.success('Permissions Updated', {
        description: 'User permissions have been successfully updated.',
      });
      
      // Invalidate resource access queries
      queryClient.invalidateQueries({
        queryKey: ['resource-access', variables.resourceType, variables.resourceId],
      });

      options?.onSuccess?.(data);
    },
    onError: (error: any) => {
      console.error('Failed to update permissions:', error);
      toast.error('Update Failed', {
        description:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update permissions.',
      });
      options?.onError?.(error);
    },
  });

  // Mutation: Remove User Access
  const removeAccessMutation = useMutation<
    RemoveUserAccessResponse,
    Error,
    {
      resourceType: ResourceType;
      resourceId: string;
      userId: string;
    }
  >({
    mutationFn: (data) => removeUserAccess(data),
    onSuccess: (data, variables) => {
      toast.success('Access Removed', {
        description: 'User access has been successfully removed.',
      });

      // Invalidate resource access queries
      queryClient.invalidateQueries({
        queryKey: ['resource-access', variables.resourceType, variables.resourceId],
      });
      queryClient.invalidateQueries({
        queryKey: ['shared-resources'],
      });

      options?.onSuccess?.(data);
    },
    onError: (error: any) => {
      console.error('Failed to remove access:', error);
      toast.error('Remove Failed', {
        description:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to remove user access.',
      });
      options?.onError?.(error);
    },
  });

  // Utility: Invalidate resource access query
  const invalidateResourceAccess = (
    resourceType: ResourceType,
    resourceId: string
  ) => {
    queryClient.invalidateQueries({
      queryKey: ['resource-access', resourceType, resourceId],
    });
  };

  // Utility: Invalidate all shared resources queries
  const invalidateSharedResources = () => {
    queryClient.invalidateQueries({
      queryKey: ['shared-resources'],
    });
  };

  // Utility: Optimistic update for permissions
  const optimisticUpdatePermissions = (
    resourceType: ResourceType,
    resourceId: string,
    userId: string,
    newPermissions: Permission[]
  ) => {
    queryClient.setQueryData(
      ['resource-access', resourceType, resourceId],
      (old: any) => {
        if (!old?.data) return old;
        
        return {
          ...old,
          data: {
            ...old.data,
            usersWithAccess: old.data.usersWithAccess.map((user: any) =>
              user.userId === userId
                ? { ...user, permissions: newPermissions }
                : user
            ),
          },
        };
      }
    );
  };

  // Utility: Optimistic remove user access
  const optimisticRemoveAccess = (
    resourceType: ResourceType,
    resourceId: string,
    userId: string
  ) => {
    queryClient.setQueryData(
      ['resource-access', resourceType, resourceId],
      (old: any) => {
        if (!old?.data) return old;
        
        const filteredUsers = old.data.usersWithAccess.filter(
          (user: any) => user.userId !== userId
        );
        
        return {
          ...old,
          data: {
            ...old.data,
            usersWithAccess: filteredUsers,
            summary: {
              ...old.data.summary,
              totalUsers: filteredUsers.length,
              totalAccessEntries: filteredUsers.length,
            },
          },
        };
      }
    );
  };

  return {
    // Mutations
    shareResourceMutation,
    updatePermissionsMutation,
    removeAccessMutation,

    // Utilities
    invalidateResourceAccess,
    invalidateSharedResources,
    optimisticUpdatePermissions,
    optimisticRemoveAccess,
  };
};