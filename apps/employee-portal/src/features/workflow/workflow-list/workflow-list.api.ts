import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { WorkflowRow } from "./workflow-list.types";

// Legacy: axios.get(/alpha/v1/workflow); body is the array directly.
const URL = "/alpha/v1/workflow";

export function useWorkflowList() {
  return useQuery({
    queryKey: ["workflow-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<WorkflowRow[]> => {
      const body = await api.get<unknown, unknown>(URL);
      if (Array.isArray(body)) return body as WorkflowRow[];
      const inner =
        (body as { data?: unknown; result?: unknown })?.data ??
        (body as { result?: unknown })?.result;
      return Array.isArray(inner) ? (inner as WorkflowRow[]) : [];
    },
  });
}
