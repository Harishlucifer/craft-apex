import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  FormDefinitionResponse,
  TemplateSavePayload,
} from "./template-form.types";

const URL_FORM_DEFINITION = "/alpha/v1/excel-upload/form-definition";
const URL_TEMPLATE = "/alpha/v1/excel-upload/template";

function unwrap<T>(body: unknown, fallback: T): T {
  const inner = (body as { result?: T; data?: T })?.result
    ?? (body as { result?: T; data?: T })?.data;
  return inner !== undefined ? inner : fallback;
}

export function useFormDefinition(entityType = "PARTNER_PROFILE") {
  return useQuery({
    queryKey: ["excel-upload", "form-definition", entityType],
    queryFn: async (): Promise<FormDefinitionResponse> => {
      const body = await api.get<unknown, unknown>(
        `${URL_FORM_DEFINITION}?entity_type=${encodeURIComponent(entityType)}`
      );
      return unwrap<FormDefinitionResponse>(body, { entity_type: entityType, fields: [] });
    },
  });
}

export function useSaveTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TemplateSavePayload) => {
      const body = await api.post<unknown, unknown>(URL_TEMPLATE, payload);
      return unwrap<{ id: string; version: number; status: string }>(body, {
        id: "",
        version: 1,
        status: "DRAFT",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["excel-upload", "templates"] });
    },
  });
}
