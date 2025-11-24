import { useQuery } from "@tanstack/react-query";
import { getAllUsers } from "@/config/api/searchApi";

/**
 * Custom hook for fetching user-related data
 */
export const useUserQueries = () => {
  const {
    data: usersData,
    isLoading: isUsersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["userList"],
    queryFn: getAllUsers,
  });

  return {
    usersData,
    isUsersLoading,
    usersError,
  };
};