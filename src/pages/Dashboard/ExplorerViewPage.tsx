import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import EmptyState from "@/components/RightPanelView/EmptyState";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useFolderMutations } from "@/hooks/mutations/useFolderMutations";
import { useDocumentMutations } from "@/hooks/mutations/useDocumentMutations";
import { useFolderQueries } from "@/hooks/queries/useFolderQueries";
import { useDepartmentMutation } from "@/hooks/mutations/useDepartmentMutation";



import FileInfoPanel from "@/components/RightPanelView/ResourcePreviewPanel";
import GridView from "@/components/explorer/explorerView/GridView";
import ListView from "@/components/explorer/explorerView/ListView";
import RenameFolderModal from "@/components/Modals/RenameFolderModal";
import TagsModal from "@/components/Modals/TagsModal";
import DeleteModal from "@/components/Modals/DeleteModal";
import FilterButtons from "./FilterBox";
import CreateFolderModal from "@/components/Modals/CreateFolderModal";
import RenameDocumentModal from "@/components/Modals/RenameDocumentModal";
import { BreadcrumbNavigation } from "@/components/RightPanelView/BreadcrumbNavigation";
import { BulkActionToolbar } from "@/components/RightPanelView/Actions/BulkActionToolbar";
import { DepartmentModal } from "@/components/Modals/DepartmentModal";

import type { FileItem } from "@/types/documentTypes";
import type { Department } from "@/config/api/departmentApi";
import { useAppConfigStore } from "@/config/store/useAppConfigStore";

// Custom Hooks
import { useUploadHandlers } from "@/hooks/explorer/useUploadHandlers";
import { useMultiSelect } from "@/hooks/explorer/useMultiSelect";
import { useItemActions } from "@/hooks/explorer/useItemActions";
import { useModalState } from "@/hooks/explorer/useModalState";
import { useDragAndDrop } from "@/hooks/explorer/useDragAndDrop";
import { useBulkActions } from "@/hooks/explorer/useBulkActions";
import { useBreadcrumbNavigation } from "@/hooks/explorer/useBreadcrumbNavigation";
import { ViewToggleButtons } from "@/components/explorer/explorerView/ViewToggleButtons";
import { useSortItems } from "@/hooks/explorer/useSortedItems";
import { ShareModal } from "@/components/Modals/CreateShareModal.";






