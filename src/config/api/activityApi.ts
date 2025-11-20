import httpClient from "../httpClient";
import {
  logBulkFileUploadSchema,
  logFileUploadSchema,
  logFileRenameSchema,
  logFileMoveSchema,
  logFileDeleteSchema,
  logFolderCreateSchema,
  logFolderRenameSchema,
  logBulkRestoreSchema,
  getUserActivitiesGroupedSchema,
  getFileActivitySchema,
  getFolderActivitySchema,
  getRecentActivitiesSchema,
  getActivityStatsSchema,
  searchActivitiesSchema,
  type LogBulkFileUploadInput,
  type LogFileUploadInput,
  type LogFileRenameInput,
  type LogFileMoveInput,
  type LogFileDeleteInput,
  type LogFolderCreateInput,
  type LogFolderRenameInput,
  type LogBulkRestoreInput,
} from "@/utils/validations/activityValidation";

/* =======================================================
   POST - ACTIVITY LOG API CALLS
   ======================================================= */

/**
 * Log bulk file upload after successful uploads
 * Route: POST /api/activity/bulk-upload
 * Access: Private
 */
export const logBulkFileUpload = async (
  data: LogBulkFileUploadInput
): Promise<LogActivityResponse> => {
  const validated = logBulkFileUploadSchema.parse(data);
  const res = await httpClient.post("/activity/bulk-upload", validated);
  return res.data;
};

/**
 * Log single file upload
 * Route: POST /api/activity/file/upload
 * Access: Private
 */
export const logFileUpload = async (
  data: LogFileUploadInput
): Promise<LogActivityResponse> => {
  const validated = logFileUploadSchema.parse(data);
  const res = await httpClient.post("/activity/file/upload", validated);
  return res.data;
};

/**
 * Log file rename
 * Route: POST /api/activity/file/rename
 * Access: Private
 */
export const logFileRename = async (
  data: LogFileRenameInput
): Promise<LogActivityResponse> => {
  const validated = logFileRenameSchema.parse(data);
  const res = await httpClient.post("/activity/file/rename", validated);
  return res.data;
};

/**
 * Log file move
 * Route: POST /api/activity/file/move
 * Access: Private
 */
export const logFileMove = async (
  data: LogFileMoveInput
): Promise<LogActivityResponse> => {
  const validated = logFileMoveSchema.parse(data);
  const res = await httpClient.post("/activity/file/move", validated);
  return res.data;
};

/**
 * Log file deletion
 * Route: POST /api/activity/file/delete
 * Access: Private
 */
export const logFileDelete = async (
  data: LogFileDeleteInput
): Promise<LogActivityResponse> => {
  const validated = logFileDeleteSchema.parse(data);
  const res = await httpClient.post("/activity/file/delete", validated);
  return res.data;
};

/**
 * Log folder creation
 * Route: POST /api/activity/folder/create
 * Access: Private
 */
export const logFolderCreate = async (
  data: LogFolderCreateInput
): Promise<LogActivityResponse> => {
  const validated = logFolderCreateSchema.parse(data);
  const res = await httpClient.post("/activity/folder/create", validated);
  return res.data;
};

/**
 * Log folder rename
 * Route: POST /api/activity/folder/rename
 * Access: Private
 */
export const logFolderRename = async (
  data: LogFolderRenameInput
): Promise<LogActivityResponse> => {
  const validated = logFolderRenameSchema.parse(data);
  const res = await httpClient.post("/activity/folder/rename", validated);
  return res.data;
};

/**
 * Log bulk restore operation
 * Route: POST /api/activity/bulk-restore
 * Access: Private
 */
export const logBulkRestore = async (
  data: LogBulkRestoreInput
): Promise<LogActivityResponse> => {
  const validated = logBulkRestoreSchema.parse(data);
  const res = await httpClient.post("/activity/bulk-restore", validated);
  return res.data;
};

/* =======================================================
   GET - ACTIVITY LOG API CALLS
   ======================================================= */

/**
 * Get authenticated user's activities grouped by date
 * Route: GET /api/activity/user
 * Access: Private
 */
export const getUserActivitiesGrouped = async (params?: {
  limit?: number;
}): Promise<GroupedActivitiesResponse> => {
  const validated = getUserActivitiesGroupedSchema.parse(params || {});
  const res = await httpClient.get("/activity/user", {
    params: validated,
  });
  return res.data;
};

/**
 * Get complete activity history for a specific file
 * Route: GET /api/activity/file/:fileId
 * Access: Private
 */
