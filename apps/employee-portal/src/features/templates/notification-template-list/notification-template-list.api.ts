import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { TemplateRow } from "./notification-template-list.types";

// Legacy: GetCall(APIENDPOINTS.NOTIFICATION_TEMPLATE) -> response.data.result
const URL = "/alpha/v1/notification/template";

export function useNotificationTemplateList() {
  return useQuery({
    queryKey: ["notification-template-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<TemplateRow[]> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.result ?? body?.data ?? body;
      return Array.isArray(arr) ? (arr as TemplateRow[]) : [];
    },
  });
}
