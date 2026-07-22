import { useQuery, useMutation, keepPreviousData } from "@tanstack/react-query";
import { getApiClient } from "@craft-apex/api";
import type {
  ChildPartnerListResponse,
  ChannelOption,
  ChannelRoleOption,
  RMEmployeeOption,
  SupervisorOption,
  TerritoryOption,
  PincodeOption,
} from "./child-partner-list.types";

// Thin wrapper so every hook gets the registered axios instance without
// importing the portal-specific @/lib/api — the portal calls setApiClient()
// at startup which populates this registry.
function api() {
  return getApiClient();
}

// 1. Fetch Child Partner list
export function useChildPartnerList(params: {
  page: number;
  size: number;
  status?: string;
  isUserTerritoryWise?: string;
  keyword?: string;
  excludeRoleCode?: string;
  rm_id?: string;
  channel_id?: string;
}) {
  const queryParams = new URLSearchParams();
  queryParams.set("page", String(params.page));
  queryParams.set("size", String(params.size));
  if (params.status) queryParams.set("status", params.status);
  if (params.isUserTerritoryWise) queryParams.set("isUserTerritoryWise", params.isUserTerritoryWise);
  if (params.keyword?.trim()) queryParams.set("keyword", params.keyword.trim());
  if (params.excludeRoleCode) queryParams.set("excludeRoleCode", params.excludeRoleCode);
  if (params.rm_id) queryParams.set("rm_id", params.rm_id);
  if (params.channel_id) queryParams.set("channel_id", params.channel_id);

  return useQuery({
    queryKey: ["child-partner-list", params],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<ChildPartnerListResponse> =>
      api().get<unknown, ChildPartnerListResponse>(
        `/alpha/v1/channel/channel-user?${queryParams.toString()}`
      ),
  });
}

// 2. Fetch Child Partner approval list (status=2, waiting for RM approval)
export function useChildPartnerApprovalList(params: {
  page: number;
  size: number;
  keyword?: string;
  excludeRoleCode?: string;
}) {
  const queryParams = new URLSearchParams();
  queryParams.set("status", "2");
  queryParams.set("isUserTerritoryWise", "true");
  queryParams.set("page", String(params.page));
  queryParams.set("size", String(params.size));
  if (params.keyword?.trim()) queryParams.set("keyword", params.keyword.trim());
  if (params.excludeRoleCode) queryParams.set("excludeRoleCode", params.excludeRoleCode);

  return useQuery({
    queryKey: ["child-partner-approval-list", params],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<ChildPartnerListResponse> =>
      api().get<unknown, ChildPartnerListResponse>(
        `/alpha/v1/channel/channel-user?${queryParams.toString()}`
      ),
  });
}

// 3. Fetch Channel list for dropdown
export function useChannelList(params: {
  status: string;
  ignoreSubordinates: string;
  partner_category?: string;
}) {
  const queryParams = new URLSearchParams();
  queryParams.set("status", params.status);
  queryParams.set("ignoreSubordinates", params.ignoreSubordinates);
  if (params.partner_category) {
    queryParams.set("partner_category", params.partner_category);
  }

  return useQuery({
    queryKey: ["channel-list-options", params],
    queryFn: async (): Promise<any> =>
      api().get<unknown, any>(`/alpha/v1/channel?${queryParams.toString()}`),
  });
}

// 4. Fetch Channel roles
export function useChannelRoles() {
  return useQuery({
    queryKey: ["channel-roles"],
    queryFn: async (): Promise<ChannelRoleOption[]> =>
      api().get<unknown, ChannelRoleOption[]>("/alpha/v1/master/user-role?user_type=CHANNEL"),
  });
}

// 5. Fetch RM Employees
export function useRMEmployees(roleCode?: string) {
  const queryParams = new URLSearchParams();
  queryParams.set("ignore_subordinates", "true");
  if (roleCode) {
    queryParams.set("role_code", roleCode);
  }

  return useQuery({
    queryKey: ["rm-employees", roleCode],
    queryFn: async (): Promise<any> =>
      api().get<unknown, any>(`/alpha/v1/employee?${queryParams.toString()}`),
  });
}

// 6. Fetch Supervisor Users based on role and channel
export function useSupervisorUsers(roleId?: string, channelId?: string) {
  return useQuery({
    queryKey: ["supervisor-users", roleId, channelId],
    enabled: !!roleId && !!channelId,
    queryFn: async (): Promise<SupervisorOption[]> =>
      api().get<unknown, SupervisorOption[]>(
        `/alpha/v1/channel/channel-user?filterSuperiorRole=${roleId}&channelId=${channelId}`
      ),
  });
}

// 7. Fetch Territories of selected RM User
export function useRMLeastTerritories(rmUserId?: number) {
  return useQuery({
    queryKey: ["rm-territories", rmUserId],
    enabled: !!rmUserId,
    queryFn: async (): Promise<any> =>
      api().get<unknown, any>(`/alpha/v1/user/least/territory?user_id=${rmUserId}`),
  });
}

// 8. Pincode suggest queries
export function usePincodeSuggest(pincode: string) {
  return useQuery({
    queryKey: ["pincode-suggest", pincode],
    enabled: pincode.length >= 3,
    queryFn: async (): Promise<PincodeOption[]> =>
      api().get<unknown, PincodeOption[]>(
        `/alpha/v1/master/pin-code/suggest?pincode=${pincode}`
      ),
  });
}

// 9. Fetch Pincode full details
export function usePincodeDetails(pincode?: string) {
  return useQuery({
    queryKey: ["pincode-details", pincode],
    enabled: !!pincode,
    queryFn: async (): Promise<PincodeOption[]> =>
      api().get<unknown, PincodeOption[]>(
        `/alpha/v1/master/pin-code?pincode=${pincode}`
      ),
  });
}

// 10. Save/Update Channel User mutation
export function useCreateOrUpdateChannelUser() {
  return useMutation({
    mutationFn: async (
      data: Record<string, unknown>
    ): Promise<{ status: number; result?: { channel_user_id: string } }> =>
      api().post<unknown, { status: number; result?: { channel_user_id: string } }>(
        "/alpha/v1/channel/channel-user",
        data
      ),
  });
}

// 11. Fetch uploaded documents
export function useUploadedDocuments(channelUserId?: string) {
  return useQuery({
    queryKey: ["uploaded-documents", channelUserId],
    enabled: !!channelUserId,
    queryFn: async (): Promise<any> =>
      api().get<unknown, any>(
        `/alpha/v1/onboarding/documents?channel_user_id=${channelUserId}`
      ),
  });
}

// 12. Upload Document file mutation
export function useUploadDocument() {
  return useMutation({
    mutationFn: async ({
      channelUserId,
      documentId,
      file,
      password,
    }: {
      channelUserId: string;
      documentId: string;
      file: File;
      password?: string;
    }): Promise<void> => {
      const formData = new FormData();
      formData.append("channel_user_id", channelUserId);
      formData.append("document_id", documentId);
      formData.append("document", file);
      if (password) {
        formData.append("password", password);
      }
      await api().post("/alpha/v1/onboarding/document", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
  });
}
