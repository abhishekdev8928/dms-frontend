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
   COMMON VALIDATORS
   ======================================================= */

const mongoIdValidator = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID")
  .transform(sanitize);

// S3 Key validator (instead of URL validator)
// Allows common characters in S3 keys including spaces, parentheses, etc.
const s3KeyValidator = z
  .string()
  .min(1, "S3 key is required")
  .max(1024, "S3 key too long")
  .regex(
    /^[a-zA-Z0-9\s\/_\-\.()!@#$%^&+=]+$/,
    "S3 key contains invalid characters"
  )
  .transform(sanitize);

// Extension validator - NO DOT, just the extension (e.g., "png", "pdf")
const fileExtensionValidator = z
  .string()
  .regex(/^[a-zA-Z0-9]+$/, "Invalid file extension format")
  .transform((val) => {
    // Remove dot if present, then lowercase and sanitize
    const noDot = val.startsWith('.') ? val.slice(1) : val;
    return sanitize(noDot.toLowerCase());
  });

const mimeTypeValidator = z
  .string()
  .regex(
    /^[a-zA-Z0-9]+\/[a-zA-Z0-9\-\+\.]+$/,
    "Invalid MIME type format"
  )
  .transform(sanitize);

const filenameValidator = z
  .string()
  .min(1, "Filename is required")
  .max(255, "Filename too long")
  .regex(
    /^[a-zA-Z0-9\s\-_\.()]+$/,
    "Filename contains invalid characters"
  )
  .transform(sanitize);

const tagValidator = z
  .string()
  .min(1, "Tag cannot be empty")
  .max(50, "Tag too long")
  .regex(/^[a-zA-Z0-9\-_]+$/, "Tag can only contain letters, numbers, hyphens, and underscores")
  .transform(sanitize);

/* =======================================================
   DOCUMENT VALIDATION SCHEMAS
   ======================================================= */

// Generate presigned upload URLs
export const generatePresignedUrlsSchema = z.object({
  files: z
    .array(
      z.object({
        filename: filenameValidator,
        mimeType: mimeTypeValidator,
      })
    )
    .min(1, "At least one file is required")
    .max(100, "Maximum 100 files allowed per request"),
    parent_id: z.string(),
});

// Create document
export const createDocumentSchema = z.object({
  name: filenameValidator,
  originalName: filenameValidator,
  parent_id: mongoIdValidator,
  fileUrl: s3KeyValidator, // Changed from URL validator to S3 key validator
  mimeType: mimeTypeValidator,
  extension: fileExtensionValidator, // Now auto-adds dot if missing
  size: z
    .number()
    .int("Size must be an integer")
    .positive("Size must be positive")
    .max(5 * 1024 * 1024 * 1024, "File size exceeds 5GB limit"), // 5GB max
  description: z
    .string()
    .max(1000, "Description too long")
    .transform(sanitize)
    .optional(),
  tags: z
    .array(tagValidator)
    .max(20, "Maximum 20 tags allowed")
    .optional(),
});

// Document ID
export const documentIdSchema = z.object({
  id: mongoIdValidator,
});

// Get documents by parent
export const getDocumentsByParentSchema = z.object({
  parentId: mongoIdValidator,
  includeDeleted: z.boolean().default(false).optional(),
});

// Get recent documents
export const getRecentDocumentsSchema = z.object({
  departmentId: mongoIdValidator,
  limit: z
    .number()
    .int()
    .positive()
    .min(1)
    .max(100)
    .default(10)
    .optional(),
});

// Update document
export const updateDocumentSchema = z.object({
  name: filenameValidator.optional(),
  description: z
    .string()
    .max(1000, "Description too long")
    .transform(sanitize)
    .optional(),
  tags: z
    .array(tagValidator)
    .max(20, "Maximum 20 tags allowed")
    .optional(),
});

// Move document
export const moveDocumentSchema = z.object({
  newParentId: mongoIdValidator,
});

// Search documents
export const searchDocumentsSchema = z.object({
  q: z
    .string()
    .min(1, "Search query is required")
    .max(200, "Search query too long")
    .transform(sanitize),
  departmentId: mongoIdValidator.optional(),
  limit: z
    .number()
    .int()
    .positive()
    .min(1)
    .max(100)
    .default(20)
    .optional(),
});

// Find by extension
export const findByExtensionSchema = z.object({
  ext: z
    .string()
    .regex(/^[a-zA-Z0-9]+$/, "Invalid extension format (no dots)")
    .transform(sanitize),
});

/* =======================================================
   VERSION VALIDATION SCHEMAS
   ======================================================= */

// Create version
export const createVersionSchema = z.object({
  fileUrl: s3KeyValidator, // Changed from URL validator to S3 key validator
  size: z
    .number()
    .int("Size must be an integer")
    .positive("Size must be positive")
    .max(5 * 1024 * 1024 * 1024, "File size exceeds 5GB limit"),
  mimeType: mimeTypeValidator,
  extension: fileExtensionValidator, // Now auto-adds dot if missing
  name: filenameValidator.optional(),
  originalName: filenameValidator.optional(),
  changeDescription: z
    .string()
    .max(500, "Change description too long")
    .transform(sanitize)
    .optional(),
  fileHash: z
    .string()
    .regex(/^[a-fA-F0-9]{32,128}$/, "Invalid file hash format")
    .transform(sanitize)
    .optional(),
});

// Get all versions options
export const getAllVersionsSchema = z.object({
  sort: z.enum(["asc", "desc"]).default("desc").optional(),
  limit: z
    .number()
    .int()
    .positive()
    .min(1)
    .max(100)
    .optional(),
  populate: z.boolean().default(false).optional(),
});

// Version number
export const versionNumberSchema = z.object({
  versionNumber: z
    .number()
    .int("Version number must be an integer")
    .positive("Version number must be positive")
    .min(1, "Version number must be at least 1"),
});

// Revert to version
export const revertToVersionSchema = z.object({
  versionNumber: z
    .number()
    .int("Version number must be an integer")
    .positive("Version number must be positive")
    .min(1, "Version number must be at least 1"),
});

// Delete old versions
export const deleteOldVersionsSchema = z.object({
  keepCount: z
    .number()
    .int()
    .positive()
    .min(1, "Must keep at least 1 version")
    .max(100, "Keep count too high")
    .default(5),
});

/* =======================================================
   TAG VALIDATION SCHEMAS
   ======================================================= */

// Add/Remove tags
export const tagsSchema = z.object({
  tags: z
    .array(tagValidator)
    .min(1, "At least one tag is required")
    .max(20, "Maximum 20 tags allowed"),
});

// Find by tags
export const findByTagsSchema = z.object({
  tags: z
    .array(tagValidator)
    .min(1, "At least one tag is required")
    .max(10, "Maximum 10 tags for search"),
});

/* =======================================================
   COMBINED SCHEMAS (for API with both ID and data)
   ======================================================= */

// Document ID + Update data
export const updateDocumentWithIdSchema = z.object({
  id: mongoIdValidator,
  data: updateDocumentSchema,
});

// Document ID + Move data
export const moveDocumentWithIdSchema = z.object({
  id: mongoIdValidator,
  newParentId: mongoIdValidator,
});

// Document ID + Version data
export const createVersionWithIdSchema = z.object({
  id: mongoIdValidator,
  data: createVersionSchema,
});

// Document ID + Version number
export const documentVersionSchema = z.object({
  id: mongoIdValidator,
  versionNumber: z
    .number()
    .int()
    .positive()
    .min(1),
});

// Document ID + Tags
export const documentTagsSchema = z.object({
  id: mongoIdValidator,
  tags: z.array(tagValidator).min(1).max(20),
});

/* =======================================================
   TYPE EXPORTS
   ======================================================= */

export type GeneratePresignedUrlsInput = z.infer<typeof generatePresignedUrlsSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type DocumentIdInput = z.infer<typeof documentIdSchema>;
export type GetDocumentsByParentInput = z.infer<typeof getDocumentsByParentSchema>;
export type GetRecentDocumentsInput = z.infer<typeof getRecentDocumentsSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type MoveDocumentInput = z.infer<typeof moveDocumentSchema>;
export type SearchDocumentsInput = z.infer<typeof searchDocumentsSchema>;
export type FindByExtensionInput = z.infer<typeof findByExtensionSchema>;

export type CreateVersionInput = z.infer<typeof createVersionSchema>;
export type GetAllVersionsInput = z.infer<typeof getAllVersionsSchema>;
export type VersionNumberInput = z.infer<typeof versionNumberSchema>;
export type RevertToVersionInput = z.infer<typeof revertToVersionSchema>;
export type DeleteOldVersionsInput = z.infer<typeof deleteOldVersionsSchema>;

export type TagsInput = z.infer<typeof tagsSchema>;
export type FindByTagsInput = z.infer<typeof findByTagsSchema>;

export type UpdateDocumentWithIdInput = z.infer<typeof updateDocumentWithIdSchema>;
export type MoveDocumentWithIdInput = z.infer<typeof moveDocumentWithIdSchema>;
export type CreateVersionWithIdInput = z.infer<typeof createVersionWithIdSchema>;
export type DocumentVersionInput = z.infer<typeof documentVersionSchema>;
export type DocumentTagsInput = z.infer<typeof documentTagsSchema>;