// Common user type
export interface IUser {
  _id: string;
  username: string;
  email: string;
}

export interface IDepartmentInfo {
  _id: string;
  name: string;
  path: string;
}

// Actions type for folders
export interface IFolderActions {
  canView: boolean;
  canDownload: boolean;
  canUpload: boolean;
  canDelete: boolean;
  canShare: boolean;
  canCreateFolder: boolean;
}

// Actions type for documents
export interface IDocumentActions {
  canView: boolean;
  canDownload: boolean;
  canUpload: boolean;
  canDelete: boolean;
  canShare: boolean;
}

// Folder item
export interface IFolderItem {
  _id: string;
  name: string;
  type: "folder";
  visibility: "private" | "public";
  parentId: string;
  departmentId: string;
  description: string;
  color: string;
  starred: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdBy: IUser;
  createdAt: string;
  updatedAt: string;
  path: string;
  __v: number;
  actions: IFolderActions;
}

// Document item
export interface IDocumentItem {
  _id: string;
  name: string;
  originalName: string;
  type: "document";
  fileType: string;
  parentId: string;
  fileUrl: string;
  mimeType: string;
  extension: string;
  size: number;
  version: number;
  description: string;
  tags: string[];
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  createdBy: IUser;
  path: string;
  createdAt: string;
  updatedAt: string;
  departmentId: string;
  __v: number;
  currentVersionId: string;
  actions: IDocumentActions;
}

// Union type for any item (folder or document)
export type IFileSystemItem = IFolderItem | IDocumentItem;

// Type guards
export function isFolderItem(item: IFileSystemItem): item is IFolderItem {
  return item.type === "folder";
}

export function isDocumentItem(item: IFileSystemItem): item is IDocumentItem {
  return item.type === "document";
}



export const USER_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "DEPARTMENT_OWNER",
  "USER",
] as const;

export type UserRole = typeof USER_ROLES[number];
