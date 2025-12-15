// frontend/src/hooks/usePermission.js

import { useMemo } from 'react';
import { useAuthStore } from '@/config/store/authStore'; // Your Zustand store
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  getUserScope,
  hasScope,
  getResourcePermissions,
  checkMultipleActions,
  isSuperAdmin,
  isAdminOrAbove,
  getLogScope,
} from '@/utils/helper/permissions';

/**
 * Custom hook for permission checking in React components
 * Uses Zustand auth store to get current user's role
 * @returns {object} - Object with all permission checking functions
 */
export const usePermission = () => {
  // Get current user from Zustand store
  const currentUser = useAuthStore((state) => state.user);
  const userRole = currentUser?.role;

  // Memoize functions to prevent unnecessary re-renders
  const permissions = useMemo(() => {
    return {
      // Main permission check function
      can: (resource, action) => {
        return hasPermission(userRole, resource, action);
      },

      // Check if user has any of the permissions
      canAny: (permissionChecks) => {
        return hasAnyPermission(userRole, permissionChecks);
      },

      // Check if user has all permissions
      canAll: (permissionChecks) => {
        return hasAllPermissions(userRole, permissionChecks);
      },

      // Direct role check
      isRole: (allowedRoles) => {
        return hasRole(userRole, allowedRoles);
      },

      // Get user scope
      scope: getUserScope(userRole),

      // Check scope access
      hasScope: (requiredScope) => {
        return hasScope(userRole, requiredScope);
      },

      // Get all permissions for a resource
      getPermissionsFor: (resource) => {
        return getResourcePermissions(userRole, resource);
      },

      // Check multiple actions at once
      checkActions: (resource, actions) => {
        return checkMultipleActions(userRole, resource, actions);
      },

      // Quick privilege checks
      isSuperAdmin: isSuperAdmin(userRole),
      isAdmin: isAdminOrAbove(userRole),
      
      // Get log scope
      logScope: getLogScope(userRole),

      // Current user role
      role: userRole,
      
      // User info
      user: currentUser,
    };
  }, [userRole, currentUser]);

  return permissions;
};

// ============================================
// USAGE EXAMPLES IN COMPONENTS
// ============================================

/*

// Example 1: Simple permission check
function CreateUserButton() {
  const { can } = usePermission();
  
  if (!can('users', 'create')) {
    return null; // Don't show button
  }
  
  return <button>Create User</button>;
}

// Example 2: Multiple actions check
function FileActions({ fileId }) {
  const { checkActions } = usePermission();
  
  const actions = checkActions('files', ['edit', 'delete', 'download']);
  
  return (
    <div>
      {actions.edit && <button>Edit</button>}
      {actions.delete && <button>Delete</button>}
      {actions.download && <button>Download</button>}
    </div>
  );
}

// Example 3: Role-based rendering
function AdminPanel() {
  const { isAdmin } = usePermission();
  
  if (!isAdmin) {
    return <div>Access Denied</div>;
  }
  
  return <div>Admin Dashboard</div>;
}

// Example 4: Scope-based check
function DepartmentSettings() {
  const { hasScope } = usePermission();
  
  const canManage = hasScope('department');
  
  return (
    <div>
      <h1>Department Settings</h1>
      {canManage && <button>Edit Settings</button>}
    </div>
  );
}

// Example 5: Get all permissions for a resource
function UserManagement() {
  const { getPermissionsFor } = usePermission();
  
  const userPerms = getPermissionsFor('users');
  
  return (
    <div>
      {userPerms.create && <button>Add User</button>}
      {userPerms.edit && <button>Edit User</button>}
      {userPerms.delete && <button>Delete User</button>}
      {userPerms.view && <UserList />}
    </div>
  );
}

// Example 6: Conditional action execution
function DeleteButton({ userId }) {
  const { can } = usePermission();
  
  const handleDelete = async () => {
    // Double check before API call
    if (!can('users', 'delete')) {
      alert('You do not have permission to delete users');
      return;
    }
    
    // Proceed with delete
    await deleteUser(userId);
  };
  
  // Show button only if user can delete
  if (!can('users', 'delete')) {
    return null;
  }
  
  return <button onClick={handleDelete}>Delete</button>;
}

// Example 7: Using with disabled state
function EditButton({ fileId }) {
  const { can } = usePermission();
  
  const canEdit = can('files', 'edit');
  
  return (
    <button 
      disabled={!canEdit}
      title={!canEdit ? 'You do