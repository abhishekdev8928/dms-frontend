import { z } from "zod";
import DOMPurify from "dompurify";

/* =======================================================
   SANITIZATION HELPER
   ======================================================= */

const sanitize = (value: string) => {
  return DOMPurify.sanitize(value.trim(), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};

/* =======================================================
   ZOD VALIDATION SCHEMAS
   ======================================================= */

// Create folder
export const createFolderSchema = z.object({
  name: z
    .string()
    .min(1, "Folder name is required")
    .max(100, "Folder name too long")
    .regex(/^[a-zA-Z0-9\s\-_&()]+$/, "Invalid characters in folder name")
    .transform(sanitize),
  parent_id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid parent ID")
    .transform(sanitize),
  description: z
    .string()
    .max(500, "Description too long")
    .transform(sanitize)
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format (use hex: #RRGGBB)")
    .default("#3B82F6")
    .optional(),
});

// Get root folders
export const getRootFoldersSchema = z.object({
  departmentId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid department ID")
    .transform(sanitize),
  includeDeleted: z.boolean().default(false).optional(),
});

// Get folder by ID
export const folderIdSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid folder ID")
    .transform(sanitize),
});

// Get child folders query
export const getChildFoldersSchema = z.object({
  includeDeleted: z.boolean().default(false).optional(),
  type: z.enum(["folder", "document"]).optional(),
});

// Get all descendants query
export const getAllDescendantsSchema = z.object({
  includeDeleted: z.boolean().default(false).optional(),
  type: z.enum(["folder", "document"]).optional(),
});

// Update folder
export const updateFolderSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9\s\-_&()]+$/)
    .transform(sanitize)
    .optional(),
  description: z
    .string()
    .max(500)
    .transform(sanitize)
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
    .optional(),
});

// Move folder
export const moveFolderSchema = z.object({
  newParentId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid parent ID")
    .transform(sanitize),
});

// Search folders
export const searchFoldersSchema = z.object({
  q: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query too long")
    .transform(sanitize),
  departmentName: z
    .string()
    .max(100)
    .transform(sanitize)
    .optional(),
});

// Get folder by path
export const getFolderByPathSchema = z.object({
  path: z
    .string()
    .min(1, "Path is required")
    .max(500, "Path too long")
    .transform(sanitize),
});

/* =======================================================
   TYPE EXPORTS
   ======================================================= */

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type GetRootFoldersInput = z.infer<typeof getRootFoldersSchema>;
export type FolderIdInput = z.infer<typeof folderIdSchema>;
export type GetChildFoldersInput = z.infer<typeof getChildFoldersSchema>;
export type GetAllDescendantsInput = z.infer<typeof getAllDescendantsSchema>;
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>;
export type MoveFolderInput = z.infer<typeof moveFolderSchema>;
export type SearchFoldersInput = z.infer<typeof searchFoldersSchema>;
export type GetFolderByPathInput = z.infer<typeof getFolderByPathSchema>;