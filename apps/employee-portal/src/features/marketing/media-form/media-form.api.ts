import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  LinkOption,
  LookupItem,
  MediaDetail,
  MediaSavePayload,
} from "./media-form.types";

const MEDIA_URL = "/alpha/v1/marketing/media";
const LINKS_URL = "/alpha/v1/marketing/link";
const LOOKUP_URL =
  "/alpha/v1/lookup?group_code=MEDIA_TYPE,MARKETING_CREATIVE,PLATFORM";

export function useMediaLookups() {
  return useQuery({
    queryKey: ["lookup", "MEDIA_TYPE,MARKETING_CREATIVE,PLATFORM"],
    queryFn: async (): Promise<LookupItem[]> => {
      const body = await api.get<unknown, any>(LOOKUP_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LookupItem[]) : [];
    },
  });
}

export function useLinkOptions() {
  return useQuery({
    queryKey: ["marketing-links-options"],
    queryFn: async (): Promise<LinkOption[]> => {
      const body = await api.get<unknown, any>(LINKS_URL);
      const arr = body?.result ?? body?.data ?? body;
      return Array.isArray(arr) ? (arr as LinkOption[]) : [];
    },
  });
}

export function useMediaDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["marketing-media-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<MediaDetail | null> => {
      const body = await api.get<unknown, any>(
        `${MEDIA_URL}?media_id=${encodeURIComponent(id!)}`
      );
      const arr = body?.result ?? body?.data ?? body;
      const first = Array.isArray(arr) ? (arr[0] as MediaDetail) : null;
      return first ?? null;
    },
  });
}

export function useSaveMedia() {
  return useMutation({
    mutationFn: async (payload: MediaSavePayload) =>
      api.post<unknown, any>(MEDIA_URL, payload),
  });
}
