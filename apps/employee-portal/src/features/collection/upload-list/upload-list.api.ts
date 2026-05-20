import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CollectionUploadRow } from "./upload-list.types";

// Legacy: GetCall(APIENDPOINTS.GET_UPLOADED_COLLECTION_LIST) -> res.data.data
const URL = "/alpha/v1/collection/upload";

export function useCollectionUploadList() {
  return useQuery({
    queryKey: ["collection-upload-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<CollectionUploadRow[]> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as CollectionUploadRow[]) : [];
    },
  });
}
