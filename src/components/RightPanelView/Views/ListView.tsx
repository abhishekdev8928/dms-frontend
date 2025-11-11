import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  FileText,
  Folder,
  MoreVertical,
  Pencil,
  Trash2,
  Download,
  Eye,
  Users,
  RefreshCw,
  History,
  Activity,
  Tag,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
        username?: string;
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

interface ListViewProps {
  items: FileItem[];
  onItemClick: (item: FileItem) => void;
  onRename: (item: FileItem) => void;
  onDelete: (item: FileItem) => void;
  onDownload: (item: FileItem) => void;
  onShowInfo: (fileId: string, e?: React.MouseEvent) => void;
  onAddTags: (item: FileItem) => void;
  onReupload: (documentId: string) => void;
}

type SortField = "name" | "date";
type SortOrder = "asc" | "desc";

export default function ListView({
  items,
  onRename,
  onDelete,
  onDownload,
  onShowInfo,
  onAddTags,
  onReupload,
}: ListViewProps) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "-";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const isFolder = (item: FileItem): boolean =>
    item.type === "folder" || item.itemType === "folder";

  // const handleRowClick = (item: FileItem): void => { {
  //   if (isFolder(item)) {
  //     onItemClick(item);
  //   }
  // };

  const handleSort = (field: SortField): void => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortedItems = (): FileItem[] => {
    const sorted = [...items].sort((a, b) => {
      if (sortField === "name") {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return sortOrder === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      } else {
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
    });
    return sorted;
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    const isActive = sortField === field;
    if (!isActive) return null;
    return sortOrder === "asc" ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getCreatorInfo = (
    item: FileItem
  ): { username: string; email: string; initials: string } => {
    if (typeof item.createdBy === "string") {
      return {
        username: "Unknown",
        email: "",
        initials: "UN",
      };
    }

    const username =
      item.createdBy.username || item.createdBy.name || "Unknown";
    const email = item.createdBy.email || "";
    const initials = username !== "Unknown" ? getInitials(username) : "UN";

    return { username, email, initials };
  };

  const sortedItems = getSortedItems();

  return (
    <div className="bg-white">
      <TooltipProvider>
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-200 text-sm font-medium text-gray-700">
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="col-span-5 flex items-center gap-2 cursor-pointer hover:text-gray-900 group"
                onClick={() => handleSort("name")}
              >
                Name
                <div
                  className={`transition-opacity ${
                    sortField === "name"
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <SortIcon field="name" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {sortField === "name"
                  ? `Click to sort ${sortOrder === "asc" ? "Z → A" : "A → Z"}`
                  : "Sort A → Z"}
              </p>
            </TooltipContent>
          </Tooltip>

          <div className="col-span-2">Owner</div>

          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="col-span-3 flex items-center gap-2 cursor-pointer hover:text-gray-900 group"
                onClick={() => handleSort("date")}
              >
                Date Modified
                <div
                  className={`transition-opacity ${
                    sortField === "date"
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <SortIcon field="date" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {sortField === "date"
                  ? `Click to sort ${
                      sortOrder === "asc"
                        ? "Newest → Oldest"
                        : "Oldest → Newest"
                    }`
                  : "Sort Oldest → Newest"}
              </p>
            </TooltipContent>
          </Tooltip>

          <div className="col-span-2">File Size</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {sortedItems.map((item: FileItem) => {
            const creator = getCreatorInfo(item);

            return (
              <div
                key={item._id}
                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
              >
                {/* Name column */}
                <div
                  className={`col-span-5 flex items-center gap-3 ${
                    isFolder(item) ? "cursor-pointer" : ""
                  }`}
                >
                  {isFolder(item) ? (
                    <Link
                      to={`/dashboard/folder/${item._id}`}
                      className="flex items-center gap-3 flex-1"
                    >
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: item.color || "#64748B" }}
                      >
                        <Folder className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {item.name}
                      </span>
                    </Link>
                  ) : (
                    <>
                      <FileText className="w-6 h-6 text-gray-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {item.type === "documents" && item.extension
                          ? `${item.name}.${item.extension}`
                          : item.name}
                      </span>
                    </>
                  )}
                </div>

                {/* Owner column */}
                <div className="col-span-2 flex items-center gap-2">
                 
                 
                    
                    {creator.email && (
                      <span className="text-xs text-gray-500 truncate">
                        {creator.email}
                      </span>
                    )}
                  
                </div>

                {/* Date column */}
                <div className="col-span-3 flex items-center text-sm text-gray-600">
                  {formatDate(item.updatedAt)}
                </div>

                {/* Size and actions column */}
                <div className="col-span-2 flex items-center justify-between text-sm text-gray-600">
                  <span>
                    {isFolder(item) ? "-" : formatFileSize(item.size)}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onRename(item);
                        }}
                      >
                        <Pencil className="w-4 h-4 mr-2" /> Rename
                      </DropdownMenuItem>

                      {!isFolder(item) && (
                        <>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onDownload(item);
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" /> Download
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onShowInfo(item._id, e);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddTags(item);
                            }}
                          >
                            <Tag className="w-4 h-4 mr-2" /> Add Tags
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.info("Manage Access feature coming soon");
                            }}
                          >
                            <Users className="w-4 h-4 mr-2" /> Manage Access
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onReupload(item._id);
                            }}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" /> Reupload
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link
                              className="flex items-center"
                              to={`/document/version-history/${item._id}`}
                            >
                              <History className="w-4 h-4 mr-2" /> Version
                              History
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.info("Activity feature coming soon");
                            }}
                          >
                            <Activity className="w-4 h-4 mr-2" /> Activity
                          </DropdownMenuItem>
                        </>
                      )}

                      {isFolder(item) && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info("Manage Access feature coming soon");
                          }}
                        >
                          <Users className="w-4 h-4 mr-2" /> Manage Access
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Move to Trash
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}
