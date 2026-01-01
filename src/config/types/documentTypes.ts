// types/documentTypes.ts

import type { IUser } from './commonTypes';



export type FileTypeCategory = 
  | 'document' 
  | 'image' 
  | 'video' 
  | 'audio' 
  | 'archive' 
  | 'code' 
  | 'other';

export type PermissionType = 'view' | 'download' | 'upload' | 'delete' | 'share';

export type SubjectType = 'USER' | 'GROUP';



export interface IDocumentActions {
  canView: boolean;
  canDownload: boolean;
  canUpload: boolean;
  canDelete: boolean;
  canShare: boolean;
}



export interface IParentInfo {
  _id: string;
  name: string;
  type: 'Folder' | 'Department';
}



export interface IDocumentVersion {
  _id: string;
  documentId: string;
  versionNumber: number;
  name: string;
  originalName: string;
  type: 'document';
  fileUrl: string;
  size: number;
  mimeType: string;
  extension: string;
  fileType: FileTypeCategory;
  isLatest: boolean;
  changeDescription?: string;
  pathAtCreation: string;
  createdBy: string | IUser;
  createdAt: string;
  updatedAt: string;
  // Formatted fields (optional, added by API)
  sizeFormatted?: string;
  createdAgo?: string;
}



export interface IDocument {
  _id: string;
  name: string;
  originalName: string;
  type: 'document';
  fileType: FileTypeCategory;
  parentId: string;
  fileUrl: string;
  mimeType: string;
  extension: string;
  size: number;
  version: number;
  description?: string;
  tags: string[];
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  createdBy: string | IUser;
  updatedBy?: string | IUser;
  path: string;
  createdAt: string;
  updatedAt: string;
  departmentId: string;
  currentVersionId: string;
  __v: number;
  // Extended fields
  parent?: IParentInfo;
  currentVersion?: IDocumentVersion;
  actions?: IDocumentActions;
}

/* =======================================================
   FILE VALIDATION
   ======================================================= */

export interface IFileValidation {
  valid: boolean;
  reason?: string;
  group: string;
  category: FileTypeCategory;
}

/* =======================================================
   PRESIGNED URL
   ======================================================= */

export interface IPresignedUrl {
  filename: string;
  key: string;
  url: string;
  mimeType: string;
  fileGroup: string;
  category: FileTypeCategory;
}

/* =======================================================
   CHUNKED UPLOAD
   ======================================================= */

export interface IChunkedUploadPart {
  ETag: string;
  PartNumber: number;
}

export interface IChunkedUploadInit {
  uploadId: string;
  key: string;
  filename: string;
  fileSize: number;
  parentId: string;
}

/* =======================================================
   SHARING
   ======================================================= */

export interface IShareSubject {
  subjectType: SubjectType;
  subjectId: string;
  subjectName: string;
  permissions: PermissionType[];
  note?: string;
}

export interface IShareError {
  userId?: string;
  groupId?: string;
  type: SubjectType;
  error: string;
}

/* =======================================================
   STATISTICS
   ======================================================= */

export interface IDocumentStats {
  totalDocuments: number;
  totalSize: number;
  byFileType: Record<FileTypeCategory, number>;
  byExtension: Record<string, number>;
  recentUploads: number;
}

/* =======================================================
   API REQUEST PAYLOADS
   ======================================================= */

export interface IGeneratePresignedUrlsPayload {
  files: Array<{
    filename: string;
    mimeType: string;
  }>;
  parentId: string;
}

export interface ICreateDocumentPayload {
  name: string;
  originalName: string;
  parentId: string;
  fileUrl: string;
  mimeType: string;
  extension: string;
  size: number;
  description?: string;
  tags?: string[];
}

export interface IUpdateDocumentPayload {
  name?: string;
  description?: string;
  tags?: string[];
}

export interface IMoveDocumentPayload {
  newParentId: string;
}

export interface ISearchDocumentsParams {
  q: string;
  departmentId?: string;
  limit?: number;
}

export interface ICreateVersionPayload {
  fileUrl: string;
  size: number;
  mimeType: string;
  extension: string;
  name?: string;
  originalName?: string;
  changeDescription?: string;
}

export interface IRevertToVersionPayload {
  versionNumber: number;
}

export interface ITagsPayload {
  tags: string[];
}

export interface IShareDocumentPayload {
  users?: Array<{
    userId: string;
    permissions: PermissionType[];
  }>;
  groups?: Array<{
    groupId: string;
    permissions: PermissionType[];
  }>;
}

export interface IInitiateChunkedUploadPayload {
  filename: string;
  mimeType: string;
  fileSize: number;
  parentId: string;
}

export interface IUploadChunkPayload {
  uploadId: string;
  key: string;
  partNumber: number;
  body: Buffer | string;
}

export interface ICompleteChunkedUploadPayload {
  uploadId: string;
  key: string;
  parts: IChunkedUploadPart[];
  name: string;
  parentId: string;
  mimeType?: string;
  fileSize?: number;
  description?: string;
  tags?: string[];
}

export interface IAbortChunkedUploadPayload {
  uploadId: string;
  key: string;
}

/* =======================================================
   API RESPONSES
   ======================================================= */

export interface IApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface IApiListResponse<T> {
  success: boolean;
  count: number;
  data: T[];
  message?: string;
}

// Specific response types
export type IPresignedUrlsResponse = IApiResponse<IPresignedUrl[]>;
export type IDocumentResponse = IApiResponse<IDocument>;
export type IDocumentListResponse = IApiListResponse<IDocument>;
export type IVersionResponse = IApiResponse<IDocumentVersion>;
export type IVersionListResponse = IApiListResponse<IDocumentVersion>;

export interface IDownloadUrlData {
  url: string;
  expiresIn: number;
  filename: string;
  versionNumber?: number;
  versionId?: string;
}

export type IDownloadUrlResponse = IApiResponse<IDownloadUrlData>;

export interface IShareDocumentData {
  document: {
    _id: string;
    name: string;
    path: string;
  };
  sharedWith: IShareSubject[];
  errors?: IShareError[];
}

export type IShareDocumentResponse = IApiResponse<IShareDocumentData>;

export interface IChunkedUploadInitData {
  uploadId: string;
  key: string;
  filename: string;
  fileSize: number;
}

export type IChunkedUploadInitResponse = IApiResponse<IChunkedUploadInitData>;

export interface IChunkUploadData {
  ETag: string;
  PartNumber: number;
}

export type IChunkUploadResponse = IApiResponse<IChunkUploadData>;

export type IDocumentStatsResponse = IApiResponse<IDocumentStats>;

/* =======================================================
   TYPE GUARDS
   ======================================================= */

export function isDocument(item: unknown): item is IDocument {
  return (
    typeof item === 'object' &&
    item !== null &&
    'type' in item &&
    item.type === 'document'
  );
}

export function hasActions(item: unknown): item is { actions: IDocumentActions } {
  return (
    typeof item === 'object' &&
    item !== null &&
    'actions' in item &&
    typeof item.actions === 'object'
  );
}