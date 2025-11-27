
import { useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  uploadFiles as uploadFilesHelper,
  validateFiles,
  ALLOWED_EXTENSIONS,
} from "@/utils/helper/fileUploadHelper";
import { validateFile } from "@/utils/helper/fileReuploadHelper";
import { uploadFolder as uploadFolderHelper } from "@/utils/helper/folderUploadHelper";
import { useDocumentMutations } from "@/hooks/mutations/useDocumentMutations";

const getFormattedDateTime = () => {
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${formattedDate} at ${formattedTime}`;
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

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !parentId) return;

    const filesArray = Array.from(files);
    const { validFiles, errors } = validateFiles(filesArray);

    if (errors.length > 0) {
      toast.warning("Some files were rejected", {
        description: errors.join(", "),
      });
    }

    if (validFiles.length === 0) {
      toast.error("No valid files to upload", {
        description: "Please check file types and sizes",
      });
      return;
    }

    try {
      await uploadFilesHelper(validFiles, {
        parentId,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["children", parentId] });
          queryClient.invalidateQueries({ queryKey: ["tree"] });
          toast.success(`${validFiles.length} file(s) uploaded successfully`, {
            description: getFormattedDateTime(),
          });
        },
        onError: (error) => {
          console.error("Upload error:", error);
          toast.error("Upload failed", {
            description: error?.message || getFormattedDateTime(),
          });
        },
      });
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast.error("Upload failed", {
        description: error?.message || getFormattedDateTime(),
      });
    }
  };

  const handleFolderUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !parentId) return;

    const filesArray = Array.from(files);
    const { validFiles, errors } = validateFiles(filesArray);

    if (errors.length > 0) {
      toast.warning("Some files were rejected", {
        description: errors.slice(0, 3).join(", "),
      });
    }

    if (validFiles.length === 0) {
      toast.error("No valid files in folder", {
        description: "All files were rejected",
      });
      return;
    }

    try {
      await uploadFolderHelper(validFiles, {
        parentId,
        onProgress: (progress) => {
          console.log(`${progress.stage}: ${progress.current}/${progress.total}`);
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["children", parentId] });
          queryClient.invalidateQueries({ queryKey: ["tree"] });
          toast.success("Folder uploaded successfully", {
            description: getFormattedDateTime(),
          });
        },
      });
    } catch (error: any) {
      console.error("Folder upload failed:", error);
      toast.error("Folder upload failed", {
        description: error?.message || getFormattedDateTime(),
      });
    }
  };

  const handleReupload = (documentId: string) => {
    setReuploadDocumentId(documentId);
    reuploadInputRef.current?.click();
  };


  const handleReuploadFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    const currentDocId = reuploadDocumentId;
    e.target.value = "";

    if (!file || !currentDocId) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid file", {
        description: getFormattedDateTime(),
      });
      setReuploadDocumentId(null);
      return;
    }

    const loadingToast = toast.loading("Reuploading file...", {
      description: getFormattedDateTime(),
    });

    try {
      await reuploadMutation.mutateAsync({
        file,
        documentId: currentDocId,
      });
      toast.dismiss(loadingToast);
    } catch (error) {
      toast.dismiss(loadingToast);
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
    ALLOWED_EXTENSIONS,
  };
};