import { useQuery } from '@tanstack/react-query';
import { X, FolderIcon, FileText, Image, Film, Music, Archive, Code, File } from 'lucide-react';
import { useState, useEffect } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { getDocumentById } from '@/config/api/documentApi';
import { getFolderById } from '@/config/api/folderApi';
import { getFileActivity, getFolderActivity } from '@/config/api/activityApi';
import type { FileItem } from '@/types/documentTypes';
import type { Activity } from '@/config/api/activityApi';
import { getFileIcon as getFileIconType } from '@/constants/getIcons';

interface FileInfoPanelProps {
  item: FileItem | null;
  selectionCount: number;
  onClose: () => void;
}

const CLOUDFRONT_BASE_URL = 'https://d1rf5tmmedb5ah.cloudfront.net';

export default function   ResourcePreviewPanel({ item, selectionCount, onClose }: FileInfoPanelProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');
  const [previewError, setPreviewError] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(true);
  
  // Reset preview states when item changes
  useEffect(() => {
    setPreviewError(false);
    setPreviewLoading(true);
  }, [item?._id]);
  
  const itemType = item?.type === 'folder' ? 'folder' : 'file';

  const { data: documentData, isLoading: isLoadingDoc } = useQuery({
    queryKey: ['document', item?._id],
    queryFn: () => item ? getDocumentById(item._id) : Promise.resolve(null),
    enabled: !!item && itemType === 'file',
    staleTime: 30000,
  });

  const { data: folderData, isLoading: isLoadingFolder } = useQuery({
    queryKey: ['folder', item?._id],
    queryFn: () => item ? getFolderById(item._id) : Promise.resolve(null),
    enabled: !!item && itemType === 'folder',
    staleTime: 30000,
  });

  const { data: fileActivityData, isLoading: isLoadingFileActivity } = useQuery({
    queryKey: ['fileActivity', item?._id],
    queryFn: () => item ? getFileActivity({ fileId: item._id, limit: 50 }) : Promise.resolve(null),
    enabled: !!item && activeTab === 'activity' && itemType === 'file',
    staleTime: 30000,
  });

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

  // Get fileUrl from item or detailedItem
  const fileUrl = item?.fileUrl || detailedItem?.fileUrl;

  if (selectionCount > 1) {
    return (
      <div className="w-[350px] pb-6 rounded-[16px] bg-white h-full flex flex-col">
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

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M150 120C150 120 160 100 165 95C170 90 180 85 185 90C190 95 185 105 180 110L160 130C155 135 145 140 140 140H100C95 140 90 135 90 130V80" stroke="#F59E0B" strokeWidth="3" fill="none"/>
                <rect x="60" y="50" width="50" height="60" rx="4" fill="#93C5FD" stroke="#3B82F6" strokeWidth="2"/>
                <rect x="70" y="60" width="30" height="3" rx="1.5" fill="#3B82F6"/>
                <rect x="70" y="68" width="25" height="3" rx="1.5" fill="#3B82F6"/>
                <rect x="120" y="40" width="40" height="50" rx="4" fill="#FCA5A5" stroke="#EF4444" strokeWidth="2"/>
                <rect x="128" y="48" width="24" height="3" rx="1.5" fill="#EF4444"/>
                <rect x="128" y="55" width="20" height="3" rx="1.5" fill="#EF4444"/>
                <circle cx="85" cy="120" r="12" fill="#FDE047"/>
                <circle cx="90" cy="130" r="15" fill="#86EFAC"/>
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

  if (!item) {
    return (
      <div className="w-[360px] rounded-[16px] bg-white h-full flex flex-col">
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

        <div className="flex border-b border-gray-200 bg-white">
          <button className="flex-1 px-6 py-3 text-base font-medium text-blue-600 relative">
            Details
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          </button>
          <button className="flex-1 px-6 py-3 text-base font-medium text-gray-600">
            Activity
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="80" cy="80" r="35" stroke="#F59E0B" strokeWidth="6" fill="none"/>
                <line x1="105" y1="105" x2="130" y2="130" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round"/>
                <rect x="130" y="50" width="50" height="65" rx="4" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2"/>
                <line x1="140" y1="65" x2="170" y2="65" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                <line x1="140" y1="75" x2="165" y2="75" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                <line x1="140" y1="85" x2="170" y2="85" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                <path d="M50 120 Q60 140 80 135" stroke="#9CA3AF" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <polygon points="82,140 85,133 77,133" fill="#9CA3AF"/>
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

  const getFileTypeCategory = (ext?: string, mime?: string) => {
    if (itemType === 'folder') return 'folder';
    
    const extension = ext || detailedItem?.extension?.toLowerCase();
    const mimeType = mime || detailedItem?.mimeType?.toLowerCase();
    
    if (extension === 'pdf' || mimeType?.includes('pdf')) return 'pdf';
    if (['xlsx', 'xls', 'csv'].includes(extension || '') || mimeType?.includes('spreadsheet')) return 'spreadsheet';
    if (['doc', 'docx'].includes(extension || '') || mimeType?.includes('word') || mimeType?.includes('document')) return 'document';
    if (['ppt', 'pptx'].includes(extension || '') || mimeType?.includes('presentation')) return 'presentation';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(extension || '') || mimeType?.includes('image')) return 'image';
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(extension || '') || mimeType?.includes('video')) return 'video';
    if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(extension || '') || mimeType?.includes('audio')) return 'audio';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) return 'archive';
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'xml'].includes(extension || '')) return 'code';
    if (['txt', 'md', 'rtf'].includes(extension || '') || mimeType?.includes('text')) return 'text';
    
    return 'other';
  };

  const getFileIcon = () => {
    const fileType = getFileTypeCategory();
    const iconConfig = getFileIconType(fileType);
    const Icon = iconConfig.icon;
    
    return (
      <div className="w-8 h-8 flex items-center justify-center">
        <Icon className="w-6 h-6" style={{ color: iconConfig.color }} />
      </div>
    );
  };

  const getFileIconHelper = (extension?: string, itemTypeParam?: 'file' | 'folder') => {
    let fileType = 'other';
    
    if (itemTypeParam === 'folder') {
      fileType = 'folder';
    } else {
      const ext = extension?.toLowerCase();
      
      if (ext === 'pdf') fileType = 'pdf';
      else if (['xlsx', 'xls', 'csv'].includes(ext || '')) fileType = 'spreadsheet';
      else if (['doc', 'docx', 'txt'].includes(ext || '')) fileType = 'document';
      else if (['ppt', 'pptx'].includes(ext || '')) fileType = 'presentation';
      else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) fileType = 'image';
      else if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext || '')) fileType = 'video';
      else if (['mp3', 'wav', 'ogg', 'flac'].includes(ext || '')) fileType = 'audio';
      else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) fileType = 'zip';
      else if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css'].includes(ext || '')) fileType = 'code';
    }
    
    const iconConfig = getFileIconType(fileType);
    const Icon = iconConfig.icon;
    
    return (
      <div className="w-5 h-5 flex items-center justify-center">
        <Icon className="w-4 h-4" style={{ color: iconConfig.color }} />
      </div>
    );
  };

  // Build full CloudFront URL
  const getFullPreviewUrl = () => {
    if (!fileUrl) return null;
    // If fileUrl already has full URL, return it
    if (fileUrl.startsWith('http')) return fileUrl;
    // Otherwise prepend CloudFront base URL
    return `${CLOUDFRONT_BASE_URL}/${fileUrl}`;
  };

  // Get preview icon based on file type
  const getPreviewIcon = (fileType: string) => {
    const iconProps = { className: "w-16 h-16 text-gray-400" };
    
    switch (fileType) {
      case 'pdf':
        return <FileText {...iconProps} style={{ color: '#EA4335' }} />;
      case 'document':
        return <FileText {...iconProps} style={{ color: '#4285F4' }} />;
      case 'spreadsheet':
        return <FileText {...iconProps} style={{ color: '#34A853' }} />;
      case 'presentation':
        return <FileText {...iconProps} style={{ color: '#FBBC04' }} />;
      case 'image':
        return <Image {...iconProps} style={{ color: '#EA4335' }} />;
      case 'video':
        return <Film {...iconProps} style={{ color: '#EA4335' }} />;
      case 'audio':
        return <Music {...iconProps} style={{ color: '#9334E9' }} />;
      case 'archive':
        return <Archive {...iconProps} style={{ color: '#6B7280' }} />;
      case 'code':
        return <Code {...iconProps} style={{ color: '#F97316' }} />;
      default:
        return <File {...iconProps} />;
    }
  };

  // Render file preview using iframe for ALL file types
  const renderPreview = () => {
    if (itemType === 'folder') {
      return (
        <div className="px-4 py-6 flex items-center justify-center bg-gray-50 border-b border-gray-200">
          <FolderIcon className="w-32 h-32 text-gray-400" strokeWidth={1} />
        </div>
      );
    }

    const fullPreviewUrl = getFullPreviewUrl();
    const fileType = getFileTypeCategory();

    // If no URL, show fallback icon
    if (!fullPreviewUrl) {
      return (
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-8">
          <div className="flex flex-col items-center justify-center gap-3">
            {getPreviewIcon(fileType)}
            <span className="text-sm text-gray-500 uppercase font-medium">
              {detailedItem?.extension || fileType}
            </span>
          </div>
        </div>
      );
    }

    // Special handling for Office documents - use Microsoft Online Viewer
    if (['document', 'spreadsheet', 'presentation'].includes(fileType)) {
      const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullPreviewUrl)}`;
      return (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="relative w-full h-56 overflow-hidden">
            {previewLoading && (
              <div className="absolute inset-0">
                <Skeleton className="w-full h-full rounded-none" />
              </div>
            )}
            <iframe
              src={officeViewerUrl}
              className={`w-full h-full border-0 transition-opacity duration-300 ${previewLoading ? 'opacity-0' : 'opacity-100'}`}
              title={detailedItem?.name || 'Document Preview'}
              onLoad={() => setPreviewLoading(false)}
              onError={() => {
                setPreviewError(true);
                setPreviewLoading(false);
              }}
            />
          </div>
        </div>
      );
    }

    // For all other file types, use iframe
    return (
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="relative w-full h-56 overflow-hidden">
          {previewLoading && (
            <div className="absolute inset-0">
              <Skeleton className="w-full h-full rounded-none" />
            </div>
          )}
          <iframe
            src={fullPreviewUrl}
            className={`w-full h-full border-0 transition-opacity duration-300 ${previewLoading ? 'opacity-0' : 'opacity-100'}`}
            title={detailedItem?.name || 'File Preview'}
            onLoad={() => setPreviewLoading(false)}
            onError={() => {
              setPreviewError(true);
              setPreviewLoading(false);
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
          {previewError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-50">
              {getPreviewIcon(fileType)}
              <span className="text-sm text-gray-500 uppercase font-medium">
                {detailedItem?.extension || fileType}
              </span>
              <a 
                href={fullPreviewUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Open in new tab
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getFileType = () => {
    if (itemType === 'folder') return 'Folder';
    
    const ext = detailedItem?.extension?.toLowerCase();
    
    if (ext === 'pdf') return 'PDF';
    if (ext === 'xlsx' || ext === 'xls') return 'Microsoft Excel';
    if (ext === 'doc' || ext === 'docx') return 'Microsoft Word';
    if (ext === 'ppt' || ext === 'pptx') return 'Microsoft PowerPoint';
    if (ext === 'csv') return 'CSV Spreadsheet';
    if (ext === 'txt') return 'Text File';
    if (ext === 'zip') return 'ZIP Archive';
    if (ext === 'rar') return 'RAR Archive';
    if (['jpg', 'jpeg'].includes(ext || '')) return 'JPEG Image';
    if (ext === 'png') return 'PNG Image';
    if (ext === 'gif') return 'GIF Image';
    if (ext === 'svg') return 'SVG Image';
    if (ext === 'mp4') return 'MP4 Video';
    if (ext === 'mp3') return 'MP3 Audio';
    if (detailedItem?.mimeType?.includes('spreadsheet')) return 'Spreadsheet';
    if (detailedItem?.mimeType?.includes('document')) return 'Document';
    if (detailedItem?.mimeType?.includes('image')) return 'Image';
    
    return ext?.toUpperCase() || 'File';
  };

  const renderDetailsTab = () => (
    <div className="bg-white">
      {/* Preview Section at Top */}
      {renderPreview()}

      {/* Who has access section */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-base font-medium text-gray-900 mb-2">Who has access</h3>
        <p className="text-sm text-gray-500">You do not have permission to view sharing</p>
        <p className="text-sm text-gray-500">information for this item</p>
      </div>

      {/* Security limitations section */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 flex items-center justify-center text-gray-600">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-medium text-gray-900 mb-1">Security limitations</h3>
            <p className="text-sm text-gray-700 mb-0.5">No limitations applied</p>
            <p className="text-xs text-gray-500">If any are applied, they will appear here</p>
          </div>
        </div>
      </div>

      {/* File/Folder details section */}
      <div className="px-6 py-4">
        <h3 className="text-base font-medium text-gray-900 mb-4">
          {itemType === 'folder' ? 'Folder details' : 'File details'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Type</div>
            <p className="text-sm text-gray-600">{getFileType()}</p>
          </div>

          {itemType === 'file' && (
            <>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Size</div>
                <p className="text-sm text-gray-600">{formatSize(detailedItem?.size)}</p>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Storage used</div>
                <p className="text-sm text-gray-600">{formatSize(detailedItem?.size)}</p>
              </div>
            </>
          )}

          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Owner</div>
            <p className="text-sm text-gray-600">me</p>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Modified</div>
            <p className="text-sm text-gray-600">
              {detailedItem?.updatedAt ? `${formatDate(detailedItem.updatedAt)} by me` : '-'}
            </p>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Created</div>
            <p className="text-sm text-gray-600">
              {detailedItem?.createdAt ? formatDate(detailedItem.createdAt) : '-'}
            </p>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Description</div>
            <textarea
              placeholder="Add description"
              className="w-full text-sm text-gray-700 border border-gray-300 rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              defaultValue={detailedItem?.description || ''}
            />
            <div className="text-xs text-gray-400 text-right mt-1">0/25,000</div>
          </div>
        </div>
      </div>
    </div>
  );

  const groupActivitiesByDate = (activities: Activity[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
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

    return Object.entries(grouped).filter(([_, acts]) => acts.length > 0);
  };

  const renderActivityItem = (activity: Activity) => {
    const isBulkOperation = activity.targetType === 'multiple' && activity.bulkOperation?.items && activity.bulkOperation.items.length > 0;

    let itemsToShow: Array<{ name: string; extension?: string; type: 'file' | 'folder' }> = [];

    if (isBulkOperation) {
      itemsToShow = activity.bulkOperation.items.map(item => ({
        name: item.name,
        extension: item.extension,
        type: item.type === 'folder' ? 'folder' : 'file'
      }));
    } else if (activity.target?.name || activity.target?.folderName) {
      const targetItemType = activity.targetType === 'folder' ? 'folder' : 'file';
      const itemName = activity.target.name || activity.target.folderName;
      itemsToShow = [{
        name: itemName,
        extension: activity.target.extension || itemName?.split('.').pop(),
        type: targetItemType
      }];
    }

    const isRename = activity.action.includes('RENAMED');
    const oldName = activity.target?.oldName;
    const newName = activity.target?.newName;

    const isMove = activity.action.includes('MOVED');
    const parentFolder = activity.parentFolder;
    
    const isFolderCreation = activity.action === 'FOLDER_CREATED';
    const showParentFolderFirst = isFolderCreation && parentFolder;
    
    const isFileUpload = activity.action === 'FILES_UPLOADED';
    const showParentForUpload = isFileUpload && parentFolder && isBulkOperation;

    return (
      <div key={activity._id} className="mb-6">
        <div className="flex items-start gap-3 px-6">
          <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-medium flex-shrink-0 mt-0.5">
            {getUserInitials(activity.user || activity.userSnapshot)}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-[15px] leading-relaxed text-gray-900 mb-1">
              {activity.message}
            </p>
            
            <p className="text-[13px] text-gray-500 mb-3">
              {activity.formattedTime}
            </p>

            <div className="space-y-0">
              {(showParentFolderFirst || showParentForUpload) && (
                <div className="mb-2">
                  <div className="inline-flex items-center gap-2 h-9 px-4 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <FolderIcon className="w-5 h-5 text-gray-500" fill="currentColor" />
                    </div>
                    <span className="text-[14px] text-gray-900">{parentFolder.name}</span>
                  </div>
                </div>
              )}

              {isRename && oldName && newName ? (
                <>
                  <div className="mb-2">
                    <div className="inline-flex items-center gap-2 h-9 px-4 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors">
                      {getFileIconHelper(newName.split('.').pop(), activity.targetType === 'folder' ? 'folder' : 'file')}
                      <span className="text-[14px] text-gray-900">{newName}</span>
                    </div>
                  </div>
                  <div className="pl-1">
                    <span className="text-[13px] text-gray-500 line-through">{oldName}</span>
                  </div>
                </>
              ) : (
                itemsToShow.map((showItem, idx) => {
                  const isLast = idx === itemsToShow.length - 1;
                  const showConnector = (isFolderCreation || isFileUpload) && (showParentFolderFirst || showParentForUpload);
                  
                  return (
                    <div key={idx} className="flex items-center my-1.5">
                      {showConnector && (
                        <div className="relative mr-3" style={{ width: '16px', height: '36px' }}>
                          <div 
                            className="absolute bg-gray-300" 
                            style={{
                              left: '0',
                              top: '0',
                              width: '1.5px',
                              height: isLast ? '18px' : '36px'
                            }}
                          />
                          <div 
                            className="absolute bg-gray-300" 
                            style={{
                              left: '0',
                              top: '17px',
                              width: '16px',
                              height: '1.5px'
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="inline-flex items-center gap-2 h-9 px-4 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors">
                        {getFileIconHelper(showItem.extension, showItem.type)}
                        <span className="text-[14px] text-gray-900 truncate max-w-[220px]">
                          {showItem.name}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              {isMove && parentFolder && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[13px] text-gray-600">to</span>
                  <div className="inline-flex items-center gap-2 h-9 px-4 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <FolderIcon className="w-5 h-5 text-gray-500" fill="currentColor" />
                    </div>
                    <span className="text-[14px] text-gray-900">{parentFolder.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

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

    const groupedActivities = groupActivitiesByDate(activities);

    return (
      <div className="bg-white">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="pt-6 pb-4">
            {groupedActivities.map(([period, periodActivities]) => (
              <div key={period} className="mb-8">
                <h3 className="px-6 text-[17px] font-medium text-gray-900 mb-4">{period}</h3>
                <div className="space-y-0">
                  {periodActivities.map(renderActivityItem)}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="w-[350px] pb-6 bg-white rounded-[16px] h-full flex flex-col">
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

      <div className="flex-1 overflow-y-auto">
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