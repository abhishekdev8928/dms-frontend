// pages/StarredPage.tsx

import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useFolderMutations } from "@/hooks/mutations/useFolderMutations";
import { useDocumentMutations } from "@/hooks/mutations/useDocumentMutations";
import { useQueryStarredItems } from "@/hooks/queries/useStarredQueries";

import FileInfoPanel from "@/components/RightPanelView/ResourcePreviewPanel";
import GridView from "@/components/explorer/explorerView/GridView";
import ListView from "@/components/explorer/explorerView/ListView";
import RenameFolderModal from "@/components/Modals/RenameFolderModal";
import TagsModal from "@/components/Modals/TagsModal";
import DeleteModal from "@/components/Modals/DeleteModal";
import RenameDocumentModal from "@/components/Modals/RenameDocumentModal";
import { BulkActionToolbar } from "@/components/RightPanelView/Actions/BulkActionToolbar";
import { ShareModal } from "@/components/Modals/CreateShareModal.";

import type { IFolderItem, IDocumentItem } from "@/config/types/commonTypes";
import { isFolderItem } from "@/config/types/commonTypes";
import type { IStarredItem } from "@/config/types/starredTypes";
import { useAppConfigStore } from "@/config/store/useAppConfigStore";

// Custom Hooks
import { useMultiSelect } from "@/hooks/explorer/useMultiSelect";
import { useItemActions } from "@/hooks/explorer/useItemActions";
import { useModalState } from "@/hooks/explorer/useModalState";
import { useBulkActions } from "@/hooks/explorer/useBulkActions";
import { ViewToggleButtons } from "@/components/explorer/explorerView/ViewToggleButtons";
import { useSortItems } from "@/hooks/explorer/useSortedItems";

