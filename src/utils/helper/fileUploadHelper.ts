import axios from "axios";
import { generatePresignedUrls, createDocument } from "@/config/api/documentApi";
import { logBulkFileUpload } from "@/config/api/activityApi";
import { useUploadStore } from "@/config/store/uploadStore";
import { queryClient } from "@/main";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
export interface FileUploadOptions {
  parentId: string;
  onSuccess?: (count: number) => void;
  onError?: (error: any) => void;
  onFileUploaded?: (fileIndex: number, totalFiles: number) => void;
}

export interface FileUploadResult {
  success: boolean;
  count: number;
  errors?: string[];
}

interface UploadedFileInfo {
  id: string;
  name: string;
  extension: string;
  type: string;
  size: number;
}

const getFileExtension = (file: File): string => {
  const extFromName = file.name.split(".").pop()?.toLowerCase();
  if (extFromName) return extFromName;
  const mime = file.type
    .toLowerCase()
    .replace("application/", "")
    .replace("x-", "");
  return mime || "unknown";
};

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const getFileType = (mimeType: string, extension: string): string => {
  // Map mime types to file types
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || extension === 'docx' || extension === 'doc') return 'document';
  if (mimeType.includes('sheet') || extension === 'xlsx' || extension === 'xls') return 'spreadsheet';
  if (mimeType.includes('image')) return 'image';
  if (mimeType.includes('zip')) return 'archive';
  return 'file';
};

export const uploadFiles = async (
  files: File[],
  options: FileUploadOptions
): Promise<FileUploadResult> => {
  const { parentId, onSuccess, onError, onFileUploaded } = options;

  if (!files || files.length === 0) {
    throw new Error("No files provided");
  }

  if (!parentId) {
    throw new Error("Parent ID is required");
  }

  const { addUpload, updateProgress, setStatus } = useUploadStore.getState();

  // Track uploaded files for activity logging
  const uploadedFiles: UploadedFileInfo[] = [];
  let successfulUploads = 0;

  try {
    // Step 1: Generate presigned URLs
    const filesPayload = files.map((file) => ({
      filename: file.name,
      mimeType: file.type,
    }));

    // ✅ FIXED: Pass parent_id to generatePresignedUrls
    const presignedResponse = await generatePresignedUrls({
      files: filesPayload,
      parent_id: parentId, // ✅ Now included!
    });
    
    const presignedFiles = presignedResponse?.data;

    if (!Array.isArray(presignedFiles)) {
      throw new Error("Invalid presigned URL response");
    }

    // Step 2: Upload files to S3 and save metadata
    const uploadPromises = presignedFiles.map(async (item: any, index: number) => {
      const file = files[index];
      const uploadId = generateUniqueId();
      const abortController = new AbortController();

      // Add to upload store with correct status
      addUpload({
        id: uploadId,
        name: file.name,
        progress: 0,
        size: file.size,
        status: 'Uploading File',
        cancelToken: abortController,
      });

      try {
        // Upload to S3
        await axios.put(item.url, file, {
          headers: { "Content-Type": file.type },
          signal: abortController.signal,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              updateProgress(uploadId, percentCompleted);
            }
          },
        });

        // Update status to Processing
        setStatus(uploadId, 'Processing File');

        const fileUrl = item.key;
        const extension = getFileExtension(file);
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        const fileType = getFileType(file.type, extension);

        // Save document metadata
        const documentResponse = await createDocument({
          name: nameWithoutExt,
          originalName: file.name,
          parent_id: parentId,
          fileUrl: fileUrl,
          mimeType: file.type,
          extension: extension,
          size: file.size,
        });

        // Mark as completed
        setStatus(uploadId, 'Upload Complete');
        successfulUploads++;

        // ✅ Store uploaded file info for activity logging
        uploadedFiles.push({
          id: documentResponse.data._id, // Document ID from response
          name: file.name,
          extension: extension,
          type: fileType,
          size: file.size,
        });

        // ✅ IMMEDIATELY INVALIDATE QUERIES AFTER EACH FILE
        queryClient.invalidateQueries({ queryKey: ["children", parentId] });
        queryClient.invalidateQueries({ queryKey: ["tree"] });
        queryClient.invalidateQueries({ queryKey: ["documents"] });

        // ✅ Call the callback to notify about this file completion
        onFileUploaded?.(successfulUploads, files.length);

      } catch (error: any) {
        if (axios.isCancel(error) || error.name === 'CanceledError') {
          setStatus(uploadId, 'Upload Cancelled');
        } else {
          setStatus(uploadId, 'Upload Failed', error.message);
        }
        throw error;
      }
    });

    // Wait for all uploads to complete
    await Promise.all(uploadPromises);

    // ✅ Step 3: Log activity AFTER all files successfully uploaded
    if (uploadedFiles.length > 0) {
      try {
        await logBulkFileUpload({
          parentId: parentId, // Backend will fetch parent folder snapshot
          files: uploadedFiles.map(file => ({
            id: file.id,
            name: file.name,
            extension: file.extension,
            type: file.type,
            size: file.size,
          })),
        });

        // Invalidate activity queries to refresh activity feed
        queryClient.invalidateQueries({ queryKey: ["activities"] });
        queryClient.invalidateQueries({ queryKey: ["user-activities"] });
        queryClient.invalidateQueries({ queryKey: ["folder-activity", parentId] });
        
        console.log(`✅ Activity logged: ${uploadedFiles.length} files uploaded`);
      } catch (activityError) {
        // Log error but don't fail the upload
        console.error('Failed to log activity:', activityError);
      }
    }

    // Final success callback
    onSuccess?.(files.length);

    return {
      success: true,
      count: files.length,
    };
  } catch (error) {
    onError?.(error);
    throw error;
  }
};

// ============================================================================
// FILE VALIDATION
// ============================================================================
export const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".xlsx",
  ".jpg",
  ".jpeg",
  ".png",
  ".zip",
];

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "application/zip",
  "application/x-zip-compressed",
];

export const MAX_FILE_SIZE = 4 * 1024 * 1024 * 1024; // 4 GB

export const validateFile = (
  file: File
): { valid: boolean; error?: string } => {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();

  // Check 1: Extension validation
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file type "${ext}". Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
    };
  }

  // Check 2: MIME type validation (STRICT)
  if (!file.type || !ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file format. File type must match allowed formats.`,
    };
  }

  // Check 3: Size validation
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeGB = (MAX_FILE_SIZE / 1024 / 1024 / 1024).toFixed(1);
    return {
      valid: false,
      error: `File too large. Max size: ${maxSizeGB}GB`,
    };
  }

  return { valid: true };
};

export const validateFiles = (
  files: File[]
): { validFiles: File[]; errors: string[] } => {
  const validFiles: File[] = [];
  const errors: string[] = [];

  files.forEach((file) => {
    const validation = validateFile(file);
    if (validation.valid) {
      validFiles.push(file);
    } else {
      errors.push(`${file.name}: ${validation.error}`);
    }
  });

  return { validFiles, errors };
};