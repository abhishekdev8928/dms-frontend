import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  List,
  Grid3x3,
  Info,
  Upload,
  ChevronRight,
  FolderPlus,
  ChevronDown,
  ChevronUp,
  FileText,
  FolderUp,
} from "lucide-react";
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

import { useFolderMutations } from "@/hooks/mutations/useFolderMutations";
import { useDocumentMutations } from "@/hooks/mutations/useDocumentMutations";
import FileInfoPanel from "@/components/RightPanelView/ResourcePreviewPanel";
import GridView from "@/components/RightPanelView/ResourceView/GridView";
import ListView from "@/components/RightPanelView/ResourceView/ListView";
import RenameFolderModal from "@/components/Modals/RenameFolderModal";
import TagsModal from "@/components/Modals/TagsModal";
import DeleteModal from "@/components/Modals/DeleteModal";
import FilterButtons from "./FilterBox";
import CreateFolderModal from "@/components/Modals/CreateFolderModal";
import RenameDocumentModal from "@/components/Modals/RenameDocumentModal";

import type { FileItem, Breadcrumb } from "@/types/documentTypes";

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
  const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);


  // Modal states
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tagsModalOpen, setTagsModalOpen] = useState(false);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reuploadInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data: childrenData, isLoading, error } = useQuery({
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

  // Mutations
  const { createFolderMutation, updateFolderMutation, deleteFolderMutation } =
    useFolderMutations(parentId);

  const {
    reuploadMutation,
    updateDocumentMutation,
    deleteDocumentMutation,
    addTagsMutation,
  } = useDocumentMutations(
    parentId,
    selectedFileId,
    reuploadDocumentId,
    setReuploadDocumentId
  );

  // Data
  const items: FileItem[] = childrenData?.children || [];
  const breadcrumbs: Breadcrumb[] = Array.isArray(breadcrumbsData)
    ? breadcrumbsData
    : breadcrumbsData?.data || [];
  const isEmpty = items.length === 0;

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

    const loadingToast = toast.loading(
      `Uploading ${validFiles.length} file(s)...`,
      { description: getFormattedDateTime() }
    );

    try {
      await uploadFiles(validFiles, {
        parentId,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["children", parentId] });
          queryClient.invalidateQueries({ queryKey: ["tree"] });
          toast.dismiss(loadingToast);
          toast.success(`${validFiles.length} file(s) uploaded successfully`, {
            description: getFormattedDateTime(),
          });
        },
        onError: (error) => {
          console.error("Upload error:", error);
          toast.dismiss(loadingToast);
          toast.error("Upload failed", {
            description: error?.message || getFormattedDateTime(),
          });
        },
      });
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast.dismiss(loadingToast);
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

    const loadingToast = toast.loading("Uploading folder...", {
      description: getFormattedDateTime(),
    });

    try {
      await uploadFolder(validFiles, {
        parentId,
        onProgress: (progress) => {
          console.log(`${progress.stage}: ${progress.current}/${progress.total}`);
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["children", parentId] });
          queryClient.invalidateQueries({ queryKey: ["tree"] });
          toast.dismiss(loadingToast);
          toast.success("Folder uploaded successfully", {
            description: getFormattedDateTime(),
          });
        },
      });
    } catch (error: any) {
      console.error("Folder upload failed:", error);
      toast.dismiss(loadingToast);
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

  const handleShowInfo = (fileId: string) => {
    setSelectedFileId(fileId);
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

  const handleFileUploadClick = () => {
    setActionsDropdownOpen(false);
    fileInputRef.current?.click();
  };

  const handleFolderUploadClick = () => {
    setActionsDropdownOpen(false);
    folderInputRef.current?.click();
  };

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
                          <DropdownMenuContent align="start" className="w-[220px]">
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
                              onClick={handleFileUploadClick}
                            >
                              <FileText className="w-4 h-4 mr-2 text-gray-600" />
                              <span className="text-sm">Upload Files</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="py-2 cursor-pointer"
                              onClick={handleFolderUploadClick}
                            >
                              <FolderUp className="w-4 h-4 mr-2 text-gray-600" />
                              <span className="text-sm">Upload Folder</span>
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

        {/* Filters */}
        <div className="right-panel-filter">
          <FilterButtons
            selectedTypeFilter={selectedTypeFilter}
            setSelectedTypeFilter={setSelectedTypeFilter}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            userData={usersData}
          />
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
            selectedTypeFilter && selectedTypeFilter.trim() !== "" ? (
              <div className="flex flex-col items-center justify-center py-24 text-center text-gray-600">
                <img
                  src="/no-results.svg"
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

      {/* Info Panel */}
      {showInfoPanel && (
        <FileInfoPanel
          fileId={selectedFileId}
          onClose={() => {
            setShowInfoPanel(false);
            setSelectedFileId(null);
          }}
        />
      )}

      {/* Modals */}
      <CreateFolderModal
        open={createFolderModalOpen}
        onOpenChange={setCreateFolderModalOpen}
        onConfirm={(data) =>
          createFolderMutation.mutate({ ...data, parent_id: parentId || "" })
        }
        isLoading={createFolderMutation.isPending}
      />

      <RenameFolderModal
        open={renameModalOpen && isFolder(selectedItem)}
        onOpenChange={setRenameModalOpen}
        item={selectedItem}
        onConfirm={(data) => {
          if (selectedItem) {
            updateFolderMutation.mutate({
              id: selectedItem._id,
              name: data.name,
              color: data.color,
            });
            setRenameModalOpen(false);
          }
        }}
        isLoading={updateFolderMutation.isPending}
      />

      <RenameDocumentModal
        open={renameModalOpen && !isFolder(selectedItem)}
        onOpenChange={setRenameModalOpen}
        item={selectedItem}
        onConfirm={(data) => {
          if (selectedItem) {
            updateDocumentMutation.mutate({
              id: selectedItem._id,
              name: data.name,
              description: data.description,
            });
          }
        }}
        isLoading={updateDocumentMutation.isPending}
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

      <TagsModal
        open={tagsModalOpen}
        onOpenChange={setTagsModalOpen}
        item={selectedItem}
        onConfirm={(tags) => {
          if (selectedItem) {
            addTagsMutation.mutate({ id: selectedItem._id, tags });
            setTagsModalOpen(false);
          }
        }}
        isLoading={addTagsMutation.isPending}
      />
    </div>
  );
}

// EmptyState Component
function EmptyState({
  onUpload,
  dragActive,
  onCreateFolder,
}: {
  onUpload: () => void;
  dragActive: boolean;
  onCreateFolder: () => void;
}) {
  return (
    <div
      className="flex items-center justify-center h-full cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onUpload}
    >
      <div
        className={`text-center transition-all ${
          dragActive ? "scale-105" : ""
        }`}
      >
        <div className="mb-8">
          <div className="w-48 h-48 mx-auto mb-4 flex items-center justify-center">
            <Upload className="w-32 h-32 text-gray-400" />
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          {dragActive ? "Drop files here" : "Click anywhere to upload"}
        </h2>
        <p className="text-gray-600 mb-6">or drag and drop files</p>

        <Button
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onCreateFolder();
          }}
          className="mb-4"
        >
          <FolderPlus className="w-4 h-4 mr-2" />
          Create Folder
        </Button>

        <p className="text-sm text-gray-500 mt-4">
          Supported: PDF, DOCX, XLSX, JPG, PNG, ZIP (max 4GB)
        </p>
      </div>
    </div>
  );
}