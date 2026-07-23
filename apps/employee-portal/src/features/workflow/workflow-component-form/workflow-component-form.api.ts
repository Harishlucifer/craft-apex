import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { WorkflowComponentDetail } from "./workflow-component-form.types";

const URL = "/alpha/v1/workflow/component";

export function useWorkflowComponentDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["workflow-component-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<WorkflowComponentDetail | null> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.data ?? body?.result ?? body;
      const list: WorkflowComponentDetail[] = Array.isArray(arr) ? arr : [];
      return list.find((r) => String(r.id) === String(id)) ?? null;
    },
  });
}
