import { useQuery } from "@tanstack/react-query";
import { getChildFolders } from "@/config/api/folderApi";

interface UseFolderQueriesProps {
  parentId?: string;
  selectedTypeFilter: string;
  selectedUser: string;
}

/**
 * Custom hook for fetching folder children and breadcrumbs
 * This hook fetches the folder structure including:
 * - Child items (folders and documents)
 * - Breadcrumb navigation data
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
  } = useQuery({
    queryKey: ["children", parentId, selectedTypeFilter, selectedUser],
    queryFn: async () => {
      const res = await getChildFolders(parentId || "", {
        type: selectedTypeFilter || undefined,
        userEmail: selectedUser || undefined,
      });
      return structuredClone(res);
    },
    enabled: !!parentId,
  });

  // Extract data from response
  const items = childrenData?.children || [];
  const breadcrumbs = childrenData?.breadcrumbs || [];

  return {
    items,
    breadcrumbs,
    isChildrenLoading,
    childrenError,
    refetchChildren,
  };
};