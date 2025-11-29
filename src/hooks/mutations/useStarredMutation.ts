import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addStarredItem, removeStarredItem, bulkUpdateStarred } from "@/config/api/starredApi";

interface StarredPayload {
  id: string;
  type: "folder" | "file";
}

interface BulkStarredPayload {
  fileIds: string[];
  folderIds: string[];
  starred: boolean;
}

interface MutationCallbacks {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

/**
 * Mutation for adding a single item to starred
 */
export const useMutationAddStarred = (callbacks?: MutationCallbacks) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StarredPayload) => addStarredItem(payload),
    onSuccess: (data) => {
      // Invalidate starred items query to refetch
      queryClient.invalidateQueries({ queryKey: ["starred-items"] });
      
      // Also invalidate the folder/file queries if they exist
      queryClient.invalidateQueries({ queryKey: ["children"] });
      
      callbacks?.onSuccess?.(data);
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
};

/**
 * Mutation for removing a single item from starred
 */
export const useMutationRemoveStarred = (callbacks?: MutationCallbacks) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StarredPayload) => removeStarredItem(payload),
    onSuccess: (data) => {
      // Invalidate starred items query to refetch
      queryClient.invalidateQueries({ queryKey: ["starred-items"] });
      
      // Also invalidate the folder/file queries if they exist
      queryClient.invalidateQueries({ queryKey: ["children"] });
      
      callbacks?.onSuccess?.(data);
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
};

/**
 * Mutation for bulk updating starred status (add or remove multiple items)
 */
export const useMutationBulkStarred = (callbacks?: MutationCallbacks) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkStarredPayload) => bulkUpdateStarred(payload),
    onSuccess: (data) => {
      // Invalidate starred items query to refetch
      queryClient.invalidateQueries({ queryKey: ["starred-items"] });
      
      // Also invalidate the folder/file queries if they exist
      queryClient.invalidateQueries({ queryKey: ["children"] });
      
      callbacks?.onSuccess?.(data);
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
};