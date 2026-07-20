import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface BulkUploadRow {
  id: string | number;
  file_name: string;
  status_string?: string;
  created_at: string;
}

export interface JourneyTypeOption {
  code: string;
  name: string;
}

// ─── Queries & Mutations ──────────────────────────────────────────────────────

export function useJourneyTypes() {
  return useQuery({
    queryKey: ["partner-bulk-upload", "journey-types"],
    queryFn: async (): Promise<JourneyTypeOption[]> => {
      const res = await api.get<unknown, any>(
        "/alpha/v1/master/journey-type?workflow_type=PARTNER_ONBOARDING"
      );
      const data = res?.data ?? res;
      if (data?.status && Array.isArray(data?.data)) {
        return data.data.map((item: any) => ({
          code: item.code,
          name: item.name,
        }));
      }
      return [];
    },
  });
}

export function useUploadTemplateLink() {
  return useQuery({
    queryKey: ["partner-bulk-upload", "template-link"],
    queryFn: async (): Promise<string | null> => {
      const res = await api.get<unknown, any>("/alpha/v1/migration/download/PARTNER_FLOW");
      const data = res?.data ?? res;
      if (data?.status === true && data?.result?.link) {
        return data.result.link;
      }
      return null;
    },
  });
}

export function useBulkUploadList() {
  return useQuery({
    queryKey: ["partner-bulk-upload", "list"],
    queryFn: async (): Promise<BulkUploadRow[]> => {
      const res = await api.get<unknown, any>("/alpha/v1/migration/?processType=PARTNER_FLOW");
      const data = res?.data ?? res;
      if (data?.status && data?.result) {
        return data.result as BulkUploadRow[];
      }
      if (Array.isArray(data?.result)) {
        return data.result as BulkUploadRow[];
      }
      return [];
    },
  });
}

export function useUploadPartnerFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { file: File; journeyType: string }) => {
      const formData = new FormData();
      formData.append("template", payload.file);
      formData.append("journeyType", payload.journeyType);

      const res = await api.post<FormData, any>(
        "/alpha/v1/migration/upload/PARTNER_FLOW",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res?.data ?? res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-bulk-upload", "list"] });
    },
  });
}
