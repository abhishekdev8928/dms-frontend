import httpClient from "../httpClient";
import {
  getUserActivitiesGroupedSchema,
  getFileActivitySchema,
  getFolderActivitySchema,
  getBulkGroupActivitiesSchema,
  getRecentActivitiesSchema,
  getActivityStatsSchema,
  searchActivitiesSchema,
} from "@/utils/validations/activityValidation";

/* =======================================================
   ACTIVITY LOG API CALLS
   ======================================================= */

/**
 * Get user's activities grouped by date (Today, Yesterday, Last Week, Older)
 * Route: GET /api/activity/user/:userId
 * Access: Private
 */
export const getUserActivitiesGrouped = async (params: {
  userId: string;
  limit?: number;
}): Promise<GroupedActivitiesResponse> => {
  const validated = getUserActivitiesGroupedSchema.parse(params);
  const { userId, limit } = validated;

  const res = await httpClient.get(`/activity/user/${userId}`, {
    params: { limit },
  });
  return res.data;
};

/**
 * Get complete activity history for a specific file/document
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
 * Get activities by bulk group ID
 * Route: GET /api/activity/bulk/:bulkGroupId
 * Access: Private
 */
export const getBulkGroupActivities = async (params: {
  bulkGroupId: string;
}): Promise<BulkGroupActivitiesResponse> => {
  const validated = getBulkGroupActivitiesSchema.parse(params);
  const { bulkGroupId } = validated;

  const res = await httpClient.get(`/activity/bulk/${bulkGroupId}`);
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
  userId?: string;
  actionType?: string;
  targetType?: "file" | "folder";
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
  userId?: string;
  targetType?: "file" | "folder";
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
  targetType?: "file" | "folder";
  userId?: string;
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

export interface Activity {
  _id: string;
  action: string;
  targetType: "file" | "folder";
  targetId: string;
  metadata: {
    fileName?: string;
    folderName?: string;
    oldName?: string;
    newName?: string;
    bulkGroupId?: string;
    itemCount?: number;
    [key: string]: any;
  };
  createdAt: string;
  message: string;
  formattedTime: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface GroupedActivitiesResponse {
  success: boolean;
  data: {
    today: Activity[];
    yesterday: Activity[];
    lastWeek: Activity[];
    older: Activity[];
  };
}

export interface FileActivityResponse {
  success: boolean;
  data: {
    fileId: string;
    activities: Activity[];
    count: number;
  };
}

export interface FolderActivityResponse {
  success: boolean;
  data: {
    folderId: string;
    activities: Activity[];
    count: number;
    actionBreakdown: Array<{
      _id: string;
      count: number;
    }>;
  };
}

export interface BulkGroupActivitiesResponse {
  success: boolean;
  data: {
    bulkGroupId: string;
    activities: Activity[];
    totalItems: number;
    count: number;
  };
}

export interface ActivityPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RecentActivitiesResponse {
  success: boolean;
  data: {
    activities: Activity[];
    pagination: ActivityPagination;
  };
}

export interface ActivityStatsResponse {
  success: boolean;
  data: {
    totalActivities: number;
    uniqueUsers: number;
    actionBreakdown: Array<{
      _id: string;
      count: number;
    }>;
    targetTypeBreakdown: Array<{
      _id: string;
      count: number;
    }>;
    dailyTrend: Array<{
      _id: string;
      count: number;
    }>;
  };
}

export interface SearchActivitiesResponse {
  success: boolean;
  data: {
    activities: Activity[];
    pagination: ActivityPagination;
  };
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}