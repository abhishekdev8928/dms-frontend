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
   ZOD VALIDATION SCHEMAS - ALIGNED WITH BACKEND
   ======================================================= */

// Create folder
export const createFolderSchema = z.object({
  name: z
    .string()
    .min(1, "Folder name is required")
    .max(100, "Folder name too long")
    .regex(/^[a-zA-Z0-9\s\-_&()]+$/, "Invalid characters in folder name")
    .transform(sanitize),
  parentId: z
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

// Get folder by ID
export const folderIdSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid folder ID")
    .transform(sanitize),
});

// Get child folders query params
export const getChildFoldersSchema = z.object({
  includeDeleted: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (typeof val === "string") return val === "true";
      return val || false;
    }),
  type: z.string().optional(),
  userEmail: z.string().email("Invalid email format").optional(),
});

// Update folder
export const updateFolderSchema = z.object({
  name: z
    .string()
    .min(1, "Folder name is required")
    .max(100, "Folder name too long")
    .regex(/^[a-zA-Z0-9\s\-_&()]+$/, "Invalid characters in folder name")
    .transform(sanitize)
    .optional(),
  description: z
    .string()
    .max(500, "Description too long")
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
  departmentId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid department ID")
    .transform(sanitize)
    .optional(),
});

// Share folder
export const shareFolderSchema = z.object({
  users: z
    .array(
      z.object({
        userId: z
          .string()
          .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
        permissions: z.array(z.string()).min(1, "At least one permission required"),
      })
    )
    .optional(),
  groups: z
    .array(
      z.object({
        groupId: z
          .string()
          .regex(/^[0-9a-fA-F]{24}$/, "Invalid group ID"),
        permissions: z.array(z.string()).min(1, "At least one permission required"),
      })
    )
    .optional(),
});

/* =======================================================
   TYPE EXPORTS
   ======================================================= */

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type FolderIdInput = z.infer<typeof folderIdSchema>;
export type GetChildFoldersInput = z.infer<typeof getChildFoldersSchema>;
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>;
export type MoveFolderInput = z.infer<typeof moveFolderSchema>;
export type SearchFoldersInput = z.infer<typeof searchFoldersSchema>;
export type ShareFolderInput = z.infer<typeof shareFolderSchema>;