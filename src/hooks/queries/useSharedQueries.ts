// hooks/queries/useSharedQueries.ts

import { useQuery } from "@tanstack/react-query";
import { getFullTree, getSharedWithMe } from "@/config/api/treeApi";

/**
 * Hook to get the full department → folder → subfolder hierarchy
 */
export const useFullTreeQuery = () => {
  return useQuery({
    queryKey: ["navigation-tree"],
    queryFn: getFullTree,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

/**
 * Hook to get all folders and documents shared with the current user
 */
export interface SharedWithMeParams {
  type?: "all" | "folder" | "document";
  page?: number;
  limit?: number;
}

export const useSharedWithMeQuery = (params?: SharedWithMeParams) => {
  return useQuery({
    queryKey: ["shared-with-me", params],
    queryFn: () => getSharedWithMe(params),
    staleTime:0,
    refetchOnMount: true,
  refetchOnWindowFocus: true,
  });
};
