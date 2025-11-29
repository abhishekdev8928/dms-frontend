import httpClient  from '../httpClient'; 

export interface UserGrant {
  userId: string;
  permissions: string[];
}

export interface RoleGrant {
  roleId: string;
  permissions: string[];
}

export interface MemberBankGrant {
  memberBankId: string;
  permissions: string[];
}

export interface ACL {
  _id: string;
  type: 'file' | 'folder';
  visibility: 'public' | 'private' | 'restricted';
  users: UserGrant[];
  roles: RoleGrant[];
  memberBanks: MemberBankGrant[];
  inheritsFromParent: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateACLData {
  resourceId: string;
  type: 'file' | 'folder';
  visibility?: 'public' | 'private' | 'restricted';
  users?: UserGrant[];
  roles?: RoleGrant[];
  memberBanks?: MemberBankGrant[];
  inheritsFromParent?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// ==========================================
// CREATE ACL
// ==========================================

/**
 * Create a new ACL for a resource
 */
export const createACL = async (data: CreateACLData): Promise<ApiResponse<ACL>> => {
  const response = await httpClient.post('/acl', data);
  return response.data;
};

/**
 * Create a private ACL
 */
export const createPrivateACL = async (
  resourceId: string,
  type: 'file' | 'folder'
): Promise<ApiResponse<ACL>> => {
  const response = await httpClient.post('/acl/private', { resourceId, type });
  return response.data;
};

/**
 * Create a public ACL
 */
export const createPublicACL = async (
  resourceId: string,
  type: 'file' | 'folder'
): Promise<ApiResponse<ACL>> => {
  const response = await httpClient.post('/acl/public', { resourceId, type });
  return response.data;
};

// ==========================================
// READ ACL
// ==========================================

/**
 * Get ACL by resource ID
 */
export const getACL = async (resourceId: string): Promise<ApiResponse<ACL>> => {
  const response = await httpClient.get(`/acl/${resourceId}`);
  return response.data;
};

/**
 * Get user's permissions on a resource
 */
export const getUserPermissions = async (
  resourceId: string,
  userId: string
): Promise<ApiResponse<{
  userId: string;
  resourceId: string;
  permissions: string[];
  hasAccess: boolean;
}>> => {
  const response = await httpClient.get(`/acl/${resourceId}/user-permissions/${userId}`);
  return response.data;
};

/**
 * Check if user has specific permission
 */
export const checkPermission = async (
  resourceId: string,
  userId: string,
  permission: string
): Promise<ApiResponse<{
  hasPermission: boolean;
  userId: string;
  resourceId: string;
  permission: string;
}>> => {
  const response = await httpClient.post('/acl/check-permission', {
    resourceId,
    userId,
    permission,
  });
  return response.data;
};

/**
 * Get users with specific permission
 */
export const getUsersWithPermission = async (
  resourceId: string,
  permission: string
): Promise<ApiResponse<{
  permission: string;
  userIds: string[];
  count: number;
}>> => {
  const response = await httpClient.get(`/acl/${resourceId}/users-with-permission/${permission}`);
  return response.data;
};

// ==========================================
// UPDATE ACL
// ==========================================

/**
 * Update ACL visibility
 */
export const updateVisibility = async (
  resourceId: string,
  visibility: 'public' | 'private' | 'restricted'
): Promise<ApiResponse<ACL>> => {
  const response = await httpClient.patch(`/acl/${resourceId}/visibility`, { visibility });
  return response.data;
};

/**
 * Update inheritance setting
 */
export const updateInheritance = async (
  resourceId: string,
  inheritsFromParent: boolean
): Promise<ApiResponse<ACL>> => {
  const response = await httpClient.patch(`/acl/${resourceId}/inheritance`, { inheritsFromParent });
  return response.data;
};

// ==========================================
// USER MANAGEMENT
// ==========================================

/**
 * Add user to ACL
 */
export const addUser = async (
  resourceId: string,
  userId: string,
  permissions: string[]
): Promise<ApiResponse<ACL>> => {
  const response = await httpClient.post(`/acl/${resourceId}/users`, {
    userId,
    permissions,
  });
  return response.data;
};

/**
 * Remove user from ACL
 */
export const removeUser = async (
  resourceId: string,
  userId: string
): Promise<ApiResponse<ACL>> => {
  const response = await httpClient.delete(`/acl/${resourceId}/users/${userId}`);
  return response.data;
};

/**
 * Update user permissions
 */
export const updateUserPermissions = async (
  resourceId: string,
  userId: string,
  permissions: string[]
): Promise<ApiResponse<ACL>> => {
  const response = await httpClient.patch(`/acl/${resourceId}/users/${userId}`, { permissions });
  return response.data;
};

// ==========================================
// ROLE MANAGEMENT
// ==========================================

/**
 * Add role to ACL
 */
export const addRole = async (
  resourceId: string,
  roleId: string,
  permissions: string[]
): Promise<ApiResponse<ACL>> => {
  const response = await httpClient.post(`/acl/${resourceId}/roles`, {
    roleId,
    permissions,
  });
  return response.data;
};

/**
 * Remove role from ACL
 */
export const removeRole = async (
  resourceId: string,
  roleId: string
): Promise<ApiResponse<ACL>> => {
  const response = await httpClient.delete(`/acl/${resourceId}/roles/${roleId}`);
  return response.data;
};

/**
 * Update role permissions
 */
export const updateRolePermissions = async (
  resourceId: string,
  roleId: string,
  permissions: string[]
): Promise<ApiResponse<ACL>> => {
  const response = await httpClient.patch(`/acl/${resourceId}/roles/${roleId}`, { permissions });
  return response.data;
};

// ==========================================
// MEMBER BANK MANAGEMENT
// ==========================================

/**
 * Add member bank to ACL
 */
export const addMemberBank = async (
  resourceId: string,
  memberBankId: string,
  permissions: string[]
): Promise<ApiResponse<ACL>> => {
  const response = await httpClient.post(`/acl/${resourceId}/member-banks`, {
    memberBankId,
    permissions,
  });
  return response.data;
};

/**
 * Remove member bank from ACL
 */
export const removeMemberBank = async (
  resourceId: string,
  memberBankId: string
): Promise<ApiResponse<ACL>> => {
  const response = await httpClient.delete(`/acl/${resourceId}/member-banks/${memberBankId}`);
  return response.data;
};

/**
 * Update member bank permissions
 */
export const updateMemberBankPermissions = async (
  resourceId: string,
  memberBankId: string,
  permissions: string[]
): Promise<ApiResponse<ACL>> => {
  const response = await httpClient.patch(`/acl/${resourceId}/member-banks/${memberBankId}`, {
    permissions,
  });
  return response.data;
};

// ==========================================
// DELETE ACL
// ==========================================

/**
 * Delete ACL
 */
export const deleteACL = async (resourceId: string): Promise<ApiResponse> => {
  const response = await httpClient.delete(`/acl/${resourceId}`);
  return response.data;
};

// ==========================================
// BULK OPERATIONS
// ==========================================

/**
 * Get multiple ACLs by resource IDs
 */
export const bulkGetACLs = async (
  resourceIds: string[]
): Promise<ApiResponse<{ data: ACL[]; count: number }>> => {
  const response = await httpClient.post('/acl/bulk-get', { resourceIds });
  return response.data;
};

// ==========================================
// CONVENIENCE METHODS
// ==========================================

/**
 * Grant multiple permissions to a user
 */
export const grantUserPermissions = async (
  resourceId: string,
  userId: string,
  permissions: string[]
): Promise<ApiResponse<ACL>> => {
  try {
    // Try to add user first
    return await addUser(resourceId, userId, permissions);
  } catch (error: any) {
    // If user already exists, update their permissions
    if (error.response?.status === 409 || error.response?.data?.message?.includes('already exists')) {
      return await updateUserPermissions(resourceId, userId, permissions);
    }
    throw error;
  }
};

/**
 * Check if current user has permission (requires userId from auth store)
 */
export const checkCurrentUserPermission = async (
  resourceId: string,
  permission: string,
  userId: string
): Promise<boolean> => {
  const response = await checkPermission(resourceId, userId, permission);
  return response.data?.hasPermission || false;
};

/**
 * Get ACL with error handling
 */
export const getACLSafe = async (resourceId: string): Promise<ACL | null> => {
  try {
    const response = await getACL(resourceId);
    return response.data || null;
  } catch (error) {
    console.error('Error fetching ACL:', error);
    return null;
  }
};