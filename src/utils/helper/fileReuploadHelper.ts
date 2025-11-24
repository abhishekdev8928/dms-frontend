import axios from "axios";
import { generatePresignedUrls } from "@/config/api/documentApi";
import { createVersion } from "@/config/api/documentApi";
import { useUploadStore } from "@/config/store/uploadStore";

export interface FileReuploadOptions {
  documentId: string;
  changeDescription?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export interface FileReuploadResult {
  success: boolean;
  versionId?: string;
}


const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};


export const reuploadFile = async (
  file: File,
  options: FileReuploadOptions
): Promise<FileReuploadResult> => {
  const { documentId, changeDescription, onSuccess, onError } = options;

  if (!file) {
    throw new Error("No file provided");
  }

  if (!documentId) {
    throw new Error("Document ID is required");
  }

  const { addUpload, updateProgress, setStatus, removeUpload } = useUploadStore.getState();

  const uploadId = generateUniqueId();
  const abortController = new AbortController();

  try {
    // Step 1: Generate presigned URL for the single file
    const filesPayload = [{
      filename: file.name,
      mimeType: file.type,
    }];

    const presignedResponse = await generatePresignedUrls(filesPayload);
    
    // Handle different possible response structures
    let presignedFiles;
    
    if (Array.isArray(presignedResponse?.data)) {
      presignedFiles = presignedResponse.data;
    } 
    else if (Array.isArray(presignedResponse?.data?.urls)) {
      presignedFiles = presignedResponse.data.urls;
    }
    else if (Array.isArray(presignedResponse?.data?.data)) {
      presignedFiles = presignedResponse.data.data;
    }
    else {
      throw new Error("Invalid presigned URL response structure");
    }

    if (!Array.isArray(presignedFiles) || presignedFiles.length === 0) {
      throw new Error("Invalid presigned URL response - no files found");
    }

    const presignedData = presignedFiles[0];

    // Try different possible field names for upload URL
    const uploadUrl = presignedData.uploadUrl || presignedData.url || presignedData.signedUrl;
    const s3Key = presignedData.fileUrl || presignedData.key || presignedData.s3Key;

    if (!uploadUrl) {
      throw new Error("Upload URL not found in presigned response");
    }

    if (!s3Key) {
      throw new Error("S3 key not found in presigned response");
    }

    // Add to upload store with correct status
    addUpload({
      id: uploadId,
      name: file.name,
      progress: 0,
      size: file.size,
      status: 'Uploading File',
      cancelToken: abortController,
    });

    // Step 2: Upload to S3
    await axios.put(uploadUrl, file, {
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

    // Extract file extension
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    // Step 3: Create version record with all required fields
    const versionResponse = await createVersion(documentId, {
      fileUrl: s3Key,
      size: file.size,
      mimeType: file.type,
      extension: extension,
      name: file.name.replace(`.${extension}`, ''), // Name without extension
      originalName: file.name,
      changeDescription: changeDescription || "File reuploaded",
    });

    // Mark as completed
    setStatus(uploadId, 'Upload Complete');

    // Auto-remove after 3 seconds
    setTimeout(() => {
      removeUpload(uploadId);
    }, 3000);

    onSuccess?.();

    return {
      success: true,
      versionId: versionResponse?.data?._id,
    };
  } catch (error: any) {
    if (axios.isCancel(error) || error.name === 'CanceledError') {
      setStatus(uploadId, 'Upload Cancelled');
    } else {
      setStatus(uploadId, 'Upload Failed', error.message);
    }

    onError?.(error);
    throw error;
  }
};

// ============================================================================
// FILE VALIDATION (Reuse from original helper)
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

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid MIME type",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024 / 1024}GB`,
    };
  }

  return { valid: true };
};