import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import RenameFolderModal from "@/components/RightPanelView/Modals/RenameFolderModal";
import { z } from "zod";
import type { SubmitHandler } from "react-hook-form";

import {
  List,
  Grid3x3,
  Info,
  Upload,
  ChevronRight,
  FolderPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getChildFolders } from "@/config/api/folderApi";
import { getBreadcrumbs } from "@/config/api/treeApi";
import {
  updateFolder,
  softDeleteFolder,
  createFolder,
} from "@/config/api/folderApi";
import {
  updateDocument,
  deleteDocument,
  generateDownloadUrl,
  addTags,
} from "@/config/api/documentApi";
import {
  uploadFiles,
  validateFiles,
  ALLOWED_EXTENSIONS,
} from "@/utils/helper/fileUploadHelper";
import { reuploadFile, validateFile } from "@/utils/helper/fileReuploadHelper";
import FileInfoPanel from "@/components/custom/FileInfoPanel";
import GridView from "@/components/RightPanelView/Views/GridView";
import ListView from "@/components/RightPanelView/Views/ListView";
import TagsModal from "@/components/RightPanelView/Modals/TagsModal";
import DeleteModal from "@/components/RightPanelView/Modals/DeleteModal";
import { ScrollArea } from "@/components/ui/scroll-area";

const renameDocumentSchema = z.object({
  name: z
    .string()
    .min(1, "File name is required")
    .max(100, "File name too long"),
  description: z.string().max(500, "Description too long").optional(),
});

