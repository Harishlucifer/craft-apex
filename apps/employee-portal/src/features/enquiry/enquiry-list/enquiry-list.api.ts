import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  ENQUIRY_JOURNEY_TYPE,
  type ApplicationListResponse,
} from "./enquiry-list.types";

// Legacy ApiEndPoint.js: APPLICATION_LIST = /alpha/v1/application
const APPLICATION_LIST_URL = "/alpha/v1/application";

export interface EnquiryListParams {
  page: number;
  journeyType?: string; // default ENQUIRY_APPLICATION
}

function buildUrl({ page, journeyType }: EnquiryListParams): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("journey_type", journeyType ?? ENQUIRY_JOURNEY_TYPE);
  return `${APPLICATION_LIST_URL}?${params.toString()}`;
}

export function useEnquiryList(params: EnquiryListParams) {
  return useQuery({
    queryKey: ["enquiry-list", params.page, params.journeyType ?? ENQUIRY_JOURNEY_TYPE],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<ApplicationListResponse> =>
      api.get<unknown, ApplicationListResponse>(buildUrl(params)),
  });
}
