import { useQuery } from '@tanstack/react-query';
import {
  getAllDepartments,
 
} from '@/config/api/departmentApi';
import type { IGetAllDepartmentsParams,
   IGetAllDepartmentsResponse,
  IDepartment,} from "@/config/types/departmentTypes"
/**
 * Hook to fetch all departments with useQuery
 */
export const useDepartments = (
  params?: IGetAllDepartmentsParams,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery<IGetAllDepartmentsResponse>({
    queryKey: ['departments', params?.page, params?.limit, params?.search, params?.sortBy, params?.order, params?.activeOnly],
    queryFn: () => getAllDepartments(params),
    enabled: options?.enabled !== false,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to fetch a single department by ID
 */
export const useDepartmentById = (
  departmentId: string | null,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery<IDepartment | null>({
    queryKey: ['departments', departmentId],
    queryFn: async () => {
      // If you have a getDepartmentById API, use it here
      // Otherwise, fetch all and filter
      const response = await getAllDepartments();
      return response.data.find((d) => d._id === departmentId) || null;
    },
    enabled: !!departmentId && (options?.enabled !== false),
    staleTime: 30000,
  });
};

/**
 * Hook to fetch active departments only
 */
export const useActiveDepartments = (
  params?: Omit<IGetAllDepartmentsParams, 'activeOnly'>,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery<IGetAllDepartmentsResponse>({
    queryKey: ['departments', 'active', params?.page, params?.limit, params?.search],
    queryFn: () => getAllDepartments({ ...params, activeOnly: true }),
    enabled: options?.enabled !== false,
    staleTime: 30000,
  });
};

/**
 * Hook to fetch organization departments only
 */
export const useOrgDepartments = (
  params?: IGetAllDepartmentsParams,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery<IGetAllDepartmentsResponse>({
    queryKey: ['departments', 'org', params?.page, params?.limit],
    queryFn: async () => {
      const response = await getAllDepartments(params);
      return {
        ...response,
        data: response.data.filter((dept) => dept.isOrgDepartment),
      };
    },
    enabled: options?.enabled !== false,
    staleTime: 30000,
  });
};

/**
 * Hook to fetch My Drive departments only
 */
export const useMyDriveDepartments = (
  params?: IGetAllDepartmentsParams,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery<IGetAllDepartmentsResponse>({
    queryKey: ['departments', 'mydrive', params?.page, params?.limit],
    queryFn: async () => {
      const response = await getAllDepartments(params);
      return {
        ...response,
        data: response.data.filter((dept) => dept.isMyDrive),
      };
    },
    enabled: options?.enabled !== false,
    staleTime: 30000,
  });
};