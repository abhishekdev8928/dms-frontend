/* =======================================================
   DATE & TIME HELPERS
   ======================================================= */

/**
 * Get formatted date and time string
 * Example: "Monday, December 30, 2024, 3:45 PM"
 */
export const getFormattedDateTime = (): string => {
  const now = new Date();
  return now.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Get short formatted date
 * Example: "Dec 30, 2024"
 */
export const getShortFormattedDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Get relative time string
 * Example: "2 hours ago", "3 days ago"
 */
export const getRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return getShortFormattedDate(date);
};

/* =======================================================
   FOLDER PATH HELPERS
   ======================================================= */

/**
 * Extract folder name from path
 * Example: "/department/folder1/folder2" -> "folder2"
 */
export const getFolderNameFromPath = (path: string): string => {
  const parts = path.split("/").filter(Boolean);
  return parts[parts.length - 1] || "";
};

/**
 * Get parent path from current path
 * Example: "/department/folder1/folder2" -> "/department/folder1"
 */
export const getParentPath = (path: string): string => {
  const parts = path.split("/").filter(Boolean);
  parts.pop();
  return "/" + parts.join("/");
};

/**
 * Build breadcrumb trail from path
 */
export const buildBreadcrumbsFromPath = (
  path: string
): Array<{ name: string; path: string }> => {
  const parts = path.split("/").filter(Boolean);
  const breadcrumbs = [];
  let currentPath = "";

  for (const part of parts) {
    currentPath += `/${part}`;
    breadcrumbs.push({
      name: part,
      path: currentPath,
    });
  }

  return breadcrumbs;
};

/* =======================================================
   FOLDER VALIDATION HELPERS
   ======================================================= */

/**
 * Check if folder name is valid
 */
export const isValidFolderName = (name: string): boolean => {
  const regex = /^[a-zA-Z0-9\s\-_&()]+$/;
  return regex.test(name) && name.length > 0 && name.length <= 100;
};

/**
 * Sanitize folder name
 */
export const sanitizeFolderName = (name: string): string => {
  return name.trim().replace(/[^a-zA-Z0-9\s\-_&()]/g, "");
};

/* =======================================================
   COLOR HELPERS
   ======================================================= */

/**
 * Default folder colors
 */
export const FOLDER_COLORS = {
  BLUE: "#3B82F6",
  GREEN: "#10B981",
  YELLOW: "#F59E0B",
  RED: "#EF4444",
  PURPLE: "#8B5CF6",
  PINK: "#EC4899",
  INDIGO: "#6366F1",
  GRAY: "#6B7280",
} as const;

/**
 * Get random folder color
 */
export const getRandomFolderColor = (): string => {
  const colors = Object.values(FOLDER_COLORS);
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Validate hex color format
 */
export const isValidHexColor = (color: string): boolean => {
  const regex = /^#[0-9A-Fa-f]{6}$/;
  return regex.test(color);
};

/* =======================================================
   SIZE FORMATTING HELPERS
   ======================================================= */

/**
 * Format bytes to human readable size
 * Example: 1024 -> "1 KB", 1048576 -> "1 MB"
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

/* =======================================================
   BREADCRUMB HELPERS
   ======================================================= */

/**
 * Get parent folder ID from breadcrumbs
 */
export const getParentFolderIdFromBreadcrumbs = (
  breadcrumbs: Array<{ _id: string; id?: string }>,
  currentFolderId: string
): string | null => {
  if (!breadcrumbs || breadcrumbs.length <= 1) return null;

  // Find current folder index
  const currentIndex = breadcrumbs.findIndex(
    (item) => (item._id || item.id) === currentFolderId
  );

  // Return parent folder ID
  if (currentIndex > 0) {
    return breadcrumbs[currentIndex - 1]._id || breadcrumbs[currentIndex - 1].id || null;
  }

  return null;
};

/**
 * Check if deleting current folder based on breadcrumbs
 */
export const isDeletingCurrentFolder = (
  deletedFolderId: string,
  currentFolderId?: string
): boolean => {
  return deletedFolderId === currentFolderId;
};