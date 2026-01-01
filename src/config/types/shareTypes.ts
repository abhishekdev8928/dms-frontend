export type Permission = "view" | "download" | "upload" | "delete" | "share";

export type ResourceType = "folder" | "document" | "FOLDER" | "DOCUMENT";

export type SubjectType = "USER";

export interface GrantedByInfo {
  _id: string;
  username: string;
  email: string;
}

export interface UserAccess {
  userId: string;
  username: string;
  email: string;
  permissions: Permission[];
  grantedAt: string;
  grantedBy: GrantedByInfo;
}

export interface ResourceAccessDetails {
  resource: {
    resourceType: ResourceType;
    resourceId: string;
    name: string;
    path: string;
  };
  owner: {
    userId: string;
    email: string;
    username: string;
    role: string;
  };
  usersWithAccess: UserAccess[];
  summary: {
    totalUsers: number;
    totalAccessEntries: number;
  };
}

export interface SharedSubject {
  subjectType: SubjectType;
  subjectId: string;
  subjectName: string;
  permissions: Permission[];
  note?: string; // For implicit access messages
}

export interface ShareError {
  userId: string;
  type: SubjectType;
  error: string;
}

export interface ShareResourceResponse {
  success: boolean;
  message: string;
  data: {
    resource: {
      _id: string;
      name: string;
      path: string;
      type: ResourceType;
    };
    sharedWith: SharedSubject[];
    errors?: ShareError[];
  };
}

export interface GetResourceAccessResponse {
  success: boolean;
  message: string;
  data: ResourceAccessDetails;
}

export interface UpdateUserPermissionsResponse {
  success: boolean;
  message: string;
  data: {
    subjectType: "USER";
    subjectId: string;
    subjectName: string;
    permissions: Permission[];
  };
}

export interface RemoveUserAccessResponse {
  success: boolean;
  message: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}

// Request payload types
export interface ShareUserPayload {
  userId: string;
  permissions: Permission[];
}

export interface ShareResourcePayload {
  users: ShareUserPayload[];
}

export interface UpdatePermissionsPayload {
  permissions: Permission[];
}