import * as React from "react";
import { 
  Upload, X, FileText, File, Image, FileSpreadsheet, 
  FileVideo, Archive, AlertCircle, FolderOpen, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FileItem {
  file: File;
  id: string;
  error?: string;
}

interface FileUploadCardProps {
  folderId?: string | null;
  departmentId?: string | null;
  isReupload?: boolean;
  documentId?: string | null;
}

const SUPPORTED_FORMATS = {
  document: ['pdf', 'docx'],
  spreadsheet: ['xlsx'],
  image: ['jpg', 'jpeg', 'png'],
  archive: ['zip'],
  video: ['mp4']
};

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

const getFileIcon = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  
  if (SUPPORTED_FORMATS.document.includes(ext)) 
    return { Icon: FileText, color: "text-blue-500", bg: "bg-blue-50" };
  if (SUPPORTED_FORMATS.spreadsheet.includes(ext)) 
    return { Icon: FileSpreadsheet, color: "text-green-500", bg: "bg-green-50" };
  if (SUPPORTED_FORMATS.image.includes(ext)) 
    return { Icon: Image, color: "text-purple-500", bg: "bg-purple-50" };
  if (SUPPORTED_FORMATS.video.includes(ext)) 
    return { Icon: FileVideo, color: "text-red-500", bg: "bg-red-50" };
  if (SUPPORTED_FORMATS.archive.includes(ext)) 
    return { Icon: Archive, color: "text-orange-500", bg: "bg-orange-50" };
  
  return { Icon: File, color: "text-gray-500", bg: "bg-gray-50" };
};

const formatFileSize = (bytes: number): string => {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const validateFile = (file: File): { valid: boolean; error?: string } => {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const allowed = Object.values(SUPPORTED_FORMATS).flat();

  if (!allowed.includes(ext)) {
    return { valid: false, error: `Unsupported file type` };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large (max 2GB)` };
  }
  return { valid: true };
};

const FileCard = ({ 
  file, 
  onRemove 
}: { 
  file: FileItem;
  onRemove: () => void;
}) => {
  const { Icon, color, bg } = getFileIcon(file.file.name);
  const hasError = !!file.error;
  
  return (
    <div className={cn(
      "group flex items-center gap-3 p-3 rounded-lg border transition-colors hover:shadow-sm",
      hasError ? "border-red-200 bg-red-50/50" : "bg-card"
    )}>
      <div className={cn("flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center", bg)}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.file.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-muted-foreground">{formatFileSize(file.file.size)}</p>
          {hasError && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <p className="text-xs text-red-600">{file.error}</p>
            </>
          )}
        </div>
      </div>

      <div className="flex-shrink-0">
        {hasError ? (
          <AlertCircle className="h-5 w-5 text-red-500" />
        ) : (
          <Button
            size="icon"
            variant="ghost"
            onClick={onRemove}
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default function FileUploadCard({
  folderId,
  departmentId,
  isReupload = false,
  documentId
}: FileUploadCardProps) {
  const [files, setFiles] = React.useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    
    if (isReupload && files.length > 0) {
      alert("Only one file allowed for version upload");
      return;
    }

    const newFiles: FileItem[] = Array.from(fileList).map(file => {
      const validation = validateFile(file);
      return {
        file,
        id: crypto.randomUUID(),
        error: validation.valid ? undefined : validation.error,
      };
    });

    if (isReupload) {
      setFiles(newFiles.slice(0, 1));
    } else {
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // ✅ Updated Upload Logic
  const handleUpload = async () => {
    const validFiles = files.filter(f => !f.error);
    if (validFiles.length === 0) return;

    if (isReupload && !documentId) {
      alert("Document ID is required for version upload");
      return;
    }

    setIsUploading(true);

    try {
      const { uploadFiles } = await import("@/utils/UploadFileHelper");

      // ✅ Reupload → send documentId + reupload flag
      // ✅ Normal upload → send folderId OR departmentId (whichever is present)
      const uploadPayload = {
        files: validFiles.map(f => f.file),
        ...(isReupload
          ? { documentId, isReupload: true }
          : folderId
          ? { folderId }
          : { departmentId }),
      };

      await uploadFiles(uploadPayload);

      setFiles([]);
      console.log("Upload started successfully!");
    } catch (error) {
      console.error("Failed to start upload:", error);
      alert("Failed to start upload");
    } finally {
      setIsUploading(false);
    }
  };

  const validCount = files.filter(f => !f.error).length;
  const hasFiles = files.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-card border rounded-xl shadow-sm">
        <div className="p-6 border-b space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">
                {isReupload ? "Upload New Version" : "Upload Files"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isReupload 
                  ? "Replace the existing document with a new version"
                  : "Add documents to your workspace"}
              </p>
            </div>
            
            {(folderId || departmentId) && (
              <div className="flex gap-2">
                {folderId && (
                  <Badge variant="secondary" className="gap-1.5">
                    <FolderOpen className="h-3 w-3" />
                    Folder
                  </Badge>
                )}
                {departmentId && (
                  <Badge variant="secondary" className="gap-1.5">
                    <Building2 className="h-3 w-3" />
                    Department
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all",
              isDragging 
                ? "border-primary bg-primary/5 scale-[0.98]" 
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple={!isReupload}
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
              accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png,.zip,.mp4"
            />
            
            <Upload className={cn(
              "mx-auto h-12 w-12 mb-4 transition-colors",
              isDragging ? "text-primary" : "text-muted-foreground"
            )} />
            
            <div className="space-y-2">
              <p className="text-base font-medium">
                {isDragging ? "Drop files here" : "Click to upload or drag and drop"}
              </p>
              <p className="text-sm text-muted-foreground">
                {isReupload 
                  ? "Upload one file to replace the current version"
                  : "PDF, DOCX, XLSX, Images, ZIP, MP4 (max 2GB per file)"}
              </p>
            </div>
          </div>

          {hasFiles && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {files.length} {files.length === 1 ? "file" : "files"} selected
                </p>
                {!isUploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFiles([])}
                    className="h-8 text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {files.map(file => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onRemove={() => removeFile(file.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {!hasFiles && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {isReupload 
                  ? "Upload a new version of the document. Only one file is allowed."
                  : "Supported: PDF, Word, Excel, Images, ZIP archives, and MP4 videos"}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {hasFiles && (
          <div className="px-6 py-4 bg-muted/30 border-t rounded-b-xl">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Total: {formatFileSize(files.reduce((sum, f) => sum + f.file.size, 0))}
                {validCount !== files.length && (
                  <span className="ml-2 text-red-600">
                    • {files.length - validCount} file{files.length - validCount > 1 ? 's' : ''} with errors
                  </span>
                )}
              </p>
              <Button
                onClick={handleUpload}
                disabled={validCount === 0 || isUploading}
                size="lg"
                className="min-w-[140px]"
              >
                {isUploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-pulse" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {isReupload ? "Upload Version" : `Upload ${validCount > 0 ? `(${validCount})` : ""}`}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
