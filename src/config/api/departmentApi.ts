import httpClient from "../httpClient";

/* =======================================================
   DEPARTMENT MANAGEMENT API CALLS
   ======================================================= */

/** Get all departments with pagination and filtering */
export const getAllDepartments = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  activeOnly?: boolean;
}) => {
  const res = await httpClient.get("/departments", { params });
  return res.data;
};

/** Create a new department */
export const createDepartment = async (data: {
  name: string;
  description?: string;
}) => {
  const res = await httpClient.post("/departments", data);
  return res.data;
};

/** Get department by ID */
export const getDepartmentById = async (id: string) => {
  const res = await httpClient.get(`/departments/${id}`);
  return res.data;
};

/** Update department */
export const updateDepartment = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    isActive?: boolean;
  }
) => {
  const res = await httpClient.patch(`/departments/${id}`, data);
  return res.data;
};

/** Delete department permanently */
export const deleteDepartment = async (id: string) => {
  const res = await httpClient.delete(`/departments/${id}`);
  return res.data;
};

/** Deactivate department */
export const deactivateDepartment = async (id: string) => {
  const res = await httpClient.patch(`/departments/${id}/deactivate`);
  return res.data;
};

/** Activate department */
export const activateDepartment = async (id: string) => {
  const res = await httpClient.patch(`/departments/${id}/activate`);
  return res.data;
};

/** Update department statistics */
export const updateDepartmentStats = async (id: string) => {
  const res = await httpClient.patch(`/departments/${id}/stats`);
  return res.data;
};

/** Get department by name */
export const getDepartmentByName = async (name: string) => {
  const res = await httpClient.get(`/departments/name/${name}`);
  return res.data;
};

/** Get department hierarchy (all items within department) */
export const getDepartmentHierarchy = async (
  id: string,
  depth?: number
) => {
  const res = await httpClient.get(`/departments/${id}/hierarchy`, {
    params: { depth },
  });
  return res.data;
};

/* =======================================================
   TYPE DEFINITIONS
   ======================================================= */

export interface Department {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  path: string;
  isActive: boolean;
  folderCount: number;
  documentCount: number;
  totalSize: number;
  totalSizeFormatted: string;
  createdBy: string | User;
  updatedBy?: string | User;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  name: string;
}

export interface DepartmentHierarchy {
  department: Department;
  children: Item[];
}

export interface Item {
  _id: string;
  name: string;
  type: "folder" | "document";
  path: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DepartmentListResponse {
  success: boolean;
  count: number;
  page: number;
  limit: number;
  totalPages: number;
  data: Department[];
}

export interface DepartmentResponse {
  success: boolean;
  message?: string;
  data: Department;
}

export interface DepartmentStats {
  folderCount: number;
  documentCount: number;
  totalSize: number;
  totalSizeFormatted: string;
}