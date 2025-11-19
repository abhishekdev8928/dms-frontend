import { useQuery } from '@tanstack/react-query';
import { X, FolderIcon, FileText, Upload, Edit, Trash, Download, RotateCcw } from 'lucide-react';
import { useState } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { getDocumentById } from '@/config/api/documentApi';
import { getFolderById } from '@/config/api/folderApi';
import { getFileActivity, getFolderActivity } from '@/config/api/activityApi';
import type { FileItem } from '@/types/fileSystem';
import type { Activity } from '@/config/api/activityApi';

interface FileInfoPanelProps {
  item: FileItem;
  onClose: () => void;
}

export default function FileInfoPanel({ item, onClose }: FileInfoPanelProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');
  
  const itemType = item.type === 'folder' ? 'folder' : 'file';

  // Fetch detailed document data (only if file)
  const { data: documentData, isLoading: isLoadingDoc } = useQuery({
    queryKey: ['document', item._id],
    queryFn: () => getDocumentById(item._id),
    enabled: itemType === 'file',
    staleTime: 30000,
  });

  // Fetch detailed folder data (only if folder)
  const { data: folderData, isLoading: isLoadingFolder } = useQuery({
    queryKey: ['folder', item._id],
    queryFn: () => getFolderById(item._id),
    enabled: itemType === 'folder',
    staleTime: 30000,
  });

  // Fetch file activity
  const { data: fileActivityData, isLoading: isLoadingFileActivity } = useQuery({
    queryKey: ['fileActivity', item._id],
    queryFn: () => getFileActivity({ fileId: item._id, limit: 50 }),
    enabled: activeTab === 'activity' && itemType === 'file',
    staleTime: 30000,
  });

  // Fetch folder activity
  const { data: folderActivityData, isLoading: isLoadingFolderActivity } = useQuery({
    queryKey: ['folderActivity', item._id],
    queryFn: () => getFolderActivity({ folderId: item._id, limit: 50 }),
    enabled: activeTab === 'activity' && itemType === 'folder',
    staleTime: 30000,
  });

  const isLoading = itemType === 'file' ? isLoadingDoc : isLoadingFolder;
  const isLoadingActivity = itemType === 'file' ? isLoadingFileActivity : isLoadingFolderActivity;
  
  const detailedItem = itemType === 'file' 
    ? (documentData?.data || documentData || item)
    : (folderData?.data || folderData || item);

  const activityData = itemType === 'file' ? fileActivityData : folderActivityData;
  const activities = activityData?.data?.activities || [];

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '-';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getUserInitials = (user?: { name?: string; email?: string } | string) => {
    if (!user) return 'A';
    
    if (typeof user === 'string') {
      if (user === 'me') return 'A';
      if (user.includes('@')) {
        const namePart = user.split('@')[0];
        const parts = namePart.split(/[._-]/);
        if (parts.length >= 2) {
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return namePart.substring(0, 2).toUpperCase();
      }
    }
    
    if (typeof user === 'object') {
      const name = user.name || user.email || '';
      if (name.includes('@')) {
        const namePart = name.split('@')[0];
        const parts = namePart.split(/[._-]/);
        if (parts.length >= 2) {
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return namePart.substring(0, 2).toUpperCase();
      }
      const words = name.split(' ');
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    
    return 'A';
  };

  const getTitle = () => {
    if (itemType === 'folder') {
      return detailedItem?.name || 'Folder';
    }
    return detailedItem?.name ? `${detailedItem.name}.${detailedItem.extension}` : 'File';
  };

  const getFileIcon = () => {
    if (itemType === 'folder') {
      return (
        <div className="w-8 h-8 flex items-center justify-center">
          <FolderIcon className="w-6 h-6 text-gray-600" fill="currentColor" />
        </div>
      );
    }
    
    if (detailedItem?.extension === 'pdf' || detailedItem?.mimeType?.includes('pdf')) {
      return (
        <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
          PDF
        </div>
      );
    }
    
    if (detailedItem?.extension === 'xlsx' || detailedItem?.extension === 'xls') {
      return (
        <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">
          X
        </div>
      );
    }

    if (detailedItem?.extension === 'doc' || detailedItem?.extension === 'docx') {
      return (
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
          W
        </div>
      );
    }

    if (detailedItem?.mimeType?.includes('image')) {
      return (
        <div className="w-8 h-8 bg-red-400 rounded flex items-center justify-center text-white text-xs font-bold">
          📷
        </div>
      );
    }
    
    return (
      <div className="w-8 h-8 bg-gray-400 rounded flex items-center justify-center text-white text-xs font-bold">
        F
      </div>
    );
  };

  const getActionIcon = (action: string) => {
    if (action.includes('CREATED') || action.includes('UPLOADED')) {
      return <Upload className="w-4 h-4 text-green-600" />;
    }
    if (action.includes('UPDATED') || action.includes('RENAMED') || action.includes('MOVED')) {
      return <Edit className="w-4 h-4 text-blue-600" />;
    }
    if (action.includes('DELETED')) {
      return <Trash className="w-4 h-4 text-red-600" />;
    }
    if (action.includes('RESTORED')) {
      return <RotateCcw className="w-4 h-4 text-green-600" />;
    }
    if (action.includes('DOWNLOADED')) {
      return <Download className="w-4 h-4 text-purple-600" />;
    }
    return <FileText className="w-4 h-4 text-gray-600" />;
  };

  const renderPreview = () => {
    if (itemType === 'folder') {
      return (
        <div className="px-4 py-8 flex items-center justify-center bg-white">
          <FolderIcon className="w-40 h-40 text-gray-400" strokeWidth={1} />
        </div>
      );
    }

    if (detailedItem?.mimeType?.startsWith('image/')) {
      return (
        <div className="px-4 py-4 bg-white">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <img 
              src={detailedItem?.url || detailedItem?.path} 
              alt={detailedItem?.name}
              className="w-full h-auto max-h-80 object-contain"
            />
          </div>
        </div>
      );
    }

    if (detailedItem?.thumbnailUrl || detailedItem?.previewUrl) {
      return (
        <div className="px-4 py-4 bg-white">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <img 
              src={detailedItem.thumbnailUrl || detailedItem.previewUrl} 
              alt={detailedItem?.name}
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      );
    }

    return null;
  };

  const getFileType = () => {
    if (itemType === 'folder') return 'Folder';
    
    if (detailedItem?.extension === 'pdf') return 'PDF';
    if (detailedItem?.extension === 'xlsx' || detailedItem?.extension === 'xls') return 'Microsoft Excel';
    if (detailedItem?.extension === 'doc' || detailedItem?.extension === 'docx') return 'Microsoft Word';
    if (detailedItem?.mimeType?.includes('spreadsheet')) return 'Spreadsheet';
    if (detailedItem?.mimeType?.includes('document')) return 'Document';
    if (detailedItem?.mimeType?.includes('image')) return 'Image';
    
    return detailedItem?.extension?.toUpperCase() || 'File';
  };

  const renderDetailsTab = () => (
    <div className="bg-white">
      {renderPreview()}

      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-normal text-gray-900">Who has access</h3>
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white text-base font-medium">
            {getUserInitials()}
          </div>
          <div className="flex-1">
            <p className="text-base text-gray-900">Private to you</p>
          </div>
        </div>

        <button className="w-full py-2.5 px-4 border-2 border-blue-600 rounded-full text-blue-600 text-sm font-medium hover:bg-blue-50 transition-colors">
          Manage access
        </button>
      </div>

      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-normal text-gray-900 mb-1">Security limitations</h3>
            <p className="text-base text-gray-900 font-medium mb-0.5">No limitations applied</p>
            <p className="text-sm text-gray-600">If any are applied, they will appear here</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <h3 className="text-lg font-normal text-gray-900 mb-4">
          {itemType === 'folder' ? 'Folder details' : 'File details'}
        </h3>
        
        <div className="space-y-6">
          <div>
            <div className="text-base font-normal text-gray-900 mb-1">Type</div>
            <p className="text-base text-gray-700">{getFileType()}</p>
          </div>

          {itemType === 'file' && (
            <>
              <div>
                <div className="text-base font-normal text-gray-900 mb-1">Size</div>
                <p className="text-base text-gray-700">{formatSize(detailedItem?.size)}</p>
              </div>

              <div>
                <div className="text-base font-normal text-gray-900 mb-1">Storage used</div>
                <p className="text-base text-gray-700">{formatSize(detailedItem?.size)}</p>
              </div>
            </>
          )}

          <div>
            <div className="text-base font-normal text-gray-900 mb-1">Owner</div>
            <p className="text-base text-gray-700">me</p>
          </div>

          <div>
            <div className="text-base font-normal text-gray-900 mb-1">Modified</div>
            <p className="text-base text-gray-700">
              {detailedItem?.updatedAt ? `${formatDate(detailedItem.updatedAt)} by me` : '-'}
            </p>
          </div>

          <div>
            <div className="text-base font-normal text-gray-900 mb-1">Created</div>
            <p className="text-base text-gray-700">
              {detailedItem?.createdAt ? formatDate(detailedItem.createdAt) : '-'}
            </p>
          </div>

          <div>
            <div className="text-base font-normal text-gray-900 mb-2">Description</div>
            <textarea
              placeholder="Add description"
              className="w-full text-base text-gray-700 border border-gray-300 rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              defaultValue={detailedItem?.description || ''}
            />
            <div className="text-xs text-gray-500 text-right mt-1">0/25,000</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActivityTab = () => {
    if (isLoadingActivity) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading activity...</div>
        </div>
      );
    }

    if (!activities.length) {
      return (
        <div className="px-6 py-12 text-center">
          <div className="flex justify-center mb-4">
            <svg className="w-24 h-24 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <p className="text-base text-gray-600">No activity yet</p>
        </div>
      );
    }

    return (
      <div className="bg-white">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="py-4">
            {activities.map((activity: Activity) => {
              // Extract relevant data from metadata
              const metadata = activity.metadata || {};
              const isBulkOperation = metadata.bulkGroupId && metadata.itemCount;
              const itemCount = metadata.itemCount || 1;
              
              // Determine what files/folders to show
              let itemsToShow: Array<{name: string; type: 'file' | 'folder'; extension?: string}> = [];
              
              if (isBulkOperation) {
                // For bulk operations, we might need to fetch the items
                // For now, show a generic message
                itemsToShow = [{
                  name: `${itemCount} items`,
                  type: 'file'
                }];
              } else {
                // Single item operation
                const fileName = metadata.fileName || metadata.newName || detailedItem?.name;
                if (fileName) {
                  itemsToShow = [{
                    name: fileName,
                    type: activity.targetType === 'folder' ? 'folder' : 'file',
                    extension: detailedItem?.extension
                  }];
                }
              }

              return (
                <div key={activity._id} className="px-6 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white text-base font-medium flex-shrink-0">
                      {getUserInitials(activity.user)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-base text-gray-900 mb-1">
                        {activity.message || `You ${activity.action.toLowerCase().replace(/_/g, ' ')}`}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        {activity.formattedTime}
                      </p>

                      {/* Show affected items */}
                      {itemsToShow.length > 0 && (
                        <div className="space-y-2">
                          {itemsToShow.map((item, idx) => (
                            <div 
                              key={idx}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-full"
                            >
                              {item.type === 'folder' ? (
                                <FolderIcon className="w-4 h-4 text-gray-600" />
                              ) : item.extension === 'xlsx' || item.extension === 'xls' ? (
                                <div className="w-4 h-4 bg-green-600 rounded flex items-center justify-center text-white text-[8px] font-bold">
                                  X
                                </div>
                              ) : item.extension === 'doc' || item.extension === 'docx' ? (
                                <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center text-white text-[8px] font-bold">
                                  W
                                </div>
                              ) : item.extension === 'pdf' ? (
                                <div className="w-4 h-4 bg-red-500 rounded flex items-center justify-center text-white text-[8px] font-bold">
                                  P
                                </div>
                              ) : (
                                <FileText className="w-4 h-4 text-gray-600" />
                              )}
                              <span className="text-sm font-medium text-gray-900">
                                {item.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Show folder context if moved */}
                      {metadata.folderName && activity.action.includes('MOVED') && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-sm text-gray-600">to</span>
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-full">
                            <FolderIcon className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-900">
                              {metadata.folderName}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="w-[420px] bg-white border-l border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {getFileIcon()}
          <h2 className="text-base font-normal text-gray-900 truncate">{getTitle()}</h2>
        </div>
        <button 
          onClick={onClose}
          className="ml-2 p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex-1 px-6 py-3 text-base font-medium transition-colors relative ${
            activeTab === 'details'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Details
          {activeTab === 'details' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex-1 px-6 py-3 text-base font-medium transition-colors relative ${
            activeTab === 'activity'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Activity
          {activeTab === 'activity' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            Loading...
          </div>
        ) : (
          <>
            {activeTab === 'details' && renderDetailsTab()}
            {activeTab === 'activity' && renderActivityTab()}
          </>
        )}
      </div>
    </div>
  );
}