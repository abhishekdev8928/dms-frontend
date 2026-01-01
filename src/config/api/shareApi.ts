import httpClient from "../httpClient";
import {
  shareResourceSchema,
  updateUserPermissionsSchema,
  removeUserAccessSchema,
  getAccessSchema,
} from "@/utils/validations/shareValidation";
import type { Permission } from "../types/shareTypes";

/* =======================================================
   SHARE API CALLS
   ======================================================= */

/**
 * Get all users with access to a resource
 * Route: GET /api/v1/share/:resourceType/:resourceId
 * Access: Private
 */
export const getResourceAccessDetails = async (data: {
  resourceType: "folder" | "document";
  resourceId: string;
}) => {
  const validated = getAccessSchema.parse({ params: data });
  const { resourceType, resourceId } = validated.params;
  const res = await httpClient.get(`/share/${resourceType}/${resourceId}`);
  return res.data;
};

/**
 * Share resource with users (add/update permissions)
 * Route: POST /api/v1/share/:resourceType/:resourceId
 * Access: Private - Requires 'share' permission
 */
export const shareResource = async (data: {
  resourceType: "folder" | "document";
  resourceId: string;
  users: {
    userId: string;
    permissions: Permission[];
  }[];
}) => {
  const { resourceType, resourceId, users } = data;
  const validated = shareResourceSchema.parse({
    params: { resourceType, resourceId },
    body: { users },
  });
  
  const res = await httpClient.post(
    `/share/${validated.params.resourceType}/${validated.params.resourceId}`,
    validated.body
  );
  return res.data;
};

/**
 * Update user permissions on resource
 * Route: PATCH /api/v1/share/:resourceType/:resourceId/user/:userId
 * Access: Private - Requires 'share' permission
 */
export const updateUserPermissions = async (data: {
  resourceType: "folder" | "document";
  resourceId: string;
  userId: string;
  permissions: Permission[];
}) => {
  const { resourceType, resourceId, userId, permissions } = data;
  const validated = updateUserPermissionsSchema.parse({
    params: { resourceType, resourceId, userId },
    body: { permissions },
  });
  
  const res = await httpClient.patch(
    `/share/${validated.params.resourceType}/${validated.params.resourceId}/user/${validated.params.userId}`,
    validated.body
  );
  return res.data;
};

/**
 * Remove user access from resource
 * Route: DELETE /api/v1/share/:resourceType/:resourceId/user/:userId
 * Access: Private - Requires 'share' permission
 */
export const removeUserAccess = async (data: {
  resourceType: "folder" | "document";
  resourceId: string;
  userId: string;
}) => {
  const validated = removeUserAccessSchema.parse({ params: data });
  const { resourceType, resourceId, userId } = validated.params;
  
  const res = await httpClient.delete(
    `/share/${resourceType}/${resourceId}/user/${userId}`
  );
  return res.data;
};