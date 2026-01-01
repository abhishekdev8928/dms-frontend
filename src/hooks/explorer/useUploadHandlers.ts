import { useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { validateFiles, validateFileType } from "@/utils/helper/fileValidationHelpers";
import { uploadFiles as uploadFilesHelper } from "@/utils/helper/fileUploadHelper";
import { uploadFolder as uploadFolderHelper } from "@/utils/helper/folderUploadHelper";
import { useDocumentMutations } from "@/hooks/mutations/useDocumentMutations";

const getFormattedDateTime = () => {
  const now = new Date();
  return `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
};

export const useUploadHandlers = (
  parentId: string | undefined,
  reuploadDocumentId: string | null,
  setReuploadDocumentId: (id: string | null) => void
) => {
  const queryClient = useQueryClient();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const reuploadInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const { reuploadMutation } = useDocumentMutations(
    parentId,
    null,
    reuploadDocumentId,
    setReuploadDocumentId
  );

  // ===============================
  // FILE UPLOAD
  // ===============================
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !parentId) return;

    const { validFiles, errors } = validateFiles(Array.from(files));

    if (errors.length) {
      toast.warning("Some files were rejected", {
        description: errors.slice(0, 3).join(", "),
      });
    }

    if (!validFiles.length) {
      toast.error("No valid files to upload");
      return;
    }

    await uploadFilesHelper(validFiles, {
      parentId,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["children", parentId] });
        queryClient.invalidateQueries({ queryKey: ["tree"] });
        toast.success("Files uploaded successfully", {
          description: getFormattedDateTime(),
        });
      },
    });
  };

  // ===============================
  // FOLDER UPLOAD
  // ===============================
  const handleFolderUpload = async (files: FileList | null) => {
    if (!files || !parentId) return;

    const { validFiles, errors } = validateFiles(Array.from(files));

    if (errors.length) {
      toast.warning("Some files were rejected", {
        description: errors.slice(0, 3).join(", "),
      });
    }

    if (!validFiles.length) {
      toast.error("No valid files in folder");
      return;
    }

    await uploadFolderHelper(validFiles, {
      parentId,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["children", parentId] });
        queryClient.invalidateQueries({ queryKey: ["tree"] });
        toast.success("Folder uploaded successfully", {
          description: getFormattedDateTime(),
        });
      },
    });
  };

  // ===============================
  // REUPLOAD
  // ===============================
  const handleReupload = (documentId: string) => {
    setReuploadDocumentId(documentId);
    reuploadInputRef.current?.click();
  };

  const handleReuploadFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file || !reuploadDocumentId) return;

    const ext = file.name.split(".").pop() || "";
    const validation = validateFileType(ext, file.type);

    if (!validation.valid) {
      toast.error(validation.error || "Invalid file");
      setReuploadDocumentId(null);
      return;
    }

    const loading = toast.loading("Reuploading file...");

    try {
      await reuploadMutation.mutateAsync({
        file,
        documentId: reuploadDocumentId,
      });
      toast.dismiss(loading);
    } catch {
      toast.dismiss(loading);
    }
  };

  return {
    fileInputRef,
    reuploadInputRef,
    folderInputRef,
    handleFileUpload,
    handleFolderUpload,
    handleReupload,
    handleReuploadFileChange,
  };
};
