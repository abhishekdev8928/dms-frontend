import httpClient from "../httpClient";

/**
 * Get trash items with pagination
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 20)
 * @returns Promise with trash items data
 */
export const getTrashItems = async (page: number = 1, limit: number = 20) => {
  const res = await httpClient.get(`/trash?page=${page}&limit=${limit}`);
  return res.data;
};

/**
 * Restore a single item from trash
 * @param itemId - ID of the item to restore
 * @returns Promise with restore result
 */
export const restoreTrashItem = async (itemId: string) => {
  const res = await httpClient.post(`/trash/restore/${itemId}`);
  return res.data;
};

/**
 * Permanently delete a single item from trash
 * @param itemId - ID of the item to delete
 * @returns Promise with delete result
 */
export const permanentDeleteTrashItem = async (itemId: string) => {
  const res = await httpClient.delete(`/trash/${itemId}?confirmation=true`);
  return res.data;
};

/**
 * Bulk restore multiple items from trash
 * @param itemIds - Array of item IDs to restore
 * @returns Promise with bulk restore result
 */
export const bulkRestoreTrashItems = async (itemIds: string[]) => {
  const res = await httpClient.post("/trash/restore/bulk", { itemIds });
  return res.data;
};

/**
 * Bulk permanently delete multiple items from trash
 * @param itemIds - Array of item IDs to delete
 * @returns Promise with bulk delete result
 */
export const bulkPermanentDeleteTrashItems = async (itemIds: string[]) => {
  const res = await httpClient.post("/trash/delete/bulk", {
    itemIds,
    confirmation: true,
  });
  return res.data;
};

/**
 * Get trash statistics
 * @returns Promise with trash stats
 */
export const getTrashStats = async () => {
  const res = await httpClient.get("/trash/stats");
  return res.data;
};