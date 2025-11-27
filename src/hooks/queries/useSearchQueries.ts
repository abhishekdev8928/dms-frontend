import { useAppConfigStore } from "@/config/store/useAppConfigStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getAllUsers } from "@/config/api/searchApi"; // Import your API helper



export const useUsers = () => {
  const setUserList = useAppConfigStore((state) => state.setUserList);

  const query = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  console.log("from layout" , query.data)

  // Sync fetched data to Zustand store
  useEffect(() => {
    if (query.data) {
        console.log("from effect" , query.data.data);
      setUserList(query.data.data);
    }
  }, [query.data, setUserList]);

  return query;
};