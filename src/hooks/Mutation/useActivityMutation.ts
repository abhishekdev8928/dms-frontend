import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getUserActivitiesGrouped,
  getFileActivity,
  getFolderActivity,
  getBulkGroupActivities,
  getRecentActivities,
  getActivityStats,
  searchActivities,
  type GroupedActivitiesResponse,
  type FileActivityResponse,
  type FolderActivityResponse,
  type BulkGroupActivitiesResponse,
  type RecentActivitiesResponse,
  type ActivityStatsResponse,
  type SearchActivitiesResponse,
} from '@/config/api/activityApi';

/* =======================================================
   MAIN ACTIVITY HOOK WITH ALL MUTATIONS
   ======================================================= */

interface UseActivityOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useActivity = (options?: UseActivityOptions) => {
  const queryClient = useQueryClient();

  // Mutation: Fetch User's Grouped Activities
  const fetchUserActivitiesGroupedMutation = useMutation({
    mutationFn: (params: { userId: string; limit?: number }) =>
      getUserActivitiesGrouped(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activity', 'user'] });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      console.error('Failed to fetch user activities:', error);
      toast.error('Failed to load activities');
      options?.onError?.(error);
    },
  });

  // Mutation: Fetch File Activity
  const fetchFileActivityMutation = useMutation({
    mutationFn: (params: { fileId: string; limit?: number }) =>
      getFileActivity(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activity', 'file'] });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      console.error('Failed to fetch file activity:', error);
      toast.error('Failed to load file activity');
      options?.onError?.(error);
    },
  });

  // Mutation: Fetch Folder Activity
  const fetchFolderActivityMutation = useMutation({
    mutationFn: (params: {
      folderId: string;
      limit?: number;
      actionType?: string;
    }) => getFolderActivity(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activity', 'folder'] });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      console.error('Failed to fetch folder activity:', error);
      toast.error('Failed to load folder activity');
      options?.onError?.(error);
    },
  });

  // Mutation: Fetch Bulk Group Activities
  const fetchBulkGroupActivitiesMutation = useMutation({
    mutationFn: (params: { bulkGroupId: string }) =>
      getBulkGroupActivities(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activity', 'bulk'] });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      console.error('Failed to fetch bulk group activities:', error);
      toast.error('Failed to load bulk activities');
      options?.onError?.(error);
    },
  });

  // Mutation: Fetch Recent Activities
  const fetchRecentActivitiesMutation = useMutation({
    mutationFn: (params?: {
      limit?: number;
      page?: number;
      userId?: string;
      actionType?: string;
      targetType?: 'file' | 'folder';
    }) => getRecentActivities(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activity', 'recent'] });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      console.error('Failed to fetch recent activities:', error);
      toast.error('Failed to load recent activities');
      options?.onError?.(error);
    },
  });

  // Mutation: Fetch Activity Stats
  const fetchActivityStatsMutation = useMutation({
    mutationFn: (params?: {
      startDate?: string;
      endDate?: string;
      userId?: string;
      targetType?: 'file' | 'folder';
    }) => getActivityStats(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activity', 'stats'] });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      console.error('Failed to fetch activity stats:', error);
      toast.error('Failed to load activity statistics');
      options?.onError?.(error);
    },
  });

  // Mutation: Search Activities
  const searchActivitiesMutation = useMutation({
    mutationFn: (params?: {
      query?: string;
      action?: string;
      targetType?: 'file' | 'folder';
      userId?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
      page?: number;
    }) => searchActivities(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activity', 'search'] });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      console.error('Failed to search activities:', error);
      toast.error('Failed to search activities');
      options?.onError?.(error);
    },
  });

  // Utility: Invalidate all activity queries
  const invalidateAllActivityQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['activity'] });
  };

  // Utility: Invalidate specific file activity
  const invalidateFileActivity = (fileId: string) => {
    queryClient.invalidateQueries({
      queryKey: ['activity', 'file', fileId],
    });
  };

  // Utility: Invalidate specific folder activity
  const invalidateFolderActivity = (folderId: string) => {
    queryClient.invalidateQueries({
      queryKey: ['activity', 'folder', folderId],
    });
  };

  // Utility: Invalidate specific user activity
  const invalidateUserActivity = (userId: string) => {
    queryClient.invalidateQueries({
      queryKey: ['activity', 'user', userId],
    });
  };

  return {
    // Mutations
    fetchUserActivitiesGroupedMutation,
    fetchFileActivityMutation,
    fetchFolderActivityMutation,
    fetchBulkGroupActivitiesMutation,
    fetchRecentActivitiesMutation,
    fetchActivityStatsMutation,
    searchActivitiesMutation,

    // Utilities
    invalidateAllActivityQueries,
    invalidateFileActivity,
    invalidateFolderActivity,
    invalidateUserActivity,
  };
};

