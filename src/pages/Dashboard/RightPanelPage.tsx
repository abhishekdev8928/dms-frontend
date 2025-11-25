import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { List, Grid3x3, Info } from "lucide-react";

import EmptyState from "@/components/RightPanelView/EmptyState";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import { generateDownloadUrl } from "@/config/api/documentApi";
import {
  uploadFiles,
  validateFiles,
  ALLOWED_EXTENSIONS,
} from "@/utils/helper/fileUploadHelper";
import { validateFile } from "@/utils/helper/fileReuploadHelper";
import { uploadFolder } from "@/utils/helper/folderUploadHelper";

import { useFolderMutations } from "@/hooks/mutations/useFolderMutations";
import { useDocumentMutations } from "@/hooks/mutations/useDocumentMutations";
import { useFolderQueries } from "@/hooks/queries/useFolderQueries";
import { useUserQueries } from "@/hooks/queries/useUserQueries";
import { useDepartmentMutation } from "@/hooks/mutations/useDepartmentMutation";

import FileInfoPanel from "@/components/RightPanelView/ResourcePreviewPanel";
import GridView from "@/components/RightPanelView/ResourceView/GridView";
import ListView from "@/components/RightPanelView/ResourceView/ListView";
import RenameFolderModal from "@/components/Modals/RenameFolderModal";
import TagsModal from "@/components/Modals/TagsModal";
import DeleteModal from "@/components/Modals/DeleteModal";
import FilterButtons from "./FilterBox";
import CreateFolderModal from "@/components/Modals/CreateFolderModal";
import RenameDocumentModal from "@/components/Modals/RenameDocumentModal";
import { BreadcrumbNavigation } from "@/components/RightPanelView/BreadcrumbNavigation";

import type { FileItem } from "@/types/documentTypes";
import { BulkActionToolbar } from "@/components/RightPanelView/Actions/BulkActionToolbar";
import { DepartmentModal } from "@/components/Modals/DepartmentModal";
import type { Department } from "@/config/api/departmentApi";

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

