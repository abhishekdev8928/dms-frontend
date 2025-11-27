import { useState, useRef, type JSX } from "react";
import { useParams, useNavigate, NavLink, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  validateFiles,
  ALLOWED_EXTENSIONS,
} from "@/utils/helper/fileUploadHelper.js";
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
  type CreateDepartmentInput,
} from "@/utils/validations/departmentValidation";
import CreateFolderModal from "@/components/Modals/CreateFolderModal";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";

import { CreateUserModal } from "@/components/Modals/CreateUserModal";

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
export const ExplorerSidebar = () => {
  const { parentId } = useParams<{ parentId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

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
      const errorMessage =
        error?.response?.data?.message || "Failed to create department";
      toast.error("Department Creation Failed", {
        description: errorMessage,
      });
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: createFolder,
    onSuccess: (data) => {
      toast.success("Redirecting you inside the folder", {
        description: "Folder created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      queryClient.invalidateQueries({ queryKey: ["children", parentId] });
      queryClient.invalidateQueries({ queryKey: ["breadcrumbs", parentId] });
      navigate(`/dashboard/folder/${data.data._id}`);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to create folder";
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
        description: `${fileCount} file${
          fileCount !== 1 ? "s" : ""
        } uploaded to the folder.`,
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
          console.log(
            `${progress.stage}: ${progress.current}/${progress.total} - ${progress.message}`
          );
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

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const { validFiles, errors } = validateFiles(fileArray);

    if (errors.length > 0) {
      toast.warning("Some Files Rejected", {
        description:
          errors.slice(0, 3).join(", ") +
          (errors.length > 3 ? ` and ${errors.length - 3} more` : ""),
      });
    }

    if (validFiles.length === 0) {
      toast.error("No Valid Files", {
        description:
          "All selected files were rejected. Please check file types and try again.",
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

  const handleFolderChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const { validFiles, errors } = validateFiles(fileArray);

    if (errors.length > 0) {
      toast.warning("Some Files Rejected", {
        description:
          errors.slice(0, 3).join(", ") +
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

  // ============================================================================
  // MODAL HANDLERS
  // ============================================================================
  const handleOpenFolderModal = () => {
    if (!parentId) {
      toast.warning("No Folder Selected", {
        description:
          "Please select a parent folder before creating a new folder.",
      });
      return;
    }
    setIsFolderModalOpen(true);
  };

  const handleCancelModal = () => {
    departmentForm.reset();
    setIsDeptModalOpen(false);
    setIsFolderModalOpen(false);
  };

  // ============================================================================
  // TREE HELPERS
  // ============================================================================
  const hasDescendant = (nodes: TreeNode[], targetId: string): boolean =>
    nodes.some(
      (n) =>
        n.id === targetId || (n.children && hasDescendant(n.children, targetId))
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
      isActive ||
      (parentId ? isInActivePath(treeData, node.id, parentId) : false);

    return (
      <div key={node.id} className="select-none">
        <div
          onClick={() => handleRowClick(node)}
          className={`flex items-center gap-2 py-0 px-3 rounded-lg cursor-pointer transition-all hover:text-primary ${
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
            // <BookOpen className="w-4 h-4" />
            <svg
              width="18"
              height="22"
              viewBox="0 0 18 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 18.5V3.5C1 2.83696 1.26339 2.20107 1.73223 1.73223C2.20107 1.26339 2.83696 1 3.5 1H16C16.2652 1 16.5196 1.10536 16.7071 1.29289C16.8946 1.48043 17 1.73478 17 2V20C17 20.2652 16.8946 20.5196 16.7071 20.7071C16.5196 20.8946 16.2652 21 16 21H3.5C2.83696 21 2.20107 20.7366 1.73223 20.2678C1.26339 19.7989 1 19.163 1 18.5ZM1 18.5C1 17.837 1.26339 17.2011 1.73223 16.7322C2.20107 16.2634 2.83696 16 3.5 16H17"
                stroke="#434343"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          ) : isExpanded ? (
            // <FolderOpen className="w-4 h-4" />
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 14L7.5 11.1C7.66307 10.7761 7.91112 10.5027 8.21761 10.3089C8.5241 10.1152 8.8775 10.0084 9.24 9.99997H20M20 9.99997C20.3055 9.99944 20.6071 10.0689 20.8816 10.2031C21.1561 10.3372 21.3963 10.5325 21.5836 10.7738C21.7709 11.0152 21.9004 11.2963 21.9622 11.5955C22.024 11.8947 22.0164 12.2041 21.94 12.5L20.4 18.5C20.2886 18.9315 20.0362 19.3135 19.6829 19.5853C19.3296 19.857 18.8957 20.003 18.45 20H4C3.46957 20 2.96086 19.7893 2.58579 19.4142C2.21071 19.0391 2 18.5304 2 18V4.99997C2 4.46954 2.21071 3.96083 2.58579 3.58576C2.96086 3.21069 3.46957 2.99997 4 2.99997H7.9C8.23449 2.99669 8.56445 3.07736 8.8597 3.23459C9.15495 3.39183 9.40604 3.6206 9.59 3.89997L10.4 5.09997C10.5821 5.3765 10.83 5.60349 11.1215 5.76058C11.413 5.91766 11.7389 5.99992 12.07 5.99997H18C18.5304 5.99997 19.0391 6.21069 19.4142 6.58576C19.7893 6.96083 20 7.46954 20 7.99997V9.99997Z"
                stroke="#434343"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          ) : (
            <svg
              width="22"
              height="19"
              viewBox="0 0 22 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 18C19.5304 18 20.0391 17.7893 20.4142 17.4142C20.7893 17.0391 21 16.5304 21 16V6C21 5.46957 20.7893 4.96086 20.4142 4.58579C20.0391 4.21071 19.5304 4 19 4H11.1C10.7655 4.00328 10.4355 3.92261 10.1403 3.76538C9.84505 3.60815 9.59396 3.37938 9.41 3.1L8.6 1.9C8.41789 1.62347 8.16997 1.39648 7.8785 1.2394C7.58702 1.08231 7.26111 1.00005 6.93 1H3C2.46957 1 1.96086 1.21071 1.58579 1.58579C1.21071 1.96086 1 2.46957 1 3V16C1 16.5304 1.21071 17.0391 1.58579 17.4142C1.96086 17.7893 2.46957 18 3 18H19Z"
                fill="#434343"
                stroke="#434343"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>

            // <Folder className="w-4 h-4" />
          )}
          <span className="flex-1 text-sm truncate flex items-center text-[16px] text-[#1E1E1E] gap-3 rounded-lg px-3 py-2  transition-all hover:text-primary">
            {node.name}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child) => renderTreeNode(child, level + 1))}
          </div>
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
        accept={ALLOWED_EXTENSIONS.join(",")}
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

      <div className="hidden  bg-muted/40 md:block">
        <div className="flex mt-5 h-full max-h-screen flex-col gap-2">
          {/* Header */}
          <div className="flex h-14 items-center px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <svg
                width="36"
                height="31"
                viewBox="0 0 36 31"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.33333 29.3333H31C31.8841 29.3333 32.7319 28.9821 33.357 28.357C33.9821 27.7319 34.3333 26.8841 34.3333 26V9.33333C34.3333 8.44928 33.9821 7.60143 33.357 6.97631C32.7319 6.35119 31.8841 6 31 6H17.7833C17.2343 5.99716 16.6945 5.85875 16.2118 5.59707C15.7292 5.33539 15.3186 4.95854 15.0167 4.5L13.65 2.5C13.348 2.04146 12.9375 1.66461 12.4548 1.40293C11.9722 1.14125 11.4324 1.00284 10.8833 1H4.33333C3.44928 1 2.60143 1.35119 1.97631 1.97631C1.35119 2.60143 1 3.44928 1 4.33333V26C1 27.8333 2.5 29.3333 4.33333 29.3333Z"
                  fill="#035C4C"
                />
                <path d="M11 12.6667V19.3333V12.6667Z" fill="#035C4C" />
                <path d="M17.6667 12.6667V16V12.6667Z" fill="#035C4C" />
                <path d="M24.3333 12.6667V22.6667V12.6667Z" fill="#035C4C" />
                <path
                  d="M11 12.6667V19.3333M17.6667 12.6667V16M24.3333 12.6667V22.6667M4.33333 29.3333H31C31.8841 29.3333 32.7319 28.9821 33.357 28.357C33.9821 27.7319 34.3333 26.8841 34.3333 26V9.33333C34.3333 8.44928 33.9821 7.60143 33.357 6.97631C32.7319 6.35119 31.8841 6 31 6H17.7833C17.2343 5.99716 16.6945 5.85875 16.2118 5.59707C15.7292 5.33539 15.3186 4.95854 15.0167 4.5L13.65 2.5C13.348 2.04146 12.9375 1.66461 12.4548 1.40293C11.9722 1.14125 11.4324 1.00284 10.8833 1H4.33333C3.44928 1 2.60143 1.35119 1.97631 1.97631C1.35119 2.60143 1 3.44928 1 4.33333V26C1 27.8333 2.5 29.3333 4.33333 29.3333Z"
                  stroke="#035C4C"
                  stroke-width="2"
                  stroke-linecap="square"
                  stroke-linejoin="round"
                />
              </svg>
              <span className="text-[24px]">DMS</span>
            </Link>
          </div>

          {/* New Button with Dropdown */}
          <div className="px-4 border-b mb-6 pb-6 lg:px-6 py-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="shadow-[0px_4px_4px_0px_#035C4C40] text-[20px] h-[50px] w-[127px] justify-center gap-2"
                  disabled={
                    fileUploadMutation.isPending ||
                    folderUploadMutation.isPending
                  }
                >
                  {fileUploadMutation.isPending ||
                  folderUploadMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  New
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="w-[240px] p-[10px]">
                <DropdownMenuItem
                  className="py-2 cursor-pointer hover:bg-[#F6FFFD] mb-1"
                  onClick={() => setIsUserModalOpen(true)}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 11C12.7614 11 15 8.76142 15 6C15 3.23858 12.7614 1 10 1C7.23858 1 5 3.23858 5 6C5 8.76142 7.23858 11 10 11Z"
                      stroke="#434343"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M1 19C1 16.8783 1.84285 14.8434 3.34315 13.3431C4.84344 11.8429 6.87827 11 9 11H11C13.1217 11 15.1566 11.8429 16.6569 13.3431C18.1571 14.8434 19 16.8783 19 19"
                      stroke="#434343"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <div className="flex-1">
                    <div className="text-[16px] roboto">Add Users</div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className={`py-2 cursor-pointer ${
                    !parentId ? "opacity-50 cursor-not-allowed" : ""
                  } hover:bg-[#F6FFFD] mb-1`}
                  onClick={handleFileUploadClick}
                  disabled={fileUploadMutation.isPending || !parentId}
                >
                  <svg
                    width="15"
                    height="19"
                    viewBox="0 0 15 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.13411 0.800051H2.46745C2.02542 0.800051 1.6015 0.975646 1.28894 1.28821C0.976376 1.60077 0.800781 2.02469 0.800781 2.46672V15.8001C0.800781 16.2421 0.976376 16.666 1.28894 16.9786C1.6015 17.2911 2.02542 17.4667 2.46745 17.4667H12.4674C12.9095 17.4667 13.3334 17.2911 13.646 16.9786C13.9585 16.666 14.1341 16.2421 14.1341 15.8001V5.80005M9.13411 0.800051C9.39791 0.799624 9.65918 0.851387 9.90289 0.952359C10.1466 1.05333 10.3679 1.20152 10.5541 1.38838L13.5441 4.37838C13.7315 4.56464 13.8801 4.78617 13.9814 5.03019C14.0826 5.2742 14.1345 5.53586 14.1341 5.80005M9.13411 0.800051V4.96672C9.13411 5.18773 9.22191 5.39969 9.37819 5.55597C9.53447 5.71225 9.74643 5.80005 9.96745 5.80005L14.1341 5.80005M7.46745 9.13338V14.1334M7.46745 9.13338L9.96745 11.6334M7.46745 9.13338L4.96745 11.6334"
                      stroke="#434343"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>

                  {/* <FileText className="w-4 h-4 mr-2 text-gray-600" /> */}
                  <div className="flex-1">
                    <div className="text-[16px] roboto">File Upload</div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className={`py-2 cursor-pointer ${
                    !parentId ? "opacity-50 cursor-not-allowed" : ""
                  } hover:bg-[#F6FFFD] mb-1`}
                  onClick={handleFolderUploadClick}
                  disabled={folderUploadMutation.isPending || !parentId}
                >
                  <svg
                    width="19"
                    height="16"
                    viewBox="0 0 19 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.13411 6.63338V11.6334M9.13411 6.63338L6.63411 9.13338M9.13411 6.63338L11.6341 9.13338M15.8008 14.9667C16.2428 14.9667 16.6667 14.7911 16.9793 14.4786C17.2919 14.166 17.4674 13.7421 17.4674 13.3V4.96672C17.4674 4.52469 17.2919 4.10076 16.9793 3.7882C16.6667 3.47564 16.2428 3.30005 15.8008 3.30005H9.21745C8.93871 3.30278 8.66374 3.23556 8.4177 3.10453C8.17166 2.97351 7.96241 2.78286 7.80911 2.55005L7.13411 1.55005C6.98236 1.31961 6.77576 1.13045 6.53286 0.999546C6.28997 0.868644 6.01837 0.800094 5.74245 0.800049H2.46745C2.02542 0.800049 1.6015 0.975643 1.28894 1.2882C0.976376 1.60076 0.800781 2.02469 0.800781 2.46672V13.3C0.800781 13.7421 0.976376 14.166 1.28894 14.4786C1.6015 14.7911 2.02542 14.9667 2.46745 14.9667H15.8008Z"
                      stroke="#434343"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>

                  {/* <FolderUp className="w-4 h-4 mr-2 text-gray-600" /> */}
                  <div className="flex-1">
                    <div className="text-[16px] roboto">Folder Upload</div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className={`py-2 cursor-pointer ${
                    !parentId ? "opacity-50 cursor-not-allowed" : ""
                  } hover:bg-[#F6FFFD] mb-1`}
                  onClick={handleOpenFolderModal}
                  disabled={!parentId}
                >
                  <svg
                    width="19"
                    height="16"
                    viewBox="0 0 19 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.13411 6.63338V11.6334M6.63411 9.13338H11.6341M15.8008 14.9667C16.2428 14.9667 16.6667 14.7911 16.9793 14.4786C17.2919 14.166 17.4674 13.7421 17.4674 13.3V4.96672C17.4674 4.52469 17.2919 4.10076 16.9793 3.7882C16.6667 3.47564 16.2428 3.30005 15.8008 3.30005H9.21745C8.93871 3.30278 8.66374 3.23556 8.4177 3.10453C8.17166 2.97351 7.96241 2.78286 7.80911 2.55005L7.13411 1.55005C6.98236 1.31961 6.77576 1.13045 6.53286 0.999546C6.28997 0.868644 6.01837 0.800094 5.74245 0.800049H2.46745C2.02542 0.800049 1.6015 0.975643 1.28894 1.2882C0.976376 1.60076 0.800781 2.02469 0.800781 2.46672V13.3C0.800781 13.7421 0.976376 14.166 1.28894 14.4786C1.6015 14.7911 2.02542 14.9667 2.46745 14.9667H15.8008Z"
                      stroke="#434343"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>

                  {/* <Folder className="w-4 h-4 mr-2 text-gray-600" /> */}
                  <div className="flex-1">
                    <div className="text-[16px] roboto">Create Folder</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="py-2 cursor-pointer hover:bg-[#F6FFFD] mb-1"
                  onClick={() => setIsDeptModalOpen(true)}
                >
                  <svg
                    width="15"
                    height="19"
                    viewBox="0 0 15 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.800781 15.3834V2.88338C0.800781 2.33085 1.02027 1.80094 1.41098 1.41024C1.80168 1.01954 2.33158 0.800049 2.88411 0.800049H13.3008C13.5218 0.800049 13.7338 0.887846 13.89 1.04413C14.0463 1.20041 14.1341 1.41237 14.1341 1.63338V16.6334C14.1341 16.8544 14.0463 17.0664 13.89 17.2226C13.7338 17.3789 13.5218 17.4667 13.3008 17.4667H2.88411C2.33158 17.4667 1.80168 17.2472 1.41098 16.8565C1.02027 16.4658 0.800781 15.9359 0.800781 15.3834ZM0.800781 15.3834C0.800781 14.8308 1.02027 14.3009 1.41098 13.9102C1.80168 13.5195 2.33158 13.3 2.88411 13.3H14.1341"
                      stroke="#434343"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  {/* <LucideBuilding2 className="w-4 h-4 mr-2 text-gray-600" /> */}
                  <div className="flex-1">
                    <div className="text-[16px] roboto">Create Department</div>
                  </div>
                </DropdownMenuItem>

                {/* <div className="h-px bg-gray-200 my-1" /> */}
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
                  `flex items-center text-[16px] text-[#1E1E1E] gap-3 rounded-lg px-3 py-2  transition-all hover:text-primary ${
                    isActive ? " " : ""
                  }`
                }
              >
                {/* <Home className="h-4 w-4" /> */}
                <svg
                  width="20"
                  height="21"
                  viewBox="0 0 20 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13 20.0005V12.0005C13 11.7353 12.8946 11.4809 12.7071 11.2934C12.5196 11.1058 12.2652 11.0005 12 11.0005H8C7.73478 11.0005 7.48043 11.1058 7.29289 11.2934C7.10536 11.4809 7 11.7353 7 12.0005V20.0005M1 9.00048C0.99993 8.70955 1.06333 8.4221 1.18579 8.1582C1.30824 7.89429 1.4868 7.66028 1.709 7.47248L8.709 1.47248C9.06999 1.16739 9.52736 1 10 1C10.4726 1 10.93 1.16739 11.291 1.47248L18.291 7.47248C18.5132 7.66028 18.6918 7.89429 18.8142 8.1582C18.9367 8.4221 19.0001 8.70955 19 9.00048V18.0005C19 18.5309 18.7893 19.0396 18.4142 19.4147C18.0391 19.7898 17.5304 20.0005 17 20.0005H3C2.46957 20.0005 1.96086 19.7898 1.58579 19.4147C1.21071 19.0396 1 18.5309 1 18.0005V9.00048Z"
                    stroke="#1E1E1E"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                Home
              </NavLink>

              <NavLink
                to="/dashboard/department"
                className={({ isActive }) =>
                  `flex items-center text-[16px] text-[#1E1E1E] gap-3 rounded-lg px-3 py-2  transition-all hover:text-primary ${
                    isActive ? " " : ""
                  }`
                }
              >
                <svg
                  width="22"
                  height="20"
                  viewBox="0 0 22 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 10H13M9 6H13M13 19V16C13 15.4696 12.7893 14.9609 12.4142 14.5858C12.0391 14.2107 11.5304 14 11 14C10.4696 14 9.96086 14.2107 9.58579 14.5858C9.21071 14.9609 9 15.4696 9 16V19M5 8H3C2.46957 8 1.96086 8.21071 1.58579 8.58579C1.21071 8.96086 1 9.46957 1 10V17C1 17.5304 1.21071 18.0391 1.58579 18.4142C1.96086 18.7893 2.46957 19 3 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H17M5 19V3C5 2.46957 5.21071 1.96086 5.58579 1.58579C5.96086 1.21071 6.46957 1 7 1H15C15.5304 1 16.0391 1.21071 16.4142 1.58579C16.7893 1.96086 17 2.46957 17 3V19"
                    stroke="#1E1E1E"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                Department
              </NavLink>

              <NavLink
                to="/dashboard/restore"
                className={({ isActive }) =>
                  `flex items-center text-[16px] text-[#1E1E1E] gap-3 rounded-lg px-3 py-2  transition-all hover:text-primary ${
                    isActive ? " " : ""
                  }`
                }
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 10C1 11.78 1.52784 13.5201 2.51677 15.0001C3.50571 16.4802 4.91131 17.6337 6.55585 18.3149C8.20038 18.9961 10.01 19.1743 11.7558 18.8271C13.5016 18.4798 15.1053 17.6226 16.364 16.364C17.6226 15.1053 18.4798 13.5016 18.8271 11.7558C19.1743 10.01 18.9961 8.20038 18.3149 6.55585C17.6337 4.91131 16.4802 3.50571 15.0001 2.51677C13.5201 1.52784 11.78 1 10 1C7.48395 1.00947 5.06897 1.99122 3.26 3.74L1 6M1 6V1M1 6H6M10 5V10L14 12"
                    stroke="#1E1E1E"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                {/* <IconRestore className="h-4 w-4" /> */}
                Restore
              </NavLink>

              <NavLink
                to="/dashboard/starred"
                className={({ isActive }) =>
                  `flex items-center text-[16px] text-[#1E1E1E] gap-3 rounded-lg px-3 py-2  transition-all hover:text-primary ${
                    isActive ? " " : ""
                  }`
                }
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 10C1 11.78 1.52784 13.5201 2.51677 15.0001C3.50571 16.4802 4.91131 17.6337 6.55585 18.3149C8.20038 18.9961 10.01 19.1743 11.7558 18.8271C13.5016 18.4798 15.1053 17.6226 16.364 16.364C17.6226 15.1053 18.4798 13.5016 18.8271 11.7558C19.1743 10.01 18.9961 8.20038 18.3149 6.55585C17.6337 4.91131 16.4802 3.50571 15.0001 2.51677C13.5201 1.52784 11.78 1 10 1C7.48395 1.00947 5.06897 1.99122 3.26 3.74L1 6M1 6V1M1 6H6M10 5V10L14 12"
                    stroke="#1E1E1E"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                {/* <IconRestore className="h-4 w-4" /> */}
                Starred
              </NavLink>

              {/* Departments Tree Section */}
              <div className="mt-4 pt-4 border-t">
                {/* <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                  Departments
                </div> */}
                {treeLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  </div>
                ) : treeError ? (
                  <div className="px-3 py-2">
                    <p className="text-xs text-red-600 mb-2">
                      {treeError instanceof Error
                        ? treeError.message
                        : "Failed to load tree"}
                    </p>
                    <Button
                      onClick={() => refetchTree()}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
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
        <DialogContent className="sm:max-w-[425px] p-[30px] pb-4">
          <DialogHeader>
            <DialogTitle className="roboto text-[20px] font-[400]">
              Create New Department
            </DialogTitle>
          </DialogHeader>

          <Form {...departmentForm}>
            <form
              onSubmit={departmentForm.handleSubmit(onSubmitDepartment)}
              className="space-y-4"
            >
              <FormField
                control={departmentForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    {/* <FormLabel>Department Name *</FormLabel> */}
                    <FormControl>
                      <Input
                        placeholder="Department name"
                        {...field}
                        className="h-12 border border-1 focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none "
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  className="hover:bg-[#035C4C] hover:text-[#fff]"
                  onClick={handleCancelModal}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#fff] text-[#035C4C] text-[14px] hover:bg-[#035C4C] hover:text-[#fff]"
                  disabled={createDeptMutation.isPending}
                >
                  {createDeptMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* User Modal */}
      <CreateUserModal
        open={isUserModalOpen}
        onOpenChange={setIsUserModalOpen}
      />

      {/* Folder Modal - Using Shared Component */}
      <CreateFolderModal
        open={isFolderModalOpen}
        onOpenChange={setIsFolderModalOpen}
        onConfirm={(data) => {
          createFolderMutation.mutate(
            { ...data, parent_id: parentId || "" },
            {
              onSuccess: () => {
                setIsFolderModalOpen(false);
              },
            }
          );
        }}
        isLoading={createFolderMutation.isPending}
      />
    </>
  );
};
