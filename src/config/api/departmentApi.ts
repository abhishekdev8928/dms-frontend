import httpClient from "../httpClient";
import type {
  IGetAllDepartmentsResponse,
  IGetDepartmentByIdResponse,
  ICreateDepartmentResponse,
  IUpdateDepartmentResponse,
  IDeleteDepartmentResponse,
  IGetAllDepartmentsParams,
  ICreateDepartmentData,
  IUpdateDepartmentData
} from "../types/departmentTypes";

/**
 * Department API Helper
 * Matches backend routes exactly
 */

/**
 * POST /api/departments
 * Create a new ORG department
 * Access: SUPER_ADMIN, ADMIN only
 */
export const createDepartment = async (
  data: ICreateDepartmentData
): Promise<ICreateDepartmentResponse> => {
  const res = await httpClient.post("/departments", data);
  return res.data;
};

/**
 * GET /api/departments
 * Get all departments (filtered by user's access)
 * Access: All authenticated users
 */
export const getAllDepartments = async (
  params?: IGetAllDepartmentsParams
): Promise<IGetAllDepartmentsResponse> => {
  const res = await httpClient.get("/departments", { params });
  return res.data;
};

/**
 * GET /api/departments/:id
 * Get single department by ID
 * Access: All authenticated users (with access verification)
 */
export const getDepartmentById = async (
  id: string
): Promise<IGetDepartmentByIdResponse> => {
  const res = await httpClient.get(`/departments/${id}`);
  return res.data;
};

/**
 * PATCH /api/departments/:id
 * Update department details (ORG departments only)
 * Access: SUPER_ADMIN, ADMIN, DEPARTMENT_OWNER
 */
export const updateDepartment = async (
  id: string,
  data: IUpdateDepartmentData
): Promise<IUpdateDepartmentResponse> => {
  const res = await httpClient.patch(`/departments/${id}`, data);
  return res.data;
};

/**
 * DELETE /api/departments/:id
 * Delete department permanently (ORG departments only)
 * Access: SUPER_ADMIN only
 */
export const deleteDepartment = async (
  id: string
): Promise<IDeleteDepartmentResponse> => {
  const res = await httpClient.delete(`/departments/${id}`);
  return res.data;
};