export const getFileActivity = async (params: {
  fileId: string;
  limit?: number;
}): Promise<FileActivityResponse> => {
  const validated = getFileActivitySchema.parse(params);
  const { fileId, limit } = validated;
  const res = await httpClient.get(`/activity/file/${fileId}`, {
    params: { limit },
  });
  return res.data;
};

/**
 * Get complete activity history for a specific folder
 * Route: GET /api/activity/folder/:folderId
 * Access: Private
 */
export const getFolderActivity = async (params: {
  folderId: string;
  limit?: number;
  actionType?: string;
}): Promise<FolderActivityResponse> => {
  const validated = getFolderActivitySchema.parse(params);
  const { folderId, limit, actionType } = validated;
  const res = await httpClient.get(`/activity/folder/${folderId}`, {
    params: { limit, actionType },
  });
  return res.data;
};

/**
 * Get recent activities with optional filters
 * Route: GET /api/activity/recent
 * Access: Private
 */
export const getRecentActivities = async (params?: {
  limit?: number;
  page?: number;
  actionType?: string;
  targetType?: "file" | "folder" | "multiple";
}): Promise<RecentActivitiesResponse> => {
  const validated = getRecentActivitiesSchema.parse(params || {});
  const res = await httpClient.get("/activity/recent", {
    params: validated,
  });
  return res.data;
};

/**
 * Get activity statistics
 * Route: GET /api/activity/stats
 * Access: Private
 */
export const getActivityStats = async (params?: {
  startDate?: string;
  endDate?: string;
  targetType?: "file" | "folder" | "multiple";
}): Promise<ActivityStatsResponse> => {
  const validated = getActivityStatsSchema.parse(params || {});
  const res = await httpClient.get("/activity/stats", {
    params: validated,
  });
  return res.data;
};

/**
 * Search activities with filters
 * Route: GET /api/activity/search
 * Access: Private
 */
export const searchActivities = async (params?: {
  query?: string;
  action?: string;
  targetType?: "file" | "folder" | "multiple";
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
}): Promise<SearchActivitiesResponse> => {
  const validated = searchActivitiesSchema.parse(params || {});
  const res = await httpClient.get("/activity/search", {
    params: validated,
  });
  return res.data;
};

/* =======================================================
   TYPE DEFINITIONS
   ======================================================= */

export interface ActivityItem {
  id?: string;
  _id?: string;
  name: string;
  extension?: string;
  type: string;
  size?: number;
  folderId?: string;
}

export interface UserSnapshot {
  name: string;
  email: string;
  avatar?: string;
}

export interface Activity {
  _id: string;
  userId: string;
  userSnapshot: UserSnapshot;
  user: UserSnapshot;
  action: string;
  targetType: "file" | "folder" | "multiple";
  target?: {
    id?: string;
    name?: string;
    folderName?: string;
    oldName?: string;
    newName?: string;
    path?: string;
    parentFolderPath?: string;
  };
  parentFolder?: {
    id?: string;
    name?: string;
    path?: string;
  };
  bulkOperation?: {
    itemCount?: number;
    parentFolderId?: string;
    parentFolderName?: string;
    items?: ActivityItem[];
  };
  createdAt: string;
  message: string;
  timeLabel: string;
  formattedTime: string;
}

export interface LogActivityResponse {
  success: boolean;
  message: string;
  data: {
    logId: string;
    action: string;
    itemCount?: number;
    message: string;
    timestamp: string;
  };
}

export interface GroupedActivitiesResponse {
  success: boolean;
  data: {
    today: Activity[];
    yesterday: Activity[];
    lastWeek: Activity[];
    lastMonth: Activity[];
    older: Activity[];
  };
  totalActivities: number;
}

export interface FileActivityResponse {
  success: boolean;
  data: Activity[];
  count: number;
}

export interface FolderActivityResponse {
  success: boolean;
  data: Activity[];
  count: number;
  folderId: string;
}

export interface ActivityPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface RecentActivitiesResponse {
  success: boolean;
  data: Activity[];
  pagination: ActivityPagination;
}

export interface ActivityStatsResponse {
  success: boolean;
  data: {
    totalActivities: number;
    actionBreakdown: Array<{
      _id: string;
      count: number;
      lastActivity: string;
    }>;
    typeBreakdown: Array<{
      _id: string;
      count: number;
    }>;
    recentTrend: Array<{
      _id: string;
      count: number;
    }>;
  };
}

export interface SearchActivitiesResponse {
  success: boolean;
  data: Activity[];
  pagination: ActivityPagination;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}