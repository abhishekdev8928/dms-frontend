// pages/SharedWithMePage.tsx

import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useFolderMutations } from "@/hooks/mutations/useFolderMutations";
import { useDocumentMutations } from "@/hooks/mutations/useDocumentMutations";
import { useSharedWithMeQuery } from "@/hooks/queries/useSharedQueries";

import FileInfoPanel from "@/components/RightPanelView/ResourcePreviewPanel";
import GridView from "@/components/explorer/explorerView/GridView";
import ListView from "@/components/explorer/explorerView/ListView";
import RenameFolderModal from "@/components/Modals/RenameFolderModal";
import TagsModal from "@/components/Modals/TagsModal";
import DeleteModal from "@/components/Modals/DeleteModal";
import RenameDocumentModal from "@/components/Modals/RenameDocumentModal";
import { ShareModal } from "@/components/Modals/CreateShareModal.";

import type { IFolderItem, IDocumentItem } from "@/config/types/commonTypes";
import { isFolderItem } from "@/config/types/commonTypes";
import { useAppConfigStore } from "@/config/store/useAppConfigStore";

// Custom Hooks
import { useMultiSelect } from "@/hooks/explorer/useMultiSelect";
import { useItemActions } from "@/hooks/explorer/useItemActions";
import { useModalState } from "@/hooks/explorer/useModalState";
import { ViewToggleButtons } from "@/components/explorer/explorerView/ViewToggleButtons";
import { useSortItems } from "@/hooks/explorer/useSortedItems";

export default function SharedWithMePage() {
  const queryClient = useQueryClient();

  // Store state
  const viewMode = useAppConfigStore((state) => state.viewMode);
  const setViewMode = useAppConfigStore((state) => state.setViewMode);
  const showInfoPanel = useAppConfigStore((state) => state.showInfoPanel);
  const toggleInfoPanel = useAppConfigStore((state) => state.toggleInfoPanel);

  // UI State
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  // Fetch shared items
  const { data: sharedData, isLoading, error } = useSharedWithMeQuery();

  // Get items directly from response
  const items = sharedData?.children || [];

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
            queryClient.invalidateQueries({ queryKey: ["shared-with-me"] });
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
            queryClient.invalidateQueries({ queryKey: ["shared-with-me"] });
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
  }, [selectedIds, sortedItems]);

  return (
    <div className="h-full flex flex-col py-4 pe-4">
      <div className="flex-1 flex gap-4 overflow-hidden">
        <div className="flex-1 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="shrink-0 p-6 pt-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Shared With Me
                </h1>
                <span className="text-sm text-gray-500">
                  {sharedData?.count || 0} items
                </span>
              </div>

              <ViewToggleButtons
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                showInfoPanel={showInfoPanel}
                onToggleInfoPanel={toggleInfoPanel}
              />
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
                  Failed to load shared items
                </p>
                <Button
                  onClick={() =>
                    queryClient.invalidateQueries({
                      queryKey: ["shared-with-me"],
                    })
                  }
                >
                  Retry
                </Button>
              </div>
            ) : isEmpty ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-600">
                <img
                  src="https://ssl.gstatic.com/docs/doclist/images/empty_state_shared_with_me_v3.svg"
                  alt="No shared items"
                  className="w-64 mb-6 opacity-80"
                />
                <h2 className="text-xl font-semibold">No shared items yet</h2>
                <p className="text-gray-500 mt-2">
                  Items shared with you will appear here.
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
                      ownerColumnConfig={{
                        label: "Shared By",
                        dataKey: "sharedBy"
                      }}
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

        {/* Info Panel */}
        {showInfoPanel && (
          <div className="w-[350px] flex-shrink-0 h-full overflow-hidden">
            <FileInfoPanel
              item={modalState.selectedItem}
              selectionCount={
                selectedIds.fileIds.length + selectedIds.folderIds.length
              }
              onClose={toggleInfoPanel}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <RenameDocumentModal
        open={
          modalState.renameModalOpen &&
          modalState.selectedItem &&
          !isFolderItem(modalState.selectedItem)
        }
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
              queryClient.invalidateQueries({ queryKey: ["shared-with-me"] });
            } catch (error) {
              console.error("Failed to rename document:", error);
            }
          }
        }}
        isLoading={updateDocumentMutation.isPending}
      />

      <RenameFolderModal
        open={
          modalState.renameModalOpen &&
          modalState.selectedItem &&
          isFolderItem(modalState.selectedItem)
        }
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
              queryClient.invalidateQueries({ queryKey: ["shared-with-me"] });
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
              queryClient.invalidateQueries({ queryKey: ["shared-with-me"] });
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