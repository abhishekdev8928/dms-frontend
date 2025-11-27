import { z } from "zod";

// ============================================================================
// COMMON VALIDATORS
// ============================================================================

const emailValidator = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email format")
  .max(255, "Email too long")
  .toLowerCase()
  .trim();

const passwordValidator = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  );

const usernameValidator = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username cannot exceed 30 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, hyphens, and underscores"
  )
  .trim();

const otpValidator = z
  .string()
  .length(6, "OTP must be exactly 6 digits")
  .regex(/^\d{6}$/, "OTP must contain only numbers");

const userIdValidator = z
  .string()
  .min(1, "User ID is required")
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID format");

const tokenValidator = z
  .string()
  .min(1, "Token is required")
  .max(500, "Token too long");




const departmentIdValidator = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid department ID format");

// ============================================================================
// LOGIN SCHEMA
// ============================================================================

export const loginSchema = z.object({
  email: emailValidator,
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ============================================================================
// VERIFY OTP SCHEMA
// ============================================================================

export const verifyOtpSchema = z.object({
  userId: userIdValidator,
  otp: otpValidator,
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;


export const superAdminCreateUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username must not exceed 30 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["super_admin", "admin", "department_owner", "member_bank", "user"]),
  departments: z.array(z.string()).optional(),
});

export type SuperAdminCreateUserInput = z.infer<typeof superAdminCreateUserSchema>;


// ============================================================================
// RESEND OTP SCHEMA
// ============================================================================

export const resendOtpSchema = z.object({
  email: emailValidator,
});

export type ResendOtpInput = z.infer<typeof resendOtpSchema>;

// ============================================================================
// FORGOT PASSWORD SCHEMA
// ============================================================================

export const forgotPasswordSchema = z.object({
  email: emailValidator,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// ============================================================================
// RESET PASSWORD SCHEMA
// ============================================================================

export const resetPasswordSchema = z.object({
  token: tokenValidator,
  newPassword: passwordValidator,
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ============================================================================
// REFRESH TOKEN SCHEMA
// ============================================================================

export const refreshTokenSchema = z.object({
  refreshToken: tokenValidator,
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

// ============================================================================
// LOGOUT SCHEMA
// ============================================================================

export const logoutSchema = z.object({
  refreshToken: tokenValidator.optional(),
});

export type LogoutInput = z.infer<typeof logoutSchema>;

// ============================================================================
// CHANGE PASSWORD SCHEMA (for authenticated users)
// ============================================================================

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordValidator,
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ============================================================================
// UPDATE PROFILE SCHEMA
// ============================================================================

export const updateProfileSchema = z.object({
  username: usernameValidator.optional(),
  email: emailValidator.optional(),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Invalid characters in first name")
    .trim()
    .optional(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Invalid characters in last name")
    .trim()
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone number format")
    .optional(),
  bio: z
    .string()
    .max(500, "Bio cannot exceed 500 characters")
    .trim()
    .optional(),
  departments: z
    .array(departmentIdValidator)
    .max(10, "Maximum 10 departments allowed")
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate data against a schema and return sanitized result
 */
export function validateAuthData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.issues.map((err) => err.message);
  return { success: false, errors };
}

/**
 * Get error message for a specific field
 */
export function getFieldError(
  errors: z.ZodError | undefined,
  fieldName: string
): string | undefined {
  if (!errors) return undefined;
  
  const fieldError = errors.issues.find((err) => {
    return err.path.join(".") === fieldName;
  });
  
  return fieldError?.message;
}