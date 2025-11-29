import { useQuery } from "@tanstack/react-query";
import { getStarredItems } from "@/config/api/starredApi";

interface StarredItem {
  id: string;
  name: string;
  type: "folder" | "file";
  itemType: "folder" | "file";
  starred: boolean;
  createdAt: string;
  updatedAt: string;
  parent_id: string | null;
  createdBy: {
    id: string;
    username: string;
    email: string;
  };
  // File-specific fields
  mimeType?: string;
  extension?: string;
  size?: number;
  // Folder-specific fields
  color?: string;
  path?: string;
}

interface StarredResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    folders: number;
    files: number;
    items: StarredItem[];
  };
}

/**
 * Query hook to get all starred items for the current user
 * @param enabled - Optional boolean to enable/disable the query (default: true)
 * @returns Query result with starred items
 */
export const useQueryStarredItems = (enabled: boolean = true) => {
  return useQuery<StarredResponse>({
    queryKey: ["starred-items"],
    queryFn: getStarredItems,
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false, // Disable refetch on window focus
    retry: 2, // Retry failed requests twice
  });
};