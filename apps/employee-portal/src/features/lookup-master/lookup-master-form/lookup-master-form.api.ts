import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LookupSavePayload } from "./lookup-master-form.types";

// Legacy: PostCall(APIENDPOINTS.CREATE_LOOKUP, payload)
const URL = "/alpha/v1/lookup/create";

export function useSaveLookup() {
  return useMutation({
    mutationFn: async (payload: LookupSavePayload) =>
      api.post<unknown, unknown>(URL, payload),
  });
}
