import httpClient from "../httpClient";
import {
  generatePresignedUrlsSchema,
  createDocumentSchema,
  documentIdSchema,
  getDocumentsByParentSchema,
  getRecentDocumentsSchema,
  updateDocumentSchema,
  moveDocumentSchema,
  searchDocumentsSchema,
  findByExtensionSchema,
  createVersionSchema,
  getAllVersionsSchema,
  versionNumberSchema,
  revertToVersionSchema,
  deleteOldVersionsSchema,
  tagsSchema,
  findByTagsSchema,
} from "@/utils/validations/documentValidation";

/* =======================================================
   DOCUMENT UPLOAD & MANAGEMENT API CALLS
   ======================================================= */

/**
 * Generate presigned upload URLs
 * Route: POST /api/documents/generate-upload-urls
 * Access: Private
 */
export const generatePresignedUrls = async (payload: {
  files: { filename: string; mimeType: string }[];
  parent_id: string;
}) => {
  // Validate the payload structure
  const validated = generatePresignedUrlsSchema.parse(payload);
  
  const res = await httpClient.post("/documents/generate-upload-urls", validated);
  return res.data;
};

/**
 * Create a new document
 * Route: POST /api/documents
 * Access: Private
 */
export const createDocument = async (data: {
  name: string;
  originalName: string;
  parent_id: string;
  fileUrl: string;
  mimeType: string;
  extension: string;
  size: number;
  description?: string;
  tags?: string[];
}) => {
  const validated = createDocumentSchema.parse(data);
  const res = await httpClient.post("/documents", validated);
  return res.data;
};

/**
 * Get document by ID
 * Route: GET /api/documents/:id
 * Access: Private
 */
export const getDocumentById = async (id: string) => {
  const validated = documentIdSchema.parse({ id });
  const res = await httpClient.get(`/documents/${validated.id}`);
  return res.data;
};

/**
 * Get documents under a folder or department
 * Route: GET /api/parents/:parentId/documents
 * Access: Private
 */
export const getDocumentsByParent = async (
  parentId: string,
  includeDeleted = false
) => {
  const validated = getDocumentsByParentSchema.parse({ parentId, includeDeleted });
  const res = await httpClient.get(`/parents/${validated.parentId}/documents`, {
    params: { includeDeleted: validated.includeDeleted },
  });
  return res.data;
};

/**
 * Get documents for specific folder
 * Route: GET /api/folders/:folderId/documents
 * Access: Private
 */
export const getDocumentsByFolder = async (folderId: string) => {
  const validated = documentIdSchema.parse({ id: folderId });
  const res = await httpClient.get(`/folders/${validated.id}/documents`);
  return res.data;
};

/**
 * Get documents for specific department
 * Route: GET /api/departments/:departmentId/documents
 * Access: Private
 */
export const getDocumentsByDepartment = async (
  departmentId: string,
  includeDeleted = false
) => {
  const validated = getDocumentsByParentSchema.parse({ 
    parentId: departmentId, 
    includeDeleted 
  });
  const res = await httpClient.get(`/departments/${validated.parentId}/documents`, {
    params: { includeDeleted: validated.includeDeleted },
  });
  return res.data;
};

/**
 * Get recent documents under a department
 * Route: GET /api/departments/:departmentId/documents/recent
 * Access: Private
 */
export const getRecentDocuments = async (
  departmentId: string,
  limit = 10
) => {
  const validated = getRecentDocumentsSchema.parse({ departmentId, limit });
  const res = await httpClient.get(
    `/departments/${validated.departmentId}/documents/recent`,
    { params: { limit: validated.limit } }
  );
  return res.data;
};

/**
 * Update document details
 * Route: PUT /api/documents/:id
 * Access: Private
 */
export const updateDocument = async (
  id: string,
  data: { name?: string; description?: string; tags?: string[] }
) => {
  const validatedId = documentIdSchema.parse({ id });
  const validatedData = updateDocumentSchema.parse(data);
  const res = await httpClient.put(`/documents/${validatedId.id}`, validatedData);
  return res.data;
};

/**
 * Move document to another folder/department
 * Route: POST /api/documents/:id/move
 * Access: Private
 */
export const moveDocument = async (id: string, newParentId: string) => {
  const validatedId = documentIdSchema.parse({ id });
  const validatedData = moveDocumentSchema.parse({ newParentId });
  const res = await httpClient.post(`/documents/${validatedId.id}/move`, validatedData);
  return res.data;
};

/**
 * Soft delete a document
 * Route: DELETE /api/documents/:id
 * Access: Private
 */
