import httpClient from "../httpClient";
import {
  createFolderSchema,
  folderIdSchema,
  getChildFoldersSchema,
  updateFolderSchema,
  moveFolderSchema,
  searchFoldersSchema,
  shareFolderSchema,
} from "@/utils/validations/folderValidation";
import type {
  ICreateFolderData,
  IUpdateFolderData,
  IMoveFolderData,
  IGetChildFoldersParams,
  ISearchFoldersParams,
  IShareFolderData,
  IFolderResponse,
  IFolderChildrenResponse,
  IFolderStatsResponse,
  IFolderBreadcrumbsResponse,
  IFolderSearchResponse,
  IDeleteFolderResponse,
  IRestoreFolderResponse,
  IMoveFolderResponse,
  IShareFolderResponse,
} from "@/config/types/folderTypes";

/* =======================================================
   FOLDER MANAGEMENT API CALLS
   ======================================================= */

/**
 * Create a new folder
 * Route: POST /api/folders
 * Access: Private - Requires 'upload' permission on parent
 */
export const createFolder = async (
  payload: ICreateFolderData
): Promise<IFolderResponse> => {
  const validated = createFolderSchema.parse(payload);
  const res = await httpClient.post("/folders", validated);
  return res.data;
};

/**
 * Get folder by ID with details
 * Route: GET /api/folders/:id
 * Access: Private - Requires 'view' permission
 */
export const getFolderById = async (id: string): Promise<IFolderResponse> => {
  const validated = folderIdSchema.parse({ id });
  const res = await httpClient.get(`/folders/${validated.id}`);
  return res.data;
};

/**
 * Get direct child folders and documents
 * Route: GET /api/folders/:id/children
 * Access: Private - Requires 'view' permission on parent
 */
export const getChildFolders = async (
  id: string,
  params?: IGetChildFoldersParams
): Promise<IFolderChildrenResponse> => {
  const validatedId = folderIdSchema.parse({ id });
  
  const cleanParams = params
    ? Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined)
      )
    : {};

  const validatedParams = getChildFoldersSchema.parse(cleanParams);

  const res = await httpClient.get(`/folders/${validatedId.id}/children`, {
    params: validatedParams,
  });
  return res.data;
};

/**
 * Get folder breadcrumbs (path hierarchy)
 * Route: GET /api/folders/:id/breadcrumbs
 * Access: Private - Requires 'view' permission
 */
export const getFolderBreadcrumbs = async (
  id: string
): Promise<IFolderBreadcrumbsResponse> => {
  const validated = folderIdSchema.parse({ id });
  const res = await httpClient.get(`/folders/${validated.id}/breadcrumbs`);
  return res.data;
};

/**
 * Get folder statistics
 * Route: GET /api/folders/:id/stats
 * Access: Private - Requires 'view' permission
 */
export const getFolderStats = async (
  id: string
): Promise<IFolderStatsResponse> => {
  const validated = folderIdSchema.parse({ id });
  const res = await httpClient.get(`/folders/${validated.id}/stats`);
  return res.data;
};

/**
 * Update folder details (name, description, color)
 * Route: PUT /api/folders/:id
 * Access: Private - Requires 'upload' permission
 */
export const updateFolder = async (
  id: string,
  payload: IUpdateFolderData
): Promise<IFolderResponse> => {
  const validatedId = folderIdSchema.parse({ id });
  const validatedData = updateFolderSchema.parse(payload);
  const res = await httpClient.put(`/folders/${validatedId.id}`, validatedData);
  return res.data;
};

/**
 * Move folder to new parent location
 * Route: POST /api/folders/:id/move
 * Access: Private - Requires 'delete' on source, 'upload' on destination
 */
export const moveFolder = async (
  id: string,
  payload: IMoveFolderData
): Promise<IMoveFolderResponse> => {
  const validatedId = folderIdSchema.parse({ id });
  const validatedData = moveFolderSchema.parse(payload);
  const res = await httpClient.post(`/folders/${validatedId.id}/move`, validatedData);
  return res.data;
};

/**
 * Soft delete folder (and all descendants)
 * Route: DELETE /api/folders/:id
 * Access: Private - Requires 'delete' permission
 */
export const softDeleteFolder = async (
  id: string
): Promise<IDeleteFolderResponse> => {
  const validated = folderIdSchema.parse({ id });
  const res = await httpClient.delete(`/folders/${validated.id}`);
  return res.data;
};

/**
 * Restore soft deleted folder
 * Route: POST /api/folders/:id/restore
 * Access: Private - Requires 'delete' permission
 */
export const restoreFolder = async (
  id: string
): Promise<IRestoreFolderResponse> => {
  const validated = folderIdSchema.parse({ id });
  const res = await httpClient.post(`/folders/${validated.id}/restore`);
  return res.data;
};

/**
 * Search folders by name
 * Route: GET /api/folders/search
 * Access: Private - Returns only folders user has access to
 */
export const searchFolders = async (
  params: ISearchFoldersParams
): Promise<IFolderSearchResponse> => {
  const validated = searchFoldersSchema.parse(params);
  const res = await httpClient.get("/folders/search", { params: validated });
  return res.data;
};

/**
 * Share folder with users/groups
 * Route: POST /api/folders/:id/share
 * Access: Private - Requires 'share' permission
 */
export const shareFolder = async (
  id: string,
  payload: IShareFolderData
): Promise<IShareFolderResponse> => {
  const validatedId = folderIdSchema.parse({ id });
  const validatedData = shareFolderSchema.parse(payload);
  const res = await httpClient.post(`/folders/${validatedId.id}/share`, validatedData);
  return res.data;
};



export type {
  ICreateFolderData,
  IUpdateFolderData,
  IMoveFolderData,
  IGetChildFoldersParams,
  ISearchFoldersParams,
  IShareFolderData,
  IFolderResponse,
  IFolderChildrenResponse,
  IFolderStatsResponse,
  IFolderBreadcrumbsResponse,
  IFolderSearchResponse,
  IDeleteFolderResponse,
  IRestoreFolderResponse,
  IMoveFolderResponse,
  IShareFolderResponse,
};