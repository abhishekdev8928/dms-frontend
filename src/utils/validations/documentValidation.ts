// validations/documentValidation.ts

import { z } from 'zod';
import DOMPurify from 'dompurify';

/* =======================================================
   SANITIZATION HELPER
   ======================================================= */

const sanitize = (value: string): string => {
  return DOMPurify.sanitize(value.trim(), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};

/* =======================================================
   BASE VALIDATORS
   ======================================================= */

const mongoIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID')
  .transform(sanitize);

const s3KeySchema = z
  .string()
  .min(1, 'S3 key is required')
  .max(1024, 'S3 key too long')
  .regex(
    /^[a-zA-Z0-9\s\/_\-\.()!@#$%^&+=]+$/,
    'S3 key contains invalid characters'
  )
  .transform(sanitize);

const fileExtensionSchema = z
  .string()
  .regex(/^[a-zA-Z0-9]+$/, 'Invalid file extension')
  .transform((val) => {
    const noDot = val.startsWith('.') ? val.slice(1) : val;
    return sanitize(noDot.toLowerCase());
  });

const mimeTypeSchema = z
  .string()
  .regex(/^[a-zA-Z0-9]+\/[a-zA-Z0-9\-\+\.]+$/, 'Invalid MIME type')
  .transform(sanitize);

const filenameSchema = z
  .string()
  .min(1, 'Filename is required')
  .max(255, 'Filename too long')
  .regex(/^[a-zA-Z0-9\s\-_\.()]+$/, 'Invalid filename characters')
  .transform(sanitize);

const tagSchema = z
  .string()
  .min(1, 'Tag cannot be empty')
  .max(50, 'Tag too long')
  .regex(/^[a-zA-Z0-9\-_]+$/, 'Invalid tag format')
  .transform(sanitize);

const descriptionSchema = z
  .string()
  .max(1000, 'Description too long')
  .transform(sanitize)
  .optional();

const tagsArraySchema = z
  .array(tagSchema)
  .max(20, 'Maximum 20 tags allowed')
  .optional();

const permissionSchema = z.enum(['view', 'download', 'upload', 'delete', 'share']);

/* =======================================================
   GENERATE PRESIGNED URLS
   ======================================================= */

export const generatePresignedUrlsSchema = z.object({
  body: z.object({
    files: z
      .array(
        z.object({
          filename: filenameSchema,
          mimeType: mimeTypeSchema,
        })
      )
      .min(1, 'At least one file required')
      .max(100, 'Maximum 100 files per request'),
    parentId: mongoIdSchema,
  }),
});

/* =======================================================
   CREATE DOCUMENT
   ======================================================= */

export const createDocumentSchema = z.object({
  body: z.object({
    name: filenameSchema,
    originalName: filenameSchema,
    parentId: mongoIdSchema,
    fileUrl: s3KeySchema,
    mimeType: mimeTypeSchema,
    extension: fileExtensionSchema,
    size: z
      .number()
      .int('Size must be integer')
      .positive('Size must be positive')
      .max(5 * 1024 * 1024 * 1024, 'File exceeds 5GB limit'),
    description: descriptionSchema,
    tags: tagsArraySchema,
  }),
});

/* =======================================================
   DOCUMENT OPERATIONS
   ======================================================= */

export const getDocumentByIdSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
});

export const documentOperationSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
});

export const updateDocumentSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z.object({
    name: filenameSchema.optional(),
    description: descriptionSchema,
    tags: tagsArraySchema,
  }),
});

export const moveDocumentSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z.object({
    newParentId: mongoIdSchema,
  }),
});

/* =======================================================
   SEARCH & FILTER
   ======================================================= */

export const searchDocumentsSchema = z.object({
  query: z.object({
    q: z
      .string()
      .min(1, 'Search query required')
      .max(200, 'Query too long')
      .transform(sanitize),
    departmentId: mongoIdSchema.optional(),
    limit: z
      .number()
      .int()
      .positive()
      .min(1)
      .max(100)
      .default(20)
      .optional(),
  }),
});

export const getRecentDocumentsSchema = z.object({
  params: z.object({
    departmentId: mongoIdSchema,
  }),
  query: z.object({
    limit: z
      .number()
      .int()
      .positive()
      .min(1)
      .max(100)
      .default(10)
      .optional(),
  }).optional(),
});

/* =======================================================
   TAG OPERATIONS
   ======================================================= */

export const tagsOperationSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z.object({
    tags: z
      .array(tagSchema)
      .min(1, 'At least one tag required')
      .max(20, 'Maximum 20 tags allowed'),
  }),
});

