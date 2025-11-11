import { useUploadStore } from "@/config/store/uploadStore";
import {
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Upload Complete":
      return "text-green-600";
    case "Upload Failed":
      return "text-red-600";
    case "Upload Cancelled":
      return "text-gray-500";
    case "Uploading File":
      return "text-blue-600";
    case "Processing File":
      return "text-purple-600";
    default:
      return "text-gray-600";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Upload Complete":
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case "Upload Failed":
      return <XCircle className="h-5 w-5 text-red-600" />;
    case "Upload Cancelled":
      return <XCircle className="h-5 w-5 text-gray-400" />;
    case "Uploading File":
    case "Processing File":
      return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
    default:
      return <FileText className="h-5 w-5 text-gray-400" />;
  }
};

export const GlobalUploadProgress = () => {
 const uploads = useUploadStore((state) => state.uploads);
  const isOpen = useUploadStore((state) => state.isOpen);
  const isExpanded = useUploadStore((state) => state.isExpanded);
  const setOpen = useUploadStore((state) => state.setOpen);
  const toggleExpanded = useUploadStore((state) => state.toggleExpanded);
  const cancelUpload = useUploadStore((state) => state.cancelUpload);
  const clearCompleted = useUploadStore((state) => state.clearCompleted);

  if (!isOpen || uploads.length === 0) return null;

  const completedCount = uploads.filter(
    (u) => u.status === "Upload Complete"
  ).length;
  const uploadingCount = uploads.filter(
    (u) => u.status === "Uploading File" || u.status === "Processing File"
  ).length;
  const totalCount = uploads.length;

  return (
    <div className="fixed bottom-0 right-4 w-[400px] bg-white rounded-t-[20px] shadow-2xl border border-gray-200 z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-900">
            {completedCount === totalCount
              ? `${totalCount} upload${totalCount > 1 ? "s" : ""} complete`
              : `Uploading ${uploadingCount} of ${totalCount} file${
                  totalCount > 1 ? "s" : ""
                }...`}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleExpanded}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              clearCompleted();
              if (
                uploads.filter(
                  (u) =>
                    u.status === "Uploading File" ||
                    u.status === "Processing File"
                ).length === 0
              ) {
                setOpen(false);
              }
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Upload List - Only show when expanded */}
      {isExpanded && (
        <div className="max-h-[400px] overflow-y-auto">
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0"
            >
              {/* File Icon */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {upload.name}
                </p>
                <div className="mt-1">
                  {(upload.status === "Uploading File" ||
                    upload.status === "Processing File") && (
                    <div className="space-y-1">
                      <Progress value={upload.progress} className="h-1" />
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs ${getStatusColor(upload.status)}`}
                        >
                          {upload.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {upload.progress}%
                        </span>
                      </div>
                    </div>
                  )}
                  {upload.status === "Upload Complete" && (
                    <span className="text-xs text-green-600">
                      {formatFileSize(upload.size)} • Completed
                    </span>
                  )}
                  {upload.status === "Upload Failed" && (
                    <span className="text-xs text-red-600">
                      Failed
                      {upload.errorMessage ? `: ${upload.errorMessage}` : ""}
                    </span>
                  )}
                  {upload.status === "Upload Cancelled" && (
                    <span className="text-xs text-gray-500">Cancelled</span>
                  )}
                </div>
              </div>

              {/* Status Icon / Cancel Button */}
              <div className="flex-shrink-0">
                {(upload.status === "Uploading File" ||
                  upload.status === "Processing File") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => cancelUpload(upload.id)}
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </Button>
                )}
                {upload.status !== "Uploading File" &&
                  upload.status !== "Processing File" &&
                  getStatusIcon(upload.status)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
