import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Legacy: GET /alpha/v1/lookup?group_code=OPERATORS  -> data.data
const OPERATORS_URL = "/alpha/v1/lookup?group_code=OPERATORS";
// Legacy: GET /alpha/v1/lookup?group_code=<key>      -> data.data (defaults to RULE_OUTPUT_PARAMETERS).
const OUTPUT_LOOKUP_BASE = "/alpha/v1/lookup?group_code=";
// Legacy: POST /alpha/v1/parameter/reference        -> data.data (rows for REFERENCE_MASTER value lists)
const REFERENCE_TABLE_URL = "/alpha/v1/parameter/reference";

export interface OperatorOption {
  label: string;
  value: string;
}

export function useOperators() {
  return useQuery({
    queryKey: ["lookup", "OPERATORS"],
    queryFn: async (): Promise<OperatorOption[]> => {
      const body = await api.get<unknown, any>(OPERATORS_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr)
        ? (arr as Array<{ lu_key: string; lu_name: string }>).map((o) => ({
            label: o.lu_name,
            value: o.lu_key,
          }))
        : [];
    },
  });
}

export function useOutputKeys(outputType?: string) {
  const group = outputType && outputType !== "" ? outputType : "RULE_OUTPUT_PARAMETERS";
  return useQuery({
    queryKey: ["lookup", group],
    queryFn: async (): Promise<OperatorOption[]> => {
      const body = await api.get<unknown, any>(`${OUTPUT_LOOKUP_BASE}${group}`);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr)
        ? (arr as Array<{ lu_key: string; lu_name: string }>).map((o) => ({
            label: o.lu_name,
            value: o.lu_key,
          }))
        : [];
    },
  });
}

export interface ReferenceParams {
  table: string;
  label: string;
  column: string;
  condition?: string;
}

export interface ReferenceOption {
  label: string;
  value: string;
}

export async function fetchReferenceOptions(
  params: ReferenceParams
): Promise<ReferenceOption[]> {
  const body = await api.post<unknown, any>(REFERENCE_TABLE_URL, params);
  const arr = body?.data ?? body?.result ?? body;
  return Array.isArray(arr)
    ? (arr as Array<{ label: string; value: string | number }>).map((r) => ({
        label: r.label,
        value: String(r.value),
      }))
    : [];
}
