import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Download,
  RotateCcw,
  Loader2,
  AlertCircle,
  ArrowLeft,
  MoreVertical,
  X,
  FileText,
} from "lucide-react";
import { getFileIcon } from "@/constants/getIcons";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  getAllVersions,
  revertToVersion,
  generateDownloadUrl,
} from "@/config/api/documentApi";

// Updated interface - documentId is now populated
interface VersionInfo {
  _id: string;
  documentId: {
    _id: string;
    name: string;
    originalName: string;
    extension:string;
  };
  name:string,
  originalName:string,
  versionNumber: number;
  extension:string;
  fileUrl: string;
  size: number;
  mimeType: string;
  type:string,
  changeDescription: string;
  pathAtCreation: string;
  createdBy: {
    _id: string;
    name: string;
    email?: string;
  };
  createdAt: string;
  sizeFormatted: string;
  isLatest: boolean;
  createdAgo: string;
  id: string;
}

interface VersionsResponse {
  success: boolean;
  count: number;
  data: VersionInfo[];
}

// Format date/time
const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Get date label for a version
const getDateLabel = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", { 
      month: "long", 
      day: "numeric",
      year: "numeric" 
    });
  }
};

export default function GoogleDriveVersionHistory() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [revertDialogOpen, setRevertDialogOpen] = React.useState(false);
  const [selectedVersion, setSelectedVersion] = React.useState<VersionInfo | null>(null);
  const [downloadingVersionId, setDownloadingVersionId] = React.useState<string | null>(null);


  // Fetch version history
  const {
    data: versionsData,
    isLoading,
    error,
    refetch,
  } = useQuery<VersionsResponse>({
    queryKey: ["versions", documentId],
    queryFn: () => getAllVersions(documentId!),
    enabled: !!documentId,
  });

  // Revert mutation
  const revertMutation = useMutation({
    mutationFn: ({
      documentId,
      versionNumber,
    }: {
      documentId: string;
      versionNumber: number;
    }) => revertToVersion(documentId, versionNumber),
    onSuccess: () => {
      toast.success("Version restored successfully");
      queryClient.invalidateQueries({ queryKey: ["versions", documentId] });
      queryClient.invalidateQueries({ queryKey: ["children"] });
      setRevertDialogOpen(false);
      setSelectedVersion(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to restore version");
    },
  });

  // Download mutation
const downloadMutation = useMutation({
  mutationFn: async (id: string) => generateDownloadUrl(id),
  onSuccess: (data) => {
    const url = data?.data?.url;
    if (url) window.open(url, "_blank");
    toast.success("Download started");
  },
  onError: () => toast.error("Failed to download"),
});





  const handleRestore = (version: VersionInfo) => {
    setSelectedVersion(version);
    setRevertDialogOpen(true);
  };

  const confirmRestore = () => {
    if (selectedVersion && documentId) {
      revertMutation.mutate({
        documentId,
        versionNumber: selectedVersion.versionNumber,
      });
    }
  };

 const handleDownload = (version: VersionInfo) => {
  setDownloadingVersionId(version._id);

  downloadMutation.mutate(version._id, {
    onSettled: () => setDownloadingVersionId(null),
  });
};


  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600 text-sm">Loading version history...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error instanceof Error ? error.message : "Failed to load version history"}
          </AlertDescription>
          <Button onClick={() => refetch()} className="mt-4" variant="outline" size="sm">
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  const versions = versionsData?.data || [];
  
  // First item is the current version, rest are older versions
  const currentVersion = versions.length > 0 ? versions[0] : null;
  const olderVersions = versions.slice(1);
  
  // Get document info from first version (all versions have same document)
  const document = currentVersion?.documentId;

  console.log(document);

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header - Fixed */}
      <div className="border-b border-gray-200 flex-shrink-0">
        <div className="w-full px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="hover:bg-gray-100 -ml-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-base font-normal text-gray-700">Version history:</h1>
                <h2 className="text-xl font-normal text-gray-900 mt-0.5">
                  {document?.name + "." + document?.extension}
                </h2>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full px-8 py-6">
          {/* Info Message */}
          <div className="mb-8">
            <p className="text-sm text-gray-700">
              Restore this file to any version from the past 30 days. All other versions will be saved.{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Learn more
              </a>
            </p>
          </div>

          {/* Version List */}
          <div className="space-y-8">
            {/* Current Version Section */}
          {currentVersion && (
  <div>
    <h3 className="text-sm font-medium text-gray-700 mb-3 pb-3 border-b border-gray-200">
      {getDateLabel(currentVersion.createdAt)}
    </h3>

    <div className="py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4">
        {/* File Icon */}
        <div className="flex-shrink-0 w-10 flex items-center justify-center">
          {(() => {
            const { icon: Icon, color } = getFileIcon(currentVersion.type);
            return <Icon className="w-6 h-6" style={{ color }} />;
          })()}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0" style={{ minWidth: "250px" }}>
          <p className="text-sm text-gray-900 truncate mb-1">
            {currentVersion.originalName}
          </p>
          <p className="text-xs text-gray-500">
            {formatDateTime(currentVersion.createdAt)}
          </p>
        </div>

        {/* Action Label */}
        <div className="flex-shrink-0" style={{ minWidth: "100px" }}>
          <p className="text-sm text-gray-600">
            {currentVersion.changeDescription || "Added"}
          </p>
        </div>

        {/* User Info */}
        <div className="flex-shrink-0" style={{ minWidth: "200px" }}>
          <p className="text-sm text-gray-600">
            {currentVersion.createdBy?.email || "Unknown"}
          </p>
        </div>

        {/* File Size */}
        <div className="flex-shrink-0 text-right" style={{ minWidth: "80px" }}>
          <p className="text-sm text-gray-600">
            {currentVersion.sizeFormatted}
          </p>
        </div>

        {/* Dropdown for Current Version */}
        <div className="flex-shrink-0 text-right" style={{ minWidth: "130px" }}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-gray-200 h-8 w-8 p-0"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">

              {/* ONLY DOWNLOAD — NO RESTORE FOR CURRENT VERSION */}
              <DropdownMenuItem
                onClick={() => handleDownload(currentVersion)}
                disabled={downloadingVersionId === currentVersion._id}
                className="cursor-pointer"
              >
                {downloadingVersionId === currentVersion._id ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download 
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  </div>
)}


            {/* Older Versions */}
            {olderVersions.map((version) => (
              <div key={version.id}>
                <div className="py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* File Icon */}
                    <div className="flex-shrink-0 w-10 flex items-center justify-center">
                        {(() => {
  const { icon: Icon, color } = getFileIcon(version.type );
  return <Icon className="w-6 h-6" style={{ color }} />;
})()}
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 min-w-0" style={{ minWidth: '250px' }}>
                      <p className="text-sm text-gray-900 truncate mb-1">
                        {version.originalName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(version.createdAt)}
                      </p>
                    </div>

                    {/* Action Label */}
                    <div className="flex-shrink-0" style={{ minWidth: '100px' }}>
                      <p className="text-sm text-gray-600">
                        {version.changeDescription || "Added"}
                      </p>
                    </div>

                    {/* User Info */}
                    <div className="flex-shrink-0" style={{ minWidth: '200px' }}>
                      <p className="text-sm text-gray-600">
                        {version.createdBy?.email || "Unknown"} 
                      </p>
                    </div>

                    {/* File Size */}
                    <div className="flex-shrink-0 text-right" style={{ minWidth: '80px' }}>
                      <p className="text-sm text-gray-600">{version.sizeFormatted}</p>
                    </div>

                    {/* More Options */}
                    <div className="flex-shrink-0 text-right" style={{ minWidth: '130px' }}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-gray-200 h-8 w-8 p-0"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => handleRestore(version)}
                            className="cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Restore this version
                          </DropdownMenuItem>
                        <DropdownMenuItem
  onClick={() => handleDownload(version)}
  className="cursor-pointer"
  disabled={downloadingVersionId === version._id}
>
  {downloadingVersionId === version._id ? (
    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
  ) : (
    <Download className="w-4 h-4 mr-2" />
  )}
  Download
</DropdownMenuItem>


                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {versions.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-sm">No version history available</p>
            </div>
          )}
        </div>
      </div>

      {/* Revert Confirmation Dialog */}
      <AlertDialog open={revertDialogOpen} onOpenChange={setRevertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this version?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the document to version {selectedVersion?.versionNumber} from{" "}
              {selectedVersion && new Date(selectedVersion.createdAt).toLocaleString()}.
              The current version will be preserved in the version history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revertMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRestore}
              disabled={revertMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {revertMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Restoring...
                </>
              ) : (
                "Restore"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}