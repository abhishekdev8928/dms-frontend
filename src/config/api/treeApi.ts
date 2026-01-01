import httpClient from "../httpClient";


/** Get the full department → folder → subfolder hierarchy */
export const getFullTree = async () => {
  const res = await httpClient.get("/dms/navigation-tree");
  return res.data;
};


/** Get all folders and documents shared with the current user */
export const getSharedWithMe = async (params?: {
  type?: "all" | "folder" | "document";
  page?: number;
  limit?: number;
}) => {
  const res = await httpClient.get("/dms/with-me", { params });
  return res.data;
};