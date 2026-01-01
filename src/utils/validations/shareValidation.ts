import { z } from "zod";

/* =======================================================
   BASE VALIDATORS
   ======================================================= */

/**
 * ObjectId validator - validates MongoDB ObjectId format
 */
export const objectIdValidator = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

/**
 * Resource type validator
 */
const resourceTypeValidator = z.enum(["folder", "document", "FOLDER", "DOCUMENT"], {
  errorMap: () => ({
    message: "Resource type must be either folder or document",
  }),
});

/**
 * Permission validator
 */
const permissionValidator = z.enum(["view", "download", "upload", "delete", "share"]);

/**
 * Permissions array validator
 */
const permissionsSchema = z
  .array(permissionValidator)
  .min(1, "At least one permission is required")
  .refine(
    (permissions) => new Set(permissions).size === permissions.length,
    { message: "Duplicate permissions are not allowed" }
  );

/* =======================================================
   SHARE OBJECT SCHEMAS
   ======================================================= */

/**
 * User share object schema
 */
const userShareSchema = z.object({
  userId: objectIdValidator,
  permissions: permissionsSchema,
});

/* =======================================================
   ROUTE VALIDATION SCHEMAS
   ======================================================= */

/**
 * Get resource access validation schema
 * GET /api/v1/share/:resourceType/:resourceId
 */
export const getAccessSchema = z.object({
  params: z.object({
    resourceType: resourceTypeValidator,
    resourceId: objectIdValidator,
  }),
});

/**
 * Share resource validation schema
 * POST /api/v1/share/:resourceType/:resourceId
 */
export const shareResourceSchema = z.object({
  params: z.object({
    resourceType: resourceTypeValidator,
    resourceId: objectIdValidator,
  }),
  body: z
    .object({
      users: z
        .array(userShareSchema)
        .min(1, "At least one user must be specified")
        .max(50, "Maximum 50 users can be shared at once"),
    })
    .refine(
      (data) => {
        const userIds = data.users.map((u) => u.userId);
        return new Set(userIds).size === userIds.length;
      },
      { message: "Cannot share with the same user multiple times" }
    ),
});

/**
 * Update user permissions validation schema
 * PATCH /api/v1/share/:resourceType/:resourceId/user/:userId
 */
export const updateUserPermissionsSchema = z.object({
  params: z.object({
    resourceType: resourceTypeValidator,
    resourceId: objectIdValidator,
    userId: objectIdValidator,
  }),
  body: z.object({
    permissions: permissionsSchema,
  }),
});

/**
 * Remove user access validation schema
 * DELETE /api/v1/share/:resourceType/:resourceId/user/:userId
 */
export const removeUserAccessSchema = z.object({
  params: z.object({
    resourceType: resourceTypeValidator,
    resourceId: objectIdValidator,
    userId: objectIdValidator,
  }),
});

/* =======================================================
   TYPE EXPORTS
   ======================================================= */

export type ShareResourceInput = z.infer<typeof shareResourceSchema>;
export type UpdateUserPermissionsInput = z.infer<typeof updateUserPermissionsSchema>;
export type RemoveUserAccessInput = z.infer<typeof removeUserAccessSchema>;
export type GetAccessInput = z.infer<typeof getAccessSchema>;
export type UserShare = z.infer<typeof userShareSchema>;
export type Permission = z.infer<typeof permissionValidator>;
export type ResourceType = z.infer<typeof resourceTypeValidator>;