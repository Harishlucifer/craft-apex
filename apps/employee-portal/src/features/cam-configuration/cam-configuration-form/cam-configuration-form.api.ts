import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CamConfigDetail } from "./cam-configuration-form.types";

// Legacy craft-frontend/src/pages/Configuration/CamConfiguration/AddCamConfiguration.js
// GET/POST /alpha/v1/master/cam-configuration[/:id]
// The save itself now goes through the workflow-runtime's saveStepData (see
// CAM_CONFIGURATION_CREATION in workflow-runtime.api.ts) rather than a
// bespoke useSaveCamConfig mutation, and every dropdown's options (Type,
// Product Code, Applicable To, Apply Capacity, Apply For, Rule, Loan Type,
// Template) are resolved by the server-configured form_builder JSON's
// `source.api`, not fetched here — this file now only supplies the edit-mode
// detail hook the controller needs for its defaults.
const SAVE_URL = "/alpha/v1/master/cam-configuration";

export function useCamConfigDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["cam-config-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<CamConfigDetail | null> => {
      const body = await api.get<unknown, any>(`${SAVE_URL}/${id}`);
      return body?.result ?? null;
    },
  });
}
