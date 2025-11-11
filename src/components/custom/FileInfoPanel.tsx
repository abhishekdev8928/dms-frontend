import { useQuery } from '@tanstack/react-query';
import { X, Users, Clock, FileText, HardDrive, User, Calendar, Image as ImageIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getDocumentById } from '@/config/api/documentApi';

interface FileInfoPanelProps {
  fileId: string | null;
  onClose: () => void;
}

export default function FileInfoPanel({ fileId, onClose }: FileInfoPanelProps) {
  const { data: fileData, isLoading, error } = useQuery({
    queryKey: ['document', fileId],
    queryFn: () => getDocumentById(fileId!),
    enabled: !!fileId
  });

  const document = fileData?.data || fileData;

  if (!fileId) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '-';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getDimensions = () => {
    // This would need to be stored in your document metadata
    // For now returning placeholder
    return document?.dimensions || '-';
  };

  const getCreatedBy = () => {
    if (!document?.createdBy) return 'Unknown';
    
    // Check if createdBy is an object with email property
    if (typeof document.createdBy === 'object' && document.createdBy !== null) {
      return document.createdBy.email || document.createdBy._id || 'Unknown';
    }
    
    // If it's a string, return it directly
    return document.createdBy;
  };

  const getUserInitials = () => {
    const createdBy = getCreatedBy();
    if (!createdBy || createdBy === 'Unknown') return 'U';
    
    // Extract initials from email or name
    if (createdBy.includes('@')) {
      const namePart = createdBy.split('@')[0];
      const parts = namePart.split(/[._-]/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return namePart.substring(0, 2).toUpperCase();
    }
    
    const words = createdBy.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return createdBy.substring(0, 2).toUpperCase();
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-gray-100 rounded">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
            </svg>
          </button>
          <h2 className="text-sm font-semibold">Info</h2>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-gray-500">
            Loading...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8 text-red-500">
            Failed to load file info
          </div>
        ) : (
          <>
          

            {/* Properties Section */}
            <div className="px-4 py-3 space-y-3">
              <h3 className="text-xs font-semibold text-gray-700 mb-3">Properties</h3>
              
              {/* Name */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-600">Name</span>
                </div>
                <p className="text-sm pl-6 break-words">{document?.name || document?.originalName}</p>
              </div>

              {/* Saved in */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M14 3.5H2c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-7c0-.55-.45-1-1-1z"/>
                  </svg>
                  <span className="text-xs text-gray-600">Saved in</span>
                </div>
                <p className="text-sm pl-6 text-gray-900">
                  {document?.path?.split('/').slice(0, -1).join('/') || 'Dropbox'}
                </p>
              </div>

              {/* Size */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-600">Size</span>
                </div>
                <p className="text-sm pl-6">{formatSize(document?.size)}</p>
              </div>

              {/* Modified */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-600">Modified</span>
                </div>
                <p className="text-sm pl-6">{document?.updatedAt ? formatDate(document.updatedAt) : '-'}</p>
              </div>

              {/* Type */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-600">Type</span>
                </div>
                <p className="text-sm pl-6">{document?.mimeType?.split('/')[0] || 'File'}</p>
              </div>

              {/* Uploaded by */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-600">Uploaded by</span>
                </div>
                <p className="text-sm pl-6">{getCreatedBy()}</p>
              </div>

              {/* Date uploaded */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-600">Date uploaded</span>
                </div>
                <p className="text-sm pl-6">{document?.createdAt ? formatDate(document.createdAt) : '-'}</p>
              </div>

              {/* Dimensions (for images) */}
              {document?.mimeType?.startsWith('image/') && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-600">Dimensions</span>
                  </div>
                  <p className="text-sm pl-6">{getDimensions()}</p>

                </div>
              )}

              {/* User comments */}
              {document?.description && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-600">User comments</span>
                  </div>
                  <p className="text-sm pl-6">{document?.description}</p>
                </div>
              )}
            </div>

            {/* Who has access */}
            <div className="px-4 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-700">Who has access</h3>
                <Users className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-medium">
                  {getUserInitials()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{getCreatedBy()}</p>
                  <p className="text-xs text-gray-500">Owner</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}