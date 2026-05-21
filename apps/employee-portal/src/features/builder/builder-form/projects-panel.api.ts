import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  BankRow,
  ProjectRow,
  ProjectSavePayload,
  ProjectTypeLookupItem,
} from "./projects-panel.types";

const PROJECT_URL = "/alpha/v1/master/project";
const PROJECT_TYPE_LOOKUP =
  "/alpha/v1/lookup?group_code=COMMERCIAL_PROPERTY_TYPE,RESIDENTIAL_PROPERTY_TYPE,AGRI_PROPERTY_TYPE";
const BANK_LOOKUP_URL = "/alpha/v1/lookup/bank";

export function useProjectTypeLookups() {
  return useQuery({
    queryKey: [
      "lookup",
      "COMMERCIAL_PROPERTY_TYPE,RESIDENTIAL_PROPERTY_TYPE,AGRI_PROPERTY_TYPE",
    ],
    queryFn: async (): Promise<ProjectTypeLookupItem[]> => {
      const body = await api.get<unknown, any>(PROJECT_TYPE_LOOKUP);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as ProjectTypeLookupItem[]) : [];
    },
  });
}

export function useProjectsByDeveloper(
  developerId: string | number | undefined
) {
  return useQuery({
    queryKey: ["projects-by-developer", String(developerId ?? "")],
    enabled: Boolean(developerId),
    queryFn: async (): Promise<ProjectRow[]> => {
      const body = await api.get<unknown, any>(PROJECT_URL);
      const arr = body?.data ?? body?.result ?? body;
      const all = Array.isArray(arr) ? (arr as ProjectRow[]) : [];
      return all.filter(
        (p) =>
          String(p.developer_id) === String(developerId) && p.status === 1
      );
    },
  });
}

export function useSaveProject() {
  return useMutation({
    mutationFn: async (payload: ProjectSavePayload) =>
      api.post<unknown, any>(PROJECT_URL, payload),
  });
}

export async function searchBanks(name: string): Promise<BankRow[]> {
  const url = `${BANK_LOOKUP_URL}?bank_name=${encodeURIComponent(name)}&limit=10`;
  const body = await api.get<unknown, any>(url);
  const arr = body?.data ?? body?.result ?? body;
  return Array.isArray(arr) ? (arr as BankRow[]) : [];
}
