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

import type { FileItem } from '@/types/documentTypes';

interface GridViewProps {
  items: FileItem[];
  selectedIds: {
    fileIds: string[];
    folderIds: string[];
  };
  onSelectItem: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>, 
    item: { id: string; type: string },
    itemIndex: number
  ) => void;
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
      {items.map((item: FileItem, index: number) => {
        const isSelected = isItemSelected(item);
        
        return (
          <div
            key={item._id}
            className={`bg-white rounded-lg hover:shadow-md transition-all cursor-pointer overflow-hidden border border-[#919191] ${
              isSelected ? ' ring-2 ring-blue-200' : ''
            }`}
            onClick={(e) => onSelectItem(e, { id: item._id, type: item.type }, index)}
            onDoubleClick={() => onItemClick(item)}
          >
            {/* Header with icon, name, and menu */}
            <div className="px-3 py-2.5 pb-1 flex items-center gap-2 bg-white">
              {isFolder(item) ? (
                <div className="rounded flex items-center justify-center flex-shrink-0">
                  <svg width="22" height="19" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.8008 17.8C19.3312 17.8 19.8399 17.5893 20.215 17.2143C20.5901 16.8392 20.8008 16.3305 20.8008 15.8V5.80005C20.8008 5.26962 20.5901 4.76091 20.215 4.38584C19.8399 4.01076 19.3312 3.80005 18.8008 3.80005H10.9008C10.5663 3.80333 10.2363 3.72266 9.94108 3.56543C9.64584 3.4082 9.39474 3.17942 9.21078 2.90005L8.40078 1.70005C8.21867 1.42352 7.97076 1.19653 7.67928 1.03945C7.3878 0.882363 7.06189 0.800103 6.73078 0.800049H2.80078C2.27035 0.800049 1.76164 1.01076 1.38657 1.38584C1.01149 1.76091 0.800781 2.26962 0.800781 2.80005V15.8C0.800781 16.3305 1.01149 16.8392 1.38657 17.2143C1.76164 17.5893 2.27035 17.8 2.80078 17.8H18.8008Z" stroke="#1E1E1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              ) : (
                <svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.8008 0.800052H2.80078C2.27035 0.800052 1.76164 1.01077 1.38657 1.38584C1.01149 1.76091 0.800781 2.26962 0.800781 2.80005V18.8001C0.800781 19.3305 1.01149 19.8392 1.38657 20.2143C1.76164 20.5893 2.27035 20.8001 2.80078 20.8001H14.8008C15.3312 20.8001 15.8399 20.5893 16.215 20.2143C16.5901 19.8392 16.8008 19.3305 16.8008 18.8001V6.80005M10.8008 0.800052C11.1173 0.799539 11.4309 0.861654 11.7233 0.982821C12.0158 1.10399 12.2813 1.28181 12.5048 1.50605L16.0928 5.09405C16.3176 5.31756 16.496 5.5834 16.6175 5.87621C16.739 6.16903 16.8013 6.48302 16.8008 6.80005M10.8008 0.800052V5.80005C10.8008 6.06527 10.9061 6.31962 11.0937 6.50716C11.2812 6.69469 11.5356 6.80005 11.8008 6.80005L16.8008 6.80005" stroke="#1E1E1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
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
            <div className='bg-[#fff] p-2'>
              <div className="aspect-square flex items-center rounded-lg justify-center p-4 p-1 bg-[#F5F5F5]">
                {isFolder(item) ? (
                  <div className="w-20 h-20 rounded-xl flex items-center justify-center">
                    <svg width="87" height="75" viewBox="0 0 87 75" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M76.8008 72.6334C79.0109 72.6334 81.1305 71.7554 82.6933 70.1926C84.2561 68.6298 85.1341 66.5102 85.1341 64.3001V22.6334C85.1341 20.4232 84.2561 18.3036 82.6933 16.7408C81.1305 15.178 79.0109 14.3 76.8008 14.3H43.8841C42.4904 14.3137 41.1156 13.9776 39.8854 13.3225C38.6552 12.6673 37.609 11.7141 36.8424 10.55L33.4675 5.55005C32.7087 4.39784 31.6757 3.45204 30.4612 2.79753C29.2467 2.14302 27.8887 1.80028 26.5091 1.80005H10.1341C7.92398 1.80005 5.80436 2.67802 4.24156 4.24083C2.67875 5.80363 1.80078 7.92325 1.80078 10.1334V64.3001C1.80078 66.5102 2.67875 68.6298 4.24156 70.1926C5.80436 71.7554 7.92398 72.6334 10.1341 72.6334H76.8008Z" stroke="#1E1E1E" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
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
                  <svg width="71" height="87" viewBox="0 0 71 87" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M43.4674 1.80006H10.1341C7.92398 1.80006 5.80436 2.67804 4.24156 4.24084C2.67875 5.80364 1.80078 7.92326 1.80078 10.1334V76.8001C1.80078 79.0102 2.67875 81.1298 4.24156 82.6926C5.80436 84.2554 7.92398 85.1334 10.1341 85.1334H60.1341C62.3442 85.1334 64.4639 84.2554 66.0267 82.6926C67.5895 81.1298 68.4674 79.0102 68.4674 76.8001V26.8001M43.4674 1.80006C44.7864 1.79792 46.0928 2.05674 47.3113 2.5616C48.5299 3.06646 49.6365 3.80739 50.5674 4.74173L65.5174 19.6917C66.4543 20.623 67.1973 21.7307 67.7037 22.9507C68.21 24.1708 68.4696 25.4791 68.4674 26.8001M43.4674 1.80006V22.6334C43.4674 23.7385 43.9064 24.7983 44.6878 25.5797C45.4692 26.3611 46.529 26.8001 47.6341 26.8001L68.4674 26.8001" stroke="#1E1E1E" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}