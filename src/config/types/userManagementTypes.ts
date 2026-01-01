import type { UserRole } from "@/config/types/commonTypes";

// 📊 Department Stats
export interface DepartmentStats {
  totalFolders: number;
  totalDocuments: number;
  totalStorageBytes: number;
  totalStorageFormatted: string;
}

// 🗂️ Department
export interface Department {
  _id: string;
  id: string;
  name: string;
  description: string;
  ownerType: "ORG" | "USER";
  ownerId: string | null;
  parentId: string | null;
  type: "department";
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  path: string;
  __v: number;
  isMyDrive: boolean;
  isOrgDepartment: boolean;
  stats: DepartmentStats;
}

// 👤 Create User (Request)
export interface CreateUserRequest {
  username: string;
  email: string;
  role: UserRole; // ✅ from commonTypes
  departments?: string[]; // Optional department IDs
}

// 👤 Create User (Response)
export interface CreateUserResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    username: string;
    email: string;
    role: UserRole; // ✅ from commonTypes
    myDriveDepartmentId: string;
    assignedDepartments: string[];
    createdBy: string;
  };
}

// 🔄 Update User Departments (Request)
export interface UpdateUserDepartmentsRequest {
  departments: string[];
}

// 🔄 Update User Departments (Response)
export interface UpdateUserDepartmentsResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    username: string;
    email: string;
    role: UserRole; // ✅ from commonTypes
    departments: Department[];
  };
}
