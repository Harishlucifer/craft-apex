import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  VERIFICATION_TRANSFER_CODE,
  type FieldMasterEnvelope,
  type FieldMasterFormConfig,
  type FilterValues,
  type UserInfo,
  type VerificationExportResponse,
  type VerificationListEnvelope,
  type VerificationRow,
  type VerificationTransferPayload,
  type VerificationTransferResponse,
} from "./verification-transfer.types";

// Legacy ApiEndPoint.js:
//   GET_FIELD_MASTER_LIST       = /alpha/v1/master/field-master
//   USER_INFO                   = /alpha/v1/user/info
//   VERIFICATION_LIST           = /alpha/v1/verification/list
//   POST_VERIFICATION_TRANSFER  = /alpha/v1/verification/transfer
//   VERIFICATION_REPORT_DOWNLOAD = /alpha/v1/verification/export
const FIELD_MASTER_URL = "/alpha/v1/master/field-master";
const USER_INFO_URL = "/alpha/v1/user/info";
const VERIFICATION_LIST_URL = "/alpha/v1/verification/list";
const VERIFICATION_TRANSFER_URL = "/alpha/v1/verification/transfer";
const VERIFICATION_EXPORT_URL = "/alpha/v1/verification/export";

interface UserInfoEnvelope {
  data: UserInfo | null;
}

export function useUserInfo() {
  return useQuery({
    queryKey: ["user-info"],
    queryFn: async (): Promise<UserInfo | null> => {
      const body = await api.get<unknown, UserInfoEnvelope>(USER_INFO_URL);
      return body?.data ?? null;
    },
  });
}

/**
 * Fetch the VERIFICATION_TRANSFER field-master form config. Legacy:
 *   const res = await GetCall(`${FIELD_MASTER}?code=VERIFICATION_TRANSFER`);
 *   const fieldList = res.data.data[0].data[0];   // form_builder lives here
 */
export function useVerificationTransferForm() {
  return useQuery({
    queryKey: ["field-master", VERIFICATION_TRANSFER_CODE],
    queryFn: async (): Promise<FieldMasterFormConfig | null> => {
      const body = await api.get<unknown, FieldMasterEnvelope>(
        `${FIELD_MASTER_URL}?code=${encodeURIComponent(VERIFICATION_TRANSFER_CODE)}`
      );
      const outer = body?.data?.[0]?.data;
      if (!outer || outer.length === 0) return null;
      return outer[0] ?? null;
    },
  });
}

// Encode each value the same way legacy `objectToQueryString` does — including
// pipe-joining arrays and skipping null/undefined/empty.
export function buildFilterQueryString(values: FilterValues): string {
  const parts: string[] = [];
  for (const [k, raw] of Object.entries(values)) {
    if (raw === undefined || raw === null || raw === "") continue;
    let v: unknown = raw;
    if (Array.isArray(v)) {
      v = v.filter((x) => x !== undefined && x !== null && x !== "");
      if ((v as unknown[]).length === 0) continue;
      v = (v as unknown[]).join("|");
    }
    parts.push(
      `${encodeURIComponent(k)}=${encodeURIComponent(String(v)).replace(/%7C/g, "|")}`
    );
  }
  return parts.join("&");
}

export interface VerificationListParams {
  filterObj: FilterValues;
}

/**
 * Legacy `getVerificationList`:
 *   URL = VERIFICATION_LIST + `?download=true&self=${self}&employee_user_id=${from_employee_id}` +
 *         `&territory_id=${territory_id}&to_territory_id=${to_territory_id}&to_employee_id=${to_employee_id}` +
 *         `&${queryString}` (rest of the form values)
 */
export function fetchVerificationList(
  params: VerificationListParams
): Promise<VerificationRow[]> {
  const f = params.filterObj;
  const qs: string[] = [
    "download=true",
    `self=${encodeURIComponent(String(f.self ?? ""))}`,
    `employee_user_id=${encodeURIComponent(String(f.from_employee_id ?? ""))}`,
    `territory_id=${encodeURIComponent(String(f.territory_id ?? ""))}`,
    `to_territory_id=${encodeURIComponent(String(f.to_territory_id ?? ""))}`,
    `to_employee_id=${encodeURIComponent(String(f.to_employee_id ?? ""))}`,
  ];
  const restValues: FilterValues = { ...f };
  // Drop keys already in the leading params (legacy concatenates the form's
  // full query string after — duplicates are tolerated by the backend, but
  // we elide them for tidier URLs).
  delete restValues.self;
  delete restValues.from_employee_id;
  delete restValues.territory_id;
  delete restValues.to_territory_id;
  delete restValues.to_employee_id;
  const rest = buildFilterQueryString(restValues);
  if (rest) qs.push(rest);
  const url = `${VERIFICATION_LIST_URL}?${qs.join("&")}`;

  return api
    .get<unknown, VerificationListEnvelope>(url)
    .then((body) => body?.result ?? []);
}

export function useVerificationTransferMutation() {
  return useMutation({
    mutationFn: async (
      payload: VerificationTransferPayload
    ): Promise<VerificationTransferResponse> =>
      api.post<unknown, VerificationTransferResponse>(
        VERIFICATION_TRANSFER_URL,
        payload
      ),
  });
}

export function useVerificationExportMutation() {
  return useMutation({
    mutationFn: async (filterObj: FilterValues): Promise<VerificationExportResponse> => {
      const params: FilterValues = {
        ...filterObj,
        download: true as unknown as string,
      };
      const qs = buildFilterQueryString(params);
      const url = `${VERIFICATION_EXPORT_URL}?${qs}`;
      // Legacy calls axios.post with no body — preserve verbatim.
      return api.post<unknown, VerificationExportResponse>(url, {});
    },
  });
}
