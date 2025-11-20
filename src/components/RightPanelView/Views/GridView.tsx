import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

import type { FileItem } from '@/types/fileSystem';

interface GridViewProps {
  items: FileItem[];
  selectedIds: {
    fileIds: string[];
    folderIds: string[];
  };
  onSelectItem: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, item: { id: string; type: string }) => void;
  onItemClick: (item: FileItem) => void;
  onRename: (item: FileItem) => void;
  onDelete: (item: FileItem) => void;
  onDownload: (item: FileItem) => void;
  onShowInfo: (item: FileItem) => void;
  onAddTags: (item: FileItem) => void;
  onReupload: (documentId: string) => void;
}

export default function GridView({
  items,
  selectedIds,
  onSelectItem,
  onItemClick,
  onRename,
  onDelete,
  onDownload,
  onShowInfo,
  onAddTags,
  onReupload,
}: GridViewProps) {
  const isImageFile = (filename: string): boolean => {
    return /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(filename);
  };

  const getImageUrl = (item: FileItem): string => {
    return `https://d1rf5tmmedb5ah.cloudfront.net/${item.fileUrl}`;
  };

  const isFolder = (item: FileItem): boolean => 
    item.type === 'folder' || item.itemType === 'folder';

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
    e.currentTarget.style.display = 'none';
    const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
    if (fallback) {
      fallback.style.display = 'flex';
    }
  };

  const getDisplayName = (item: FileItem): string => {
    if (item.type === "documents" && item.extension) {
      return `${item.name}.${item.extension}`;
    }
    return item.name;
  };

  const isItemSelected = (item: FileItem): boolean => {
    return item.type === "folder"
      ? selectedIds.folderIds.includes(item._id)
      : selectedIds.fileIds.includes(item._id);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4">
      {items.map((item: FileItem) => {
        const isSelected = isItemSelected(item);
        
        return (
          <div
            key={item._id}
            className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden border ${
              isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100'
            }`}
            onClick={(e) => onSelectItem(e, { id: item._id, type: item.type })}
            onDoubleClick={() => onItemClick(item)}
          >
            {/* Header with icon, name, and menu */}
            <div className="px-3 py-2.5 flex items-center gap-2 border-b bg-gray-50 border-gray-100">
              {isFolder(item) ? (
                <div 
                  className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" 
                  style={{ backgroundColor: item.color || '#64748B' }}
                >
                  <Folder className="w-3 h-3 text-white" />
                </div>
              ) : (
                <FileText className="w-4 h-4 text-gray-600 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-800 truncate block">
                  {getDisplayName(item)}
                </span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onRename(item);
                  }}>
                    <Pencil className="w-4 h-4 mr-2" /> Rename
                  </DropdownMenuItem>

                  {!isFolder(item) && (
                    <>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onDownload(item);
                      }}>
                        <Download className="w-4 h-4 mr-2" /> Download
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onShowInfo(item);
                      }}>
                        <Eye className="w-4 h-4 mr-2" /> View Details
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onAddTags(item);
                      }}>
                        <Tag className="w-4 h-4 mr-2" /> Add Tags
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        toast.info('Manage Access feature coming soon');
                      }}>
                        <Users className="w-4 h-4 mr-2" /> Manage Access
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onReupload(item._id);
                      }}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Reupload
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <Link className='flex items-center' to={`/dashboard/version-history/${item._id}`}>
                          <History className="w-4 h-4 mr-2" /> Version History
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        toast.info('Activity feature coming soon');
                      }}>
                        <Activity className="w-4 h-4 mr-2" /> Activity
                      </DropdownMenuItem>
                    </>
                  )}

                  {isFolder(item) && (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      toast.info('Manage Access feature coming soon');
                    }}>
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

            {/* Preview area */}
            <div className="aspect-square flex items-center justify-center p-4 bg-white">
              {isFolder(item) ? (
                <div 
                  className="w-20 h-20 rounded-xl flex items-center justify-center shadow-sm" 
                  style={{ backgroundColor: item.color || '#64748B' }}
                >
                  <Folder className="w-12 h-12 text-white" />
                </div>
              ) : item.originalName && isImageFile(item.originalName) && item.fileUrl ? (
                <div className="w-full h-full relative">
                  <img 
                    src={getImageUrl(item)} 
                    alt={item.name}
                    className="w-full h-full object-contain"
                    onError={handleImageError}
                  />
                  <div className="w-full h-full items-center justify-center hidden absolute inset-0">
                    <FileText className="w-16 h-16 text-gray-400" />
                  </div>
                </div>
              ) : (
                <FileText className="w-16 h-16 text-gray-400" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}