// categoryApi.ts
import api  from '@/config/axios'; // Your axios instance

// Types
export interface Category {
  _id: string;
  name: string;
  department: {
    _id: string;
    name: string;
    code: string;
  };
  path: string;
  level: number;
  createdBy: {
    _id: string;
    username: string;
    email: string;
  };
  folderAccess: 'private' | 'department' | 'organization';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subcategoryCount?: number;
}

export interface CategoryParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface CreateCategoryData {
  name: string;
  department: string;
  folderAccess?: 'private' | 'department' | 'organization';
}

export interface UpdateCategoryData {
  name?: string;
  folderAccess?: 'private' | 'department' | 'organization';
}

export interface CategoryResponse {
  success: boolean;
  count: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  data: Category[];
}

export interface SingleCategoryResponse {
  success: boolean;
  data: Category;
}

export interface CategoryActionResponse {
  success: boolean;
  message: string;
  data?: Category;
}

// API Functions
export const getCategories = async (params?: CategoryParams): Promise<CategoryResponse> => {
  const res = await api.get<CategoryResponse>("/categories", { params });
  return res.data;
};

export const getCategoryById = async (id: string): Promise<SingleCategoryResponse> => {
  const res = await api.get<SingleCategoryResponse>(`/categories/${id}`);
  return res.data;
};

export const createCategory = async (data: CreateCategoryData): Promise<CategoryActionResponse> => {
  const res = await api.post<CategoryActionResponse>("/categories", data);
  return res.data;
};

export const updateCategory = async (id: string, data: UpdateCategoryData): Promise<CategoryActionResponse> => {
  const res = await api.patch<CategoryActionResponse>(`/categories/${id}`, data);
  return res.data;
};

export const deleteCategory = async (id: string): Promise<CategoryActionResponse> => {
  const res = await api.delete<CategoryActionResponse>(`/categories/${id}`);
  return res.data;
};