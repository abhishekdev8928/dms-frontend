import httpClient from "../httpClient";


export const search = async (params: {
  query: string;
  type?: string; // Filter: 'all', 'folders', 'pdf', 'docs', 'images', 'videos', 'zip'
  modifiedFrom?: string; // ISO format date
  modifiedTo?: string; // ISO format date
  page?: number; // Page number
  limit?: number; // Results per page
}) => {
  const res = await httpClient.get("/search", { params });
  return res.data;
};

export const quickSearch = async (params: {
  query: string;
  limit?: number; // Max results for suggestions
}) => {
  const res = await httpClient.get("/search/quick", { params });
  return res.data;
};

export const getFilterTypes = async (params: { query?: string }) => {
  const res = await httpClient.get("/search/filter-types", { params });
  return res.data;
};
