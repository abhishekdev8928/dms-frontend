import type { IUser, IFolderActions, IFolderItem , IDepartmentInfo} from "./commonTypes";

/* =======================================================
   FOLDER STATS & EXTENDED TYPES
   ======================================================= */

export interface IFolderStats {
  childFolders: number;
  documents: number;
  totalSize: number;
  totalSizeFormatted: string;
}


export interface IBreadcrumb {
  id: string;
  name: string;
  path: string;
  type: "department" | "folder";
}

export interface IFolderWithDetails extends IFolderItem {
  department: IDepartmentInfo | null;
  breadcrumbs: IBreadcrumb[];
  stats?: IFolderStats;
}

/* =======================================================
   CHILD ITEMS (for folder contents)
   ======================================================= */

export interface IChildItem {
  _id: string;
  name: string;
  type: "folder" | "document";
  parentId: string;
  path: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: IUser;
  updatedBy?: IUser;
  // Folder specific
  color?: string;
  depth?: number;
  visibility?: "private" | "public";
  starred?: boolean;
  // Document specific
  originalName?: string;
  fileType?: string;
  fileUrl?: string;
  mimeType?: string;
  extension?: string;
  size?: number;
  sizeFormatted?: string;
  fileCategory?: string;
  version?: number;
  tags?: string[];
  // Actions
  actions?: IFolderActions;
}

/* =======================================================
   API REQUEST TYPES
   ======================================================= */

export interface ICreateFolderData {
  name: string;
  parentId: string;
  description?: string;
  color?: string;
}

export interface IUpdateFolderData {
  name?: string;
  description?: string;
  color?: string;
}

export interface IMoveFolderData {
  newParentId: string;
}

export interface IGetChildFoldersParams {
  includeDeleted?: boolean;
  type?: string;
  userEmail?: string;
}

export interface ISearchFoldersParams {
  q: string;
  departmentId?: string;
}

export interface IShareFolderData {
  users?: Array<{
    userId: string;
    permissions: string[];
  }>;
  groups?: Array<{
    groupId: string;
    permissions: string[];
  }>;
}

/* =======================================================
   API RESPONSE TYPES
   ======================================================= */

export interface IFolderResponse {
  success: boolean;
  message?: string;
  data: IFolderItem | IFolderWithDetails;
}

export interface IFolderChildrenResponse {
  success: boolean;
  count: number;
  parentType?: "DEPARTMENT" | "FOLDER";
  breadcrumbs?: IBreadcrumb[];
  filters?: {
    type: string | null;
    userEmail: string | null;
  };
  children: IChildItem[];
  data?: IChildItem[]; // Alias for backward compatibility
}

export interface IFolderStatsResponse {
  success: boolean;
  data: IFolderStats;
}

export interface IFolderBreadcrumbsResponse {
  success: boolean;
  data: {
    path: string;
    breadcrumbs: IBreadcrumb[];
  };
}

export interface IFolderSearchResponse {
  success: boolean;
  count: number;
  data: IFolderWithDetails[];
}

export interface IFolderListResponse {
  success: boolean;
  count: number;
  data: IFolderItem[];
}

export interface IDeleteFolderResponse {
  success: boolean;
  message: string;
}

export interface IRestoreFolderResponse {
  success: boolean;
  message: string;
  data: IFolderItem;
}

export interface IMoveFolderResponse {
  success: boolean;
  message: string;
  data: IFolderItem;
}

export interface IShareFolderResponse {
  success: boolean;
  message: string;
  data: IFolderItem;
}