import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import Cookies from "js-cookie";

/* =======================================================
   COOKIE UTILITIES
   ======================================================= */

const COOKIE_OPTIONS = {
  secure: import.meta.env.PROD, // HTTPS only in production
  sameSite: "strict" as const, // CSRF protection
  path: "/",
};

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

// Set tokens in cookies
const setTokensInCookies = (accessToken: string, refreshToken: string) => {
  // Access token expires in 15 minutes
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
    ...COOKIE_OPTIONS,
    expires: 6, // 15 minutes (1/96 of a day)
  });

  // Refresh token expires in 7 days
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
    ...COOKIE_OPTIONS,
    expires: 7, // 7 days
  });
};

// Get tokens from cookies
const getTokensFromCookies = () => {
  return {
    accessToken: Cookies.get(ACCESS_TOKEN_KEY) || null,
    refreshToken: Cookies.get(REFRESH_TOKEN_KEY) || null,
  };
};

// Remove tokens from cookies
const removeTokensFromCookies = () => {
  Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
};

/* =======================================================
   TYPE DEFINITIONS
   ======================================================= */

interface User {
  userId: string;
  email: string;
  username?: string;
  role?: string;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isVerified: boolean;

  // Actions
  setUnverifiedUser: (userId: string) => void;
  setAuthenticatedUser: (data: {
    userId: string;
    email: string;
    username?: string;
    role?: string;
    accessToken: string;
    refreshToken: string;
  }) => void;
  updateTokens: (tokens: Tokens) => void;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  logout: () => void;
  hydrateFromCookies: () => void;
}

/* =======================================================
   INITIAL STATE
   ======================================================= */

const initialState = {
  user: null,
  isAuthenticated: false,
  isVerified: false,
};

/* =======================================================
   AUTH STORE
   ======================================================= */

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        /**
         * Set unverified user (after login, before OTP verification)
         */
        setUnverifiedUser: (userId: string) => {
          // Clear any existing tokens
          removeTokensFromCookies();

          set(
            {
              user: { userId, email: "" },
              isAuthenticated: false,
              isVerified: false,
            },
            undefined,
            "auth/setUnverifiedUser"
          );
        },

        /**
         * Set authenticated user (after OTP verification)
         */
        setAuthenticatedUser: ({
          userId,
          email,
          username,
          role,
          accessToken,
          refreshToken,
        }) => {
          // Store tokens in httpOnly-like cookies
          setTokensInCookies(accessToken, refreshToken);

          set(
            {
              user: { userId, email, username, role },
              isAuthenticated: true,
              isVerified: true,
            },
            undefined,
            "auth/setAuthenticatedUser"
          );
        },

        /**
         * Update tokens (for token refresh)
         */
        updateTokens: ({ accessToken, refreshToken }: Tokens) => {
          setTokensInCookies(accessToken, refreshToken);

          set(
            (state) => ({
              user: state.user,
              isAuthenticated: state.isAuthenticated,
              isVerified: state.isVerified,
            }),
            undefined,
            "auth/updateTokens"
          );
        },

        /**
         * Get access token from cookies
         */
        getAccessToken: () => {
          return Cookies.get(ACCESS_TOKEN_KEY) || null;
        },

        /**
         * Get refresh token from cookies
         */
        getRefreshToken: () => {
          return Cookies.get(REFRESH_TOKEN_KEY) || null;
        },

        /**
         * Logout - clear all auth data
         */
        logout: () => {
          removeTokensFromCookies();

          set(initialState, undefined, "auth/logout");
        },

        /**
         * Hydrate auth state from cookies on app load
         */
        hydrateFromCookies: () => {
          const { accessToken, refreshToken } = getTokensFromCookies();

          // If tokens exist, mark as authenticated
          if (accessToken && refreshToken) {
            set(
              (state) => ({
                ...state,
                isAuthenticated: true,
                isVerified: true,
              }),
              undefined,
              "auth/hydrateFromCookies"
            );
          }
        },
      }),
      {
        name: "auth-storage",
        // Only persist user info, not tokens (tokens are in cookies)
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          isVerified: state.isVerified,
        }),
      }
    ),
    {
      name: "AuthStore",
      enabled: import.meta.env.DEV,
    }
  )
);

/* =======================================================
   SELECTORS
   ======================================================= */

export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) =>
  state.isAuthenticated;
export const selectIsVerified = (state: AuthState) => state.isVerified;
export const selectAccessToken = () => Cookies.get(ACCESS_TOKEN_KEY) || null;
export const selectRefreshToken = () => Cookies.get(REFRESH_TOKEN_KEY) || null;

/* =======================================================
   HOOKS
   ======================================================= */

/**
 * Hook to get current user
 */
export const useUser = () => useAuthStore(selectUser);

/**
 * Hook to check authentication status
 */
export const useIsAuthenticated = () => useAuthStore(selectIsAuthenticated);

/**
 * Hook to check verification status
 */
export const useIsVerified = () => useAuthStore(selectIsVerified);

/**
 * Hook to get auth actions
 */
export const useAuthActions = () => {
  const store = useAuthStore();
  return {
    setUnverifiedUser: store.setUnverifiedUser,
    setAuthenticatedUser: store.setAuthenticatedUser,
    updateTokens: store.updateTokens,
    logout: store.logout,
    hydrateFromCookies: store.hydrateFromCookies,
  };
};