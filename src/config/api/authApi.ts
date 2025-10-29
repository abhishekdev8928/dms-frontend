import api from "../axios";

/**
 * @desc Register user
 * @body { username, email, password, role?, departments? }
 */
export const registerUser = async (data: {
  username: string;
  email: string;
  password: string;
  role?: string;
  departments?: string[];
}) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

/**
 * @desc Verify OTP
 * @body { email, otp }
 */
export const verifyOtp = async (data: { userId: string; otp: string }) => {
  const res = await api.post("/auth/verify-otp", data);
  return res.data;
};

/**
 * @desc Resend OTP
 * @body { email }
 */
export const resendOtp = async (data: { email: string }) => {
  const res = await api.post("/auth/resend-otp", data);
  return res.data;
};

/**
 * @desc Login user
 * @body { email, password }
 */
export const loginUser = async (data: { email: string; password: string }) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

/**
 * @desc Logout user (requires token)
 * @headers Authorization: Bearer token
 */
export const logoutUser = async () => {
  const res = await api.post(
    "/auth/logout",
  );
  return res.data;
};

/**
 * @desc Refresh access token
 * @body { refreshToken }
 */
export const refreshToken = async (data: { refreshToken: string }) => {
  const res = await api.post("/auth/refresh-token", data);
  return res.data;
};

/**
 * @desc Forgot password
 * @body { email }
 */
export const forgotPassword = async (data: { email: string }) => {
  const res = await api.post("/auth/forgot-password", data);
  return res.data;
};

/**
 * @desc Reset password
 * @query token
 * @body { newPassword }
 */
export const resetPassword = async (
  { token, newPassword }: { token: string; newPassword: string } // Accepting an object with token and newPassword
) => {
  // Log the token to the console for debugging
  console.log(token);

  // Make the API request to reset the password
  const res = await api.post(`/auth/reset-password`, {
    token,       // Pass the token to the request body
    newPassword, // Pass the newPassword to the request body
  });

  // Return the response data (success/failure message, etc.)
  return res.data;
};


/**
 * @desc Get current user profile
 * @headers Authorization: Bearer token
 */
export const getProfile = async (token: string) => {
  const res = await api.get("/auth/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
