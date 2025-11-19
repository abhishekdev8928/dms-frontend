import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  List,
  Grid3x3,
  Info,
  ChevronRight,
  FolderPlus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { Edit, Download, Share2, Trash2 } from "lucide-react";

import EmptyState from "@/components/custom/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb as BreadcrumbComponent,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

import { getChildFolders } from "@/config/api/folderApi";
import { getBreadcrumbs } from "@/config/api/treeApi";
import { generateDownloadUrl } from "@/config/api/documentApi";
import { getAllUsers } from "@/config/api/searchApi";
import {
  uploadFiles,
  validateFiles,
  ALLOWED_EXTENSIONS,
} from "@/utils/helper/fileUploadHelper";
import { validateFile } from "@/utils/helper/fileReuploadHelper";
import { uploadFolder } from "@/utils/helper/folderUploadHelper";

import { useFolderMutations } from "@/hooks/useFolderMutations";
import { useDocumentMutations } from "@/hooks/useDocumentMutations";
import FileInfoPanel from "@/components/custom/FileInfoPanel";
import GridView from "@/components/RightPanelView/Views/GridView";
import ListView from "@/components/RightPanelView/Views/ListView";
import RenameFolderModal from "@/components/RightPanelView/Modals/RenameFolderModal";
import TagsModal from "@/components/RightPanelView/Modals/TagsModal";
import DeleteModal from "@/components/RightPanelView/Modals/DeleteModal";
import FilterButtons from "./FilterBox";
import CreateFolderModal from "@/components/RightPanelView/Modals/CreateFolderModal";
import RenameDocumentModal from "@/components/RightPanelView/Modals/RenameDocumentModal";

