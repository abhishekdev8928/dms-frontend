import httpClient from '../httpClient';

/**
 * Add starred status to a single item
 * @param {Object} params - { id: string, type: "folder" | "file" }
 * @returns {Promise<Object>} Response data
 */
export const addStarredItem = async ({ id, type }: { id: string; type: "folder" | "file" }) => {
  const { data } = await httpClient.post(`/starred/add`, { id, type });
  return data;
};

/**
 * Remove starred status from a single item
 * @param {Object} params - { id: string, type: "folder" | "file" }
 * @returns {Promise<Object>} Response data
 */
export const removeStarredItem = async ({ id, type }: { id: string; type: "folder" | "file" }) => {
  const { data } = await httpClient.post(`/starred/remove`, { id, type });
  return data;
};

/**
 * Bulk update starred status for multiple items
 * @param {Object} params - { fileIds: string[], folderIds: string[], starred: boolean }
 * @returns {Promise<Object>} Response data
 */
export const bulkUpdateStarred = async ({ 
  fileIds, 
  folderIds, 
  starred 
}: { 
  fileIds: string[]; 
  folderIds: string[]; 
  starred: boolean;
}) => {
  const { data } = await httpClient.post(`/starred/bulk`, { 
    fileIds, 
    folderIds, 
    starred 
  });
  return data;
};

/**
 * Get all starred items for current user
 * @returns {Promise<Object>} Response data with starred items
 */
export const getStarredItems = async () => {
  const { data } = await httpClient.get("/starred");
  console.log("Starred items fetched:", data);
  return data;
};