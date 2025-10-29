import api from "../axios";

export const getDepartments = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}) => {
  const res = await api.get("/departments", { params });
  return res.data;
};

export const createDepartment = async (data: {
  name: string;
  code: string;
  description?: string;
}) => {
  const res = await api.post("/departments", data);
  return res.data;
};

export const updateDepartment = async (id: string, data: {
  name?: string;
  code?: string;
  description?: string;
}) => {
  const res = await api.patch(`/departments/${id}`, data);
  return res.data;
};

export const deleteDepartment = async (id: string) => {
  const res = await api.delete(`/departments/${id}`);
  return res.data;
};

export const getDepartmentById = async (id: string) => {
  const res = await api.get(`/departments/${id}`);
  return res.data;
};