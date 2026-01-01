// helpers/fileUploaderHelper.ts

import axios from "axios";
import {
  generatePresignedUrls,
  createDocument,
  initiateChunkedUpload,
  uploadChunk,
  completeChunkedUpload,
  abortChunkedUpload,
} from "@/config/api/documentApi";
import { logBulkFileUpload } from "@/config/api/activityApi";
import { useUploadStore } from "@/config/store/uploadStore";
import { queryClient } from "@/main";
import { validateFileType, normalizeExtension } from "@/utils/helper/fileValidationHelpers";
import { appConfig } from "@/config/appConfig";

/**
 * ============================================================================
 * FILE UPLOADER HELPER - Handles direct & chunked uploads
 * ============================================================================
 */

/* =======================================================
   TYPE DEFINITIONS
   ======================================================= */

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

export interface FileValidationError {
  file: File;
  error: string;
}

interface ChunkUploadPart {
  PartNumber: number;
  ETag: string;
}

/* =======================================================
   CONSTANTS
   ======================================================= */

const CHUNKED_UPLOAD_THRESHOLD = appConfig.chunkedUpload.threshold; // 100MB
const CHUNK_SIZE = appConfig.chunkedUpload.minChunkSize; // 5MB

/* =======================================================
   UTILITY FUNCTIONS
   ======================================================= */

const generateUniqueId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const getFileExtension = (filename: string): string => {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
};

const getFileCategory = (mimeType: string, extension: string): string => {
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || extension === 'docx' || extension === 'doc') return 'document';
  if (mimeType.includes('sheet') || extension === 'xlsx' || extension === 'xls') return 'spreadsheet';
  if (mimeType.includes('presentation') || extension === 'pptx' || extension === 'ppt') return 'presentation';
  if (mimeType.includes('image')) return 'image';
  if (mimeType.includes('video')) return 'video';
  if (mimeType.includes('audio')) return 'audio';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'archive';
  return 'file';
};

const calculateTotalChunks = (fileSize: number): number => {
  return Math.ceil(fileSize / CHUNK_SIZE);
};