import type { FileItem, Breadcrumb } from "@/types/fileSystem";
import { BulkActionToolbar } from "@/components/custom/BulkActionToolbar";
import { bulkDeleteion } from "@/config/api/commonApi";
import { DepartmentModal } from "@/components/RightPanelView/Modals/DepartmentModal";
import type { Department } from "@/config/api/departmentApi";
import { useDepartmentMutation } from "@/hooks/Mutation/useDepartmentMutation";

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
  const [reuploadDocumentId, setReuploadDocumentId] = useState<string | null>(
    null
  );
  const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);

  const { updateMutation } = useDepartmentMutation();

  // Modal states
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tagsModalOpen, setTagsModalOpen] = useState(false);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [departmentModalOpen, setDepartmentModalOpen] = useState(false);
  const [departmentModalMode, setDepartmentModalMode] = useState<
    "add" | "edit"
  >("add");
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reuploadInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const [selectedIds, setSelectedIds] = useState<{
    fileIds: string[];
    folderIds: string[];
  }>({
    fileIds: [],
    folderIds: [],
  });
  const handleDepartmentSubmit = (data: any) => {
    if (selectedDepartment?._id) {
      updateMutation.mutate(
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

  const getSelectedItemDetails = (selectedIds: { fileIds: string[]; folderIds: string[] }, items: FileItem[]) => {
  const totalSelected = selectedIds.fileIds.length + selectedIds.folderIds.length;
  
  if (totalSelected !== 1) return null;
  
  // Find the single selected item
  const selectedId = selectedIds.fileIds[0] || selectedIds.folderIds[0];
  const selectedItem = items.find(item => item._id === selectedId);
  
  return selectedItem || null;
};
  const handleItemSelection = (
  e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  item: { id: string; type: string }
): void => {
  const key = item.type === "folder" ? "folderIds" : "fileIds";

  if (e.ctrlKey || e.metaKey) {
    setSelectedIds((prev) => {
      const exists = prev[key].includes(item.id);

      return {
        ...prev,
        [key]: exists
          ? prev[key].filter((id) => id !== item.id) // remove
          : [...prev[key], item.id], // add
      };
    });
  } else {
    // SINGLE SELECT
    const newSelectedIds = {
      fileIds: item.type !== "folder" ? [item.id] : [],
      folderIds: item.type === "folder" ? [item.id] : [],
    };
    setSelectedIds(newSelectedIds);
    
    // Auto-show info panel when single item is selected
    const selectedItem = items.find(i => i._id === item.id);
    if (selectedItem) {
      setSelectedItem(selectedItem);
      setSelectedFileId(item.id);
      setShowInfoPanel(true);
    }
  }
};

  // Queries
  const {
    data: childrenData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["children", parentId, selectedTypeFilter, selectedUser],
    queryFn: async () => {
      const res = await getChildFolders(parentId || "", {
        type: selectedTypeFilter || undefined,
        userEmail: selectedUser || undefined,
      });
      return structuredClone(res);
    },
    enabled: !!parentId,
  });

  const { data: breadcrumbsData } = useQuery({
    queryKey: ["breadcrumbs", parentId],
    queryFn: () => getBreadcrumbs(parentId || ""),
    enabled: !!parentId,
  });

  const { data: usersData } = useQuery({
    queryKey: ["userList"],
    queryFn: getAllUsers,
  });

  // Data
  const items: FileItem[] = childrenData?.children || [];
  const breadcrumbs: Breadcrumb[] = Array.isArray(breadcrumbsData)
    ? breadcrumbsData
    : breadcrumbsData?.data || [];
  const isEmpty = items.length === 0;

  // Mutations - Pass breadcrumbs to the hook
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

  // Event Handlers
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
          console.log(
            `${progress.stage}: ${progress.current}/${progress.total}`
          );
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
  setSelectedItem(item); // Add this
  setShowInfoPanel(true);
};

  const handleItemClick = (item: FileItem) => {
    if (item.type === "folder") {
      navigate(`/dashboard/folder/${item._id}`);
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

  const handleAddTags = (item: FileItem) => {
    setSelectedItem(item);
    setTagsModalOpen(true);
  };

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

  // Action handlers
  const handleCreateFolderClick = () => {
    setActionsDropdownOpen(false);
    setCreateFolderModalOpen(true);
  };

  // const handleFileUploadClick = () => {
  //   setActionsDropdownOpen(false);
  //   fileInputRef.current?.click();
  // };

  // const handleFolderUploadClick = () => {
  //   setActionsDropdownOpen(false);
  //   folderInputRef.current?.click();
  // };

  const BulkActionToolBarProps = {
    onClearSelection: () =>
      setSelectedIds({
        fileIds: [],
        folderIds: [],
      }),
    selectionCount: selectedIds.fileIds.length + selectedIds.folderIds.length,
    onDeleteSelected: () => bulkDeletionMutation.mutate(selectedIds),
  };

  const muatate = useMutation({
    mutationFn: bulkDeleteion,
    onSuccess: (res) => console.log(res),
    onError: (error) => console.log(error),
  });

  React.useEffect(() => {
  const totalSelected = selectedIds.fileIds.length + selectedIds.folderIds.length;
  
  if (totalSelected === 1) {
    // Show info panel for single selection
    const selectedId = selectedIds.fileIds[0] || selectedIds.folderIds[0];
    const selectedItem = items.find(item => item._id === selectedId);
    
    if (selectedItem) {
      setSelectedItem(selectedItem);
      setSelectedFileId(selectedId);
      setShowInfoPanel(true);
    }
  } else if (totalSelected > 1) {
    // Hide info panel for multiple selections
    setShowInfoPanel(false);
    setSelectedItem(null);
    setSelectedFileId(null);
  } else {
    // No selection - optionally hide panel
    // setShowInfoPanel(false);
    // setSelectedItem(null);
    // setSelectedFileId(null);
  }
}, [selectedIds, items]);

  return (
    <div className="h-full flex">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <BreadcrumbComponent>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb._id}>
                  {index > 0 && (
                    <BreadcrumbSeparator>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </BreadcrumbSeparator>
                  )}
                  <BreadcrumbItem>
                    {index === breadcrumbs.length - 1 ? (
                      <div className="flex items-center gap-2">
                        <BreadcrumbPage className="text-gray-900 text-[24px] font-normal">
                          {crumb.name}
                        </BreadcrumbPage>
                        <DropdownMenu
                          open={actionsDropdownOpen}
                          onOpenChange={setActionsDropdownOpen}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 hover:bg-gray-100 rounded"
                            >
                              {actionsDropdownOpen ? (
                                <ChevronUp className="w-4 h-4 text-gray-600" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            className="w-[220px]"
                          >
                            <DropdownMenuItem
                              className="py-2 cursor-pointer"
                              onClick={handleCreateFolderClick}
                            >
                              <FolderPlus className="w-4 h-4 mr-2 text-gray-600" />
                              <span className="text-sm">Create Folder</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              className="py-2 cursor-pointer"
                              onClick={() => {
                                if (breadcrumbs.length > 0) {
                                  const currentCrumb =
                                    breadcrumbs[breadcrumbs.length - 1];

                                  // Check the type and open appropriate modal
                                  if (currentCrumb.type === "department") {
                                    // Open department modal in edit mode
                                    setDepartmentModalMode("edit");
                                    setSelectedDepartment({
                                      _id: currentCrumb._id,
                                      name: currentCrumb.name,
                                    } as Department);
                                    setDepartmentModalOpen(true);
                                  } else if (currentCrumb.type === "folder") {
                                    // Open folder rename modal
                                    handleRename({
                                      _id: currentCrumb._id,
                                      name: currentCrumb.name,
                                      type: "folder",
                                    } as FileItem);
                                  }

                                  setActionsDropdownOpen(false);
                                }
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2 text-gray-600" />
                              <span className="text-sm">
                                Rename{" "}
                                {crumb.type === "department"
                                  ? "Department"
                                  : "Folder"}
                              </span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="py-2 cursor-pointer opacity-50 cursor-not-allowed"
                              disabled
                            >
                              <Download className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="text-sm text-gray-400">
                                Download (Coming Soon)
                              </span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="py-2 cursor-pointer opacity-50 cursor-not-allowed"
                              disabled
                            >
                              <Share2 className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="text-sm text-gray-400">
                                Share (Coming Soon)
                              </span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              className="py-2 cursor-pointer text-red-600 hover:text-red-700 focus:text-red-700"
                              onClick={() => {
                                if (breadcrumbs.length > 0) {
                                  const currentCrumb =
                                    breadcrumbs[breadcrumbs.length - 1];
                                  handleDelete({
                                    _id: currentCrumb._id,
                                    name: currentCrumb.name,
                                    type: "folder",
                                  } as FileItem);
                                  setActionsDropdownOpen(false);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              <span className="text-sm">Move to Trash</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ) : (
                      <BreadcrumbLink
                        asChild
                        className="text-gray-700 text-[24px] hover:text-teal-600 transition-colors font-normal cursor-pointer"
                        onClick={() => handleBreadcrumbClick(crumb._id)}
                      >
                        <span>{crumb.name}</span>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </BreadcrumbComponent>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className={
                viewMode === "list" ? "bg-teal-500 hover:bg-teal-600" : ""
              }
            >
              <List className="w-5 h-5" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className={
                viewMode === "grid" ? "bg-teal-500 hover:bg-teal-600" : ""
              }
            >
              <Grid3x3 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowInfoPanel(!showInfoPanel)}
              className={showInfoPanel ? "bg-gray-100" : ""}
            >
              <Info className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="right-panel-filter">
          {selectedIds.fileIds.length > 0 ||
          selectedIds.folderIds.length > 0 ? (
            <BulkActionToolbar {...BulkActionToolBarProps} />
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

        {/* Content */}
        <div
          className="flex-1 relative"
          onDragEnter={isEmpty ? handleDrag : undefined}
          onDragLeave={isEmpty ? handleDrag : undefined}
          onDragOver={isEmpty ? handleDrag : undefined}
          onDrop={isEmpty ? handleDrop : undefined}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-gray-500">
              Loading...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
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
              <div className="flex flex-col items-center justify-center py-24 text-center text-gray-600">
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
              <EmptyState
                onUpload={() => fileInputRef.current?.click()}
                dragActive={dragActive}
                onCreateFolder={() => setCreateFolderModalOpen(true)}
              />
            )
          ) : (
            <ScrollArea className="h-full w-full">
              <div className="p-4">
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
          // @ts-ignore
          webkitdirectory=""
          directory=""
          multiple
          onChange={(e) => {
            handleFolderUpload(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
        />
      </div>

     {showInfoPanel && selectedItem && (
  selectedIds.fileIds.length + selectedIds.folderIds.length === 1 ? (
    <FileInfoPanel
      item={selectedItem}
      onClose={() => {
        setShowInfoPanel(false);
        setSelectedFileId(null);
        setSelectedItem(null);
        // Optionally clear selection
        setSelectedIds({ fileIds: [], folderIds: [] });
      }}
    />
  ) : null
)}

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
        onConfirm={() => {
          if (selectedItem) {
            if (isFolder(selectedItem)) {
              deleteFolderMutation.mutate(selectedItem._id);
            } else {
              deleteDocumentMutation.mutate(selectedItem._id);
            }
            setDeleteModalOpen(false);
          }
        }}
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
        isLoading={updateMutation.isPending}
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
