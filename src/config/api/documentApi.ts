// api/documentApi.ts

import httpClient from '@/config/httpClient';
import type {
  IPresignedUrlsResponse,
  IDocumentResponse,
  IDocumentListResponse,
  IVersionResponse,
  IVersionListResponse,
  IDownloadUrlResponse,
  IShareDocumentResponse,
  IChunkedUploadInitResponse,
  IDocumentStatsResponse,
  IGeneratePresignedUrlsPayload,
  ICreateDocumentPayload,
  IUpdateDocumentPayload,
  IMoveDocumentPayload,
  ISearchDocumentsParams,
  ICreateVersionPayload,
  IRevertToVersionPayload,
  ITagsPayload,
  IShareDocumentPayload,
  IInitiateChunkedUploadPayload,
  ICompleteChunkedUploadPayload,
  IAbortChunkedUploadPayload,
} from '@/config/types/documentTypes';

/* =======================================================
   UPLOAD & PRESIGNED URLs
   ======================================================= */

/**
 * Generate presigned upload URLs for direct S3 upload
 * @route POST /api/documents/generate-upload-urls
 */
export async function generatePresignedUrls(
  payload: IGeneratePresignedUrlsPayload
): Promise<IPresignedUrlsResponse> {
  const response = await httpClient.post('/documents/generate-upload-urls', payload);
  return response.data;
}

/**
 * Create a new document after S3 upload
 * @route POST /api/documents
 */
export async function createDocument(
  payload: ICreateDocumentPayload
): Promise<IDocumentResponse> {
  const response = await httpClient.post('/documents', payload);
  return response.data;
}

/* =======================================================
   CHUNKED UPLOAD (Large Files) - DIRECT S3 UPLOAD
   ======================================================= */

/**
 * Initiate chunked upload for files >100MB
 * Returns presigned URLs for direct S3 upload
 * @route POST /api/documents/chunked/initiate
 */
export async function initiateChunkedUpload(
  payload: IInitiateChunkedUploadPayload
): Promise<IChunkedUploadInitResponse> {
  const response = await httpClient.post('/documents/chunked/initiate', payload);
  return response.data;
}

/**
 * Complete chunked upload and create document record
 * @route POST /api/documents/chunked/complete
 */
export async function completeChunkedUpload(
  payload: ICompleteChunkedUploadPayload
): Promise<IDocumentResponse> {
  const response = await httpClient.post('/documents/chunked/complete', payload);
  return response.data;
}

/**
 * Abort chunked upload and cleanup S3
 * @route POST /api/documents/chunked/abort
 */
export async function abortChunkedUpload(
  payload: IAbortChunkedUploadPayload
): Promise<void> {
  await httpClient.post('/documents/chunked/abort', payload);
}

/* =======================================================
   DOCUMENT READ
   ======================================================= */

/**
 * Get document by ID with full details
 * @route GET /api/documents/:id
 */
export async function getDocumentById(id: string): Promise<IDocumentResponse> {
  const response = await httpClient.get(`/documents/${id}`);
  return response.data;
}

/**
 * Search documents
 * @route GET /api/documents/search
 */
export async function searchDocuments(
  params: ISearchDocumentsParams
): Promise<IDocumentListResponse> {
  const response = await httpClient.get('/documents/search', { params });
  return response.data;
}

/* =======================================================
   DOCUMENT UPDATE
   ======================================================= */

/**
 * Update document metadata
 * @route PUT /api/documents/:id
 */
export async function updateDocument(
  id: string,
  payload: IUpdateDocumentPayload
): Promise<IDocumentResponse> {
  const response = await httpClient.put(`/documents/${id}`, payload);
  return response.data;
}

/**
 * Move document to another folder/department
 * @route POST /api/documents/:id/move
 */
export async function moveDocument(
  id: string,
  payload: IMoveDocumentPayload
): Promise<IDocumentResponse> {
  const response = await httpClient.post(`/documents/${id}/move`, payload);
  return response.data;
}

/**
 * Soft delete a document
 * @route DELETE /api/documents/:id
 */
export async function deleteDocument(id: string): Promise<void> {
  await httpClient.delete(`/documents/${id}`);
}

/**
 * Restore a deleted document
 * @route POST /api/documents/:id/restore
 */
export async function restoreDocument(id: string): Promise<IDocumentResponse> {
  const response = await httpClient.post(`/documents/${id}/restore`);
  return response.data;
}

/* =======================================================
   TAG MANAGEMENT
   ======================================================= */

/**
 * Add tags to document
 * @route POST /api/documents/:id/tags
 */
