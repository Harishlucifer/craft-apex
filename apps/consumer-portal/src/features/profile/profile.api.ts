import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { UserInfo } from "./profile.types";

// Verified in app/routes/v1.go:131 — see .types.ts for the middleware note.
const USER_INFO_URL = "/alpha/v1/user/info";

interface UserInfoResponse {
  data?: UserInfo;
  result?: UserInfo;
}

export function useUserInfo() {
  return useQuery({
    queryKey: ["consumer-user-info"],
    queryFn: async (): Promise<UserInfo> => {
      const body = await api.get<unknown, UserInfoResponse>(USER_INFO_URL);
      return (body?.data ?? body?.result ?? body ?? {}) as UserInfo;
    },
  });
}
