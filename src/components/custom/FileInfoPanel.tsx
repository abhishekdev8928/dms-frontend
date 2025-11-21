import { useQuery } from '@tanstack/react-query';
import { X, FolderIcon, FileText } from 'lucide-react';
import { useState } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { getDocumentById } from '@/config/api/documentApi';
import { getFolderById } from '@/config/api/folderApi';
import { getFileActivity, getFolderActivity } from '@/config/api/activityApi';
import type { FileItem } from '@/types/fileSystem';
import type { Activity } from '@/config/api/activityApi';

interface FileInfoPanelProps {
  item: FileItem | null;
  selectionCount: number;
  onClose: () => void;
}

export default function FileInfoPanel({ item, selectionCount, onClose }: FileInfoPanelProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');
  
  // ALWAYS CALL HOOKS AT THE TOP LEVEL - BEFORE ANY CONDITIONAL LOGIC
  const itemType = item?.type === 'folder' ? 'folder' : 'file';

  // Fetch detailed document data (only if file)
  const { data: documentData, isLoading: isLoadingDoc } = useQuery({
    queryKey: ['document', item?._id],
    queryFn: () => item ? getDocumentById(item._id) : Promise.resolve(null),
    enabled: !!item && itemType === 'file',
    staleTime: 30000,
  });

  // Fetch detailed folder data (only if folder)
  const { data: folderData, isLoading: isLoadingFolder } = useQuery({
    queryKey: ['folder', item?._id],
    queryFn: () => item ? getFolderById(item._id) : Promise.resolve(null),
    enabled: !!item && itemType === 'folder',
    staleTime: 30000,
  });

  // Fetch file activity
  const { data: fileActivityData, isLoading: isLoadingFileActivity } = useQuery({
    queryKey: ['fileActivity', item?._id],
    queryFn: () => item ? getFileActivity({ fileId: item._id, limit: 50 }) : Promise.resolve(null),
    enabled: !!item && activeTab === 'activity' && itemType === 'file',
    staleTime: 30000,
  });

  // Fetch folder activity
  const { data: folderActivityData, isLoading: isLoadingFolderActivity } = useQuery({
    queryKey: ['folderActivity', item?._id],
    queryFn: () => item ? getFolderActivity({ folderId: item._id, limit: 50 }) : Promise.resolve(null),
    enabled: !!item && activeTab === 'activity' && itemType === 'folder',
    staleTime: 30000,
  });

  const isLoading = itemType === 'file' ? isLoadingDoc : isLoadingFolder;
  const isLoadingActivity = itemType === 'file' ? isLoadingFileActivity : isLoadingFolderActivity;
  
  const detailedItem = itemType === 'file' 
    ? (documentData?.data || documentData || item)
    : (folderData?.data || folderData || item);

  const activityData = itemType === 'file' ? fileActivityData : folderActivityData;
  const activities = activityData?.data || [];

  // NOW you can have conditional returns
  // Show empty state for multiple selections
  if (selectionCount > 1) {
    return (
      <div className="w-[350px] pb-6 rounded-[16px] bg-white h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h2 className="text-base font-normal text-gray-900">{selectionCount} items selected</h2>
          </div>
          <button 
            onClick={onClose}
            className="ml-2 p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Empty state illustration */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Hand illustration */}
                <path d="M150 120C150 120 160 100 165 95C170 90 180 85 185 90C190 95 185 105 180 110L160 130C155 135 145 140 140 140H100C95 140 90 135 90 130V80" stroke="#F59E0B" strokeWidth="3" fill="none"/>
                
                {/* Files */}
                <rect x="60" y="50" width="50" height="60" rx="4" fill="#93C5FD" stroke="#3B82F6" strokeWidth="2"/>
                <rect x="70" y="60" width="30" height="3" rx="1.5" fill="#3B82F6"/>
                <rect x="70" y="68" width="25" height="3" rx="1.5" fill="#3B82F6"/>
                
                <rect x="120" y="40" width="40" height="50" rx="4" fill="#FCA5A5" stroke="#EF4444" strokeWidth="2"/>
                <rect x="128" y="48" width="24" height="3" rx="1.5" fill="#EF4444"/>
                <rect x="128" y="55" width="20" height="3" rx="1.5" fill="#EF4444"/>
                
                {/* Green dot */}
                <circle cx="85" cy="120" r="12" fill="#FDE047"/>
                <circle cx="90" cy="130" r="15" fill="#86EFAC"/>
                
                {/* Checkmark */}
                <circle cx="35" cy="45" r="20" fill="#14B8A6"/>
                <path d="M28 45L33 50L43 40" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-base text-gray-600">Select an item to see the details</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state for no selection
  if (!item) {
    return (
      <div className="w-[360px] rounded-[16px] bg-white  h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h2 className="text-base font-normal text-gray-900">My Drive</h2>
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
            className="flex-1 px-6 py-3 text-base font-medium text-blue-600 relative"
          >
            Details
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          </button>
          <button
            className="flex-1 px-6 py-3 text-base font-medium text-gray-600"
          >
            Activity
          </button>
        </div>

        {/* Empty state illustration */}
        <div className="flex-1 flex items-center justify-center p-8 ">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Magnifying glass */}
                <circle cx="80" cy="80" r="35" stroke="#F59E0B" strokeWidth="6" fill="none"/>
                <line x1="105" y1="105" x2="130" y2="130" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round"/>
                
                {/* Document */}
                <rect x="130" y="50" width="50" height="65" rx="4" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2"/>
                <line x1="140" y1="65" x2="170" y2="65" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                <line x1="140" y1="75" x2="165" y2="75" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                <line x1="140" y1="85" x2="170" y2="85" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                
                {/* Curved arrow */}
                <path d="M50 120 Q60 140 80 135" stroke="#9CA3AF" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <polygon points="82,140 85,133 77,133" fill="#9CA3AF"/>
                
                {/* Small decorative elements */}
                <circle cx="160" cy="140" r="8" fill="#FCA5A5"/>
                <rect x="30" y="55" width="20" height="20" rx="2" fill="#D1FAE5" stroke="#10B981" strokeWidth="2"/>
              </svg>
            </div>
            <p className="text-base text-gray-600">Select an item to see the details</p>
          </div>
        </div>
      </div>
    );
  }

  // Rest of your component logic for when we have a single item selected
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
    
    // ... rest of your existing component logic
    // Continue with the rest of your component as before
    // [The rest of your component code remains the same...]
    
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

  const getItemIcon = (extension?: string, itemType?: 'file' | 'folder') => {
    if (itemType === 'folder') {
      return <FolderIcon className="w-5 h-5 text-gray-500" />;
    }
    
    if (extension === 'xlsx' || extension === 'xls') {
      return (
        <div className="w-5 h-5 bg-green-600 rounded flex items-center justify-center text-white text-[10px] font-bold">
          X
        </div>
      );
    }
    
    if (extension === 'doc' || extension === 'docx') {
      return (
        <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-white text-[10px] font-bold">
          W
        </div>
      );
    }
    
    if (extension === 'pdf') {
      return (
        <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center text-white text-[10px] font-bold">
          P
        </div>
      );
    }

    if (extension === 'png' || extension === 'jpg' || extension === 'jpeg' || extension === 'gif') {
      return (
        <div className="w-5 h-5 bg-red-400 rounded flex items-center justify-center text-white text-[10px]">
          📷
        </div>
      );
    }
    
    return <FileText className="w-5 h-5 text-gray-500" />;
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

      <div className="px-6 py-4 rounded-[16px]">
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

  const groupActivitiesByDate = (activities: Activity[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setDate(lastMonth.getDate() - 30);

    const grouped: { [key: string]: Activity[] } = {
      Today: [],
      'Last week': [],
      'This month': [],
      Older: []
    };

    activities.forEach((activity) => {
      const activityDate = new Date(activity.createdAt);
      const activityDay = new Date(activityDate.getFullYear(), activityDate.getMonth(), activityDate.getDate());

      if (activityDay.getTime() === today.getTime()) {
        grouped['Today'].push(activity);
      } else if (activityDay.getTime() >= lastWeek.getTime()) {
        grouped['Last week'].push(activity);
      } else if (activityDay.getTime() >= lastMonth.getTime()) {
        grouped['This month'].push(activity);
      } else {
        grouped['Older'].push(activity);
      }
    });

    // Filter out empty groups
    return Object.entries(grouped).filter(([_, acts]) => acts.length > 0);
  };

  const renderActivityItem = (activity: Activity) => {
    const isBulkOperation = activity.targetType === 'multiple' || activity.bulkOperation;

    // Determine items to display
    let itemsToShow: Array<{ name: string; extension?: string; type: 'file' | 'folder' }> = [];

    if (isBulkOperation && activity.bulkOperation?.items) {
      // Show actual items from bulk operation
      itemsToShow = activity.bulkOperation.items.map(item => ({
        name: item.name,
        extension: item.extension,
        type: item.type as 'file' | 'folder'
      }));
    } else if (activity.target?.name) {
      // Single item operation
      itemsToShow = [{
        name: activity.target.name,
        extension: activity.target.name?.split('.').pop(),
        type: activity.targetType === 'folder' ? 'folder' : 'file'
      }];
    }

    // For rename operations, show old and new name
    const isRename = activity.action.includes('RENAMED');
    const oldName = activity.target?.oldName;
    const newName = activity.target?.newName;

    // For move operations, show destination folder
    const isMove = activity.action.includes('MOVED');
    const destinationFolder = activity.parentFolder;

    // Get parent folder for uploads/creates
    const parentFolder = activity.parentFolder;

    return (
      <div key={activity._id} className="mb-7 px-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-medium flex-shrink-0">
            {getUserInitials(activity.user || activity.userSnapshot)}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-[15px] leading-relaxed text-gray-900 mb-1.5">
              {activity.message}
            </p>
            <p className="text-[13px] text-gray-500 mb-4">
              {activity.formattedTime}
            </p>

            {/* Parent folder - show first for uploads/creates */}
            {(activity.action.includes('CREATED') || activity.action.includes('UPLOADED')) && parentFolder && (
              <div className="mb-2.5">
                <Badge variant="outline" className="h-9 px-4 rounded-full border-gray-300 bg-white hover:bg-gray-50 font-normal">
                  <FolderIcon className="w-[18px] h-[18px] text-gray-600 mr-2.5" />
                  <span className="text-[14px] text-gray-900">{parentFolder.name}</span>
                </Badge>
              </div>
            )}

            {/* Show affected items with tree structure for bulk operations */}
            {isRename && oldName && newName ? (
              <div className="space-y-2">
                <Badge variant="outline" className="h-9 px-4 rounded-full border-gray-300 bg-white hover:bg-gray-50 font-normal">
                  {getItemIcon(newName.split('.').pop(), 'file')}
                  <span className="text-[14px] text-gray-900 ml-2.5">{newName}</span>
                </Badge>
                <div className="mt-2 pl-1">
                  <span className="text-[13px] text-gray-500 line-through">{oldName}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-0">
                {itemsToShow.map((item, idx) => {
                  const isLast = idx === itemsToShow.length - 1;
                  const showConnector = isBulkOperation && parentFolder;
                  
                  return (
                    <div key={idx} className="flex items-center">
                      {/* Tree structure connector */}
                      {showConnector && (
                        <div className="relative mr-3.5" style={{ width: '16px', height: '44px' }}>
                          <div 
                            className="absolute bg-gray-300" 
                            style={{
                              left: '0',
                              top: '0',
                              width: '1.5px',
                              height: isLast ? '22px' : '44px'
                            }}
                          />
                          <div 
                            className="absolute bg-gray-300 rounded-r" 
                            style={{
                              left: '0',
                              top: '21px',
                              width: '16px',
                              height: '1.5px'
                            }}
                          />
                        </div>
                      )}
                      
                      <Badge variant="outline" className="h-9 px-4 rounded-full border-gray-300 bg-white hover:bg-gray-50 font-normal my-1">
                        {getItemIcon(item.extension, item.type)}
                        <span className="text-[14px] text-gray-900 ml-2.5">
                          {item.name}
                        </span>
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Show "to" folder for move operations */}
            {isMove && destinationFolder && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[13px] text-gray-600">to</span>
                <Badge variant="outline" className="h-9 px-4 rounded-full border-gray-300 bg-white hover:bg-gray-50 font-normal">
                  <FolderIcon className="w-[18px] h-[18px] text-gray-600 mr-2.5" />
                  <span className="text-[14px] text-gray-900">{destinationFolder.name}</span>
                </Badge>
              </div>
            )}

            {/* Show "in" label for folder context in bulk uploads - appears after items */}
            {isBulkOperation && (activity.action.includes('UPLOADED') || activity.action.includes('RESTORED')) && parentFolder && (
              <div className="mt-3 flex items-start gap-2">
                <span className="text-[13px] text-gray-600 pt-2">in</span>
                <Badge variant="outline" className="h-9 px-4 rounded-full border-gray-300 bg-white hover:bg-gray-50 font-normal">
                  <FolderIcon className="w-[18px] h-[18px] text-gray-600 mr-2.5" />
                  <span className="text-[14px] text-gray-900">{parentFolder.name}</span>
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderActivityTab = () => {
    if (isLoadingActivity) {
      return (<div className="flex items-center justify-center py-12">
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

    const groupedActivities = groupActivitiesByDate(activities);

    return (
      <div className="bg-white">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="pt-6 pb-4">
            {groupedActivities.map(([period, periodActivities]) => (
              <div key={period} className="mb-8">
                <h3 className="px-6 text-[17px] font-normal text-gray-900 mb-5">{period}</h3>
                {periodActivities.map(renderActivityItem)}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="w-[350px] pb-6 bg-white rounded-[16px] h-full flex flex-col">
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
      <div className="flex-1 overflow-y-auto ">
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


