import React from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
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
  FolderInput,
  Star,
  StarOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMutationAddStarred, useMutationRemoveStarred } from "@/hooks/mutations/useStarredMutation";

import type { FileItem } from "@/types/documentTypes";

interface ListViewProps {
  items: FileItem[];
  sortField: "name" | "date";
  sortOrder: "asc" | "desc";
  onSort: (field: "name" | "date") => void;
  onItemClick: (item: FileItem) => void;
  onRename: (item: FileItem) => void;
  onDelete: (item: FileItem) => void;
  onDownload: (item: FileItem) => void;
  onShowInfo: (item: FileItem) => void;
  onAddTags: (item: FileItem) => void;
  onReupload: (documentId: string) => void;
  onShare: (item: FileItem) => void;
  onMove?: (item: FileItem) => void;
  selectedIds: {
    fileIds: string[];
    folderIds: string[];
  };
  onSelectItem: (
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    item: { id: string; type: string },
    itemIndex: number
  ) => void;
}

export default function ListView({
  items,
  sortField,
  sortOrder,
  onSort,
  onItemClick,
  onRename,
  onDelete,
  onDownload,
  onShowInfo,
  onAddTags,
  onReupload,
  selectedIds,
  onSelectItem,
  onShare,
  onMove,
}: ListViewProps) {
  // Starred mutations
  const addStarred = useMutationAddStarred({
    onSuccess: (data) => {
      toast.success(data.message || "Added to starred successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add to starred");
    },
  });

  const removeStarred = useMutationRemoveStarred({
    onSuccess: (data) => {
      toast.success(data.message || "Removed from starred successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to remove from starred");
    },
  });

  const handleToggleStarred = (item: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (item.starred) {
      removeStarred.mutate({ id: item._id, type: item.type });
    } else {
      addStarred.mutate({ id: item._id, type: item.type });
    }
  };

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

  return (
    <div className="w-full">
      <TooltipProvider>
        <div className="bg-white rounded-lg overflow-x-scroll">
          <div>
            <table className="w-full min-w-[900px]">
              <thead className="bg-[#fff] sticky top-0 z-10">
                <tr className="border-b border-gray-200">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <th
                        className="px-6 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer group"
                        onClick={() => onSort("name")}
                      >
                        <div className="flex items-center gap-2 text-[16px] font-[600] text-[#035C4C]">
                          Name
                          <span
                            className={`${
                              sortField === "name"
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="22.1333" height="22.1333" rx="3.2" fill="#035C4C"/>
                              <path d="M6.40039 11.0666L11.0671 6.3999M11.0671 6.3999L15.7337 11.0666M11.0671 6.3999V15.7332" stroke="white" strokeWidth="1.2" strokeLinecap="square"/>
                            </svg>
                          </span>
                        </div>
                      </th>
                    </TooltipTrigger>
                    <TooltipContent>
                      {sortField === "name"
                        ? `Click to sort ${sortOrder === "asc" ? "Z → A" : "A → Z"}`
                        : "Sort A → Z"}
                    </TooltipContent>
                  </Tooltip>

                  <th className="px-6 py-3 text-[16px] font-[400] text-left text-sm font-medium text-gray-700 w-64">
                    Owner
                  </th>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <th
                        className="px-6 py-3 text-[16px] font-[400] text-left text-sm font-medium text-gray-700 cursor-pointer group w-48"
                        onClick={() => onSort("date")}
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
                            {sortOrder === "asc" ? (
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 2V10M6 2L3 5M6 2L9 5" stroke="#035C4C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 10V2M6 10L3 7M6 10L9 7" stroke="#035C4C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </span>
                        </div>
                      </th>
                    </TooltipTrigger>
                    <TooltipContent>
                      {sortField === "date"
                        ? `Click to sort ${sortOrder === "asc" ? "Newest → Oldest" : "Oldest → Newest"}`
                        : "Sort Oldest → Newest"}
                    </TooltipContent>
                  </Tooltip>

                  <th className="px-6 py-3 text-[16px] font-[400] text-left text-sm font-medium text-gray-700 w-32">
                    File size
                  </th>

                  <th className="px-6 py-3 text-center w-12">
                    <svg width="19" height="17" viewBox="0 0 19 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12L4.66667 15.6667M4.66667 15.6667L8.33333 12M4.66667 15.6667V1M17.5 4.66667L13.8333 1M13.8333 1L10.1667 4.66667M13.8333 1V15.6667" stroke="#434343" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {items.map((item, index) => {
                  const creator = getCreatorInfo(item);
                  const isSelected =
                    item.type === "folder"
                      ? selectedIds.folderIds.includes(item._id)
                      : selectedIds.fileIds.includes(item._id);

                  return (
                    <tr
                      key={item._id}
                      className={`transition-colors border-b border-gray-200 ${
                        isSelected ? "bg-blue-50" : "hover:bg-[#F6FFFD]"
                      } cursor-pointer`}
                      onClick={(e) =>
                        onSelectItem(e, { id: item._id, type: item.type }, index)
                      }
                      onDoubleClick={() => onItemClick(item)}
                    >
                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {isFolder(item) ? (
                            <>
                              <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0">
                                <svg width="22" height="19" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M18.8008 17.8C19.3312 17.8 19.8399 17.5893 20.215 17.2143C20.5901 16.8392 20.8008 16.3305 20.8008 15.8V5.80005C20.8008 5.26962 20.5901 4.76091 20.215 4.38584C19.8399 4.01076 19.3312 3.80005 18.8008 3.80005H10.9008C10.5663 3.80333 10.2363 3.72266 9.94108 3.56543C9.64584 3.4082 9.39474 3.17942 9.21078 2.90005L8.40078 1.70005C8.21867 1.42352 7.97076 1.19653 7.67928 1.03945C7.3878 0.882363 7.06189 0.800103 6.73078 0.800049H2.80078C2.27035 0.800049 1.76164 1.01076 1.38657 1.38584C1.01149 1.76091 0.800781 2.26962 0.800781 2.80005V15.8C0.800781 16.3305 1.01149 16.8392 1.38657 17.2143C1.76164 17.5893 2.27035 17.8 2.80078 17.8H18.8008Z" stroke="#1E1E1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                              <span className="text-[16px] font-medium text-gray-800 truncate">
                                {item.name}
                              </span>
                            </>
                          ) : (
                            <>
                              <svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.8008 0.800052H2.80078C2.27035 0.800052 1.76164 1.01077 1.38657 1.38584C1.01149 1.76091 0.800781 2.26962 0.800781 2.80005V18.8001C0.800781 19.3305 1.01149 19.8392 1.38657 20.2143C1.76164 20.5893 2.27035 20.8001 2.80078 20.8001H14.8008C15.3312 20.8001 15.8399 20.5893 16.215 20.2143C16.5901 19.8392 16.8008 19.3305 16.8008 18.8001V6.80005M10.8008 0.800052C11.1173 0.799539 11.4309 0.861654 11.7233 0.982821C12.0158 1.10399 12.2813 1.28181 12.5048 1.50605L16.0928 5.09405C16.3176 5.31756 16.496 5.5834 16.6175 5.87621C16.739 6.16903 16.8013 6.48302 16.8008 6.80005M10.8008 0.800052V5.80005C10.8008 6.06527 10.9061 6.31962 11.0937 6.50716C11.2812 6.69469 11.5356 6.80005 11.8008 6.80005L16.8008 6.80005" stroke="#1E1E1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span className="text-sm font-medium text-gray-800 truncate">
                                {item.extension ? `${item.name}.${item.extension}` : item.name}
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
                        </div>
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
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <FolderInput className="w-4 h-4 mr-2" /> Organize
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onMove?.(item);
                                  }}
                                >
                                  <FolderInput className="w-4 h-4 mr-2" /> Move
                                </DropdownMenuItem>
                                
                                {/* Dynamic Starred Menu Item */}
                                <DropdownMenuItem
                                  onClick={(e) => handleToggleStarred(item, e)}
                                  disabled={addStarred.isPending || removeStarred.isPending}
                                >
                                  {item.starred ? (
                                    <>
                                      <StarOff className="w-4 h-4 mr-2" /> Remove from Starred
                                    </>
                                  ) : (
                                    <>
                                      <Star className="w-4 h-4 mr-2" /> Add to Starred
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>

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
                                    onShare(item);
                                  }}
                                >
                                  <Users className="w-4 h-4 mr-2" /> Share 
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
                                    <History className="w-4 h-4 mr-2" /> Version History
                                  </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onShowInfo(item , "activity");
                                    
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