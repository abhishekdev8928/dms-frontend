import { z } from "zod";

/* =======================================================
   VALIDATION SCHEMAS
   ======================================================= */

/**
 * Validation for getting user's grouped activities
 */
export const getUserActivitiesGroupedSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  limit: z.number().min(1).max(200).optional().default(100),
});

/**
 * Validation for getting file activity
 */
export const getFileActivitySchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  limit: z.number().min(1).max(100).optional().default(50),
});

/**
 * Validation for getting folder activity
 */
export const getFolderActivitySchema = z.object({
  folderId: z.string().min(1, "Folder ID is required"),
  limit: z.number().min(1).max(100).optional().default(50),
  actionType: z
    .enum([
      "FOLDER_CREATED",
      "FOLDER_UPDATED",
      "FOLDER_DELETED",
      "FOLDER_RESTORED",
      "FOLDER_MOVED",
      "DOCUMENT_UPLOADED",
      "DOCUMENT_UPDATED",
      "DOCUMENT_DELETED",
      "DOCUMENT_RESTORED",
      "DOCUMENT_MOVED",
      "DOCUMENT_DOWNLOADED",
      "DOCUMENT_VIEWED",
      "VERSION_CREATED",
      "VERSION_REVERTED",
      "TAGS_ADDED",
      "TAGS_REMOVED",
    ])
    .optional(),
});

/**
 * Validation for getting bulk group activities
 */
export const getBulkGroupActivitiesSchema = z.object({
  bulkGroupId: z.string().min(1, "Bulk group ID is required"),
});

/**
 * Validation for getting recent activities
 */
export const getRecentActivitiesSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(50),
  page: z.number().min(1).optional().default(1),
  userId: z.string().optional(),
  actionType: z
    .enum([
      "FOLDER_CREATED",
      "FOLDER_UPDATED",
      "FOLDER_DELETED",
      "FOLDER_RESTORED",
      "FOLDER_MOVED",
      "DOCUMENT_UPLOADED",
      "DOCUMENT_UPDATED",
      "DOCUMENT_DELETED",
      "DOCUMENT_RESTORED",
      "DOCUMENT_MOVED",
      "DOCUMENT_DOWNLOADED",
      "DOCUMENT_VIEWED",
      "VERSION_CREATED",
      "VERSION_REVERTED",
      "TAGS_ADDED",
      "TAGS_REMOVED",
    ])
    .optional(),
  targetType: z.enum(["file", "folder"]).optional(),
});

/**
 * Validation for getting activity stats
 */
export const getActivityStatsSchema = z.object({
  startDate: z.string().optional(), // Backend uses new Date(startDate), not datetime
  endDate: z.string().optional(),
  userId: z.string().optional(),
  targetType: z.enum(["file", "folder"]).optional(),
});

/**
 * Validation for searching activities
 */
export const searchActivitiesSchema = z.object({
  query: z.string().optional(),
  action: z.string().optional(),
  targetType: z.enum(["file", "folder"]).optional(),
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().min(1).max(100).optional().default(50),
  page: z.number().min(1).optional().default(1),
});

/* =======================================================
   TYPE INFERENCE
   ======================================================= */

export type GetUserActivitiesGroupedInput = z.infer<typeof getUserActivitiesGroupedSchema>;
export type GetFileActivityInput = z.infer<typeof getFileActivitySchema>;
export type GetFolderActivityInput = z.infer<typeof getFolderActivitySchema>;
export type GetBulkGroupActivitiesInput = z.infer<typeof getBulkGroupActivitiesSchema>;
export type GetRecentActivitiesInput = z.infer<typeof getRecentActivitiesSchema>;
export type GetActivityStatsInput = z.infer<typeof getActivityStatsSchema>;
export type SearchActivitiesInput = z.infer<typeof searchActivitiesSchema>;