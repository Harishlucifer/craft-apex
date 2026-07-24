import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ActiveTemplateOption, UploadBatchResult } from "./upload.types";

const URL_TEMPLATE = "/alpha/v1/excel-upload/template";
const URL_BATCH = "/alpha/v1/excel-upload/batch";

function unwrap<T>(body: unknown, fallback: T): T {
  const inner = (body as { result?: T; data?: T })?.result
    ?? (body as { result?: T; data?: T })?.data;
  return inner !== undefined ? inner : fallback;
}

export function useActiveTemplates() {
  return useQuery({
    queryKey: ["excel-upload", "templates", "active"],
    queryFn: async (): Promise<ActiveTemplateOption[]> => {
      const body = await api.get<unknown, unknown>(`${URL_TEMPLATE}?status=ACTIVE`);
      return unwrap<ActiveTemplateOption[]>(body, []);
    },
  });
}

export function useUploadBatch() {
  return useMutation({
    mutationFn: async (payload: { templateId: string; file: File; batchUuid: string }) => {
      const formData = new FormData();
      formData.append("template_id", payload.templateId);
      formData.append("file", payload.file);
      formData.append("batch_uuid", payload.batchUuid);

      const body = await api.post<FormData, unknown>(URL_BATCH, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return unwrap<UploadBatchResult>(body, { id: "", batch_uuid: "", status: "" });
    },
  });
}
