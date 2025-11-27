import httpClient from "../httpClient";
import {
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  changePasswordSchema,
  updateProfileSchema,
  superAdminCreateUserSchema,
} from "@/utils/validations/AuthValidation";

/* =======================================================
   AUTHENTICATION API CALLS
   ======================================================= */

/**
 * Register a new user
 * Route: POST /api/auth/register
 * Access: Public
 */
// export const registerUser = async (data: {
//   username: string;
//   email: string;
//   password: string;
//   role?: "admin" | "manager" | "team_member";
//   departments?: string[];
// }) => {
//   const validated = registerSchema.parse(data);
//   const res = await httpClient.post("/auth/register", validated);
//   return res.data;
// };


// frontend/src/config/auth.ts or wherever your auth API functions are

/**
 * Create new user by Super Admin
 * Route: POST /api/admin/users
 * Access: Super Admin only
 */
export const createUserBySuperAdmin = async (data: {
  username: string;
  email: string;
  role: "super_admin" | "admin" | "department_owner" | "member_bank" | "user";
  departments?: string[];
}) => {
  const validated = superAdminCreateUserSchema.parse(data);
  const res = await httpClient.post("/auth/users", validated);
  return res.data;
};

/**
 * Verify OTP after registration or login
 * Route: POST /api/auth/verify-otp
 * Access: Public
 */
export const verifyOtp = async (data: { userId: string; otp: string }) => {
  const validated = verifyOtpSchema.parse(data);
  const res = await httpClient.post("/auth/verify-otp", validated);
  return res.data;
};

/**
 * Resend OTP to user's email
 * Route: POST /api/auth/resend-otp
 * Access: Public
 */
export const resendOtp = async (data: { email: string }) => {
  const validated = resendOtpSchema.parse(data);
  const res = await httpClient.post("/auth/resend-otp", validated);
  return res.data;
};

/**
 * Login user
 * Route: POST /api/auth/login
 * Access: Public
 */
export const loginUser = async (data: { email: string; password: string }) => {
  const validated = loginSchema.parse(data);
  const res = await httpClient.post("/auth/login", validated);
  return res.data;
};

/**
 * Logout user
 * Route: POST /api/auth/logout
 * Access: Private
 */
export const logoutUser = async (refreshToken?: string) => {
  const res = await httpClient.post("/auth/logout", { refreshToken });
  return res.data;
};

/**
 * Refresh access token
 * Route: POST /api/auth/refresh-token
 * Access: Public
 */
export const refreshAccessToken = async (refreshToken: string) => {
  const validated = refreshTokenSchema.parse({ refreshToken });
  const res = await httpClient.post("/auth/refresh-token", validated);
  return res.data;
};

/**
 * Request password reset
 * Route: POST /api/auth/forgot-password
 * Access: Public
 */
export const forgotPassword = async (data: { email: string }) => {
  const validated = forgotPasswordSchema.parse(data);
  const res = await httpClient.post("/auth/forgot-password", validated);
  return res.data;
};

/**
 * Reset password using token
 * Route: POST /api/auth/reset-password
 * Access: Public
 */
export const resetPassword = async (data: {
  token: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const validated = resetPasswordSchema.parse(data);
  const res = await httpClient.post("/auth/reset-password", validated);
  return res.data;
};

/**
 * Change password (for authenticated users)
 * Route: POST /api/auth/change-password
 * Access: Private
 */
export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const validated = changePasswordSchema.parse(data);
  const res = await httpClient.post("/auth/change-password", validated);
  return res.data;
};

/**
 * Get current user's profile
 * Route: GET /api/auth/profile
 * Access: Private
 */
export const getProfile = async () => {
  const res = await httpClient.get("/auth/profile");
  return res.data;
};

/**
 * Update user profile
 * Route: PUT /api/auth/profile
 * Access: Private
 */
export const updateProfile = async (data: {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  departments?: string[];
}) => {
  const validated = updateProfileSchema.parse(data);
  const res = await httpClient.put("/auth/profile", validated);
  return res.data;
};

/* =======================================================
   TYPE DEFINITIONS
   ======================================================= */

export interface User {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  role: "admin" | "manager" | "team_member";
  departments: string[] | Department[];
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
  };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
  };
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    email: string;
    username: string;
    role: string;
    accessToken: string;
    refreshToken: string;
  };
}

export interface ResendOtpResponse {
  success: boolean;
  message: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: AuthTokens;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    email: string;
    username: string;
    role: string;
    accessToken: string;
    refreshToken: string;
    redirectTo: string; // e.g., "/dashboard"
  };
}

export interface CreateUserBySuperAdminResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    username: string;
    email: string;
    role: string;
    createdBy: string;
  };
}


export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}