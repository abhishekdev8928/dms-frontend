import { useState, useRef, type JSX } from "react";
import { useParams, useNavigate, NavLink, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { validateFiles, ALLOWED_EXTENSIONS } from "@/utils/helper/fileUploadHelper.js";
import { uploadFolder } from "@/utils/helper/folderUploadHelper.js";
import {
  Folder,
  FolderOpen,
  ChevronRight,
  Plus,
  Loader2,
  BookOpen,
  FolderUp,
  FileText,
  Home,
  Package2,
} from "lucide-react";
import { IconRestore } from "@tabler/icons-react";
import { LucideBuilding2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createDepartment } from "@/config/api/departmentApi";
import { createFolder } from "@/config/api/folderApi";
import { getFullTree } from "@/config/api/treeApi";
import { queryClient } from "@/main";
import { toast } from "sonner";
import { uploadFiles } from "@/utils/helper/fileUploadHelper.js";
import { 
  createDepartmentSchema, 
  type CreateDepartmentInput 
} from "@/utils/validations/departmentValidation";
import { 
  createFolderSchema, 
  type CreateFolderInput 
} from "@/utils/validations/folderValidation";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
interface TreeNode {
  id: string;
  name: string;
  children: TreeNode[];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export const LeftPanelView = () => {
  const { parentId } = useParams<{ parentId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Modal state
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  // ============================================================================
  // REACT HOOK FORMS
  // ============================================================================
  const departmentForm = useForm<CreateDepartmentInput>({
    resolver: zodResolver(createDepartmentSchema),
    defaultValues: {
      name: "",
    },
  });

  const folderForm = useForm<CreateFolderInput>({
    resolver: zodResolver(createFolderSchema),
    defaultValues: {
      name: "",
      parent_id: parentId || "",
      color: "#3B82F6",
    },
  });

  // ============================================================================
  // QUERIES
  // ============================================================================
  const {
    data: treeResponse,
    isLoading: treeLoading,
    error: treeError,
    refetch: refetchTree,
  } = useQuery({
    queryKey: ["tree"],
    queryFn: getFullTree,
  });

  const treeData: TreeNode[] = treeResponse?.data || [];

  

  

  // ============================================================================
  // MUTATIONS
  // ============================================================================
  const createDeptMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: (data) => {
      toast.success("Department Created", {
        description: `"${data.data.name}" has been created successfully and is now available.`,
      });
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      departmentForm.reset();
      setIsDeptModalOpen(false);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Failed to create department";
      toast.error("Department Creation Failed", {
        description: errorMessage,
      });
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: createFolder,
    onSuccess: (data) => {
      toast.success("Folder Created", {
        description: `"${data.data.name}" has been created successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      queryClient.invalidateQueries({ queryKey: ["children", parentId] });
      queryClient.invalidateQueries({ queryKey: ["breadcrumbs", parentId] });
      folderForm.reset();
      setIsFolderModalOpen(false);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Failed to create folder";
      toast.error("Folder Creation Failed", {
        description: errorMessage,
      });
    },
  });

  // File Upload Mutation
  const fileUploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      return await uploadFiles(files, {
        parentId: parentId!,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["children", parentId] });
          queryClient.invalidateQueries({ queryKey: ["tree"] });
          queryClient.invalidateQueries({ queryKey: ["documents"] });
        },
      });
    },
    onSuccess: (data: any) => {
      const fileCount = data?.filesCount || data?.length || 0;
      toast.success("Files Uploaded Successfully", {
        description: `${fileCount} file${fileCount !== 1 ? 's' : ''} uploaded to the folder.`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to upload files";
      toast.error("File Upload Failed", {
        description: errorMessage,
      });
    },
  });

  // Folder Upload Mutation
  const folderUploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      return await uploadFolder(files, {
        parentId: parentId!,
        onProgress: (progress) => {
          console.log(`${progress.stage}: ${progress.current}/${progress.total} - ${progress.message}`);
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["children", parentId] });
          queryClient.invalidateQueries({ queryKey: ["tree"] });
        },
      });
    },
    onSuccess: (data) => {
      toast.success("Folder Uploaded Successfully", {
        description: `${data.filesCount} files in ${data.foldersCount} folders have been uploaded.`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to upload folder";
      toast.error("Folder Upload Failed", {
        description: errorMessage,
      });
    },
  });

  // ============================================================================
  // FILE UPLOAD HANDLERS
  // ============================================================================
  const handleFileUploadClick = () => {
    if (!parentId) {
      toast.warning("No Folder Selected", {
        description: "Please select a folder before uploading files.",
      });
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFolderUploadClick = () => {
    if (!parentId) {
      toast.warning("No Folder Selected", {
        description: "Please select a folder before uploading a directory.",
      });
      return;
    }
    folderInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const { validFiles, errors } = validateFiles(fileArray);

    if (errors.length > 0) {
      toast.warning("Some Files Rejected", {
        description: errors.slice(0, 3).join(", ") + 
          (errors.length > 3 ? ` and ${errors.length - 3} more` : ""),
      });
    }

    if (validFiles.length === 0) {
      toast.error("No Valid Files", {
        description: "All selected files were rejected. Please check file types and try again.",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    fileUploadMutation.mutate(validFiles);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFolderChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const { validFiles, errors } = validateFiles(fileArray);

    if (errors.length > 0) {
      toast.warning("Some Files Rejected", {
        description: errors.slice(0, 3).join(", ") + 
          (errors.length > 3 ? ` and ${errors.length - 3} more` : ""),
      });
    }

    if (validFiles.length === 0) {
      toast.error("No Valid Files in Folder", {
        description: "All files in the selected folder were rejected.",
      });
      if (folderInputRef.current) {
        folderInputRef.current.value = "";
      }
      return;
    }

    folderUploadMutation.mutate(validFiles);

    if (folderInputRef.current) {
      folderInputRef.current.value = "";
    }
  };

  // ============================================================================
  // FORM SUBMIT HANDLERS
  // ============================================================================
  const onSubmitDepartment = (data: CreateDepartmentInput) => {
    createDeptMutation.mutate(data);
  };

  const onSubmitFolder = (data: CreateFolderInput) => {
    if (!parentId) {
      toast.error("No Parent Folder", {
        description: "Please select a parent folder first.",
      });
      return;
    }
    createFolderMutation.mutate({ ...data, parent_id: parentId });
  };

  // ============================================================================
  // MODAL HANDLERS
  // ============================================================================
  const handleOpenFolderModal = () => {
    if (!parentId) {
      toast.warning("No Folder Selected", {
        description: "Please select a parent folder before creating a new folder.",
      });
      return;
    }
    folderForm.setValue("parent_id", parentId);
    setIsFolderModalOpen(true);
  };

  const handleCancelModal = () => {
    departmentForm.reset();
    folderForm.reset();
    setIsDeptModalOpen(false);
    setIsFolderModalOpen(false);
  };

  // ============================================================================
  // TREE HELPERS
  // ============================================================================
  const hasDescendant = (nodes: TreeNode[], targetId: string): boolean =>
    nodes.some(
      (n) =>
        n.id === targetId ||
        (n.children && hasDescendant(n.children, targetId))
    );

  const isInActivePath = (
    nodes: TreeNode[],
    nodeId: string,
    targetId: string
  ): boolean =>
    nodes.some(
      (n) =>
        (n.id === nodeId && hasDescendant(n.children, targetId)) ||
        (n.children && isInActivePath(n.children, nodeId, targetId))
    );

  const findParent = (
    nodes: TreeNode[],
    targetId: string,
    parent: TreeNode | null = null
  ): TreeNode | null => {
    for (const node of nodes) {
      if (node.id === targetId) return parent;
      if (node.children?.length) {
        const found = findParent(node.children, targetId, node);
        if (found) return found;
      }
    }
    return null;
  };

  const handleRowClick = (node: TreeNode) => {
    if (parentId === node.id) {
      const parent = findParent(treeData, node.id);
      navigate(parent ? `/dashboard/folder/${parent.id}` : "/dashboard/home");
    } else {
      navigate(`/dashboard/folder/${node.id}`);
    }
  };

  const renderTreeNode = (node: TreeNode, level = 0): JSX.Element => {
    const hasChildren = node.children?.length > 0;
    const isActive = parentId === node.id;
    const isExpanded =
      isActive || (parentId ? isInActivePath(treeData, node.id, parentId) : false);

    return (
      <div key={node.id} className="select-none">
        <div
          onClick={() => handleRowClick(node)}
          className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-all hover:text-primary ${
            isActive ? "bg-muted text-primary" : "text-muted-foreground"
          }`}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
        >
          {hasChildren ? (
            <ChevronRight
              className={`w-4 h-4 transition-transform ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
          ) : (
            <span className="w-4 h-4" />
          )}
          {level === 0 ? (
            <BookOpen className="w-4 h-4" />
          ) : isExpanded ? (
            <FolderOpen className="w-4 h-4" />
          ) : (
            <Folder className="w-4 h-4" />
          )}
          <span className="flex-1 text-sm truncate">
            {node.name}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div>{node.children.map((child) => renderTreeNode(child, level + 1))}</div>
        )}
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <>
      {/* File input for individual files */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        accept={ALLOWED_EXTENSIONS.join(',')}
      />

      {/* Folder input for directory upload */}
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory=""
        directory=""
        multiple
        onChange={handleFolderChange}
        className="hidden"
      />

      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          {/* Header */}
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span>DMS</span>
            </Link>
          </div>

          {/* New Button with Dropdown */}
          <div className="px-4 lg:px-6 py-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  disabled={fileUploadMutation.isPending || folderUploadMutation.isPending}
                >
                  {(fileUploadMutation.isPending || folderUploadMutation.isPending) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  New
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="w-[240px]">
                <DropdownMenuItem
                  className="py-2 cursor-pointer"
                  onClick={() => setIsDeptModalOpen(true)}
                >
                  <LucideBuilding2 className="w-4 h-4 mr-2 text-gray-600" />
                  <div className="flex-1">
                    <div className="text-sm">Create Department</div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className={`py-2 cursor-pointer ${!parentId ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={handleOpenFolderModal}
                  disabled={!parentId}
                >
                  <Folder className="w-4 h-4 mr-2 text-gray-600" />
                  <div className="flex-1">
                    <div className="text-sm">Create Folder</div>
                  </div>
                </DropdownMenuItem>

                <div className="h-px bg-gray-200 my-1" />

                <DropdownMenuItem
                  className={`py-2 cursor-pointer ${!parentId ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={handleFileUploadClick}
                  disabled={fileUploadMutation.isPending || !parentId}
                >
                  <FileText className="w-4 h-4 mr-2 text-gray-600" />
                  <div className="flex-1">
                    <div className="text-sm">File Upload</div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className={`py-2 cursor-pointer ${!parentId ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={handleFolderUploadClick}
                  disabled={folderUploadMutation.isPending || !parentId}
                >
                  <FolderUp className="w-4 h-4 mr-2 text-gray-600" />
                  <div className="flex-1">
                    <div className="text-sm">Folder Upload</div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {/* Main Navigation Links */}
              <NavLink
                to="/dashboard/home"
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                    isActive ? "bg-muted text-primary" : ""
                  }`
                }
              >
                <Home className="h-4 w-4" />
                Home
              </NavLink>

              <NavLink
                to="/dashboard/department"
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                    isActive ? "bg-muted text-primary" : ""
                  }`
                }
              >
                <LucideBuilding2 className="h-4 w-4" />
                Department
              </NavLink>

              <NavLink
                to="/dashboard/restore"
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                    isActive ? "bg-muted text-primary" : ""
                  }`
                }
              >
                <IconRestore className="h-4 w-4" />
                Restore
              </NavLink>

              {/* Departments Tree Section */}
              <div className="mt-4 pt-4 border-t">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                  Departments
                </div>
                {treeLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  </div>
                ) : treeError ? (
                  <div className="px-3 py-2">
                    <p className="text-xs text-red-600 mb-2">
                      {treeError instanceof Error ? treeError.message : "Failed to load tree"}
                    </p>
                    <Button onClick={() => refetchTree()} variant="outline" size="sm" className="w-full">
                      Retry
                    </Button>
                  </div>
                ) : treeData.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No departments found
                  </div>
                ) : (
                  <div className="space-y-1">
                    {treeData.map((node) => renderTreeNode(node))}
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Department Modal */}
      <Dialog open={isDeptModalOpen} onOpenChange={setIsDeptModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Department</DialogTitle>
          </DialogHeader>

          <Form {...departmentForm}>
            <form onSubmit={departmentForm.handleSubmit(onSubmitDepartment)} className="space-y-4">
              <FormField
                control={departmentForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter department name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={handleCancelModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createDeptMutation.isPending}>
                  {createDeptMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Department"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Folder Modal */}
      <Dialog open={isFolderModalOpen} onOpenChange={setIsFolderModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>

          <Form {...folderForm}>
            <form onSubmit={folderForm.handleSubmit(onSubmitFolder)} className="space-y-4">
              <FormField
                control={folderForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Folder Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter folder name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={folderForm.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color (Optional)</FormLabel>
                    <FormControl>
                      <Input type="color" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={handleCancelModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createFolderMutation.isPending}>
                  {createFolderMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Folder"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};