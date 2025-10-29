// subcategoryApi.ts
import  api  from '../axios'; // Your axios instance

// Types
export interface Subcategory {
  _id: string;
  name: string;
  department: {
    _id: string;
    name: string;
    code: string;
  };
  parentFolder: {
    _id: string;
    name: string;
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
}

export interface SubcategoryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  department?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface CreateSubcategoryData {
  name: string;
  category: string;
  folderAccess?: 'private' | 'department' | 'organization';
}

export interface UpdateSubcategoryData {
  name?: string;
  folderAccess?: 'private' | 'department' | 'organization';
}

export interface SubcategoryResponse {
  success: boolean;
  count: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  data: Subcategory[];
}

export interface SingleSubcategoryResponse {
  success: boolean;
  data: Subcategory;
}

export interface SubcategoryActionResponse {
  success: boolean;
  message: string;
  data?: Subcategory;
}

// API Functions
export const getSubcategories = async (params?: SubcategoryParams): Promise<SubcategoryResponse> => {
  const res = await api.get<SubcategoryResponse>("/subcategories", { params });
  return res.data;
};

export const getSubcategoriesByCategory = async (categoryId: string): Promise<SubcategoryResponse> => {
  const res = await api.get<SubcategoryResponse>(`/subcategories/category/${categoryId}`);
  return res.data;
};

export const getSubcategoryById = async (id: string): Promise<SingleSubcategoryResponse> => {
  const res = await api.get<SingleSubcategoryResponse>(`/subcategories/${id}`);
  return res.data;
};

export const createSubcategory = async (data: CreateSubcategoryData): Promise<SubcategoryActionResponse> => {
  const res = await api.post<SubcategoryActionResponse>("/subcategories", data);
  return res.data;
};

export const updateSubcategory = async (id: string, data: UpdateSubcategoryData): Promise<SubcategoryActionResponse> => {
  const res = await api.patch<SubcategoryActionResponse>(`/subcategories/${id}`, data);
  return res.data;
};

export const deleteSubcategory = async (id: string): Promise<SubcategoryActionResponse> => {
  const res = await api.delete<SubcategoryActionResponse>(`/subcategories/${id}`);
  return res.data;
};