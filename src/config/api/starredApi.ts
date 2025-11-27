import httpClient from '../httpClient';


/**
 * Toggle starred status for a single item
 * @param {Object} params - { id: string, type: "folder" | "file" }
 * @returns {Promise<Object>} Response data
 */
export const toggleStarredItem = async ({ id, type }) => {
  const { data } = await httpClient.post(`/common/toggle`, { id, type });
  return data;
};

/**
 * Add starred status to a single item
 * @param {Object} params - { id: string, type: "folder" | "file" }
 * @returns {Promise<Object>} Response data
 */
export const addStarredItem = async ({ id, type }) => {
  const { data } = await httpClient.post(`/common/add`, { id, type });
  return data;
};

/**
 * Remove starred status from a single item
 * @param {Object} params - { id: string, type: "folder" | "file" }
 * @returns {Promise<Object>} Response data
 */
export const removeStarredItem = async ({ id, type }) => {
  const { data } = await httpClient.post(`/common/remove`, { id, type });
  return data;
};

/**
 * Bulk toggle starred status for multiple items
 * @param {Object} params - { items: [{ id: string, type: "folder" | "file" }] }
 * @returns {Promise<Object>} Response data
 */
export const bulkToggleStarredItems = async ({ items }) => {
  const { data } = await httpClient.post(`/common/bulk-toggle`, { items });
  return data;
};

/**
 * Get all starred items for current user
 * @returns {Promise<Object>} Response data with starred items
 */
export const getStarredItems = async () => {
  const { data } = await httpClient.get("/common/starred");
  console.log("api is calling",data)
  return data;
};