import httpClient from '../httpClient';

/* =======================================================
   STARRED API
   ======================================================= */

/**
 * Add starred status to a single item
 * @param {Object} params - { id: string, type: "folder" | "document" }
 * @returns {Promise<Object>} Response data
 */
export const addStarredItem = async ({ 
  id, 
  type 
}: { 
  id: string; 
  type: "folder" | "document";
}) => {
  const res = await httpClient.post("/starred/add", { id, type });
  return res.data;
};

/**
 * Remove starred status from a single item
 * @param {Object} params - { id: string, type: "folder" | "document" }
 * @returns {Promise<Object>} Response data
 */
export const removeStarredItem = async ({ 
  id, 
  type 
}: { 
  id: string; 
  type: "folder" | "document";
}) => {
  const res = await httpClient.post("/starred/remove", { id, type });
  return res.data;
};

/**
 * Bulk update starred status for multiple items
 * @param {Object} params - { documentIds?: string[], folderIds?: string[], starred: boolean }
 * @returns {Promise<Object>} Response data
 */
export const bulkUpdateStarred = async ({ 
  documentIds = [], 
  folderIds = [], 
  starred 
}: { 
  documentIds?: string[]; 
  folderIds?: string[]; 
  starred: boolean;
}) => {
  const res = await httpClient.post("/starred/bulk", { 
    documentIds,
    folderIds, 
    starred 
  });
  return res.data;
};

/**
 * Get all starred items for current user
 * @returns {Promise<Object>} Response data with starred items
 */
export const getStarredItems = async () => {
  const res = await httpClient.get("/starred");
  return res.data;
};