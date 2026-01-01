// hooks/queries/useStarredQueries.ts

import httpClient from "@/config/httpClient";
import type { IStarredResponse } from "@/types/starredTypes";
import { useQuery } from "@tanstack/react-query";

export const useQueryStarredItems = () => {
  return useQuery<IStarredResponse>({
    queryKey: ["starred-items"],
    queryFn: async () => {
      const { data } = await httpClient.get<IStarredResponse>("/starred");
      return data;
    },
  });
};
