import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  LenderMaster,
  LenderMasterResponse,
  LoanTypeMaster,
  LoanTypeMasterResponse,
} from "./receivable-invoice.types";

// Legacy endpoints — verbatim from craft-frontend/src/Components/helper/ApiEndPoint.js
//   LENDER_GET:       /alpha/v1/master/lender
//   LOAN_TYPE_MASTER: /alpha/v1/master/loan-type
const URL_LENDER = "/alpha/v1/master/lender";
const URL_LOAN_TYPE = "/alpha/v1/master/loan-type";

// Legacy fetchOptions:
//   const lenderResponse = await GetCall(APIENDPOINTS.LENDER_GET);
//   const lenders = lenderResponse.data.result;
export function useLenderMaster() {
  return useQuery({
    queryKey: ["receivable-invoice.lender-master"],
    queryFn: async (): Promise<LenderMaster[]> => {
      const body = await api.get<unknown, LenderMasterResponse>(URL_LENDER);
      return body?.data?.result ?? [];
    },
  });
}

// Legacy fetchOptions:
//   const loanTypeRes = await GetCall(APIENDPOINTS.LOAN_TYPE_MASTER);
//   const loanTypes = loanTypeRes.data.data;
export function useLoanTypeMaster() {
  return useQuery({
    queryKey: ["receivable-invoice.loan-type-master"],
    queryFn: async (): Promise<LoanTypeMaster[]> => {
      const body = await api.get<unknown, LoanTypeMasterResponse>(URL_LOAN_TYPE);
      return body?.data?.data ?? [];
    },
  });
}

// DEFERRED: list-fetch hook for the lender invoice rows.
// The legacy `LenderInvoice` component renders the table with `data={[]}` and
// every column accessor returns an empty fragment. `handleSubmit` calls
// `GetCall(APIENDPOINTS)` — passing the whole endpoint object — which is a
// clear placeholder/bug, not a real endpoint. Per the no-guessing rule, we do
// NOT invent a list URL here. Add a `useReceivableInvoiceList` hook once the
// real endpoint is verified.

// DEFERRED: "Generate Invoice" submit. Legacy form validates lender_id /
// loan_type_id / month then calls `GetCall(APIENDPOINTS)` — no verifiable
// target. Wire this up once the endpoint is confirmed.
