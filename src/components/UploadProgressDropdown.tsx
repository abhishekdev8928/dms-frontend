import { useUploadStore } from "@/config/useUploadStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle2, XCircle, Loader2, X } from "lucide-react";

export function UploadProgressDropdown() {
  const { uploads, removeUpload } = useUploadStore();

  // Count active uploads to display on button
  const uploadingCount = uploads.filter((u) => u.status === "uploading").length;
  const hasUploads = uploads.length > 0;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={uploadingCount > 0 ? "default" : "secondary"}
            size="lg"
            className="relative flex items-center gap-2 rounded-full shadow-xl hover:shadow-2xl transition-all"
          >
            <div className="relative">
              <Upload className="h-5 w-5" />
              {uploadingCount > 0 && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-blue-400 rounded-full animate-pulse" />
              )}
            </div>
            <span className="font-medium">
              {uploadingCount > 0 ? `${uploadingCount} Uploading` : "Uploads"}
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-96 max-h-[28rem] overflow-y-auto rounded-2xl shadow-2xl border-2 p-0"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-4 py-3 font-semibold text-sm">
            Upload Progress
            {hasUploads && (
              <span className="ml-2 text-gray-500 font-normal">
                ({uploads.length})
              </span>
            )}
          </div>

          {/* Content */}
          <div className="p-2">
            {uploads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Upload className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-900">No uploads yet</p>
                <p className="text-xs text-gray-500 mt-1">
                  Your file uploads will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {uploads.map((u) => (
                  <div
                    key={u.id}
                    className="flex flex-col gap-2 border rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {u.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {u.status === "uploading" && `${u.progress}% uploaded`}
                          {u.status === "success" && "Upload complete"}
                          {u.status === "error" && "Upload failed"}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {u.status === "uploading" && (
                          <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                        )}
                        {u.status === "success" && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                        {u.status === "error" && (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        
                        {u.status !== "uploading" && removeUpload && (
                          <button
                            onClick={() => removeUpload(u.id)}
                            className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                          >
                            <X className="h-3.5 w-3.5 text-gray-400" />
                          </button>
                        )}
                      </div>
                    </div>

                    <Progress
                      value={u.progress}
                      className={`h-1.5 ${
                        u.status === "error"
                          ? "bg-red-100"
                          : u.status === "success"
                          ? "bg-green-100"
                          : "bg-gray-100"
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}