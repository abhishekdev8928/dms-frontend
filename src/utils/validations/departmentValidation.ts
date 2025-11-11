import { z } from "zod";
import DOMPurify from "dompurify";



const sanitize = (value: string) => {
  return DOMPurify.sanitize(value.trim(), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};


// Get all departments
export const getAllDepartmentsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  search: z.string().max(100).transform(sanitize).optional(),
  sortBy: z.enum(["name", "createdAt", "updatedAt", "folderCount", "documentCount"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  activeOnly: z.boolean().optional(),
});

// Create department
export const createDepartmentSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long")
    .regex(/^[a-zA-Z0-9\s\-_&()]+$/, "Invalid characters in name")
    .transform(sanitize),
  description: z
    .string()
    .max(500, "Description too long")
    .transform(sanitize)
    .optional(),
});

// Update department
export const updateDepartmentSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-zA-Z0-9\s\-_&()]+$/)
    .transform(sanitize)
    .optional(),
  description: z
    .string()
    .max(500)
    .transform(sanitize)
    .optional(),
  isActive: z.boolean().optional(),
});

// Department ID
export const departmentIdSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid department ID")
    .transform(sanitize),
});

// Department name
export const departmentNameSchema = z.object({
  name: z.string().min(1).max(100).transform(sanitize),
});

// Department hierarchy
export const departmentHierarchySchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid department ID")
    .transform(sanitize),
  depth: z.number().int().min(1).max(10).optional(),
});



export type GetAllDepartmentsInput = z.infer<typeof getAllDepartmentsSchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type DepartmentIdInput = z.infer<typeof departmentIdSchema>;
export type DepartmentNameInput = z.infer<typeof departmentNameSchema>;
export type DepartmentHierarchyInput = z.infer<typeof departmentHierarchySchema>;