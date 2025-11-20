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

import type { FileItem } from "@/types/fileSystem";

interface ListViewProps {
  items: FileItem[];
  onItemClick: (item: FileItem) => void;
  onRename: (item: FileItem) => void;
  onDelete: (item: FileItem) => void;
  onDownload: (item: FileItem) => void;
  onShowInfo: (item: FileItem) => void;
  onAddTags: (item: FileItem) => void;
  onReupload: (documentId: string) => void;
  selectedIds: {
    fileIds: string[];
    folderIds: string[];
  };
  onSelectItem: (
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    item: { id: string; type: string }
  ) => void;
}

type SortField = "name" | "date";
type SortOrder = "asc" | "desc";

export default function ListView({
  items,
  onItemClick,
  onRename,
  onDelete,
  onDownload,
  onShowInfo,
  onAddTags,
  onReupload,
  selectedIds,
  onSelectItem,
}: ListViewProps) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "—";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const isFolder = (item: FileItem) => item.type === "folder";

  const handleSort = (field: SortField) => {
    field === sortField
      ? setSortOrder(sortOrder === "asc" ? "desc" : "asc")
      : (setSortField(field), setSortOrder("asc"));
  };

  const getSortedItems = (): FileItem[] => {
    const folders = items.filter((i) => i.type === "folder");
    const files = items.filter((i) => i.type !== "folder");

    const sortFn = (a: FileItem, b: FileItem) => {
      if (sortField === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      return sortOrder === "asc"
        ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    };

    return [...folders.sort(sortFn), ...files.sort(sortFn)];
  };

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field ? (
      sortOrder === "asc" ? (
        <ArrowUp className="w-4 h-4" />
      ) : (
        <ArrowDown className="w-4 h-4" />
      )
    ) : null;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getCreatorInfo = (item: FileItem) => {
    const username = item.createdBy.username || "Unknown";
    return {
      username,
      email: item.createdBy.email || "",
      initials: username !== "Unknown" ? getInitials(username) : "UN",
    };
  };

  const sortedItems = getSortedItems();

  return (
    <div className="w-full">
      <TooltipProvider>
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-scroll">
          <div className="overflow-x-scroll ">
            <table className="w-full min-w-[900px]  ">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="border-b border-gray-200">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <th
                        className="px-6 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer group"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center gap-2">
                          Name
                          <span
                            className={`${
                              sortField === "name"
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            <SortIcon field="name" />
                          </span>
                        </div>
                      </th>
                    </TooltipTrigger>
                    <TooltipContent>
                      {sortField === "name"
                        ? `Click to sort ${
                            sortOrder === "asc" ? "Z → A" : "A → Z"
                          }`
                        : "Sort A → Z"}
                    </TooltipContent>
                  </Tooltip>

                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 w-64">
                    Owner
                  </th>

                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 w-48">
                    Date created
                  </th>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <th
                        className="px-6 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer group w-48"
                        onClick={() => handleSort("date")}
                      >
                        <div className="flex items-center gap-2">
                          Date modified
                          <span
                            className={`${
                              sortField === "date"
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            <SortIcon field="date" />
                          </span>
                        </div>
                      </th>
                    </TooltipTrigger>
                    <TooltipContent>
                      {sortField === "date"
                        ? `Click to sort ${
                            sortOrder === "asc"
                              ? "Newest → Oldest"
                              : "Oldest → Newest"
                          }`
                        : "Sort Oldest → Newest"}
                    </TooltipContent>
                  </Tooltip>

                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 w-32">
                    File size
                  </th>

                  <th className="px-6 py-3 text-center w-12">
                    <MoreVertical className="w-4 h-4 mx-auto text-gray-500" />
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {sortedItems.map((item) => {
                  const creator = getCreatorInfo(item);

                  const isSelected =
                    item.type === "folder"
                      ? selectedIds.folderIds.includes(item._id)
                      : selectedIds.fileIds.includes(item._id);

                  return (
                    <tr
                      key={item._id}
                      className={`transition-colors ${
                        isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                      } cursor-pointer`}
                      onClick={(e) =>
                        onSelectItem(e, { id: item._id, type: item.type })
                      }
                      onDoubleClick={() => onItemClick(item)}
                    >
                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {isFolder(item) ? (
                            <>
                              <div
                                className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                                style={{
                                  backgroundColor: item.color || "#64748B",
                                }}
                              >
                                <Folder className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm font-medium text-gray-800 truncate">
                                {item.name}
                              </span>
                            </>
                          ) : (
                            <>
                              <FileText className="w-6 h-6 text-gray-600 flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-800 truncate">
                                {item.extension
                                  ? `${item.name}.${item.extension}`
                                  : item.name}
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Owner */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-medium">
                              {creator.initials}
                            </span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {creator.username}
                            </span>
                            {creator.email && (
                              <span className="text-xs text-gray-500 truncate">
                                {creator.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Date created */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(item.createdAt)}
                      </td>

                      {/* Date modified */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(item.updatedAt)}
                      </td>

                      {/* Size */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {isFolder(item) ? "—" : formatFileSize(item.size)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
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
                                    onShowInfo(item);
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
                                    toast.info("Coming soon");
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
                                    to={`/dashboard/version-history/${item._id}`}
                                    className="flex items-center w-full"
                                  >
                                    <History className="w-4 h-4 mr-2" /> Version
                                    History
                                  </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast.info("Coming soon");
                                  }}
                                >
                                  <Activity className="w-4 h-4 mr-2" /> Activity
                                </DropdownMenuItem>
                              </>
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}