const createFolderSchema = z.object({
  name: z.string().min(1, "Folder name required"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
});


type CreateFolderFormData = z.infer<typeof createFolderSchema>;

type RenameDocumentFormData = z.infer<typeof renameDocumentSchema>;

interface Breadcrumb {
  _id: string;
  name: string;
  type: string;
  path: string;
}

interface FileItem {
  _id: string;
  name: string;
  itemType?: "file" | "folder";
  type: "documents" | "folder";
  parent_id?: string;
  color?: string;
  isDeleted: boolean;
  deletedAt: string | null;
  createdBy:
    | {
        _id: string;
        email: string;
        name?: string;
      }
    | string;
  createdAt: string;
  updatedAt: string;
  path: string;
  fileUrl?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  hasChildren?: boolean;
  description?: string;
  tags?: string[];
  extension?: string;
}

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

  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reuploadInputRef = useRef<HTMLInputElement>(null);
  const [reuploadDocumentId, setReuploadDocumentId] = useState<string | null>(
    null
  );

  // Modal states
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tagsModalOpen, setTagsModalOpen] = useState(false);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);

  const {
    data: childrenData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["children", parentId],
    queryFn: () => getChildFolders(parentId || ""),
    enabled: !!parentId,
  });

  const { data: breadcrumbsData } = useQuery({
    queryKey: ["breadcrumbs", parentId],
    queryFn: () => getBreadcrumbs(parentId || ""),
    enabled: !!parentId,
  });

  const items: FileItem[] = childrenData?.children || [];
  const breadcrumbs: Breadcrumb[] = Array.isArray(breadcrumbsData)
    ? breadcrumbsData
    : breadcrumbsData?.data || [];

  const isEmpty = items.length === 0;

  // Mutations
  const createFolderMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      parent_id: string;
      color?: string;
    }) => {
      return await createFolder(data);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["children", parentId] });
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      toast.success("Folder created successfully", {
        description: getFormattedDateTime(),
        action: {
          label: "Open",
          onClick: () => navigate(`/dashboard/folder/${response.data._id}`),
        },
      });
      navigate(`/dashboard/folder/${response.data._id}`);
    },
    onError: (error: any) => {
      toast.error("Failed to create folder", {
        description: error?.response?.data?.message || getFormattedDateTime(),
      });
    },
  });

  const reuploadMutation = useMutation({
    mutationFn: async ({
      file,
      documentId,
    }: {
      file: File;
      documentId: string;
    }) => {
      return await reuploadFile(file, {
        documentId,
        changeDescription: "File reuploaded",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children", parentId] });
      queryClient.invalidateQueries({
        queryKey: ["document", reuploadDocumentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["versions", reuploadDocumentId],
      });
      toast.success("File reuploaded successfully", {
        description: getFormattedDateTime(),
      });
      setReuploadDocumentId(null);
    },
    onError: (error: any) => {
      console.error("Reupload error:", error);
      toast.error("Failed to reupload file", {
        description:
          error?.response?.data?.message ||
          error?.message ||
          getFormattedDateTime(),
      });
      setReuploadDocumentId(null);
    },
  });

  const updateFolderMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; color?: string }) => {
      return await updateFolder(data.id, {
        name: data.name,
        color: data.color,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children", parentId] });
      queryClient.invalidateQueries({ queryKey: ["document", selectedFileId] });
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      toast.success("Folder updated successfully", {
        description: getFormattedDateTime(),
      });
    },
    onError: (error: any) => {
      toast.error("Failed to update folder", {
        description: error?.response?.data?.message || getFormattedDateTime(),
      });
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (id: string) => {
      return await softDeleteFolder(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children", parentId] });
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      toast.success("Folder moved to trash", {
        description: "You can restore it from trash",
        action: {
          label: "Undo",
          onClick: () => toast.info("Restore feature coming soon"),
        },
      });
    },
    onError: (error: any) => {
      toast.error("Failed to move folder to trash", {
        description: error?.response?.data?.message || getFormattedDateTime(),
      });
    },
  });

  const updateDocumentMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      name?: string;
      description?: string;
      tags?: string[];
    }) => {
      return await updateDocument(data.id, {
        name: data.name,
        description: data.description,
        tags: data.tags,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children", parentId] });
      queryClient.invalidateQueries({ queryKey: ["document", selectedFileId] });
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
    mutationFn: async (id: string) => {
      return await deleteDocument(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children", parentId] });
      toast.success("File moved to trash", {
        description: "You can restore it from trash",
        action: {
          label: "Undo",
          onClick: () => toast.info("Restore feature coming soon"),
        },
      });
    },
    onError: (error: any) => {
      toast.error("Failed to move file to trash", {
        description: error?.response?.data?.message || getFormattedDateTime(),
      });
    },
  });

  const addTagsMutation = useMutation({
    mutationFn: async (data: { id: string; tags: string[] }) => {
      return await addTags(data.id, data.tags);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children", parentId] });
      queryClient.invalidateQueries({ queryKey: ["document", selectedFileId] });
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

  // Event handlers
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
      {
        description: getFormattedDateTime(),
      }
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

    if (!file || !currentDocId) {
      return;
    }

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

  const handleShowInfo = (fileId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedFileId(fileId);
    setShowInfoPanel(true);
  };

  const handleItemClick = (item: FileItem) => {
    if (item.type === "folder" || item.itemType === "folder") {
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
    item !== null && (item.type === "folder" || item.itemType === "folder");

  return (
    <div className="h-full flex">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <Breadcrumb>
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
                      <BreadcrumbPage className="text-gray-900 text-[24px] font-normal">
                        {crumb.name}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        asChild
                        className="text-gray-700 text-[24px] hover:text-teal-600 transition-colors font-normal cursor-pointer"
                        onClick={() =>
                          index === 0
                            ? (window.location.href = "/dashboard/home")
                            : handleBreadcrumbClick(crumb._id)
                        }
                      >
                        <span>{crumb.name}</span>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>

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
            <EmptyState
              onUpload={() => fileInputRef.current?.click()}
              dragActive={dragActive}
              onCreateFolder={() => setCreateFolderModalOpen(true)}
            />
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
        item={selectedItem as any}
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
            setRenameModalOpen(false);
          }
        }}
        isLoading={updateDocumentMutation.isPending}
      />

      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        item={selectedItem as any}
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
      />

      <TagsModal
        open={tagsModalOpen}
        onOpenChange={setTagsModalOpen}
        item={selectedItem as any}
        onConfirm={(tags) => {
          if (selectedItem) {
            addTagsMutation.mutate({ id: selectedItem._id, tags });
            setTagsModalOpen(false);
          }
        }}
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

// Modal Components
function CreateFolderModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: CreateFolderFormData) => void;
  isLoading?: boolean;
}) {
  const form = useForm<CreateFolderFormData>({
    resolver: zodResolver(createFolderSchema),
    defaultValues: {
      name: "",
      color: "#3B82F6",
    },
    mode: "onChange",
  });

  React.useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = (data: CreateFolderFormData) => {
    onConfirm(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Enter a name and choose a color for your new folder.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control as any}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Folder Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Marketing Materials"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Input type="color" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-teal-500 hover:bg-teal-600"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Folder"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function RenameDocumentModal({
  open,
  onOpenChange,
  item,
  onConfirm,
  isLoading = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: FileItem | null;
  onConfirm: (data: RenameDocumentFormData) => void;
  isLoading?: boolean;
}) {
  const form = useForm<RenameDocumentFormData>({
    resolver: zodResolver(renameDocumentSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  React.useEffect(() => {
    if (item && open) {
      form.reset({
        name: item.name,
        description: item.description || "",
      });
    }
  }, [item, open, form]);

  const handleSubmit: SubmitHandler<RenameDocumentFormData> = (data) => { 
onConfirm(data);
   }



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename File</DialogTitle>
          <DialogDescription>
            Update the name and description for this file (without extension).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter file name (without extension)"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter file description"
                      rows={3}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-teal-500 hover:bg-teal-600"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update File"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}