import { z } from "zod";

/* =======================================================
   VALIDATION SCHEMAS
   ======================================================= */

/**
 * Validation for logging bulk file upload
 */
export const logBulkFileUploadSchema = z.object({
  parentId: z.string().min(1, "Parent ID is required"),
  files: z.array(
    z.object({
      id: z.string().optional(),
      _id: z.string().optional(),
      name: z.string().min(1, "File name is required"),
      extension: z.string().optional(),
      type: z.string().optional(),
      size: z.number().optional(),
    })
  ).min(1, "At least one file is required"),
});

/**
 * Validation for logging single file upload
 */
export const logFileUploadSchema = z.object({
  file: z.object({
    id: z.string().optional(),
    _id: z.string().optional(),
    name: z.string().min(1, "File name is required"),
    extension: z.string().optional(),
    type: z.string().optional(),
    size: z.number().optional(),
  }),
  parentId: z.string().min(1, "Parent ID is required"),
});

/**
 * Validation for logging file rename
 */
export const logFileRenameSchema = z.object({
  file: z.object({
    id: z.string().optional(),
    _id: z.string().optional(),
    name: z.string().optional(),
    parent_id: z.string().optional(), // For parent folder snapshot
  }),
  oldName: z.string().min(1, "Old name is required"),
  newName: z.string().min(1, "New name is required"),
});

/**
 * Validation for logging file move
 */
export const logFileMoveSchema = z.object({
  file: z.object({
    id: z.string().optional(),
    _id: z.string().optional(),
    name: z.string().min(1, "File name is required"),
    extension: z.string().optional(),
    type: z.string().optional(),
    path: z.string().optional(),
  }),
  fromParentId: z.string().min(1, "Source parent ID is required"),
  toParentId: z.string().min(1, "Destination parent ID is required"),
});

/**
 * Validation for logging file deletion
 */
export const logFileDeleteSchema = z.object({
  file: z.object({
    id: z.string().optional(),
    _id: z.string().optional(),
    name: z.string().min(1, "File name is required"),
    extension: z.string().optional(),
    type: z.string().optional(),
    size: z.number().optional(),
    parent_id: z.string().optional(), // For parent folder snapshot
    path: z.string().optional(),
  }),
});

/**
 * Validation for logging folder creation
 */
export const logFolderCreateSchema = z.object({
  folder: z.object({
    id: z.string().optional(),
    _id: z.string().optional(),
    name: z.string().min(1, "Folder name is required"),
    path: z.string().optional(),
  }),
  parentId: z.string().min(1, "Parent ID is required"),
});

/**
 * Validation for logging folder rename
 */
export const logFolderRenameSchema = z.object({
  folder: z.object({
    id: z.string().optional(),
    _id: z.string().optional(),
    name: z.string().optional(),
    parent_id: z.string().optional(), // For parent folder snapshot
    path: z.string().optional(),
  }),
  oldName: z.string().min(1, "Old name is required"),
  newName: z.string().min(1, "New name is required"),
});

/**
 * Validation for logging bulk restore
 */
export const logBulkRestoreSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().optional(),
      _id: z.string().optional(),
      name: z.string().min(1, "Item name is required"),
      type: z.enum(["file", "folder"]),
      itemType: z.enum(["file", "folder"]).optional(), // Alternative field name
      extension: z.string().optional(),
      size: z.number().optional(),
      parent_id: z.string().optional(),
      path: z.string().optional(),
    })
  ).min(1, "At least one item is required"),
});

/**
 * Validation for getting user's grouped activities
 */
export const getUserActivitiesGroupedSchema = z.object({
  limit: z.coerce.number().min(1).max(200).optional().default(100),
});

/**
 * Validation for getting file activity
 */
export const getFileActivitySchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
});

/**
 * Validation for getting folder activity
 */
export const getFolderActivitySchema = z.object({
  folderId: z.string().min(1, "Folder ID is required"),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  actionType: z
    .enum([
      "FILES_UPLOADED",
      "FILE_UPLOADED",
      "FILE_VERSION_UPLOADED",
      "FILE_RENAMED",
      "FILE_MOVED",
      "FILE_DELETED",
      "FILE_RESTORED",
      "FILE_DOWNLOADED",
      "FILE_PREVIEWED",
      "FOLDER_CREATED",
      "FOLDER_RENAMED",
      "FOLDER_MOVED",
      "FOLDER_DELETED",
      "FOLDER_RESTORED",
      "ITEMS_RESTORED",
    ])
    .optional(),
});

/**
 * Validation for getting recent activities
 */
export const getRecentActivitiesSchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  page: z.coerce.number().min(1).optional().default(1),
  actionType: z
    .enum([
      "FILES_UPLOADED",
      "FILE_UPLOADED",
      "FILE_VERSION_UPLOADED",
      "FILE_RENAMED",
      "FILE_MOVED",
      "FILE_DELETED",
      "FILE_RESTORED",
      "FILE_DOWNLOADED",
      "FILE_PREVIEWED",
      "FOLDER_CREATED",
      "FOLDER_RENAMED",
      "FOLDER_MOVED",
      "FOLDER_DELETED",
      "FOLDER_RESTORED",
      "ITEMS_RESTORED",
    ])
    .optional(),
  targetType: z.enum(["file", "folder", "multiple"]).optional(),
});

/**
 * Validation for getting activity stats
 */
export const getActivityStatsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  targetType: z.enum(["file", "folder", "multiple"]).optional(),
});

/**
 * Validation for searching activities
 */
export const searchActivitiesSchema = z.object({
  query: z.string().optional(),
  action: z.string().optional(),
  targetType: z.enum(["file", "folder", "multiple"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  page: z.coerce.number().min(1).optional().default(1),
});

/* =======================================================
   TYPE INFERENCE
   ======================================================= */

export type LogBulkFileUploadInput = z.infer<typeof logBulkFileUploadSchema>;
export type LogFileUploadInput = z.infer<typeof logFileUploadSchema>;
export type LogFileRenameInput = z.infer<typeof logFileRenameSchema>;
export type LogFileMoveInput = z.infer<typeof logFileMoveSchema>;
export type LogFileDeleteInput = z.infer<typeof logFileDeleteSchema>;
export type LogFolderCreateInput = z.infer<typeof logFolderCreateSchema>;
export type LogFolderRenameInput = z.infer<typeof logFolderRenameSchema>;
export type LogBulkRestoreInput = z.infer<typeof logBulkRestoreSchema>;
export type GetUserActivitiesGroupedInput = z.infer<typeof getUserActivitiesGroupedSchema>;
export type GetFileActivityInput = z.infer<typeof getFileActivitySchema>;
export type GetFolderActivityInput = z.infer<typeof getFolderActivitySchema>;
export type GetRecentActivitiesInput = z.infer<typeof getRecentActivitiesSchema>;
export type GetActivityStatsInput = z.infer<typeof getActivityStatsSchema>;
export type SearchActivitiesInput = z.infer<typeof searchActivitiesSchema>;