import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  createFolder,
  updateFolder,
  softDeleteFolder,
  restoreFolder,
  moveFolder,
  shareFolder,
  type ICreateFolderData,
  type IUpdateFolderData,
  type IMoveFolderData,
  type IShareFolderData,
  type IFolderResponse,
  type IDeleteFolderResponse,
  type IRestoreFolderResponse,
  type IMoveFolderResponse,
  type IShareFolderResponse,
} from "@/config/api/folderApi";
import {
  getFormattedDateTime,
  getParentFolderIdFromBreadcrumbs,
  isDeletingCurrentFolder,
} from "@/utils/helper/folderHelper";

/* =======================================================
   FOLDER MUTATIONS HOOK
   ======================================================= */

interface UseFolderMutationsOptions {
  parentId?: string;
  breadcrumbs?: Array<{ _id: string; id?: string }>;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useFolderMutations = (options?: UseFolderMutationsOptions) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { parentId, breadcrumbs, onSuccess, onError } = options || {};

  // Mutation: Create Folder
  const createFolderMutation = useMutation<
    IFolderResponse,
    Error,
    ICreateFolderData
  >({
    mutationFn: async (payload: ICreateFolderData) => {
      return await createFolder(payload);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ["folder-children", parentId],
      });
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      toast.success("Redirecting you inside the folder", {
        description: "Folder created successfully",
      });
      navigate(`/dashboard/folder/${response.data._id}`);
      onSuccess?.(response);
    },
    onError: (error: any) => {
      toast.error("Failed to create folder", {
        description: error?.response?.data?.message || getFormattedDateTime(),
      });
      onError?.(error);
    },
  });

  // Mutation: Update Folder
  const updateFolderMutation = useMutation<
    IFolderResponse,
    Error,
    { id: string } & IUpdateFolderData
  >({
    mutationFn: async ({ id, ...payload }) => updateFolder(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ["folder-children", parentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["folder", response.data._id],
      });
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      toast.success("Folder updated successfully", {
        description: getFormattedDateTime(),
      });
      onSuccess?.(response);
    },
    onError: (error: any) => {
      toast.error("Failed to update folder", {
        description: error?.response?.data?.message || getFormattedDateTime(),
      });
      onError?.(error);
    },
  });

  // Mutation: Delete Folder
  const deleteFolderMutation = useMutation<
    IDeleteFolderResponse,
    Error,
    string
  >({
    mutationFn: softDeleteFolder,
    onSuccess: (data, deletedFolderId) => {
      // Check if we're deleting the current folder
      const isDeletingCurrent = isDeletingCurrentFolder(
        deletedFolderId,
        parentId
      );

      if (isDeletingCurrent && breadcrumbs && breadcrumbs.length > 1) {
        // Navigate to parent folder before invalidating
        const parentFolderId = getParentFolderIdFromBreadcrumbs(
          breadcrumbs,
          deletedFolderId
        );

        if (parentFolderId) {
          navigate(`/dashboard/folder/${parentFolderId}`);
          // Invalidate queries for the parent folder
          queryClient.invalidateQueries({
            queryKey: ["folder-children", parentFolderId],
          });
        }
      } else {
        // Normal deletion of a child folder - just invalidate current folder
        queryClient.invalidateQueries({
          queryKey: ["folder-children", parentId],
        });
      }

      // Always invalidate tree
      queryClient.invalidateQueries({ queryKey: ["tree"] });

      toast.success("Folder moved to trash", {
        description: getFormattedDateTime(),
      });

      onSuccess?.(data);
    },
    onError: (error: any) => {
      toast.error("Failed to move folder to trash", {
        description: error?.response?.data?.message || getFormattedDateTime(),
      });
      onError?.(error);
    },
  });

  // Mutation: Restore Folder
  const restoreFolderMutation = useMutation<
    IRestoreFolderResponse,
    Error,
    string
  >({
    mutationFn: restoreFolder,
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ["folder-children", parentId],
      });
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      toast.success("Folder restored successfully", {
        description: getFormattedDateTime(),
      });
      onSuccess?.(response);
    },
    onError: (error: any) => {
      toast.error("Failed to restore folder", {
        description: error?.response?.data?.message || getFormattedDateTime(),
      });
      onError?.(error);
    },
  });

  // Mutation: Move Folder
  const moveFolderMutation = useMutation<
    IMoveFolderResponse,
    Error,
    { id: string } & IMoveFolderData
  >({
    mutationFn: async ({ id, ...payload }) => moveFolder(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["folder-children"] });
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      toast.success("Folder moved successfully", {
        description: getFormattedDateTime(),
      });
      onSuccess?.(response);
    },
    onError: (error: any) => {
      toast.error("Failed to move folder", {
        description: error?.response?.data?.message || getFormattedDateTime(),
      });
      onError?.(error);
    },
  });

  // Mutation: Share Folder
  const shareFolderMutation = useMutation<
    IShareFolderResponse,
    Error,
    { id: string } & IShareFolderData
  >({
    mutationFn: async ({ id, ...payload }) => shareFolder(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ["folder", response.data._id],
      });
      toast.success("Folder shared successfully", {
        description: getFormattedDateTime(),
      });
      onSuccess?.(response);
    },
    onError: (error: any) => {
      toast.error("Failed to share folder", {
        description: error?.response?.data?.message || getFormattedDateTime(),
      });
      onError?.(error);
    },
  });

  // Utility: Invalidate all folder queries
  const invalidateAllFolderQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["folder-children"] });
    queryClient.invalidateQueries({ queryKey: ["folder"] });
  };

  // Utility: Invalidate specific folder
  const invalidateFolder = (folderId: string) => {
    queryClient.invalidateQueries({ queryKey: ["folder", folderId] });
    queryClient.invalidateQueries({ queryKey: ["folder-children", folderId] });
  };

  // Utility: Invalidate tree queries
  const invalidateTreeQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["tree"] });
  };

  return {
    // Mutations
    createFolderMutation,
    updateFolderMutation,
    deleteFolderMutation,
    restoreFolderMutation,
    moveFolderMutation,
    shareFolderMutation,

    // Utilities
    invalidateAllFolderQueries,
    invalidateFolder,
    invalidateTreeQueries,
  };
};
