import { useQuery } from '@tanstack/react-query';
import { getResourceAccessDetails } from '@/config/api/shareApi';
import type {
  GetResourceAccessResponse,
  ResourceType,
  Permission,
} from '@/config/types/shareTypes';

interface UseResourceAccessOptions {
  enabled?: boolean;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

/**
 * Hook to fetch resource access details (who has access to a resource)
 */
export const useResourceAccess = (
  resourceType: ResourceType,
  resourceId: string,
  options?: UseResourceAccessOptions
) => {
  return useQuery<GetResourceAccessResponse, Error>({
    queryKey: ['resource-access', resourceType, resourceId],
    queryFn: () => getResourceAccessDetails({ resourceType, resourceId }),
    enabled: options?.enabled !== false && !!resourceType && !!resourceId,
    refetchOnMount: options?.refetchOnMount ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options?.cacheTime ?? 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to check if current user has specific permission on a resource
 */
export const useHasPermission = (
  resourceType: ResourceType,
  resourceId: string,
  permission: Permission,
  currentUserId: string,
  options?: UseResourceAccessOptions
) => {
  const { data, ...queryResult } = useResourceAccess(
    resourceType,
    resourceId,
    options
  );

  const hasPermission = () => {
    if (!data?.data) return false;

    // Check if user is owner
    if (data.data.owner.userId === currentUserId) return true;

    // Check if user has the specific permission
    const userAccess = data.data.usersWithAccess.find(
      (user) => user.userId === currentUserId
    );

    return userAccess?.permissions.includes(permission) ?? false;
  };

  return {
    ...queryResult,
    data,
    hasPermission: hasPermission(),
  };
};

/**
 * Hook to get user's permissions on a resource
 */
export const useUserPermissions = (
  resourceType: ResourceType,
  resourceId: string,
  currentUserId: string,
  options?: UseResourceAccessOptions
) => {
  const { data, ...queryResult } = useResourceAccess(
    resourceType,
    resourceId,
    options
  );

  const getUserPermissions = (): Permission[] => {
    if (!data?.data) return [];

    // If user is owner, they have all permissions
    if (data.data.owner.userId === currentUserId) {
      return ['view', 'download', 'upload', 'delete', 'share'];
    }

    // Get user's specific permissions
    const userAccess = data.data.usersWithAccess.find(
      (user) => user.userId === currentUserId
    );

    return userAccess?.permissions ?? [];
  };

  const permissions = getUserPermissions();
  const isOwner = data?.data?.owner.userId === currentUserId;

  return {
    ...queryResult,
    data,
    permissions,
    isOwner,
    canView: permissions.includes('view'),
    canDownload: permissions.includes('download'),
    canUpload: permissions.includes('upload'),
    canDelete: permissions.includes('delete'),
    canShare: permissions.includes('share'),
  };
};

/**
 * Hook to get all users who have access to a resource
 */
export const useSharedUsers = (
  resourceType: ResourceType,
  resourceId: string,
  options?: UseResourceAccessOptions
) => {
  const { data, ...queryResult } = useResourceAccess(
    resourceType,
    resourceId,
    options
  );

  return {
    ...queryResult,
    data,
    sharedUsers: data?.data?.usersWithAccess ?? [],
    totalSharedUsers: data?.data?.summary.totalUsers ?? 0,
    owner: data?.data?.owner,
  };
};

/**
 * Hook to check if a resource is shared with anyone
 */
export const useIsResourceShared = (
  resourceType: ResourceType,
  resourceId: string,
  options?: UseResourceAccessOptions
) => {
  const { data, ...queryResult } = useResourceAccess(
    resourceType,
    resourceId,
    options
  );

  const isShared = (data?.data?.summary.totalUsers ?? 0) > 0;

  return {
    ...queryResult,
    data,
    isShared,
    sharedCount: data?.data?.summary.totalUsers ?? 0,
  };
};

/**
 * Hook to get specific user's access details on a resource
 */
export const useUserAccessDetails = (
  resourceType: ResourceType,
  resourceId: string,
  targetUserId: string,
  options?: UseResourceAccessOptions
) => {
  const { data, ...queryResult } = useResourceAccess(
    resourceType,
    resourceId,
    options
  );

  const userAccess = data?.data?.usersWithAccess.find(
    (user) => user.userId === targetUserId
  );

  const hasAccess = !!userAccess;

  return {
    ...queryResult,
    data,
    userAccess,
    hasAccess,
    permissions: userAccess?.permissions ?? [],
    grantedAt: userAccess?.grantedAt,
    grantedBy: userAccess?.grantedBy,
  };
};