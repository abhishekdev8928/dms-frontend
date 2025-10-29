import * as React from "react";
import { Upload, X, Edit2, Tag, FileText, File, Image, FileSpreadsheet, FileVideo, Archive } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUploadStore } from "@/config/useUploadStore";
import { uploadFiles } from "@/utils/UploadFileHelper";
import { toast } from "sonner";

interface FileWithMetadata {
  file: File;
  id: string;
  title: string;
  tags: string;
  metadata: string;
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

  if (SUPPORTED_FORMATS.document.includes(ext)) return { icon: FileText, color: "text-blue-500", bg: "bg-blue-50" };
  if (SUPPORTED_FORMATS.spreadsheet.includes(ext)) return { icon: FileSpreadsheet, color: "text-green-500", bg: "bg-green-50" };
  if (SUPPORTED_FORMATS.image.includes(ext)) return { icon: Image, color: "text-purple-500", bg: "bg-purple-50" };
  if (SUPPORTED_FORMATS.video.includes(ext)) return { icon: FileVideo, color: "text-red-500", bg: "bg-red-50" };
  if (SUPPORTED_FORMATS.archive.includes(ext)) return { icon: Archive, color: "text-yellow-500", bg: "bg-yellow-50" };

  return { icon: File, color: "text-gray-500", bg: "bg-gray-50" };
};

const formatFileSize = (bytes: number): string => {
  if (!bytes) return "Unknown";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
};

const validateFile = (file: File): { valid: boolean; error?: string } => {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const allowed = Object.values(SUPPORTED_FORMATS).flat();

  if (!allowed.includes(ext)) {
    return {
      valid: false,
      error: `Unsupported type .${ext} — allowed: ${allowed.join(", ").toUpperCase()}`
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large (${formatFileSize(file.size)}). Max: 2GB`
    };
  }

  return { valid: true };
};

export const GlobalUploadDialog = () => {
  const { folderId, departmentId, isDialogOpen, openDialog, closeDialog } = useUploadStore();
  const [files, setFiles] = React.useState<FileWithMetadata[]>([]);
  const [errors, setErrors] = React.useState<string[]>([]);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: File[]) => {
    const errs: string[] = [];
    const accepted: FileWithMetadata[] = [];

    fileList.forEach((f) => {
      const check = validateFile(f);
      if (!check.valid) return errs.push(`${f.name}: ${check.error}`);
      accepted.push({
        file: f,
        id: crypto.randomUUID(),
        title: f.name.replace(/\.[^/.]+$/, ""),
        tags: "",
        metadata: ""
      });
    });

    if (accepted.length) setFiles((p) => [...p, ...accepted]);
    if (errs.length) {
      setErrors(errs);
      errs.forEach((e) => toast.error(e));
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const upload = async () => {
    if (!files.length) return toast.error("No files selected");

    toast.info("Uploading...");
    const fileData = files.map((f) => f.file);
    setFiles([]);

   uploadFiles(
  fileData,
  folderId ?? undefined,
  departmentId ?? undefined
)
  .then(() => toast.success("Upload completed"))
  .catch(() => toast.error("Upload failed"));

closeDialog();

  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={(s) => (s ? openDialog() : closeDialog())}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>Supported: PDF, DOCX, XLSX, JPG, PNG, ZIP, MP4 — Max 2GB</DialogDescription>
        </DialogHeader>

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              {errors.map((e, i) => <div key={i}>{e}</div>)}
            </AlertDescription>
          </Alert>
        )}

        <div
          className="border-2 border-dashed p-10 rounded-lg text-center cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          <input
            type="file"
            multiple
            ref={fileRef}
            className="hidden"
            onChange={(e) => handleFiles(Array.from(e.target.files || []))}
            accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png,.zip,.mp4"
          />
          <Upload className="mx-auto mb-4" />
          Click or drag files here
        </div>

        {files.map((f) => {
          const { icon: Icon, color } = getFileIcon(f.file.name);
          return (
            <div key={f.id} className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center gap-3">
                <Icon className={`h-6 ${color}`} />
                <div>
                  <div>{f.file.name}</div>
                  <small>{formatFileSize(f.file.size)}</small>
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setFiles(p => p.filter(fl => fl.id !== f.id))}>
                <X />
              </Button>
            </div>
          );
        })}

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={closeDialog}>Cancel</Button>
          <Button disabled={!files.length} onClick={upload}>
            Upload ({files.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
