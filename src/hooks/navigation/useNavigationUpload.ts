import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { validateFiles } from "@/utils/helper/fileValidationHelpers";
import { uploadFiles } from "@/utils/helper/fileUploadHelper";
import { uploadFolder } from "@/utils/helper/folderUploadHelper";

interface UseNavigationUploadOptions {
  parentId?: string;
}

export const useNavigationUpload = (options?: UseNavigationUploadOptions) => {
  const { parentId } = options || {};
  const queryClient = useQueryClient();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // ===========================
  // FILE UPLOAD
  // ===========================
  const fileUploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      return uploadFiles(files, { parentId: parentId! });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["folder-children", parentId] });
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });

      const count = data?.filesCount || data?.length || 0;
      toast.success("Files Uploaded", {
        description: `${count} file${count !== 1 ? "s" : ""} uploaded successfully.`,
      });
    },
    onError: (error: any) => {
      toast.error("File Upload Failed", {
        description: error?.message || "Something went wrong",
      });
    },
  });

  // ===========================
  // FOLDER UPLOAD
  // ===========================
  const folderUploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      return uploadFolder(files, { parentId: parentId! });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["folder-children", parentId] });
      queryClient.invalidateQueries({ queryKey: ["tree"] });

      toast.success("Folder Uploaded", {
        description: `${data.filesCount} files uploaded in ${data.foldersCount} folders.`,
      });
    },
    onError: (error: any) => {
      toast.error("Folder Upload Failed", {
        description: error?.message || "Something went wrong",
      });
    },
  });

  // ===========================
  // HANDLERS
  // ===========================
  const handleFileUploadClick = () => {
    if (!parentId) {
      toast.warning("No Folder Selected");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFolderUploadClick = () => {
    if (!parentId) {
      toast.warning("No Folder Selected");
      return;
    }
    folderInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const { validFiles, errors } = validateFiles(Array.from(files));

    if (errors.length) {
      toast.warning("Some files rejected", {
        description: errors.slice(0, 3).join(", "),
      });
    }

    if (!validFiles.length) {
      toast.error("No valid files selected");
      return;
    }

    fileUploadMutation.mutate(validFiles);
    e.target.value = "";
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const { validFiles, errors } = validateFiles(Array.from(files));

    if (errors.length) {
      toast.warning("Some files rejected", {
        description: errors.slice(0, 3).join(", "),
      });
    }

    if (!validFiles.length) {
      toast.error("No valid files in folder");
      return;
    }

    folderUploadMutation.mutate(validFiles);
    e.target.value = "";
  };

  return {
    fileInputRef,
    folderInputRef,
    handleFileUploadClick,
    handleFolderUploadClick,
    handleFileChange,
    handleFolderChange,
    fileUploadMutation,
    folderUploadMutation,
  };
};
