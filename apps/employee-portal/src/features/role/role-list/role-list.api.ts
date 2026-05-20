import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Role } from "./role-list.types";

// Legacy: axios.get(`${API_URL}/alpha/v1/master/user-role`) -> Role[]
const URL = "/alpha/v1/master/user-role";

async function getRoles(): Promise<Role[]> {
  const body = await api.get<unknown, unknown>(URL);
  // Defensive: legacy reads response.data directly as an array; tolerate an
  // envelope { data: Role[] } in case a tenant returns one.
  if (Array.isArray(body)) return body as Role[];
  const inner = (body as { data?: unknown })?.data;
  return Array.isArray(inner) ? (inner as Role[]) : [];
}

export function useRoleList() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
    placeholderData: keepPreviousData,
  });
}
