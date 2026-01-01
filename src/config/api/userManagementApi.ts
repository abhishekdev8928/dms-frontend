

import httpClient from "../httpClient";
import type {
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserDepartmentsRequest,
  UpdateUserDepartmentsResponse,
} from "../types/userManagementTypes";

/**
 * Create a new user by Super Admin
 * @route POST /api/admin/users
 * @access SUPER_ADMIN
 */
export const createUser = async (
  userData: CreateUserRequest
): Promise<CreateUserResponse> => {
  const res = await httpClient.post("/admin/users", userData);
  return res.data;
};

/**
 * Update user departments (assign/remove departments)
 * @route PATCH /api/admin/users/:id
 * @access SUPER_ADMIN
 */
export const updateUserDepartments = async (
  userId: string,
  data: UpdateUserDepartmentsRequest
): Promise<UpdateUserDepartmentsResponse> => {
  const res = await httpClient.patch(`/admin/users/${userId}`, data);
  return res.data;
};