import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const GET_APPLIED_LENDER_URL = "/alpha/v1/application/:applicationId/lender-applied-list";

export function useLenderAppliedList(id: string | undefined, lenderCode: string | null) {
  return useQuery({
    queryKey: ["lender-applied-list", id ?? "", lenderCode ?? ""],
    enabled: Boolean(id),
    queryFn: async () => {
      // The @craft-apex/api interceptor unwraps AxiosResponse, returning the JSON body directly.
      // We pass <unknown, any> to bypass TS's default AxiosResponse expectation.
      const body = await api.get<unknown, any>(
        GET_APPLIED_LENDER_URL.replace(":applicationId", encodeURIComponent(id!))
      );

      console.log("Lender Applied List Raw API Response:", body);

      // Extract the array depending on how the backend wraps it
      const r = body?.result ?? body?.data?.result ?? body?.data ?? body;
      const lenderList = Array.isArray(r) ? r : [];

      console.log("Parsed Lender List Array:", lenderList);

      // If lenderCode is provided in URL, filter by it. Otherwise, default to the first lender in the list.
      const targetLender = lenderCode
        ? lenderList.find((item: any) => item?.lender?.lender_code === lenderCode)
        : lenderList[0];

      if (targetLender) {
        const mappedData = {
          lender_apply_id: targetLender.lender_apply_id,
          journey_type: targetLender.journey_type,
          application_id: targetLender.application_id,
          application_code: targetLender.application_code,
          lender_crm_id: targetLender.lender_crm_id,
          lender_los_id: targetLender.lender_los_id,
          lender_scheme_id: targetLender.lender_scheme_id,
          loan_account_no: targetLender.loan_account_no,
          apply_status: targetLender.apply_status,
          status: targetLender.status,
          updated_date: targetLender.updated_date,
          user: targetLender.user,
          lender: {
            lender_id: targetLender.lender?.lender_id,
            lender_name: targetLender.lender?.lender_name,
            lender_code: targetLender.lender?.lender_code,
            lender_logo: targetLender.lender?.lender_logo
          },
          recent_offer: targetLender.recent_offer
        };
        console.log("Successfully mapped lenderDataToSet:", mappedData);
        return mappedData;
      }

      console.warn("Could not find a target lender. Lender list was:", lenderList, "Search lenderCode:", lenderCode);
      return null;
    }
  });
}