export default function ExplorerViewPage() {
  const { parentId } = useParams<{ parentId: string }>();
  const queryClient = useQueryClient();

  // Store state - Read from store
  const viewMode = useAppConfigStore((state) => state.viewMode);
  const setViewMode = useAppConfigStore((state) => state.setViewMode);
  const showInfoPanel = useAppConfigStore((state) => state.showInfoPanel);
  const toggleInfoPanel = useAppConfigStore((state) => state.toggleInfoPanel);
  const userList = useAppConfigStore((state) => state.userList);

  // UI State
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [reuploadDocumentId, setReuploadDocumentId] = useState<string | null>(null);
 

  // Fetch data
  const {
    items,
    breadcrumbs,
    isChildrenLoading: isLoading,
    childrenError: error,
  } = useFolderQueries({
    parentId,
    selectedTypeFilter,
    selectedUser,
  });

  
  const { sortedItems, sortField, sortOrder, handleSort } = useSortItems(items);

  // Custom Hooks
  
  const {
    selectedIds,
    selectItem,
    clearSelection,
  } = useMultiSelect(sortedItems); // ✅ Use sortedItems



  const uploadHandlers = useUploadHandlers(
    parentId,
    reuploadDocumentId,
    setReuploadDocumentId
  );
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

  const dragAndDrop = useDragAndDrop(uploadHandlers.handleFileUpload);
  const breadcrumbNav = useBreadcrumbNavigation();
  const bulkActions = useBulkActions(parentId, selectedIds, clearSelection);

  // Mutations
  const { createFolderMutation, updateFolderMutation, deleteFolderMutation } =
    useFolderMutations(parentId, breadcrumbs);

  const { updateDocumentMutation, deleteDocumentMutation, addTagsMutation } =
    useDocumentMutations(
      parentId,
      selectedFileId,
      reuploadDocumentId,
      setReuploadDocumentId
    );

  const { updateMutation: updateDepartmentMutation } = useDepartmentMutation();

  // Computed values
  const isEmpty = sortedItems.length === 0; // ✅ Use sortedItems
  const isFolder = (item: FileItem | null): boolean =>
    item !== null && item.type === "folder";

  // Enhanced selection handler
  const handleItemSelection = (
    e: React.MouseEvent<HTMLDivElement | HTMLTableRowElement, MouseEvent>,
    item: { id: string; type: string },
    itemIndex: number
  ): void => {
    selectItem(
      item,
      itemIndex,
      {
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
      }
    );
  };

  // Department handlers
  const handleDepartmentSubmit = (data: any) => {
    if (modalState.selectedDepartment?._id) {
      updateDepartmentMutation.mutate(
        {
          id: modalState.selectedDepartment._id,
          data: { name: data.name },
        },
        {
          onSuccess: () => {
            modalState.closeDepartmentModal();
          },
        }
      );
    }
  };

  const handleEditDepartment = (department: Department) => {
    modalState.openDepartmentModal("edit", department);
  };

  // Delete handler
  const handleDeleteConfirm = () => {
    if (modalState.selectedItem) {
      if (isFolder(modalState.selectedItem)) {
        deleteFolderMutation.mutate(modalState.selectedItem._id, {
          onSuccess: () => {
            toast.success("Item moved to trash", {
              description: `"${modalState.selectedItem?.name}" has been moved to trash`,
            });
            modalState.setDeleteModalOpen(false);
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
    const totalSelected = selectedIds.fileIds.length + selectedIds.folderIds.length;

    if (totalSelected === 1) {
      const selectedId = selectedIds.fileIds[0] || selectedIds.folderIds[0];
      const selectedItem = sortedItems.find((item) => item._id === selectedId); // ✅ Use sortedItems

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
        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden">
          {/* Header - Fixed */}
          <div className="flex-shrink-0 p-6 pt-3">
            <div className="flex items-center justify-between mb-4">
              <BreadcrumbNavigation
                breadcrumbs={breadcrumbs}
                onBreadcrumbClick={breadcrumbNav.handleBreadcrumbClick}
                onCreateFolder={() => modalState.setCreateFolderModalOpen(true)}
                onRename={itemActions.handleRename}
                onDelete={itemActions.handleDelete}
                onEditDepartment={handleEditDepartment}
              />

              <ViewToggleButtons
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                showInfoPanel={showInfoPanel}
                onToggleInfoPanel={toggleInfoPanel}
              />
            </div>

            {/* Filter Buttons */}
            <div className="right-panel-filter">
              {selectedIds.fileIds.length > 0 || selectedIds.folderIds.length > 0 ? (
                <BulkActionToolbar
                  onClearSelection={clearSelection}
                  selectionCount={bulkActions.selectedCount}
                  onDeleteSelected={bulkActions.bulkDelete}
                />
              ) : (
                <FilterButtons
  selectedTypeFilter={selectedTypeFilter}
  setSelectedTypeFilter={setSelectedTypeFilter}
  selectedUser={selectedUser}
  setSelectedUser={setSelectedUser}
  userData={userList}  // ✅ Pass array directly, not wrapped in object
/>
              )}
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div
            className="flex-1 overflow-hidden"
            onDragEnter={isEmpty ? dragAndDrop.handleDragEnter : undefined}
            onDragLeave={isEmpty ? dragAndDrop.handleDragLeave : undefined}
            onDragOver={isEmpty ? dragAndDrop.handleDragOver : undefined}
            onDrop={isEmpty ? dragAndDrop.handleDrop : undefined}
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                Loading...
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-red-600 mb-4">Failed to load folder</p>
                <Button
                  onClick={() =>
                    queryClient.invalidateQueries({
                      queryKey: ["children", parentId],
                    })
                  }
                >
                  Retry
                </Button>
              </div>
            ) : isEmpty ? (
              selectedTypeFilter?.trim() !== "" || selectedUser?.trim() !== "" ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-600">
                  <img
                    src="https://ssl.gstatic.com/docs/doclist/images/empty_state_recents_v4.svg"
                    alt="No matching results"
                    className="w-64 mb-6 opacity-80"
                  />
                  <h2 className="text-xl font-semibold">No matching results</h2>
                  <p className="text-gray-500 mt-2">
                    Adjust your filters or try searching again.
                  </p>
                </div>
              ) : (
                <div className="h-full">
                  <EmptyState
                    onUpload={() => uploadHandlers.fileInputRef.current?.click()}
                    dragActive={dragAndDrop.dragActive}
                    onCreateFolder={() => modalState.setCreateFolderModalOpen(true)}
                  />
                </div>
              )
            ) : (
              <ScrollArea className="h-full">
                <div className="p-6">
                  {viewMode === "list" ? (
                     <ListView
                      selectedIds={selectedIds}
                      onSelectItem={handleItemSelection}
                      items={sortedItems} // ✅ Pass sortedItems
                      sortField={sortField} // ✅ Pass sort state
                      sortOrder={sortOrder}
                      onSort={handleSort} // ✅ Pass sort handler
                      onItemClick={(item) => itemActions.handleItemClick(item, clearSelection)}
                      onRename={itemActions.handleRename}
                      onDelete={itemActions.handleDelete}
                      onDownload={itemActions.handleDownload}
                      onShowInfo={itemActions.handleShowInfo}
                      onAddTags={itemActions.handleAddTags}
                      onReupload={uploadHandlers.handleReupload}
                      onShare={itemActions.handleShare}
                      
                    />
                  ) : (
                    <GridView
                      items={sortedItems} // ✅ Pass sortedItems instead of items
                      selectedIds={selectedIds}
                      onSelectItem={handleItemSelection}
                      onItemClick={(item) => itemActions.handleItemClick(item, clearSelection)}
                      onRename={itemActions.handleRename}
                      onDelete={itemActions.handleDelete}
                      onDownload={itemActions.handleDownload}
                      onShowInfo={itemActions.handleShowInfo}
                      onAddTags={itemActions.handleAddTags}
                      onReupload={uploadHandlers.handleReupload}
                    />
                  )}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Hidden file inputs */}
          <input
            ref={uploadHandlers.fileInputRef}
            type="file"
            multiple
            accept={uploadHandlers.ALLOWED_EXTENSIONS.join(",")}
            onChange={(e) => {
              uploadHandlers.handleFileUpload(e.target.files);
              e.target.value = "";
            }}
            className="hidden"
          />

          <input
            ref={uploadHandlers.reuploadInputRef}
            type="file"
            accept={uploadHandlers.ALLOWED_EXTENSIONS.join(",")}
            onChange={uploadHandlers.handleReuploadFileChange}
            className="hidden"
          />

          <input
            ref={uploadHandlers.folderInputRef}
            type="file"
            multiple
            onChange={(e) => {
              uploadHandlers.handleFolderUpload(e.target.files);
              e.target.value = "";
            }}
            className="hidden"
          />
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
      <CreateFolderModal
        open={modalState.createFolderModalOpen}
        onOpenChange={modalState.setCreateFolderModalOpen}
        onConfirm={async (data) => {
          try {
            await createFolderMutation.mutateAsync({
              ...data,
              parent_id: parentId || "",
            });
            modalState.setCreateFolderModalOpen(false);
          } catch (error) {
            console.error("Failed to create folder:", error);
          }
        }}
        isLoading={createFolderMutation.isPending}
      />

      <RenameDocumentModal
        open={modalState.renameModalOpen && !isFolder(modalState.selectedItem)}
        onOpenChange={modalState.setRenameModalOpen}
        item={modalState.selectedItem}
        onConfirm={async (data) => {
          if (modalState.selectedItem) {
            try {
              await updateDocumentMutation.mutateAsync({
                id: modalState.selectedItem._id,
                name: data.name,
                description: data.description,
              });
              modalState.setRenameModalOpen(false);
            } catch (error) {
              console.error("Failed to rename document:", error);
            }
          }
        }}
        isLoading={updateDocumentMutation.isPending}
      />

      <RenameFolderModal
        open={modalState.renameModalOpen && isFolder(modalState.selectedItem)}
        onOpenChange={modalState.setRenameModalOpen}
        item={modalState.selectedItem}
        onConfirm={async (data) => {
          if (modalState.selectedItem) {
            try {
              await updateFolderMutation.mutateAsync({
                id: modalState.selectedItem._id,
                name: data.name,
                color: data.color,
              });
              modalState.setRenameModalOpen(false);
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
        isLoading={deleteFolderMutation.isPending || deleteDocumentMutation.isPending}
      />

      <DepartmentModal
        open={modalState.departmentModalOpen}
        onOpenChange={(open) => {
          modalState.setDepartmentModalOpen(open);
          if (!open) {
            modalState.closeDepartmentModal();
          }
        }}
        mode={modalState.departmentModalMode}
        department={modalState.selectedDepartment}
        onSubmit={handleDepartmentSubmit}
        isLoading={updateDepartmentMutation.isPending}
      />

      <TagsModal
        open={modalState.tagsModalOpen}
        onOpenChange={modalState.setTagsModalOpen}
        item={modalState.selectedItem}
        onConfirm={async (tags) => {
          if (modalState.selectedItem) {
            try {
              await addTagsMutation.mutateAsync({
                id: modalState.selectedItem._id,
                tags,
              });
              modalState.setTagsModalOpen(false);
            } catch (error) {
              console.error("Failed to add tags:", error);
            }
          }
        }}
        isLoading={addTagsMutation.isPending}
      />


      <ShareModal isOpen={modalState.shareModalOpen} item={modalState.selectedItem}  onOpenChange={modalState.openShareModal}  />
    </div>
  );
}
