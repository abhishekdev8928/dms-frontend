import httpClient from "../httpClient";
import {
  createFolderSchema,
  getRootFoldersSchema,
  folderIdSchema,
  getChildFoldersSchema,
  getAllDescendantsSchema,
  updateFolderSchema,
  moveFolderSchema,
  searchFoldersSchema,
  getFolderByPathSchema,
} from "@/utils/validations/folderValidation";

/* =======================================================
   FOLDER MANAGEMENT API CALLS
   ======================================================= */

/**
 * Create a new folder
 * Route: POST /api/folders
 * Access: Private
 */
export const createFolder = async (data: {
  name: string;
  parent_id: string;
  description?: string;
  color?: string;
}) => {
  const validated = createFolderSchema.parse(data);
  const res = await httpClient.post("/folders", validated);
  return res.data;
};

/**
 * Get root folders of a department
 * Route: GET /api/departments/:departmentId/folders
 * Access: Private
 */
export const getRootFolders = async (
  departmentId: string,
  includeDeleted = false
) => {
  const validated = getRootFoldersSchema.parse({ departmentId, includeDeleted });
  const res = await httpClient.get(`/departments/${validated.departmentId}/folders`, {
    params: { includeDeleted: validated.includeDeleted },
  });
  return res.data;
};

/**
 * Get folder by ID with details and breadcrumbs
 * Route: GET /api/folders/:id
 * Access: Private
 */
export const getFolderById = async (id: string) => {
  const validated = folderIdSchema.parse({ id });
  const res = await httpClient.get(`/folders/${validated.id}`);
  return res.data;
};

/**
 * Get child folders (direct children only, or nested with filters)
 * Route: GET /api/folders/:id/children
 * Access: Private
 */
export const getChildFolders = async (
  id: string,
  params?: { includeDeleted?: boolean; type?: string; userEmail?: string }
) => {
  console.log('🚀 API Called with:', { id, params });
  
  const validatedId = folderIdSchema.parse({ id });
  
  const cleanParams = Object.fromEntries(
    Object.entries(params || {}).filter(([_, value]) => value !== undefined)
  );
  
  
  const validatedParams = getChildFoldersSchema.parse(cleanParams);
  
  
  const res = await httpClient.get(`/folders/${validatedId.id}/children`, {
    params: validatedParams,
  });
  
  return res.data;
};

/**
 * Get all descendants (nested children recursively)
 * Route: GET /api/folders/:id/descendants
 * Access: Private
 */
export const getAllDescendants = async (
  id: string,
  params?: { includeDeleted?: boolean; type?: string }
) => {
  const validatedId = folderIdSchema.parse({ id });
  const validatedParams = getAllDescendantsSchema.parse(params || {});
  const res = await httpClient.get(`/folders/${validatedId.id}/descendants`, {
    params: validatedParams,
  });
  return res.data;
};

/**
 * Get folder breadcrumbs (path hierarchy)
 * Route: GET /api/folders/:id/breadcrumbs
 * Access: Private
 */
export const getFolderBreadcrumbs = async (id: string) => {
  const validated = folderIdSchema.parse({ id });
  const res = await httpClient.get(`/folders/${validated.id}/breadcrumbs`);
  return res.data;
};

/**
 * Update folder details
 * Route: PUT /api/folders/:id
 * Access: Private
 */
export const updateFolder = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    color?: string;
  }
) => {
  const validatedId = folderIdSchema.parse({ id });
  const validatedData = updateFolderSchema.parse(data);
  const res = await httpClient.put(`/folders/${validatedId.id}`, validatedData);
  return res.data;
};

/**
 * Move folder to a new parent
 * Route: POST /api/folders/:id/move
 * Access: Private
 */
export const moveFolder = async (id: string, newParentId: string) => {
  const validatedId = folderIdSchema.parse({ id });
  const validatedData = moveFolderSchema.parse({ newParentId });
  const res = await httpClient.post(`/folders/${validatedId.id}/move`, validatedData);
  return res.data;
};

/**
 * Soft delete a folder
 * Route: DELETE /api/folders/:id
 * Access: Private
 */
export const softDeleteFolder = async (id: string) => {
  const validated = folderIdSchema.parse({ id });
  const res = await httpClient.delete(`/folders/${validated.id}`);
  return res.data;
};

/**
 * Restore a deleted folder
 * Route: POST /api/folders/:id/restore
 * Access: Private
 */
export const restoreFolder = async (id: string) => {
  const validated = folderIdSchema.parse({ id });
  const res = await httpClient.post(`/folders/${validated.id}/restore`);
  return res.data;
};

/**
 * Get folder statistics (child count, document count, total size)
 * Route: GET /api/folders/:id/stats
 * Access: Private
 */
export const getFolderStats = async (id: string) => {
  const validated = folderIdSchema.parse({ id });
  const res = await httpClient.get(`/folders/${validated.id}/stats`);
  return res.data;
};

/**
 * Search folders by name
 * Route: GET /api/folders/search
 * Access: Private
 */
export const searchFolders = async (params: {
  q: string;
  departmentName?: string;
}) => {
  const validated = searchFoldersSchema.parse(params);
  const res = await httpClient.get(`/folders/search`, { params: validated });
  return res.data;
};

/**
 * Get folder by path string
 * Route: GET /api/folders/by-path
 * Access: Private
 */
export const getFolderByPath = async (path: string) => {
  const validated = getFolderByPathSchema.parse({ path });
  const res = await httpClient.get(`/folders/by-path`, {
    params: { path: validated.path },
  });
  return res.data;
};

/* =======================================================
   TYPE DEFINITIONS
   ======================================================= */

export interface Folder {
  _id: string;
  name: string;
  parent_id: string;
  description?: string;
  color: string;
  path: string;
  depth: number;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | User;
  updatedBy?: string | User;
  type: "folder";
}

export interface User {
  _id: string;
  name: string;
  email: string;
  username?: string;
}

export interface Department {
  _id: string;
  name: string;
  path: string;
}

export interface Breadcrumb {
  id: string;
  name: string;
  path: string;
  type: "department" | "folder";
}

export interface FolderWithDetails extends Folder {
  department: Department | null;
  breadcrumbs: Breadcrumb[];
}

export interface ChildItem {
  _id: string;
  name: string;
  type: "folder" | "document";
  parent_id: string;
  path: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  color?: string;
  depth?: number;
  size?: number;
  sizeFormatted?: string;
  extension?: string;
  fileCategory?: string;
}

export interface FolderStats {
  childFolders: number;
  documents: number;
  totalSize: number;
  totalSizeFormatted: string;
}

export interface FolderListResponse {
  success: boolean;
  count: number;
  data: Folder[];
}

export interface FolderResponse {
  success: boolean;
  message?: string;
  data: Folder | FolderWithDetails;
}

export interface FolderChildrenResponse {
  success: boolean;
  count: number;
  data: ChildItem[];
}

export interface FolderStatsResponse {
  success: boolean;
  data: FolderStats;
}

export interface FolderBreadcrumbsResponse {
  success: boolean;
  data: {
    path: string;
    breadcrumbs: Breadcrumb[];
  };
}

export interface FolderSearchResponse {
  success: boolean;
  count: number;
  data: FolderWithDetails[];
}