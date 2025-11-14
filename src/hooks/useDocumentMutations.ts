import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateDocument, deleteDocument, addTags } from "@/config/api/documentApi";
import { reuploadFile } from "@/utils/helper/fileReuploadHelper";

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

export const useDocumentMutations = (
  parentId?: string,
  selectedFileId?: string | null,
  reuploadDocumentId?: string | null,
  setReuploadDocumentId?: (id: string | null) => void
) => {
  const queryClient = useQueryClient();

  const reuploadMutation = useMutation({
    mutationFn: ({ file, documentId }: { file: File; documentId: string }) =>
      reuploadFile(file, { documentId, changeDescription: "File reuploaded" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children", parentId] });
      if (reuploadDocumentId) {
        queryClient.invalidateQueries({ queryKey: ["document", reuploadDocumentId] });
        queryClient.invalidateQueries({ queryKey: ["versions", reuploadDocumentId] });
      }
      toast.success("File reuploaded successfully", {
        description: getFormattedDateTime(),
      });
      setReuploadDocumentId?.(null);
    },
    onError: (error: any) => {
      toast.error("Failed to reupload file", {
        description: error?.response?.data?.message || error?.message,
      });
      setReuploadDocumentId?.(null);
    },
  });

  const updateDocumentMutation = useMutation({
    mutationFn: (data: { id: string; name?: string; description?: string; tags?: string[] }) =>
      updateDocument(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children", parentId] });
      if (selectedFileId) {
        queryClient.invalidateQueries({ queryKey: ["document", selectedFileId] });
      }
      toast.success("File updated successfully", {
        description: getFormattedDateTime(),
      });
    },
    onError: (error: any) => {
      toast.error("Failed to update file", {
        description: error?.response?.data?.message || getFormattedDateTime(),
      });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children", parentId] });
      toast.success("File moved to trash", {
        description: "You can restore it from trash",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to move file to trash", {
        description: error?.response?.data?.message || getFormattedDateTime(),
      });
    },
  });

  const addTagsMutation = useMutation({
    mutationFn: (data: { id: string; tags: string[] }) => addTags(data.id, data.tags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children", parentId] });
      if (selectedFileId) {
        queryClient.invalidateQueries({ queryKey: ["document", selectedFileId] });
      }
      toast.success("Tags added successfully", {
        description: getFormattedDateTime(),
      });
    },
    onError: (error: any) => {
      toast.error("Failed to add tags", {
        description: error?.response?.data?.message || getFormattedDateTime(),
      });
    },
  });

  return { reuploadMutation, updateDocumentMutation, deleteDocumentMutation, addTagsMutation };
};
