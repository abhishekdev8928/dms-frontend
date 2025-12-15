// frontend/src/config/permissions.js

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  DEPARTMENT_OWNER: "department_owner",
  MEMBER_BANK: "member_bank",
  GENERAL_USER: "general_user",
};

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: {
    scope: "system_wide",
    departments: { create: true, edit: true, delete: true, view: true },
    users: {
      create: true,
      edit: true,
      delete: true,
      view: true,
      assignRoles: true,
    },
    folders: {
      create: true,
      edit: true,
      delete: true,
      view: true,
      manageVisibility: true,
      manageACL: true,
    },
    files: {
      upload: true,
      download: true,
      view: true,
      edit: true,
      delete: true,
    },
    logs: { view: true, scope: "global" },
    storage: { managePolicies: true, manageIntegrations: true },
    templates: { manageACL: true },
  },

  [ROLES.ADMIN]: {
    scope: "department",
    departments: {
      create: false,
      edit: true,
      delete: false,
      view: true,
      manageSettings: true,
    },
    users: {
      create: true,
      edit: true,
      delete: true,
      view: true,
      assignRoles: true,
      canAssignSuperAdmin: false,
    },
    folders: {
      create: true,
      edit: true,
      delete: true,
      view: true,
      manageVisibility: true,
      manageACL: true,
    },
    files: {
      upload: true,
      download: true,
      view: true,
      edit: true,
      delete: true,
      approveUploads: true,
    },
    logs: { view: true, scope: "department" },
    storage: { managePolicies: false, manageIntegrations: false },
    templates: { manageACL: false },
  },

  [ROLES.DEPARTMENT_OWNER]: {
    scope: "department",
    departments: { create: false, edit: false, delete: false, view: true },
    users: {
      create: false,
      edit: false,
      delete: false,
      view: true,
      assignRoles: false,
    },
    folders: {
      create: true,
      edit: true,
      delete: true,
      view: true,
      manageVisibility: true,
      manageACL: true,
    },
    files: {
      upload: true,
      download: true,
      view: true,
      edit: true,
      delete: true,
    },
    logs: { view: true, scope: "department" },
    storage: { managePolicies: false, manageIntegrations: false },
    templates: { manageACL: false },
  },

  [ROLES.MEMBER_BANK]: {
    scope: "assigned_folders",
    departments: { create: false, edit: false, delete: false, view: false },
    users: {
      create: false,
      edit: false,
      delete: false,
      view: false,
      assignRoles: false,
    },
    folders: {
      create: false,
      edit: false,
      delete: false,
      view: true,
      manageVisibility: false,
      manageACL: false,
    },
    files: {
      upload: true,
      download: true,
      view: true,
      edit: false,
      delete: false,
    },
    logs: { view: true, scope: "self" },
    storage: { managePolicies: false, manageIntegrations: false },
    templates: { manageACL: false },
  },

  [ROLES.GENERAL_USER]: {
    scope: "shared_only",
    departments: { create: false, edit: false, delete: false, view: false },
    users: {
      create: false,
      edit: false,
      delete: false,
      view: false,
      assignRoles: false,
    },
    folders: {
      create: false,
      edit: false,
      delete: false,
      view: true,
      manageVisibility: false,
      manageACL: false,
    },
    files: {
      upload: false,
      download: true,
      view: true,
      edit: false,
      delete: false,
      uploadIfAllowed: true,
    },
    logs: { view: true, scope: "self" },
    storage: { managePolicies: false, manageIntegrations: false },
    templates: { manageACL: false },
  },
};



/**
 * Sidebar Navigation Configuration
 * Currently available pages: Home, Department, Restore, Starred
 */
export const SIDEBAR_ITEMS = [
  {
    title: "Home",
    icon: "Home",
    path: "/",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.DEPARTMENT_OWNER,
      ROLES.MEMBER_BANK,
      ROLES.GENERAL_USER,
    ],
    description: "Main home page - accessible to all users"
  },
  {
    title: "Department",
    icon: "Building",
    path: "/departments",
    roles: [ROLES.SUPER_ADMIN],
    description: "Department management - only Super Admin"
  },
  {
    title: "Restore",
    icon: "ArchiveRestore",
    path: "/restore",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.DEPARTMENT_OWNER,
    ],
    description: "Restore deleted items - Super Admin, Admin, Department Owner"
  },
  {
    title: "Starred",
    icon: "Star",
    path: "/starred",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.DEPARTMENT_OWNER,
      ROLES.MEMBER_BANK,
      ROLES.GENERAL_USER,
    ],
    description: "Starred/favorite items - accessible to all users"
  },
];

/**
 * Helper function to get visible sidebar items for a user
 * @param {string} userRole - The user's role
 * @returns {Array} Filtered sidebar items the user can see
 * 
 * @example
 * const items = getVisibleSidebarItems('admin');
 * // Returns: [Home, Restore, Starred]
 */
export const getVisibleSidebarItems = (userRole) => {
  if (!userRole) return [];
  
  return SIDEBAR_ITEMS.filter((item) => item.roles.includes(userRole));
};

/**
 * Helper function to check if user can access a specific page
 * @param {string} userRole - The user's role
 * @param {string} path - The page path to check
 * @returns {boolean} Whether user can access the page
 * 
 * @example
 * canAccessPage('general_user', '/departments') // false
 * canAccessPage('super_admin', '/departments')  // true
 */
export const canAccessPage = (userRole, path) => {
  if (!userRole || !path) return false;
  
  const item = SIDEBAR_ITEMS.find((item) => item.path === path);
  return item ? item.roles.includes(userRole) : false;
};

/**
 * Get sidebar items count for a specific role
 * @param {string} userRole - The user's role
 * @returns {number} Number of visible menu items
 */
export const getSidebarItemCount = (userRole) => {
  return getVisibleSidebarItems(userRole).length;
};