export const deleteDocument = async (id: string) => {
  const validated = documentIdSchema.parse({ id });
  const res = await httpClient.delete(`/documents/${validated.id}`);
  return res.data;
};

/**
 * Restore a deleted document
 * Route: POST /api/documents/:id/restore
 * Access: Private
 */
export const restoreDocument = async (id: string) => {
  const validated = documentIdSchema.parse({ id });
  const res = await httpClient.post(`/documents/${validated.id}/restore`);
  return res.data;
};

/**
 * Search documents by name
 * Route: GET /api/documents/search
 * Access: Private
 */
export const searchDocuments = async (
  query: string,
  departmentId?: string,
  limit = 20
) => {
  const validated = searchDocumentsSchema.parse({ 
    q: query, 
    departmentId, 
    limit 
  });
  const res = await httpClient.get("/documents/search", {
    params: validated,
  });
  return res.data;
};

/**
 * Generate presigned download URL
 * Route: GET /api/documents/:id/download
 * Access: Private
 */
export const generateDownloadUrl = async (id: string) => {
  const res = await httpClient.get(`/documents/${id}/download`);
  return res.data;
};



/* =======================================================
   VERSION MANAGEMENT
   ======================================================= */

/**
 * Create a new version of a document
 * Route: POST /api/documents/:id/versions
 * Access: Private
 */
export const createVersion = async (
  id: string,
  data: {
    fileUrl: string;
    size: number;
    mimeType: string;
    extension: string;
    name: string;
    originalName: string;
    changeDescription?: string;
    fileHash?: string;
  }
) => {
  const validatedId = documentIdSchema.parse({ id });

 
  const validatedData = createVersionSchema.parse(data);
  const res = await httpClient.post(
    `/documents/${validatedId.id}/versions`,
    validatedData
  );
  return res.data;
};

/**
 * Get all versions of a document
 * Route: GET /api/documents/:id/versions
 * Access: Private
 */
export const getAllVersions = async (
  id: string,
  options?: {
    sort?: "asc" | "desc";
    limit?: number;
    populate?: boolean;
  }
) => {
  const validatedId = documentIdSchema.parse({ id });
  const validatedOptions = getAllVersionsSchema.parse(options || {});
  const res = await httpClient.get(`/documents/${validatedId.id}/versions`, {
    params: validatedOptions,
  });
  return res.data;
};

/**
 * Get latest version of a document
 * Route: GET /api/documents/:id/versions/latest
 * Access: Private
 */
export const getLatestVersion = async (id: string) => {
  const validated = documentIdSchema.parse({ id });
  const res = await httpClient.get(`/documents/${validated.id}/versions/latest`);
  return res.data;
};

/**
 * Get a specific version by version number
 * Route: GET /api/documents/:id/versions/:versionNumber
 * Access: Private
 */
export const getVersionByNumber = async (id: string, versionNumber: number) => {
  const validatedId = documentIdSchema.parse({ id });
  const validatedVersion = versionNumberSchema.parse({ versionNumber });
  const res = await httpClient.get(
    `/documents/${validatedId.id}/versions/${validatedVersion.versionNumber}`
  );
  return res.data;
};

/**
 * Revert document to a specific version
 * Route: POST /api/documents/:id/versions/revert
 * Access: Private
 */
export const revertToVersion = async (id: string, versionNumber: number) => {
  const validatedId = documentIdSchema.parse({ id });
  const validatedData = revertToVersionSchema.parse({ versionNumber });
  const res = await httpClient.post(
    `/documents/${validatedId.id}/versions/revert`,
    validatedData
  );
  return res.data;
};

/**
 * Get version comparison/difference
 * Route: GET /api/documents/:id/versions/:versionNumber/diff
 * Access: Private
 */
export const getVersionDiff = async (id: string, versionNumber: number) => {
  const validatedId = documentIdSchema.parse({ id });
  const validatedVersion = versionNumberSchema.parse({ versionNumber });
  const res = await httpClient.get(
    `/documents/${validatedId.id}/versions/${validatedVersion.versionNumber}/diff`
  );
  return res.data;
};

/**
 * Delete old versions (keep only N most recent)
 * Route: DELETE /api/documents/:id/versions/cleanup
 * Access: Private
 */
export const deleteOldVersions = async (id: string, keepCount = 5) => {
  const validatedId = documentIdSchema.parse({ id });
  const validatedData = deleteOldVersionsSchema.parse({ keepCount });
  const res = await httpClient.delete(`/documents/${validatedId.id}/versions/cleanup`, {
    data: validatedData,
  });
  return res.data;
};

