// frontend/src/utils/permissionUtils.js

import { ROLE_PERMISSIONS } from '@/config/permissions';

/**
 * Check if a user has a specific permission
 * @param {string} userRole - The role of the user
 * @param {string} resource - The resource (e.g., 'users', 'folders', 'files')
 * @param {string} action - The action (e.g., 'create', 'edit', 'delete', 'view')
 * @returns {boolean} - True if user has permission, false otherwise
 */
export const hasPermission = (userRole, resource, action) => {
  // If no role provided, no permission
  if (!userRole) return false;

  // Get role permissions
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  
  // If role doesn't exist in our system
  if (!rolePermissions) return false;

  // Check if resource exists
  if (!rolePermissions[resource]) return false;

  // Check specific action permission
  return rolePermissions[resource][action] === true;
};

/**
 * Check if user has ANY of the provided permissions
 * @param {string} userRole - The role of the user
 * @param {Array} permissionChecks - Array of {resource, action} objects
 * @returns {boolean} - True if user has at least one permission
 */
export const hasAnyPermission = (userRole, permissionChecks) => {
  if (!userRole || !Array.isArray(permissionChecks)) return false;

  return permissionChecks.some(({ resource, action }) => 
    hasPermission(userRole, resource, action)
  );
};

/**
 * Check if user has ALL of the provided permissions
 * @param {string} userRole - The role of the user
 * @param {Array} permissionChecks - Array of {resource, action} objects
 * @returns {boolean} - True if user has all permissions
 */
export const hasAllPermissions = (userRole, permissionChecks) => {
  if (!userRole || !Array.isArray(permissionChecks)) return false;

  return permissionChecks.every(({ resource, action }) => 
    hasPermission(userRole, resource, action)
  );
};

/**
 * Direct role check (use sparingly, prefer permission checks)
 * @param {string} userRole - The role of the user
 * @param {string|Array} allowedRoles - Single role or array of roles
 * @returns {boolean} - True if user has the role
 */
export const hasRole = (userRole, allowedRoles) => {
  if (!userRole) return false;

  if (Array.isArray(allowedRoles)) {
    return allowedRoles.includes(userRole);
  }

  return userRole === allowedRoles;
};

/**
 * Get user's scope level
 * @param {string} userRole - The role of the user
 * @returns {string} - Scope level (system_wide, department, assigned_folders, shared_only)
 */
export const getUserScope = (userRole) => {
  if (!userRole) return null;
  
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return rolePermissions?.scope || null;
};

/**
 * Check if user can perform action in their scope
 * @param {string} userRole - The role of the user
 * @param {string} requiredScope - Required scope level
 * @returns {boolean} - True if user's scope matches or exceeds required scope
 */
export const hasScope = (userRole, requiredScope) => {
  const scopeHierarchy = {
    'system_wide': 4,
    'department': 3,
    'assigned_folders': 2,
    'shared_only': 1,
  };

  const userScope = getUserScope(userRole);
  
  if (!userScope || !requiredScope) return false;

  return scopeHierarchy[userScope] >= scopeHierarchy[requiredScope];
};

/**
 * Get all permissions for a specific resource
 * @param {string} userRole - The role of the user
 * @param {string} resource - The resource name
 * @returns {object} - Object with all permissions for that resource
 */
export const getResourcePermissions = (userRole, resource) => {
  if (!userRole) return {};

  const rolePermissions = ROLE_PERMISSIONS[userRole];
  
  if (!rolePermissions || !rolePermissions[resource]) return {};

  return rolePermissions[resource];
};

/**
 * Check if user can perform multiple actions on same resource
 * @param {string} userRole - The role of the user
 * @param {string} resource - The resource name
 * @param {Array} actions - Array of action strings
 * @returns {object} - Object with action as key and boolean as value
 */
export const checkMultipleActions = (userRole, resource, actions) => {
  if (!userRole || !Array.isArray(actions)) return {};

  const result = {};
  actions.forEach(action => {
    result[action] = hasPermission(userRole, resource, action);
  });

  return result;
};

/**
 * Check if user is super admin (highest privilege check)
 * @param {string} userRole - The role of the user
 * @returns {boolean}
 */
export const isSuperAdmin = (userRole) => {
  return userRole === 'super_admin';
};

/**
 * Check if user is admin or above
 * @param {string} userRole - The role of the user
 * @returns {boolean}
 */
export const isAdminOrAbove = (userRole) => {
  return userRole === 'super_admin' || userRole === 'admin';
};

/**
 * Get user's log view scope
 * @param {string} userRole - The role of the user
 * @returns {string|null} - Log scope (global, department, self)
 */
export const getLogScope = (userRole) => {
  if (!userRole) return null;
  
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return rolePermissions?.logs?.scope || null;
};