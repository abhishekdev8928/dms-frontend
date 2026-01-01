import { z } from "zod";
import { USER_ROLES } from "@/config/types/commonTypes";

/**
 * Schema for creating a new user by Super Admin
 */

export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters"),

  email: z.string().email("Invalid email address"),

  role: z
    .enum(USER_ROLES)
    .refine((role) => USER_ROLES.includes(role), {
      message: "Invalid role selected",
    }),

  departments: z.array(z.string()).optional().default([]),
});


/**
 * Schema for updating user departments
 */
export const updateUserDepartmentsSchema = z.object({
  departments: z
    .array(z.string().min(1, "Department ID cannot be empty"))
    .min(1, "At least one department is required"),
});

// Export types inferred from schemas
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserDepartmentsFormData =
  z.infer<typeof updateUserDepartmentsSchema>;
