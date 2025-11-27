import React, { useState } from "react";
import {
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
      <BreadcrumbList className="sm:gap-[18px]">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.id}>
            {index > 0 && (
              <BreadcrumbSeparator className=" [&>svg]:size-5  w-4 h-4 text-gray-400">
                {/* <ChevronRight className="w-4 h-4 text-gray-400" /> */}
                <svg width="12" height="21" viewBox="0 0 12 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.41406 19.4142L10.4141 10.4142L1.41406 1.41418" stroke="#434343" stroke-width="2" stroke-linecap="square"/>
                  </svg>

              </BreadcrumbSeparator>
            )}
            <BreadcrumbItem>
              {index === breadcrumbs.length - 1 ? (
                <div className="flex items-center gap-2">
                  <BreadcrumbPage className="text-[#035C4C] text-[32px] font-[500]">
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
                        className="h-6 w-6 bg-[#fff] rounded focus:outline-none focus:ring-0 focus:border-transparent focus-visible:outline-none focus-visible:ring-0"
                      >
                        {actionsDropdownOpen ? (
                          // <ChevronUp className="w-4 h-4 text-gray-600" />
                          <svg className="rotate-180" width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <mask id="path-1-inside-1_381_567" fill="white">
                          <path d="M0 0L6 6L12 0"/>
                          </mask>
                          <path d="M0 0L6 6L12 0" fill="#035C4C"/>
                          <path d="M1.41421 -1.41421L0 -2.82843L-2.82843 0L-1.41421 1.41421L0 0L1.41421 -1.41421ZM6 6L4.58579 7.41421L6 8.82843L7.41421 7.41421L6 6ZM13.4142 1.41421L14.8284 0L12 -2.82843L10.5858 -1.41421L12 0L13.4142 1.41421ZM0 0L-1.41421 1.41421L4.58579 7.41421L6 6L7.41421 4.58579L1.41421 -1.41421L0 0ZM6 6L7.41421 7.41421L13.4142 1.41421L12 0L10.5858 -1.41421L4.58579 4.58579L6 6Z" fill="#035C4C" mask="url(#path-1-inside-1_381_567)"/>
                          </svg>

                          
                        ) : (
                          // <ChevronDown className="w-4 h-4 text-gray-600" />
                          <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <mask id="path-1-inside-1_381_567" fill="white">
                          <path d="M0 0L6 6L12 0"/>
                          </mask>
                          <path d="M0 0L6 6L12 0" fill="#035C4C"/>
                          <path d="M1.41421 -1.41421L0 -2.82843L-2.82843 0L-1.41421 1.41421L0 0L1.41421 -1.41421ZM6 6L4.58579 7.41421L6 8.82843L7.41421 7.41421L6 6ZM13.4142 1.41421L14.8284 0L12 -2.82843L10.5858 -1.41421L12 0L13.4142 1.41421ZM0 0L-1.41421 1.41421L4.58579 7.41421L6 6L7.41421 4.58579L1.41421 -1.41421L0 0ZM6 6L7.41421 7.41421L13.4142 1.41421L12 0L10.5858 -1.41421L4.58579 4.58579L6 6Z" fill="#035C4C" mask="url(#path-1-inside-1_381_567)"/>
                          </svg>

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
                  className="text-[#1E1E1E] text-[32px] hover:text-teal-600 transition-colors font-[500] cursor-pointer"
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