export async function addTags(
  id: string,
  payload: ITagsPayload
): Promise<IDocumentResponse> {
  const response = await httpClient.post(`/documents/${id}/tags`, payload);
  return response.data;
}

/**
 * Remove tags from document
 * @route DELETE /api/documents/:id/tags
 */
export async function removeTags(
  id: string,
  payload: ITagsPayload
): Promise<IDocumentResponse> {
  const response = await httpClient.delete(`/documents/${id}/tags`, { data: payload });
  return response.data;
}

/* =======================================================
   DOWNLOAD
   ======================================================= */

/**
 * Generate download URL for document
 * @route GET /api/documents/:id/download
 */
export async function generateDownloadUrl(id: string): Promise<IDownloadUrlResponse> {
  const response = await httpClient.get(`/documents/${id}/download`);
  return response.data;
}

/* =======================================================
   VERSION MANAGEMENT
   ======================================================= */

/**
 * Create new version (re-upload)
 * @route POST /api/documents/:id/versions
 */
export async function createVersion(
  id: string,
  payload: ICreateVersionPayload
): Promise<IVersionResponse> {
  const response = await httpClient.post(`/documents/${id}/versions`, payload);
  return response.data;
}

/**
 * Get all versions
 * @route GET /api/documents/:id/versions
 */
export async function getAllVersions(id: string): Promise<IVersionListResponse> {
  const response = await httpClient.get(`/documents/${id}/versions`);
  return response.data;
}

/**
 * Get specific version by number or ObjectId
 * @route GET /api/documents/:id/versions/:versionNumber
 */
export async function getVersionByNumber(
  id: string,
  versionNumber: number | string
): Promise<IVersionResponse> {
  const response = await httpClient.get(`/documents/${id}/versions/${versionNumber}`);
  return response.data;
}

/**
 * Generate download URL for specific version
 * @route GET /api/documents/:id/versions/:versionNumber/download
 */
export async function generateVersionDownloadUrl(
  id: string,
  versionNumber: number | string
): Promise<IDownloadUrlResponse> {
  const response = await httpClient.get(
    `/documents/${id}/versions/${versionNumber}/download`
  );
  return response.data;
}

/**
 * Revert to specific version
 * @route POST /api/documents/:id/versions/revert
 */
export async function revertToVersion(
  id: string,
  payload: IRevertToVersionPayload
): Promise<IVersionResponse> {
  const response = await httpClient.post(`/documents/${id}/versions/revert`, payload);
  return response.data;
}

/* =======================================================
   SHARING
   ======================================================= */

/**
 * Share document with users/groups
 * @route POST /api/documents/:id/share
 */
export async function shareDocument(
  id: string,
  payload: IShareDocumentPayload
): Promise<IShareDocumentResponse> {
  const response = await httpClient.post(`/documents/${id}/share`, payload);
  return response.data;
}

/* =======================================================
   STATISTICS
   ======================================================= */

/**
 * Get department document statistics
 * @route GET /api/departments/:departmentId/stats
 */
export async function getDepartmentStats(
  departmentId: string
): Promise<IDocumentStatsResponse> {
  const response = await httpClient.get(`/departments/${departmentId}/stats`);
  return response.data;
}

/* =======================================================
   UTILITY FUNCTIONS
   ======================================================= */

/**
 * Helper: Upload file with progress tracking (Direct Upload)
 */
export async function uploadFileWithProgress(
  file: File,
  parentId: string,
  onProgress?: (progress: number) => void
): Promise<IDocumentResponse> {
  // 1. Generate presigned URL
  const { data: presignedData } = await generatePresignedUrls({
    files: [
      {
        filename: file.name,
        mimeType: file.type,
      },
    ],
    parentId,
  });

  const { url, key } = presignedData[0];

  // 2. Upload to S3 with progress
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Upload failed')));
    xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });

  // 3. Create document record
  const extension = file.name.split('.').pop() || '';
  const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
  
  return await createDocument({
    name: nameWithoutExt,
    originalName: file.name,
    parentId,
    fileUrl: key,
    mimeType: file.type,
    extension,
    size: file.size,
  });
}

/**
 * Helper: Download file
 */
export async function downloadFile(id: string): Promise<void> {
  const { data } = await generateDownloadUrl(id);
  const link = document.createElement('a');
  link.href = data.url;
  link.download = data.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Helper: Download specific version
 */
export async function downloadVersion(
  id: string,
  versionNumber: number | string
): Promise<void> {
  const { data } = await generateVersionDownloadUrl(id, versionNumber);
  const link = document.createElement('a');
  link.href = data.url;
  link.download = data.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}