/* =======================================================
   VERSION OPERATIONS
   ======================================================= */

export const createVersionSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z.object({
    fileUrl: s3KeySchema,
    size: z
      .number()
      .int()
      .positive()
      .max(5 * 1024 * 1024 * 1024),
    mimeType: mimeTypeSchema,
    extension: fileExtensionSchema,
    name: filenameSchema.optional(),
    originalName: filenameSchema.optional(),
    changeDescription: z
      .string()
      .max(500, 'Description too long')
      .transform(sanitize)
      .optional(),
  }),
});

export const getAllVersionsSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
});

export const getVersionByNumberSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
    versionNumber: z.union([
      z.string().regex(/^\d+$/).transform(Number),
      mongoIdSchema,
    ]),
  }),
});

export const revertToVersionSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z.object({
    versionNumber: z
      .number()
      .int()
      .positive()
      .min(1, 'Version must be at least 1'),
  }),
});

/* =======================================================
   CHUNKED UPLOAD
   ======================================================= */

export const initiateChunkedUploadSchema = z.object({
  body: z.object({
    filename: filenameSchema,
    mimeType: mimeTypeSchema,
    fileSize: z
      .number()
      .int()
      .positive()
      .min(100 * 1024 * 1024, 'File must be at least 100MB for chunked upload')
      .max(5 * 1024 * 1024 * 1024, 'File exceeds 5GB limit'),
    parentId: mongoIdSchema,
  }),
});

export const uploadChunkSchema = z.object({
  body: z.object({
    uploadId: z.string().min(1),
    key: s3KeySchema,
    partNumber: z
      .number()
      .int()
      .positive()
      .min(1)
      .max(10000),
    body: z.union([z.instanceof(Buffer), z.string()]),
  }),
});

export const completeChunkedUploadSchema = z.object({
  body: z.object({
    uploadId: z.string().min(1),
    key: s3KeySchema,
    parts: z
      .array(
        z.object({
          ETag: z.string().min(1),
          PartNumber: z.number().int().positive(),
        })
      )
      .min(1),
    name: filenameSchema,
    parentId: mongoIdSchema,
    mimeType: mimeTypeSchema.optional(),
    fileSize: z.number().int().positive().optional(),
    description: descriptionSchema,
    tags: tagsArraySchema,
  }),
});

export const abortChunkedUploadSchema = z.object({
  body: z.object({
    uploadId: z.string().min(1),
    key: s3KeySchema,
  }),
});

/* =======================================================
   SHARE DOCUMENT
   ======================================================= */

export const shareDocumentSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z
    .object({
      users: z
        .array(
          z.object({
            userId: mongoIdSchema,
            permissions: z
              .array(permissionSchema)
              .min(1)
              .max(5),
          })
        )
        .optional(),
      groups: z
        .array(
          z.object({
            groupId: mongoIdSchema,
            permissions: z
              .array(permissionSchema)
              .min(1)
              .max(5),
          })
        )
        .optional(),
    })
    .refine(
      (data) =>
        (data.users && data.users.length > 0) ||
        (data.groups && data.groups.length > 0),
      {
        message: 'At least one user or group required',
      }
    ),
});

/* =======================================================
   TYPE EXPORTS
   ======================================================= */

export type GeneratePresignedUrlsInput = z.infer<typeof generatePresignedUrlsSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type GetDocumentByIdInput = z.infer<typeof getDocumentByIdSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type MoveDocumentInput = z.infer<typeof moveDocumentSchema>;
export type SearchDocumentsInput = z.infer<typeof searchDocumentsSchema>;
export type GetRecentDocumentsInput = z.infer<typeof getRecentDocumentsSchema>;
export type TagsOperationInput = z.infer<typeof tagsOperationSchema>;
export type CreateVersionInput = z.infer<typeof createVersionSchema>;
export type GetAllVersionsInput = z.infer<typeof getAllVersionsSchema>;
export type GetVersionByNumberInput = z.infer<typeof getVersionByNumberSchema>;
export type RevertToVersionInput = z.infer<typeof revertToVersionSchema>;
export type InitiateChunkedUploadInput = z.infer<typeof initiateChunkedUploadSchema>;
export type UploadChunkInput = z.infer<typeof uploadChunkSchema>;
export type CompleteChunkedUploadInput = z.infer<typeof completeChunkedUploadSchema>;
export type AbortChunkedUploadInput = z.infer<typeof abortChunkedUploadSchema>;
export type ShareDocumentInput = z.infer<typeof shareDocumentSchema>;