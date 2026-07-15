import { useQuery, useMutation, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { WorkflowComponentRow } from "./workflow-component-list.types";

const URL = "/alpha/v1/workflow/component";

export interface SaveWorkflowComponentPayload {
  id?: string | number;
  code: string;
  name: string;
  workflow_type: string;
  workflow_step_type: string;
  status: number;
}

export function useWorkflowComponentList() {
  return useQuery({
    queryKey: ["workflow-component-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<WorkflowComponentRow[]> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as WorkflowComponentRow[]) : [];
    },
  });
}

export function useSaveWorkflowComponent() {
  return useMutation({
    mutationFn: async (payload: SaveWorkflowComponentPayload) => {
      return api.post<unknown, any>("/alpha/v1/workflow/component", payload);
    },
  });
}

