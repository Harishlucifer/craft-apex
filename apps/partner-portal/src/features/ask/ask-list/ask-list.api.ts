/**
 * Legacy: channel-flexi/src/Components/Common/AskList.js (getAskList)
 * Replaces: GET /alpha/v1/application/ask/list?page=N&{keyword,…filters}
 * Backend:  alpha-api/app/routes/v1.go:213 -> askController.AskList
 */
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  AskListBody,
  AskListParams,
  AskListResult,
  AskRow,
} from "./ask-list.types";

const URL_ASK_LIST = "/alpha/v1/application/ask/list";

function buildUrl(params: AskListParams): string {
  const qs = new URLSearchParams({ page: String(params.page) });
  if (params.keyword) qs.set("keyword", params.keyword);
  return `${URL_ASK_LIST}?${qs.toString()}`;
}

function unwrap(body: AskListBody | null): AskListResult {
  const arr = body?.data ?? body?.result ?? body;
  const rows: AskRow[] = Array.isArray(arr) ? arr : [];
  return { data: rows, total: body?.pagination?.total ?? 0 };
}

export function useAskList(params: AskListParams) {
  return useQuery({
    queryKey: ["ask-list", params],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<AskListResult> =>
      unwrap(await api.get<unknown, AskListBody>(buildUrl(params))),
  });
}