/* =======================================================
   FILE VALIDATION
   ======================================================= */

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const extension = getFileExtension(file.name);
  const ext = normalizeExtension(extension);

  // Validate file type
  const typeValidation = validateFileType(ext, file.type);
  if (!typeValidation.valid) {
    return {
      valid: false,
      error: typeValidation.error,
    };
  }

  // Validate file size (5GB max)
  const maxSize = 5 * 1024 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size is 5GB`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty',
    };
  }

  return { valid: true };
};

export const validateFiles = (files: File[]): {
  validFiles: File[];
  errors: FileValidationError[];
} => {
  const validFiles: File[] = [];
  const errors: FileValidationError[] = [];

  files.forEach((file) => {
    const validation = validateFile(file);
    if (validation.valid) {
      validFiles.push(file);
    } else {
      errors.push({
        file,
        error: validation.error || 'Unknown error',
      });
    }
  });

  return { validFiles, errors };
};

/* =======================================================
   CHUNKED UPLOAD IMPLEMENTATION
   ======================================================= */

async function uploadFileChunked(
  file: File,
  parentId: string,
  uploadId: string,
  abortController: AbortController
): Promise<UploadedFileInfo> {
  const { setStatus, updateChunkProgress } = useUploadStore.getState();
  const extension = getFileExtension(file.name);
  const totalChunks = calculateTotalChunks(file.size);

  try {
    // Step 1: Initiate chunked upload
    setStatus(uploadId, 'Pending Upload');
    
    const initResponse = await initiateChunkedUpload({
      filename: file.name,
      mimeType: file.type,
      fileSize: file.size,
      parentId,
    });

    const { uploadId: s3UploadId, key } = initResponse.data;

    // Step 2: Upload chunks
    setStatus(uploadId, 'Uploading File');
    const uploadedParts: ChunkUploadPart[] = [];
    let uploadedChunks = 0;

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      // Check if cancelled
      if (abortController.signal.aborted) {
        throw new Error('Upload cancelled');
      }

      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);
      const partNumber = chunkIndex + 1;

      try {
        const chunkResponse = await uploadChunk({
          uploadId: s3UploadId,
          key,
          partNumber,
          chunk,
        });

        console.log(chunkResponse.data.data.ETag)

        uploadedParts.push({
          PartNumber: partNumber,
          ETag: chunkResponse.data.data.ETag,
        });

        uploadedChunks++;
        updateChunkProgress(uploadId, uploadedChunks);

      } catch (chunkError: any) {
        console.error(`Failed to upload chunk ${partNumber}:`, chunkError);
        
        // Abort the multipart upload on S3
        await abortChunkedUpload({ uploadId: s3UploadId, key });
        throw new Error(`Chunk ${partNumber} upload failed`);
      }
    }

    // Step 3: Complete upload and create document
    setStatus(uploadId, 'Processing File');

    const completeResponse = await completeChunkedUpload({
  uploadId: s3UploadId,
  key,
  parts: uploadedParts,
  parentId,
  name: file.name,
  mimeType: file.type,
  fileSize: file.size,
});


    const fileCategory = getFileCategory(file.type, extension);

    return {
      id: completeResponse.data._id,
      name: file.name,
      extension,
      type: fileCategory,
      size: file.size,
    };

  } catch (error: any) {
    if (axios.isCancel(error) || error.name === 'CanceledError' || error.message === 'Upload cancelled') {
      setStatus(uploadId, 'Upload Cancelled');
    } else {
      setStatus(uploadId, 'Upload Failed', error.message || 'Chunked upload failed');
    }
    throw error;
  }
}



async function uploadFileDirect(
  file: File,
  presignedUrl: string,
  presignedKey: string,
  parentId: string,
  uploadId: string,
  abortController: AbortController
): Promise<UploadedFileInfo> {
  const { setStatus, updateProgress } = useUploadStore.getState();
  const extension = getFileExtension(file.name);

  try {
    setStatus(uploadId, 'Uploading File');

    // Upload to S3 with progress tracking
    await axios.put(presignedUrl, file, {
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

    // Create document record
    setStatus(uploadId, 'Processing File');

    const fileCategory = getFileCategory(file.type, extension);
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");

    const documentResponse = await createDocument({
      name: nameWithoutExt,
      originalName: file.name,
      parentId,
      fileUrl: presignedKey,
      mimeType: file.type,
      extension,
      size: file.size,
    });

    return {
      id: documentResponse.data._id,
      name: file.name,
      extension,
      type: fileCategory,
      size: file.size,
    };

  } catch (error: any) {
    if (axios.isCancel(error) || error.name === 'CanceledError') {
      setStatus(uploadId, 'Upload Cancelled');
    } else {
      setStatus(uploadId, 'Upload Failed', error.message || 'Upload failed');
    }
    throw error;
  }
}



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

  const { addUpload, setStatus } = useUploadStore.getState();
  const uploadedFiles: UploadedFileInfo[] = [];
  let successfulUploads = 0;

  try {
    // Separate files into direct and chunked uploads
    const directUploadFiles: File[] = [];
    const chunkedUploadFiles: File[] = [];

    files.forEach((file) => {
      if (file.size > CHUNKED_UPLOAD_THRESHOLD) {
        chunkedUploadFiles.push(file);
      } else {
        directUploadFiles.push(file);
      }
    });

    // Step 1: Generate presigned URLs for direct uploads
    let presignedFiles: any[] = [];
    if (directUploadFiles.length > 0) {
      const filesPayload = directUploadFiles.map((file) => ({
        filename: file.name,
        mimeType: file.type,
      }));

      const presignedResponse = await generatePresignedUrls({
        files: filesPayload,
        parentId,
      });

      presignedFiles = presignedResponse?.data;

      if (!Array.isArray(presignedFiles)) {
        throw new Error("Invalid presigned URL response");
      }
    }

    // Step 2: Upload all files (direct + chunked)
    const uploadPromises: Promise<void>[] = [];

    // Process direct uploads
    presignedFiles.forEach((item: any, index: number) => {
      const file = directUploadFiles[index];
      const uploadId = generateUniqueId();
      const abortController = new AbortController();
      const totalChunks = 0; // Not chunked

      addUpload({
        id: uploadId,
        name: file.name,
        size: file.size,
        progress: 0,
        status: 'Pending Upload',
        method: 'direct',
        cancelToken: abortController,
        totalChunks,
        uploadedChunks: 0,
      });

      const uploadPromise = uploadFileDirect(
        file,
        item.url,
        item.key,
        parentId,
        uploadId,
        abortController
      )
        .then((uploadedFile) => {
          setStatus(uploadId, 'Upload Complete');
          uploadedFiles.push(uploadedFile);
          successfulUploads++;
          onFileUploaded?.(successfulUploads, files.length);

          // Invalidate queries
          queryClient.invalidateQueries({ queryKey: ["children", parentId] });
          queryClient.invalidateQueries({ queryKey: ["tree"] });
          queryClient.invalidateQueries({ queryKey: ["documents"] });
          queryClient.invalidateQueries({ queryKey: ["folder-children", parentId] });
        })
        .catch((error) => {
          console.error(`Direct upload failed for ${file.name}:`, error);
        });

      uploadPromises.push(uploadPromise);
    });

    // Process chunked uploads
    chunkedUploadFiles.forEach((file) => {
      const uploadId = generateUniqueId();
      const abortController = new AbortController();
      const totalChunks = calculateTotalChunks(file.size);

      addUpload({
        id: uploadId,
        name: file.name,
        size: file.size,
        progress: 0,
        status: 'Pending Upload',
        method: 'chunked',
        cancelToken: abortController,
        totalChunks,
        uploadedChunks: 0,
      });

      const uploadPromise = uploadFileChunked(
        file,
        parentId,
        uploadId,
        abortController
      )
        .then((uploadedFile) => {
          setStatus(uploadId, 'Upload Complete');
          uploadedFiles.push(uploadedFile);
          successfulUploads++;
          onFileUploaded?.(successfulUploads, files.length);

          // Invalidate queries
          queryClient.invalidateQueries({ queryKey: ["children", parentId] });
          queryClient.invalidateQueries({ queryKey: ["tree"] });
          queryClient.invalidateQueries({ queryKey: ["documents"] });
          queryClient.invalidateQueries({ queryKey: ["folder-children", parentId] });
        })
        .catch((error) => {
          console.error(`Chunked upload failed for ${file.name}:`, error);
        });

      uploadPromises.push(uploadPromise);
    });

    // Wait for all uploads
    await Promise.all(uploadPromises);

    // Step 3: Log activity
    if (uploadedFiles.length > 0) {
      try {
        await logBulkFileUpload({
          parentId,
          files: uploadedFiles,
        });

        // Invalidate activity queries
        queryClient.invalidateQueries({ queryKey: ["activities"] });
        queryClient.invalidateQueries({ queryKey: ["user-activities"] });
        queryClient.invalidateQueries({ queryKey: ["folder-activity", parentId] });

        console.log(`✅ Activity logged: ${uploadedFiles.length} files uploaded`);
      } catch (activityError) {
        console.error('Failed to log activity:', activityError);
      }
    }

    // Success
    onSuccess?.(successfulUploads);

    return {
      success: true,
      count: successfulUploads,
    };

  } catch (error) {
    onError?.(error);
    throw error;
  }
};