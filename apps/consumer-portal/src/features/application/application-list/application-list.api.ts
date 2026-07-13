import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ApplicationListResponse,
  ApplicationListResult,
  ApplicationRow,
} from "./application-list.types";

// Auto-scoped to the signed-in customer by the backend — see .types.ts.
const APPLICATION_LIST_URL = "/alpha/v1/application";

/** Server-side page size (losController.List defaults to 10). */
export const PAGE_SIZE = 10;

function buildUrl(p: { page: number }): string {
  return `${APPLICATION_LIST_URL}?page=${p.page}`;
}

export function useApplicationList(params: { page: number }) {
  return useQuery({
    queryKey: ["consumer-application-list", params.page],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<ApplicationListResult> => {
      const body = await api.get<unknown, ApplicationListResponse>(
        buildUrl(params)
      );

      // `data` is null (not []) when the customer has no applications.
      const raw: unknown = body?.data ?? body?.result ?? body;
      const rows: ApplicationRow[] = Array.isArray(raw)
        ? (raw as ApplicationRow[])
        : [];

      return { rows, total: body?.pagination?.total ?? rows.length };
    },
  });
}
