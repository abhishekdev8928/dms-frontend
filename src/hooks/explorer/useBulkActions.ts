



import { useDocumentMutations } from "@/hooks/mutations/useDocumentMutations";

interface SelectionState {
  fileIds: string[];
  folderIds: string[];
}

export const useBulkActions = (
  parentId: string | undefined,
  selectedIds: SelectionState,
  clearSelection: () => void
) => {
  const { bulkDeletionMutation } = useDocumentMutations(
    parentId,
    null,
    null,
    () => {}
  );

  const bulkDelete = () => {
    bulkDeletionMutation.mutate(selectedIds);
    clearSelection();
  };

  const selectedCount = selectedIds.fileIds.length + selectedIds.folderIds.length;
  const canDelete = selectedCount > 0;
  const canDownload = selectedCount > 0;
  const canTag = selectedCount > 0;

  return {
    bulkDelete,
    canDelete,
    canDownload,
    canTag,
    selectedCount,
  };
};