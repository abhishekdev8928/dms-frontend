import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface User {
  userId: string;
  email: string;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  // State
  user: User | null;
  tokens: Tokens | null;
  isAuthenticated: boolean;
  isVerified: boolean;

  // Actions
  setUnverifiedUser: (userId: string) => void;
  setAuthenticatedUser: (data: {
    userId: string;
    email: string;
    accessToken: string;
    refreshToken: string;
  }) => void;
  updateTokens: (tokens: Tokens) => void;
  logout: () => void;
}

const initialState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isVerified: false,
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // Called after login - stores userId before OTP verification
        setUnverifiedUser: (userId: string) =>
          set(
            {
              user: { userId, email: "" },
              tokens: null,
              isAuthenticated: false,
              isVerified: false,
            },
            undefined,
            "auth/setUnverifiedUser"
          ),

        // Called after OTP verification - stores complete auth data
        setAuthenticatedUser: ({ userId, email, accessToken, refreshToken }) =>
          set(
            {
              user: { userId, email },
              tokens: { accessToken, refreshToken },
              isAuthenticated: true,
              isVerified: true,
            },
            undefined, // ✅ Changed from false to undefined
            "auth/setAuthenticatedUser"
          ),

        // Update tokens (useful for token refresh)
        updateTokens: (tokens: Tokens) =>
          set(
            (state) => ({
              tokens,
              user: state.user,
              isAuthenticated: state.isAuthenticated,
              isVerified: state.isVerified,
            }),
            undefined, // ✅ Changed from false to undefined
            "auth/updateTokens"
          ),

        // Clear all auth data
        logout: () =>
          set(
            initialState,
            undefined, // ✅ Changed from false to undefined
            "auth/logout"
          ),
      }),
      {
        name: "auth-storage",
        // getStorage: () => localStorage,
      }
    ),
    { 
      name: "AuthStore", // ✅ DevTools display name
      enabled: true // ✅ Ensure DevTools is enabled
    }
  )
);

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectTokens = (state: AuthState) => state.tokens;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectAccessToken = (state: AuthState) => state.tokens?.accessToken;