import { useQuery } from "@tanstack/react-query";
import {
  getFolderById,
  getChildFolders,
  getFolderBreadcrumbs,
  getFolderStats,
  searchFolders,
  type IFolderResponse,
  type IFolderChildrenResponse,
  type IFolderBreadcrumbsResponse,
  type IFolderStatsResponse,
  type IFolderSearchResponse,
} from "@/config/api/folderApi";

/* =======================================================
   MAIN FOLDER QUERIES HOOK
   ======================================================= */

interface UseFolderQueriesProps {
  parentId?: string;
  selectedTypeFilter?: string;
  selectedUser?: string;
}

/**
 * Custom hook for fetching folder children with filters
 * Fetches child items (folders and documents) with optional type and user filters
 */
export const useFolderQueries = ({
  parentId,
  selectedTypeFilter,
  selectedUser,
}: UseFolderQueriesProps) => {
  const {
    data: childrenData,
    isLoading: isChildrenLoading,
    error: childrenError,
    refetch: refetchChildren,
  } = useQuery<IFolderChildrenResponse>({
    queryKey: ["folder-children", parentId, selectedTypeFilter, selectedUser],
    queryFn: async () => {
      const res = await getChildFolders(parentId || "", {
        type: selectedTypeFilter || undefined,
        userEmail: selectedUser || undefined,
      });
      return structuredClone(res);
    },
    enabled: !!parentId,
    staleTime: 30000, // 30 seconds
  });

  // Extract data from response - handle both 'children' and 'data' properties
  const items = childrenData?.children || childrenData?.data || [];
  const breadcrumbs = childrenData?.breadcrumbs || [];

  return {
    items,
    breadcrumbs,  // ✅ Make sure this is returned
    childrenData,
    isChildrenLoading,
    childrenError,
    refetchChildren,
  };
};

/* =======================================================
   INDIVIDUAL QUERY HOOKS
   ======================================================= */

/**
 * Hook to fetch folder by ID with details
 */
export const useFolderById = (
  folderId: string | null,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery<IFolderResponse>({
    queryKey: ["folder", folderId],
    queryFn: () => getFolderById(folderId!),
    enabled: !!folderId && (options?.enabled !== false),
    staleTime: 30000,
  });
};

/**
 * Hook to fetch child folders and documents
 */
export const useChildFolders = (
  parentId: string | null,
  params?: {
    includeDeleted?: boolean;
    type?: string;
    userEmail?: string;
  },
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery<IFolderChildrenResponse>({
    queryKey: ["folder-children", parentId, params?.type, params?.userEmail, params?.includeDeleted],
    queryFn: () => getChildFolders(parentId!, params),
    enabled: !!parentId && (options?.enabled !== false),
    staleTime: 30000,
  });
};

/**
 * Hook to fetch folder breadcrumbs (path hierarchy)
 */
export const useFolderBreadcrumbs = (
  folderId: string | null,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery<IFolderBreadcrumbsResponse>({
    queryKey: ["folder-breadcrumbs", folderId],
    queryFn: () => getFolderBreadcrumbs(folderId!),
    enabled: !!folderId && (options?.enabled !== false),
    staleTime: 30000,
  });
};

/**
 * Hook to fetch folder statistics
 */
export const useFolderStats = (
  folderId: string | null,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery<IFolderStatsResponse>({
    queryKey: ["folder-stats", folderId],
    queryFn: () => getFolderStats(folderId!),
    enabled: !!folderId && (options?.enabled !== false),
    staleTime: 60000, // 1 minute
  });
};

/**
 * Hook to search folders by name
 */
export const useSearchFolders = (
  query: string,
  departmentId?: string,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery<IFolderSearchResponse>({
    queryKey: ["folder-search", query, departmentId],
    queryFn: () => searchFolders({ q: query, departmentId }),
    enabled: !!query && query.length > 0 && (options?.enabled !== false),
    staleTime: 30000,
  });
};