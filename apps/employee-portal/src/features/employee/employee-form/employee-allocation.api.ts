import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  EmployeeAllocationRow,
  LookupRow,
  ParameterRow,
  RuleCreatePayload,
  RuleCreateResponse,
  RuleListRow,
  RuleParameters,
} from "./employee-allocation.types";

// --- Endpoint constants (verbatim from craft-frontend ApiEndPoint.js) ---
const EMPLOYEE_URL = "/alpha/v1/employee";
const RULE_DATA_URL = "/alpha/v1/rule";
const RULE_CREATE_URL = "/alpha/v1/rule/create";
const LOOKUP_MASTER_URL = "/alpha/v1/lookup";
const PARAMETERS_URL = "/alpha/v1/parameter";

/**
 * fetchAllocation(employee_id)
 * Legacy: GET EMPLOYEE_LIST + `/${employee_id}` -> response.data.result.user_allocation
 */
export function useEmployeeAllocation(employeeId: string | undefined) {
  return useQuery({
    queryKey: ["employee-allocation", employeeId ?? ""],
    enabled: Boolean(employeeId),
    queryFn: async (): Promise<EmployeeAllocationRow[]> => {
      const body = await api.get<unknown, any>(
        `${EMPLOYEE_URL}/${encodeURIComponent(employeeId!)}`
      );
      // Legacy: response.data.result.user_allocation
      const result = body?.data?.result ?? body?.result ?? body;
      const list = result?.user_allocation;
      return Array.isArray(list) ? (list as EmployeeAllocationRow[]) : [];
    },
  });
}

/**
 * getRuleList()
 * Legacy: GET RULE_DATA -> ruleResponse.data.data.map(rule => ({ label: rule.name, value: rule.id.toString() }))
 */
export function useRuleList() {
  return useQuery({
    queryKey: ["rule-list"],
    queryFn: async (): Promise<RuleListRow[]> => {
      const body = await api.get<unknown, any>(RULE_DATA_URL);
      const arr = body?.data?.data ?? body?.data ?? [];
      return Array.isArray(arr) ? (arr as RuleListRow[]) : [];
    },
  });
}

/**
 * getParameters()
 * Legacy: GET PARAMETERS -> response.data.data
 */
export function useParameters() {
  return useQuery({
    queryKey: ["rule-parameters"],
    queryFn: async (): Promise<ParameterRow[]> => {
      const body = await api.get<unknown, any>(PARAMETERS_URL);
      const arr = body?.data?.data ?? body?.data ?? [];
      return Array.isArray(arr) ? (arr as ParameterRow[]) : [];
    },
  });
}

/**
 * fetLookup(participantWorkflow)
 * Legacy: GET LOOKUP_MASTER + `?group_code=WORKFLOW_TYPE,${participantWorkflow}`
 * Returns the raw flat list; consumer filters by group_code (WORKFLOW_TYPE vs participantWorkflow).
 */
export async function fetchAllocationLookup(
  participantWorkflow: string
): Promise<LookupRow[]> {
  const qs = participantWorkflow
    ? `?group_code=WORKFLOW_TYPE,${participantWorkflow}`
    : `?group_code=WORKFLOW_TYPE`;
  const body = await api.get<unknown, any>(`${LOOKUP_MASTER_URL}${qs}`);
  const arr = body?.data?.data ?? body?.data ?? [];
  return Array.isArray(arr) ? (arr as LookupRow[]) : [];
}

/**
 * fetchRuleById(ruleId)
 * Legacy: GET RULE_DATA + `?id=${rule_id}` -> response.data.data[0]
 */
export async function fetchRuleById(
  ruleId: string | number
): Promise<RuleListRow | null> {
  const body = await api.get<unknown, any>(
    `${RULE_DATA_URL}?id=${encodeURIComponent(String(ruleId))}`
  );
  const arr = body?.data?.data ?? body?.data ?? [];
  return Array.isArray(arr) && arr.length > 0 ? (arr[0] as RuleListRow) : null;
}

/**
 * createRule(payload)
 * Legacy: POST RULE_CREATE -> response.data.data.rule_id
 */
export function useCreateRule() {
  return useMutation({
    mutationFn: async (
      payload: RuleCreatePayload
    ): Promise<RuleCreateResponse> => {
      const body = await api.post<unknown, any>(RULE_CREATE_URL, payload);
      return body as RuleCreateResponse;
    },
  });
}

// Re-exported for inline calls inside the step component (formik submit path
// in legacy creates two rules sequentially before saving the allocation row).
export async function createRule(
  payload: RuleCreatePayload
): Promise<RuleCreateResponse> {
  return (await api.post<unknown, any>(
    RULE_CREATE_URL,
    payload
  )) as RuleCreateResponse;
}

export type { RuleParameters };
