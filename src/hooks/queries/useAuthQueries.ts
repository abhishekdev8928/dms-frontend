// src/hooks/auth/useAuthQueries.ts
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/config/api/authApi';
import type { ProfileResponse } from '@/config/api/authApi';

/**
 * Query Keys for Authentication
 */
export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
};

/**
 * Hook to fetch current user's profile
 * @returns Query result with user profile data
 */
export const useGetProfile = () => {
  return useQuery<ProfileResponse>({
    queryKey: authKeys.profile(),
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000, 
    retry: 1,
    refetchOnWindowFocus: false,
  });
};