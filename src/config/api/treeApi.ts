import httpClient from "../httpClient";

/* =======================================================
   TREE & NAVIGATION API
   ======================================================= */

/** Get the full department → folder → subfolder hierarchy */
export const getFullTree = async () => {
  const res = await httpClient.get("/children/tree");
  return res.data;
};

/** Get immediate children (folders + documents) of a parent (department or folder) */
export const getChildren = async (
  parentId: string,
  params?: {
    includeDeleted?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    type?: "all" | "folder" | "file";
  }
) => {
  const res = await httpClient.get(`/children/${parentId}`, { params });
  return res.data;
};

/** Get full descendant tree for a parent (recursive) */
export const getFullDescendantTree = async (
  parentId: string,
  params?: {
    includeDeleted?: boolean;
    maxDepth?: number;
  }
) => {
  const res = await httpClient.get(`/children/${parentId}/tree`, { params });
  return res.data;
};

/** Get breadcrumb trail for a given parent (department or folder) */
export const getBreadcrumbs = async (parentId: string) => {
  const res = await httpClient.get(`/children/${parentId}/breadcrumbs`);
  return res.data;
};

/** Get statistics (total folders, files, size, type breakdown) for a parent */
export const getParentStats = async (
  parentId: string,
  params?: { includeDeleted?: boolean }
) => {
  const res = await httpClient.get(`/children/${parentId}/stats`, { params });
  return res.data;
};