/**
 * Delete a specific version
 * Route: DELETE /api/documents/:id/versions/:versionNumber
 * Access: Private
 */
export const deleteVersion = async (id: string, versionNumber: number) => {
  const validatedId = documentIdSchema.parse({ id });
  const validatedVersion = versionNumberSchema.parse({ versionNumber });
  const res = await httpClient.delete(
    `/documents/${validatedId.id}/versions/${validatedVersion.versionNumber}`
  );
  return res.data;
};

/* =======================================================
   TAG MANAGEMENT
   ======================================================= */

/**
 * Add tags to a document
 * Route: POST /api/documents/:id/tags
 * Access: Private
 */
export const addTags = async (id: string, tags: string[]) => {
  const validatedId = documentIdSchema.parse({ id });
  const validatedData = tagsSchema.parse({ tags });
  const res = await httpClient.post(`/documents/${validatedId.id}/tags`, validatedData);
  return res.data;
};

/**
 * Remove tags from a document
 * Route: DELETE /api/documents/:id/tags
 * Access: Private
 */
export const removeTags = async (id: string, tags: string[]) => {
  const validatedId = documentIdSchema.parse({ id });
  const validatedData = tagsSchema.parse({ tags });
  const res = await httpClient.delete(`/documents/${validatedId.id}/tags`, {
    data: validatedData,
  });
  return res.data;
};

/**
 * Find documents by tags
 * Route: GET /api/documents/tags
 * Access: Private
 */
export const findByTags = async (tags: string[]) => {
  const validated = findByTagsSchema.parse({ tags });
  const res = await httpClient.get("/documents/tags", {
    params: { tags: validated.tags.join(",") },
  });
  return res.data;
};

/**
 * Find documents by file extension
 * Route: GET /api/documents/extension/:ext
 * Access: Private
 */
export const findByExtension = async (ext: string) => {
  const validated = findByExtensionSchema.parse({ ext });
  const res = await httpClient.get(`/documents/extension/${validated.ext}`);
  return res.data;
};

/* =======================================================
   STATS
   ======================================================= */

/**
 * Get department-wise document stats
 * Route: GET /api/departments/:departmentId/stats
 * Access: Private
 */
export const getDepartmentStats = async (departmentId: string) => {
  const validated = documentIdSchema.parse({ id: departmentId });
  const res = await httpClient.get(`/departments/${validated.id}/stats`);
  return res.data;
};

/* =======================================================
   TYPE DEFINITIONS
   ======================================================= */

export interface Document {
  _id: string;
  name: string;
  originalName: string;
  displayName: string;
  parent_id: string;
  fileUrl: string;
  mimeType: string;
  extension: string;
  size: number;
  sizeFormatted: string;
  description?: string;
  tags: string[];
  path: string;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  fileCategory: string;
}

export interface DocumentVersion {
  _id: string;
  documentId: string;
  versionNumber: number;
  name: string;
  originalName: string;
  displayName: string;
  fileUrl: string;
  size: number;
  sizeFormatted: string;
  mimeType: string;
  extension: string;
  isLatest: boolean;
  changeDescription?: string;
  pathAtCreation?: string;
  fileHash?: string;
  createdBy: string;
  createdAt: Date;
  createdAgo: string;
  fileCategory: string;
}

export interface VersionDiff {
  version: DocumentVersion;
  sizeDifference: {
    bytes: number;
    formatted: string;
    percentage: number;
  };
  previousVersion: DocumentVersion | null;
  nextVersion: DocumentVersion | null;
}

export interface DocumentStats {
  totalDocuments: number;
  totalSize: number;
  totalSizeFormatted: string;
  documentsByExtension: Record<string, number>;
  documentsByCategory: Record<string, number>;
}

export interface DocumentListResponse {
  success: boolean;
  count: number;
  data: Document[];
}

export interface DocumentResponse {
  success: boolean;
  message?: string;
  data: Document;
}

export interface VersionListResponse {
  success: boolean;
  count: number;
  data: DocumentVersion[];
}

export interface VersionResponse {
  success: boolean;
  message?: string;
  data: DocumentVersion;
}

export interface VersionDiffResponse {
  success: boolean;
  data: VersionDiff;
}

export interface DocumentStatsResponse {
  success: boolean;
  data: DocumentStats;
}

export interface PresignedUrlResponse {
  success: boolean;
  data: {
    uploadUrl: string;
    fileUrl: string;
    filename: string;
  }[];
}