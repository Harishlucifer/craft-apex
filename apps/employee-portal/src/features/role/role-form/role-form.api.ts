import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  LookupItem,
  RoleData,
  RoleEnvelope,
  RoleListItem,
} from "./role-form.types";

const URL_LOOKUP =
  "/alpha/v1/lookup?group_code=PARTNER_CATEGORY,USER_TYPE";
const URL_ROLES = "/alpha/v1/master/user-role";

/** Legacy AddRoleAndRights.getPartnerCategory — body is the array directly. */
export function useRoleFormLookups() {
  return useQuery({
    queryKey: ["role-lookups"],
    queryFn: async (): Promise<LookupItem[]> => {
      const body = await api.get<unknown, unknown>(URL_LOOKUP);
      if (Array.isArray(body)) return body as LookupItem[];
      const inner = (body as { data?: unknown })?.data;
      return Array.isArray(inner) ? (inner as LookupItem[]) : [];
    },
  });
}

/** All roles (for the parent-role dropdown). */
export function useAllRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async (): Promise<RoleListItem[]> => {
      const body = await api.get<unknown, unknown>(URL_ROLES);
      if (Array.isArray(body)) return body as RoleListItem[];
      const inner = (body as { data?: unknown })?.data;
      return Array.isArray(inner) ? (inner as RoleListItem[]) : [];
    },
  });
}

/** Legacy AddRoleAndRights.getRoleData — `?partnerCategory=` only for CHANNEL. */
export function useRoleDetail(
  id: string | undefined,
  partnerCategory: string | undefined,
  isChannel: boolean
) {
  const url = id
    ? `${URL_ROLES}/${id}${isChannel && partnerCategory ? `?partnerCategory=${partnerCategory}` : ""}`
    : "";
  return useQuery({
    queryKey: ["role-detail", id, isChannel ? partnerCategory : null],
    enabled: Boolean(id) && (!isChannel || Boolean(partnerCategory)),
    queryFn: async (): Promise<RoleData | null> => {
      const body = await api.get<unknown, RoleEnvelope>(url);
      return body?.result ?? null;
    },
  });
}
