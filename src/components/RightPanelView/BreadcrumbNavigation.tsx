import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FolderPlus,
  Edit,
  Download,
  Share2,
  Trash2,
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
import type { Breadcrumb, FileItem } from "@/types/documentTypes";
import type { Department } from "@/config/api/departmentApi";

interface BreadcrumbNavigationProps {
  breadcrumbs: Breadcrumb[];
  onBreadcrumbClick: (id: string) => void;
  onCreateFolder: () => void;
  onRename: (item: FileItem) => void;
  onDelete: (item: FileItem) => void;
  onEditDepartment: (department: Department) => void;
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  breadcrumbs,
  onBreadcrumbClick,
  onCreateFolder,
  onRename,
  onDelete,
  onEditDepartment,
}) => {
  const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);

  const handleCreateFolderClick = () => {
    setActionsDropdownOpen(false);
    onCreateFolder();
  };

  const handleRenameClick = () => {
    if (breadcrumbs.length > 0) {
      const currentCrumb = breadcrumbs[breadcrumbs.length - 1];
      if (currentCrumb.type === "department") {
        onEditDepartment({
          _id: currentCrumb.id,
          name: currentCrumb.name,
        } as Department);
      } else if (currentCrumb.type === "folder") {
        onRename({
          _id: currentCrumb.id,
          name: currentCrumb.name,
          type: "folder",
        } as FileItem);
      }
      setActionsDropdownOpen(false);
    }
  };

  const handleDeleteClick = () => {
    if (breadcrumbs.length > 0) {
      const currentCrumb = breadcrumbs[breadcrumbs.length - 1];
      onDelete({
        _id: currentCrumb.id,
        name: currentCrumb.name,
        type: "folder",
      } as FileItem);
      setActionsDropdownOpen(false);
    }
  };

  if (breadcrumbs.length === 0) return null;

  const currentCrumb = breadcrumbs[breadcrumbs.length - 1];

  return (
    <BreadcrumbComponent>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.id}>
            {index > 0 && (
              <BreadcrumbSeparator>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </BreadcrumbSeparator>
            )}
            <BreadcrumbItem>
              {index === breadcrumbs.length - 1 ? (
                <div className="flex items-center gap-2">
                  <BreadcrumbPage className="text-gray-900 text-2xl font-normal">
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
                    <DropdownMenuContent align="start" className="w-56">
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
                        onClick={handleRenameClick}
                      >
                        <Edit className="w-4 h-4 mr-2 text-gray-600" />
                        <span className="text-sm">
                          Rename{" "}
                          {currentCrumb.type === "department"
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
                        onClick={handleDeleteClick}
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
                  className="text-gray-700 text-2xl hover:text-teal-600 transition-colors font-normal cursor-pointer"
                  onClick={() => onBreadcrumbClick(crumb.id)}
                >
                  <span>{crumb.name}</span>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </BreadcrumbComponent>
  );
};