/* =======================================================
   INDIVIDUAL QUERY HOOKS (for useQuery usage)
   ======================================================= */

/**
 * Hook to fetch user's grouped activities with useQuery
 */
export const useUserActivitiesGrouped = (
  userId: string | null,
  options?: {
    limit?: number;
    enabled?: boolean;
  }
) => {
  return useQuery<GroupedActivitiesResponse>({
    queryKey: ['activity', 'user', userId, options?.limit],
    queryFn: () =>
      getUserActivitiesGrouped({
        userId: userId!,
        limit: options?.limit,
      }),
    enabled: !!userId && (options?.enabled !== false),
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to fetch file activity with useQuery
 */
export const useFileActivity = (
  fileId: string | null,
  options?: {
    limit?: number;
    enabled?: boolean;
  }
) => {
  return useQuery<FileActivityResponse>({
    queryKey: ['activity', 'file', fileId, options?.limit],
    queryFn: () =>
      getFileActivity({
        fileId: fileId!,
        limit: options?.limit,
      }),
    enabled: !!fileId && (options?.enabled !== false),
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to fetch folder activity with useQuery
 */
export const useFolderActivity = (
  folderId: string | null,
  options?: {
    limit?: number;
    actionType?: string;
    enabled?: boolean;
  }
) => {
  return useQuery<FolderActivityResponse>({
    queryKey: [
      'activity',
      'folder',
      folderId,
      options?.limit,
      options?.actionType,
    ],
    queryFn: () =>
      getFolderActivity({
        folderId: folderId!,
        limit: options?.limit,
        actionType: options?.actionType,
      }),
    enabled: !!folderId && (options?.enabled !== false),
    staleTime: 30000,
  });
};

/**
 * Hook to fetch bulk group activities with useQuery
 */
export const useBulkGroupActivities = (
  bulkGroupId: string | null,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery<BulkGroupActivitiesResponse>({
    queryKey: ['activity', 'bulk', bulkGroupId],
    queryFn: () =>
      getBulkGroupActivities({
        bulkGroupId: bulkGroupId!,
      }),
    enabled: !!bulkGroupId && (options?.enabled !== false),
    staleTime: 30000,
  });
};

/**
 * Hook to fetch recent activities with useQuery
 */
export const useRecentActivities = (options?: {
  limit?: number;
  page?: number;
  userId?: string;
  actionType?: string;
  targetType?: 'file' | 'folder';
  enabled?: boolean;
}) => {
  return useQuery<RecentActivitiesResponse>({
    queryKey: [
      'activity',
      'recent',
      options?.limit,
      options?.page,
      options?.userId,
      options?.actionType,
      options?.targetType,
    ],
    queryFn: () => getRecentActivities(options),
    enabled: options?.enabled !== false,
    staleTime: 30000,
  });
};

/**
 * Hook to fetch activity stats with useQuery
 */
export const useActivityStats = (options?: {
  startDate?: string;
  endDate?: string;
  userId?: string;
  targetType?: 'file' | 'folder';
  enabled?: boolean;
}) => {
  return useQuery<ActivityStatsResponse>({
    queryKey: [
      'activity',
      'stats',
      options?.startDate,
      options?.endDate,
      options?.userId,
      options?.targetType,
    ],
    queryFn: () => getActivityStats(options),
    enabled: options?.enabled !== false,
    staleTime: 60000, // 1 minute
  });
};

/**
 * Hook to search activities with useQuery
 */
export const useSearchActivities = (options?: {
  query?: string;
  action?: string;
  targetType?: 'file' | 'folder';
  userId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
  enabled?: boolean;
}) => {
  return useQuery<SearchActivitiesResponse>({
    queryKey: [
      'activity',
      'search',
      options?.query,
      options?.action,
      options?.targetType,
      options?.userId,
      options?.startDate,
      options?.endDate,
      options?.limit,
      options?.page,
    ],
    queryFn: () => searchActivities(options),
    enabled: options?.enabled !== false,
    staleTime: 30000,
  });
};