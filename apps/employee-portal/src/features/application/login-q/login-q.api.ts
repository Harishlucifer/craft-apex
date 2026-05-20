import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LoginQResponse } from "./login-q.types";

// Legacy: `/alpha/v1/application?login_q=true&page=${page}&${queryString}`
// where queryString flattens an optional filter object. Filters UI is not yet
// ported, so only the verified base params are sent.
async function getLoginQ(page: number): Promise<LoginQResponse> {
  return api.get<unknown, LoginQResponse>(
    `/alpha/v1/application?login_q=true&page=${page}`
  );
}

export function useLoginQ(page: number) {
  return useQuery({
    queryKey: ["login-q", page],
    queryFn: () => getLoginQ(page),
    placeholderData: keepPreviousData,
  });
}
