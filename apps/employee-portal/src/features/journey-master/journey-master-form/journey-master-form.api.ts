import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { JourneyTypeDetail } from "./journey-master-form.types";

// Legacy craft-frontend/src/pages/JourneyMaster/AddJourneyType.js
// GET/POST /alpha/v1/master/journey-type
// The save itself now goes through the workflow-runtime's saveStepData (see
// JOURNEY_TYPE_CREATION in workflow-runtime.api.ts) rather than a bespoke
// useSaveJourneyType mutation, and every dropdown's options (Workflow Type,
// User Type, Partner Category, Partner Type, Loan Type) are resolved by the
// server-configured form_builder JSON's `source.api`, not fetched here — this
// file now only supplies the edit-mode detail hook the controller needs.
const JOURNEY_URL = "/alpha/v1/master/journey-type";

export function useJourneyTypeDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["journey-type-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<JourneyTypeDetail | null> => {
      const body = await api.get<unknown, any>(
        `${JOURNEY_URL}?id=${encodeURIComponent(id!)}`
      );
      const arr = body?.data ?? body?.result ?? body;
      const first = Array.isArray(arr) ? (arr[0] as JourneyTypeDetail) : null;
      return first ?? null;
    },
  });
}