export default function RightPanelView() {
  const { parentId } = useParams<{ parentId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [reuploadDocumentId, setReuploadDocumentId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);

  // Modal states
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tagsModalOpen, setTagsModalOpen] = useState(false);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [departmentModalOpen, setDepartmentModalOpen] = useState(false);
  const [departmentModalMode, setDepartmentModalMode] = useState<"add" | "edit">("add");
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reuploadInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Selection state with anchor for shift-select
  const [selectedIds, setSelectedIds] = useState<{
    fileIds: string[];
    folderIds: string[];
  }>({
    fileIds: [],
    folderIds: [],
  });
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  // Custom hooks
  const { updateMutation: updateDepartmentMutation } = useDepartmentMutation();

  // Fetch folder children and breadcrumbs
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

  // Fetch users for filter dropdown
  const { usersData } = useUserQueries();

  const { createFolderMutation, updateFolderMutation, deleteFolderMutation } =
    useFolderMutations(parentId, breadcrumbs);

  const {
    reuploadMutation,
    updateDocumentMutation,
    deleteDocumentMutation,
    addTagsMutation,
    bulkDeletionMutation,
  } = useDocumentMutations(
    parentId,
    selectedFileId,
    reuploadDocumentId,
    setReuploadDocumentId
  );

  // Computed values
  const isEmpty = items.length === 0;

  // Department handlers
  const handleDepartmentSubmit = (data: any) => {
    if (selectedDepartment?._id) {
      updateDepartmentMutation.mutate(
        {
          id: selectedDepartment._id,
          data: { name: data.name },
        },
        {
          onSuccess: () => {
            setDepartmentModalOpen(false);
            setSelectedDepartment(null);
          },
        }
      );
    }
  };

  const handleEditDepartment = (department: Department) => {
    setDepartmentModalMode("edit");
    setSelectedDepartment(department);
    setDepartmentModalOpen(true);
  };

  // Enhanced selection handler with shift multiselect
  const handleItemSelection = (
    e: React.MouseEvent<HTMLDivElement | HTMLTableRowElement, MouseEvent>,
    item: { id: string; type: string },
    itemIndex: number
  ): void => {
    const key = item.type === "folder" ? "folderIds" : "fileIds";

    // Shift + Click: Range selection
    if (e.shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, itemIndex);
      const end = Math.max(lastSelectedIndex, itemIndex);
      
      const rangeItems = items.slice(start, end + 1);
      const newFileIds: string[] = [];
      const newFolderIds: string[] = [];

      rangeItems.forEach((rangeItem) => {
        if (rangeItem.type === "folder") {
          newFolderIds.push(rangeItem._id);
        } else {
          newFileIds.push(rangeItem._id);
        }
      });

      setSelectedIds({
        fileIds: [...new Set([...selectedIds.fileIds, ...newFileIds])],
        folderIds: [...new Set([...selectedIds.folderIds, ...newFolderIds])],
      });
    }
    // Ctrl/Cmd + Click: Toggle individual item
    else if (e.ctrlKey || e.metaKey) {
      setSelectedIds((prev) => {
        const exists = prev[key].includes(item.id);
        return {
          ...prev,
          [key]: exists
            ? prev[key].filter((id) => id !== item.id)
            : [...prev[key], item.id],
        };
      });
      setLastSelectedIndex(itemIndex);
    }
    // Regular click: Select single item (set anchor)
    else {
      const newSelectedIds = {
        fileIds: item.type !== "folder" ? [item.id] : [],
        folderIds: item.type === "folder" ? [item.id] : [],
      };
      setSelectedIds(newSelectedIds);
      setLastSelectedIndex(itemIndex);
    }
  };

  // File upload handlers
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
      await uploadFiles(validFiles, {
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
      await uploadFolder(validFiles, {
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

  // Item action handlers
  const handleDownload = async (item: FileItem) => {
    try {
      const response = await generateDownloadUrl(item._id);
      window.open(response?.data?.url, "_blank");
      toast.success("Download started", {
        description: getFormattedDateTime(),
      });
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download failed", {
        description: getFormattedDateTime(),
      });
    }
  };

  const handleShowInfo = (item: FileItem) => {
    setSelectedFileId(item._id);
    setSelectedItem(item);
    setShowInfoPanel(true);
  };

  const handleItemClick = (item: FileItem) => {
    if (item.type === "folder") {
      navigate(`/dashboard/folder/${item._id}`);
      setSelectedIds({
        fileIds: [],
        folderIds: [],
      });
      setLastSelectedIndex(null);
    }
  };

  const handleRename = (item: FileItem) => {
    setSelectedItem(item);
    setRenameModalOpen(true);
  };

  const handleDelete = (item: FileItem) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedItem) {
      if (isFolder(selectedItem)) {
        deleteFolderMutation.mutate(selectedItem._id, {
          onSuccess: () => {
            toast.success("Item moved to trash", {
              description: `"${selectedItem.name}" has been moved to trash`,
            });
            setDeleteModalOpen(false);
          },
          onError: (error) => {
            toast.error("Failed to delete", {
              description: error?.message || "Please try again",
            });
          },
        });
      } else {
        deleteDocumentMutation.mutate(selectedItem._id, {
          onSuccess: () => {
            toast.success("Item moved to trash", {
              description: `"${selectedItem.name}" has been moved to trash`,
            });
            setDeleteModalOpen(false);
          },
          onError: (error) => {
            toast.error("Failed to delete", {
              description: error?.message || "Please try again",
            });
          },
        });
      }
    }
  };

  const handleAddTags = (item: FileItem) => {
    setSelectedItem(item);
    setTagsModalOpen(true);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleBreadcrumbClick = (id: string) => {
    navigate(`/dashboard/folder/${id}`);
  };

  const isFolder = (item: FileItem | null): boolean =>
    item !== null && item.type === "folder";

  // Bulk action props
  const bulkActionToolBarProps = {
    onClearSelection: () => {
      setSelectedIds({
        fileIds: [],
        folderIds: [],
      });
      setLastSelectedIndex(null);
    },
    selectionCount: selectedIds.fileIds.length + selectedIds.folderIds.length,
    onDeleteSelected: () => {
      bulkDeletionMutation.mutate(selectedIds);
      setSelectedIds({
        fileIds: [],
        folderIds: [],
      });
      setLastSelectedIndex(null);
    },
  };

  // Effect to update selected item
  React.useEffect(() => {
    const totalSelected = selectedIds.fileIds.length + selectedIds.folderIds.length;

    if (totalSelected === 1) {
      const selectedId = selectedIds.fileIds[0] || selectedIds.folderIds[0];
      const selectedItem = items.find((item) => item._id === selectedId);

      if (selectedItem) {
        setSelectedItem(selectedItem);
        setSelectedFileId(selectedId);
      }
    } else {
      setSelectedItem(null);
      setSelectedFileId(null);
    }
  }, [selectedIds, items]);

  return (
    <div className="h-full flex flex-col py-4 pe-4">
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden">
          {/* Header - Fixed */}
          <div className="flex-shrink-0 p-6 pt-3 ">
            <div className="flex items-center justify-between mb-4">
              <BreadcrumbNavigation
                breadcrumbs={breadcrumbs}
                onBreadcrumbClick={handleBreadcrumbClick}
                onCreateFolder={() => setCreateFolderModalOpen(true)}
                onRename={handleRename}
                onDelete={handleDelete}
                onEditDepartment={handleEditDepartment}
              />

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0 ">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className={
                    viewMode === "list" ? "bg-[#035C4C]  hover:bg-[#035C4C] rounded-e-[0px] border border-[#035C4C] py-5 px-5 border-2" : "border-2 rounded-e-[0px] border-[#434343] py-5 px-5"
                  }
                >
                  <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1H1.01M1 8H1.01M1 15H1.01M6 1H19M6 8H19M6 15H19" stroke={  viewMode === "list" ? "white" : "black"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={
                    viewMode === "grid" ? "bg-[#035C4C] hover:bg-[#035C4C]-600 rounded-s-[0px] border-[#035C4C] py-5 px-5 border-2" : " border-2 py-5 px-5 rounded-s-[0px] border-[#434343]"
                  }
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 1H2C1.44772 1 1 1.44772 1 2V7C1 7.55228 1.44772 8 2 8H7C7.55228 8 8 7.55228 8 7V2C8 1.44772 7.55228 1 7 1Z" stroke={  viewMode === "list" ? "black" : "white"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18 1H13C12.4477 1 12 1.44772 12 2V7C12 7.55228 12.4477 8 13 8H18C18.5523 8 19 7.55228 19 7V2C19 1.44772 18.5523 1 18 1Z" stroke={  viewMode === "list" ? "black" : "white"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18 12H13C12.4477 12 12 12.4477 12 13V18C12 18.5523 12.4477 19 13 19H18C18.5523 19 19 18.5523 19 18V13C19 12.4477 18.5523 12 18 12Z" stroke={  viewMode === "list" ? "black" : "white"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 12H2C1.44772 12 1 12.4477 1 13V18C1 18.5523 1.44772 19 2 19H7C7.55228 19 8 18.5523 8 18V13C8 12.4477 7.55228 12 7 12Z" stroke={  viewMode === "list" ? "black" : "white"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowInfoPanel(!showInfoPanel)}
                  className={showInfoPanel ? "bg-gray-100" : ""}
                >
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 15V11M11 7H11.01M21 11C21 16.5228 16.5228 21 11 21C5.47715 21 1 16.5228 1 11C1 5.47715 5.47715 1 11 1C16.5228 1 21 5.47715 21 11Z" stroke="#434343" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="right-panel-filter">
              {selectedIds.fileIds.length > 0 || selectedIds.folderIds.length > 0 ? (
                <BulkActionToolbar {...bulkActionToolBarProps} />
              ) : (
                <FilterButtons
                  selectedTypeFilter={selectedTypeFilter}
                  setSelectedTypeFilter={setSelectedTypeFilter}
                  selectedUser={selectedUser}
                  setSelectedUser={setSelectedUser}
                  userData={usersData}
                />
              )}
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div
          className="flex-1 overflow-hidden"
          onDragEnter={isEmpty ? handleDrag : undefined}
          onDragLeave={isEmpty ? handleDrag : undefined}
          onDragOver={isEmpty ? handleDrag : undefined}
          onDrop={isEmpty ? handleDrop : undefined}
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
              selectedTypeFilter?.trim() !== "" ||
              selectedUser?.trim() !== "" ? (
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
                    onUpload={() => fileInputRef.current?.click()}
                    dragActive={dragActive}
                    onCreateFolder={() => setCreateFolderModalOpen(true)}
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
                      items={items}
                      onItemClick={handleItemClick}
                      onRename={handleRename}
                      onDelete={handleDelete}
                      onDownload={handleDownload}
                      onShowInfo={handleShowInfo}
                      onAddTags={handleAddTags}
                      onReupload={handleReupload}
                    />
                  ) : (
                    <GridView
                      items={items}
                      selectedIds={selectedIds}
                      onSelectItem={handleItemSelection}
                      onItemClick={handleItemClick}
                      onRename={handleRename}
                      onDelete={handleDelete}
                      onDownload={handleDownload}
                      onShowInfo={handleShowInfo}
                      onAddTags={handleAddTags}
                      onReupload={handleReupload}
                    />
                  )}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ALLOWED_EXTENSIONS.join(",")}
            onChange={(e) => {
              handleFileUpload(e.target.files);
              e.target.value = "";
            }}
            className="hidden"
          />

          <input
            ref={reuploadInputRef}
            type="file"
            accept={ALLOWED_EXTENSIONS.join(",")}
            onChange={handleReuploadFileChange}
            className="hidden"
          />

          <input
            ref={folderInputRef}
            type="file"
            multiple
            onChange={(e) => {
              handleFolderUpload(e.target.files);
              e.target.value = "";
            }}
            className="hidden"
          />
        </div>

        {/* Info Panel - Fixed Width */}
        {showInfoPanel && (
          <div className="w-[350px] flex-shrink-0 h-full overflow-hidden">
            <FileInfoPanel
              item={selectedItem}
              selectionCount={
                selectedIds.fileIds.length + selectedIds.folderIds.length
              }
              onClose={() => {
                setShowInfoPanel(false);
              }}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateFolderModal
        open={createFolderModalOpen}
        onOpenChange={setCreateFolderModalOpen}
        onConfirm={async (data) => {
          try {
            await createFolderMutation.mutateAsync({
              ...data,
              parent_id: parentId || "",
            });
            setCreateFolderModalOpen(false);
          } catch (error) {
            console.error("Failed to create folder:", error);
          }
        }}
        isLoading={createFolderMutation.isPending}
      />

      <RenameDocumentModal
        open={renameModalOpen && !isFolder(selectedItem)}
        onOpenChange={setRenameModalOpen}
        item={selectedItem}
        onConfirm={async (data) => {
          if (selectedItem) {
            try {
              await updateDocumentMutation.mutateAsync({
                id: selectedItem._id,
                name: data.name,
                description: data.description,
              });
              setRenameModalOpen(false);
            } catch (error) {
              console.error("Failed to rename document:", error);
            }
          }
        }}
        isLoading={updateDocumentMutation.isPending}
      />

      <RenameFolderModal
        open={renameModalOpen && isFolder(selectedItem)}
        onOpenChange={setRenameModalOpen}
        item={selectedItem}
        onConfirm={async (data) => {
          if (selectedItem) {
            try {
              await updateFolderMutation.mutateAsync({
                id: selectedItem._id,
                name: data.name,
                color: data.color,
              });
              setRenameModalOpen(false);
            } catch (error) {
              console.error("Failed to rename folder:", error);
            }
          }
        }}
        isLoading={updateFolderMutation.isPending}
      />

      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        item={selectedItem}
        onConfirm={handleDeleteConfirm}
        isLoading={
          deleteFolderMutation.isPending || deleteDocumentMutation.isPending
        }
      />

      <DepartmentModal
        open={departmentModalOpen}
        onOpenChange={(open) => {
          setDepartmentModalOpen(open);
          if (!open) {
            setSelectedDepartment(null);
          }
        }}
        mode={departmentModalMode}
        department={selectedDepartment}
        onSubmit={handleDepartmentSubmit}
        isLoading={updateDepartmentMutation.isPending}
      />

      <TagsModal
        open={tagsModalOpen}
        onOpenChange={setTagsModalOpen}
        item={selectedItem}
        onConfirm={async (tags) => {
          if (selectedItem) {
            try {
              await addTagsMutation.mutateAsync({ id: selectedItem._id, tags });
              setTagsModalOpen(false);
            } catch (error) {
              console.error("Failed to add tags:", error);
            }
          }
        }}
        isLoading={addTagsMutation.isPending}
      />
    </div>
  );
}