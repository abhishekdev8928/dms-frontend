
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAcceptAttribute } from "@/utils/helper/fileValidationHelpers";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

// Custom Components
import CreateFolderModal from "@/components/Modals/CreateFolderModal";
import { CreateUserModal } from "@/components/Modals/CreateUserModal";

// API & Types
import { getFullTree } from "@/config/api/treeApi";
import type { TreeNode } from "@/config/types/navigationTreeTypes";
import type { CreateDepartmentInput } from "@/utils/validations/departmentValidation";

// Hooks & Helpers
import { useDepartmentMutations } from "@/hooks/mutations/useDepartmentMutations";
import { useFolderMutations } from "@/hooks/mutations/useFolderMutations";
import { useNavigationUpload } from "@/hooks/navigation/useNavigationUpload";
import { useNavigationModals } from "@/hooks/navigation/useNavigationModals";
import {
  findParent,
} from "@/utils/helper/navigationTreeHelpers";
import { createDepartmentSchema } from "@/utils/validations/departmentValidation";
import { TreeNodeRenderer } from "@/components/navigation/TreeNodeRenderer";
import { NavigationLinks } from "@/components/navigation/NavigationLinks";
import { NewButtonDropdown } from "@/components/navigation/NewButtonDropdown";

const NavigationTree = () => {
  const { parentId } = useParams<{ parentId: string }>();
  const navigate = useNavigate();

  // Modals state
  const {
    isUserModalOpen,
    setIsUserModalOpen,
    isDeptModalOpen,
    setIsDeptModalOpen,
    openDeptModal,
    isFolderModalOpen,
    setIsFolderModalOpen,
    openFolderModal,
  } = useNavigationModals(parentId);

  // Upload handlers
  const {
    fileInputRef,
    folderInputRef,
    fileUploadMutation,
    folderUploadMutation,
    handleFileUploadClick,
    handleFolderUploadClick,
    handleFileChange,
    handleFolderChange
  } = useNavigationUpload({ parentId });

  // Department form
  const departmentForm = useForm<CreateDepartmentInput>({
    resolver: zodResolver(createDepartmentSchema),
    defaultValues: { name: "" },
  });

  // Fetch navigation tree
  const {
    data: treeResponse,
    isLoading: treeLoading,
    error: treeError,
    refetch: refetchTree,
  } = useQuery({
    queryKey: ["tree"],
    queryFn: getFullTree,
  });

  const navigationTree: TreeNode[] = treeResponse?.data || [];

  // Mutations
  const { createDepartmentMutation } = useDepartmentMutations({
    onSuccess: () => {
      departmentForm.reset();
      setIsDeptModalOpen(false);
    },
  });

  const { createFolderMutation } = useFolderMutations({
    parentId,
    onSuccess: () => {
      setIsFolderModalOpen(false);
    },
  });

  // Handlers
  const onSubmitDepartment = (data: CreateDepartmentInput) => {
    createDepartmentMutation.mutate(data);
  };

  const handleCancelModal = () => {
    departmentForm.reset();
    setIsDeptModalOpen(false);
    setIsFolderModalOpen(false);
  };

  const handleRowClick = (node: TreeNode) => {
    if (parentId === node.id) {
      const parent = findParent(navigationTree, node.id);
      navigate(parent ? `/dashboard/folder/${parent.id}` : "/dashboard/home");
    } else {
      navigate(`/dashboard/folder/${node.id}`);
    }
  };

  return (
    <>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
       accept={getAcceptAttribute()}

      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        onChange={handleFolderChange}
        className="hidden"
        // @ts-ignore
        webkitdirectory=""
        directory=""
      />

      <div className="hidden bg-muted/40 md:block">
        <div className="flex mt-5 h-full max-h-screen flex-col gap-2">
          {/* Header */}
          <div className="flex h-14 items-center px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <span className="text-[24px]">DMS</span>
            </Link>
          </div>

          {/* New Button */}
          <div className="px-4 border-b mb-6 pb-6 lg:px-6 py-2">
            <NewButtonDropdown
              parentId={parentId}
              fileUploadPending={fileUploadMutation.isPending}
              folderUploadPending={folderUploadMutation.isPending}
              onUserClick={() => setIsUserModalOpen(true)}
              onFileUploadClick={handleFileUploadClick}
              onFolderUploadClick={handleFolderUploadClick}
              onCreateFolderClick={openFolderModal}
              onCreateDepartmentClick={openDeptModal}
            />
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <NavigationLinks />

              {/* Tree Section */}
              <div className="mt-4 pt-4 border-t">
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
                ) : navigationTree.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No departments found
                  </div>
                ) : (
                  <div className="space-y-1">
                    {navigationTree.map((node) => (
                      <TreeNodeRenderer
                        key={node.id}
                        node={node}
                        parentId={parentId}
                        navigationTree={navigationTree}
                        onClick={handleRowClick}
                      />
                    ))}
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
            <DialogTitle className="roboto text-[20px] font-normal">
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
                    <FormControl>
                      <Input
                        placeholder="Department name"
                        {...field}
                        className="h-12 border focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none"
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
                  className="hover:bg-[#035C4C] hover:text-white"
                  onClick={handleCancelModal}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-white text-[#035C4C] text-[14px] hover:bg-[#035C4C] hover:text-[#fff]"
                  disabled={createDepartmentMutation.isPending}
                >
                  {createDepartmentMutation.isPending ? (
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

      {/* Folder Modal */}
      <CreateFolderModal
        open={isFolderModalOpen}
        onOpenChange={setIsFolderModalOpen}
        onConfirm={(data) => {
          createFolderMutation.mutate(
            { ...data, parentId: parentId || "" },
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

export default NavigationTree;