export default function StarredPage() {
  const queryClient = useQueryClient();

  // Store state - Read from store
  const viewMode = useAppConfigStore((state) => state.viewMode);
  const setViewMode = useAppConfigStore((state) => state.setViewMode);
  const showInfoPanel = useAppConfigStore((state) => state.showInfoPanel);
  const toggleInfoPanel = useAppConfigStore((state) => state.toggleInfoPanel);

  // UI State
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  // Fetch starred items
  const { data: starredData, isLoading, error } = useQueryStarredItems();

  console.log(starredData)

  // Get items directly from response
  const items: IStarredItem[] = starredData?.children || [];

  const { sortedItems, sortField, sortOrder, handleSort } = useSortItems(items);

  // Custom Hooks
  const { selectedIds, selectItem, clearSelection } = useMultiSelect(sortedItems);

  const modalState = useModalState();

  const itemActions = useItemActions(
    modalState.setSelectedItem,
    modalState.setRenameModalOpen,
    modalState.setDeleteModalOpen,
    modalState.setTagsModalOpen,
    modalState.openShareModal,
    setSelectedFileId,
    toggleInfoPanel
  );

  const bulkActions = useBulkActions(undefined, selectedIds, clearSelection);

  // Mutations
  const { updateFolderMutation, deleteFolderMutation } = useFolderMutations(
    undefined,
    []
  );

  const { updateDocumentMutation, deleteDocumentMutation, addTagsMutation } =
    useDocumentMutations(undefined, selectedFileId, null, () => {});

  // Computed values
  const isEmpty = sortedItems.length === 0;

  // Enhanced selection handler
  const handleItemSelection = (
    e: React.MouseEvent<HTMLDivElement | HTMLTableRowElement, MouseEvent>,
    item: { id: string; type: string },
    itemIndex: number
  ): void => {
    selectItem(item, itemIndex, {
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
    });
  };

  // Delete handler
  const handleDeleteConfirm = () => {
    if (modalState.selectedItem) {
      if (isFolderItem(modalState.selectedItem)) {
        deleteFolderMutation.mutate(modalState.selectedItem._id, {
          onSuccess: () => {
            toast.success("Item moved to trash", {
              description: `"${modalState.selectedItem?.name}" has been moved to trash`,
            });
            modalState.setDeleteModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["starred-items"] });
          },
          onError: (error: any) => {
            toast.error("Failed to delete", {
              description: error?.message || "Please try again",
            });
          },
        });
      } else {
        deleteDocumentMutation.mutate(modalState.selectedItem._id, {
          onSuccess: () => {
            toast.success("Item moved to trash", {
              description: `"${modalState.selectedItem?.name}" has been moved to trash`,
            });
            modalState.setDeleteModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["starred-items"] });
          },
          onError: (error: any) => {
            toast.error("Failed to delete", {
              description: error?.message || "Please try again",
            });
          },
        });
      }
    }
  };

  useEffect(() => {
    const totalSelected =
      selectedIds.fileIds.length + selectedIds.folderIds.length;

    if (totalSelected === 1) {
      const selectedId = selectedIds.fileIds[0] || selectedIds.folderIds[0];
      const selectedItem = sortedItems.find((item) => item._id === selectedId);

      if (selectedItem) {
        modalState.setSelectedItem(selectedItem);
        setSelectedFileId(selectedId);
      }
    } else {
      modalState.setSelectedItem(null);
      setSelectedFileId(null);
    }
  }, [selectedIds, sortedItems, modalState]);

  return (
    <div className="h-full flex flex-col py-4 pe-4">
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden">
          {/* Header - Fixed */}
          <div className="flex-shrink-0 p-6 pt-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Starred
                </h1>
                <span className="text-sm text-gray-500">
                  {starredData?.count || 0} items
                </span>
              </div>

              <ViewToggleButtons
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                showInfoPanel={showInfoPanel}
                onToggleInfoPanel={toggleInfoPanel}
              />
            </div>

            {/* Filter Buttons */}
            <div className="right-panel-filter">
              {selectedIds.fileIds.length > 0 ||
              selectedIds.folderIds.length > 0 ? (
                <BulkActionToolbar
                  onClearSelection={clearSelection}
                  selectionCount={bulkActions.selectedCount}
                  onDeleteSelected={bulkActions.bulkDelete}
                />
              ) : null}
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                Loading...
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-red-600 mb-4">
                  Failed to load starred items
                </p>
                <Button
                  onClick={() =>
                    queryClient.invalidateQueries({
                      queryKey: ["starred-items"],
                    })
                  }
                >
                  Retry
                </Button>
              </div>
            ) : isEmpty ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-600">
                <img
                  src="https://ssl.gstatic.com/docs/doclist/images/empty_state_starred_files_v3.svg"
                  alt="No starred items"
                  className="w-64 mb-6 opacity-80"
                />
                <h2 className="text-xl font-semibold">No starred items yet</h2>
                <p className="text-gray-500 mt-2">
                  Star items to easily find them later.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="p-6">
                  {viewMode === "list" ? (
                    <ListView
                      selectedIds={selectedIds}
                      onSelectItem={handleItemSelection}
                      items={sortedItems}
                      sortField={sortField}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                      onItemClick={(item) =>
                        itemActions.handleItemClick(item, clearSelection)
                      }
                      onRename={itemActions.handleRename}
                      onDelete={itemActions.handleDelete}
                      onDownload={itemActions.handleDownload}
                      onShowInfo={itemActions.handleShowInfo}
                      onAddTags={itemActions.handleAddTags}
                      onShare={itemActions.handleShare}
                    />
                  ) : (
                    <GridView
                      items={sortedItems}
                      selectedIds={selectedIds}
                      onSelectItem={handleItemSelection}
                      onItemClick={(item) =>
                        itemActions.handleItemClick(item, clearSelection)
                      }
                      onRename={itemActions.handleRename}
                      onDelete={itemActions.handleDelete}
                      onDownload={itemActions.handleDownload}
                      onShowInfo={itemActions.handleShowInfo}
                      onAddTags={itemActions.handleAddTags}
                    />
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        {/* Info Panel - Fixed Width */}
        {showInfoPanel && (
          <div className="w-[350px] flex-shrink-0 h-full overflow-hidden">
            <FileInfoPanel
              item={modalState.selectedItem}
              selectionCount={bulkActions.selectedCount}
              onClose={toggleInfoPanel}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <RenameDocumentModal
        open={modalState.renameModalOpen && modalState.selectedItem && !isFolderItem(modalState.selectedItem)}
        onOpenChange={modalState.setRenameModalOpen}
        item={modalState.selectedItem as IDocumentItem}
        onConfirm={async (data) => {
          if (modalState.selectedItem) {
            try {
              await updateDocumentMutation.mutateAsync({
                id: modalState.selectedItem._id,
                name: data.name,
                description: data.description,
              });
              modalState.setRenameModalOpen(false);
              queryClient.invalidateQueries({ queryKey: ["starred-items"] });
            } catch (error) {
              console.error("Failed to rename document:", error);
            }
          }
        }}
        isLoading={updateDocumentMutation.isPending}
      />

      <RenameFolderModal
        open={modalState.renameModalOpen && modalState.selectedItem && isFolderItem(modalState.selectedItem)}
        onOpenChange={modalState.setRenameModalOpen}
        item={modalState.selectedItem as IFolderItem}
        onConfirm={async (data) => {
          if (modalState.selectedItem) {
            try {
              await updateFolderMutation.mutateAsync({
                id: modalState.selectedItem._id,
                name: data.name,
                color: data.color,
              });
              modalState.setRenameModalOpen(false);
              queryClient.invalidateQueries({ queryKey: ["starred-items"] });
            } catch (error) {
              console.error("Failed to rename folder:", error);
            }
          }
        }}
        isLoading={updateFolderMutation.isPending}
      />

      <DeleteModal
        open={modalState.deleteModalOpen}
        onOpenChange={modalState.setDeleteModalOpen}
        item={modalState.selectedItem}
        onConfirm={handleDeleteConfirm}
        isLoading={
          deleteFolderMutation.isPending || deleteDocumentMutation.isPending
        }
      />

      <TagsModal
        open={modalState.tagsModalOpen}
        onOpenChange={modalState.setTagsModalOpen}
        item={modalState.selectedItem as IDocumentItem}
        onConfirm={async (tags) => {
          if (modalState.selectedItem) {
            try {
              await addTagsMutation.mutateAsync({
                id: modalState.selectedItem._id,
                tags,
              });
              modalState.setTagsModalOpen(false);
              queryClient.invalidateQueries({ queryKey: ["starred-items"] });
            } catch (error) {
              console.error("Failed to add tags:", error);
            }
          }
        }}
        isLoading={addTagsMutation.isPending}
      />

      <ShareModal
        isOpen={modalState.shareModalOpen}
        item={modalState.selectedItem}
        onOpenChange={modalState.openShareModal}
      />
    </div>
  );
}