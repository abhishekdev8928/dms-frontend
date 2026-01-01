import type { IUser } from "./commonTypes";




export interface IDepartmentStats {
  totalFolders: number;
  totalDocuments: number;
  totalStorageBytes: number;
  totalStorageFormatted?: string;
}

export interface IDepartmentActions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}



export interface IDepartment {
  _id: string;
  name: string;
  description?: string;
  ownerType: 'ORG' | 'USER';
  ownerId: string | null;
  parentId: string | null;
  type: 'department';
  stats: IDepartmentStats;
  isActive: boolean;
  createdBy: IUser;
  updatedBy?: IUser;
  createdAt: string;
  updatedAt: string;
  path: string;
  __v: number;
  isMyDrive?: boolean;
  isOrgDepartment?: boolean;
  id?: string;
  actions?: IDepartmentActions; 
}



export interface IGetAllDepartmentsResponse {
  success: boolean;
  count: number;
  page: number;
  limit: number;
  totalPages: number;
  data: IDepartment[];
}

export interface IGetDepartmentByIdResponse {
  success: boolean;
  data: IDepartment;
}



export interface ICreateDepartmentResponse {
  success: boolean;
  data: IDepartment;
}

export interface IUpdateDepartmentResponse {
  success: boolean;
  data: IDepartment;
}

export interface IDeleteDepartmentResponse {
  success: boolean;
  message: string;
}


export interface IGetAllDepartmentsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  activeOnly?: boolean;
}

export interface ICreateDepartmentData {
  name: string;
  description?: string;
}

export interface IUpdateDepartmentData {
  name?: string;
  description?: string;
  isActive?: boolean;
}