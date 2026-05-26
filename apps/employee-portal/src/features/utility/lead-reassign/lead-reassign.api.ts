import { useMutation, useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  Id,
  LeadTransferPayload,
  LeadTransferResponse,
  ReassignListResponse,
  TerritoryLoanTypeResponse,
} from "./lead-reassign.types";

// Legacy: const { reassignStatus } = require("...constants/constant")
//   ApplicationStatusCreated:1, ApplicationStatusPendingWithProcess:2, ApplicationStatusPendingWithBank:4
const REASSIGN_STATUS = "1|2|4";

// Legacy: APIENDPOINTS.APPLICATION_LIST = `${API_BASE_URL}/alpha/v1/application`
const APPLICATION_LIST_URL = "/alpha/v1/application";
const TERRITORY_LOAN_TYPE_URL = "/alpha/v1/employee/territory-loantype";
const LEAD_TRANSFER_URL = "/alpha/v1/application/lead-transfer";

// GET /alpha/v1/employee/territory-loantype -> { result: [...] }
export function useTerritoryLoanType() {
  return useQuery({
    queryKey: ["employee-territory-loantype"],
    queryFn: async (): Promise<TerritoryLoanTypeResponse> =>
      api.get<unknown, TerritoryLoanTypeResponse>(TERRITORY_LOAN_TYPE_URL),
  });
}

export interface ReassignListParams {
  user_id: Id;
  territory_id: Id;
  loanType_id: Id;
  page: number;
  keyword?: string;
}

function buildReassignListUrl(p: ReassignListParams): string {
  // Exact param order + names from legacy Utilityreassign.js:
  //   ?page=N&ignore_subordinates=true&employee_user_id=X
  //   &territory=Y&loan_type=Z&status=1|2|4 [&keyword=...]
  let url =
    `${APPLICATION_LIST_URL}?page=${p.page}` +
    `&ignore_subordinates=true` +
    `&employee_user_id=${p.user_id}` +
    `&territory=${p.territory_id}` +
    `&loan_type=${p.loanType_id}` +
    `&status=${REASSIGN_STATUS}`;
  if (p.keyword) url += `&keyword=${encodeURIComponent(p.keyword)}`;
  return url;
}

export function useReassignLeadList(params: ReassignListParams | null) {
  return useQuery({
    queryKey: [
      "reassign-lead-list",
      params?.user_id,
      params?.territory_id,
      params?.loanType_id,
      params?.page,
      params?.keyword ?? "",
    ],
    enabled: params != null,
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<ReassignListResponse> =>
      api.get<unknown, ReassignListResponse>(buildReassignListUrl(params!)),
  });
}

// POST /alpha/v1/application/lead-transfer -> { status: 1 } on success
export function useLeadTransfer() {
  return useMutation({
    mutationFn: async (
      payload: LeadTransferPayload
    ): Promise<LeadTransferResponse> =>
      api.post<unknown, LeadTransferResponse>(LEAD_TRANSFER_URL, payload),
  });
}
