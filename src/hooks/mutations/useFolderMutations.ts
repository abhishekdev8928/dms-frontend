import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createFolder, updateFolder, softDeleteFolder } from "@/config/api/folderApi";

const getFormattedDateTime = () => {
  const now = new Date();
  return now.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const useFolderMutations = (parentId?: string, breadcrumbs?: any[]) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createFolderMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      parent_id: string;
      color?: string;
    }) => {
      return await createFolder(data);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["children", parentId] });
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      toast.success("Redirecting you inside the folder", {
        description: "Folder created successfully",
      });
      navigate(`/dashboard/folder/${response.data._id}`);
    },
    onError: (error: any) => {
      toast.error("Failed to create folder", {
        description: error?.response?.data?.message || getFormattedDateTime(),
      });
    },
  });

  const updateFolderMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; color?: string }) =>
      updateFolder(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children", parentId] });
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      queryClient.invalidateQueries({ queryKey: ["breadcrumbs", parentId] });
      toast.success("Folder updated successfully", {
        description: getFormattedDateTime(),
      });
    },
    onError: (error: any) => {
      toast.error("Failed to update folder", {
        description: error?.response?.data?.message || getFormattedDateTime(),
      });
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: softDeleteFolder,
    onSuccess: (data, deletedFolderId) => {
      // Check if we're deleting the current folder (from breadcrumbs)
      const isDeletingCurrentFolder = deletedFolderId === parentId;

      if (isDeletingCurrentFolder && breadcrumbs && breadcrumbs.length > 1) {
        // Navigate to parent folder before invalidating
        const parentFolderId = breadcrumbs[breadcrumbs.length - 2]._id;
        navigate(`/dashboard/folder/${parentFolderId}`);

        // Invalidate queries for the parent folder
        queryClient.invalidateQueries({ queryKey: ["children", parentFolderId] });
        queryClient.invalidateQueries({ queryKey: ["breadcrumbs", parentFolderId] });
      } else {
        // Normal deletion of a child folder - just invalidate current folder
        queryClient.invalidateQueries({ queryKey: ["children", parentId] });
        queryClient.invalidateQueries({ queryKey: ["breadcrumbs", parentId] });
      }

      // Always invalidate tree
      queryClient.invalidateQueries({ queryKey: ["tree"] });

      toast.success("Folder moved to trash", {
        description: "You can restore it from trash",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to move folder to trash", {
        description: error?.response?.data?.message || getFormattedDateTime(),
      });
    },
  });

  return { createFolderMutation, updateFolderMutation, deleteFolderMutation };
};