// src/hooks/auth/useAuthMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { toast } from 'sonner'; // or your toast library
import {
  loginUser,
  verifyOtp,
  resendOtp,
  logoutUser,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
} from '@/config/api/authApi';
import { useAuthStore } from '@/config/store/authStore';
import { authKeys } from '../queries/useAuthQueries';
import type {
  LoginResponse,
  VerifyOtpResponse,
  ResendOtpResponse,
  LogoutResponse,
  RefreshTokenResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  ChangePasswordResponse,
  UpdateProfileResponse,
} from '@/config/api/authApi';

/**
 * Hook for user login
 */
export const useLogin = () => {
  const navigate = useNavigate();
  const setUnverifiedUser = useAuthStore((state) => state.setUnverifiedUser);

  return useMutation<LoginResponse, Error, { email: string; password: string }>({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Set unverified user state
      setUnverifiedUser(data.data.userId);
      
      toast.success(data.message);
      // Navigate to OTP verification page
      navigate(`/auth/verify-otp?userId=${data.data.userId}`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
    },
  });
};

/**
 * Hook for OTP verification
 */
export const useVerifyOtp = () => {
  const navigate = useNavigate();
  const setAuthenticatedUser = useAuthStore((state) => state.setAuthenticatedUser);

  return useMutation<VerifyOtpResponse, Error, { userId: string; otp: string }>({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      // Set authenticated user (tokens are stored in cookies via the store)
      setAuthenticatedUser({
        userId: data.data.userId,
        email: data.data.email,
        username: data.data.username,
        role: data.data.role,
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      });

      toast.success(data.message);
      navigate('/dashboard');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'OTP verification failed';
      toast.error(message);
    },
  });
};

/**
 * Hook for resending OTP
 */
export const useResendOtp = () => {
  return useMutation<ResendOtpResponse, Error, { email: string }>({
    mutationFn: resendOtp,
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to resend OTP';
      toast.error(message);
    },
  });
};

/**
 * Hook for user logout
 */
export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  const getRefreshToken = useAuthStore((state) => state.getRefreshToken);

  return useMutation<LogoutResponse, Error, void>({
    mutationFn: async () => {
      const refreshToken = getRefreshToken();
      return await logoutUser(refreshToken || undefined);
    },
    onSuccess: (data) => {
      // Clear auth store (this also removes cookies)
      logout();

      // Clear all queries
      queryClient.clear();

      toast.success(data.message);
      navigate('/auth/login');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Logout failed';
      toast.error(message);
      
      // Even on error, clear local auth state
      logout();
      queryClient.clear();
      navigate('/auth/login');
    },
  });
};

/**
 * Hook for refreshing access token
 */
export const useRefreshToken = () => {
  const updateTokens = useAuthStore((state) => state.updateTokens);
  const logout = useAuthStore((state) => state.logout);

  return useMutation<RefreshTokenResponse, Error, string>({
    mutationFn: refreshAccessToken,
    onSuccess: (data) => {
      // Update tokens in store (will update cookies)
      updateTokens({
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      });
    },
    onError: (error: any) => {
      console.error('Token refresh failed:', error);
      // Logout and redirect on refresh failure
      logout();
      window.location.href = '/auth/login';
    },
  });
};

/**
 * Hook for forgot password
 */
export const useForgotPassword = () => {
  return useMutation<ForgotPasswordResponse, Error, { email: string }>({
    mutationFn: forgotPassword,
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to send reset email';
      toast.error(message);
    },
  });
};

/**
 * Hook for resetting password with auto-login
 * Updated to handle direct login after password reset
 */
export const useResetPassword = () => {
  const navigate = useNavigate();
  const setAuthenticatedUser = useAuthStore((state) => state.setAuthenticatedUser);

  return useMutation<
    ResetPasswordResponse,
    Error,
    { token: string; newPassword: string; confirmPassword: string }
  >({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      // Auto-login: Set authenticated user with tokens from response
      setAuthenticatedUser({
        userId: data.data.userId,
        email: data.data.email,
        username: data.data.username,
        role: data.data.role,
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      });
      
      toast.success(data.message);
      
      // Navigate to dashboard or use redirectTo from response
      const redirectPath = data.data.redirectTo || '/dashboard';
      navigate(redirectPath);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Password reset failed';
      toast.error(message);
    },
  });
};

/**
 * Hook for changing password (authenticated users)
 */
export const useChangePassword = () => {
  return useMutation<
    ChangePasswordResponse,
    Error,
    { currentPassword: string; newPassword: string; confirmPassword: string }
  >({
    mutationFn: changePassword,
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
    },
  });
};

/**
 * Hook for updating user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateProfileResponse,
    Error,
    {
      username?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      bio?: string;
      departments?: string[];
    }
  >({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Invalidate profile query to refetch
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
      
      toast.success(data.message);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
    },
  });
};