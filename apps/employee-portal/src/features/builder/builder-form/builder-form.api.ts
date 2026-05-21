import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  BuilderDetail,
  BuilderSavePayload,
  ChannelOption,
  LookupItem,
  PincodeDetail,
  PincodeSuggestion,
} from "./builder-form.types";

const DEVELOPER_URL = "/alpha/v1/master/developer";
const PINCODE_URL = "/alpha/v1/master/pin-code";
const CHANNEL_URL = "/alpha/v1/channel";
// Legacy partnerRegistrationStatus.Approved = "3"
const APPROVED_CHANNEL_STATUS = "3";
const LOOKUP_URL =
  "/alpha/v1/lookup?group_code=BINARY_CHOICE,COMPANY_TYPE";

export function useBuilderLookups() {
  return useQuery({
    queryKey: ["lookup", "BINARY_CHOICE,COMPANY_TYPE"],
    queryFn: async (): Promise<LookupItem[]> => {
      const body = await api.get<unknown, any>(LOOKUP_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LookupItem[]) : [];
    },
  });
}

export function useApprovedChannels() {
  return useQuery({
    queryKey: ["channel-list", "approved"],
    queryFn: async (): Promise<ChannelOption[]> => {
      const body = await api.get<unknown, any>(
        `${CHANNEL_URL}?status=${APPROVED_CHANNEL_STATUS}`
      );
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as ChannelOption[]) : [];
    },
  });
}

export function useBuilderDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["developer-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<BuilderDetail | null> => {
      const body = await api.get<unknown, any>(
        `${DEVELOPER_URL}/${encodeURIComponent(id!)}`
      );
      const data = body?.data ?? body?.result ?? body;
      return (data ?? null) as BuilderDetail | null;
    },
  });
}

// Legacy: /pin-code/suggest?pincode=X
export async function fetchPincodeSuggestions(
  prefix: string
): Promise<PincodeSuggestion[]> {
  if (!prefix) return [];
  const body = await api.get<unknown, any>(
    `${PINCODE_URL}/suggest?pincode=${encodeURIComponent(prefix)}`
  );
  const arr = body?.data ?? body?.result ?? body;
  return Array.isArray(arr) ? (arr as PincodeSuggestion[]) : [];
}

// Legacy: /pin-code?pincode=X -> areas with state/district
export async function fetchPincodeDetails(
  pincode: string
): Promise<PincodeDetail[]> {
  if (!pincode) return [];
  const body = await api.get<unknown, any>(
    `${PINCODE_URL}?pincode=${encodeURIComponent(pincode)}`
  );
  const arr = body?.data ?? body?.result ?? body;
  return Array.isArray(arr) ? (arr as PincodeDetail[]) : [];
}

export function useSaveBuilder() {
  return useMutation({
    mutationFn: async (payload: BuilderSavePayload) =>
      api.post<unknown, any>(DEVELOPER_URL, payload),
  });
}
