import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { TemplateDetail, TemplateRow } from "./template-list.types";

const URL_TEMPLATE = "/alpha/v1/excel-upload/template";
const URL_TEMPLATE_SUBMIT = "/alpha/v1/excel-upload/template/submit";
const URL_TEMPLATE_APPROVE = "/alpha/v1/excel-upload/template/approve";
const URL_TEMPLATE_REJECT = "/alpha/v1/excel-upload/template/reject";

function unwrap<T>(body: unknown, fallback: T): T {
  const inner = (body as { result?: T; data?: T })?.result
    ?? (body as { result?: T; data?: T })?.data;
  return inner !== undefined ? inner : fallback;
}

export function useTemplateList(status?: string) {
  return useQuery({
    queryKey: ["excel-upload", "templates", status ?? "all"],
    queryFn: async (): Promise<TemplateRow[]> => {
      const qs = status ? `?status=${encodeURIComponent(status)}` : "";
      const body = await api.get<unknown, unknown>(`${URL_TEMPLATE}${qs}`);
      return unwrap<TemplateRow[]>(body, []);
    },
  });
}

export function useTemplateDetail(id?: string) {
  return useQuery({
    queryKey: ["excel-upload", "template", id],
    queryFn: async (): Promise<TemplateDetail | null> => {
      const body = await api.get<unknown, unknown>(`${URL_TEMPLATE}/${id}`);
      return unwrap<TemplateDetail | null>(body, null);
    },
    enabled: Boolean(id),
  });
}

function useInvalidateTemplates() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["excel-upload", "templates"] });
}

export function useSubmitTemplate() {
  const invalidate = useInvalidateTemplates();
  return useMutation({
    mutationFn: async (id: string) => api.post<unknown, unknown>(URL_TEMPLATE_SUBMIT, { id }),
    onSuccess: invalidate,
  });
}

export function useApproveTemplate() {
  const invalidate = useInvalidateTemplates();
  return useMutation({
    mutationFn: async (id: string) => api.post<unknown, unknown>(URL_TEMPLATE_APPROVE, { id }),
    onSuccess: invalidate,
  });
}

export function useRejectTemplate() {
  const invalidate = useInvalidateTemplates();
  return useMutation({
    mutationFn: async (payload: { id: string; reject_reason: string }) =>
      api.post<unknown, unknown>(URL_TEMPLATE_REJECT, payload),
    onSuccess: invalidate,
  });
}
